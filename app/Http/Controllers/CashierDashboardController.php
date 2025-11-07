<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
// Deployment trigger: 2025-01-09 06:27:46 - Force redeploy after timeout
use App\Mail\PaymentConfirmationMail;
use App\Models\Student;
use App\Models\Tenant;
use App\Models\PaymentRecord;
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
        
        // Get all students with their payment status, dormitory information, and semester-based booking details
        $students = Student::join('tenants', 'students.tenant_id', '=', 'tenants.tenant_id')
            ->leftJoin('bookings', function($join) {
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
                'bookings.booking_id',
                DB::raw("CONCAT(students.first_name, ' ', students.last_name) as full_name")
            )
            ->orderBy('students.payment_status')
            ->orderBy('students.first_name')
            ->get()
            ->map(function ($student) {
                // Only calculate fees for students who actually have bookings
                $hasBooking = !is_null($student->booking_id);
                $semesterCount = $hasBooking ? ($student->semester_count ?? 1) : null;
                $totalFee = $hasBooking ? ($semesterCount * 2000) : null; // ₱2000 per semester
                
                return [
                    'student_id' => $student->student_id,
                    'full_name' => $student->full_name,
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
        
        return Inertia::render('cashier/dashboard', [
            'students' => $students,
            'stats' => [
                'total_students' => $totalStudents,
                'paid_students' => $paidStudents,
                'unpaid_students' => $unpaidStudents,
                'partial_students' => $partialStudents,
                'total_revenue' => $totalRevenue,
                'payment_rate' => $totalStudents > 0 ? round(($paidStudents / $totalStudents) * 100, 2) : 0,
            ]
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
            
            PaymentRecord::create([
                'student_id' => $student->student_id,
                'processed_by_user_id' => $user->id,
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
}
