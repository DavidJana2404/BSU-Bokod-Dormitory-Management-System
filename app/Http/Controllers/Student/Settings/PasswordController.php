<?php

namespace App\Http\Controllers\Student\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * Show the student's password settings page.
     */
    public function edit(): Response
    {
        $student = Auth::guard('student')->user();
        
        if (!$student) {
            return redirect()->route('login');
        }
        
        $studentData = [
            'student_id' => $student->student_id ?? $student->id,
            'first_name' => $student->first_name ?? $student->name ?? 'Student',
            'last_name' => $student->last_name ?? '',
            'email' => $student->email,
        ];
        
        return Inertia::render('student/settings/password', [
            'student' => $studentData,
            'auth' => ['student' => $studentData]
        ]);
    }

    /**
     * Update the student's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $student = Auth::guard('student')->user();
        
        if (!$student) {
            return redirect()->route('login');
        }

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        // Verify the current password
        if (!Hash::check($validated['current_password'], $student->password)) {
            return back()->withErrors(['current_password' => 'The current password is incorrect.']);
        }

        $student->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('status', 'password-updated');
    }
}