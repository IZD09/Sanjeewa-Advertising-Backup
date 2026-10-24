<?php

use Illuminate\Support\Facades\Route;
use Modules\Design\Http\Controllers\DesignController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('designs', DesignController::class)->names('design');
});
