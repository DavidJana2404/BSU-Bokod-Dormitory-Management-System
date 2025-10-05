<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
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
                try {
                    // Load dormitories with error handling
                    $dormitories = collect([]);
                    $totalDormitories = 0;
                    $totalRooms = 0;
                    $totalManagers = 0;
                    $totalStudents = 0;
                    
                    try {
                        // Get basic dormitory info only (avoid eager loading issues)
                        $dormitoriesData = \App\Models\Tenant::select('tenant_id', 'dormitory_name', 'address', 'contact_number')
                            ->limit(50) // Prevent memory issues
                            ->get();
                            
                        $dormitories = $dormitoriesData->map(function ($dormitory) {
                            try {
                                // Load rooms separately with error handling
                                $rooms = \App\Models\Room::select('room_id', 'tenant_id', 'room_number', 'type', 'status')
                                    ->where('tenant_id', $dormitory->tenant_id)
                                    ->whereNull('archived_at')
                                    ->get();
                                    
                                return [
                                    'tenant_id' => $dormitory->tenant_id,
                                    'dormitory_name' => $dormitory->dormitory_name,
                                    'address' => $dormitory->address,
                                    'contact_number' => $dormitory->contact_number,
                                    'rooms' => $rooms->toArray(),
                                ];
                            } catch (\Exception $e) {
                                \Log::error('Error loading rooms for dormitory: ' . $e->getMessage(), [
                                    'dormitory_id' => $dormitory->tenant_id ?? 'unknown'
                                ]);
                                
                                return [
                                    'tenant_id' => $dormitory->tenant_id,
                                    'dormitory_name' => $dormitory->dormitory_name,
                                    'address' => $dormitory->address,
                                    'contact_number' => $dormitory->contact_number,
                                    'rooms' => [],
                                ];
                            }
                        });
                        
                        $totalDormitories = $dormitories->count();
                        
                    } catch (\Exception $e) {
                        \Log::error('Error loading dormitories: ' . $e->getMessage());
                    }
                    
                    // Get statistics with individual error handling
                    try {
                        $totalRooms = \App\Models\Room::whereNull('archived_at')->count();
                    } catch (\Exception $e) {
                        \Log::error('Error counting rooms: ' . $e->getMessage());
                        $totalRooms = 0;
                    }
                    
                    try {
                        $totalManagers = \App\Models\User::where('role', 'manager')->count();
                    } catch (\Exception $e) {
                        \Log::error('Error counting managers: ' . $e->getMessage());
                        $totalManagers = 0;
                    }
                    
                    try {
                        $totalStudents = \App\Models\Student::whereNull('archived_at')->count();
                    } catch (\Exception $e) {
                        \Log::error('Error counting students: ' . $e->getMessage());
                        $totalStudents = 0;
                    }

                    return \Inertia\Inertia::render('dashboard', [
                        'isAdmin' => true,    
                        'dormitories' => $dormitories->values()->all(),
                        'totalDormitories' => $totalDormitories,
                        'totalRooms' => $totalRooms,
                        'totalManagers' => $totalManagers,
                        'totalStudents' => $totalStudents,
                    ]);
                    
                } catch (\Exception $e) {
                    \Log::error('Error in admin dashboard: ' . $e->getMessage());
                    
                    // Return safe fallback for admin
                    return \Inertia\Inertia::render('dashboard', [
                        'isAdmin' => true,    
                        'dormitories' => [],
                        'totalDormitories' => 0,
                        'totalRooms' => 0,
                        'totalManagers' => 0,
                        'totalStudents' => 0,
                        'error' => 'Unable to load dashboard data at this time.',
                    ]);
                }
            }
            // Manager dashboard
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
            
            try {
                // Initialize default values
                $dormitory = null;
                $studentsCount = 0;
                $roomsCount = 0;
                $bookingsCount = 0;
                $rooms = collect([]);
                
                // Load dormitory info with error handling
                try {
                    $dormitory = \App\Models\Tenant::select('tenant_id', 'dormitory_name', 'address', 'contact_number')
                        ->where('tenant_id', $tenantId)
                        ->first();
                } catch (\Exception $e) {
                    \Log::error('Error loading dormitory: ' . $e->getMessage(), ['tenant_id' => $tenantId]);
                }
                
                // Get counts with individual error handling
                try {
                    $studentsCount = \App\Models\Student::where('tenant_id', $tenantId)
                        ->whereNull('archived_at')
                        ->count();
                } catch (\Exception $e) {
                    \Log::error('Error counting students: ' . $e->getMessage(), ['tenant_id' => $tenantId]);
                }
                
                try {
                    $roomsCount = \App\Models\Room::where('tenant_id', $tenantId)
                        ->whereNull('archived_at')
                        ->count();
                } catch (\Exception $e) {
                    \Log::error('Error counting rooms: ' . $e->getMessage(), ['tenant_id' => $tenantId]);
                }
                
                try {
                    $bookingsCount = \App\Models\Booking::where('tenant_id', $tenantId)
                        ->whereNull('archived_at')
                        ->count();
                } catch (\Exception $e) {
                    \Log::error('Error counting bookings: ' . $e->getMessage(), ['tenant_id' => $tenantId]);
                }
                
                // Get room information with simplified queries to avoid joins
                try {
                    $roomsData = \App\Models\Room::select('room_id', 'tenant_id', 'room_number', 'type', 'price_per_semester', 'status', 'max_capacity')
                        ->where('tenant_id', $tenantId)
                        ->whereNull('archived_at')
                        ->orderBy('room_number')
                        ->limit(50) // Prevent memory issues
                        ->get();
                        
                    $rooms = $roomsData->map(function ($room) {
                        try {
                            // Get current occupancy with simpler query
                            $currentOccupancy = 0;
                            $currentStudents = [];
                            
                            try {
                                $currentOccupancy = \App\Models\Booking::where('room_id', $room->room_id)
                                    ->whereNull('archived_at')
                                    ->count();
                                    
                                // Get basic student info without complex joins
                                $students = \App\Models\Student::select('student_id', 'first_name', 'last_name', 'email', 'phone')
                                    ->whereIn('student_id', function($query) use ($room) {
                                        $query->select('student_id')
                                            ->from('bookings')
                                            ->where('room_id', $room->room_id)
                                            ->whereNull('archived_at');
                                    })
                                    ->whereNull('archived_at')
                                    ->get();
                                    
                                $currentStudents = $students->map(function ($student) {
                                    return [
                                        'student_id' => $student->student_id,
                                        'first_name' => $student->first_name,
                                        'last_name' => $student->last_name,
                                        'email' => $student->email,
                                        'phone' => $student->phone,
                                        'semester_count' => 0, // Default fallback
                                    ];
                                })->toArray();
                                
                            } catch (\Exception $e) {
                                \Log::error('Error loading room students: ' . $e->getMessage(), ['room_id' => $room->room_id]);
                            }
                            
                            $availableCapacity = max(0, ($room->max_capacity ?? 0) - $currentOccupancy);
                            
                            return [
                                'room_id' => $room->room_id,
                                'room_number' => $room->room_number,
                                'type' => $room->type,
                                'price_per_semester' => $room->price_per_semester,
                                'status' => $room->status,
                                'max_capacity' => $room->max_capacity ?? 0,
                                'current_occupancy' => $currentOccupancy,
                                'available_capacity' => $availableCapacity,
                                'is_at_capacity' => $currentOccupancy >= ($room->max_capacity ?? 0),
                                'current_students' => $currentStudents,
                                'current_student' => $currentStudents[0] ?? null, // Keep for backward compatibility
                            ];
                            
                        } catch (\Exception $e) {
                            \Log::error('Error processing room: ' . $e->getMessage(), ['room_id' => $room->room_id]);
                            
                            // Return room with safe fallback values
                            return [
                                'room_id' => $room->room_id,
                                'room_number' => $room->room_number,
                                'type' => $room->type,
                                'price_per_semester' => $room->price_per_semester,
                                'status' => $room->status,
                                'max_capacity' => $room->max_capacity ?? 0,
                                'current_occupancy' => 0,
                                'available_capacity' => $room->max_capacity ?? 0,
                                'is_at_capacity' => false,
                                'current_students' => [],
                                'current_student' => null,
                            ];
                        }
                    });
                    
                } catch (\Exception $e) {
                    \Log::error('Error loading rooms: ' . $e->getMessage(), ['tenant_id' => $tenantId]);
                }

                return \Inertia\Inertia::render('dashboard', [
                    'isAdmin' => false,
                    'dormitory' => $dormitory,
                    'studentsCount' => $studentsCount,
                    'roomsCount' => $roomsCount,
                    'bookingsCount' => $bookingsCount,
                    'rooms' => $rooms->values()->all(),
                ]);
                
            } catch (\Exception $e) {
                \Log::error('Error in manager dashboard: ' . $e->getMessage(), ['tenant_id' => $tenantId]);
                
                // Return safe fallback for manager
                return \Inertia\Inertia::render('dashboard', [
                    'isAdmin' => false,
                    'dormitory' => null,
                    'studentsCount' => 0,
                    'roomsCount' => 0,
                    'bookingsCount' => 0,
                    'rooms' => [],
                    'error' => 'Unable to load dashboard data at this time.',
                ]);
            }
            
        } catch (\Exception $e) {
            \Log::error('Fatal error in dashboard: ' . $e->getMessage(), [
                'user_id' => $user->id ?? 'unknown',
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return safe fallback
            return \Inertia\Inertia::render('dashboard', [
                'isAdmin' => false,
                'dormitory' => null,
                'studentsCount' => 0,
                'roomsCount' => 0,
                'bookingsCount' => 0,
                'rooms' => [],
                'error' => 'Dashboard is temporarily unavailable. Please try again later.',
            ]);
        }
    }
}
