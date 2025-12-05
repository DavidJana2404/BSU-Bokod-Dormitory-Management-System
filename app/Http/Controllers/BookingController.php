<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\RoomAssignmentMail;
use App\Models\Booking;
use App\Models\Student;
use App\Models\Room;
use App\Models\Tenant;
use App\Models\CashierNotification;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Test database connection with timeout
            try {
                \DB::connection()->getPdo();
                \DB::connection()->enableQueryLog();
            } catch (\Exception $dbException) {
                \Log::error('Database connection failed in BookingController index', [
                    'error' => $dbException->getMessage()
                ]);
                
                return Inertia::render('bookings/index', [
                    'bookings' => [],
                    'students' => [],
                    'rooms' => [],
                    'tenant_id' => null,
                    'hasAnyStudents' => false,
                    'error' => 'Unable to connect to database. Please try again later.'
                ]);
            }
            
            $user = $request->user();
            \Log::info('BookingController index called', ['user_id' => $user ? $user->id : 'null']);
            
            if (!$user || !$user->tenant_id) {
                \Log::warning('BookingController index: No user or tenant_id', [
                    'user_id' => $user ? $user->id : 'null',
                    'tenant_id' => $user ? $user->tenant_id : 'null'
                ]);
                return Inertia::render('bookings/index', [
                    'bookings' => [],
                    'students' => [],
                    'rooms' => [],
                    'tenant_id' => null,
                    'hasAnyStudents' => false,
                    'error' => 'Unable to load bookings. Please try again later.'
                ]);
            }
            
            // DISABLE CACHING TEMPORARILY TO FIX BOOKING DISPLAY ISSUES
            // $cacheKey = "bookings_index_{$user->tenant_id}_" . md5($request->fullUrl());
            // $cacheTime = 300; // 5 minutes
            
            // Always fetch fresh data for now
            \Log::info('BookingController index loading fresh data', ['tenant_id' => $user->tenant_id]);
            
            // Initialize default values
            $bookings = collect([]);
            $students = collect([]);
            $rooms = collect([]);
            $hasAnyStudents = false;
            
            try {
                // OPTIMIZED: Get bookings with eager loading to prevent N+1 queries
                $bookingsData = Booking::with([
                    'student:student_id,first_name,last_name,email,tenant_id',
                    'room:room_id,room_number,type,max_capacity,tenant_id'
                ])
                ->select(['booking_id', 'tenant_id', 'student_id', 'room_id', 'semester_count', 'booked_at', 'archived_at'])
                ->where('tenant_id', $user->tenant_id)
                ->whereNull('archived_at')
                ->orderBy('booking_id', 'desc')
                ->limit(100)
                ->get();
                
                // Transform bookings data efficiently
                $bookings = $bookingsData->map(function ($booking) {
                    return [
                        'booking_id' => $booking->booking_id,
                        'student_id' => $booking->student_id,
                        'room_id' => $booking->room_id,
                        'semester_count' => $booking->semester_count,
                        'booked_at' => $booking->booked_at ? \Carbon\Carbon::parse($booking->booked_at)->toIso8601String() : null,
                        'student' => $booking->student ? [
                            'student_id' => $booking->student->student_id,
                            'first_name' => $booking->student->first_name,
                            'last_name' => $booking->student->last_name,
                            'email' => $booking->student->email,
                        ] : null,
                        'room' => $booking->room ? [
                            'room_id' => $booking->room->room_id,
                            'room_number' => $booking->room->room_number,
                            'type' => $booking->room->type,
                            'max_capacity' => $booking->room->max_capacity,
                        ] : null,
                    ];
                });
                
            } catch (\Exception $e) {
                \Log::error('Error loading bookings', [
                    'tenant_id' => $user->tenant_id,
                    'error' => $e->getMessage()
                ]);
            }
            
            try {
                // OPTIMIZED: Get students efficiently with a single query
                $allStudents = Student::select('student_id', 'first_name', 'last_name', 'email')
                    ->where('tenant_id', $user->tenant_id)
                    ->whereNull('archived_at')
                    ->limit(100)
                    ->get();
                
                $hasAnyStudents = $allStudents->count() > 0;
                
                // Filter out students who already have active bookings more efficiently
                $studentsWithBookings = $bookingsData->pluck('student_id')->toArray();
                $students = $allStudents->filter(function ($student) use ($studentsWithBookings) {
                    return !in_array($student->student_id, $studentsWithBookings);
                })->values(); // Reset array keys
                
            } catch (\Exception $e) {
                \Log::error('Error loading students', [
                    'tenant_id' => $user->tenant_id,
                    'error' => $e->getMessage()
                ]);
                $students = collect([]);
            }
            
            try {
                // OPTIMIZED: Get rooms with occupancy count in single query using join
                $roomsQuery = Room::select([
                    'rooms.room_id', 'rooms.tenant_id', 'rooms.room_number', 'rooms.type', 
                    'rooms.price_per_semester', 'rooms.status', 'rooms.max_capacity',
                    \DB::raw('COALESCE(booking_counts.occupancy_count, 0) as current_occupancy')
                ])
                ->leftJoin(\DB::raw('(
                    SELECT room_id, COUNT(*) as occupancy_count 
                    FROM bookings 
                    WHERE archived_at IS NULL 
                    GROUP BY room_id
                ) as booking_counts'), 'rooms.room_id', '=', 'booking_counts.room_id')
                ->where('rooms.tenant_id', $user->tenant_id)
                ->whereNull('rooms.archived_at')
                ->limit(50);
                
                $roomsData = $roomsQuery->get();
                
                $rooms = $roomsData->map(function ($room) {
                    $maxCapacity = $room->max_capacity ?? 0;
                    $currentOccupancy = $room->current_occupancy ?? 0;
                    $availableCapacity = max(0, $maxCapacity - $currentOccupancy);
                    
                    return [
                        'room_id' => $room->room_id,
                        'tenant_id' => $room->tenant_id,
                        'room_number' => $room->room_number,
                        'type' => $room->type,
                        'price_per_semester' => $room->price_per_semester,
                        'status' => $room->status,
                        'max_capacity' => $maxCapacity,
                        'current_occupancy' => $currentOccupancy,
                        'available_capacity' => $availableCapacity,
                        'is_at_capacity' => $currentOccupancy >= $maxCapacity,
                        'can_accommodate' => $availableCapacity > 0,
                    ];
                });
            } catch (\Exception $e) {
                \Log::error('Error loading rooms', [
                    'tenant_id' => $user->tenant_id,
                    'error' => $e->getMessage()
                ]);
                $rooms = collect([]);
            }
            
            // Prepare response data
            $responseData = [
                'bookings' => $bookings->values()->all(),
                'students' => $students,
                'rooms' => $rooms->values()->all(),
                'tenant_id' => $user->tenant_id,
                'hasAnyStudents' => $hasAnyStudents,
            ];
            
            // Cache disabled temporarily to fix display issues
            // \Cache::put($cacheKey, $responseData, $cacheTime);
            
            \Log::info('BookingController index returning data', [
                'bookings_count' => $bookings->count(),
                'students_count' => $students->count(),
                'rooms_count' => $rooms->count(),
                'hasAnyStudents' => $hasAnyStudents,
                'tenant_id' => $user->tenant_id,
                'cached' => true
            ]);
            
            // Log query count if debug enabled
            if (config('app.debug')) {
                $queries = \DB::getQueryLog();
                \Log::info('BookingController queries executed', ['query_count' => count($queries)]);
            }
            
            return Inertia::render('bookings/index', $responseData);
            
        } catch (\Exception $e) {
            \Log::error('Fatal error in bookings index', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return Inertia::render('bookings/index', [
                'bookings' => [],
                'students' => [],
                'rooms' => [],
                'tenant_id' => null,
                'hasAnyStudents' => false,
                'error' => 'Unable to load bookings. Please try again later.'
            ]);
        }
    }

    public function store(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user || !$user->tenant_id) {
                return back()->withErrors(['error' => 'Unauthorized access.']);
            }

            // Simple validation
            $data = $request->validate([
                'student_id' => 'required|integer',
                'room_id' => 'required|integer', 
                'semester_count' => 'required|integer|min:1|max:10',
            ]);
            
            $data['tenant_id'] = $user->tenant_id;
            $data['booked_at'] = now();
            
            // Check if student already has booking
            $existingBooking = Booking::where('student_id', $data['student_id'])
                ->whereNull('archived_at')
                ->first();
                
            if ($existingBooking) {
                return back()->withErrors([
                    'student_id' => 'This student already has an active booking.'
                ])->withInput();
            }
            
            // Check room capacity
            $room = Room::where('room_id', $data['room_id'])
                ->where('tenant_id', $user->tenant_id)
                ->whereNull('archived_at')
                ->first();
                
            if (!$room) {
                return back()->withErrors([
                    'room_id' => 'Selected room is not available.'
                ]);
            }
            
            $currentOccupancy = Booking::where('room_id', $room->room_id)
                ->whereNull('archived_at')
                ->count();
                
            if ($currentOccupancy >= ($room->max_capacity ?? 0)) {
                return back()->withErrors([
                    'room_id' => 'This room is at maximum capacity.'
                ]);
            }
            
            // Create booking
            $booking = Booking::create($data);
            
            // CLEAR ALL CACHE after creating booking
            \Cache::flush();
            
            \Log::info('Booking created successfully', [
                'booking_id' => $booking->booking_id,
                'student_id' => $data['student_id'],
                'room_id' => $data['room_id']
            ]);
            
            // Send room assignment email to the student
            try {
                $student = Student::find($data['student_id']);
                $dormitoryName = null;
                
                if ($user->tenant_id) {
                    $tenant = Tenant::find($user->tenant_id);
                    $dormitoryName = $tenant ? $tenant->dormitory_name : null;
                }
                
                $roomDetails = [
                    'room_number' => $room->room_number,
                    'room_type' => $room->type,
                    'semester_count' => $data['semester_count'],
                    'max_capacity' => $room->max_capacity,
                ];
                
                @Mail::to($student->email)->send(new RoomAssignmentMail(
                    $student,
                    $roomDetails,
                    $dormitoryName
                ));
                
                \Log::info('Room assignment email sent', [
                    'booking_id' => $booking->booking_id,
                    'student_id' => $student->student_id,
                    'email' => $student->email
                ]);
            } catch (\Throwable $e) {
                \Log::error('Failed to send room assignment email', [
                    'booking_id' => $booking->booking_id,
                    'error' => $e->getMessage()
                ]);
                // Continue regardless of email failure
            }
            
            return redirect()->route('bookings.index')
                ->with('success', 'Booking created successfully and room assignment email has been sent.');
                
        } catch (\Exception $e) {
            \Log::error('Booking creation failed', [
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);
            
            return back()->withErrors([
                'error' => 'Failed to create booking: ' . $e->getMessage()
            ])->withInput();
        }
    }

    public function show($id)
    {
        try {
            // Test database connection first
            \DB::connection()->getPdo();
            
            $booking = Booking::with(['student', 'room'])->findOrFail($id);
            
            // For AJAX requests, return JSON
            if (request()->expectsJson()) {
                return response()->json($booking);
            }
            
            // For direct browser requests, redirect to bookings index
            return redirect()->route('bookings.index');
            
        } catch (\Exception $e) {
            \Log::error('Error loading booking details', [
                'booking_id' => $id,
                'error' => $e->getMessage()
            ]);
            
            // For AJAX requests, return JSON error
            if (request()->expectsJson()) {
                return response()->json([
                    'error' => 'Failed to load booking details',
                    'message' => $e->getMessage()
                ], 500);
            }
            
            // For direct browser requests, redirect with error
            return redirect()->route('bookings.index')->with('error', 'Booking not found.');
        }
    }

    public function update(Request $request, $id)
    {
        try {
            // Test database connection first
            \DB::connection()->getPdo();
            
            $user = $request->user();
            
            if (!$user || !$user->tenant_id) {
                return back()->withErrors(['error' => 'Unauthorized access.']);
            }
            
            $booking = Booking::findOrFail($id);
            
            // Only validate the fields that can be updated (student cannot be changed)
            $data = $request->validate([
                'room_id' => 'required|integer',
                'semester_count' => 'required|integer|min:1|max:10',
            ]);
            
            // If room is changing, check capacity of new room
            if ($data['room_id'] != $booking->room_id) {
                try {
                    $newRoom = Room::where('room_id', $data['room_id'])
                        ->where('tenant_id', $user->tenant_id)
                        ->whereNull('archived_at')
                        ->first();
                        
                    if (!$newRoom) {
                        return back()->withErrors([
                            'room_id' => 'Selected room is not available.'
                        ]);
                    }
                    
                    $currentOccupancy = Booking::where('room_id', $newRoom->room_id)
                        ->whereNull('archived_at')
                        ->where('booking_id', '!=', $booking->booking_id) // Exclude current booking
                        ->count();
                        
                    if ($currentOccupancy >= $newRoom->max_capacity) {
                        return back()->withErrors([
                            'room_id' => 'The selected room is at maximum capacity (' . $newRoom->max_capacity . ' students). Current occupancy: ' . $currentOccupancy . '/' . $newRoom->max_capacity
                        ]);
                    }
                } catch (\Exception $e) {
                    \Log::error('Error checking room capacity for booking update', [
                        'booking_id' => $id,
                        'room_id' => $data['room_id'],
                        'error' => $e->getMessage()
                    ]);
                    return back()->withErrors(['error' => 'Unable to validate room availability.']);
                }
            }
            
            $booking->update($data);
            
            // CLEAR ALL CACHE after updating booking
            \Cache::flush();
            
            return redirect()->route('bookings.index')
                ->with('success', 'Booking updated successfully.');
            
        } catch (\Exception $e) {
            \Log::error('Error updating booking', [
                'booking_id' => $id,
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);
            
            return back()->withErrors(['error' => 'Failed to update booking: ' . $e->getMessage()]);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $user = $request->user();
            
            if (!$user || !$user->tenant_id) {
                return back()->withErrors(['error' => 'Unauthorized access.']);
            }
            
            $booking = Booking::findOrFail($id);
            
            // Verify booking belongs to user's tenant
            if ($booking->tenant_id !== $user->tenant_id) {
                return back()->withErrors(['error' => 'Unauthorized access to this booking.']);
            }
            
            // Create notification for cashier with stay duration and cost
            try {
                $student = $booking->student;
                $room = $booking->room;
                if ($student) {
                    // Calculate days stayed
                    $bookedAt = $booking->booked_at ? \Carbon\Carbon::parse($booking->booked_at) : null;
                    $archivedAt = now();
                    $daysStayed = $bookedAt ? (int)$bookedAt->diffInDays($archivedAt) : 0;
                    
                    // Calculate cost: ₱400 per month
                    // 1-30 days = 1 month (₱400)
                    // 31-60 days = 2 months (₱800)
                    // 61-90 days = 3 months (₱1,200), etc.
                    // Any partial month counts as full month
                    $monthsStayed = $daysStayed > 0 ? max(1, (int)ceil($daysStayed / 30)) : 0;
                    $calculatedCost = $monthsStayed * 400;
                    
                    $totalSemesters = $booking->semester_count ?? 1;
                    $roomNumber = $room ? $room->room_number : 'N/A';
                    
                    CashierNotification::create([
                        'tenant_id' => $user->tenant_id,
                        'type' => 'booking_archived',
                        'student_id' => $student->student_id,
                        'booking_id' => $booking->booking_id,
                        'student_name' => $student->first_name . ' ' . $student->last_name,
                        'message' => "Booking for {$student->first_name} {$student->last_name} has been archived by manager. Stayed for {$monthsStayed} month" . ($monthsStayed != 1 ? 's' : '') . " ({$daysStayed} days).",
                        'booked_at' => $bookedAt,
                        'archived_at' => $archivedAt,
                        'days_stayed' => $daysStayed,
                        'months_stayed' => $monthsStayed,
                        'calculated_cost' => round($calculatedCost, 2),
                        'total_semesters' => $totalSemesters,
                        'room_number' => $roomNumber,
                    ]);
                }
            } catch (\Exception $e) {
                \Log::error('Failed to create cashier notification for booking archive', [
                    'error' => $e->getMessage(),
                    'booking_id' => $booking->booking_id
                ]);
            }
            
            // Archive the booking
            $booking->archive();
            
            // CLEAR ALL CACHE after archiving booking
            \Cache::flush();
            
            \Log::info('Booking archived successfully', [
                'booking_id' => $id,
                'user_id' => $user->id,
                'tenant_id' => $user->tenant_id
            ]);
            
            return redirect()->route('bookings.index')
                ->with('success', 'Booking archived successfully.');
            
        } catch (\Exception $e) {
            \Log::error('Error archiving booking', [
                'booking_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => $user->id ?? 'null'
            ]);
            
            return back()->withErrors([
                'error' => 'Failed to archive booking: ' . $e->getMessage()
            ]);
        }
    }
    
    public function restore($id)
    {
        try {
            $user = request()->user();
            $booking = Booking::findOrFail($id);
            $booking->restore();
            
            // CLEAR ALL CACHE after restoring booking
            \Cache::flush();
            
            return redirect()->route('bookings.index')
                ->with('success', 'Booking restored successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to restore booking: ' . $e->getMessage()]);
        }
    }
    
    public function forceDelete($id)
    {
        try {
            $user = request()->user();
            $booking = Booking::findOrFail($id);
            $booking->delete();
            
            // CLEAR ALL CACHE after deleting booking
            \Cache::flush();
            
            return redirect()->route('bookings.index')
                ->with('success', 'Booking permanently deleted.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete booking: ' . $e->getMessage()]);
        }
    }
}
