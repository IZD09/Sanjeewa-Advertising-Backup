<?php

use Illuminate\Support\Facades\Route;
use Modules\Admin\Http\Controllers\AdminController;
use Modules\Admin\Http\Controllers\AdminUserController;

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

    // Admin-managed User processes in API
    Route::prefix('admin')->group(function () {
        Route::get('users/all', [AdminUserController::class, 'all'])->name('admin.api.users.all');
        Route::get('users', [AdminUserController::class, 'index'])->name('admin.api.users.index');
        Route::post('users', [AdminUserController::class, 'store'])->name('admin.api.users.store');
        Route::patch('users/{id}/status', [AdminUserController::class, 'updateStatus'])->name('admin.api.users.status');
        Route::put('users/{id}/permissions/sync', [AdminUserController::class, 'syncPermissions'])->name('admin.api.users.permissions.sync');
    });
});
