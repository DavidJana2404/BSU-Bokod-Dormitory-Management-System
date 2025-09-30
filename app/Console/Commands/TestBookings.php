<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;
use App\Models\Student;
use App\Models\Room;
use Carbon\Carbon;

class TestBookings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:bookings';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test and display current bookings with room alignment';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Current Bookings Test');
        $this->info('=' . str_repeat('=', 50));

        $now = Carbon::now();
        $this->line("Current date/time: {$now}");
        $this->newLine();

        // Get all bookings
        $allBookings = Booking::with(['student', 'room'])->get();
        $this->info("Total bookings in system: {$allBookings->count()}");
        
        if ($allBookings->isNotEmpty()) {
            $this->info('\nAll Bookings:');
            $headers = ['ID', 'Student', 'Room', 'Check-in', 'Check-out', 'Status'];
            $data = [];
            
            foreach ($allBookings as $booking) {
                $status = 'Unknown';
                if ($booking->isActive()) {
                    $status = 'Active';
                } elseif (Carbon::parse($booking->check_out_date)->isPast()) {
                    $status = 'Past';
                } elseif (Carbon::parse($booking->check_in_date)->isFuture()) {
                    $status = 'Future';
                }
                
                $data[] = [
                    $booking->booking_id,
                    ($booking->student ? $booking->student->first_name . ' ' . $booking->student->last_name : 'No student'),
                    ($booking->room ? 'Room ' . $booking->room->room_number : 'No room'),
                    $booking->check_in_date,
                    $booking->check_out_date,
                    $status
                ];
            }
            
            $this->table($headers, $data);
        }
        
        // Get active bookings
        $activeBookings = Booking::with(['student', 'room'])
            ->where('check_in_date', '<=', $now)
            ->where('check_out_date', '>=', $now)
            ->get();
            
        $this->info("\nActive bookings (current students): {$activeBookings->count()}");
        
        if ($activeBookings->isNotEmpty()) {
            foreach ($activeBookings as $booking) {
                $this->line("- {$booking->student->first_name} {$booking->student->last_name} in Room {$booking->room->room_number}");
            }
        }
        
        // Check room occupancy
        $this->info('\nRoom Occupancy Check:');
        $rooms = Room::all();
        
        foreach ($rooms as $room) {
            $occupancy = $room->getCurrentOccupancy();
            $this->line("Room {$room->room_number}: {$occupancy}/{$room->max_capacity} students (Status: {$room->status})");
        }
        
        // Test the dashboard query
        $this->info('\nTesting Dashboard Query:');
        $dashboardRooms = Room::orderBy('room_number')
            ->get()
            ->map(function ($room) {
                $currentStudents = Student::where('students.tenant_id', $room->tenant_id)
                    ->join('bookings', 'students.student_id', '=', 'bookings.student_id')
                    ->where('bookings.room_id', $room->room_id)
                    ->where('bookings.check_in_date', '<=', now())
                    ->where('bookings.check_out_date', '>=', now())
                    ->select('students.*')
                    ->get();
                    
                return [
                    'room_number' => $room->room_number,
                    'current_students_count' => $currentStudents->count(),
                    'current_students' => $currentStudents->map(function($s) { 
                        return $s->first_name . ' ' . $s->last_name; 
                    })->toArray()
                ];
            });
            
        foreach ($dashboardRooms as $roomData) {
            $studentsList = implode(', ', $roomData['current_students']);
            $this->line("Dashboard - Room {$roomData['room_number']}: {$roomData['current_students_count']} students ({$studentsList})");
        }
    }
}
