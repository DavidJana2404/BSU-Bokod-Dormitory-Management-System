<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PaymentRecord;
use Inertia\Inertia;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class PaymentRecordsController extends Controller
{
    /**
     * Display payment records
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Verify user is a cashier
        if ($user->role !== 'cashier') {
            return redirect()->route('dashboard');
        }
        
        // Check if payment_records table exists
        if (!Schema::hasTable('payment_records')) {
            return Inertia::render('cashier/records', [
                'records' => [],
                'error' => 'Payment records table not found. Please run migrations.',
            ]);
        }
        
        try {
            $records = PaymentRecord::with('processedBy')
                ->notArchived()
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($record) {
                    return [
                        'id' => $record->id,
                        'student_id' => $record->student_id,
                        'student_name' => $record->student_name,
                        'student_email' => $record->student_email,
                        'dormitory_name' => $record->dormitory_name,
                        'room_number' => $record->room_number,
                        'payment_status' => $record->payment_status,
                        'amount_paid' => $record->amount_paid,
                        'payment_notes' => $record->payment_notes,
                        'semester_count' => $record->semester_count,
                        'payment_date' => $record->payment_date,
                        'processed_by' => $record->processedBy ? $record->processedBy->name : 'Unknown',
                        'created_at' => $record->created_at,
                    ];
                });
        } catch (\Exception $e) {
            return Inertia::render('cashier/records', [
                'records' => [],
                'error' => 'Unable to fetch payment records: ' . $e->getMessage(),
            ]);
        }
        
        return Inertia::render('cashier/records', [
            'records' => $records,
        ]);
    }
    
    /**
     * Archive a payment record
     */
    public function archive($id)
    {
        $record = PaymentRecord::findOrFail($id);
        $record->archive();
        
        return redirect()->route('cashier.records')->with('success', 'Payment record archived successfully');
    }
    
    /**
     * Display archived payment records
     */
    public function archived(Request $request)
    {
        $user = $request->user();
        
        // Verify user is a cashier
        if ($user->role !== 'cashier') {
            return redirect()->route('dashboard');
        }
        
        // Check if payment_records table exists
        if (!Schema::hasTable('payment_records')) {
            return Inertia::render('cashier/archived-records', [
                'records' => [],
                'error' => 'Payment records table not found. Please run migrations.',
            ]);
        }
        
        try {
            $records = PaymentRecord::with('processedBy')
                ->archived()
                ->orderBy('archived_at', 'desc')
                ->get()
                ->map(function ($record) {
                    return [
                        'id' => $record->id,
                        'student_id' => $record->student_id,
                        'student_name' => $record->student_name,
                        'student_email' => $record->student_email,
                        'dormitory_name' => $record->dormitory_name,
                        'room_number' => $record->room_number,
                        'payment_status' => $record->payment_status,
                        'amount_paid' => $record->amount_paid,
                        'payment_notes' => $record->payment_notes,
                        'semester_count' => $record->semester_count,
                        'payment_date' => $record->payment_date,
                        'processed_by' => $record->processedBy ? $record->processedBy->name : 'Unknown',
                        'archived_at' => $record->archived_at,
                        'created_at' => $record->created_at,
                    ];
                });
        } catch (\Exception $e) {
            return Inertia::render('cashier/archived-records', [
                'records' => [],
                'error' => 'Unable to fetch archived records: ' . $e->getMessage(),
            ]);
        }
        
        return Inertia::render('cashier/archived-records', [
            'records' => $records,
        ]);
    }
    
    /**
     * Restore an archived payment record
     */
    public function restore($id)
    {
        $record = PaymentRecord::findOrFail($id);
        $record->restore();
        
        return redirect()->route('cashier.archived-records')->with('success', 'Payment record restored successfully');
    }
}
