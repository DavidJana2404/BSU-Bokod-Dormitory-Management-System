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

        // Get registration setting with fallback (cache-based)
        $registrationEnabled = cache('registration_enabled', true); // default enabled
        
        // Try to get from database as backup
        try {
            if (\Schema::hasTable('registration_settings')) {
                $dbSetting = \DB::table('registration_settings')
                    ->where('setting_key', 'registration_enabled')
                    ->value('enabled');
                if ($dbSetting !== null) {
                    $registrationEnabled = (bool) $dbSetting;
                    // Update cache with database value
                    cache(['registration_enabled' => $registrationEnabled], now()->addYear());
                }
            }
        } catch (\Exception $e) {
            \Log::warning('Could not load registration setting from database, using cache: ' . $e->getMessage());
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
        \Log::info('Toggle registration method called');
        
        try {
            // Use a simple cache-based approach first
            $cacheKey = 'registration_enabled';
            $currentSetting = cache($cacheKey, true); // default enabled
            
            \Log::info('Current registration setting from cache: ' . ($currentSetting ? 'enabled' : 'disabled'));
            
            // Toggle the setting
            $newSetting = !$currentSetting;
            
            // Store in cache (expires in 1 year)
            cache([$cacheKey => $newSetting], now()->addYear());
            
            \Log::info('New registration setting stored in cache: ' . ($newSetting ? 'enabled' : 'disabled'));
            
            // Try to also store in database if possible
            try {
                if (!\Schema::hasTable('registration_settings')) {
                    \Log::info('Creating registration_settings table');
                    \Schema::create('registration_settings', function ($table) {
                        $table->id();
                        $table->string('setting_key')->unique();
                        $table->boolean('enabled')->default(true);
                        $table->string('description')->nullable();
                        $table->timestamps();
                    });
                }
                
                // Insert or update the setting
                \DB::table('registration_settings')->updateOrInsert(
                    ['setting_key' => 'registration_enabled'],
                    [
                        'enabled' => $newSetting,
                        'description' => 'Allow new account registration',
                        'updated_at' => now()
                    ]
                );
                
                \Log::info('Registration setting updated in database');
            } catch (\Exception $dbError) {
                \Log::warning('Could not update database, using cache only: ' . $dbError->getMessage());
            }
            
            $status = $currentSetting ? 'disabled' : 'enabled';
            \Log::info("Registration successfully toggled to: {$status}");
            
            return redirect()->back()->with('success', "Account registration has been {$status}!");
            
        } catch (\Exception $e) {
            \Log::error('Failed to toggle registration: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update registration setting: ' . $e->getMessage());
        }
    }
    
    public function storeStudent(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:students,email',
            'phone' => 'required|string|max:20',
            'password' => 'nullable|min:8|confirmed',
        ]);
        
        try {
            $studentData = [
                'student_id' => 'STU' . now()->format('YmdHis') . rand(100, 999),
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => $validated['password'] ? Hash::make($validated['password']) : null,
                'status' => 'in',
                'payment_status' => 'unpaid',
            ];
            
            Student::create($studentData);
            
            return redirect()->back()->with('success', 'Student created successfully');
        } catch (\Exception $e) {
            \Log::error('Failed to create student: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to create student: ' . $e->getMessage());
        }
    }
    
    public function updateStudent(Request $request, $id)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:students,email,' . $id . ',student_id',
            'phone' => 'required|string|max:20',
            'password' => 'nullable|min:8|confirmed',
        ]);
        
        try {
            $student = Student::where('student_id', $id)->firstOrFail();
            
            $updateData = [
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
            ];
            
            // Only update password if provided
            if (!empty($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }
            
            $student->update($updateData);
            
            return redirect()->back()->with('success', 'Student updated successfully');
        } catch (\Exception $e) {
            \Log::error('Failed to update student: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update student: ' . $e->getMessage());
        }
    }
    
    public function archiveStudent($id)
    {
        try {
            $student = Student::where('student_id', $id)->firstOrFail();
            
            // Soft delete the student (archive)
            $student->update(['archived_at' => now()]);
            
            return redirect()->back()->with('success', 'Student archived successfully');
        } catch (\Exception $e) {
            \Log::error('Failed to archive student: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to archive student: ' . $e->getMessage());
        }
    }
    
    public function archiveUser($id)
    {
        try {
            $user = User::whereIn('role', ['manager', 'cashier'])->findOrFail($id);
            
            // Check if user is admin (cannot archive admin)
            if ($user->role === 'admin') {
                return redirect()->back()->with('error', 'Cannot archive admin users');
            }
            
            // Soft delete the user (archive)
            $user->delete(); // Uses SoftDeletes which sets archived_at
            
            return redirect()->back()->with('success', ucfirst($user->role) . ' archived successfully');
        } catch (\Exception $e) {
            \Log::error('Failed to archive user: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to archive user: ' . $e->getMessage());
        }
    }
}
