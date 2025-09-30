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
        $dormitories = Tenant::with('manager')
            ->notArchived()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($dormitory) {
                // Get essential statistics
                $totalRooms = Room::where('tenant_id', $dormitory->tenant_id)->count();
                $totalStudents = \App\Models\Student::where('tenant_id', $dormitory->tenant_id)->count();
                $totalBookings = Booking::where('tenant_id', $dormitory->tenant_id)->count();
                
                return [
                    'tenant_id' => $dormitory->tenant_id,
                    'dormitory_name' => $dormitory->dormitory_name,
                    'address' => $dormitory->address,
                    'contact_number' => $dormitory->contact_number,
                    'created_at' => $dormitory->created_at,
                    'manager' => $dormitory->manager ? [
                        'id' => $dormitory->manager->id,
                        'name' => $dormitory->manager->name,
                        'email' => $dormitory->manager->email,
                    ] : null,
                    'statistics' => [
                        'total_rooms' => $totalRooms,
                        'total_students' => $totalStudents,
                        'total_bookings' => $totalBookings,
                    ],
                ];
            });
        
        return Inertia::render('dormitories', [
            'dormitories' => $dormitories,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'dormitory_name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'contact_number' => 'required|string|max:255',
        ]);

        Tenant::create($data);

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
