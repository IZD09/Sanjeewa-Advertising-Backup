<?php

use Illuminate\Support\Facades\Route;
use Modules\PrintJob\Http\Controllers\PrintJobController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('printjobs', PrintJobController::class)->names('printjob');
});
