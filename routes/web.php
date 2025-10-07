<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DormitoryController;
use App\Http\Controllers\AssignManagerController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\StudentDashboardController;
use App\Http\Controllers\CashierDashboardController;
use App\Http\Controllers\StudentStatusController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\CleaningScheduleController;
use App\Http\Controllers\AdminSetupController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Health check endpoint for deployment services
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
        'app' => config('app.name')
    ]);
});

// Temporary admin setup endpoints (remove after setting up first admin)
Route::post('/setup/promote-first-user', [AdminSetupController::class, 'promoteFirstUserToAdmin'])->name('setup.promote-first-user');
Route::post('/setup/promote-user', [AdminSetupController::class, 'promoteUserByEmail'])->name('setup.promote-user');

// Emergency database fix endpoint (remove after fixing production)
// Deployment trigger: 2025-01-07 02:09:35 - Fix routing issues

// Simple health check for debugging 502 issues
Route::get('/health-check', function () {
    return response()->json([
        'status' => 'OK',
        'timestamp' => now()->toISOString(),
        'method' => request()->method(),
        'path' => request()->path(),
        'url' => request()->url(),
        'laravel_version' => app()->version(),
        'php_version' => PHP_VERSION
    ]);
});
Route::get('/fix-booking-schema', function () {
    try {
        // Log the fix attempt
        \Log::info('Database schema fix endpoint accessed');
        
        // Check if semester_count column exists
        $hasColumn = \Schema::hasColumn('bookings', 'semester_count');
        
        \Log::info('Schema check result', ['has_semester_count_column' => $hasColumn]);
        
        if (!$hasColumn) {
            \Log::info('Attempting to fix schema - running migration');
            
            try {
                // Try to add the column directly if migration fails
                \DB::statement('ALTER TABLE bookings ADD COLUMN semester_count INTEGER DEFAULT 1');
                
                \Log::info('Added semester_count column directly via SQL');
                
                return response()->json([
                    'status' => 'success',
                    'message' => 'Database schema fixed - semester_count column added to bookings table via direct SQL',
                    'method' => 'direct_sql'
                ]);
            } catch (\Exception $directException) {
                \Log::warning('Direct SQL failed, trying migration approach', ['error' => $directException->getMessage()]);
                
                // Fallback to migration approach
                try {
                    \Artisan::call('migrate:rollback', ['--step' => 1]);
                    $rollbackOutput = \Artisan::output();
                    \Artisan::call('migrate');
                    $migrateOutput = \Artisan::output();
                    
                    \Log::info('Migration approach completed');
                    
                    return response()->json([
                        'status' => 'success',
                        'message' => 'Database schema fixed via migration rollback and re-run',
                        'method' => 'migration',
                        'rollback_output' => $rollbackOutput,
                        'migrate_output' => $migrateOutput
                    ]);
                } catch (\Exception $migrationException) {
                    \Log::error('Both direct SQL and migration failed', [
                        'direct_error' => $directException->getMessage(),
                        'migration_error' => $migrationException->getMessage()
                    ]);
                    
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Both direct SQL and migration approaches failed',
                        'direct_error' => $directException->getMessage(),
                        'migration_error' => $migrationException->getMessage()
                    ], 500);
                }
            }
        } else {
            return response()->json([
                'status' => 'already_fixed',
                'message' => 'Database schema is already correct - semester_count column exists',
            ]);
        }
    } catch (\Exception $e) {
        \Log::error('Schema fix endpoint failed', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to fix database schema: ' . $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
})->name('fix.booking.schema');

// Debug endpoint for troubleshooting (remove in production)
Route::get('/debug-info', function () {
    try {
        // Test database connection
        $dbStatus = 'connected';
        $applicationCount = 0;
        $tenantCount = 0;
        
        try {
            \DB::connection()->getPdo();
            $applicationCount = \App\Models\Application::count();
            $tenantCount = \App\Models\Tenant::count();
        } catch (\Exception $e) {
            $dbStatus = 'error: ' . $e->getMessage();
        }
        
        return response()->json([
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'app_env' => config('app.env'),
            'app_debug' => config('app.debug'),
            'app_key_set' => !empty(config('app.key')),
            'database' => [
                'connection' => config('database.default'),
                'host' => config('database.connections.' . config('database.default') . '.host'),
                'database' => config('database.connections.' . config('database.default') . '.database'),
                'status' => $dbStatus,
                'application_count' => $applicationCount,
                'tenant_count' => $tenantCount,
            ],
            'storage_writable' => is_writable(storage_path()),
            'cache_writable' => is_writable(storage_path('framework/cache')),
            'logs_writable' => is_writable(storage_path('logs')),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Debug endpoint failed',
            'message' => $e->getMessage()
        ], 500);
    }
});

