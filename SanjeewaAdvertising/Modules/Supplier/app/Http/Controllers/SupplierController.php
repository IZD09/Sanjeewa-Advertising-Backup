<?php

namespace Modules\Supplier\Http\Controllers;

use Illuminate\Database\QueryException;
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
    ) {}

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

        $perPage = max(1, min(100, (int) $request->query('per_page', 20)));
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
     * Retrieve suppliers demo data and summary counts for UI views.
     */
    public function suppliersData(Request $request): JsonResponse
    {
        $data = $this->supplierService->getSuppliersData($request->all());

        return $this->success(
            $data,
            'Suppliers data retrieved successfully.'
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

        $perPage = max(1, min(100, (int) $request->query('per_page', 20)));
        $suppliers = $this->supplierService->getSuppliers($request->query(), $perPage);

        $suppliers->through(fn ($item) => new SupplierResource($item));

        return $this->paginated($suppliers, 'Suppliers search results.');
    }

    /**
     * Store a newly created supplier.
     */
    public function store(StoreSupplierRequest $request): JsonResponse
    {
        try {
            $supplier = $this->supplierService->createSupplier($request->validated());

            return $this->created(
                new SupplierResource($supplier),
                'Supplier created successfully.'
            );
        } catch (QueryException $e) {
            if (isset($e->errorInfo[1]) && $e->errorInfo[1] === 1062) {
                return $this->error('A supplier with these details already exists.', 422);
            }

            throw $e;
        }
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

        try {
            $updated = $this->supplierService->updateSupplier($supplier, $request->validated());

            return $this->success(
                new SupplierResource($updated),
                'Supplier updated successfully.'
            );
        } catch (QueryException $e) {
            if (isset($e->errorInfo[1]) && $e->errorInfo[1] === 1062) {
                return $this->error('A supplier with these details already exists.', 422);
            }

            throw $e;
        }
    }

    /**
     * Disable the specified supplier instead of deleting.
     */
    public function destroy(int $id): JsonResponse
    {
        $supplier = $this->supplierService->getSupplierById($id);

        if (! $supplier) {
            return $this->notFound('Supplier not found.');
        }

        $this->supplierService->deleteSupplier($supplier);

        return $this->success(null, "Supplier '{$supplier->name}' disabled successfully.");
    }

    /**
     * Toggle active/disabled status for the specified supplier.
     */
    public function toggleStatus(int $id): JsonResponse
    {
        $supplier = $this->supplierService->getSupplierById($id);

        if (! $supplier) {
            return $this->notFound('Supplier not found.');
        }

        $updated = $this->supplierService->toggleSupplierStatus($supplier);
        $action = $updated->status === 'Disabled' ? 'disabled' : 'enabled';

        return $this->success(
            new SupplierResource($updated),
            "Supplier '{$updated->name}' {$action} successfully."
        );
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
