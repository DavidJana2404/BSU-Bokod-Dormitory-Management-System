<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tenant;
use App\Models\Room;
use App\Models\Booking;
use Inertia\Inertia;

class DormitoryController extends Controller
{
    public function index()
    {
        try {
            $dormitories = collect([]);
            
            try {
                $dormitoriesData = Tenant::select('tenant_id', 'dormitory_name', 'address', 'contact_number', 'created_at')
                    ->whereNull('archived_at')
                    ->orderBy('created_at', 'desc')
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
                            $totalRooms = Room::where('tenant_id', $dormitory->tenant_id)->whereNull('archived_at')->count();
                        } catch (\Exception $e) {
                            \Log::warning('Error counting rooms for dormitory', ['tenant_id' => $dormitory->tenant_id, 'error' => $e->getMessage()]);
                        }
                        
                        try {
                            $totalStudents = \App\Models\Student::where('tenant_id', $dormitory->tenant_id)->whereNull('archived_at')->count();
                        } catch (\Exception $e) {
                            \Log::warning('Error counting students for dormitory', ['tenant_id' => $dormitory->tenant_id, 'error' => $e->getMessage()]);
                        }
                        
                        try {
                            $totalBookings = Booking::where('tenant_id', $dormitory->tenant_id)->whereNull('archived_at')->count();
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

        // Get the Boys dormitory address as default
        $boysDorm = Tenant::where('dormitory_name', 'LIKE', '%Boys%')
            ->orWhere('dormitory_name', 'LIKE', '%Boy%')
            ->first();
        
        // Set default address from Boys dorm, or use a fallback from config
        $data['address'] = $boysDorm ? $boysDorm->address : config('dormitory.default_address');
        
        // Create the dormitory first
        $dormitory = Tenant::create($data);
        
        // Get the manager for this dormitory and set contact to their email
        $manager = \App\Models\User::where('tenant_id', $dormitory->tenant_id)
            ->where('role', 'manager')
            ->first();
        
        if ($manager) {
            $dormitory->contact_number = $manager->email;
            $dormitory->save();
        } else {
            // If no manager yet, use a placeholder from config
            $dormitory->contact_number = config('dormitory.default_contact');
            $dormitory->save();
        }

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
        $dormitory->archive();
        
        return redirect()->route('dormitories.index')->with('success', 'Dormitory archived successfully.');
    }
}
