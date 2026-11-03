<?php

namespace Modules\Transaction\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\Transaction\Http\Requests\StoreExpencesessRequest;
use Modules\Transaction\Http\Requests\UpdateExpencesessRequest;
use Modules\Transaction\Services\ExpencesessService;
use Modules\Transaction\Transformers\ExpencesessResource;
use Modules\Transaction\Transformers\ExpencesessStatusResource;
use Modules\Transaction\Transformers\ExpencesessTypeResource;

class ExpencesessController extends BaseApiController
{
    public function __construct(
        protected ExpencesessService $expensesService
    ) {}

    /**
     * Display a listing of operating expenses with pagination or all.
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $expenses = $this->expensesService->getAllExpencesess($request->query());

            return $this->success(
                ExpencesessResource::collection($expenses),
                'All operating expenses retrieved successfully.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $expenses = $this->expensesService->getExpencesess($request->query(), $perPage);

        $expenses->through(fn ($expense) => new ExpencesessResource($expense));

        return $this->paginated($expenses, 'Operating expenses retrieved successfully.');
    }

    /**
     * Retrieve all operating expenses matching criteria without pagination limit.
     */
    public function all(Request $request): JsonResponse
    {
        $expenses = $this->expensesService->getAllExpencesess($request->query());

        return $this->success(
            ExpencesessResource::collection($expenses),
            'All operating expenses retrieved successfully.'
        );
    }

    /**
     * Retrieve Operating Expenses data and KPIs for UI views.
     */
    public function expensesData(Request $request): JsonResponse
    {
        $data = $this->expensesService->getOperatingExpensesData($request->all());

        return $this->success(
            $data,
            'Operating expenses data retrieved successfully.'
        );
    }

    /**
     * Store a newly created expense in storage.
     */
    public function store(StoreExpencesessRequest $request): JsonResponse
    {
        $expense = $this->expensesService->createExpencesess($request->validated());

        return $this->created(
            new ExpencesessResource($expense),
            'Operating expense created successfully.'
        );
    }

    /**
     * Display the specified expense.
     */
    public function show(int $id): JsonResponse
    {
        $expense = $this->expensesService->getExpencesessById($id);

        if (! $expense) {
            return $this->notFound('Operating expense not found.');
        }

        return $this->success(
            new ExpencesessResource($expense),
            'Operating expense details retrieved successfully.'
        );
    }

    /**
     * Update the specified expense in storage.
     */
    public function update(UpdateExpencesessRequest $request, int $id): JsonResponse
    {
        $expense = $this->expensesService->getExpencesessById($id);

        if (! $expense) {
            return $this->notFound('Operating expense not found.');
        }

        $updated = $this->expensesService->updateExpencesess($expense, $request->validated());

        return $this->success(
            new ExpencesessResource($updated),
            'Operating expense updated successfully.'
        );
    }

    /**
     * Remove the specified expense from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $expense = $this->expensesService->getExpencesessById($id);

        if (! $expense) {
            return $this->notFound('Operating expense not found.');
        }

        $this->expensesService->deleteExpencesess($expense);

        return $this->success(null, 'Operating expense deleted successfully.');
    }

    /**
     * Retrieve all available expense types.
     */
    public function types(): JsonResponse
    {
        $types = $this->expensesService->getAllTypes();

        return $this->success(
            ExpencesessTypeResource::collection($types),
            'Expense types retrieved successfully.'
        );
    }

    /**
     * Retrieve all available expense statuses.
     */
    public function statuses(): JsonResponse
    {
        $statuses = $this->expensesService->getAllStatuses();

        return $this->success(
            ExpencesessStatusResource::collection($statuses),
            'Expense statuses retrieved successfully.'
        );
    }
}
