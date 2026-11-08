<?php

use Illuminate\Support\Facades\Route;
use Modules\Customer\Http\Controllers\CustomerController;

Route::middleware(['auth:web,admin', 'module.permission:Customers'])->group(function () {
    Route::get('/customers', [CustomerController::class, 'index'])->name('ui.customers');
});
