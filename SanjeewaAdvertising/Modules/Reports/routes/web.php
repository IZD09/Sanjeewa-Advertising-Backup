<?php

use Illuminate\Support\Facades\Route;
use Modules\Reports\Http\Controllers\ReportsController;

Route::middleware(['auth:web,admin'])->group(function () {
    Route::get('/reports/data', [ReportsController::class, 'data'])
        ->middleware('module.permission:Reports')
        ->name('reports.data');

    Route::get('/reports/table/{tab}', [ReportsController::class, 'table'])
        ->middleware('module.permission:Reports')
        ->name('reports.table');

    Route::get('/reports/kpis', [ReportsController::class, 'kpis'])
        ->middleware('module.permission:Reports')
        ->name('reports.kpis');
});
