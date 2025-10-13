<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\RegistrationSettings;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        // Check if this is the first user in the system (always allow first user)
        $isFirstUser = User::count() === 0;
        
        if (!$isFirstUser) {
            // Check if registration is enabled (cache-based with fallback)
            $registrationEnabled = cache('registration_enabled', true); // default enabled
            
            if (!$registrationEnabled) {
                return redirect()->route('login')->with('error', 'Account registration is currently disabled. Please contact an administrator.');
            }
        }
        
        return Inertia::render('auth/register', [
            'isFirstUser' => $isFirstUser,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // Check if this is the first user in the system
        $isFirstUser = User::count() === 0;
        
        $validationRules = [
            'name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s\-\']+$/'],
            'email' => ['required', 'string', 'lowercase', 'email:rfc,dns', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ];
        
        $validationMessages = [
            'name.regex' => 'The name may only contain letters, spaces, hyphens, and apostrophes.',
            'email.email' => 'The email must be a valid email address.',
        ];
        
        // No role selection needed - default to manager for non-first users
        
        $request->validate($validationRules, $validationMessages);
        
        $role = $isFirstUser ? 'admin' : 'manager';
        
        // Simple registration check - already done in create method, but double-check here
        if (!$isFirstUser) {
            $registrationEnabled = cache('registration_enabled', true); // default enabled
            if (!$registrationEnabled) {
                return redirect()->back()->withErrors(['general' => 'Registration is currently disabled.'])->withInput();
            }
        }
        
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $role,
        ]);
        
        // Log the user creation for admin tracking
        if ($isFirstUser) {
            Log::info('First user registered and automatically promoted to admin', [
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role
            ]);
        } else {
            Log::info('New user registered', [
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role
            ]);
        }

        event(new Registered($user));

        Auth::login($user);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
