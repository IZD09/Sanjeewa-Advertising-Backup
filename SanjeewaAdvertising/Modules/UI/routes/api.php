<?php

use Illuminate\Support\Facades\Route;
use Modules\UI\Http\Controllers\DashboardController;
use Modules\UI\Http\Controllers\SettingsController;
use Modules\UI\Http\Controllers\UIController;

Route::group([], function () {
    Route::get('dashboard/data', [DashboardController::class, 'data'])->name('ui.api.dashboard.data');
    Route::get('dashboard/stream', [DashboardController::class, 'stream'])->name('ui.api.dashboard.stream');
    Route::get('settings', [SettingsController::class, 'getSettings'])->name('ui.api.settings.get');
    Route::post('settings', [SettingsController::class, 'update'])->name('ui.api.settings.update');
    Route::apiResource('uis', UIController::class)->names('ui');
});
