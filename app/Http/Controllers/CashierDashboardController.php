<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Tenant;
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
        
        // Get all students with their payment status and dormitory information
        $students = Student::join('tenants', 'students.tenant_id', '=', 'tenants.tenant_id')
            ->leftJoin('bookings', 'students.student_id', '=', 'bookings.student_id')
            ->leftJoin('rooms', 'bookings.room_id', '=', 'rooms.room_id')
            ->select(
                'students.*',
                'tenants.dormitory_name',
                'rooms.room_number',
                'rooms.price_per_semester',
                DB::raw('CONCAT(students.first_name, " ", students.last_name) as full_name')
            )
            ->orderBy('students.payment_status')
            ->orderBy('students.first_name')
            ->get()
            ->map(function ($student) {
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
                    'price_per_semester' => $student->price_per_semester,
                    'tenant_id' => $student->tenant_id,
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
        
        // Redirect back to the cashier dashboard with a success message
        return redirect()->route('cashier.dashboard')->with('success', 'Payment status updated successfully');
    }
}