// Application routes - public routes for submitting applications
Route::post('/applications', [ApplicationController::class, 'store'])->name('applications.store');
Route::get('/api/dormitories', [ApplicationController::class, 'getDormitories'])->name('api.dormitories');

// Student initial password setup - public routes for students without passwords
Route::get('/student/setup-password', [App\Http\Controllers\Student\InitialPasswordController::class, 'create'])->name('student.setup-password');
Route::post('/student/setup-password', [App\Http\Controllers\Student\InitialPasswordController::class, 'store'])->name('student.setup-password.store');
Route::post('/api/student/check', [App\Http\Controllers\Student\InitialPasswordController::class, 'checkStudent'])->name('api.student.check');


// Student routes - require the student guard authentication
Route::middleware(['auth:student', 'ensure.student.guard'])->group(function () {
    Route::get('student/dashboard', [StudentDashboardController::class, 'index'])->name('student.dashboard');
    Route::put('student/status', [StudentStatusController::class, 'updateStatus'])->name('student.status.update')->middleware('throttle:6,1');
});

// Cashier routes - require auth and cashier role
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('cashier/dashboard', [CashierDashboardController::class, 'index'])->name('cashier.dashboard')->middleware('throttle:60,1');
    Route::put('cashier/students/{student}/payment', [CashierDashboardController::class, 'updatePaymentStatus'])->name('cashier.students.payment.update')->middleware('throttle:10,1');
});

// Admin/Manager routes - require both auth and verification
Route::middleware(['auth', 'verified', 'ensure.user.role'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('dormitories', DormitoryController::class)->only(['index', 'store', 'update']);
    Route::post('dormitories/{dormitory}/archive', [DormitoryController::class, 'archive'])->name('dormitories.archive');
    Route::get('/assign-manager', [AssignManagerController::class, 'index'])->name('assign-manager');
    Route::post('/assign-manager/{manager}/assign', [AssignManagerController::class, 'assign'])->name('assign-manager.assign');
    Route::post('/assign-manager/{manager}/unassign', [AssignManagerController::class, 'unassign'])->name('assign-manager.unassign');
    Route::post('/users/{id}/toggle-active', [AssignManagerController::class, 'toggleActive'])->name('users.toggleActive');
    Route::resource('rooms', RoomController::class)->except(['create', 'edit']);
    Route::resource('students', StudentController::class)->except(['create', 'edit']);
    // Booking routes with error handling
    Route::post('/bookings', function(Request $request) {
        try {
            $controller = new BookingController();
            return $controller->store($request);
        } catch (\Exception $e) {
            \Log::emergency('Booking creation crashed with 502 error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Server error occurred while creating booking.',
                    'error' => $e->getMessage()
                ], 500);
            }
            
            return back()->withErrors(['error' => 'Server error: ' . $e->getMessage()])->withInput();
        }
    })->name('bookings.store');
    
    Route::delete('/bookings/{booking}', function(Request $request, $booking) {
        try {
            $controller = new BookingController();
            return $controller->destroy($request, $booking);
        } catch (\Exception $e) {
            \Log::emergency('Booking deletion crashed with 502 error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'booking_id' => $booking
            ]);
            
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Server error occurred while deleting booking.',
                    'error' => $e->getMessage()
                ], 500);
            }
            
            return back()->withErrors(['error' => 'Server error: ' . $e->getMessage()]);
        }
    })->name('bookings.destroy');
    
    // Other booking routes
    Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
    Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');
    Route::put('/bookings/{booking}', [BookingController::class, 'update'])->name('bookings.update');
    Route::patch('/bookings/{booking}', [BookingController::class, 'update']);
    Route::post('/bookings/{booking}/restore', [BookingController::class, 'restore'])->name('bookings.restore');
    Route::delete('/bookings/{booking}/force', [BookingController::class, 'forceDelete'])->name('bookings.force-delete');
    
    // Application management routes
    Route::get('/applications', [ApplicationController::class, 'index'])->name('applications.index');
    Route::put('/applications/{application}/approve', [ApplicationController::class, 'approve'])->name('applications.approve');
    Route::put('/applications/{application}/reject', [ApplicationController::class, 'reject'])->name('applications.reject');
    // Redirect GET requests to approval/rejection URLs to applications index
    Route::get('/applications/{application}/approve', function($application) {
        return redirect()->route('applications.index')->with('error', 'Invalid request method. Please use the application interface to approve applications.');
    });
    Route::get('/applications/{application}/reject', function($application) {
        return redirect()->route('applications.index')->with('error', 'Invalid request method. Please use the application interface to reject applications.');
    });
    
    // Cleaning schedules routes
    Route::resource('/cleaning-schedules', CleaningScheduleController::class)->except(['create', 'edit', 'show']);
});

require __DIR__.'/settings.php';
require __DIR__.'/student-settings.php';
require __DIR__.'/auth.php';
