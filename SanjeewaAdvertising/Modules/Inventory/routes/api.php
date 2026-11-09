<?php

use Illuminate\Support\Facades\Route;
use Modules\Inventory\Http\Controllers\GrnItemController;
use Modules\Inventory\Http\Controllers\InventoryController;
use Modules\Inventory\Http\Controllers\ItemBatchController;
use Modules\Inventory\Http\Controllers\StockController;

Route::prefix('v1')->group(function () {
    // Categories & Subcategories Master Data
    Route::get('inventory/categories/data', [InventoryController::class, 'categoriesData'])->name('inventory.categories.data');
    Route::get('inventory/categories/stats', [InventoryController::class, 'categoriesStats'])->name('inventory.categories.stats');
    Route::get('inventory/categories', [InventoryController::class, 'categories'])->name('inventory.categories.index');
    Route::post('inventory/categories', [InventoryController::class, 'storeCategory'])->name('inventory.categories.store');
    Route::get('inventory/subcategories', [InventoryController::class, 'subcategories'])->name('inventory.subcategories.index');
    Route::post('inventory/subcategories', [InventoryController::class, 'storeSubcategory'])->name('inventory.subcategories.store');

    // Stock Items & Brands Master Catalog
    Route::get('inventory/stock-items/data', [InventoryController::class, 'stockItemsData'])->name('inventory.stock-items.data');
    Route::get('inventory/stock-items', [InventoryController::class, 'stockItems'])->name('inventory.stock-items.index');
    Route::post('inventory/stock-items', [InventoryController::class, 'storeStockItem'])->name('inventory.stock-items.store');
    Route::put('inventory/stock-items/{stockItem}', [InventoryController::class, 'updateStockItem'])->name('inventory.stock-items.update');
    Route::get('inventory/brands', [InventoryController::class, 'brands'])->name('inventory.brands.index');
    Route::post('inventory/brands', [InventoryController::class, 'storeBrand'])->name('inventory.brands.store');
    Route::put('inventory/brands/{brand}', [InventoryController::class, 'updateBrand'])->name('inventory.brands.update');

    // Item Batches
    Route::get('inventory/item-batches', [ItemBatchController::class, 'index'])->name('inventory.item-batches.index');
    Route::post('inventory/item-batches', [ItemBatchController::class, 'store'])->name('inventory.item-batches.store');
    Route::get('inventory/item-batches/{id}', [ItemBatchController::class, 'show'])->name('inventory.item-batches.show');
    Route::delete('inventory/item-batches/{id}', [ItemBatchController::class, 'destroy'])->name('inventory.item-batches.destroy');

    // GRN Items
    Route::get('inventory/grn-items', [GrnItemController::class, 'index'])->name('inventory.grn-items.index');
    Route::get('inventory/grn-items/grn/{grnId}', [GrnItemController::class, 'byGrn'])->name('inventory.grn-items.by-grn');
    Route::post('inventory/grn-items', [GrnItemController::class, 'store'])->name('inventory.grn-items.store');
    Route::delete('inventory/grn-items/{grnId}/{itemBatchesId}/{stockId}', [GrnItemController::class, 'destroy'])->name('inventory.grn-items.destroy');

    // Material Stock Inventory (Stock Table & Shipments)
    Route::get('inventory/stocks/form-data', [StockController::class, 'formData'])->name('inventory.stocks.form-data');
    Route::get('inventory/stocks', [StockController::class, 'index'])->name('inventory.stocks.index');
    Route::post('inventory/stocks', [StockController::class, 'store'])->name('inventory.stocks.store');
    Route::put('inventory/stocks/{stock}', [StockController::class, 'update'])->name('inventory.stocks.update');
    Route::get('inventory/stocks/{stock}', [StockController::class, 'show'])->name('inventory.stocks.show');

    // Stock Movements & Audit
    Route::get('inventory/movements', [InventoryController::class, 'stockMovements'])->name('inventory.movements');
    Route::get('inventory/movements/stats', [InventoryController::class, 'stockMovementsStats'])->name('inventory.movements.stats');
    Route::get('inventory/movement-types', [InventoryController::class, 'movementTypes'])->name('inventory.movement-types');

    // Inventory CRUD
    Route::apiResource('inventories', InventoryController::class)->names('inventory');
});
