<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\CleaningSchedule;
use App\Models\CleaningReport;
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
            ->with(['bookings' => function ($query) {
                $query->whereNull('archived_at')->with('room');
            }])
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
    
    /**
     * Display cleaning reports for managers
     */
    public function reports(Request $request)
    {
        $user = $request->user();
        
        \Log::info('Fetching reports for manager', [
            'user_id' => $user->id,
            'tenant_id' => $user->tenant_id
        ]);
        
        try {
            $reports = CleaningReport::with(['student.bookings.room', 'reportedBy', 'cleaningSchedule.room'])
                ->forTenant($user->tenant_id)
                ->orderBy('created_at', 'desc') // newest first
                ->get();
            
            \Log::info('Raw reports fetched', [
                'count' => $reports->count(),
                'reports' => $reports->toArray()
            ]);
            
            $mappedReports = $reports->map(function ($report) {
                // Determine room number or schedule type
                $roomNumber = 'General';
                if ($report->cleaningSchedule) {
                    if ($report->cleaningSchedule->room) {
                        $roomNumber = $report->cleaningSchedule->room->room_number;
                    } elseif ($report->cleaningSchedule->type === 'individual') {
                        $roomNumber = 'Individual Schedule';
                    }
                } elseif ($report->student && $report->student->bookings && $report->student->bookings->first() && $report->student->bookings->first()->room) {
                    // Try to get room from student's booking
                    $roomNumber = $report->student->bookings->first()->room->room_number;
                }
                
                return [
                    'id' => $report->id,
                    'student' => [
                        'student_id' => $report->student->student_id,
                        'first_name' => $report->student->first_name,
                        'last_name' => $report->student->last_name,
                    ],
                    'reported_by' => [
                        'student_id' => $report->reportedBy->student_id,
                        'first_name' => $report->reportedBy->first_name,
                        'last_name' => $report->reportedBy->last_name,
                    ],
                    'room_number' => $roomNumber,
                    'scheduled_date' => $report->scheduled_date->format('Y-m-d'),
                    'reason' => $report->reason,
                    'status' => $report->status,
                    'manager_notes' => $report->manager_notes,
                    'resolved_at' => $report->resolved_at ? $report->resolved_at->format('Y-m-d H:i') : null,
                    'created_at' => $report->created_at->format('Y-m-d H:i'),
                ];
            });
            
            \Log::info('Mapped reports', [
                'count' => $mappedReports->count(),
                'reports' => $mappedReports->toArray()
            ]);
            
            return Inertia::render('cleaning-schedules/reports', [
                'reports' => $mappedReports,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching reports', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return Inertia::render('cleaning-schedules/reports', [
                'reports' => [],
            ]);
        }
    }
    
    /**
     * Update report status (resolve/dismiss)
     */
    public function updateReportStatus(Request $request, $id)
    {
        $user = $request->user();
        
        $report = CleaningReport::forTenant($user->tenant_id)->findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:resolved,dismissed',
            'manager_notes' => 'nullable|string|max:1000',
        ]);
        
        if ($validated['status'] === 'resolved') {
            $report->markAsResolved($validated['manager_notes'] ?? null);
        } else {
            $report->dismiss($validated['manager_notes'] ?? null);
        }
        
        return back()->with('success', 'Report updated successfully.');
    }
    
    /**
     * Store a new cleaning report from a student
     */
    public function storeReport(Request $request)
    {
        $student = Auth::guard('student')->user();
        
        if (!$student) {
            return back()->withErrors(['error' => 'Unauthorized access']);
        }
        
        $validated = $request->validate([
            'cleaning_schedule_id' => 'nullable|exists:cleaning_schedules,id',
            'student_id' => 'required|exists:students,student_id',
            'scheduled_date' => 'required|date',
            'reason' => 'nullable|string|max:500',
        ]);
        
        // Verify the cleaning schedule exists and belongs to this tenant (if provided)
        if (!empty($validated['cleaning_schedule_id'])) {
            $cleaningSchedule = CleaningSchedule::find($validated['cleaning_schedule_id']);
            if ($cleaningSchedule && $cleaningSchedule->room && $cleaningSchedule->room->tenant_id !== $student->tenant_id) {
                return back()->withErrors(['error' => 'Invalid cleaning schedule']);
            }
        }
        
        CleaningReport::create([
            'cleaning_schedule_id' => $validated['cleaning_schedule_id'] ?: null,
            'student_id' => $validated['student_id'],
            'reported_by_student_id' => $student->student_id,
            'tenant_id' => $student->tenant_id,
            'scheduled_date' => $validated['scheduled_date'],
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);
        
        return back()->with('success', 'Report submitted successfully. The manager will review it.');
    }
    
    /**
     * Delete a cleaning report
     */
    public function deleteReport($id)
    {
        $user = request()->user();
        
        $report = CleaningReport::forTenant($user->tenant_id)->findOrFail($id);
        $report->delete();
        
        return back()->with('success', 'Report deleted successfully.');
    }
}
