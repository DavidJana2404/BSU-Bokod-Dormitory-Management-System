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
        try {
            $user = $request->user();
            
            if (!$user) {
                return Inertia::render('students/index', [
                    'students' => [],
                    'tenant_id' => null,
                    'error' => 'Authentication required.'
                ]);
            }
            
            // Handle managers without tenant assignment
            if (!$user->tenant_id) {
                $errorMessage = $user->role === 'manager' 
                    ? 'You have not been assigned to a dormitory yet. Please contact your administrator to assign you to a dormitory so you can manage students.'
                    : 'Unable to load students. Please contact your administrator.';
                
                \Log::info('StudentController accessed by user without tenant assignment', [
                    'user_id' => $user->id,
                    'role' => $user->role,
                    'email' => $user->email
                ]);
                
                return Inertia::render('students/index', [
                    'students' => [],
                    'tenant_id' => null,
                    'error' => $errorMessage,
                    'show_assignment_notice' => $user->role === 'manager'
                ]);
            }
            
            $students = collect([]);
            
            try {
                // Get students with optimized query
                $studentsData = Student::select([
                    'student_id', 'tenant_id', 'first_name', 'last_name', 'email', 'phone',
                    'payment_status', 'payment_date', 'amount_paid', 'payment_notes',
                    'status', 'leave_reason', 'status_updated_at', 'password', 'archived_at'
                ])
                ->where('tenant_id', $user->tenant_id)
                ->whereNull('archived_at')
                ->limit(100) // Prevent memory issues
                ->get();
                
                $students = $studentsData->map(function($student) {
                    try {
                        return $this->mapStudentDataSafe($student);
                    } catch (\Exception $e) {
                        \Log::error('Error mapping student data', [
                            'student_id' => $student->student_id,
                            'error' => $e->getMessage()
                        ]);
                        
                        // Return basic student data as fallback
                        return [
                            'student_id' => $student->student_id,
                            'first_name' => $student->first_name,
                            'last_name' => $student->last_name,
                            'email' => $student->email,
                            'phone' => $student->phone,
                            'payment_status' => 'unpaid',
                            'status' => 'in',
                            'has_booking' => false,
                            'current_booking' => null,
                        ];
                    }
                });
                
            } catch (\Exception $e) {
                \Log::error('Error loading students', [
                    'user_id' => $user->id,
                    'tenant_id' => $user->tenant_id,
                    'error' => $e->getMessage()
                ]);
            }
            
            return Inertia::render('students/index', [
                'students' => $students->values()->all(),
                'tenant_id' => $user->tenant_id,
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Fatal error in students index', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return Inertia::render('students/index', [
                'students' => [],
                'tenant_id' => null,
                'error' => 'Unable to load students. Please try again later.'
            ]);
        }
    }

    public function store(StudentFormRequest $request)
    {
        $user = $request->user();
        
        // Validation is handled by StudentFormRequest
        
        $data = $request->only(['first_name', 'last_name', 'email', 'phone']);
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
        try {
            $user = $request->user();
            
            if (!$user || !$user->tenant_id) {
                return redirect()->route('students.index')
                    ->with('error', 'Unauthorized access.');
            }
            
            // Load student with error handling
            $student = null;
            try {
                $student = Student::select([
                    'student_id', 'tenant_id', 'first_name', 'last_name', 'email', 'phone',
                    'payment_status', 'payment_date', 'amount_paid', 'payment_notes',
                    'status', 'leave_reason', 'status_updated_at', 'password', 'archived_at',
                    'created_at', 'updated_at'
                ])
                ->where('student_id', $id)
                ->where('tenant_id', $user->tenant_id)
                ->whereNull('archived_at')
                ->first();
            } catch (\Exception $e) {
                \Log::error('Error loading student for show', [
                    'student_id' => $id,
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
            }
            
            // Check if student exists and belongs to the current tenant
            if (!$student) {
                return redirect()->route('students.index')
                    ->with('error', 'Student not found or you do not have permission to view this student.');
            }
            
            // Map student data safely
            $studentData = $this->mapStudentDataSafe($student);
            
            // Add additional detailed information for the show page
            $studentData['created_at'] = $student->created_at;
            $studentData['updated_at'] = $student->updated_at;
            
            // Load all bookings with error handling
            $allBookings = [];
            try {
                $bookings = $student->bookings()->whereNull('archived_at')->get();
                
                $allBookings = $bookings->map(function($booking) {
                    try {
                        return [
                            'booking_id' => $booking->booking_id,
                            'room_id' => $booking->room_id,
                            'room_number' => $booking->room ? $booking->room->room_number : 'Unknown',
                            'room_type' => $booking->room ? $booking->room->type : 'Unknown',
                            'dormitory_name' => 'Current Dormitory', // Safe fallback
                            'semester_count' => $booking->semester_count ?? 0,
                            'total_fee' => ($booking->semester_count ?? 0) * 2000,
                            'is_current' => !is_null($booking->semester_count),
                            'created_at' => $booking->created_at,
                        ];
                    } catch (\Exception $e) {
                        \Log::warning('Error mapping booking data', [
                            'booking_id' => $booking->booking_id ?? 'unknown',
                            'error' => $e->getMessage()
                        ]);
                        
                        return [
                            'booking_id' => $booking->booking_id ?? 0,
                            'room_id' => $booking->room_id ?? 0,
                            'room_number' => 'Unknown',
                            'room_type' => 'Unknown',
                            'dormitory_name' => 'Unknown',
                            'semester_count' => 0,
                            'total_fee' => 0,
                            'is_current' => false,
                            'created_at' => now(),
                        ];
                    }
                })->sortByDesc('created_at')->values()->all();
                
            } catch (\Exception $e) {
                \Log::error('Error loading student bookings', [
                    'student_id' => $student->student_id,
                    'error' => $e->getMessage()
                ]);
            }
            
            $studentData['all_bookings'] = $allBookings;
            
            return Inertia::render('students/show', [
                'student' => $studentData,
                'tenant_id' => $user->tenant_id,
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Fatal error in student show', [
                'student_id' => $id ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->route('students.index')
                ->with('error', 'Unable to load student details. Please try again later.');
        }
    }

    public function update(StudentFormRequest $request, $id)
    {
        $user = $request->user();
        $student = Student::findOrFail($id);
        
        // Validation is handled by StudentFormRequest
        
        $data = $request->only(['first_name', 'last_name', 'email', 'phone']);
        
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
     * Safely map student data with error handling
     */
    private function mapStudentDataSafe($student)
    {
        try {
            // Get current active booking with error handling
            $currentBooking = null;
            $bookingCount = 0;
            
            try {
                $bookings = $student->bookings()->whereNull('archived_at')->get();
                $currentBooking = $bookings->first();
                $bookingCount = $bookings->count();
            } catch (\Exception $e) {
                \Log::warning('Error loading student bookings', [
                    'student_id' => $student->student_id,
                    'error' => $e->getMessage()
                ]);
            }
            
            // Safe method calls with fallbacks
            $needsPasswordSetup = false;
            try {
                $needsPasswordSetup = method_exists($student, 'needsPasswordSetup') ? $student->needsPasswordSetup() : empty($student->password);
            } catch (\Exception $e) {
                \Log::warning('Error checking password setup status', [
                    'student_id' => $student->student_id,
                    'error' => $e->getMessage()
                ]);
                $needsPasswordSetup = empty($student->password);
            }
            
            return [
                'student_id' => $student->student_id,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'email' => $student->email,
                'phone' => $student->phone,
                'payment_status' => $student->payment_status ?? 'unpaid',
                'payment_date' => $student->payment_date,
                'amount_paid' => $student->amount_paid,
                'payment_notes' => $student->payment_notes,
                'status' => $student->status ?? 'in',
                'leave_reason' => $student->leave_reason,
                'status_updated_at' => $student->status_updated_at,
                'password' => !empty($student->password),
                'login_status' => !empty($student->password) ? 'enabled' : 'disabled',
                'needs_password_setup' => $needsPasswordSetup,
                'password_status' => $needsPasswordSetup ? 'needs_setup' : 'set',
                'has_booking' => $bookingCount > 0,
                'booking_count' => $bookingCount,
                'tenant_id' => $student->tenant_id,
                'current_booking' => $currentBooking ? [
                    'booking_id' => $currentBooking->booking_id,
                    'room_id' => $currentBooking->room_id,
                    'room_number' => $currentBooking->room ? $currentBooking->room->room_number : 'Unknown',
                    'room_type' => $currentBooking->room ? $currentBooking->room->type : 'Unknown',
                    'semester_count' => $currentBooking->semester_count ?? 0,
                    'total_fee' => ($currentBooking->semester_count ?? 0) * 2000,
                ] : null,
                'is_currently_booked' => $currentBooking !== null,
                'status_display' => [
                    'dormitory' => [
                        'status' => $student->status ?? 'in',
                        'label' => ($student->status === 'on_leave') ? 'On Leave' : 'Present at Dormitory',
                        'reason' => $student->leave_reason,
                        'updated_at' => $student->status_updated_at,
                    ],
                    'login' => [
                        'status' => !empty($student->password) ? 'enabled' : 'disabled',
                        'label' => !empty($student->password) ? 'Can Login' : ($needsPasswordSetup ? 'Password Setup Required' : 'No Login Access'),
                        'needs_setup' => $needsPasswordSetup,
                    ],
                    'payment' => [
                        'status' => $student->payment_status ?? 'unpaid',
                        'label' => ucfirst($student->payment_status ?? 'unpaid'),
                        'amount' => $student->amount_paid,
                        'date' => $student->payment_date,
                    ],
                ],
            ];
        } catch (\Exception $e) {
            \Log::error('Error in mapStudentDataSafe', [
                'student_id' => $student->student_id ?? 'unknown',
                'error' => $e->getMessage()
            ]);
            
            // Return minimal safe data
            return [
                'student_id' => $student->student_id ?? 0,
                'first_name' => $student->first_name ?? '',
                'last_name' => $student->last_name ?? '',
                'email' => $student->email ?? '',
                'phone' => $student->phone ?? '',
                'payment_status' => 'unpaid',
                'status' => 'in',
                'has_booking' => false,
                'current_booking' => null,
                'tenant_id' => $student->tenant_id ?? null,
            ];
        }
    }
    
    /**
     * Map student data for consistent display (legacy method)
     */
    private function mapStudentData()
    {
        return function ($student) {
            return $this->mapStudentDataSafe($student);
        };
    }
}
