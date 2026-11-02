<?php

namespace Modules\Supplier\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\Supplier\Http\Requests\StoreGrnRequest;
use Modules\Supplier\Services\GrnService;
use Modules\Supplier\Transformers\GrnResource;

class GrnController extends BaseApiController
{
    public function __construct(
        protected GrnService $grnService
    ) {}

    /**
     * Display a listing of GRNs.
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $grns = $this->grnService->getAllGrns($request->query());

            return $this->success(
                GrnResource::collection($grns),
                'All GRNs retrieved successfully.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $grns = $this->grnService->getGrns($request->query(), $perPage);

        $grns->through(fn ($item) => new GrnResource($item));

        return $this->paginated($grns, 'GRNs retrieved successfully.');
    }

    /**
     * Retrieve all GRNs without pagination.
     */
    public function all(Request $request): JsonResponse
    {
        $grns = $this->grnService->getAllGrns($request->query());

        return $this->success(
            GrnResource::collection($grns),
            'All GRNs retrieved successfully.'
        );
    }

    /**
     * Store a newly created GRN.
     */
    public function store(StoreGrnRequest $request): JsonResponse
    {
        $grn = $this->grnService->createGrn($request->validated());

        return $this->created(
            new GrnResource($grn),
            'Goods Received Note (GRN) created successfully.'
        );
    }

    /**
     * Display the specified GRN.
     */
    public function show(int $id): JsonResponse
    {
        $grn = $this->grnService->getGrnById($id);

        if (! $grn) {
            return $this->notFound('GRN not found.');
        }

        return $this->success(
            new GrnResource($grn),
            'GRN details retrieved successfully.'
        );
    }

    /**
     * Remove the specified GRN.
     */
    public function destroy(int $id): JsonResponse
    {
        $grn = $this->grnService->getGrnById($id);

        if (! $grn) {
            return $this->notFound('GRN not found.');
        }

        $this->grnService->deleteGrn($grn);

        return $this->success(null, 'GRN deleted successfully.');
    }
}
