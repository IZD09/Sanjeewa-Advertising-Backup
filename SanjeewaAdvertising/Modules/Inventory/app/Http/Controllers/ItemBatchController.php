<?php

namespace Modules\Inventory\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\Inventory\Http\Requests\StoreItemBatchRequest;
use Modules\Inventory\Services\ItemBatchService;

class ItemBatchController extends BaseApiController
{
    public function __construct(
        protected ItemBatchService $batchService
    ) {}

    /**
     * Display a listing of item batches.
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('all')) {
            $batches = $this->batchService->getAllBatches($request->query());

            return $this->success($batches, 'Item batches retrieved successfully.');
        }

        $perPage = max(1, (int) $request->input('per_page', 20));
        $paginator = $this->batchService->paginateBatches($request->query(), $perPage);

        return $this->paginated($paginator, 'Item batches retrieved successfully.');
    }

    /**
     * Store a newly created item batch.
     */
    public function store(StoreItemBatchRequest $request): JsonResponse
    {
        $batch = $this->batchService->createBatch($request->validated());

        return $this->created($batch, 'Item batch created successfully.');
    }

    /**
     * Display the specified item batch.
     */
    public function show(int $id): JsonResponse
    {
        $batch = $this->batchService->getBatchById($id);
        if (! $batch) {
            return $this->notFound('Item batch not found.');
        }

        return $this->success($batch, 'Item batch details retrieved successfully.');
    }

    /**
     * Remove the specified item batch from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $batch = $this->batchService->getBatchById($id);
        if (! $batch) {
            return $this->notFound('Item batch not found.');
        }

        $this->batchService->deleteBatch($batch);

        return $this->success(null, 'Item batch deleted successfully.');
    }
}
