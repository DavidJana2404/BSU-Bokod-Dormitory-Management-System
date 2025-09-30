<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class InitialPasswordController extends Controller
{
    /**
     * Show the initial password setup form for students without passwords
     */
    public function create(Request $request): Response
    {
        // This route should only be accessible to students who need to set their password
        return Inertia::render('student/auth/setup-password', [
            'email' => $request->input('email', ''),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle setting up the initial password for a student
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email', 'exists:students,email'],
            'student_id' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        // Find the student by email and student_id
        $student = Student::where('email', $request->email)
                         ->where('student_id', $request->student_id)
                         ->first();

        if (!$student) {
            throw ValidationException::withMessages([
                'email' => 'Invalid student credentials. Please check your email and student ID.',
            ]);
        }

        // Check if the student is archived
        if ($student->isArchived()) {
            throw ValidationException::withMessages([
                'email' => 'This student account has been archived and cannot set up a password. Please contact the dormitory administration for assistance.',
            ]);
        }
        
        // Check if student already has a password
        if (!$student->needsPasswordSetup()) {
            throw ValidationException::withMessages([
                'email' => 'This student account already has a password set up. Please use the regular login form.',
            ]);
        }

        // Set the password
        $student->update([
            'password' => Hash::make($request->password),
        ]);

        return redirect()->route('login')
            ->with('status', 'Password set successfully! You can now log in with your credentials.');
    }

    /**
     * API endpoint to check if a student needs password setup
     */
    public function checkStudent(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'student_id' => ['required', 'string'],
        ]);

        $student = Student::where('email', $request->email)
                         ->where('student_id', $request->student_id)
                         ->first();

        if (!$student) {
            return response()->json([
                'valid' => false,
                'message' => 'Student not found. Please check your email and student ID.'
            ], 404);
        }

        if ($student->isArchived()) {
            return response()->json([
                'valid' => false,
                'message' => 'This student account has been archived and cannot set up a password. Please contact the dormitory administration for assistance.'
            ], 400);
        }
        
        if (!$student->needsPasswordSetup()) {
            return response()->json([
                'valid' => false,
                'message' => 'This account already has a password. Please use the regular login form.'
            ], 400);
        }

        return response()->json([
            'valid' => true,
            'student' => [
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'email' => $student->email,
            ]
        ]);
    }
}
