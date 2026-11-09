<?php

namespace Modules\Inventory\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\Inventory\Http\Requests\StoreStockRequest;
use Modules\Inventory\Http\Requests\UpdateStockRequest;
use Modules\Inventory\Models\Stock;
use Modules\Inventory\Services\StockService;

class StockController extends BaseApiController
{
    public function __construct(
        protected StockService $stockService
    ) {}

    /**
     * Display a listing of material stock inventory with KPI metrics.
     */
    public function index(Request $request): JsonResponse
    {
        $data = $this->stockService->getStockInventoryData($request->query());

        return $this->success($data, 'Material stock inventory data retrieved successfully.');
    }

    /**
     * Retrieve dropdown master data for Add/Update Stock Modal.
     */
    public function formData(): JsonResponse
    {
        $data = $this->stockService->getFormData();

        return $this->success($data, 'Stock form master data retrieved successfully.');
    }

    /**
     * Store a newly created stock shipment (New Stock).
     */
    public function store(StoreStockRequest $request): JsonResponse
    {
        $stock = $this->stockService->createStock($request->validated());
        $transformed = $this->stockService->transformStockRecord($stock);

        return $this->created($transformed, 'New stock record created and inventory updated successfully.');
    }

    /**
     * Update an existing stock entry (Receive to Existing Stock).
     */
    public function update(UpdateStockRequest $request, Stock $stock): JsonResponse
    {
        $updated = $this->stockService->updateStock($stock, $request->validated());
        $transformed = $this->stockService->transformStockRecord($updated);

        return $this->success($transformed, 'Existing stock updated and quantity incremented successfully.');
    }

    /**
     * Display the specified stock record.
     */
    public function show(Stock $stock): JsonResponse
    {
        $stock->load(['stockItem.subcategory.category', 'brand', 'grn', 'grmItems.itemBatch']);
        $transformed = $this->stockService->transformStockRecord($stock);

        return $this->success($transformed, 'Stock record retrieved successfully.');
    }
}
