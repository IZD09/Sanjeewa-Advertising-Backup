<?php

namespace Modules\Supplier\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\Supplier\Http\Requests\StorePurchaseOrderRequest;
use Modules\Supplier\Http\Requests\UpdatePurchaseOrderRequest;
use Modules\Supplier\Services\PurchaseOrderService;
use Modules\Supplier\Transformers\PurchaseOrderItemResource;
use Modules\Supplier\Transformers\PurchaseOrderResource;

class PurchaseOrderController extends BaseApiController
{
    public function __construct(
        protected PurchaseOrderService $purchaseOrderService
    ) {}

    /**
     * Display a listing of purchase orders.
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $orders = $this->purchaseOrderService->getAllPurchaseOrders($request->query());

            return $this->success(
                PurchaseOrderResource::collection($orders),
                'All purchase orders retrieved successfully.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $orders = $this->purchaseOrderService->getPurchaseOrders($request->query(), $perPage);

        $orders->through(fn ($item) => new PurchaseOrderResource($item));

        return $this->paginated($orders, 'Purchase orders retrieved successfully.');
    }

    /**
     * Retrieve all purchase orders without pagination.
     */
    public function all(Request $request): JsonResponse
    {
        $orders = $this->purchaseOrderService->getAllPurchaseOrders($request->query());

        return $this->success(
            PurchaseOrderResource::collection($orders),
            'All purchase orders retrieved successfully.'
        );
    }

    /**
     * Store a newly created purchase order.
     */
    public function store(StorePurchaseOrderRequest $request): JsonResponse
    {
        $order = $this->purchaseOrderService->createPurchaseOrder($request->validated());

        return $this->created(
            new PurchaseOrderResource($order),
            'Purchase order created successfully.'
        );
    }

    /**
     * Display the specified purchase order.
     */
    public function show(int $id): JsonResponse
    {
        $order = $this->purchaseOrderService->getPurchaseOrderById($id);

        if (! $order) {
            return $this->notFound('Purchase order not found.');
        }

        return $this->success(
            new PurchaseOrderResource($order),
            'Purchase order details retrieved successfully.'
        );
    }

    /**
     * Update the specified purchase order.
     */
    public function update(UpdatePurchaseOrderRequest $request, int $id): JsonResponse
    {
        $order = $this->purchaseOrderService->getPurchaseOrderById($id);

        if (! $order) {
            return $this->notFound('Purchase order not found.');
        }

        $updated = $this->purchaseOrderService->updatePurchaseOrder($order, $request->validated());

        return $this->success(
            new PurchaseOrderResource($updated),
            'Purchase order updated successfully.'
        );
    }

    /**
     * Remove the specified purchase order.
     */
    public function destroy(int $id): JsonResponse
    {
        $order = $this->purchaseOrderService->getPurchaseOrderById($id);

        if (! $order) {
            return $this->notFound('Purchase order not found.');
        }

        $this->purchaseOrderService->deletePurchaseOrder($order);

        return $this->success(null, 'Purchase order deleted successfully.');
    }

    /**
     * Add an item to a purchase order.
     */
    public function addItem(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'stock_items_id' => ['required', 'integer', 'exists:stock_items,id'],
            'unit_cost' => ['required', 'numeric', 'min:0'],
            'qty_ordered' => ['required', 'integer', 'min:1'],
            'qty_received' => ['nullable', 'integer', 'min:0'],
        ]);

        $order = $this->purchaseOrderService->getPurchaseOrderById($id);

        if (! $order) {
            return $this->notFound('Purchase order not found.');
        }

        $item = $this->purchaseOrderService->addItem($order, $request->all());

        return $this->created(
            new PurchaseOrderItemResource($item),
            'Item added to purchase order successfully.'
        );
    }
}
