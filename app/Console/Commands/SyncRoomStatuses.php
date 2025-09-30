<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\RoomStatusService;
use App\Models\Tenant;

class SyncRoomStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rooms:sync-status
                            {--dormitory= : Sync status for a specific dormitory by tenant ID}
                            {--daily : Only update rooms with check-ins/check-outs today}
                            {--show-stats : Show occupancy statistics after sync}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize room statuses based on current bookings';

    protected $roomStatusService;

    public function __construct(RoomStatusService $roomStatusService)
    {
        parent::__construct();
        $this->roomStatusService = $roomStatusService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting room status synchronization...');

        $dormitoryId = $this->option('dormitory');
        $dailyOnly = $this->option('daily');
        $showStats = $this->option('show-stats');

        if ($dormitoryId) {
            $this->syncSpecificDormitory($dormitoryId, $dailyOnly, $showStats);
        } else {
            $this->syncAllDormitories($dailyOnly, $showStats);
        }

        $this->info('Room status synchronization completed!');
    }

    private function syncSpecificDormitory($tenantId, $dailyOnly, $showStats)
    {
        $tenant = Tenant::find($tenantId);
        
        if (!$tenant) {
            $this->error("Dormitory with ID {$tenantId} not found.");
            return;
        }

        $this->info("Synchronizing room statuses for: {$tenant->dormitory_name}");

        if ($dailyOnly) {
            $updatedRooms = $this->roomStatusService->updateDailyStatusChanges($tenantId);
            $this->displayDailyResults($updatedRooms, $tenant->dormitory_name);
        } else {
            $updatedRooms = $this->roomStatusService->updateAllRoomsForTenant($tenantId);
            $this->info("Updated " . count($updatedRooms) . " rooms for {$tenant->dormitory_name}");
        }

        if ($showStats) {
            $this->displayOccupancyStats($tenantId, $tenant->dormitory_name);
        }
    }

    private function syncAllDormitories($dailyOnly, $showStats)
    {
        $this->info('Synchronizing room statuses for all dormitories...');

        $tenants = Tenant::all();
        $totalUpdated = 0;

        foreach ($tenants as $tenant) {
            if ($dailyOnly) {
                $updatedRooms = $this->roomStatusService->updateDailyStatusChanges($tenant->tenant_id);
                $count = (isset($updatedRooms['check_ins']) ? count($updatedRooms['check_ins']) : 0) + 
                        (isset($updatedRooms['check_outs']) ? count($updatedRooms['check_outs']) : 0);
            } else {
                $updatedRooms = $this->roomStatusService->updateAllRoomsForTenant($tenant->tenant_id);
                $count = count($updatedRooms);
            }

            if ($count > 0) {
                $this->line("  {$tenant->dormitory_name}: {$count} rooms updated");
            }

            $totalUpdated += $count;
        }

        $this->info("Total rooms updated across all dormitories: {$totalUpdated}");

        if ($showStats) {
            $this->info('\nOccupancy statistics by dormitory:');
            foreach ($tenants as $tenant) {
                $this->displayOccupancyStats($tenant->tenant_id, $tenant->dormitory_name);
            }
        }
    }

    private function displayDailyResults($updatedRooms, $dormitoryName)
    {
        $checkIns = isset($updatedRooms['check_ins']) ? count($updatedRooms['check_ins']) : 0;
        $checkOuts = isset($updatedRooms['check_outs']) ? count($updatedRooms['check_outs']) : 0;

        $this->info("Daily status changes for {$dormitoryName}:");
        $this->line("  Check-ins (rooms set to occupied): {$checkIns}");
        $this->line("  Check-outs (rooms set to available): {$checkOuts}");
    }

    private function displayOccupancyStats($tenantId, $dormitoryName)
    {
        $stats = $this->roomStatusService->getOccupancyStats($tenantId);
        
        $this->info("\nOccupancy for {$dormitoryName}:");
        $this->line("  Total rooms: {$stats['total_rooms']}");
        $this->line("  Available: {$stats['available']}");
        $this->line("  Occupied: {$stats['occupied']}");
        $this->line("  Maintenance: {$stats['maintenance']}");
        $this->line("  Occupancy rate: {$stats['occupancy_rate']}%");
    }
}
