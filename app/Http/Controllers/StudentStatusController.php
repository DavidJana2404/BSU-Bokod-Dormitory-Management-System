<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\DormitorianStatusHistory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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
        
        try {
            // Create dormitorian status history record (self-update, changed_by is NULL)
            DormitorianStatusHistory::create([
                'student_id' => $student->student_id,
                'status' => $request->status,
                'effective_date' => now()->toDateString(),
                'end_date' => null, // Self-updates don't specify end date
                'reason' => $leaveReason,
                'changed_by' => null, // NULL indicates self-update by dormitorian
            ]);
            
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
            
            Log::info('Dormitorian status self-updated', [
                'student_id' => $student->student_id,
                'new_status' => $request->status,
            ]);
            
            $statusText = $request->status === 'in' ? 'In' : 'On Leave';
            return redirect()->route('student.dashboard')
                ->with('success', "Status updated successfully to: {$statusText}");
                
        } catch (\Exception $e) {
            Log::error('Failed to update dormitorian status (self-update)', [
                'error' => $e->getMessage(),
                'student_id' => $student->student_id,
            ]);
            
            return redirect()->route('student.dashboard')
                ->with('error', 'Failed to update status. Please try again.');
        }
    }
    
    /**
     * Manager updates a dormitorian's status with date and reason
     */
    public function managerUpdateStatus(Request $request, $id)
    {
        $manager = Auth::user();
        
        // Verify manager has permissions
        if (!in_array($manager->role, ['admin', 'manager'])) {
            return back()->with('error', 'Unauthorized action.');
        }
        
        $student = Student::with('tenant')->findOrFail($id);
        
        // Managers can only update students in their tenant
        if ($manager->role === 'manager' && $student->tenant_id !== $manager->tenant_id) {
            return back()->with('error', 'Unauthorized to update this student.');
        }
        
        // Validation rules
        $validationRules = [
            'status' => 'required|in:in,on_leave',
            'effective_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:effective_date',
            'reason' => 'nullable|string|max:1000',
        ];
        
        // Make reason required for leave
        if ($request->status === 'on_leave') {
            $validationRules['reason'] = 'required|string|max:1000';
            $validationRules['end_date'] = 'required|date|after_or_equal:effective_date';
        }
        
        $validated = $request->validate($validationRules);
        
        try {
            // Create dormitorian status history record
            $statusHistory = DormitorianStatusHistory::create([
                'student_id' => $student->student_id,
                'status' => $validated['status'],
                'effective_date' => $validated['effective_date'],
                'end_date' => $validated['end_date'] ?? null,
                'reason' => $validated['reason'] ?? null,
                'changed_by' => $manager->id,
            ]);
            
            // Update student's current status if effective immediately
            $today = now()->toDateString();
            if ($validated['effective_date'] <= $today) {
                $student->update([
                    'status' => $validated['status'], // 'in' or 'on_leave'
                    'leave_reason' => $validated['reason'] ?? null,
                    'status_updated_at' => now(),
                ]);
            }
            
            Log::info('Dormitorian status updated by manager', [
                'student_id' => $student->student_id,
                'manager_id' => $manager->id,
                'new_status' => $validated['status'],
                'effective_date' => $validated['effective_date'],
            ]);
            
            return redirect()->back()->with('success', 'Dormitorian status updated successfully.');
            
        } catch (\Exception $e) {
            Log::error('Failed to update dormitorian status', [
                'error' => $e->getMessage(),
                'student_id' => $student->student_id,
                'manager_id' => $manager->id,
            ]);
            
            return back()->with('error', 'Failed to update dormitorian status: ' . $e->getMessage());
        }
    }
}
