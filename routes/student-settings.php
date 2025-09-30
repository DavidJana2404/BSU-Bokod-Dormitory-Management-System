<?php

use App\Http\Controllers\Student\Settings\PasswordController;
use App\Http\Controllers\Student\Settings\AppearanceController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:student')->group(function () {
    Route::redirect('student/settings', '/student/settings/password');

    Route::get('student/settings/password', [PasswordController::class, 'edit'])->name('student.settings.password.edit');
    Route::put('student/settings/password', [PasswordController::class, 'update'])->name('student.settings.password.update');

    Route::get('student/settings/appearance', [AppearanceController::class, 'edit'])->name('student.settings.appearance.edit');
});
