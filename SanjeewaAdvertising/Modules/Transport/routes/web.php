<?php

use Illuminate\Support\Facades\Route;
use Modules\Transport\Http\Controllers\TransportController;

Route::middleware(['auth:web,admin'])->group(function () {
    Route::get('/admin/transport', [TransportController::class, 'index'])
        ->middleware('module.permission:Transport')
        ->name('admin.transport');

    Route::get('/transport', fn () => redirect()->route('admin.transport'))
        ->middleware('module.permission:Transport');
});
