<?php

namespace Modules\Inventory\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\Inventory\Http\Requests\StoreGrnItemRequest;
use Modules\Inventory\Services\GrnItemService;

class GrnItemController extends BaseApiController
{
    public function __construct(
        protected GrnItemService $grnItemService
    ) {}

    /**
     * Display a listing of GRN items.
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('all')) {
            $items = $this->grnItemService->getAllGrnItems($request->query());

            return $this->success($items, 'GRN items retrieved successfully.');
        }

        $perPage = max(1, (int) $request->input('per_page', 20));
        $paginator = $this->grnItemService->paginateGrnItems($request->query(), $perPage);

        return $this->paginated($paginator, 'GRN items retrieved successfully.');
    }

    /**
     * Display all items associated with a specific GRN.
     */
    public function byGrn(int $grnId): JsonResponse
    {
        $items = $this->grnItemService->getItemsByGrnId($grnId);

        return $this->success($items, 'GRN line items retrieved successfully.');
    }

    /**
     * Store a newly created GRN item record.
     */
    public function store(StoreGrnItemRequest $request): JsonResponse
    {
        $item = $this->grnItemService->createGrnItem($request->validated());

        return $this->created($item, 'GRN item recorded successfully.');
    }

    /**
     * Remove the specified GRN item record.
     */
    public function destroy(int $grnId, int $itemBatchesId, int $stockId): JsonResponse
    {
        $deleted = $this->grnItemService->deleteGrnItem($grnId, $itemBatchesId, $stockId);
        if (! $deleted) {
            return $this->notFound('GRN item record not found.');
        }

        return $this->success(null, 'GRN item deleted successfully.');
    }
}
