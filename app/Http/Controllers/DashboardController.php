<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Check for session conflicts and redirect students
        if (session('user_type') === 'student' || auth()->guard('student')->check()) {
            // Clear any conflicting web guard session
            if (auth()->guard('web')->check()) {
                auth()->guard('web')->logout();
            }
            return redirect()->route('student.dashboard');
        }
        
        $user = $request->user();
        
        // Ensure we have a valid user with a role
        if (!$user || !isset($user->role)) {
            // Log the issue for debugging
            \Log::error('Dashboard accessed without proper user or role', [
                'user_id' => $user ? $user->id : 'null',
                'session_user_type' => session('user_type'),
                'session_user_role' => session('user_role'),
                'web_guard_check' => auth()->guard('web')->check(),
                'student_guard_check' => auth()->guard('student')->check()
            ]);
            // Clear session and redirect to login
            $request->session()->forget(['user_type', 'user_role']);
            return redirect()->route('login');
        }
        
        // Ensure session consistency with database role
        if (session('user_type') !== 'user' || session('user_role') !== $user->role) {
            session([
                'user_type' => 'user',
                'user_role' => $user->role
            ]);
        }
        
        // Ensure no conflicting student session exists
        if (auth()->guard('student')->check()) {
            auth()->guard('student')->logout();
        }
        
        // Redirect cashier to their dedicated dashboard
        if ($user->role === 'cashier') {
            return redirect()->route('cashier.dashboard');
        }
        
        if ($user->role === 'admin') {
            $dormitories = \App\Models\Tenant::with(['rooms' => function($query) {
                $query->notArchived();
            }])->get()->map(function ($dormitory) {
                return [
                    'tenant_id' => $dormitory->tenant_id,
                    'dormitory_name' => $dormitory->dormitory_name,
                    'address' => $dormitory->address,
                    'contact_number' => $dormitory->contact_number,
                    'rooms' => $dormitory->rooms,
                ];
            });
            $totalDormitories = $dormitories->count();
            $totalRooms = \App\Models\Room::notArchived()->count();
            $totalManagers = \App\Models\User::where('role', 'manager')->count();
            $totalStudents = \App\Models\Student::notArchived()->count();

            return \Inertia\Inertia::render('dashboard', [
                'isAdmin' => true,    
                'dormitories' => $dormitories,
                'totalDormitories' => $totalDormitories,
                'totalRooms' => $totalRooms,
                'totalManagers' => $totalManagers,
                'totalStudents' => $totalStudents,
            ]);
        }
        $tenantId = $user->tenant_id;
        
        if (!$tenantId) {
            return \Inertia\Inertia::render('dashboard', [
                'isAdmin' => false,
                'dormitory' => null,
                'studentsCount' => 0,
                'roomsCount' => 0,
                'bookingsCount' => 0,
                'rooms' => [],
            ]);
        }
        
        $dormitory = \App\Models\Tenant::where('tenant_id', $tenantId)->first();
        $studentsCount = \App\Models\Student::where('tenant_id', $tenantId)->notArchived()->count();
        $roomsCount = \App\Models\Room::where('tenant_id', $tenantId)->notArchived()->count();
        $bookingsCount = \App\Models\Booking::where('tenant_id', $tenantId)->notArchived()->count();
        
        // Get detailed room information with current student details
        $rooms = \App\Models\Room::where('tenant_id', $tenantId)
            ->notArchived()
            ->orderBy('room_number')
            ->get()
            ->map(function ($room) {
                // Get all current active students for this room (excluding archived bookings and students)
                $currentStudents = \App\Models\Student::where('students.tenant_id', $room->tenant_id)
                    ->whereNull('students.archived_at')
                    ->join('bookings', 'students.student_id', '=', 'bookings.student_id')
                    ->where('bookings.room_id', $room->room_id)
                    ->whereNull('bookings.archived_at')
                    ->select('students.*', 'bookings.semester_count')
                    ->get()
                    ->map(function ($student) {
                        return [
                            'student_id' => $student->student_id,
                            'first_name' => $student->first_name,
                            'last_name' => $student->last_name,
                            'email' => $student->email,
                            'phone' => $student->phone,
                            'semester_count' => $student->semester_count,
                        ];
                    })->toArray();
                
                return [
                    'room_id' => $room->room_id,
                    'room_number' => $room->room_number,
                    'type' => $room->type,
                    'price_per_semester' => $room->price_per_semester,
                    'status' => $room->status,
                    'max_capacity' => $room->max_capacity,
                    'current_occupancy' => $room->getCurrentOccupancy(),
                    'available_capacity' => $room->getAvailableCapacity(),
                    'is_at_capacity' => $room->isAtCapacity(),
                    'current_students' => $currentStudents,
                    'current_student' => $currentStudents[0] ?? null, // Keep for backward compatibility
                ];
            });

        return \Inertia\Inertia::render('dashboard', [
            'isAdmin' => false,
            'dormitory' => $dormitory,
            'studentsCount' => $studentsCount,
            'roomsCount' => $roomsCount,
            'bookingsCount' => $bookingsCount,
            'rooms' => $rooms,
        ]);
    }
}
