<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use Illuminate\Support\Facades\Auth;

class StudentStatusController extends Controller
{
    /**
     * Update the student's status
     */
    public function updateStatus(Request $request)
    {
        // Get the authenticated student
        $student = Auth::guard('student')->user();
        
        if (!$student) {
            return redirect()->route('login')->with('error', 'Please log in to update your status.');
        }
        
        // Validate the request
        $validationRules = [
            'status' => 'required|in:in,on_leave',
            'leave_reason' => 'nullable|string|max:1000',
        ];
        
        // Make leave_reason required when status is 'on_leave'
        if ($request->status === 'on_leave') {
            $validationRules['leave_reason'] = 'required|string|max:1000';
        }
        
        $request->validate($validationRules);
        
        // Sanitize input to prevent XSS
        $leaveReason = $request->leave_reason ? strip_tags(trim($request->leave_reason)) : null;
        
        // Update the student's status
        $updateData = [
            'status' => $request->status,
            'status_updated_at' => now(),
        ];
        
        // Handle leave reason
        if ($request->status === 'on_leave') {
            $updateData['leave_reason'] = $leaveReason;
        } else {
            // Clear leave reason when returning to 'in' status
            $updateData['leave_reason'] = null;
        }
        
        $student->update($updateData);
        
        $statusText = $request->status === 'in' ? 'In' : 'On Leave';
        return redirect()->route('student.dashboard')
            ->with('success', "Status updated successfully to: {$statusText}");
    }
}
