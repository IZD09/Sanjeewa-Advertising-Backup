<?php

use Illuminate\Support\Facades\Route;
use Modules\PrintJob\Http\Controllers\PrintJobController;

Route::get('/print-jobs/place-order-data', [PrintJobController::class, 'placeOrderData'])->name('printjob.web.place-order-data');

Route::middleware(['auth:web,admin'])->group(function () {
    Route::middleware('module.permission:Print Jobs')->group(function () {
        Route::get('/print-jobs', [PrintJobController::class, 'productionFloor'])->name('ui.print-jobs');
        Route::get('/print-jobs/data', [PrintJobController::class, 'floorData'])->name('printjob.web.data');
        Route::get('/print-jobs/floor-data', [PrintJobController::class, 'floorData'])->name('printjob.web.floor-data');
        Route::patch('/print-jobs/{id}/status', [PrintJobController::class, 'updateStatus'])->name('printjob.web.status');
        Route::get('/print-jobs/{id}/status-history', [PrintJobController::class, 'statusHistory'])->name('printjob.web.status-history');
        Route::post('/print-jobs/{id}/stock-items', [PrintJobController::class, 'assignStockItem'])->name('printjob.web.stock-items.assign');
        Route::delete('/print-jobs/{id}/stock-items/{stockId}', [PrintJobController::class, 'removeStockItem'])->name('printjob.web.stock-items.remove');
    });

    Route::resource('printjobs', PrintJobController::class)->names('printjob');
});
