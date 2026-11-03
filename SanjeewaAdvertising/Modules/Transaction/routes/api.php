<?php

use Illuminate\Support\Facades\Route;
use Modules\Transaction\Http\Controllers\ExpencesessController;
use Modules\Transaction\Http\Controllers\ExpencesessStatusController;
use Modules\Transaction\Http\Controllers\ExpencesessTypeController;
use Modules\Transaction\Http\Controllers\GrnPaymentController;
use Modules\Transaction\Http\Controllers\PaymentController;

Route::prefix('v1')->group(function () {
    // Payment Types & Statuses
    Route::get('payments/types', [PaymentController::class, 'types'])->name('transaction.payments.types');
    Route::get('payments/statuses', [PaymentController::class, 'statuses'])->name('transaction.payments.statuses');

    // Customer Payments (Print Jobs) & Operating Expenses (legacy demo/data endpoint)
    Route::get('payments/expenses/data', [PaymentController::class, 'expensesData'])->name('transaction.payments.expenses.data');
    Route::get('payments/all', [PaymentController::class, 'all'])->name('transaction.payments.all');
    Route::apiResource('payments', PaymentController::class)
        ->parameters(['payments' => 'id'])
        ->names('transaction.payments');

    // Supplier GRN Payments
    Route::get('grn-payments/data', [GrnPaymentController::class, 'grnPaymentsData'])->name('transaction.grn-payments.data');
    Route::get('grn-payments/all', [GrnPaymentController::class, 'all'])->name('transaction.grn-payments.all');
    Route::apiResource('grn-payments', GrnPaymentController::class)
        ->parameters(['grn-payments' => 'id'])
        ->names('transaction.grn-payments');

    // Operating Expenses (expencesess, expencesess_types, expencesess_statuses)
    Route::get('expenses/types', [ExpencesessController::class, 'types'])->name('transaction.expenses.types');
    Route::get('expenses/statuses', [ExpencesessController::class, 'statuses'])->name('transaction.expenses.statuses');
    Route::get('expenses/data', [ExpencesessController::class, 'expensesData'])->name('transaction.expenses.data');
    Route::get('expenses/all', [ExpencesessController::class, 'all'])->name('transaction.expenses.all');
    Route::apiResource('expenses', ExpencesessController::class)
        ->parameters(['expenses' => 'id'])
        ->names('transaction.expenses');

    Route::apiResource('expense-types', ExpencesessTypeController::class)
        ->parameters(['expense-types' => 'id'])
        ->names('transaction.expense-types');

    Route::apiResource('expense-statuses', ExpencesessStatusController::class)
        ->parameters(['expense-statuses' => 'id'])
        ->names('transaction.expense-statuses');

    // Direct table aliases for expencesess
    Route::get('expencesess/data', [ExpencesessController::class, 'expensesData'])->name('transaction.expencesess.data');
    Route::get('expencesess/all', [ExpencesessController::class, 'all'])->name('transaction.expencesess.all');
    Route::apiResource('expencesess', ExpencesessController::class)
        ->parameters(['expencesess' => 'id'])
        ->names('transaction.expencesess');
});
