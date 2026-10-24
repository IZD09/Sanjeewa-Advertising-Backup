<?php

use Illuminate\Support\Facades\Route;
use Modules\PrintJob\Http\Controllers\PrintJobController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('printjobs', PrintJobController::class)->names('printjob');
});
