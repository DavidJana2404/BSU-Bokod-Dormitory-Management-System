<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        // Check for session conflicts between guards
        if ($user && auth()->guard('student')->check()) {
            // Both guards are authenticated - this should not happen
            \Log::warning('Multiple guard authentication conflict detected', [
                'web_user_id' => $user->id,
                'student_user_id' => auth()->guard('student')->id(),
                'url' => $request->url()
            ]);
            // Logout from student guard to prevent conflicts
            auth()->guard('student')->logout();
        }
        
        // If user is authenticated but doesn't have a role, redirect to login
        if ($user && !isset($user->role)) {
            \Log::warning('Authenticated user without role attempting access', [
                'user_id' => $user->id,
                'email' => $user->email,
                'url' => $request->url()
            ]);
            auth()->logout();
            $request->session()->forget(['user_type', 'user_role']);
            return redirect()->route('login')->with('error', 'Invalid user account. Please contact administrator.');
        }
        
        // If user has a role, ensure session is properly set
        if ($user && isset($user->role)) {
            // Ensure session has correct user type and role
            if (session('user_type') !== 'user' || session('user_role') !== $user->role) {
                session([
                    'user_type' => 'user',
                    'user_role' => $user->role
                ]);
            }
            
            // Ensure no conflicting student session exists
            if (auth()->guard('student')->check()) {
                auth()->guard('student')->logout();
            }
        }
        
        return $next($request);
    }
}
