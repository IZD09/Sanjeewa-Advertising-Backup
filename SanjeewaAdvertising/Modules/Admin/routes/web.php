<?php

use Illuminate\Support\Facades\Route;
use Modules\Admin\Http\Controllers\AdminAuthController;
use Modules\Admin\Http\Controllers\AdminController;
use Modules\Admin\Http\Controllers\AdminUserController;

Route::post('/admin/login', [AdminAuthController::class, 'login'])->name('admin.login.submit');
Route::match(['get', 'post'], '/admin/logout', [AdminAuthController::class, 'logout'])->name('admin.logout');

Route::middleware(['auth:web,admin'])->group(function () {
    Route::resource('admins', AdminController::class)->names('admin');

    // Admin-managed User processes
    Route::prefix('admin')->group(function () {
        Route::get('users/all', [AdminUserController::class, 'all'])->name('admin.users.all');
        Route::get('users', [AdminUserController::class, 'index'])->name('admin.users.index');
        Route::post('users', [AdminUserController::class, 'store'])->name('admin.users.store');
        Route::patch('users/{id}/status', [AdminUserController::class, 'updateStatus'])->name('admin.users.status');
        Route::put('users/{id}/permissions/sync', [AdminUserController::class, 'syncPermissions'])->name('admin.users.permissions.sync');
    });
});
