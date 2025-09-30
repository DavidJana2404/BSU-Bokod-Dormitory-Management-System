<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Room;

class RefreshRoomStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rooms:refresh-statuses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Refresh all room statuses based on current non-archived bookings';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Refreshing room statuses...');
        
        $rooms = Room::notArchived()->get();
        $updatedCount = 0;
        
        foreach ($rooms as $room) {
            $oldStatus = $room->status;
            $updated = $room->updateStatusBasedOnBookings();
            
            if ($updated) {
                $this->line("Room {$room->room_number}: {$oldStatus} -> {$room->fresh()->status}");
                $updatedCount++;
            } else {
                $this->line("Room {$room->room_number}: {$oldStatus} (no change)");
            }
        }
        
        $this->info("Processed {$rooms->count()} rooms, updated {$updatedCount} statuses.");
        
        return Command::SUCCESS;
    }
}