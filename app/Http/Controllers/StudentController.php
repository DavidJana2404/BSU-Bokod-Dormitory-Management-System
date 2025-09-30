<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\StudentFormRequest;
use App\Models\Student;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;


class StudentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $students = Student::where('tenant_id', $user->tenant_id)
            ->notArchived()
            ->with(['bookings' => function($query) {
                $query->notArchived()->with('room');
            }]) // Eager load bookings with room details
            ->get()
            ->map($this->mapStudentData());
        return Inertia::render('students/index', [
            'students' => $students,
            'tenant_id' => $user->tenant_id,
        ]);
    }

    public function store(StudentFormRequest $request)
    {
        $user = $request->user();
        
        // Validation is handled by StudentFormRequest
        
        $data = $request->only(['first_name', 'last_name', 'email', 'phone', 'check_in_date', 'check_out_date']);
        $data['tenant_id'] = $user->tenant_id;
        
        // Hash password only if provided
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        } else {
            $data['password'] = null; // Students without passwords cannot login
        }
        
        Student::create($data);
        
        return redirect()->route('students.index')
            ->with('success', 'Student created successfully.');
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        
        // Load student with all necessary related data
        $student = Student::where('student_id', $id)
            ->where('tenant_id', $user->tenant_id)
            ->notArchived()
            ->with(['bookings' => function($query) {
                $query->notArchived()->with('room.tenant');
            }])
            ->first();
        
        // Check if student exists and belongs to the current tenant
        if (!$student) {
            return redirect()->route('students.index')
                ->with('error', 'Student not found or you do not have permission to view this student.');
        }
        
        // Map student data using the existing mapStudentData method
        $studentData = $this->mapStudentData()($student);
        
        // Add additional detailed information for the show page
        $studentData['created_at'] = $student->created_at;
        $studentData['updated_at'] = $student->updated_at;
        $studentData['all_bookings'] = $student->bookings->map(function($booking) {
            return [
                'booking_id' => $booking->booking_id,
                'room_id' => $booking->room_id,
                'room_number' => $booking->room ? $booking->room->room_number : null,
                'room_type' => $booking->room ? $booking->room->type : null,
                'dormitory_name' => $booking->room && $booking->room->tenant ? $booking->room->tenant->dormitory_name : null,
                'check_in_date' => $booking->check_in_date,
                'check_out_date' => $booking->check_out_date,
                'is_current' => $booking->check_in_date <= now() && $booking->check_out_date >= now(),
                'created_at' => $booking->created_at,
            ];
        })->sortByDesc('created_at')->values();
        
        return Inertia::render('students/show', [
            'student' => $studentData,
            'tenant_id' => $user->tenant_id,
        ]);
    }

    public function update(StudentFormRequest $request, $id)
    {
        $user = $request->user();
        $student = Student::findOrFail($id);
        
        // Validation is handled by StudentFormRequest
        
        $data = $request->only(['first_name', 'last_name', 'email', 'phone', 'check_in_date', 'check_out_date']);
        
        // Update password if provided
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }
        
        $student->update($data);
        
        return redirect()->route('students.index')
            ->with('success', 'Student updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $student = Student::findOrFail($id);
        $student->archive();
        
        return redirect()->route('students.index')
            ->with('success', 'Student archived successfully.');
    }
    
    public function restore($id)
    {
        $user = request()->user();
        $student = Student::findOrFail($id);
        $student->restore();
        return redirect()->back()->with('success', 'Student restored successfully.');
    }
    
    public function forceDelete($id)
    {
        $user = request()->user();
        $student = Student::findOrFail($id);
        $student->delete();
        return redirect()->back()->with('success', 'Student permanently deleted.');
    }
    
    /**
     * Map student data for consistent display
     */
    private function mapStudentData()
    {
        return function ($student) {
            // Get current active booking (if any)
            $currentBooking = $student->bookings->filter(function ($booking) {
                $now = now();
                return $booking->check_in_date <= $now && $booking->check_out_date >= $now;
            })->first();
            
            return [
                'student_id' => $student->student_id,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'email' => $student->email,
                'phone' => $student->phone,
                'check_in_date' => $student->check_in_date,
                'check_out_date' => $student->check_out_date,
                'payment_status' => $student->payment_status ?? 'unpaid',
                'payment_date' => $student->payment_date,
                'amount_paid' => $student->amount_paid,
                'payment_notes' => $student->payment_notes,
                'status' => $student->status ?? 'in', // Student dormitory status
                'leave_reason' => $student->leave_reason,
                'status_updated_at' => $student->status_updated_at,
                'password' => !empty($student->password), // Boolean to check if password is set
                'login_status' => !empty($student->password) ? 'enabled' : 'disabled',
                'needs_password_setup' => $student->needsPasswordSetup(), // Boolean to check if student needs password setup
                'password_status' => $student->needsPasswordSetup() ? 'needs_setup' : 'set',
                'has_booking' => $student->bookings->count() > 0, // True if student has any bookings
                'booking_count' => $student->bookings->count(), // Number of bookings
                'tenant_id' => $student->tenant_id,
                // Current booking details
                'current_booking' => $currentBooking ? [
                    'booking_id' => $currentBooking->booking_id,
                    'room_id' => $currentBooking->room_id,
                    'room_number' => $currentBooking->room ? $currentBooking->room->room_number : null,
                    'room_type' => $currentBooking->room ? $currentBooking->room->type : null,
                    'check_in_date' => $currentBooking->check_in_date,
                    'check_out_date' => $currentBooking->check_out_date,
                ] : null,
                'is_currently_booked' => $currentBooking !== null,
                // Additional status information for better UI display
                'status_display' => [
                    'dormitory' => [
                        'status' => $student->status ?? 'in',
                        'label' => ($student->status === 'on_leave') ? 'On Leave' : 'Present at Dormitory',
                        'reason' => $student->leave_reason,
                        'updated_at' => $student->status_updated_at,
                    ],
                    'login' => [
                        'status' => !empty($student->password) ? 'enabled' : 'disabled',
                        'label' => !empty($student->password) ? 'Can Login' : ($student->needsPasswordSetup() ? 'Password Setup Required' : 'No Login Access'),
                        'needs_setup' => $student->needsPasswordSetup(),
                    ],
                    'payment' => [
                        'status' => $student->payment_status ?? 'unpaid',
                        'label' => ucfirst($student->payment_status ?? 'unpaid'),
                        'amount' => $student->amount_paid,
                        'date' => $student->payment_date,
                    ],
                ],
            ];
        };
    }
}
