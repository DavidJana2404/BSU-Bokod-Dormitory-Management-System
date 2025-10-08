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
            // Test database connection first
            try {
                \DB::connection()->getPdo();
            } catch (\Exception $dbException) {
                \Log::error('Database connection failed in RoomController', [
                    'error' => $dbException->getMessage()
                ]);
                
                return Inertia::render('rooms/index', [
                    'rooms' => [],
                    'tenant_id' => null,
                    'error' => 'Unable to connect to database. Please try again later.'
                ]);
            }
            
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
                // Check if rooms table exists and has required columns
                if (!\Schema::hasTable('rooms')) {
                    \Log::error('Rooms table does not exist');
                    throw new \Exception('Rooms table not found');
                }
                
                $rooms = Room::select(['room_id', 'tenant_id', 'room_number', 'type', 'price_per_semester', 'status', 'max_capacity'])
                    ->where('tenant_id', $user->tenant_id)
                    ->whereNull('archived_at')
                    ->limit(100)
                    ->get();
            } catch (\Exception $e) {
                \Log::error('Error loading rooms', [
                    'user_id' => $user->id,
                    'tenant_id' => $user->tenant_id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                
                // Return Inertia response with error message
                return Inertia::render('rooms/index', [
                    'rooms' => [],
                    'tenant_id' => $user->tenant_id ?? null,
                    'error' => 'Unable to load rooms: ' . $e->getMessage()
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
                'error' => 'Server error occurred. Please try again later.'
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
        try {
            // Test database connection first
            \DB::connection()->getPdo();
            
            $room = Room::findOrFail($id);
            
            // For AJAX requests, return JSON
            if (request()->expectsJson()) {
                return response()->json($room);
            }
            
            // For direct browser requests, redirect to rooms index
            return redirect()->route('rooms.index');
            
        } catch (\Exception $e) {
            \Log::error('Error loading room details', [
                'room_id' => $id,
                'error' => $e->getMessage()
            ]);
            
            // For AJAX requests, return JSON error
            if (request()->expectsJson()) {
                return response()->json([
                    'error' => 'Failed to load room details',
                    'message' => $e->getMessage()
                ], 500);
            }
            
            // For direct browser requests, redirect with error
            return redirect()->route('rooms.index')->with('error', 'Room not found.');
        }
    }

    public function update(Request $request, $id)
    {
        try {
            // Test database connection first
            \DB::connection()->getPdo();
            
            $user = $request->user();
            $room = Room::findOrFail($id);
            $room->update($request->all());
            
            $rooms = Room::where('tenant_id', $user->tenant_id)->whereNull('archived_at')->get();
            
            return Inertia::render('rooms/index', [
                'rooms' => $rooms,
                'tenant_id' => $user->tenant_id
            ]);
        } catch (\Exception $e) {
            \Log::error('Error updating room', [
                'room_id' => $id,
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);
            
            return redirect()->route('rooms.index')->with('error', 'Failed to update room: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            // Test database connection first
            \DB::connection()->getPdo();
            
            $user = request()->user();
            $room = Room::findOrFail($id);
            $room->archive();
            
            $rooms = Room::where('tenant_id', $user->tenant_id)->whereNull('archived_at')->get();
            
            return Inertia::render('rooms/index', [
                'rooms' => $rooms,
                'tenant_id' => $user->tenant_id
            ]);
        } catch (\Exception $e) {
            \Log::error('Error archiving room', [
                'room_id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return redirect()->route('rooms.index')->with('error', 'Failed to archive room: ' . $e->getMessage());
        }
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
