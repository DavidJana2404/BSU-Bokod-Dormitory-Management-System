<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\StudentFormRequest;
use App\Mail\PasswordSetupMail;
use App\Mail\StudentWelcomeMail;
use App\Models\Student;
use App\Models\Tenant;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;


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
                    ? 'You have not been assigned to a dormitory yet. Please contact your administrator to assign you to a dormitory so you can manage dormitorians.'
                    : 'Unable to load dormitorians. Please contact your administrator.';
                
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
                // Simplified query with basic error handling
                $studentsData = Student::select([
                    'student_id', 'tenant_id', 'first_name', 'last_name', 'email', 'phone',
                    'payment_status', 'payment_date', 'amount_paid', 'payment_notes',
                    'status', 'leave_reason', 'status_updated_at', 'password', 'archived_at'
                ])
                ->where('tenant_id', $user->tenant_id)
                ->whereNull('archived_at')
                ->orderBy('first_name')
                ->limit(100) // Prevent memory issues
                ->get();
                
                $students = $studentsData->map(function($student) {
                    // Simplified data mapping to prevent errors
                    return $this->mapStudentDataSimple($student);
                });
                
            } catch (\Exception $e) {
                \Log::error('Error loading students', [
                    'user_id' => $user->id,
                    'tenant_id' => $user->tenant_id,
                    'error' => $e->getMessage()
                ]);
                
                // Return empty array if database fails
                $students = collect([]);
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
                'error' => 'Unable to load dormitorians. Please try again later.'
            ]);
        }
    }

    public function store(StudentFormRequest $request)
    {
        $user = $request->user();
        
        // Validation is handled by StudentFormRequest
        
        $data = $request->only(['first_name', 'last_name', 'email', 'phone', 'parent_name', 'parent_phone', 'parent_relationship']);
        $data['tenant_id'] = $user->tenant_id;
        
        // Hash password - use provided password or default to Password123
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        } else {
            $data['password'] = Hash::make('Password123'); // Default password: Password123
        }
        
        $student = Student::create($data);
        
        // Get dormitory info for email
        $dormitoryName = null;
        if ($user->tenant_id) {
            $tenant = Tenant::find($user->tenant_id);
            $dormitoryName = $tenant ? $tenant->dormitory_name : null;
        }
        
        // Send email immediately - wrapped in try-catch to prevent failures
        try {
            @Mail::to($student->email)->send(new StudentWelcomeMail($student, $dormitoryName));
            \Log::info('Welcome email sent to manually added student', [
                'student_id' => $student->student_id,
                'email' => $student->email
            ]);
        } catch (\Throwable $e) {
            \Log::error('Failed to send welcome email to manually added student', [
                'student_id' => $student->student_id,
                'error' => $e->getMessage()
            ]);
            // Continue regardless of email failure
        }
        
        return redirect()->route('students.index')
            ->with('success', 'Dormitorian created successfully. Welcome email will be sent shortly.');
    }

    public function show(Request $request, $id)
    {
        try {
            $user = $request->user();
            
            if (!$user || !$user->tenant_id) {
                return redirect()->route('students.index')
                    ->with('error', 'Unauthorized access.');
            }
            
            // Load student with simplified query
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
            
            // Check if student exists and belongs to the current tenant
            if (!$student) {
                return redirect()->route('students.index')
                    ->with('error', 'Dormitorian not found or you do not have permission to view this dormitorian.');
            }
            
            // Use simplified data mapping
            $studentData = $this->mapStudentDataSimple($student);
            
            // Add additional detailed information for the show page
            $studentData['created_at'] = $student->created_at;
            $studentData['updated_at'] = $student->updated_at;
            
            // Load all bookings with simplified error handling
            $allBookings = [];
            try {
                $bookings = $student->bookings()->whereNull('archived_at')->orderBy('created_at', 'desc')->get();
                
                $allBookings = $bookings->map(function($booking) {
                    return [
                        'booking_id' => $booking->booking_id,
                        'room_id' => $booking->room_id,
                        'room_number' => $booking->room ? $booking->room->room_number : 'Unknown',
                        'room_type' => $booking->room ? $booking->room->type : 'Unknown',
                        'dormitory_name' => 'Current Dormitory',
                        'semester_count' => $booking->semester_count ?? 1,
                        'total_fee' => ($booking->semester_count ?? 1) * 2000,
                        'is_current' => true,
                        'created_at' => $booking->created_at,
                    ];
                })->values()->all();
                
            } catch (\Exception $e) {
                \Log::warning('Error loading student bookings for show', [
                    'student_id' => $student->student_id,
                    'error' => $e->getMessage()
                ]);
                $allBookings = [];
            }
            
            $studentData['all_bookings'] = $allBookings;
            
            return Inertia::render('students/show', [
                'student' => $studentData,
                'tenant_id' => $user->tenant_id,
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Fatal error in student show', [
                'student_id' => $id ?? 'unknown',
                'error' => $e->getMessage()
            ]);
            
            return redirect()->route('students.index')
                ->with('error', 'Unable to load dormitorian details. Please try again later.');
        }
    }

    public function update(StudentFormRequest $request, $id)
    {
        $user = $request->user();
        $student = Student::findOrFail($id);
        
        // Validation is handled by StudentFormRequest
        
        $data = $request->only(['first_name', 'last_name', 'email', 'phone', 'parent_name', 'parent_phone', 'parent_relationship']);
        
        // Track if password was set up (student previously had no password)
        $wasPasswordSetup = false;
        $plainPassword = null;
        
        // Update password if provided
        if ($request->filled('password')) {
            // Check if student previously had no password
            $wasPasswordSetup = empty($student->password);
            $plainPassword = $request->password;
            $data['password'] = Hash::make($request->password);
        }
        
        $student->update($data);
        
        // Send password setup email if password was just set up for the first time
        if ($wasPasswordSetup && $plainPassword) {
            try {
                $student->refresh();
                $loginUrl = route('login');
                
                @Mail::to($student->email)->send(new PasswordSetupMail($student, $plainPassword, $loginUrl));
                
                \Log::info('Password setup email sent to student', [
                    'student_id' => $student->student_id,
                    'email' => $student->email
                ]);
            } catch (\Throwable $e) {
                \Log::error('Failed to send password setup email', [
                    'student_id' => $student->student_id,
                    'error' => $e->getMessage()
                ]);
                // Continue regardless of email failure
            }
        }
        
        return redirect()->route('students.index')
            ->with('success', 'Dormitorian updated successfully. ' . ($wasPasswordSetup ? 'Password setup email will be sent shortly.' : ''));
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $student = Student::findOrFail($id);
        $student->archive();
        
        return redirect()->route('students.index')
            ->with('success', 'Dormitorian archived successfully.');
    }
    
    public function restore($id)
    {
        $user = request()->user();
        $student = Student::findOrFail($id);
        $student->restore();
        return redirect()->back()->with('success', 'Dormitorian restored successfully.');
    }
    
    public function forceDelete($id)
    {
        $user = request()->user();
        $student = Student::findOrFail($id);
        $student->delete();
        return redirect()->back()->with('success', 'Dormitorian permanently deleted.');
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
     * Simplified student data mapping to prevent errors
     */
    private function mapStudentDataSimple($student)
    {
        // Basic data mapping without complex relationships
        $hasPassword = !empty($student->password);
        
        // Simple booking check without complex queries
        $isCurrentlyBooked = false;
        $currentBooking = null;
        
        try {
            // Simple booking check
            $booking = $student->bookings()->whereNull('archived_at')->first();
            if ($booking) {
                $isCurrentlyBooked = true;
                $currentBooking = [
                    'booking_id' => $booking->booking_id,
                    'room_id' => $booking->room_id,
                    'room_number' => $booking->room ? $booking->room->room_number : 'Unknown',
                    'room_type' => $booking->room ? $booking->room->type : 'Unknown',
                    'semester_count' => $booking->semester_count ?? 1,
                    'total_fee' => ($booking->semester_count ?? 1) * 2000,
                ];
            }
        } catch (\Exception $e) {
            // If booking query fails, just continue without it
            \Log::warning('Failed to load booking for student', [
                'student_id' => $student->student_id,
                'error' => $e->getMessage()
            ]);
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
            'password' => $hasPassword,
            'tenant_id' => $student->tenant_id,
            'current_booking' => $currentBooking,
            'is_currently_booked' => $isCurrentlyBooked,
        ];
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
