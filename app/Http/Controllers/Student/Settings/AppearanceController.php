<?php

namespace App\Http\Controllers\Student\Settings;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AppearanceController extends Controller
{
    /**
     * Show the student's appearance settings page.
     */
    public function edit(): Response
    {
        $student = \Illuminate\Support\Facades\Auth::guard('student')->user();
        
        if (!$student) {
            return redirect()->route('login');
        }
        
        $studentData = [
            'student_id' => $student->student_id ?? $student->id,
            'first_name' => $student->first_name ?? $student->name ?? 'Student',
            'last_name' => $student->last_name ?? '',
            'email' => $student->email,
        ];
        
        return Inertia::render('student/settings/appearance', [
            'student' => $studentData,
            'auth' => ['student' => $studentData]
        ]);
    }
}