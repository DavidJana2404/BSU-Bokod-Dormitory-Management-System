<?php

use Illuminate\Support\Facades\Route;
use App\Models\Student;

// Debug route to test student show functionality
Route::get('/debug/student/{id}', function($id) {
    try {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['error' => 'Not authenticated']);
        }
        
        // Try to load the student
        $student = Student::where('student_id', $id)
            ->where('tenant_id', $user->tenant_id)
            ->whereNull('archived_at')
            ->first();
        
        if (!$student) {
            return response()->json(['error' => 'Student not found']);
        }
        
        // Test each relationship
        $result = [
            'student_found' => true,
            'student_id' => $student->student_id,
            'name' => $student->first_name . ' ' . $student->last_name,
        ];
        
        // Test bookings relationship
        try {
            $booking = $student->bookings()->whereNull('archived_at')->first();
            $result['booking_test'] = 'SUCCESS';
            $result['has_booking'] = $booking ? true : false;
        } catch (\Exception $e) {
            $result['booking_test'] = 'FAILED: ' . $e->getMessage();
        }
        
        // Test statusHistory relationship
        try {
            $history = $student->statusHistory()->limit(1)->get();
            $result['status_history_test'] = 'SUCCESS';
            $result['has_status_history'] = $history->count() > 0;
        } catch (\Exception $e) {
            $result['status_history_test'] = 'FAILED: ' . $e->getMessage();
        }
        
        return response()->json($result);
        
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
})->middleware(['auth', 'verified']);
