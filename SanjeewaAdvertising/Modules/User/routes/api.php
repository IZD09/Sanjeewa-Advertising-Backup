<?php

use Illuminate\Support\Facades\Route;
use Modules\User\Http\Controllers\AuthController;
use Modules\User\Http\Controllers\UserController;

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
});
