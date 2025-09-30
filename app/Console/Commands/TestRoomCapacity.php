<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Room;
use App\Models\Booking;
use App\Models\Student;

class TestRoomCapacity extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rooms:test-capacity';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test and display room capacity information';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Room Capacity System Test');
        $this->info('=' . str_repeat('=', 50));

        $rooms = Room::all();
        
        if ($rooms->isEmpty()) {
            $this->warn('No rooms found in the system.');
            return;
        }

        $headers = ['Room', 'Status', 'Capacity', 'Current', 'Available', 'At Max?', 'Bookings'];
        $data = [];

        foreach ($rooms as $room) {
            $currentBookings = $room->currentBookings()->count();
            $data[] = [
                "Room {$room->room_number}",
                $room->status,
                $room->max_capacity,
                $room->getCurrentOccupancy(),
                $room->getAvailableCapacity(),
                $room->isAtCapacity() ? 'Yes' : 'No',
                $currentBookings . ' active'
            ];
        }

        $this->table($headers, $data);

        // Show some statistics
        $totalRooms = $rooms->count();
        $availableRooms = $rooms->filter(fn($r) => $r->status === 'available')->count();
        $occupiedRooms = $rooms->filter(fn($r) => $r->status === 'occupied')->count();
        $maintenanceRooms = $rooms->filter(fn($r) => $r->status === 'maintenance')->count();
        $atCapacityRooms = $rooms->filter(fn($r) => $r->isAtCapacity())->count();
        $totalCurrentStudents = $rooms->sum(fn($r) => $r->getCurrentOccupancy());
        $totalCapacity = $rooms->sum(fn($r) => $r->max_capacity);

        $this->info('\nSystem Summary:');
        $this->line("Total Rooms: {$totalRooms}");
        $this->line("Available: {$availableRooms}");
        $this->line("Occupied (at capacity): {$occupiedRooms}");
        $this->line("Maintenance: {$maintenanceRooms}");
        $this->line("Rooms at capacity: {$atCapacityRooms}");
        $this->line("Total students: {$totalCurrentStudents}/{$totalCapacity}");
        $this->line("Overall capacity utilization: " . round(($totalCurrentStudents / $totalCapacity) * 100, 1) . "%");

        // Test booking validation
        $this->info('\nTesting Booking Validation:');
        $roomsWithSpace = $rooms->filter(fn($r) => $r->getAvailableCapacity() > 0);
        $fullRooms = $rooms->filter(fn($r) => $r->isAtCapacity());

        $this->line("Rooms with available space: {$roomsWithSpace->count()}");
        $this->line("Rooms at full capacity: {$fullRooms->count()}");

        if ($fullRooms->isNotEmpty()) {
            $this->warn('\nRooms that cannot accept new bookings:');
            foreach ($fullRooms as $room) {
                $this->line("- Room {$room->room_number}: {$room->getCurrentOccupancy()}/{$room->max_capacity} students");
            }
        }
    }
}
