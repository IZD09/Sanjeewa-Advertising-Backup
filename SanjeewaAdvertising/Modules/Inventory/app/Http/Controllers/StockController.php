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
    ) {
    }

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
     * Store a newly created stock shipment (New Stock) - supports single or bulk items.
     */
    public function store(StoreStockRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if (isset($validated['items']) && is_array($validated['items'])) {
            $createdStocks = $this->stockService->createStocksBulk($validated);
            $transformed = array_map(fn ($stock) => $this->stockService->transformStockRecord($stock), $createdStocks);

            return $this->created($transformed, count($createdStocks) . ' stock records created and inventory updated successfully.');
        }

        $stock = $this->stockService->createStock($validated);
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

    /**
     * Adjust an existing stock entry (Quantity adjustment, audit, damage, etc.).
     */
    public function adjust(Request $request, Stock $stock): JsonResponse
    {
        $validated = $request->validate([
            'adjustment_type' => ['nullable', 'string', 'in:ADD,DEDUCT,add,deduct'],
            'qty' => ['nullable', 'numeric'],
            'new_qty' => ['nullable', 'numeric'],
            'reason' => ['nullable', 'string', 'max:100'],
            'remarks' => ['nullable', 'string', 'max:500'],
        ]);

        $updated = $this->stockService->adjustStock($stock, $validated);
        $transformed = $this->stockService->transformStockRecord($updated);

        return $this->success($transformed, 'Stock quantity adjusted successfully.');
    }

    /**
     * Adjust stock directly by providing stock_id in request body.
     */
    public function adjustDirect(Request $request): JsonResponse
    {
        $request->validate([
            'stock_id' => ['required', 'integer', 'exists:stock,id'],
        ]);

        $stock = Stock::findOrFail((int) $request->input('stock_id'));

        return $this->adjust($request, $stock);
    }
}
