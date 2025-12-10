<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tenant;
use App\Models\Room;
use App\Models\Booking;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class DormitoryController extends Controller
{
    public function index()
    {
        try {
            $dormitories = collect([]);
            
            try {
                $query = Tenant::select('tenant_id', 'dormitory_name', 'address', 'contact_number', 'created_at');
                
                // Only filter by archived_at if the column exists
                if (Schema::hasColumn('tenants', 'archived_at')) {
                    $query->whereNull('archived_at');
                }
                
                $dormitoriesData = $query->orderBy('created_at', 'desc')
                    ->limit(50)
                    ->get();
                
                $dormitories = $dormitoriesData->map(function ($dormitory) {
                    try {
                        // Get essential statistics with error handling
                        $totalRooms = 0;
                        $totalStudents = 0;
                        $totalBookings = 0;
                        $manager = null;
                        
                        try {
                            $roomsQuery = Room::where('tenant_id', $dormitory->tenant_id);
                            if (Schema::hasColumn('rooms', 'archived_at')) {
                                $roomsQuery->whereNull('archived_at');
                            }
                            $totalRooms = $roomsQuery->count();
                        } catch (\Exception $e) {
                            \Log::warning('Error counting rooms for dormitory', ['tenant_id' => $dormitory->tenant_id, 'error' => $e->getMessage()]);
                        }
                        
                        try {
                            $studentsQuery = \App\Models\Student::where('tenant_id', $dormitory->tenant_id);
                            if (Schema::hasColumn('students', 'archived_at')) {
                                $studentsQuery->whereNull('archived_at');
                            }
                            $totalStudents = $studentsQuery->count();
                        } catch (\Exception $e) {
                            \Log::warning('Error counting students for dormitory', ['tenant_id' => $dormitory->tenant_id, 'error' => $e->getMessage()]);
                        }
                        
                        try {
                            $bookingsQuery = Booking::where('tenant_id', $dormitory->tenant_id);
                            if (Schema::hasColumn('bookings', 'archived_at')) {
                                $bookingsQuery->whereNull('archived_at');
                            }
                            $totalBookings = $bookingsQuery->count();
                        } catch (\Exception $e) {
                            \Log::warning('Error counting bookings for dormitory', ['tenant_id' => $dormitory->tenant_id, 'error' => $e->getMessage()]);
                        }
                        
                        try {
                            $manager = \App\Models\User::select('id', 'name', 'email')
                                ->where('tenant_id', $dormitory->tenant_id)
                                ->where('role', 'manager')
                                ->first();
                        } catch (\Exception $e) {
                            \Log::warning('Error loading manager for dormitory', ['tenant_id' => $dormitory->tenant_id, 'error' => $e->getMessage()]);
                        }
                        
                        return [
                            'tenant_id' => $dormitory->tenant_id,
                            'dormitory_name' => $dormitory->dormitory_name,
                            'address' => $dormitory->address,
                            'contact_number' => $dormitory->contact_number,
                            'created_at' => $dormitory->created_at,
                            'manager' => $manager ? [
                                'id' => $manager->id,
                                'name' => $manager->name,
                                'email' => $manager->email,
                            ] : null,
                            'statistics' => [
                                'total_rooms' => $totalRooms,
                                'total_students' => $totalStudents,
                                'total_bookings' => $totalBookings,
                            ],
                        ];
                    } catch (\Exception $e) {
                        \Log::error('Error mapping dormitory data', [
                            'tenant_id' => $dormitory->tenant_id,
                            'error' => $e->getMessage()
                        ]);
                        
                        return [
                            'tenant_id' => $dormitory->tenant_id,
                            'dormitory_name' => $dormitory->dormitory_name,
                            'address' => $dormitory->address,
                            'contact_number' => $dormitory->contact_number,
                            'created_at' => $dormitory->created_at,
                            'manager' => null,
                            'statistics' => [
                                'total_rooms' => 0,
                                'total_students' => 0,
                                'total_bookings' => 0,
                            ],
                        ];
                    }
                });
            } catch (\Exception $e) {
                \Log::error('Error loading dormitories', ['error' => $e->getMessage()]);
            }
            
            return Inertia::render('dormitories', [
                'dormitories' => $dormitories->values()->all(),
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Fatal error in dormitories index', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return Inertia::render('dormitories', [
                'dormitories' => [],
                'error' => 'Unable to load dormitories. Please try again later.'
            ]);
        }
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'dormitory_name' => 'required|string|max:255',
        ]);

        // Set default address to BSU Bokod Campus
        $data['address'] = 'BSU Bokod Campus';
        
        // Set default contact as "No manager assigned"
        $data['contact_number'] = 'No manager assigned';
        
        // Create the dormitory with all required fields
        $dormitory = Tenant::create($data);

        return redirect()->route('dormitories.index');
    }

    public function update(Request $request, $id)
    {
        $dormitory = Tenant::findOrFail($id);

        $data = $request->validate([
            'dormitory_name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'contact_number' => 'required|string|max:255',
        ]);

        $dormitory->update($data);

        return redirect()->route('dormitories.index');
    }
    
    public function archive($id)
    {
        $dormitory = Tenant::findOrFail($id);
        
        // Check if archived_at column exists
        if (Schema::hasColumn('tenants', 'archived_at')) {
            $dormitory->archive();
            return redirect()->route('dormitories.index')->with('success', 'Dormitory archived successfully.');
        } else {
            // If column doesn't exist, prevent archiving
            return redirect()->route('dormitories.index')->with('error', 'Archive functionality is not available yet. Database migration pending.');
        }
    }
}
