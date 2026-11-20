<?php

use Illuminate\Support\Facades\Route;
use Modules\HR\Http\Controllers\DailySalaryController;
use Modules\HR\Http\Controllers\HRController;
use Modules\HR\Http\Controllers\SalaryController;
use Modules\HR\Http\Controllers\StaffController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('hrs', HRController::class)->names('hr');
});

Route::middleware(['auth:web,admin'])->prefix('admin/hr')->group(function () {
    Route::get('staff', [StaffController::class, 'index'])->name('admin.hr.staff.index');
    Route::post('staff', [StaffController::class, 'store'])->name('admin.hr.staff.store');
    Route::get('staff/{id}', [StaffController::class, 'show'])->name('admin.hr.staff.show');
    Route::patch('staff/{id}/status', [StaffController::class, 'updateStatus'])->name('admin.hr.staff.status');

    Route::get('salaries', [SalaryController::class, 'index'])->name('admin.hr.salaries.index');
    Route::post('salaries', [SalaryController::class, 'store'])->name('admin.hr.salaries.store');

    Route::get('daily-salaries', [DailySalaryController::class, 'index'])->name('admin.hr.daily-salaries.index');
    Route::post('daily-salaries', [DailySalaryController::class, 'store'])->name('admin.hr.daily-salaries.store');
});
