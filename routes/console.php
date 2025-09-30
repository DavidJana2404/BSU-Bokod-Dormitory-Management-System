<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule room status synchronization
Schedule::command('rooms:sync-status --daily')
    ->dailyAt('06:00')
    ->name('daily-room-status-sync')
    ->description('Sync room statuses for daily check-ins and check-outs');

// Schedule full room status sync (weekly)
Schedule::command('rooms:sync-status')
    ->weeklyOn(1, '02:00')
    ->name('weekly-room-status-sync')
    ->description('Full room status synchronization for all hotels');
