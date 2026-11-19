<?php

namespace Modules\Design\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\Design\Http\Requests\StorePrintTypeRequest;
use Modules\Design\Http\Requests\UpdatePrintTypeRequest;
use Modules\Design\Services\DesignService;
use Modules\Design\Transformers\PrintCostResource;
use Modules\Design\Transformers\PrintTypeResource;

class PrintTypeController extends BaseApiController
{
    public function __construct(
        protected DesignService $designService
    ) {
    }

    /**
     * Display a listing of print types with optional search.
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $printTypes = $this->designService->getAllPrintTypes($request->query());

            return $this->success(
                PrintTypeResource::collection($printTypes),
                'All print types retrieved successfully.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $printTypes = $this->designService->getPrintTypes($request->query(), $perPage);

        $printTypes->through(fn ($item) => new PrintTypeResource($item));

        return $this->paginated($printTypes, 'Print types retrieved successfully.');
    }

    /**
     * Retrieve all print types without pagination limit.
     */
    public function all(Request $request): JsonResponse
    {
        $printTypes = $this->designService->getAllPrintTypes($request->query());

        return $this->success(
            PrintTypeResource::collection($printTypes),
            'All print types retrieved successfully.'
        );
    }

    /**
     * Search print types.
     */
    public function search(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $printTypes = $this->designService->getAllPrintTypes($request->query());

            return $this->success(
                PrintTypeResource::collection($printTypes),
                'Print types search results.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $printTypes = $this->designService->getPrintTypes($request->query(), $perPage);

        $printTypes->through(fn ($item) => new PrintTypeResource($item));

        return $this->paginated($printTypes, 'Print types search results.');
    }

    /**
     * Store a newly created print type.
     */
    public function store(StorePrintTypeRequest $request): JsonResponse
    {
        $printType = $this->designService->createPrintType($request->validated());

        return $this->created(
            new PrintTypeResource($printType),
            'Print type created successfully.'
        );
    }

    /**
     * Display the specified print type.
     */
    public function show(int $id): JsonResponse
    {
        $printType = $this->designService->getPrintTypeById($id);

        if (! $printType) {
            return $this->notFound('Print type not found.');
        }

        return $this->success(
            new PrintTypeResource($printType),
            'Print type details retrieved successfully.'
        );
    }

    /**
     * Update the specified print type.
     */
    public function update(UpdatePrintTypeRequest $request, int $id): JsonResponse
    {
        $printType = $this->designService->getPrintTypeById($id);

        if (! $printType) {
            return $this->notFound('Print type not found.');
        }

        $updated = $this->designService->updatePrintType($printType, $request->validated());

        return $this->success(
            new PrintTypeResource($updated),
            'Print type updated successfully.'
        );
    }

    /**
     * Remove the specified print type.
     */
    public function destroy(int $id): JsonResponse
    {
        $printType = $this->designService->getPrintTypeById($id);

        if (! $printType) {
            return $this->notFound('Print type not found.');
        }

        $this->designService->deletePrintType($printType);

        return $this->success(null, 'Print type deleted successfully.');
    }

    /**
     * Get costs configured for this print type.
     */
    public function costs(int $id): JsonResponse
    {
        $printType = $this->designService->getPrintTypeById($id);

        if (! $printType) {
            return $this->notFound('Print type not found.');
        }

        $costs = $this->designService->getAllPrintCosts(['print_types_id' => $id]);

        return $this->success(
            PrintCostResource::collection($costs),
            'Print type costs retrieved successfully.'
        );
    }
}
