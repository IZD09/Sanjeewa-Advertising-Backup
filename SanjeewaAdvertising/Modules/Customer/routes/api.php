<?php

use Illuminate\Support\Facades\Route;
use Modules\Customer\Http\Controllers\CustomerController;

Route::prefix('v1')->group(function () {
    // Dedicated search & all endpoints
    Route::get('customers/all', [CustomerController::class, 'all'])->name('customer.all');
    Route::get('customers/search', [CustomerController::class, 'search'])->name('customer.search');

    // Customer sub-resource endpoints
    Route::get('customers/{id}/print-jobs', [CustomerController::class, 'printJobs'])->name('customer.print-jobs');

    // Customer CRUD
    Route::apiResource('customers', CustomerController::class)
        ->parameters(['customers' => 'id'])
        ->names('customer');
});
