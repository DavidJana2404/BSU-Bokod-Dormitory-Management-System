<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApplicationFormRequest;
use App\Models\Application;
use App\Models\Student;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ApplicationController extends Controller
{
    /**
     * Display a listing of applications for managers.
     */
    public function index()
    {
        $user = Auth::user();
        
        // Get applications based on user role
        $applicationsQuery = Application::with(['tenant', 'processedBy']);
        
        if ($user->role === 'manager' && $user->tenant_id) {
            // Manager can only see applications for their dormitory
            $applicationsQuery->where('tenant_id', $user->tenant_id);
        }
        
        $applications = $applicationsQuery->orderBy('created_at', 'desc')->get();
        
        return Inertia::render('applications/index', [
            'applications' => $applications,
        ]);
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
        if ($application->status !== 'pending') {
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
            if (request()->header('X-Inertia')) {
                return back()->with('error', 'You do not have permission to process this application.');
            }
            if (request()->expectsJson()) {
                return response()->json(['message' => 'You do not have permission to process this application.'], 403);
            }
            return redirect()->route('applications.index')->with('error', 'You do not have permission to process this application.');
        }
        
        try {
            // Create student record WITHOUT password - student must set one to gain access
            $student = Student::create([
                'tenant_id' => $application->tenant_id,
                'first_name' => $application->first_name,
                'last_name' => $application->last_name,
                'email' => $application->email,
                'phone' => $application->phone,
                'password' => null, // No password - student cannot log in until password is set
                'status' => 'in',
                'payment_status' => 'unpaid',
            ]);
            
            // Update application status
            $application->update([
                'status' => 'approved',
                'processed_by' => $user->id,
                'processed_at' => now(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to approve application: ' . $e->getMessage());
            
            if (request()->header('X-Inertia')) {
                return back()->with('error', 'Failed to approve application. Please try again.');
            }
            if (request()->expectsJson()) {
                return response()->json(['message' => 'Failed to approve application. Please try again.'], 500);
            }
            return redirect()->route('applications.index')->with('error', 'Failed to approve application. Please try again.');
        }
        
        // For Inertia.js requests, redirect back with success message
        if (request()->header('X-Inertia')) {
            return redirect()->route('applications.index')->with('success', 'Application approved successfully! Student has been added to the system.');
        }
        
        // For AJAX requests, return JSON
        if (request()->expectsJson()) {
            return response()->json([
                'message' => 'Application approved successfully! Student has been added to the system.',
                'student_id' => $student->id
            ]);
        }
        
        return redirect()->route('applications.index')->with('success', 'Application approved successfully! Student has been added to the system. The student must contact administration to set up their password before they can access the system.');
    }
    
    /**
     * Reject an application.
     */
    public function reject(Request $request, Application $application)
    {
        if ($application->status !== 'pending') {
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
            if (request()->header('X-Inertia')) {
                return back()->with('error', 'You do not have permission to process this application.');
            }
            if (request()->expectsJson()) {
                return response()->json(['message' => 'You do not have permission to process this application.'], 403);
            }
            return redirect()->route('applications.index')->with('error', 'You do not have permission to process this application.');
        }
        
        try {
            $validated = $request->validate([
                'rejection_reason' => 'required|string|max:1000',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
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
        
        try {
            // Update application status
            $application->update([
                'status' => 'rejected',
                'rejection_reason' => $validated['rejection_reason'],
                'processed_by' => $user->id,
                'processed_at' => now(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to reject application: ' . $e->getMessage());
            
            if (request()->header('X-Inertia')) {
                return back()->with('error', 'Failed to reject application. Please try again.');
            }
            if (request()->expectsJson()) {
                return response()->json(['message' => 'Failed to reject application. Please try again.'], 500);
            }
            return redirect()->route('applications.index')->with('error', 'Failed to reject application. Please try again.');
        }
        
        // For Inertia.js requests, redirect back with success message
        if (request()->header('X-Inertia')) {
            return redirect()->route('applications.index')->with('success', 'Application rejected successfully!');
        }
        
        // For AJAX requests, return JSON
        if (request()->expectsJson()) {
            return response()->json([
                'message' => 'Application rejected successfully.'
            ]);
        }
        
        return redirect()->route('applications.index')->with('success', 'Application rejected successfully.');
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
