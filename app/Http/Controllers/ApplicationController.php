<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApplicationFormRequest;
use App\Mail\ApplicationRejectedMail;
use App\Mail\StudentWelcomeMail;
use App\Models\Application;
use App\Models\Student;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ApplicationController extends Controller
{
    /**
     * Display a listing of applications for managers.
     */
    public function index()
    {
        // Set timeout to prevent 502 errors
        set_time_limit(30);
        
        // Log the request attempt for debugging
        \Log::info('Applications index route accessed', [
            'url' => request()->fullUrl(),
            'method' => request()->method(),
            'user_agent' => request()->userAgent(),
            'is_inertia' => request()->header('X-Inertia') ? 'yes' : 'no'
        ]);
        
        try {
            $user = Auth::user();
            
            if (!$user) {
                \Log::warning('Unauthenticated user attempting to access applications');
                return redirect()->route('login');
            }
            
            \Log::info('Authenticated user accessing applications', [
                'user_id' => $user->id,
                'user_role' => $user->role ?? 'no_role',
                'tenant_id' => $user->tenant_id ?? 'no_tenant'
            ]);
            
            // Initialize empty applications array as fallback
            $applications = collect([]);
            
            // Quick database connection test to prevent 502 errors
            try {
                \DB::connection()->getPdo();
            } catch (\Exception $dbError) {
                \Log::error('Database connection failed in applications index', [
                    'error' => $dbError->getMessage(),
                    'user_id' => $user->id
                ]);
                
                return Inertia::render('applications/index', [
                    'applications' => [],
                    'error' => 'Unable to connect to database. Please try again later.'
                ]);
            }
            
            try {
                // Get applications based on user role with optimized query
                $applicationsQuery = Application::select([
                    'id', 'tenant_id', 'first_name', 'last_name', 'email', 'phone', 
                    'additional_info', 'status', 'rejection_reason', 'processed_by', 
                    'processed_at', 'created_at'
                ]);
                
                // Only exclude archived if column exists (safety check for production)
                if (\Schema::hasColumn('applications', 'archived_at')) {
                    $applicationsQuery->notArchived();
                }
                
                // Check if user has proper role and tenant access
                if (!isset($user->role)) {
                    \Log::warning('User without role attempting to access applications', [
                        'user_id' => $user->id ?? 'unknown'
                    ]);
                    throw new \Exception('Invalid user role');
                }
                
                if ($user->role === 'manager' && $user->tenant_id) {
                    // Manager can only see applications for their dormitory
                    $applicationsQuery->where('tenant_id', $user->tenant_id);
                } elseif ($user->role === 'manager' && !$user->tenant_id) {
                    // Manager without tenant_id should see no applications
                    $applicationsQuery->where('id', -1); // This will return empty results
                }
                
                // Get applications with pagination to avoid memory issues
                $applications = $applicationsQuery
                    ->orderBy('created_at', 'desc')
                    ->limit(100) // Limit to prevent memory issues
                    ->get();
                
                // Manually load relationships to better handle errors
                $applications = $applications->map(function ($application) {
                    try {
                        // Load tenant information with error handling
                        $tenant = null;
                        try {
                            if ($application->tenant_id) {
                                $tenant = Tenant::select('tenant_id', 'dormitory_name')
                                    ->where('tenant_id', $application->tenant_id)
                                    ->first();
                            }
                        } catch (\Exception $e) {
                            \Log::warning('Error loading tenant for application', [
                                'application_id' => $application->id,
                                'tenant_id' => $application->tenant_id,
                                'error' => $e->getMessage()
                            ]);
                        }
                            
                        // Load processed by user information with error handling
                        $processedBy = null;
                        try {
                            if ($application->processed_by) {
                                $processedBy = User::select('id', 'name')
                                    ->where('id', $application->processed_by)
                                    ->first();
                            }
                        } catch (\Exception $e) {
                            \Log::warning('Error loading processed_by user for application', [
                                'application_id' => $application->id,
                                'processed_by' => $application->processed_by,
                                'error' => $e->getMessage()
                            ]);
                        }
                        
                        // Transform to array with safe fallbacks
                        return [
                            'id' => $application->id,
                            'first_name' => $application->first_name,
                            'last_name' => $application->last_name,
                            'email' => $application->email,
                            'phone' => $application->phone,
                            'additional_info' => $application->additional_info,
                            'status' => $application->status,
                            'rejection_reason' => $application->rejection_reason,
                            'created_at' => $application->created_at,
                            'processed_at' => $application->processed_at,
                            'tenant' => [
                                'dormitory_name' => $tenant ? $tenant->dormitory_name : 'Unknown Dormitory'
                            ],
                            'processed_by' => $processedBy ? [
                                'name' => $processedBy->name
                            ] : null,
                        ];
                    } catch (\Exception $e) {
                        \Log::error('Error processing application: ' . $e->getMessage(), [
                            'application_id' => $application->id ?? 'unknown',
                            'error' => $e->getMessage()
                        ]);
                        
                        // Return application with fallback values
                        return [
                            'id' => $application->id,
                            'first_name' => $application->first_name,
                            'last_name' => $application->last_name,
                            'email' => $application->email,
                            'phone' => $application->phone,
                            'additional_info' => $application->additional_info,
                            'status' => $application->status,
                            'rejection_reason' => $application->rejection_reason,
                            'created_at' => $application->created_at,
                            'processed_at' => $application->processed_at,
                            'tenant' => [
                                'dormitory_name' => 'Unknown Dormitory'
                            ],
                            'processed_by' => null,
                        ];
                    }
                });
                
            } catch (\Exception $e) {
                \Log::error('Error loading applications: ' . $e->getMessage());
                $applications = collect([]);
            }
            
            \Log::info('Applications loaded successfully', [
                'applications_count' => $applications->count(),
                'user_id' => $user->id
            ]);
            
            // Return Inertia response - let middleware handle headers
            return Inertia::render('applications/index', [
                'applications' => $applications->values()->all(),
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Fatal error in applications index: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id() ?? 'guest',
                'url' => request()->fullUrl()
            ]);
            
            // Always return proper Inertia response to prevent blank pages
            return Inertia::render('applications/index', [
                'applications' => [],
                'error' => 'Unable to load applications at this time. Please try again later.'
            ]);
        }
    }
    
    /**
     * Store a new application.
     */
    public function store(ApplicationFormRequest $request)
    {
        // Validation is handled by ApplicationFormRequest
        $validated = $request->validated();
        
        $application = Application::create($validated);
        
        // For Inertia.js, redirect to welcome page to trigger success callback
        return redirect('/');
    }
    
    /**
     * Approve an application and create a student record.
     */
    public function approve(Application $application)
    {
        try {
            // Validate application status
            if ($application->status !== 'pending') {
                \Log::warning('Attempt to approve non-pending application', [
                    'application_id' => $application->id,
                    'current_status' => $application->status
                ]);
                
                if (request()->header('X-Inertia')) {
                    return back()->with('error', 'Application has already been processed.');
                }
                if (request()->expectsJson()) {
                    return response()->json(['message' => 'Application has already been processed.'], 422);
                }
                return redirect()->route('applications.index')->with('error', 'Application has already been processed.');
            }
            
            $user = Auth::user();
            
            // Ensure user is authenticated and has a role
            if (!$user || !isset($user->role)) {
                \Log::error('Unauthorized approval attempt', [
                    'application_id' => $application->id,
                    'user_id' => $user ? $user->id : 'null',
                    'user_role' => $user ? $user->role ?? 'null' : 'null'
                ]);
                
                if (request()->header('X-Inertia')) {
                    return back()->with('error', 'You must be logged in to process applications.');
                }
                if (request()->expectsJson()) {
                    return response()->json(['message' => 'You must be logged in to process applications.'], 401);
                }
                return redirect()->route('applications.index')->with('error', 'You must be logged in to process applications.');
            }
            
            // Check if manager has permission to approve this application
            if ($user->role === 'manager' && isset($user->tenant_id) && $user->tenant_id !== $application->tenant_id) {
                \Log::warning('Manager attempted to approve application outside their dormitory', [
                    'user_id' => $user->id,
                    'user_tenant_id' => $user->tenant_id,
                    'application_tenant_id' => $application->tenant_id,
                    'application_id' => $application->id
                ]);
                
                if (request()->header('X-Inertia')) {
                    return back()->with('error', 'You do not have permission to process this application.');
                }
                if (request()->expectsJson()) {
                    return response()->json(['message' => 'You do not have permission to process this application.'], 403);
                }
                return redirect()->route('applications.index')->with('error', 'You do not have permission to process this application.');
            }
            
            // Initialize variables
            $student = null;
            
            // Log BEFORE any changes
            Log::info('BEFORE APPROVAL - Application state', [
                'application_id' => $application->id,
                'current_status' => $application->status,
                'email' => $application->email,
                'tenant_id' => $application->tenant_id,
            ]);
            
            // Check if student with this email already exists (active)
            $existingActiveStudent = Student::where('email', $application->email)
                ->whereNull('archived_at')
                ->first();
            
            if ($existingActiveStudent) {
                throw new \Exception('A student with this email already exists in the system.');
            }
            
            // Check if there's an archived student from a previous approval
            $archivedStudent = Student::where('email', $application->email)
                ->whereNotNull('archived_at')
                ->first();
            
            // Use database transaction to ensure everything is atomic
            DB::beginTransaction();
            
            try {
                // If there's an archived student, restore it instead of creating a new one
                if ($archivedStudent) {
                    // Restore the archived student
                    $archivedStudent->update([
                        'archived_at' => null,
                        'status' => 'in',
                        'payment_status' => 'unpaid',
                    ]);
                    $student = $archivedStudent;
                    
                    Log::info('Archived student restored', [
                        'student_id' => $student->student_id,
                        'email' => $student->email,
                    ]);
                } else {
                    // Create new student record with default password
                    $student = Student::create([
                        'tenant_id' => $application->tenant_id,
                        'first_name' => $application->first_name,
                        'last_name' => $application->last_name,
                        'email' => $application->email,
                        'phone' => $application->phone,
                        'password' => Hash::make('Password123'), // Default password: Password123
                        'status' => 'in',
                        'payment_status' => 'unpaid',
                    ]);
                    
                    Log::info('New student created successfully', [
                        'student_id' => $student->student_id,
                        'email' => $student->email,
                    ]);
                }
                
                // Update application status using update method
                $application->update([
                    'status' => 'approved',
                    'processed_by' => $user->id,
                    'processed_at' => now(),
                ]);
                
                Log::info('Application updated successfully', [
                    'application_id' => $application->id,
                    'new_status' => 'approved',
                    'processed_by' => $user->id,
                ]);
                
                // Commit the transaction
                DB::commit();
                
                // Force refresh from database to verify
                $application->refresh();
                
                Log::info('AFTER COMMIT - Application state verified', [
                    'application_id' => $application->id,
                    'status_after_refresh' => $application->status,
                    'processed_by' => $application->processed_by,
                    'processed_at' => $application->processed_at,
                ]);
                
                if ($application->status !== 'approved') {
                    throw new \Exception('Application status update failed! Status after commit: ' . $application->status);
                }
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Transaction failed', [
                    'application_id' => $application->id,
                    'error' => $e->getMessage()
                ]);
                throw $e;
            }
            
            // Send welcome email to the approved student
            try {
                // Get dormitory name for the email
                $dormitoryName = null;
                if ($application->tenant_id) {
                    $tenant = Tenant::find($application->tenant_id);
                    $dormitoryName = $tenant ? $tenant->dormitory_name : null;
                }
                
                @Mail::to($student->email)->send(new StudentWelcomeMail($student, $dormitoryName));
                
                Log::info('Welcome email sent to approved student', [
                    'student_id' => $student->student_id,
                    'email' => $student->email,
                    'application_id' => $application->id
                ]);
            } catch (\Throwable $e) {
                Log::error('Failed to send welcome email to approved student', [
                    'student_id' => $student->student_id,
                    'application_id' => $application->id,
                    'error' => $e->getMessage()
                ]);
                // Continue regardless of email failure
            }
            
            // Prepare response data
            $successMessage = 'Application approved successfully! Student has been added to the system with default password "Password123" and welcome email has been sent.';
            $responseData = [
                'message' => $successMessage,
                'student_id' => $student ? $student->student_id : null,
                'application_id' => $application->id
            ];
            
            // For Inertia.js requests, redirect to applications index
            if (request()->header('X-Inertia')) {
                return redirect()->route('applications.index')->with('success', $successMessage);
            }
            
            // For AJAX requests, return JSON
            if (request()->expectsJson()) {
                return response()->json($responseData);
            }
            
            return redirect()->route('applications.index')
                ->with('success', $successMessage);
                
        } catch (\Exception $e) {
            \Log::error('Fatal error in application approval', [
                'application_id' => $application->id ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $errorMessage = 'Failed to approve application. Please try again.';
            
            // Handle specific errors
            if (str_contains($e->getMessage(), 'email already exists')) {
                $errorMessage = 'Cannot approve: A student with this email already exists in the system.';
            } elseif (str_contains($e->getMessage(), 'tenant_id')) {
                $errorMessage = 'Invalid dormitory. Please contact system administrator.';
            }
            
            if (request()->header('X-Inertia')) {
                return back()->with('error', $errorMessage);
            }
            if (request()->expectsJson()) {
                return response()->json(['message' => $errorMessage], 500);
            }
            return redirect()->route('applications.index')->with('error', $errorMessage);
        }
    }
    
    /**
     * Reject an application.
     */
    public function reject(Request $request, Application $application)
    {
        try {
            // Validate application status
            if ($application->status !== 'pending') {
                \Log::warning('Attempt to reject non-pending application', [
                    'application_id' => $application->id,
                    'current_status' => $application->status
                ]);
                
                if (request()->header('X-Inertia')) {
                    return back()->with('error', 'Application has already been processed.');
                }
                if (request()->expectsJson()) {
                    return response()->json(['message' => 'Application has already been processed.'], 422);
                }
                return redirect()->route('applications.index')->with('error', 'Application has already been processed.');
            }
            
            $user = Auth::user();
            
            // Ensure user is authenticated and has a role
            if (!$user || !isset($user->role)) {
                \Log::error('Unauthorized rejection attempt', [
                    'application_id' => $application->id,
                    'user_id' => $user ? $user->id : 'null',
                    'user_role' => $user ? $user->role ?? 'null' : 'null'
                ]);
                
                if (request()->header('X-Inertia')) {
                    return back()->with('error', 'You must be logged in to process applications.');
                }
                if (request()->expectsJson()) {
                    return response()->json(['message' => 'You must be logged in to process applications.'], 401);
                }
                return redirect()->route('applications.index')->with('error', 'You must be logged in to process applications.');
            }
            
            // Check if manager has permission to reject this application
            if ($user->role === 'manager' && isset($user->tenant_id) && $user->tenant_id !== $application->tenant_id) {
                \Log::warning('Manager attempted to reject application outside their dormitory', [
                    'user_id' => $user->id,
                    'user_tenant_id' => $user->tenant_id,
                    'application_tenant_id' => $application->tenant_id,
                    'application_id' => $application->id
                ]);
                
                if (request()->header('X-Inertia')) {
                    return back()->with('error', 'You do not have permission to process this application.');
                }
                if (request()->expectsJson()) {
                    return response()->json(['message' => 'You do not have permission to process this application.'], 403);
                }
                return redirect()->route('applications.index')->with('error', 'You do not have permission to process this application.');
            }
            
            // Validate rejection reason
            $validated = [];
            try {
                $validated = $request->validate([
                    'rejection_reason' => 'required|string|max:1000',
                ]);
            } catch (\Illuminate\Validation\ValidationException $e) {
                \Log::warning('Invalid rejection reason provided', [
                    'application_id' => $application->id,
                    'validation_errors' => $e->errors()
                ]);
                
                if (request()->header('X-Inertia')) {
                    return back()
                        ->withErrors($e->errors())
                        ->with('error', 'Please provide a valid rejection reason.');
                }
                if (request()->expectsJson()) {
                    return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
                }
                throw $e;
            }
            
            // Use database transaction for consistency
            DB::transaction(function () use ($application, $user, $validated) {
                $application->update([
                    'status' => 'rejected',
                    'rejection_reason' => $validated['rejection_reason'],
                    'processed_by' => $user->id,
                    'processed_at' => now(),
                ]);
                
                \Log::info('Application rejected successfully', [
                    'application_id' => $application->id,
                    'processed_by' => $user->id,
                    'rejection_reason' => substr($validated['rejection_reason'], 0, 100) // Log first 100 chars
                ]);
            });
            
            // Send rejection email to the applicant
            try {
                // Get dormitory name for the email
                $dormitoryName = null;
                if ($application->tenant_id) {
                    $tenant = Tenant::find($application->tenant_id);
                    $dormitoryName = $tenant ? $tenant->dormitory_name : null;
                }
                
                @Mail::to($application->email)->send(new ApplicationRejectedMail(
                    $application,
                    $validated['rejection_reason'],
                    $dormitoryName
                ));
                
                Log::info('Rejection email sent to applicant', [
                    'application_id' => $application->id,
                    'email' => $application->email
                ]);
            } catch (\Throwable $e) {
                Log::error('Failed to send rejection email', [
                    'application_id' => $application->id,
                    'error' => $e->getMessage()
                ]);
                // Continue regardless of email failure
            }
            
            $successMessage = 'Application rejected successfully! Rejection email has been sent to the applicant.';
            
            // For Inertia.js requests, redirect back with success message
            if (request()->header('X-Inertia')) {
                return redirect()->route('applications.index')->with('success', $successMessage);
            }
            
            // For AJAX requests, return JSON
            if (request()->expectsJson()) {
                return response()->json([
                    'message' => $successMessage,
                    'application_id' => $application->id
                ]);
            }
            
            return redirect()->route('applications.index')->with('success', $successMessage);
            
        } catch (\Exception $e) {
            \Log::error('Fatal error in application rejection', [
                'application_id' => $application->id ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $errorMessage = 'Failed to reject application. Please try again.';
            
            if (request()->header('X-Inertia')) {
                return back()->with('error', $errorMessage);
            }
            if (request()->expectsJson()) {
                return response()->json(['message' => $errorMessage], 500);
            }
            return redirect()->route('applications.index')->with('error', $errorMessage);
        }
    }
    
    /**
     * Restore an application back to pending status.
     */
    public function restore(Application $application)
    {
        try {
            // Validate application status - can only restore approved or rejected applications
            if ($application->status === 'pending') {
                \Log::warning('Attempt to restore already pending application', [
                    'application_id' => $application->id,
                    'current_status' => $application->status
                ]);
                
                if (request()->header('X-Inertia')) {
                    return back()->with('error', 'Application is already pending.');
                }
                if (request()->expectsJson()) {
                    return response()->json(['message' => 'Application is already pending.'], 422);
                }
                return redirect()->route('applications.index')->with('error', 'Application is already pending.');
            }
            
            $user = Auth::user();
            
            // Ensure user is authenticated and has a role
            if (!$user || !isset($user->role)) {
                \Log::error('Unauthorized restore attempt', [
                    'application_id' => $application->id,
                    'user_id' => $user ? $user->id : 'null',
                    'user_role' => $user ? $user->role ?? 'null' : 'null'
                ]);
                
                if (request()->header('X-Inertia')) {
                    return back()->with('error', 'You must be logged in to restore applications.');
                }
                if (request()->expectsJson()) {
                    return response()->json(['message' => 'You must be logged in to restore applications.'], 401);
                }
                return redirect()->route('applications.index')->with('error', 'You must be logged in to restore applications.');
            }
            
            // Check if manager has permission to restore this application
            if ($user->role === 'manager' && isset($user->tenant_id) && $user->tenant_id !== $application->tenant_id) {
                \Log::warning('Manager attempted to restore application outside their dormitory', [
                    'user_id' => $user->id,
                    'user_tenant_id' => $user->tenant_id,
                    'application_tenant_id' => $application->tenant_id,
                    'application_id' => $application->id
                ]);
                
                if (request()->header('X-Inertia')) {
                    return back()->with('error', 'You do not have permission to restore this application.');
                }
                if (request()->expectsJson()) {
                    return response()->json(['message' => 'You do not have permission to restore this application.'], 403);
                }
                return redirect()->route('applications.index')->with('error', 'You do not have permission to restore this application.');
            }
            
            // Store original status for logging
            $originalStatus = $application->status;
            
            // Use database transaction for consistency
            try {
                DB::beginTransaction();
                
                // If this was an approved application, we need to handle the student record
                if ($application->status === 'approved') {
                    // Find and remove the student record that was created during approval
                    $student = Student::where('email', $application->email)
                        ->where('tenant_id', $application->tenant_id)
                        ->whereNull('archived_at')
                        ->first();
                    
                    if ($student) {
                        // Soft delete the student record
                        $student->update(['archived_at' => now()]);
                        
                        Log::info('Student record archived during application restore', [
                            'student_id' => $student->student_id,
                            'application_id' => $application->id,
                            'restored_by' => $user->id
                        ]);
                    } else {
                        Log::warning('No student record found to archive during restore', [
                            'application_id' => $application->id,
                            'email' => $application->email
                        ]);
                    }
                }
                
                // Reset application to pending status
                $application->update([
                    'status' => 'pending',
                    'rejection_reason' => null,
                    'processed_by' => null,
                    'processed_at' => null,
                ]);
                
                DB::commit();
                
                Log::info('Application restored to pending status', [
                    'application_id' => $application->id,
                    'original_status' => $originalStatus,
                    'restored_by' => $user->id
                ]);
            } catch (\Exception $transactionError) {
                DB::rollBack();
                Log::error('Transaction error in application restore', [
                    'application_id' => $application->id,
                    'error' => $transactionError->getMessage(),
                    'trace' => $transactionError->getTraceAsString()
                ]);
                throw $transactionError;
            }
            
            $successMessage = "Application restored to pending status successfully!";
            
            // For Inertia.js requests, redirect back with success message
            if (request()->header('X-Inertia')) {
                return redirect()->route('applications.index')->with('success', $successMessage);
            }
            
            // For AJAX requests, return JSON
            if (request()->expectsJson()) {
                return response()->json([
                    'message' => $successMessage,
                    'application_id' => $application->id
                ]);
            }
            
            return redirect()->route('applications.index')->with('success', $successMessage);
            
        } catch (\Exception $e) {
            \Log::error('Fatal error in application restore', [
                'application_id' => $application->id ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $errorMessage = 'Failed to restore application. Please try again.';
            
            if (request()->header('X-Inertia')) {
                return back()->with('error', $errorMessage);
            }
            if (request()->expectsJson()) {
                return response()->json(['message' => $errorMessage], 500);
            }
            return redirect()->route('applications.index')->with('error', $errorMessage);
        }
    }
    
    /**
     * Archive an application.
     */
    public function archive(Request $request, $id)
    {
        try {
            $user = $request->user();
            $application = Application::findOrFail($id);
            
            // Check if manager has permission
            if ($user->role === 'manager' && $user->tenant_id !== $application->tenant_id) {
                \Log::warning('Unauthorized archive attempt', [
                    'user_id' => $user->id,
                    'application_id' => $id
                ]);
                
                if (request()->header('X-Inertia')) {
                    return back()->with('error', 'Unauthorized action.');
                }
                return redirect()->back()->with('error', 'Unauthorized action.');
            }
            
            $application->archive();
            
            \Log::info('Application archived', [
                'application_id' => $id,
                'archived_by' => $user->id
            ]);
            
            if (request()->header('X-Inertia')) {
                return redirect()->route('applications.index')
                    ->with('success', 'Application archived successfully.');
            }
            
            return redirect()->route('applications.index')
                ->with('success', 'Application archived successfully.');
                
        } catch (\Exception $e) {
            \Log::error('Error archiving application', [
                'application_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            if (request()->header('X-Inertia')) {
                return back()->with('error', 'Failed to archive application. Please try again.');
            }
            
            return redirect()->back()->with('error', 'Failed to archive application. Please try again.');
        }
    }
    
    /**
     * Restore an archived application.
     */
    public function restoreArchived($id)
    {
        $user = request()->user();
        $application = Application::findOrFail($id);
        
        // Check if manager has permission
        if ($user->role === 'manager' && $user->tenant_id !== $application->tenant_id) {
            return redirect()->back()->with('error', 'Unauthorized action.');
        }
        
        $application->restore();
        
        return redirect()->back()->with('success', 'Application restored successfully.');
    }
    
    /**
     * Permanently delete an application.
     */
    public function forceDelete($id)
    {
        $user = request()->user();
        $application = Application::findOrFail($id);
        
        // Check if manager has permission
        if ($user->role === 'manager' && $user->tenant_id !== $application->tenant_id) {
            return redirect()->back()->with('error', 'Unauthorized action.');
        }
        
        $application->forceDelete();
        
        return redirect()->back()->with('success', 'Application permanently deleted.');
    }
    
    /**
     * Get dormitories for application form.
     */
    public function getDormitories()
    {
        $dormitories = Tenant::select('tenant_id', 'dormitory_name')
            ->orderBy('dormitory_name')
            ->get();
            
        return response()->json($dormitories);
    }
}
