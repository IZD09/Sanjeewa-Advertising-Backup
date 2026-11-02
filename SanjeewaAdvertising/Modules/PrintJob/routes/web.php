<?php

use Illuminate\Support\Facades\Route;
use Modules\PrintJob\Http\Controllers\PrintJobController;

Route::get('/print-jobs/place-order-data', [PrintJobController::class, 'placeOrderData'])->name('printjob.web.place-order-data');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('printjobs', PrintJobController::class)->names('printjob');
});
