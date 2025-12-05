<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CashierNotification;

class RecalculateNotificationCosts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:recalculate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate costs for existing booking archived notifications';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $notifications = CashierNotification::where('type', 'booking_archived')->get();
        
        $this->info('Found ' . $notifications->count() . ' notifications to update');
        
        foreach ($notifications as $notification) {
            $days = (int)$notification->days_stayed;
            
            if ($days > 0) {
                // Recalculate using new formula
                $months = max(1, (int)ceil($days / 30));
                $cost = $months * 400;
                
                $notification->update([
                    'months_stayed' => $months,
                    'calculated_cost' => $cost,
                ]);
                
                $this->line("Updated ID {$notification->id}: {$days} days = {$months} months = ₱{$cost}");
            }
        }
        
        $this->info('\nAll notifications updated successfully!');
        return 0;
    }
}
