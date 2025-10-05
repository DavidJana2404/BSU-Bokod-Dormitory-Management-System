<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApplicationFormRequest;
use App\Models\Application;
use App\Models\Student;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ApplicationController extends Controller
{
    /**
     * Display a listing of applications for managers.
     */
    public function index()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return redirect()->route('login');
            }
            
            // Initialize empty applications array as fallback
            $applications = collect([]);
            
            try {
                // Get applications based on user role with optimized query
                $applicationsQuery = Application::select([
                    'id', 'tenant_id', 'first_name', 'last_name', 'email', 'phone', 
                    'additional_info', 'status', 'rejection_reason', 'processed_by', 
                    'processed_at', 'created_at'
                ]);
                
                if ($user->role === 'manager' && $user->tenant_id) {
                    // Manager can only see applications for their dormitory
                    $applicationsQuery->where('tenant_id', $user->tenant_id);
                }
                
                // Get applications with pagination to avoid memory issues
                $applications = $applicationsQuery
                    ->orderBy('created_at', 'desc')
                    ->limit(100) // Limit to prevent memory issues
                    ->get();
                
                // Manually load relationships to better handle errors
                $applications = $applications->map(function ($application) {
                    try {
                        // Load tenant information
                        $tenant = Tenant::select('tenant_id', 'dormitory_name')
                            ->where('tenant_id', $application->tenant_id)
                            ->first();
                            
                        // Load processed by user information  
                        $processedBy = null;
                        if ($application->processed_by) {
                            $processedBy = User::select('id', 'name')
                                ->where('id', $application->processed_by)
                                ->first();
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
            
            return Inertia::render('applications/index', [
                'applications' => $applications->values()->all(),
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Fatal error in applications index: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return safe fallback
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
            $studentCreated = false;
            
            // Use database transaction for data consistency
            \DB::transaction(function () use ($application, $user, &$student, &$studentCreated) {
                try {
                    // Check if student with this email already exists
                    $existingStudent = Student::where('email', $application->email)
                        ->whereNull('archived_at')
                        ->first();
                    
                    if ($existingStudent) {
                        throw new \Exception('A student with this email already exists in the system.');
                    }
                    
                    // Create student record WITHOUT password
                    $student = Student::create([
                        'tenant_id' => $application->tenant_id,
                        'first_name' => $application->first_name,
                        'last_name' => $application->last_name,
                        'email' => $application->email,
                        'phone' => $application->phone,
                        'password' => null, // No password - student must set one to gain access
                        'status' => 'in',
                        'payment_status' => 'unpaid',
                    ]);
                    
                    $studentCreated = true;
                    
                    // Update application status
                    $application->update([
                        'status' => 'approved',
                        'processed_by' => $user->id,
                        'processed_at' => now(),
                    ]);
                    
                    \Log::info('Application approved successfully', [
                        'application_id' => $application->id,
                        'student_id' => $student->id,
                        'processed_by' => $user->id
                    ]);
                    
                } catch (\Exception $e) {
                    \Log::error('Error in application approval transaction', [
                        'application_id' => $application->id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    throw $e; // Re-throw to trigger rollback
                }
            });
            
            // Prepare response data
            $successMessage = 'Application approved successfully! Student has been added to the system.';
            $responseData = [
                'message' => $successMessage,
                'student_id' => $student ? $student->id : null,
                'application_id' => $application->id
            ];
            
            // For Inertia.js requests, redirect back with success message
            if (request()->header('X-Inertia')) {
                return redirect()->route('applications.index')->with('success', $successMessage);
            }
            
            // For AJAX requests, return JSON
            if (request()->expectsJson()) {
                return response()->json($responseData);
            }
            
            return redirect()->route('applications.index')
                ->with('success', $successMessage . ' The student must contact administration to set up their password before they can access the system.');
                
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
            
            $successMessage = 'Application rejected successfully!';
            
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
