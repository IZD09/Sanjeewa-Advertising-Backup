<?php

use Illuminate\Support\Facades\Route;
use Modules\User\Http\Controllers\AuthController;
use Modules\User\Http\Controllers\UserController;
use Modules\User\Http\Controllers\UserProfileController;

Route::post('/login', [AuthController::class, 'login'])->name('user.auth.login');
Route::match(['get', 'post'], '/logout', [AuthController::class, 'logout'])->name('logout');

Route::middleware(['auth:web,admin'])->group(function () {
    Route::get('/user/profile/data', [UserProfileController::class, 'data'])->name('user.profile.data');
    Route::put('/user/profile', [UserProfileController::class, 'update'])->name('user.profile.update');
    Route::put('/user/profile/password', [UserProfileController::class, 'updatePassword'])->name('user.profile.password.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('users', UserController::class)->names('user');
});
