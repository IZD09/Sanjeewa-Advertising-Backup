<?php

use Illuminate\Support\Facades\Route;
use Modules\Admin\Http\Controllers\AdminAuthController;
use Modules\Admin\Http\Controllers\AdminController;
use Modules\Admin\Http\Controllers\AdminUserController;

Route::post('/admin/login', [AdminAuthController::class, 'login'])->name('admin.login.submit');
Route::match(['get', 'post'], '/admin/logout', [AdminAuthController::class, 'logout'])->name('admin.logout');

Route::middleware(['auth:web,admin'])->group(function () {
    Route::resource('admins', AdminController::class)->names('admin');

    // Admin-managed User & Admin processes
    Route::prefix('admin')->group(function () {
        Route::get('users/all', [AdminUserController::class, 'all'])->name('admin.users.all');
        Route::get('users', [AdminUserController::class, 'index'])->name('admin.users.index');
        Route::post('users', [AdminUserController::class, 'store'])->name('admin.users.store');
        Route::patch('users/{id}/status', [AdminUserController::class, 'updateStatus'])->name('admin.users.status');
        Route::put('users/{id}/permissions/sync', [AdminUserController::class, 'syncPermissions'])->name('admin.users.permissions.sync');

        Route::get('admins/all', [AdminController::class, 'all'])->name('admin.admins.all');
        Route::get('admins/search', [AdminController::class, 'search'])->name('admin.admins.search');
        Route::get('admins/statuses', [AdminController::class, 'statuses'])->name('admin.admins.statuses');
        Route::get('admins/types', [AdminController::class, 'types'])->name('admin.admins.types');
        Route::get('admins', [AdminController::class, 'index'])->name('admin.admins.index');
        Route::post('admins', [AdminController::class, 'store'])->name('admin.admins.store');
        Route::patch('admins/{id}/status', [AdminController::class, 'updateStatus'])->name('admin.admins.status');

        // Admin Profile endpoints
        Route::post('profile/verify', [AdminController::class, 'verifyProfileAccess'])->name('admin.profile.verify');
        Route::get('profile/data', [AdminController::class, 'profile'])->name('admin.profile.data');
        Route::put('profile', [AdminController::class, 'updateProfile'])->name('admin.profile.update');
    });
});
