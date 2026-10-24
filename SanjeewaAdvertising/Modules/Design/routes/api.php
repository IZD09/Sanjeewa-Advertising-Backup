<?php

use Illuminate\Support\Facades\Route;
use Modules\Design\Http\Controllers\DesignController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('designs', DesignController::class)->names('design');
});
