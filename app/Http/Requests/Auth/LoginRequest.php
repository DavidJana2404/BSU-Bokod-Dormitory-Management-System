<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use App\Models\Student;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        // First, try to authenticate as a regular user (admin/manager)
        if (Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            $user = Auth::user();
            
            // Check if user has role and is_active fields (for admin/manager users)
            if ($user && isset($user->role) && $user->role !== 'admin' && isset($user->is_active) && !$user->is_active) {
                Auth::logout();
                throw ValidationException::withMessages([
                    'email' => 'Your account is inactive. Please contact the administrator.',
                ]);
            }
            
            // Ensure no student guard is authenticated
            if (Auth::guard('student')->check()) {
                Auth::guard('student')->logout();
            }
            
            // Set user type and role for routing
            session(['user_type' => 'user', 'user_role' => $user->role]);
            RateLimiter::clear($this->throttleKey());
            return;
        }

        // If user authentication failed, try student authentication
        // First check if a student exists and can authenticate
        $student = Student::where('email', $this->string('email'))->first();
        
        if ($student && $student->canAuthenticate()) {
            // Check if the student is archived
            if ($student->isArchived()) {
                RateLimiter::hit($this->throttleKey());
                throw ValidationException::withMessages([
                    'email' => 'Your student account has been archived and cannot be used to log in. Please contact the dormitory administration for assistance.',
                ]);
            }
            
            if (Auth::guard('student')->attempt($this->only('email', 'password'), $this->boolean('remember'))) {
                // Ensure no web guard is authenticated
                if (Auth::guard('web')->check()) {
                    Auth::guard('web')->logout();
                }
                
                // Student authentication successful; keep them in the student guard only
                // Set session flag to indicate this is a student user
                session(['user_type' => 'student']);
                RateLimiter::clear($this->throttleKey());
                return;
            }
        } elseif ($student && !$student->canAuthenticate()) {
            // Check if the student is archived first
            if ($student->isArchived()) {
                RateLimiter::hit($this->throttleKey());
                throw ValidationException::withMessages([
                    'email' => 'Your student account has been archived and cannot be used to log in. Please contact the dormitory administration for assistance.',
                ]);
            }
            
            // Student exists but has no password set
            RateLimiter::hit($this->throttleKey());
            
            // Check if this is a student that needs initial password setup
            if ($student->needsPasswordSetup()) {
                throw ValidationException::withMessages([
                    'email' => 'Your student account needs a password to be set up. Please use the "Set Up Student Password" link below to create your password first.',
                    'needs_password_setup' => true,
                    'student_email' => $student->email
                ]);
            } else {
                throw ValidationException::withMessages([
                    'email' => 'Your student account does not have a password set. Please contact the dormitory administration to set up your account.',
                ]);
            }
        }

        // Both authentications failed
        RateLimiter::hit($this->throttleKey());
        throw ValidationException::withMessages([
            'email' => __('auth.failed'),
        ]);
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return $this->string('email')
            ->lower()
            ->append('|'.$this->ip())
            ->transliterate()
            ->value();
    }
}
