<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\ArchiveController;
use App\Http\Controllers\BackupController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');
    
    Route::get('settings/archive', [ArchiveController::class, 'index'])->name('archive.index');
    Route::post('settings/archive/restore/{type}/{id}', [ArchiveController::class, 'restore'])->name('archive.restore');
    Route::delete('settings/archive/force-delete/{type}/{id}', [ArchiveController::class, 'forceDelete'])->name('archive.forceDelete');
    Route::delete('settings/archive/clear-all', [ArchiveController::class, 'clearAll'])->name('archive.clearAll');
    
    // Backup & Restore routes - Admin only
    Route::middleware('can:admin')->group(function () {
        Route::get('settings/backup', [BackupController::class, 'index'])->name('backup.index');
        Route::post('settings/backup/create', [BackupController::class, 'create'])->name('backup.create');
        Route::get('settings/backup/download/{filename}', [BackupController::class, 'download'])->name('backup.download');
        Route::post('settings/backup/restore/{filename}', [BackupController::class, 'restore'])->name('backup.restore');
        Route::delete('settings/backup/delete/{filename}', [BackupController::class, 'destroy'])->name('backup.destroy');
    });
});
