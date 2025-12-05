<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\CleaningSchedule;

class StudentDashboardController extends Controller
{
    /**
     * Display the student dashboard
     */
    public function index(Request $request)
    {
        // Get the authenticated student user from the student guard
        $user = Auth::guard('student')->user();
        
        // If no student user is authenticated, redirect to login
        if (!$user) {
            return redirect()->route('login');
        }
        
        // Get the current booking for this student with room information
        $currentBooking = null;
        if (method_exists($user, 'currentBooking')) {
            $currentBooking = $user->currentBooking();
            if ($currentBooking) {
                $currentBooking->load('room');
            }
        }
        
        // If no current booking, try to get the most recent booking
        $latestBooking = null;
        if (method_exists($user, 'bookings')) {
            $latestBooking = $user->bookings()->with('room')->latest('created_at')->first();
        }
        
        // Use current booking if available, otherwise use latest booking
        $activeBooking = $currentBooking ?? $latestBooking;
        
        // Get all dormitorians in the same dormitory (tenant), excluding current student
        $dormitorians = [];
        try {
            $dormitorians = \App\Models\Student::where('tenant_id', $user->tenant_id)
                ->where('student_id', '!=', $user->student_id) // Exclude current student
                ->notArchived()
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get()
                ->map(function ($student) {
                    return [
                        'student_id' => $student->student_id,
                        'first_name' => $student->first_name,
                        'last_name' => $student->last_name,
                    ];
                })->toArray();
        } catch (\Exception $e) {
            \Log::error('Error fetching dormitorians for student', [
                'student_id' => $user->student_id,
                'error' => $e->getMessage()
            ]);
        }
        
        // Get cleaning schedules for the current room (both room-based and individual)
        $cleaningSchedules = [];
        
        // Debug logging
        \Log::info('Fetching schedules for student', [
            'student_id' => $user->student_id,
            'has_active_booking' => !is_null($activeBooking),
            'has_room' => $activeBooking && $activeBooking->room ? true : false,
            'room_id' => $activeBooking && $activeBooking->room ? $activeBooking->room->room_id : null,
        ]);
        
        try {
            $roomSchedules = collect();
            
            // Get room-based schedules only if student has a room
            if ($activeBooking && $activeBooking->room) {
                $roomSchedules = CleaningSchedule::where('room_id', $activeBooking->room->room_id)
                    ->where(function($query) {
                        $query->where('type', 'room')->orWhereNull('type');
                    })
                    ->get();
                
                \Log::info('Room schedules found', [
                    'count' => $roomSchedules->count(),
                    'schedules' => $roomSchedules->toArray()
                ]);
            }
            
            // ALWAYS get individual schedules for this student, regardless of booking status
            $individualSchedules = CleaningSchedule::where('type', 'individual')
                ->whereHas('students', function ($query) use ($user) {
                    $query->where('students.student_id', $user->student_id);
                })
                ->get();
            
            \Log::info('Individual schedules found', [
                'count' => $individualSchedules->count(),
                'schedules' => $individualSchedules->toArray()
            ]);
            
            // Merge both types of schedules
            $allSchedules = $roomSchedules->merge($individualSchedules);
            
            $cleaningSchedules = $allSchedules->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'day_of_week' => $schedule->day_of_week,
                    'day_name' => $schedule->day_name,
                    'room_id' => $schedule->room_id,
                ];
            })->toArray();
            
            \Log::info('Final schedules', [
                'count' => count($cleaningSchedules),
                'schedules' => $cleaningSchedules
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching cleaning schedules for student', [
                'student_id' => $user->student_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            $cleaningSchedules = [];
        }
        
        // The authenticated user could be either User or Student model
        // Let's make sure we handle both cases properly
        $studentData = [
            'student_id' => $user->student_id ?? $user->id,
            'first_name' => $user->first_name ?? $user->name ?? 'Student',
            'last_name' => $user->last_name ?? '',
            'email' => $user->email,
            'phone' => $user->phone ?? 'Not provided',
            'status' => $user->status ?? 'in', // Default to 'in' if not set
            'leave_reason' => $user->leave_reason ?? null,
            'status_updated_at' => $user->status_updated_at ?? null,
            // Booking information
            'current_booking' => $activeBooking ? [
                'id' => $activeBooking->booking_id,
                'semester_count' => $activeBooking->semester_count ?? 0,
                'total_fee' => method_exists($activeBooking, 'getTotalCost') ? $activeBooking->getTotalCost() : (($activeBooking->semester_count ?? 0) * 2000),
                'room' => $activeBooking->room ? [
                    'id' => $activeBooking->room->room_id,
                    'room_number' => $activeBooking->room->room_number,
                    'room_type' => $activeBooking->room->room_type ?? 'Standard',
                ] : null,
            ] : null,
        ];
        
        return Inertia::render('student/dashboard', [
            'student' => $studentData,
            'cleaningSchedules' => $cleaningSchedules,
            'dormitorians' => $dormitorians,
            'auth' => ['student' => $studentData] // Pass student data for sidebar component
        ]);
    }
}
