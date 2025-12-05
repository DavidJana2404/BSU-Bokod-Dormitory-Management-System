<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
// Deployment trigger: 2025-01-09 06:27:46 - Force redeploy after timeout
use App\Mail\PaymentConfirmationMail;
use App\Models\Student;
use App\Models\Tenant;
use App\Models\PaymentRecord;
use App\Models\SchoolYear;
use App\Models\CashierNotification;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CashierDashboardController extends Controller
{
    /**
     * Display the cashier dashboard with all students and their payment status
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Verify user is a cashier
        if ($user->role !== 'cashier') {
            return redirect()->route('dashboard');
        }
        
        // Get only students with active bookings (booked dormitorians)
        $students = Student::join('tenants', 'students.tenant_id', '=', 'tenants.tenant_id')
            ->join('bookings', function($join) {
                $join->on('students.student_id', '=', 'bookings.student_id')
                     ->whereNull('bookings.archived_at'); // Only get active bookings
            })
            ->leftJoin('rooms', 'bookings.room_id', '=', 'rooms.room_id')
            ->whereNull('students.archived_at') // Only get non-archived students
            ->select(
                'students.*',
                'tenants.dormitory_name',
                'rooms.room_number',
                'rooms.price_per_semester',
                'bookings.semester_count',
                'bookings.booking_id'
            )
            ->orderBy('students.payment_status')
            ->orderBy('students.first_name')
            ->get()
            ->map(function ($student) {
                // All students in this query have bookings
                $hasBooking = true;
                $semesterCount = $student->semester_count ?? 1;
                $totalFee = $semesterCount * 2000; // ₱2000 per semester
                
                return [
                    'student_id' => $student->student_id,
                    'full_name' => $student->first_name . ' ' . $student->last_name,
                    'first_name' => $student->first_name,
                    'last_name' => $student->last_name,
                    'email' => $student->email,
                    'phone' => $student->phone,
                    'dormitory_name' => $student->dormitory_name,
                    'room_number' => $student->room_number,
                    'payment_status' => $student->payment_status,
                    'payment_date' => $student->payment_date,
                    'amount_paid' => $student->amount_paid,
                    'payment_notes' => $student->payment_notes,
                    'semester_count' => $semesterCount,
                    'total_fee' => $totalFee,
                    'price_per_semester' => 2000, // Fixed price per semester
                    'tenant_id' => $student->tenant_id,
                    'booking_id' => $student->booking_id,
                    'has_booking' => $hasBooking,
                ];
            });
        
        // Get payment statistics
        $totalStudents = $students->count();
        $paidStudents = $students->where('payment_status', 'paid')->count();
        $unpaidStudents = $students->where('payment_status', 'unpaid')->count();
        $partialStudents = $students->where('payment_status', 'partial')->count();
        $totalRevenue = $students->where('payment_status', 'paid')->sum('amount_paid') + 
                       $students->where('payment_status', 'partial')->sum('amount_paid');
        
        // Get current school year
        $currentSchoolYear = SchoolYear::current();
        
        return Inertia::render('cashier/dashboard', [
            'students' => $students,
            'stats' => [
                'total_students' => $totalStudents,
                'paid_students' => $paidStudents,
                'unpaid_students' => $unpaidStudents,
                'partial_students' => $partialStudents,
                'total_revenue' => $totalRevenue,
                'payment_rate' => $totalStudents > 0 ? round(($paidStudents / $totalStudents) * 100, 2) : 0,
            ],
            'currentSchoolYear' => $currentSchoolYear ? $currentSchoolYear->year_label : null,
        ]);
    }
    
    /**
     * Update payment status for a student
     */
    public function updatePaymentStatus(Request $request, $studentId)
    {
        $user = $request->user();
        
        // Verify user is a cashier
        if ($user->role !== 'cashier') {
            return redirect()->route('dashboard')->with('error', 'Unauthorized access');
        }
        
        $request->validate([
            'payment_status' => 'required|in:unpaid,paid,partial',
            'amount_paid' => 'nullable|numeric|min:0',
            'payment_notes' => 'nullable|string|max:1000',
        ]);
        
        // Sanitize input to prevent XSS
        $paymentNotes = $request->payment_notes ? strip_tags(trim($request->payment_notes)) : null;
        
        $student = Student::findOrFail($studentId);
        
        $updateData = [
            'payment_status' => $request->payment_status,
            'payment_notes' => $paymentNotes,
        ];
        
        // Set payment date when marked as paid or partial
        if (in_array($request->payment_status, ['paid', 'partial'])) {
            $updateData['payment_date'] = now();
            $updateData['amount_paid'] = $request->amount_paid;
        } else {
            // Clear payment data when marked as unpaid
            $updateData['payment_date'] = null;
            $updateData['amount_paid'] = null;
        }
        
        $student->update($updateData);
        
        // Create payment record for history tracking
        try {
            $studentWithDetails = Student::join('tenants', 'students.tenant_id', '=', 'tenants.tenant_id')
                ->leftJoin('bookings', function($join) {
                    $join->on('students.student_id', '=', 'bookings.student_id')
                         ->whereNull('bookings.archived_at');
                })
                ->leftJoin('rooms', 'bookings.room_id', '=', 'rooms.room_id')
                ->where('students.student_id', $studentId)
                ->select(
                    'students.*',
                    'tenants.dormitory_name',
                    'rooms.room_number',
                    'bookings.semester_count'
                )
                ->first();
            
            // Get current school year
            $currentSchoolYear = \App\Models\SchoolYear::where('is_current', true)->first();
            
            PaymentRecord::create([
                'student_id' => $student->student_id,
                'processed_by_user_id' => $user->id,
                'school_year_id' => $currentSchoolYear ? $currentSchoolYear->id : null,
                'payment_status' => $request->payment_status,
                'amount_paid' => $updateData['amount_paid'] ?? null,
                'payment_notes' => $paymentNotes,
                'student_name' => $student->first_name . ' ' . $student->last_name,
                'student_email' => $student->email,
                'dormitory_name' => $studentWithDetails->dormitory_name ?? 'Unknown',
                'room_number' => $studentWithDetails->room_number,
                'semester_count' => $studentWithDetails->semester_count,
                'payment_date' => $updateData['payment_date'] ?? null,
            ]);
        } catch (\Exception $e) {
            \Log::warning('Failed to create payment record', ['error' => $e->getMessage()]);
            // Continue even if payment record creation fails
        }
        
        // Send payment confirmation email when payment status is 'paid' or 'partial'
        if (in_array($request->payment_status, ['paid', 'partial'])) {
            try {
                $dormitoryName = $studentWithDetails->dormitory_name ?? null;
                
                $paymentDetails = [
                    'amount_paid' => $updateData['amount_paid'],
                    'payment_date' => $updateData['payment_date'],
                    'payment_status' => $request->payment_status,
                    'semester_count' => $studentWithDetails->semester_count ?? null,
                    'room_number' => $studentWithDetails->room_number ?? null,
                    'payment_notes' => $paymentNotes,
                ];
                
                @Mail::to($student->email)->send(new PaymentConfirmationMail(
                    $student,
                    $paymentDetails,
                    $dormitoryName
                ));
                
                \Log::info('Payment confirmation email sent', [
                    'student_id' => $student->student_id,
                    'email' => $student->email,
                    'payment_status' => $request->payment_status
                ]);
            } catch (\Throwable $e) {
                \Log::error('Failed to send payment confirmation email', [
                    'student_id' => $student->student_id,
                    'error' => $e->getMessage()
                ]);
                // Continue regardless of email failure
            }
        }
        
        // Redirect back to the cashier dashboard with a success message
        return redirect()->route('cashier.dashboard')->with('success', 'Payment status updated successfully and confirmation email has been sent');
    }
    
    /**
     * Reset all student payment statuses for a new semester
     */
    public function resetPayments(Request $request)
    {
        $user = $request->user();
        
        // Verify user is a cashier
        if ($user->role !== 'cashier') {
            return redirect()->route('dashboard')->with('error', 'Unauthorized access');
        }
        
        try {
            // Reset all student payments
            Student::whereNull('archived_at')->update([
                'payment_status' => 'unpaid',
                'payment_date' => null,
                'amount_paid' => null,
                'payment_notes' => null,
            ]);
            
            return redirect()->route('cashier.dashboard')->with('success', 'All student payments have been reset for the new semester');
        } catch (\Exception $e) {
            \Log::error('Error resetting payments', ['error' => $e->getMessage()]);
            return redirect()->route('cashier.dashboard')->with('error', 'Failed to reset payments. Please try again.');
        }
    }
    
    /**
     * Get payment history for a specific student
     */
    public function paymentHistory(Request $request, $studentId)
    {
        $user = $request->user();
        
        // Verify user is a cashier
        if ($user->role !== 'cashier') {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }
        
        try {
            $paymentHistory = PaymentRecord::where('student_id', $studentId)
                ->with(['processedBy:id,name', 'schoolYear'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($record) {
                    return [
                        'id' => $record->id,
                        'payment_status' => $record->payment_status,
                        'amount_paid' => $record->amount_paid,
                        'payment_notes' => $record->payment_notes,
                        'payment_date' => $record->payment_date,
                        'school_year' => $record->schoolYear ? $record->schoolYear->year_label : 'N/A',
                        'processed_by' => $record->processedBy ? $record->processedBy->name : 'Unknown',
                        'created_at' => $record->created_at,
                        'archived_at' => $record->archived_at,
                    ];
                });
            
            return response()->json($paymentHistory);
        } catch (\Exception $e) {
            \Log::error('Error fetching payment history', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to fetch payment history'], 500);
        }
    }
    
    /**
     * Set the current school year
     */
    public function setSchoolYear(Request $request)
    {
        $user = $request->user();
        
        // Verify user is a cashier
        if ($user->role !== 'cashier') {
            return redirect()->route('dashboard')->with('error', 'Unauthorized access');
        }
        
        $request->validate([
            'start_year' => 'required|integer|min:2000|max:2100',
            'end_year' => 'required|integer|min:2000|max:2100|gt:start_year',
        ]);
        
        try {
            $yearLabel = $request->start_year . '-' . $request->end_year;
            
            // Check if this school year already exists
            $existingYear = SchoolYear::where('year_label', $yearLabel)->first();
            
            if ($existingYear) {
                // If it exists, just make it current
                $existingYear->makeCurrent();
            } else {
                // Create new school year
                $schoolYear = SchoolYear::create([
                    'year_label' => $yearLabel,
                    'start_year' => $request->start_year,
                    'end_year' => $request->end_year,
                    'is_current' => false,
                    'set_at' => now(),
                    'set_by_user_id' => $user->id,
                ]);
                
                // Set it as current
                $schoolYear->makeCurrent();
            }
            
            return redirect()->route('cashier.dashboard')->with('success', "School year {$yearLabel} has been set successfully");
        } catch (\Exception $e) {
            \Log::error('Error setting school year', ['error' => $e->getMessage()]);
            return redirect()->route('cashier.dashboard')->with('error', 'Failed to set school year. Please try again.');
        }
    }
    
    /**
     * Display notifications for the cashier
     */
    public function notifications(Request $request)
    {
        $user = $request->user();
        
        // Verify user is a cashier
        if ($user->role !== 'cashier') {
            return redirect()->route('dashboard');
        }
        
        // Get user's tenant from first student they have access to
        $firstStudent = Student::whereNull('archived_at')->first();
        $tenantId = $firstStudent ? $firstStudent->tenant_id : null;
        
        if (!$tenantId) {
            return Inertia::render('cashier/notifications', [
                'notifications' => [],
                'unreadCount' => 0,
            ]);
        }
        
        // Get only booking_archived notifications for this tenant
        $notifications = CashierNotification::where('tenant_id', $tenantId)
            ->where('type', 'booking_archived')
            ->with('student:student_id,first_name,last_name,email,archived_at')
            ->orderBy('is_read', 'asc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'student_id' => $notification->student_id,
                    'student_name' => $notification->student_name,
                    'message' => $notification->message,
                    'is_read' => $notification->is_read,
                    'created_at' => $notification->created_at,
                    'booked_at' => $notification->booked_at,
                    'archived_at' => $notification->archived_at,
                    'days_stayed' => $notification->days_stayed,
                    'months_stayed' => $notification->months_stayed,
                    'calculated_cost' => $notification->calculated_cost,
                    'total_semesters' => $notification->total_semesters,
                    'room_number' => $notification->room_number,
                    'student' => $notification->student ? [
                        'student_id' => $notification->student->student_id,
                        'first_name' => $notification->student->first_name,
                        'last_name' => $notification->student->last_name,
                        'email' => $notification->student->email,
                        'is_archived' => !is_null($notification->student->archived_at),
                    ] : null,
                ];
            });
        
        $unreadCount = $notifications->where('is_read', false)->count();
        
        return Inertia::render('cashier/notifications', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }
    
    /**
     * Mark a notification as read
     */
    public function markNotificationAsRead(Request $request, $notificationId)
    {
        $user = $request->user();
        
        if ($user->role !== 'cashier') {
            return redirect()->route('cashier.notifications')->with('error', 'Unauthorized');
        }
        
        try {
            $notification = CashierNotification::findOrFail($notificationId);
            $notification->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
            
            return redirect()->back();
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to mark notification as read');
        }
    }
    
    /**
     * Mark all notifications as read
     */
    public function markAllNotificationsAsRead(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'cashier') {
            return redirect()->route('cashier.notifications')->with('error', 'Unauthorized');
        }
        
        try {
            // Get user's tenant
            $firstStudent = Student::whereNull('archived_at')->first();
            $tenantId = $firstStudent ? $firstStudent->tenant_id : null;
            
            if ($tenantId) {
                CashierNotification::where('tenant_id', $tenantId)
                    ->where('is_read', false)
                    ->update([
                        'is_read' => true,
                        'read_at' => now(),
                    ]);
            }
            
            return redirect()->back()->with('success', 'All notifications marked as read');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to mark notifications as read');
        }
    }
}
