<?php

namespace Modules\Transaction\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\Transaction\Http\Requests\StoreExpencesessTypeRequest;
use Modules\Transaction\Http\Requests\UpdateExpencesessTypeRequest;
use Modules\Transaction\Services\ExpencesessService;
use Modules\Transaction\Transformers\ExpencesessTypeResource;

class ExpencesessTypeController extends BaseApiController
{
    public function __construct(
        protected ExpencesessService $expensesService
    ) {
    }

    /**
     * Display a listing of expense types.
     */
    public function index(): JsonResponse
    {
        $types = $this->expensesService->getAllTypes();

        return $this->success(
            ExpencesessTypeResource::collection($types),
            'Expense types retrieved successfully.'
        );
    }

    /**
     * Store a newly created expense type in storage.
     */
    public function store(StoreExpencesessTypeRequest $request): JsonResponse
    {
        $type = $this->expensesService->createType($request->validated());

        return $this->created(
            new ExpencesessTypeResource($type),
            'Expense type created successfully.'
        );
    }

    /**
     * Display the specified expense type.
     */
    public function show(int $id): JsonResponse
    {
        $type = $this->expensesService->getTypeById($id);

        if (! $type) {
            return $this->notFound('Expense type not found.');
        }

        return $this->success(
            new ExpencesessTypeResource($type),
            'Expense type details retrieved successfully.'
        );
    }

    /**
     * Update the specified expense type in storage.
     */
    public function update(UpdateExpencesessTypeRequest $request, int $id): JsonResponse
    {
        $type = $this->expensesService->getTypeById($id);

        if (! $type) {
            return $this->notFound('Expense type not found.');
        }

        $updated = $this->expensesService->updateType($type, $request->validated());

        return $this->success(
            new ExpencesessTypeResource($updated),
            'Expense type updated successfully.'
        );
    }

    /**
     * Remove the specified expense type from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $type = $this->expensesService->getTypeById($id);

        if (! $type) {
            return $this->notFound('Expense type not found.');
        }

        $this->expensesService->deleteType($type);

        return $this->success(null, 'Expense type deleted successfully.');
    }
}
