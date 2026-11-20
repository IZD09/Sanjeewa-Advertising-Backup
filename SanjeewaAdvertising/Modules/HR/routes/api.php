<?php

use Illuminate\Support\Facades\Route;
use Modules\HR\Http\Controllers\DailySalaryController;
use Modules\HR\Http\Controllers\HRController;
use Modules\HR\Http\Controllers\SalaryController;
use Modules\HR\Http\Controllers\StaffController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('hrs', HRController::class)->names('hr');
});

Route::middleware(['auth:web,admin'])->prefix('v1/hr')->group(function () {
    Route::get('staff', [StaffController::class, 'index'])->name('hr.staff.index');
    Route::post('staff', [StaffController::class, 'store'])->name('hr.staff.store');
    Route::get('staff/{id}', [StaffController::class, 'show'])->name('hr.staff.show');
    Route::patch('staff/{id}/status', [StaffController::class, 'updateStatus'])->name('hr.staff.status');

    Route::get('salaries', [SalaryController::class, 'index'])->name('hr.salaries.index');
    Route::post('salaries', [SalaryController::class, 'store'])->name('hr.salaries.store');

    Route::get('daily-salaries', [DailySalaryController::class, 'index'])->name('hr.daily-salaries.index');
    Route::post('daily-salaries', [DailySalaryController::class, 'store'])->name('hr.daily-salaries.store');
});
