<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Booking;
use App\Models\Student;
use App\Models\Room;
use App\Models\Tenant;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        try {
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
            
            // Initialize default values
            $bookings = collect([]);
            $allStudents = collect([]);
            $rooms = collect([]);
            $hasAnyStudents = false;
            
            try {
                // Get bookings with safe relationship loading
                $bookingsData = Booking::select([
                    'booking_id', 'tenant_id', 'student_id', 'room_id', 'semester_count', 'archived_at'
                ])
                ->where('tenant_id', $user->tenant_id)
                ->whereNull('archived_at')
                ->limit(100)
                ->get();
                
                $bookings = $bookingsData->map(function ($booking) {
                    try {
                        // Load student and room data safely
                        $student = null;
                        $room = null;
                        
                        try {
                            $student = Student::select('student_id', 'first_name', 'last_name', 'email')
                                ->where('student_id', $booking->student_id)
                                ->whereNull('archived_at')
                                ->first();
                        } catch (\Exception $e) {
                            \Log::warning('Error loading student for booking', [
                                'booking_id' => $booking->booking_id,
                                'student_id' => $booking->student_id,
                                'error' => $e->getMessage()
                            ]);
                        }
                        
                        try {
                            $room = Room::select('room_id', 'room_number', 'type', 'max_capacity')
                                ->where('room_id', $booking->room_id)
                                ->whereNull('archived_at')
                                ->first();
                        } catch (\Exception $e) {
                            \Log::warning('Error loading room for booking', [
                                'booking_id' => $booking->booking_id,
                                'room_id' => $booking->room_id,
                                'error' => $e->getMessage()
                            ]);
                        }
                        
                        return [
                            'booking_id' => $booking->booking_id,
                            'student_id' => $booking->student_id,
                            'room_id' => $booking->room_id,
                            'semester_count' => $booking->semester_count,
                            'student' => $student ? [
                                'student_id' => $student->student_id,
                                'first_name' => $student->first_name,
                                'last_name' => $student->last_name,
                                'email' => $student->email,
                            ] : null,
                            'room' => $room ? [
                                'room_id' => $room->room_id,
                                'room_number' => $room->room_number,
                                'type' => $room->type,
                                'max_capacity' => $room->max_capacity,
                            ] : null,
                        ];
                    } catch (\Exception $e) {
                        \Log::error('Error mapping booking data', [
                            'booking_id' => $booking->booking_id,
                            'error' => $e->getMessage()
                        ]);
                        
                        return [
                            'booking_id' => $booking->booking_id,
                            'student_id' => $booking->student_id,
                            'room_id' => $booking->room_id,
                            'semester_count' => $booking->semester_count,
                            'student' => null,
                            'room' => null,
                        ];
                    }
                });
            } catch (\Exception $e) {
                \Log::error('Error loading bookings', [
                    'tenant_id' => $user->tenant_id,
                    'error' => $e->getMessage()
                ]);
            }
            
            try {
                // Get all students for this tenant
                $allStudents = Student::select('student_id', 'first_name', 'last_name', 'email')
                    ->where('tenant_id', $user->tenant_id)
                    ->whereNull('archived_at')
                    ->limit(100)
                    ->get();
                
                $hasAnyStudents = $allStudents->count() > 0;
                
                // Filter out students who already have active bookings
                $studentsWithBookings = $bookings->pluck('student_id')->toArray();
                $availableStudents = $allStudents->filter(function ($student) use ($studentsWithBookings) {
                    return !in_array($student->student_id, $studentsWithBookings);
                });
                
                $students = $availableStudents->values(); // Reset array keys
            } catch (\Exception $e) {
                \Log::error('Error loading students', [
                    'tenant_id' => $user->tenant_id,
                    'error' => $e->getMessage()
                ]);
                $students = collect([]);
            }
            
            try {
                // Get rooms with capacity information
                $roomsData = Room::select('room_id', 'tenant_id', 'room_number', 'type', 'price_per_semester', 'status', 'max_capacity')
                    ->where('tenant_id', $user->tenant_id)
                    ->whereNull('archived_at')
                    ->limit(50)
                    ->get();
                
                $rooms = $roomsData->map(function ($room) {
                    try {
                        $currentOccupancy = 0;
                        try {
                            $currentOccupancy = Booking::where('room_id', $room->room_id)
                                ->whereNull('archived_at')
                                ->count();
                        } catch (\Exception $e) {
                            \Log::warning('Error calculating room occupancy', [
                                'room_id' => $room->room_id,
                                'error' => $e->getMessage()
                            ]);
                        }
                        
                        $maxCapacity = $room->max_capacity ?? 0;
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
                    } catch (\Exception $e) {
                        \Log::error('Error mapping room data', [
                            'room_id' => $room->room_id,
                            'error' => $e->getMessage()
                        ]);
                        
                        return [
                            'room_id' => $room->room_id,
                            'tenant_id' => $room->tenant_id,
                            'room_number' => $room->room_number,
                            'type' => $room->type,
                            'price_per_semester' => $room->price_per_semester,
                            'status' => $room->status,
                            'max_capacity' => 0,
                            'current_occupancy' => 0,
                            'available_capacity' => 0,
                            'is_at_capacity' => true,
                            'can_accommodate' => false,
                        ];
                    }
                });
            } catch (\Exception $e) {
                \Log::error('Error loading rooms', [
                    'tenant_id' => $user->tenant_id,
                    'error' => $e->getMessage()
                ]);
            }
            
            \Log::info('BookingController index returning data', [
                'bookings_count' => $bookings->count(),
                'students_count' => $students->count(),
                'rooms_count' => $rooms->count(),
                'hasAnyStudents' => $hasAnyStudents,
                'tenant_id' => $user->tenant_id
            ]);
            
            return Inertia::render('bookings/index', [
                'bookings' => $bookings->values()->all(),
                'students' => $students,
                'rooms' => $rooms->values()->all(),
                'tenant_id' => $user->tenant_id,
                'hasAnyStudents' => $hasAnyStudents,
            ]);
            
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
            \Log::info('BookingController store called', [
                'user_id' => $user ? $user->id : 'null',
                'request_data' => $request->all()
            ]);
            
            if (!$user || !$user->tenant_id) {
                \Log::warning('BookingController store: Unauthorized access', [
                    'user_id' => $user ? $user->id : 'null',
                    'tenant_id' => $user ? $user->tenant_id : 'null'
                ]);
                return back()->withErrors(['error' => 'Unauthorized access.']);
            }
            
            // Check if there are any students in the system before allowing booking creation
            try {
                $totalStudents = Student::where('tenant_id', $user->tenant_id)
                    ->whereNull('archived_at')
                    ->count();
                    
                if ($totalStudents === 0) {
                    \Log::warning('Booking creation blocked: No students in system', ['tenant_id' => $user->tenant_id]);
                    return back()->withErrors([
                        'student_id' => 'Cannot create a booking because there are no students in the system yet. Please add students first before creating bookings.'
                    ]);
                }
            } catch (\Exception $e) {
                \Log::error('Error checking student count for booking', [
                    'tenant_id' => $user->tenant_id,
                    'error' => $e->getMessage()
                ]);
                return back()->withErrors(['error' => 'Unable to validate booking. Please try again.']);
            }
            
            // Validate input data
            $data = [];
            try {
                $data = $request->validate([
                    'student_id' => 'required|exists:students,student_id,tenant_id,' . $user->tenant_id,
                    'room_id' => 'required|exists:rooms,room_id,tenant_id,' . $user->tenant_id,
                    'semester_count' => 'required|integer|min:1|max:10',
                ]);
                $data['tenant_id'] = $user->tenant_id;
            } catch (\Illuminate\Validation\ValidationException $e) {
                \Log::warning('Booking validation failed', [
                    'errors' => $e->errors(),
                    'request_data' => $request->all()
                ]);
                return back()->withErrors($e->errors());
            }
            
            // Check room capacity with error handling
            try {
                $room = Room::select('room_id', 'max_capacity')
                    ->where('room_id', $data['room_id'])
                    ->where('tenant_id', $user->tenant_id)
                    ->whereNull('archived_at')
                    ->first();
                
                if (!$room) {
                    \Log::warning('Booking creation blocked: Room not found', [
                        'room_id' => $data['room_id'],
                        'tenant_id' => $user->tenant_id
                    ]);
                    return back()->withErrors([
                        'room_id' => 'Selected room is not available.'
                    ]);
                }
                
                // Check current occupancy safely
                $currentOccupancy = 0;
                try {
                    $currentOccupancy = Booking::where('room_id', $room->room_id)
                        ->whereNull('archived_at')
                        ->count();
                } catch (\Exception $e) {
                    \Log::warning('Error calculating room occupancy for booking', [
                        'room_id' => $room->room_id,
                        'error' => $e->getMessage()
                    ]);
                }
                
                $maxCapacity = $room->max_capacity ?? 0;
                if ($currentOccupancy >= $maxCapacity) {
                    \Log::warning('Booking creation blocked: Room at capacity', [
                        'room_id' => $room->room_id,
                        'current_occupancy' => $currentOccupancy,
                        'max_capacity' => $maxCapacity
                    ]);
                    return back()->withErrors([
                        'room_id' => 'This room is at maximum capacity (' . $maxCapacity . ' students). Current occupancy: ' . $currentOccupancy . '/' . $maxCapacity
                    ]);
                }
            } catch (\Exception $e) {
                \Log::error('Error checking room capacity for booking', [
                    'room_id' => $data['room_id'] ?? 'unknown',
                    'error' => $e->getMessage()
                ]);
                return back()->withErrors(['error' => 'Unable to validate room availability. Please try again.']);
            }
            
            // Check for duplicate booking
            try {
                $existingBooking = Booking::where('student_id', $data['student_id'])
                    ->whereNull('archived_at')
                    ->first();
                    
                if ($existingBooking) {
                    \Log::warning('Booking creation blocked: Student already has booking', [
                        'student_id' => $data['student_id'],
                        'existing_booking_id' => $existingBooking->booking_id
                    ]);
                    return back()->withErrors([
                        'student_id' => 'This student already has an active booking.'
                    ]);
                }
            } catch (\Exception $e) {
                \Log::warning('Error checking for duplicate booking', [
                    'student_id' => $data['student_id'] ?? 'unknown',
                    'error' => $e->getMessage()
                ]);
            }
            
            // Create booking with transaction
            $booking = null;
            \DB::transaction(function () use ($data, &$booking) {
                $booking = Booking::create($data);
                
                \Log::info('Booking created successfully', [
                    'booking_id' => $booking->booking_id,
                    'student_id' => $data['student_id'],
                    'room_id' => $data['room_id'],
                    'semester_count' => $data['semester_count'],
                    'tenant_id' => $data['tenant_id']
                ]);
            });
            
            // Use Inertia location redirect to force full page reload with fresh data
            return Inertia::location('/bookings');
            
        } catch (\Exception $e) {
            \Log::error('Fatal error creating booking', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            
            return back()->withErrors(['error' => 'Unable to create booking. Please try again later.']);
        }
    }

    public function show($id)
    {
        return response()->json(Booking::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $booking = Booking::findOrFail($id);
        
        // Only validate the fields that can be updated (student cannot be changed)
        $data = $request->validate([
            'room_id' => 'required|exists:rooms,room_id,tenant_id,' . $user->tenant_id,
            'semester_count' => 'required|integer|min:1|max:10',
        ]);
        
        // If room is changing, check capacity of new room
        if ($data['room_id'] != $booking->room_id) {
            $newRoom = Room::find($data['room_id']);
            if (!$newRoom || !$newRoom->canAccommodate(1)) {
                return back()->withErrors([
                    'room_id' => 'The selected room is at maximum capacity (' . $newRoom->max_capacity . ' students). Current occupancy: ' . $newRoom->getCurrentOccupancy() . '/' . $newRoom->max_capacity
                ]);
            }
        }
        
        $booking->update($data);
        
        // Use Inertia location redirect to force full page reload with fresh data
        return Inertia::location('/bookings');
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $booking = Booking::findOrFail($id);
        $booking->archive();
        
        // Use Inertia location redirect to force full page reload with fresh data
        return Inertia::location('/bookings');
    }
    
    public function restore($id)
    {
        $user = request()->user();
        $booking = Booking::findOrFail($id);
        $booking->restore();
        return redirect()->back()->with('success', 'Booking restored successfully.');
    }
    
    public function forceDelete($id)
    {
        $user = request()->user();
        $booking = Booking::findOrFail($id);
        $booking->delete();
        return redirect()->back()->with('success', 'Booking permanently deleted.');
    }
}
