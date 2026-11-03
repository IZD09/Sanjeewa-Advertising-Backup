<?php

use Illuminate\Support\Facades\Route;
use Modules\User\Http\Controllers\AuthController;
use Modules\User\Http\Controllers\PermisionStateController;
use Modules\User\Http\Controllers\SystemModuleController;
use Modules\User\Http\Controllers\UserController;
use Modules\User\Http\Controllers\UserPermissionController;

Route::prefix('v1')->group(function () {
    // Authentication endpoints
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register'])->name('user.auth.register');
        Route::post('login', [AuthController::class, 'login'])->name('user.auth.login');
        Route::post('logout', [AuthController::class, 'logout'])->name('user.auth.logout');
        Route::get('me', [AuthController::class, 'me'])->name('user.auth.me');
        Route::post('change-password', [AuthController::class, 'changePassword'])->name('user.auth.change-password');
    });

    // Dedicated search & all endpoints (defined before apiResource to avoid route collision with {user})
    Route::get('users/all', [UserController::class, 'all'])->name('user.users.all');
    Route::get('users/search', [UserController::class, 'search'])->name('user.users.search');

    // User management CRUD
    Route::apiResource('users', UserController::class)->names('user.users');
    Route::patch('users/{id}/status', [UserController::class, 'updateStatus'])->name('user.users.status');
    Route::get('users/{id}/logins', [UserController::class, 'logins'])->name('user.users.logins');

    // System Modules API
    Route::apiResource('system-modules', SystemModuleController::class)->names('user.system-modules');

    // Permission States API
    Route::apiResource('permision-states', PermisionStateController::class)->names('user.permision-states');

    // User Permissions Management API
    Route::prefix('users/{userId}/permissions')->group(function () {
        Route::get('/', [UserPermissionController::class, 'index'])->name('user.permissions.index');
        Route::post('/', [UserPermissionController::class, 'store'])->name('user.permissions.store');
        Route::put('sync', [UserPermissionController::class, 'sync'])->name('user.permissions.sync');
        Route::delete('{moduleId}', [UserPermissionController::class, 'destroy'])->name('user.permissions.destroy');
    });
});
