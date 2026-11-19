<?php

use Illuminate\Support\Facades\Route;
use Modules\Core\Http\Controllers\ActivityController;
use Modules\Core\Http\Controllers\NotificationController;

Route::prefix('v1')->group(function () {
    Route::get('activities/types', [ActivityController::class, 'types'])->name('core.activities.types');
    Route::apiResource('activities', ActivityController::class)
        ->only(['index', 'store', 'show'])
        ->parameters(['activities' => 'id'])
        ->names('core.activities');

    // In-App Notifications
    Route::get('notifications', [NotificationController::class, 'index'])->name('core.notifications.index');
    Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('core.notifications.read');
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('core.notifications.read-all');

    // Access Permission Request (Pre-login)
    Route::post('permissions/request', [NotificationController::class, 'requestPermissions'])->name('core.permissions.request');
});
