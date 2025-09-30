<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStudentGuard
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $student = auth()->guard('student')->user();
        
        // Check for session conflicts between guards
        if ($student && auth()->guard('web')->check()) {
            // Both guards are authenticated - this should not happen
            \Log::warning('Multiple guard authentication conflict detected (student perspective)', [
                'student_user_id' => $student->student_id,
                'web_user_id' => auth()->guard('web')->id(),
                'url' => $request->url()
            ]);
            // Logout from web guard to prevent conflicts
            auth()->guard('web')->logout();
            // Clear conflicting session data
            $request->session()->forget(['user_type', 'user_role']);
        }
        
        // Ensure student session is properly set
        if ($student) {
            // Check if the student is archived and force logout if so
            if ($student->isArchived()) {
                \Log::info('Archived student attempted to access protected route', [
                    'student_id' => $student->student_id,
                    'email' => $student->email,
                    'url' => $request->url()
                ]);
                
                // Logout the archived student
                auth()->guard('student')->logout();
                $request->session()->forget(['user_type', 'user_role']);
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                
                // Redirect to login with error message
                return redirect()->route('login')->withErrors([
                    'email' => 'Your student account has been archived and you have been logged out. Please contact the dormitory administration for assistance.'
                ]);
            }
            
            // Ensure session has correct user type
            if (session('user_type') !== 'student') {
                session(['user_type' => 'student']);
                // Remove any conflicting user role data
                $request->session()->forget('user_role');
            }
            
            // Ensure no conflicting web session exists
            if (auth()->guard('web')->check()) {
                auth()->guard('web')->logout();
            }
        }
        
        return $next($request);
    }
}