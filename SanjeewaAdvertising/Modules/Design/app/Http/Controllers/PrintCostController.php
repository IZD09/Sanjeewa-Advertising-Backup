<?php

namespace Modules\Design\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\Design\Http\Requests\StorePrintCostRequest;
use Modules\Design\Http\Requests\UpdatePrintCostRequest;
use Modules\Design\Services\DesignService;
use Modules\Design\Transformers\PrintCostResource;
use Modules\Design\Transformers\PrintCostTypeResource;

class PrintCostController extends BaseApiController
{
    public function __construct(
        protected DesignService $designService
    ) {
    }

    /**
     * Display a listing of print costs.
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $costs = $this->designService->getAllPrintCosts($request->query());

            return $this->success(
                PrintCostResource::collection($costs),
                'All print costs retrieved successfully.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $costs = $this->designService->getPrintCosts($request->query(), $perPage);

        $costs->through(fn ($item) => new PrintCostResource($item));

        return $this->paginated($costs, 'Print costs retrieved successfully.');
    }

    /**
     * Retrieve all print costs without pagination.
     */
    public function all(Request $request): JsonResponse
    {
        $costs = $this->designService->getAllPrintCosts($request->query());

        return $this->success(
            PrintCostResource::collection($costs),
            'All print costs retrieved successfully.'
        );
    }

    /**
     * Retrieve all print cost types.
     */
    public function costTypes(): JsonResponse
    {
        $costTypes = $this->designService->getAllCostTypes();

        return $this->success(
            PrintCostTypeResource::collection($costTypes),
            'Print cost types retrieved successfully.'
        );
    }

    /**
     * Store a newly created print cost.
     */
    public function store(StorePrintCostRequest $request): JsonResponse
    {
        $cost = $this->designService->createPrintCost($request->validated());

        return $this->created(
            new PrintCostResource($cost),
            'Print cost created successfully.'
        );
    }

    /**
     * Display the specified print cost.
     */
    public function show(int $id): JsonResponse
    {
        $cost = $this->designService->getPrintCostById($id);

        if (! $cost) {
            return $this->notFound('Print cost not found.');
        }

        return $this->success(
            new PrintCostResource($cost),
            'Print cost details retrieved successfully.'
        );
    }

    /**
     * Update the specified print cost.
     */
    public function update(UpdatePrintCostRequest $request, int $id): JsonResponse
    {
        $cost = $this->designService->getPrintCostById($id);

        if (! $cost) {
            return $this->notFound('Print cost not found.');
        }

        $updated = $this->designService->updatePrintCost($cost, $request->validated());

        return $this->success(
            new PrintCostResource($updated),
            'Print cost updated successfully.'
        );
    }

    /**
     * Remove the specified print cost.
     */
    public function destroy(int $id): JsonResponse
    {
        $cost = $this->designService->getPrintCostById($id);

        if (! $cost) {
            return $this->notFound('Print cost not found.');
        }

        $this->designService->deletePrintCost($cost);

        return $this->success(null, 'Print cost deleted successfully.');
    }
}
