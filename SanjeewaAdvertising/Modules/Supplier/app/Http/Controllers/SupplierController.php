<?php

namespace Modules\Supplier\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\Supplier\Http\Requests\StoreSupplierRequest;
use Modules\Supplier\Http\Requests\UpdateSupplierRequest;
use Modules\Supplier\Services\SupplierService;
use Modules\Supplier\Transformers\PurchaseOrderResource;
use Modules\Supplier\Transformers\SupplierResource;

class SupplierController extends BaseApiController
{
    public function __construct(
        protected SupplierService $supplierService
    ) {
    }

    /**
     * Display a listing of suppliers.
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $suppliers = $this->supplierService->getAllSuppliers($request->query());

            return $this->success(
                SupplierResource::collection($suppliers),
                'All suppliers retrieved successfully.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $suppliers = $this->supplierService->getSuppliers($request->query(), $perPage);

        $suppliers->through(fn ($item) => new SupplierResource($item));

        return $this->paginated($suppliers, 'Suppliers retrieved successfully.');
    }

    /**
     * Retrieve all suppliers without pagination limit.
     */
    public function all(Request $request): JsonResponse
    {
        $suppliers = $this->supplierService->getAllSuppliers($request->query());

        return $this->success(
            SupplierResource::collection($suppliers),
            'All suppliers retrieved successfully.'
        );
    }

    /**
     * Search suppliers.
     */
    public function search(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $suppliers = $this->supplierService->getAllSuppliers($request->query());

            return $this->success(
                SupplierResource::collection($suppliers),
                'Suppliers search results.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $suppliers = $this->supplierService->getSuppliers($request->query(), $perPage);

        $suppliers->through(fn ($item) => new SupplierResource($item));

        return $this->paginated($suppliers, 'Suppliers search results.');
    }

    /**
     * Store a newly created supplier.
     */
    public function store(StoreSupplierRequest $request): JsonResponse
    {
        $supplier = $this->supplierService->createSupplier($request->validated());

        return $this->created(
            new SupplierResource($supplier),
            'Supplier created successfully.'
        );
    }

    /**
     * Display the specified supplier.
     */
    public function show(int $id): JsonResponse
    {
        $supplier = $this->supplierService->getSupplierById($id);

        if (! $supplier) {
            return $this->notFound('Supplier not found.');
        }

        return $this->success(
            new SupplierResource($supplier),
            'Supplier details retrieved successfully.'
        );
    }

    /**
     * Update the specified supplier.
     */
    public function update(UpdateSupplierRequest $request, int $id): JsonResponse
    {
        $supplier = $this->supplierService->getSupplierById($id);

        if (! $supplier) {
            return $this->notFound('Supplier not found.');
        }

        $updated = $this->supplierService->updateSupplier($supplier, $request->validated());

        return $this->success(
            new SupplierResource($updated),
            'Supplier updated successfully.'
        );
    }

    /**
     * Remove the specified supplier.
     */
    public function destroy(int $id): JsonResponse
    {
        $supplier = $this->supplierService->getSupplierById($id);

        if (! $supplier) {
            return $this->notFound('Supplier not found.');
        }

        $this->supplierService->deleteSupplier($supplier);

        return $this->success(null, 'Supplier deleted successfully.');
    }

    /**
     * Get purchase orders for the specified supplier.
     */
    public function purchaseOrders(Request $request, int $id): JsonResponse
    {
        $supplier = $this->supplierService->getSupplierById($id);

        if (! $supplier) {
            return $this->notFound('Supplier not found.');
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $orders = $supplier->purchaseOrders()->with(['items.stockItem'])->paginate($perPage);

        $orders->through(fn ($item) => new PurchaseOrderResource($item));

        return $this->paginated($orders, 'Supplier purchase orders retrieved successfully.');
    }
}
