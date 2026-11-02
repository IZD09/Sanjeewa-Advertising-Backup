<?php

use Illuminate\Support\Facades\Route;
use Modules\Transaction\Http\Controllers\GrnPaymentController;
use Modules\Transaction\Http\Controllers\PaymentController;

Route::prefix('v1')->group(function () {
    // Payment Types & Statuses
    Route::get('payments/types', [PaymentController::class, 'types'])->name('transaction.payments.types');
    Route::get('payments/statuses', [PaymentController::class, 'statuses'])->name('transaction.payments.statuses');

    // Customer Payments (Print Jobs)
    Route::get('payments/all', [PaymentController::class, 'all'])->name('transaction.payments.all');
    Route::apiResource('payments', PaymentController::class)
        ->parameters(['payments' => 'id'])
        ->names('transaction.payments');

    // Supplier GRN Payments
    Route::get('grn-payments/all', [GrnPaymentController::class, 'all'])->name('transaction.grn-payments.all');
    Route::apiResource('grn-payments', GrnPaymentController::class)
        ->parameters(['grn-payments' => 'id'])
        ->names('transaction.grn-payments');
});
