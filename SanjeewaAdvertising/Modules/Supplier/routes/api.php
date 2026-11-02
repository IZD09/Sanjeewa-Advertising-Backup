<?php

use Illuminate\Support\Facades\Route;
use Modules\Supplier\Http\Controllers\GrnController;
use Modules\Supplier\Http\Controllers\PurchaseOrderController;
use Modules\Supplier\Http\Controllers\SupplierController;

Route::prefix('v1')->group(function () {
    // Suppliers
    Route::get('suppliers/all', [SupplierController::class, 'all'])->name('supplier.all');
    Route::get('suppliers/search', [SupplierController::class, 'search'])->name('supplier.search');
    Route::get('suppliers/{id}/purchase-orders', [SupplierController::class, 'purchaseOrders'])->name('supplier.purchase-orders');
    Route::apiResource('suppliers', SupplierController::class)
        ->parameters(['suppliers' => 'id'])
        ->names('supplier');

    // Purchase Orders
    Route::get('purchase-orders/all', [PurchaseOrderController::class, 'all'])->name('supplier.purchase-orders.all');
    Route::post('purchase-orders/{id}/items', [PurchaseOrderController::class, 'addItem'])->name('supplier.purchase-orders.items.add');
    Route::apiResource('purchase-orders', PurchaseOrderController::class)
        ->parameters(['purchase-orders' => 'id'])
        ->names('supplier.purchase-orders');

    // GRNs (Goods Received Notes)
    Route::get('grns/all', [GrnController::class, 'all'])->name('supplier.grns.all');
    Route::apiResource('grns', GrnController::class)
        ->parameters(['grns' => 'id'])
        ->names('supplier.grns');
});
