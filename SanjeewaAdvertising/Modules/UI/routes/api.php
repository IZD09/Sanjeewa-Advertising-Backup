<?php

use Illuminate\Support\Facades\Route;
use Modules\UI\Http\Controllers\DashboardController;
use Modules\UI\Http\Controllers\UIController;

Route::prefix('v1')->group(function () {
    Route::get('dashboard/data', [DashboardController::class, 'data'])->name('ui.api.dashboard.data');
    Route::get('dashboard/stream', [DashboardController::class, 'stream'])->name('ui.api.dashboard.stream');
    Route::apiResource('uis', UIController::class)->names('ui');
});
