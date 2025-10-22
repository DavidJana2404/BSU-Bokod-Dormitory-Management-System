<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CleaningSchedule;
use App\Models\Room;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class CleaningScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get all rooms for this tenant with their cleaning schedules
        $rooms = Room::where('tenant_id', $user->tenant_id)
            ->notArchived()
            ->with('cleaningSchedules')
            ->orderBy('room_number')
            ->get();
        
        // Create a weekly schedule structure
        $weeklySchedule = [];
        for ($day = 1; $day <= 7; $day++) {
            $weeklySchedule[$day] = CleaningSchedule::with(['room', 'room.students'])
                ->whereHas('room', function ($query) use ($user) {
                    $query->where('tenant_id', $user->tenant_id)->notArchived();
                })
                ->forDay($day)
                ->get()
                ->map(function ($schedule) {
                    return [
                        'id' => $schedule->id,
                        'room_id' => $schedule->room_id,
                        'room_number' => $schedule->room->room_number,
                        'day_of_week' => $schedule->day_of_week,
                        'day_name' => $schedule->day_name,
                        'students' => $schedule->room->students->map(function ($student) {
                            return [
                                'student_id' => $student->student_id,
                                'first_name' => $student->first_name,
                                'last_name' => $student->last_name,
                            ];
                        }),
                    ];
                });
        }
        
        return Inertia::render('cleaning-schedules/index', [
            'rooms' => $rooms->map(function ($room) {
                return [
                    'room_id' => $room->room_id,
                    'room_number' => $room->room_number,
                    'cleaning_schedules' => $room->cleaningSchedules->map(function ($schedule) {
                        return [
                            'id' => $schedule->id,
                            'day_of_week' => $schedule->day_of_week,
                            'day_name' => $schedule->day_name,
                        ];
                    })
                ];
            }),
            'weeklySchedule' => $weeklySchedule,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'room_id' => [
                'required',
                'exists:rooms,room_id',
                Rule::exists('rooms', 'room_id')->where('tenant_id', $user->tenant_id)
            ],
            'day_of_week' => 'required|integer|between:1,7',
        ]);
        
        // Check if this room already has a cleaning schedule for this day
        $existingSchedule = CleaningSchedule::where('room_id', $request->room_id)
            ->where('day_of_week', $request->day_of_week)
            ->first();
            
        if ($existingSchedule) {
            return back()->withErrors([
                'schedule' => 'This room already has a cleaning schedule for this day.'
            ]);
        }
        
        CleaningSchedule::create($request->only(['room_id', 'day_of_week']));
        
        return redirect()->route('cleaning-schedules.index')->with('success', 'Cleaning schedule created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = $request->user();
        
        $cleaningSchedule = CleaningSchedule::with('room')
            ->whereHas('room', function ($query) use ($user) {
                $query->where('tenant_id', $user->tenant_id);
            })
            ->findOrFail($id);
        
        $request->validate([
            'room_id' => [
                'required',
                'exists:rooms,room_id',
                Rule::exists('rooms', 'room_id')->where('tenant_id', $user->tenant_id)
            ],
            'day_of_week' => 'required|integer|between:1,7',
        ]);
        
        // Check if another room already has a cleaning schedule for this day
        $existingSchedule = CleaningSchedule::where('room_id', $request->room_id)
            ->where('day_of_week', $request->day_of_week)
            ->where('id', '!=', $id)
            ->first();
            
        if ($existingSchedule) {
            return back()->withErrors([
                'schedule' => 'Another room already has a cleaning schedule for this day.'
            ]);
        }
        
        $cleaningSchedule->update($request->only(['room_id', 'day_of_week']));
        
        return redirect()->route('cleaning-schedules.index')->with('success', 'Cleaning schedule updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = request()->user();
        
        $cleaningSchedule = CleaningSchedule::with('room')
            ->whereHas('room', function ($query) use ($user) {
                $query->where('tenant_id', $user->tenant_id);
            })
            ->findOrFail($id);
        
        $cleaningSchedule->delete();
        
        return redirect()->route('cleaning-schedules.index')->with('success', 'Cleaning schedule deleted successfully.');
    }
}
