<?php

use Illuminate\Support\Facades\Route;
use Modules\Admin\Http\Controllers\AdminController;

Route::prefix('v1')->group(function () {
    // Dedicated search, all, statuses, and types endpoints
    Route::get('admins/all', [AdminController::class, 'all'])->name('admin.all');
    Route::get('admins/search', [AdminController::class, 'search'])->name('admin.search');
    Route::get('admins/statuses', [AdminController::class, 'statuses'])->name('admin.statuses');
    Route::get('admins/types', [AdminController::class, 'types'])->name('admin.types');

    // Admin CRUD
    Route::apiResource('admins', AdminController::class)
        ->parameters(['admins' => 'id'])
        ->names('admin');

    // Admin sub-resources
    Route::patch('admins/{id}/status', [AdminController::class, 'updateStatus'])->name('admin.status');
    Route::get('admins/{id}/logins', [AdminController::class, 'logins'])->name('admin.logins');
});
