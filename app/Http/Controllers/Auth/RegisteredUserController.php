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
            // Check if registration is enabled with fallback to true if error
            try {
                $managerEnabled = RegistrationSettings::isManagerRegistrationEnabled();
                $cashierEnabled = RegistrationSettings::isCashierRegistrationEnabled();
                
                // If both are disabled, redirect with error
                if (!$managerEnabled && !$cashierEnabled) {
                    return redirect()->route('login')->with('error', 'Account registration is currently disabled. Please contact an administrator.');
                }
            } catch (\Exception $e) {
                // If there's an error loading settings, default to allowing registration
                Log::warning('Failed to check registration settings: ' . $e->getMessage());
                $managerEnabled = true;
                $cashierEnabled = true;
            }
        } else {
            // First user, allow everything
            $managerEnabled = true;
            $cashierEnabled = true;
        }
        
        return Inertia::render('auth/register', [
            'isFirstUser' => $isFirstUser,
            'managerRegistrationEnabled' => $managerEnabled,
            'cashierRegistrationEnabled' => $cashierEnabled,
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
        
        // Only require role selection if not first user
        if (!$isFirstUser) {
            $validationRules['role'] = ['required', 'in:manager,cashier'];
            $validationMessages['role.required'] = 'Please select a role.';
            $validationMessages['role.in'] = 'Invalid role selected.';
        }
        
        $request->validate($validationRules, $validationMessages);
        
        $role = $isFirstUser ? 'admin' : $request->role;
        
        // If not first user, check if the selected role registration is enabled
        if (!$isFirstUser) {
            try {
                if ($role === 'manager' && !RegistrationSettings::isManagerRegistrationEnabled()) {
                    return redirect()->back()->withErrors(['role' => 'Manager registration is currently disabled.'])->withInput();
                }
                
                if ($role === 'cashier' && !RegistrationSettings::isCashierRegistrationEnabled()) {
                    return redirect()->back()->withErrors(['role' => 'Cashier registration is currently disabled.'])->withInput();
                }
            } catch (\Exception $e) {
                // If there's an error checking settings, log it but allow registration to proceed
                Log::warning('Failed to check registration settings during user creation: ' . $e->getMessage());
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
