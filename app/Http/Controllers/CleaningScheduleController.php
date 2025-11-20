<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CleaningSchedule;
use App\Models\Room;
use App\Models\Student;
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
        
        // Get all active students for individual assignment
        $students = Student::where('tenant_id', $user->tenant_id)
            ->notArchived()
            ->with('currentBooking.room')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(function ($student) {
                $currentRoom = $student->currentRoom();
                return [
                    'student_id' => $student->student_id,
                    'first_name' => $student->first_name,
                    'last_name' => $student->last_name,
                    'room_number' => $currentRoom ? $currentRoom->room_number : null,
                ];
            });
        
        // Create a weekly schedule structure
        $weeklySchedule = [];
        for ($day = 1; $day <= 7; $day++) {
            $weeklySchedule[$day] = CleaningSchedule::with(['room', 'room.students', 'students'])
                ->where(function ($query) use ($user) {
                    $query->whereHas('room', function ($q) use ($user) {
                        $q->where('tenant_id', $user->tenant_id)->notArchived();
                    })->orWhereDoesntHave('room');
                })
                ->forDay($day)
                ->get()
                ->map(function ($schedule) {
                    $assignedStudents = [];
                    
                    if ($schedule->type === 'room' && $schedule->room) {
                        $assignedStudents = $schedule->room->students->map(function ($student) {
                            return [
                                'student_id' => $student->student_id,
                                'first_name' => $student->first_name,
                                'last_name' => $student->last_name,
                            ];
                        });
                    } elseif ($schedule->type === 'individual') {
                        $assignedStudents = $schedule->students->map(function ($student) use ($schedule) {
                            $currentRoom = $student->currentRoom();
                            return [
                                'student_id' => $student->student_id,
                                'first_name' => $student->first_name,
                                'last_name' => $student->last_name,
                                'room_number' => $currentRoom ? $currentRoom->room_number : null,
                            ];
                        });
                    }
                    
                    return [
                        'id' => $schedule->id,
                        'type' => $schedule->type,
                        'room_id' => $schedule->room_id,
                        'room_number' => $schedule->room ? $schedule->room->room_number : null,
                        'day_of_week' => $schedule->day_of_week,
                        'day_name' => $schedule->day_name,
                        'students' => $assignedStudents,
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
            'students' => $students,
            'weeklySchedule' => $weeklySchedule,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'type' => 'required|in:room,individual',
            'room_id' => [
                'required_if:type,room',
                'nullable',
                'exists:rooms,room_id',
                Rule::exists('rooms', 'room_id')->where('tenant_id', $user->tenant_id)
            ],
            'student_ids' => 'required_if:type,individual|array',
            'student_ids.*' => [
                'exists:students,student_id',
                Rule::exists('students', 'student_id')->where('tenant_id', $user->tenant_id)->whereNull('archived_at')
            ],
            'day_of_week' => 'required|integer|between:1,7',
        ]);
        
        if ($request->type === 'room') {
            // Check if this room already has a cleaning schedule for this day
            $existingSchedule = CleaningSchedule::where('room_id', $request->room_id)
                ->where('day_of_week', $request->day_of_week)
                ->where('type', 'room')
                ->first();
                
            if ($existingSchedule) {
                return back()->withErrors([
                    'schedule' => 'This room already has a cleaning schedule for this day.'
                ]);
            }
            
            CleaningSchedule::create([
                'room_id' => $request->room_id,
                'day_of_week' => $request->day_of_week,
                'type' => 'room',
            ]);
        } else {
            // Individual assignment
            $schedule = CleaningSchedule::create([
                'day_of_week' => $request->day_of_week,
                'type' => 'individual',
            ]);
            
            // Attach students
            $schedule->students()->attach($request->student_ids);
        }
        
        return redirect()->route('cleaning-schedules.index')->with('success', 'Cleaning schedule created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = $request->user();
        
        $cleaningSchedule = CleaningSchedule::with(['room', 'students'])
            ->where(function ($query) use ($user) {
                $query->whereHas('room', function ($q) use ($user) {
                    $q->where('tenant_id', $user->tenant_id);
                })->orWhereDoesntHave('room');
            })
            ->findOrFail($id);
        
        $validated = $request->validate([
            'type' => 'required|in:room,individual',
            'room_id' => [
                'required_if:type,room',
                'nullable',
                'exists:rooms,room_id',
                Rule::exists('rooms', 'room_id')->where('tenant_id', $user->tenant_id)
            ],
            'student_ids' => 'required_if:type,individual|array',
            'student_ids.*' => [
                'exists:students,student_id',
                Rule::exists('students', 'student_id')->where('tenant_id', $user->tenant_id)->whereNull('archived_at')
            ],
            'day_of_week' => 'required|integer|between:1,7',
        ]);
        
        if ($request->type === 'room') {
            // Check if another room already has a cleaning schedule for this day
            $existingSchedule = CleaningSchedule::where('room_id', $request->room_id)
                ->where('day_of_week', $request->day_of_week)
                ->where('type', 'room')
                ->where('id', '!=', $id)
                ->first();
                
            if ($existingSchedule) {
                return back()->withErrors([
                    'schedule' => 'Another room already has a cleaning schedule for this day.'
                ]);
            }
            
            $cleaningSchedule->update([
                'room_id' => $request->room_id,
                'day_of_week' => $request->day_of_week,
                'type' => 'room',
            ]);
            
            // Remove any individual student assignments
            $cleaningSchedule->students()->detach();
        } else {
            // Individual assignment
            $cleaningSchedule->update([
                'room_id' => null,
                'day_of_week' => $request->day_of_week,
                'type' => 'individual',
            ]);
            
            // Sync students
            $cleaningSchedule->students()->sync($request->student_ids);
        }
        
        return redirect()->route('cleaning-schedules.index')->with('success', 'Cleaning schedule updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = request()->user();
        
        $cleaningSchedule = CleaningSchedule::with(['room', 'students'])
            ->where(function ($query) use ($user) {
                $query->whereHas('room', function ($q) use ($user) {
                    $q->where('tenant_id', $user->tenant_id);
                })->orWhereDoesntHave('room');
            })
            ->findOrFail($id);
        
        $cleaningSchedule->delete();
        
        return redirect()->route('cleaning-schedules.index')->with('success', 'Cleaning schedule deleted successfully.');
    }
}
