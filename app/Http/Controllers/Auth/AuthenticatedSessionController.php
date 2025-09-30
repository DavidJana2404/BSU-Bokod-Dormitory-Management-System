<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Clear any existing session data before authentication to prevent role confusion
        $request->session()->forget(['user_type', 'user_role']);
        
        $request->authenticate();
        $request->session()->regenerate();

        // Check if this is a student user and redirect appropriately
        if (session('user_type') === 'student') {
            // Ensure no regular user is authenticated in the web guard
            if (Auth::guard('web')->check()) {
                Auth::guard('web')->logout();
            }
            return redirect()->intended(route('student.dashboard', absolute: false));
        }

        // For admin/manager/cashier users, check their role and redirect accordingly
        $user = Auth::user();
        if ($user && isset($user->role)) {
            // Ensure no student is authenticated in the student guard
            if (Auth::guard('student')->check()) {
                Auth::guard('student')->logout();
            }
            
            // Store the user role in session for consistent access
            session([
                'user_type' => 'user',
                'user_role' => $user->role
            ]);
            
            // Redirect based on specific role
            switch ($user->role) {
                case 'cashier':
                    return redirect()->intended(route('cashier.dashboard', absolute: false));
                case 'admin':
                case 'manager':
                    return redirect()->intended(route('dashboard', absolute: false));
                default:
                    return redirect()->intended(route('dashboard', absolute: false));
            }
        }

        // Fallback redirection
        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Get the current session data before clearing
        $userType = session('user_type');
        
        // Clear all session data related to user authentication
        $request->session()->forget(['user_type', 'user_role']);
        
        // Logout from the appropriate guard based on user type
        if ($userType === 'student') {
            Auth::guard('student')->logout();
        } else {
            Auth::guard('web')->logout();
        }
        
        // Also ensure both guards are logged out to prevent any conflicts
        if (Auth::guard('web')->check()) {
            Auth::guard('web')->logout();
        }
        if (Auth::guard('student')->check()) {
            Auth::guard('student')->logout();
        }

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
