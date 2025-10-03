<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Student;
use App\Models\Room;
use App\Models\Tenant;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $bookings = Booking::where('tenant_id', $user->tenant_id)
            ->notArchived()
            ->with(['student', 'room'])
            ->get();
        
        // Get all students for this tenant (only non-archived)
        $allStudents = Student::where('tenant_id', $user->tenant_id)->notArchived()->get();
        
        // Check if there are any students at all
        $hasAnyStudents = $allStudents->count() > 0;
        
        // Filter out students who already have active bookings
        $studentsWithBookings = $bookings->pluck('student_id')->toArray();
        $availableStudents = $allStudents->filter(function ($student) use ($studentsWithBookings) {
            return !in_array($student->student_id, $studentsWithBookings);
        });
        
        $students = $availableStudents->values(); // Reset array keys
        
        // Get rooms with capacity information (only non-archived)
        $rooms = Room::where('tenant_id', $user->tenant_id)->notArchived()
            ->get()
            ->map(function ($room) {
                return [
                    'room_id' => $room->room_id,
                    'tenant_id' => $room->tenant_id,
                    'room_number' => $room->room_number,
                    'type' => $room->type,
                    'price_per_night' => $room->price_per_night,
                    'status' => $room->status,
                    'max_capacity' => $room->max_capacity,
                    'current_occupancy' => $room->getCurrentOccupancy(),
                    'available_capacity' => $room->getAvailableCapacity(),
                    'is_at_capacity' => $room->isAtCapacity(),
                    'can_accommodate' => $room->canAccommodate(1),
                ];
            });
            
        return Inertia::render('bookings/index', [
            'bookings' => $bookings,
            'students' => $students,
            'rooms' => $rooms,
            'tenant_id' => $user->tenant_id,
            'hasAnyStudents' => $hasAnyStudents,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        
        // Check if there are any students in the system before allowing booking creation
        $totalStudents = Student::where('tenant_id', $user->tenant_id)->notArchived()->count();
        if ($totalStudents === 0) {
            return back()->withErrors([
                'student_id' => 'Cannot create a booking because there are no students in the system yet. Please add students first before creating bookings.'
            ]);
        }
        
        $data = $request->validate([
            'student_id' => 'required|exists:students,student_id,tenant_id,' . $user->tenant_id,
            'room_id' => 'required|exists:rooms,room_id,tenant_id,' . $user->tenant_id,
            'semester_count' => 'required|integer|min:1|max:10',
        ]);
        $data['tenant_id'] = $user->tenant_id;
        
        // Check room capacity
        $room = Room::find($data['room_id']);
        if (!$room || !$room->canAccommodate(1)) {
            return back()->withErrors([
                'room_id' => 'This room is at maximum capacity (' . $room->max_capacity . ' students). Current occupancy: ' . $room->getCurrentOccupancy() . '/' . $room->max_capacity
            ]);
        }
        
        Booking::create($data);
        
        // Use Inertia location redirect to force full page reload with fresh data
        return Inertia::location('/bookings');
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
