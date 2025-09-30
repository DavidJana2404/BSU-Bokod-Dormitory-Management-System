<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;
use App\Models\Student;

class CleanupBookings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bookings:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up problematic booking data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Cleaning up problematic bookings...');
        
        // Delete bookings with no associated student
        $orphanedBookings = Booking::whereNull('student_id')
            ->orWhereNotIn('student_id', Student::pluck('student_id'))
            ->get();
            
        if ($orphanedBookings->isNotEmpty()) {
            $this->info('Found ' . $orphanedBookings->count() . ' orphaned bookings:');
            foreach ($orphanedBookings as $booking) {
                $this->line('- Booking ID ' . $booking->booking_id . ' (student_id: ' . $booking->student_id . ')');
            }
            
            if ($this->confirm('Delete these orphaned bookings?')) {
                $deleted = $orphanedBookings->count();
                Booking::whereNull('student_id')
                    ->orWhereNotIn('student_id', Student::pluck('student_id'))
                    ->delete();
                $this->info('Deleted ' . $deleted . ' orphaned bookings.');
            }
        } else {
            $this->info('No orphaned bookings found.');
        }
        
        // Delete bookings with corrupt dates (like year 2222)
        $corruptDateBookings = Booking::where('check_in_date', '>', '2030-01-01')
            ->orWhere('check_out_date', '>', '2030-01-01')
            ->get();
            
        if ($corruptDateBookings->isNotEmpty()) {
            $this->info('\nFound ' . $corruptDateBookings->count() . ' bookings with corrupt dates:');
            foreach ($corruptDateBookings as $booking) {
                $this->line('- Booking ID ' . $booking->booking_id . ' (' . $booking->check_in_date . ' to ' . $booking->check_out_date . ')');
            }
            
            if ($this->confirm('Delete these bookings with corrupt dates?')) {
                $deleted = $corruptDateBookings->count();
                Booking::where('check_in_date', '>', '2030-01-01')
                    ->orWhere('check_out_date', '>', '2030-01-01')
                    ->delete();
                $this->info('Deleted ' . $deleted . ' bookings with corrupt dates.');
            }
        } else {
            $this->info('\nNo bookings with corrupt dates found.');
        }
        
        $this->info('\nBooking cleanup completed!');
    }
}
