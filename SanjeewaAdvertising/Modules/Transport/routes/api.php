<?php

use Illuminate\Support\Facades\Route;
use Modules\Transport\Http\Controllers\TransportController;

Route::middleware(['auth:web,admin', 'module.permission:Transport'])
    ->prefix('transport')
    ->group(function () {
        Route::get('/data', [TransportController::class, 'data'])->name('transport.data');

        // Fleet Vehicles & Vehicle Models
        Route::post('/vehicles', [TransportController::class, 'storeVehicle'])->name('transport.vehicles.store');
        Route::put('/vehicles/{truck}', [TransportController::class, 'updateVehicle'])->name('transport.vehicles.update');
        Route::patch('/vehicles/{truck}/driver', [TransportController::class, 'assignVehicleDriver'])->name('transport.vehicles.assign-driver');
        Route::delete('/vehicles/{truck}', [TransportController::class, 'destroyVehicle'])->name('transport.vehicles.destroy');
        Route::post('/models', [TransportController::class, 'storeModel'])->name('transport.models.store');

        // Transport Trips / Dispatches
        Route::post('/trips', [TransportController::class, 'storeTrip'])->name('transport.trips.store');
        Route::patch('/trips/{transport}/driver', [TransportController::class, 'assignTripDriver'])->name('transport.trips.assign-driver');
        Route::patch('/trips/{transport}/complete', [TransportController::class, 'completeTrip'])->name('transport.trips.complete');
        Route::delete('/trips/{transport}', [TransportController::class, 'destroyTrip'])->name('transport.trips.destroy');

        // Diesel Rate & Quick Driver Registration
        Route::post('/diesel-prices', [TransportController::class, 'storeDieselPrice'])->name('transport.diesel-prices.store');
        Route::post('/drivers', [TransportController::class, 'storeDriver'])->name('transport.drivers.store');
    });
