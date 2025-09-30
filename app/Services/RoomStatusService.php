<?php

namespace App\Services;

use App\Models\Room;
use App\Models\Booking;
use Carbon\Carbon;

class RoomStatusService
{
    /**
     * Update status for a specific room based on its current bookings
     *
     * @param int $roomId
     * @return bool True if status was changed, false otherwise
     */
    public function updateRoomStatus($roomId)
    {
        $room = Room::find($roomId);
        
        if (!$room) {
            return false;
        }

        return $room->updateStatusBasedOnBookings();
    }

    /**
     * Update status for all rooms in a hotel/tenant
     *
     * @param int $tenantId
     * @return array Array of updated room IDs
     */
    public function updateAllRoomsForTenant($tenantId)
    {
        $rooms = Room::where('tenant_id', $tenantId)->get();
        $updatedRooms = [];

        foreach ($rooms as $room) {
            if ($room->updateStatusBasedOnBookings()) {
                $updatedRooms[] = $room->room_id;
            }
        }

        return $updatedRooms;
    }

    /**
     * Update status for all rooms in the system
     *
     * @return array Array of updated room IDs grouped by tenant
     */
    public function updateAllRooms()
    {
        $rooms = Room::all();
        $updatedRooms = [];

        foreach ($rooms as $room) {
            if ($room->updateStatusBasedOnBookings()) {
                $updatedRooms[$room->tenant_id][] = $room->room_id;
            }
        }

        return $updatedRooms;
    }

    /**
     * Get rooms that should be available but are marked as occupied
     *
     * @param int|null $tenantId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getIncorrectlyOccupiedRooms($tenantId = null)
    {
        $query = Room::where('status', 'occupied');
        
        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }

        return $query->get()->filter(function ($room) {
            return !$room->isCurrentlyOccupied();
        });
    }

    /**
     * Get rooms that should be occupied but are marked as available
     *
     * @param int|null $tenantId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getIncorrectlyAvailableRooms($tenantId = null)
    {
        $query = Room::where('status', 'available');
        
        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }

        return $query->get()->filter(function ($room) {
            return $room->isCurrentlyOccupied();
        });
    }

    /**
     * Get occupancy statistics for a tenant
     *
     * @param int $tenantId
     * @return array
     */
    public function getOccupancyStats($tenantId)
    {
        $rooms = Room::where('tenant_id', $tenantId)->get();
        
        $stats = [
            'total_rooms' => $rooms->count(),
            'available' => $rooms->where('status', 'available')->count(),
            'occupied' => $rooms->where('status', 'occupied')->count(),
            'maintenance' => $rooms->where('status', 'maintenance')->count(),
        ];

        $stats['occupancy_rate'] = $stats['total_rooms'] > 0 
            ? round(($stats['occupied'] / $stats['total_rooms']) * 100, 1) 
            : 0;

        return $stats;
    }

    /**
     * Check and update rooms that should have changed status today
     *
     * @param int|null $tenantId
     * @return array
     */
    public function updateDailyStatusChanges($tenantId = null)
    {
        $today = Carbon::today();
        $updatedRooms = [];

        // Get bookings that start today (check-ins)
        $checkInsToday = Booking::whereDate('check_in_date', $today);
        if ($tenantId) {
            $checkInsToday->where('tenant_id', $tenantId);
        }
        
        foreach ($checkInsToday->get() as $booking) {
            if ($booking->room && $booking->room->updateStatusBasedOnBookings()) {
                $updatedRooms['check_ins'][] = $booking->room_id;
            }
        }

        // Get bookings that end today (check-outs)
        $checkOutsToday = Booking::whereDate('check_out_date', $today);
        if ($tenantId) {
            $checkOutsToday->where('tenant_id', $tenantId);
        }

        foreach ($checkOutsToday->get() as $booking) {
            if ($booking->room && $booking->room->updateStatusBasedOnBookings()) {
                $updatedRooms['check_outs'][] = $booking->room_id;
            }
        }

        return $updatedRooms;
    }
}
