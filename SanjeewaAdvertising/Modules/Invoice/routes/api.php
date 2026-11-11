<?php

use Illuminate\Support\Facades\Route;
use Modules\Invoice\Http\Controllers\InvoiceController;

Route::prefix('v1')->group(function () {
    // Dedicated search, all & live available jobs
    Route::get('invoices/available-jobs', [InvoiceController::class, 'availableJobs'])->name('invoice.available-jobs');
    Route::get('invoices/data', [InvoiceController::class, 'invoicesData'])->name('invoice.data');
    Route::get('invoices/all', [InvoiceController::class, 'all'])->name('invoice.all');
    Route::get('invoices/search', [InvoiceController::class, 'search'])->name('invoice.search');

    // Sub-resources
    Route::post('invoices/{id}/jobs', [InvoiceController::class, 'attachJob'])->name('invoice.jobs.attach');
    Route::delete('invoices/{id}/jobs/{jobId}', [InvoiceController::class, 'detachJob'])->name('invoice.jobs.detach');

    // Invoice CRUD
    Route::apiResource('invoices', InvoiceController::class)
        ->parameters(['invoices' => 'id'])
        ->names('invoice');
});
