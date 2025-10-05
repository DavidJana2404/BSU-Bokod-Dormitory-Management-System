<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Room;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user || !$user->tenant_id) {
                return Inertia::render('rooms/index', [
                    'rooms' => [],
                    'tenant_id' => null,
                    'error' => 'Unable to load rooms. Please try again later.'
                ]);
            }
            
            $rooms = [];
            try {
                $rooms = Room::select(['room_id', 'tenant_id', 'room_number', 'type', 'price_per_semester', 'status', 'max_capacity'])
                    ->where('tenant_id', $user->tenant_id)
                    ->whereNull('archived_at')
                    ->limit(100)
                    ->get();
            } catch (\Exception $e) {
                \Log::error('Error loading rooms', [
                    'user_id' => $user->id,
                    'tenant_id' => $user->tenant_id,
                    'error' => $e->getMessage()
                ]);
            }
            
            return Inertia::render('rooms/index', [
                'rooms' => $rooms,
                'tenant_id' => $user->tenant_id
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Fatal error in rooms index', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return Inertia::render('rooms/index', [
                'rooms' => [],
                'tenant_id' => null,
                'error' => 'Unable to load rooms. Please try again later.'
            ]);
        }
    }

    public function store(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user || !$user->tenant_id) {
                return redirect()->route('rooms.index')->with('error', 'Unauthorized access.');
            }
            
            $data = $request->all();
            $data['tenant_id'] = $user->tenant_id;
            
            Room::create($data);
            
            return redirect()->route('rooms.index')->with('success', 'Room created successfully.');
            
        } catch (\Exception $e) {
            \Log::error('Error creating room', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);
            
            return redirect()->route('rooms.index')->with('error', 'Failed to create room. Please try again.');
        }
    }

    public function show($id)
    {
        return response()->json(Room::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $room = Room::findOrFail($id);
        $room->update($request->all());
        $rooms = Room::where('tenant_id', $user->tenant_id)->notArchived()->get();
        return Inertia::render('rooms/index', [
            'rooms' => $rooms,
            'tenant_id' => $user->tenant_id
        ]);
    }

    public function destroy($id)
    {
        $user = request()->user();
        $room = Room::findOrFail($id);
        $room->archive();
        $rooms = Room::where('tenant_id', $user->tenant_id)->notArchived()->get();
        return Inertia::render('rooms/index', [
            'rooms' => $rooms,
            'tenant_id' => $user->tenant_id
        ]);
    }
    
    public function restore($id)
    {
        $user = request()->user();
        $room = Room::findOrFail($id);
        $room->restore();
        return redirect()->back()->with('success', 'Room restored successfully.');
    }
    
    public function forceDelete($id)
    {
        $user = request()->user();
        $room = Room::findOrFail($id);
        $room->delete();
        return redirect()->back()->with('success', 'Room permanently deleted.');
    }
}
