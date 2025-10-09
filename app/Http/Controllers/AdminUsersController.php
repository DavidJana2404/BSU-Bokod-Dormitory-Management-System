<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Student;
use App\Models\Tenant;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class AdminUsersController extends Controller
{
    public function index()
    {
        // Get all managers
        $managers = User::where('role', 'manager')
            ->with('tenant')
            ->get()
            ->map(function ($manager) {
                return [
                    'id' => $manager->id,
                    'name' => $manager->name,
                    'email' => $manager->email,
                    'is_active' => $manager->is_active,
                    'role' => $manager->role,
                    'tenant' => $manager->tenant ? [
                        'tenant_id' => $manager->tenant->tenant_id,
                        'dormitory_name' => $manager->tenant->dormitory_name,
                    ] : null,
                ];
            });

        // Get all cashiers
        $cashiers = User::where('role', 'cashier')
            ->get()
            ->map(function ($cashier) {
                return [
                    'id' => $cashier->id,
                    'name' => $cashier->name,
                    'email' => $cashier->email,
                    'is_active' => $cashier->is_active,
                    'role' => $cashier->role,
                ];
            });

        // Get all students with their related data
        $students = Student::whereNull('archived_at')
            ->get()
            ->map(function ($student) {
                try {
                    // Get current active booking with error handling
                    $currentBooking = null;
                    $isCurrentlyBooked = false;
                    
                    try {
                        $bookings = $student->bookings()->whereNull('archived_at')->get();
                        $currentBooking = $bookings->first();
                        $isCurrentlyBooked = $currentBooking !== null;
                    } catch (\Exception $e) {
                        \Log::warning('Error loading student bookings in AdminUsersController', [
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
                        'password' => $student->password ? true : false, // Only return boolean for security
                        'status' => $student->status ?? 'in',
                        'leave_reason' => $student->leave_reason,
                        'payment_status' => $student->payment_status ?? 'unpaid',
                        'is_currently_booked' => $isCurrentlyBooked,
                        'current_booking' => $currentBooking ? [
                            'room_number' => $currentBooking->room ? $currentBooking->room->room_number : 'Unknown',
                            'semester_count' => $currentBooking->semester_count ?? 0,
                            'total_fee' => ($currentBooking->semester_count ?? 0) * 2000,
                        ] : null,
                    ];
                } catch (\Exception $e) {
                    \Log::error('Error mapping student data in AdminUsersController', [
                        'student_id' => $student->student_id ?? 'unknown',
                        'error' => $e->getMessage()
                    ]);
                    
                    // Return basic student data as fallback
                    return [
                        'student_id' => $student->student_id,
                        'first_name' => $student->first_name,
                        'last_name' => $student->last_name,
                        'email' => $student->email,
                        'phone' => $student->phone,
                        'password' => $student->password ? true : false,
                        'status' => $student->status ?? 'in',
                        'leave_reason' => $student->leave_reason,
                        'payment_status' => $student->payment_status ?? 'unpaid',
                        'is_currently_booked' => false,
                        'current_booking' => null,
                    ];
                }
            });

        return Inertia::render('admin/users/index', [
            'managers' => $managers,
            'cashiers' => $cashiers,
            'students' => $students,
        ]);
    }

    public function updateManager(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
        ]);

        $manager = User::where('role', 'manager')->findOrFail($id);
        
        $manager->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        return redirect()->back()->with('success', 'Manager updated successfully');
    }

    public function updateCashier(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
        ]);

        $cashier = User::where('role', 'cashier')->findOrFail($id);
        
        $cashier->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        return redirect()->back()->with('success', 'Cashier updated successfully');
    }

    public function updateStudent(Request $request, $studentId)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:students,email,' . $studentId . ',student_id',
            'phone' => 'required|string|max:255',
            'password' => 'nullable|confirmed|' . Rules\Password::defaults(),
        ]);

        $student = Student::where('student_id', $studentId)->firstOrFail();
        
        $updateData = [
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
        ];

        // Only update password if provided
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $student->update($updateData);

        return redirect()->back()->with('success', 'Student updated successfully');
    }

    public function toggleUserActive($id)
    {
        $user = User::findOrFail($id);
        $user->is_active = !$user->is_active;
        $user->save();

        return redirect()->back()->with('success', 'User status updated successfully');
    }
}