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
        
        // Get cleaning schedules for the current room (both room-based and individual)
        $cleaningSchedules = [];
        if ($activeBooking && $activeBooking->room) {
            try {
                // Get room-based schedules
                $roomSchedules = CleaningSchedule::where('room_id', $activeBooking->room->room_id)
                    ->where(function($query) {
                        $query->where('type', 'room')->orWhereNull('type');
                    })
                    ->get();
                
                // Get individual schedules for this student
                $individualSchedules = CleaningSchedule::where('type', 'individual')
                    ->whereHas('students', function ($query) use ($user) {
                        $query->where('student_id', $user->student_id);
                    })
                    ->get();
                
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
            } catch (\Exception $e) {
                \Log::error('Error fetching cleaning schedules for student', [
                    'student_id' => $user->student_id,
                    'error' => $e->getMessage()
                ]);
                $cleaningSchedules = [];
            }
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
            'auth' => ['student' => $studentData] // Pass student data for sidebar component
        ]);
    }
}
