<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Room;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $rooms = Room::where('tenant_id', $user->tenant_id)->notArchived()->get();
        return Inertia::render('rooms/index', [
            'rooms' => $rooms,
            'tenant_id' => $user->tenant_id
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $data = $request->all();
        $data['tenant_id'] = $user->tenant_id;
        Room::create($data);
        $rooms = Room::where('tenant_id', $user->tenant_id)->notArchived()->get();
        return Inertia::render('rooms/index', [
            'rooms' => $rooms,
            'tenant_id' => $user->tenant_id
        ]);
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
