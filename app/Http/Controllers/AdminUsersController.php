<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Student;
use App\Models\Tenant;
use App\Models\RegistrationSettings;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;

class AdminUsersController extends Controller
{
    public function index()
    {
        // Get all staff users (managers and cashiers)
        $staffUsers = User::whereIn('role', ['manager', 'cashier'])
            ->with('tenant')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_active' => $user->is_active,
                    'role' => $user->role,
                    'tenant' => $user->tenant ? [
                        'tenant_id' => $user->tenant->tenant_id,
                        'dormitory_name' => $user->tenant->dormitory_name,
                    ] : null,
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
                    
                    // Get dormitory information
                    $dormitory = null;
                    try {
                        if ($student->tenant_id) {
                            $tenant = $student->tenant;
                            if ($tenant) {
                                $dormitory = [
                                    'tenant_id' => $tenant->tenant_id,
                                    'dormitory_name' => $tenant->dormitory_name,
                                ];
                            }
                        }
                    } catch (\Exception $e) {
                        \Log::warning('Error loading student dormitory in AdminUsersController', [
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
                        'dormitory' => $dormitory,
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
                        'dormitory' => null,
                        'current_booking' => null,
                    ];
                }
            });

        // Get registration setting with fallback
        $registrationEnabled = true;
        
        try {
            $registrationEnabled = RegistrationSettings::isRegistrationEnabled();
        } catch (\Exception $e) {
            // Log the error but continue with default
            \Log::warning('Failed to load registration setting: ' . $e->getMessage());
        }

        return Inertia::render('admin/users/index', [
            'staffUsers' => $staffUsers,
            'students' => $students,
            'registrationEnabled' => $registrationEnabled,
        ]);
    }

    public function updateUserRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:manager,cashier',
        ]);

        $user = User::whereIn('role', ['manager', 'cashier'])->findOrFail($id);
        $oldRole = $user->role;
        
        $user->update([
            'role' => $request->role,
        ]);

        return redirect()->back()->with('success', ucfirst($oldRole) . ' role updated to ' . ucfirst($request->role) . ' successfully');
    }


    public function toggleUserActive($id)
    {
        $user = User::findOrFail($id);
        $user->is_active = !$user->is_active;
        $user->save();

        return redirect()->back()->with('success', 'User status updated successfully');
    }

    public function toggleRegistration()
    {
        try {
            // Check if table exists, if not create the setting
            $currentSetting = true; // default
            
            try {
                $currentSetting = RegistrationSettings::isRegistrationEnabled();
            } catch (\Exception $e) {
                \Log::info('Registration settings table may not exist, attempting to create default setting');
                // Table might not exist, try to create it
                try {
                    // Create the table manually if migration hasn't run
                    if (!\Schema::hasTable('registration_settings')) {
                        \Schema::create('registration_settings', function ($table) {
                            $table->id();
                            $table->string('setting_key')->unique();
                            $table->boolean('enabled')->default(true);
                            $table->string('description')->nullable();
                            $table->timestamps();
                        });
                        
                        // Insert default setting
                        \DB::table('registration_settings')->insert([
                            'setting_key' => 'registration_enabled',
                            'enabled' => true,
                            'description' => 'Allow new account registration',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                        
                        \Log::info('Created registration_settings table with default values');
                    }
                    
                    $currentSetting = RegistrationSettings::isRegistrationEnabled();
                } catch (\Exception $createException) {
                    \Log::error('Failed to create registration_settings table: ' . $createException->getMessage());
                    return redirect()->back()->with('error', 'Database error: Could not create registration settings. Please contact administrator.');
                }
            }
            
            // Toggle the setting
            $newSetting = !$currentSetting;
            $result = RegistrationSettings::setRegistrationEnabled($newSetting);
            
            if (!$result) {
                throw new \Exception('Failed to update database setting');
            }
            
            $status = $currentSetting ? 'disabled' : 'enabled';
            \Log::info("Registration toggled from {$currentSetting} to {$newSetting}");
            
            return redirect()->back()->with('success', "Account registration has been {$status}");
            
        } catch (\Exception $e) {
            \Log::error('Failed to toggle registration: ' . $e->getMessage(), [
                'exception' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Failed to update registration setting: ' . $e->getMessage());
        }
    }
}