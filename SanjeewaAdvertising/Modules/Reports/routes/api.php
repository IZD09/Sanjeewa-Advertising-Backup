<?php

use Illuminate\Support\Facades\Route;
use Modules\Reports\Http\Controllers\ReportsController;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('reports', ReportsController::class)->names('reports');
});
