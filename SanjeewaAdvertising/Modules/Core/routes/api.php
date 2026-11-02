<?php

use Illuminate\Support\Facades\Route;
use Modules\Core\Http\Controllers\ActivityController;

Route::prefix('v1')->group(function () {
    Route::get('activities/types', [ActivityController::class, 'types'])->name('core.activities.types');
    Route::apiResource('activities', ActivityController::class)
        ->only(['index', 'store', 'show'])
        ->parameters(['activities' => 'id'])
        ->names('core.activities');
});
