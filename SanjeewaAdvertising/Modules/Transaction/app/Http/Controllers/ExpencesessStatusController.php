<?php

namespace Modules\Transaction\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\Transaction\Http\Requests\StoreExpencesessStatusRequest;
use Modules\Transaction\Http\Requests\UpdateExpencesessStatusRequest;
use Modules\Transaction\Services\ExpencesessService;
use Modules\Transaction\Transformers\ExpencesessStatusResource;

class ExpencesessStatusController extends BaseApiController
{
    public function __construct(
        protected ExpencesessService $expensesService
    ) {
    }

    /**
     * Display a listing of expense statuses.
     */
    public function index(): JsonResponse
    {
        $statuses = $this->expensesService->getAllStatuses();

        return $this->success(
            ExpencesessStatusResource::collection($statuses),
            'Expense statuses retrieved successfully.'
        );
    }

    /**
     * Store a newly created expense status in storage.
     */
    public function store(StoreExpencesessStatusRequest $request): JsonResponse
    {
        $status = $this->expensesService->createStatus($request->validated());

        return $this->created(
            new ExpencesessStatusResource($status),
            'Expense status created successfully.'
        );
    }

    /**
     * Display the specified expense status.
     */
    public function show(int $id): JsonResponse
    {
        $status = $this->expensesService->getStatusById($id);

        if (! $status) {
            return $this->notFound('Expense status not found.');
        }

        return $this->success(
            new ExpencesessStatusResource($status),
            'Expense status details retrieved successfully.'
        );
    }

    /**
     * Update the specified expense status in storage.
     */
    public function update(UpdateExpencesessStatusRequest $request, int $id): JsonResponse
    {
        $status = $this->expensesService->getStatusById($id);

        if (! $status) {
            return $this->notFound('Expense status not found.');
        }

        $updated = $this->expensesService->updateStatus($status, $request->validated());

        return $this->success(
            new ExpencesessStatusResource($updated),
            'Expense status updated successfully.'
        );
    }

    /**
     * Remove the specified expense status from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $status = $this->expensesService->getStatusById($id);

        if (! $status) {
            return $this->notFound('Expense status not found.');
        }

        $this->expensesService->deleteStatus($status);

        return $this->success(null, 'Expense status deleted successfully.');
    }
}
