<?php

use Illuminate\Support\Facades\Route;
use Modules\PrintJob\Http\Controllers\PrintJobController;
use Modules\PrintJob\Http\Controllers\PrintJobStatusController;

Route::prefix('v1')->group(function () {
    // Place order data (demo dataset without DB connection)
    Route::get('print-jobs/place-order-data', [PrintJobController::class, 'placeOrderData'])->name('printjob.jobs.place-order-data');
    Route::get('print-jobs/orders', [PrintJobController::class, 'placeOrderData'])->name('printjob.jobs.orders');

    // Dedicated search & all endpoints (defined before apiResource to avoid route collision with {id})
    Route::get('print-jobs/floor-data', [PrintJobController::class, 'floorData'])->name('printjob.jobs.floor-data');
    Route::get('print-jobs/all', [PrintJobController::class, 'all'])->name('printjob.jobs.all');
    Route::get('print-jobs/search', [PrintJobController::class, 'search'])->name('printjob.jobs.search');

    // Sub-resource endpoints
    Route::patch('print-jobs/{id}/status', [PrintJobController::class, 'updateStatus'])->name('printjob.jobs.status');
    Route::get('print-jobs/{id}/status-history', [PrintJobController::class, 'statusHistory'])->name('printjob.jobs.status-history');
    Route::post('print-jobs/{id}/stock-items', [PrintJobController::class, 'assignStockItem'])->name('printjob.jobs.stock-items.assign');
    Route::delete('print-jobs/{id}/stock-items/{stockId}', [PrintJobController::class, 'removeStockItem'])->name('printjob.jobs.stock-items.remove');
    Route::put('print-jobs/{id}/cost', [PrintJobController::class, 'updateCost'])->name('printjob.jobs.cost.update');

    // PrintJob CRUD
    Route::apiResource('print-jobs', PrintJobController::class)
        ->parameters(['print-jobs' => 'id'])
        ->names('printjob.jobs');

    Route::apiResource('printjobs', PrintJobController::class)
        ->parameters(['printjobs' => 'id'])
        ->names('printjob');

    // PrintJob Status CRUD
    Route::apiResource('print-job-statuses', PrintJobStatusController::class)
        ->parameters(['print-job-statuses' => 'id'])
        ->names('printjob.statuses');
});
