<?php

use Illuminate\Support\Facades\Route;
use Modules\Core\Http\Controllers\CoreController;
use Modules\Core\Http\Controllers\SessionController;

Route::post('/session/keep-alive', [SessionController::class, 'keepAlive'])->name('session.keep-alive');
Route::post('/session/inactivity-timeout', [SessionController::class, 'timeout'])->name('session.inactivity-timeout');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('cores', CoreController::class)->names('core');
});
