<?php

use Illuminate\Support\Facades\Route;
use Modules\Design\Http\Controllers\PrintCostController;
use Modules\Design\Http\Controllers\PrintTypeController;

Route::prefix('v1')->group(function () {
    // Print Types
    Route::get('print-types/all', [PrintTypeController::class, 'all'])->name('design.print-types.all');
    Route::get('print-types/search', [PrintTypeController::class, 'search'])->name('design.print-types.search');
    Route::get('print-types/{id}/costs', [PrintTypeController::class, 'costs'])->name('design.print-types.costs');
    Route::apiResource('print-types', PrintTypeController::class)
        ->parameters(['print-types' => 'id'])
        ->names('design.print-types');

    // Print Costs
    Route::get('print-costs/all', [PrintCostController::class, 'all'])->name('design.print-costs.all');
    Route::get('print-costs/types/all', [PrintCostController::class, 'costTypes'])->name('design.print-costs.types.all');
    Route::apiResource('print-costs', PrintCostController::class)
        ->parameters(['print-costs' => 'id'])
        ->names('design.print-costs');
});
