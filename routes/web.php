<?php

use Illuminate\Support\Facades\Route;
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
    Route::resource('/bookings', BookingController::class)->except(['create', 'edit']);
    
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
