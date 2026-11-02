<?php

namespace Modules\PrintJob\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\PrintJob\Http\Requests\PrintJob\AssignStockItemRequest;
use Modules\PrintJob\Http\Requests\PrintJob\ChangePrintJobStatusRequest;
use Modules\PrintJob\Http\Requests\PrintJob\StorePrintJobRequest;
use Modules\PrintJob\Http\Requests\PrintJob\UpdatePrintJobCostRequest;
use Modules\PrintJob\Http\Requests\PrintJob\UpdatePrintJobRequest;
use Modules\PrintJob\Services\PrintJobService;
use Modules\PrintJob\Transformers\PrintJobCostResource;
use Modules\PrintJob\Transformers\PrintJobResource;
use Modules\PrintJob\Transformers\PrintJobStatusHistoryResource;

class PrintJobController extends BaseApiController
{
    public function __construct(
        protected PrintJobService $printJobService
    ) {}

    /**
     * Display a listing of print jobs with search and filter capabilities.
     * Supports pagination or retrieving all items via ?all=true or ?per_page=all.
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $printJobs = $this->printJobService->getAllPrintJobs($request->query());

            return $this->success(
                PrintJobResource::collection($printJobs),
                'All print jobs retrieved successfully.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $printJobs = $this->printJobService->getPrintJobs($request->query(), $perPage);

        $printJobs->through(fn ($job) => new PrintJobResource($job));

        return $this->paginated($printJobs, 'Print jobs retrieved successfully.');
    }

    /**
     * Retrieve place order demo dataset without connecting to database (matching DashboardService approach).
     */
    public function placeOrderData(Request $request): JsonResponse
    {
        $data = $this->printJobService->getPlaceOrderData($request->all());

        return $this->success(
            $data,
            'Place order data retrieved successfully.'
        );
    }

    /**
     * Retrieve all print jobs matching criteria without pagination limit.
     */
<<<<<<< HEAD
    public function all(Request $request): JsonResponse
=======
    public function store(Request $request)
    {
    }

    /**
     * Show the specified resource.
     */
    public function show($id)
>>>>>>> origin/Ardithya
    {
        $printJobs = $this->printJobService->getAllPrintJobs($request->query());

        return $this->success(
            PrintJobResource::collection($printJobs),
            'All print jobs retrieved successfully.'
        );
    }

    /**
     * Search print jobs across IDs, customer name, mobile, print type, and status.
     */
    public function search(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $printJobs = $this->printJobService->getAllPrintJobs($request->query());

            return $this->success(
                PrintJobResource::collection($printJobs),
                'Print jobs search results.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $printJobs = $this->printJobService->getPrintJobs($request->query(), $perPage);

        $printJobs->through(fn ($job) => new PrintJobResource($job));

        return $this->paginated($printJobs, 'Print jobs search results.');
    }

    /**
     * Store a newly created print job in storage.
     */
<<<<<<< HEAD
    public function store(StorePrintJobRequest $request): JsonResponse
    {
        $printJob = $this->printJobService->createPrintJob($request->validated());

        return $this->created(
            new PrintJobResource($printJob),
            'Print job created successfully.'
        );
=======
    public function update(Request $request, $id)
    {
>>>>>>> origin/Ardithya
    }

    /**
     * Display the specified print job details with relationships.
     */
<<<<<<< HEAD
    public function show(int $id): JsonResponse
    {
        $printJob = $this->printJobService->getPrintJobById($id);

        if (! $printJob) {
            return $this->notFound('Print job not found.');
        }

        return $this->success(
            new PrintJobResource($printJob),
            'Print job details retrieved successfully.'
        );
    }

    /**
     * Update the specified print job in storage.
     */
    public function update(UpdatePrintJobRequest $request, int $id): JsonResponse
    {
        $printJob = $this->printJobService->getPrintJobById($id);

        if (! $printJob) {
            return $this->notFound('Print job not found.');
        }

        $updatedJob = $this->printJobService->updatePrintJob($printJob, $request->validated());

        return $this->success(
            new PrintJobResource($updatedJob),
            'Print job updated successfully.'
        );
    }

    /**
     * Remove the specified print job from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $printJob = $this->printJobService->getPrintJobById($id);

        if (! $printJob) {
            return $this->notFound('Print job not found.');
        }

        $this->printJobService->deletePrintJob($printJob);

        return $this->success(null, 'Print job deleted successfully.');
    }

    /**
     * Update the status of the specified print job.
     */
    public function updateStatus(ChangePrintJobStatusRequest $request, int $id): JsonResponse
    {
        $printJob = $this->printJobService->getPrintJobById($id);

        if (! $printJob) {
            return $this->notFound('Print job not found.');
        }

        $updatedJob = $this->printJobService->updateStatus(
            $printJob,
            $request->integer('print_job_statuses_id')
        );

        return $this->success(
            new PrintJobResource($updatedJob),
            'Print job status updated successfully.'
        );
    }

    /**
     * Get status timeline history for a specific print job.
     */
    public function statusHistory(int $id): JsonResponse
    {
        $printJob = $this->printJobService->getPrintJobById($id);

        if (! $printJob) {
            return $this->notFound('Print job not found.');
        }

        $history = $this->printJobService->getStatusHistory($id);

        return $this->success(
            PrintJobStatusHistoryResource::collection($history),
            'Print job status history retrieved successfully.'
        );
    }

    /**
     * Assign or update a stock item on the specified print job.
     */
    public function assignStockItem(AssignStockItemRequest $request, int $id): JsonResponse
    {
        $printJob = $this->printJobService->getPrintJobById($id);

        if (! $printJob) {
            return $this->notFound('Print job not found.');
        }

        $updatedJob = $this->printJobService->assignStockItem(
            $printJob,
            $request->integer('stock_id'),
            $request->integer('qty')
        );

        return $this->success(
            new PrintJobResource($updatedJob),
            'Stock item assigned to print job successfully.'
        );
    }

    /**
     * Remove a stock item from the print job.
     */
    public function removeStockItem(int $id, int $stockId): JsonResponse
    {
        $printJob = $this->printJobService->getPrintJobById($id);

        if (! $printJob) {
            return $this->notFound('Print job not found.');
        }

        $updatedJob = $this->printJobService->removeStockItem($printJob, $stockId);

        return $this->success(
            new PrintJobResource($updatedJob),
            'Stock item removed from print job successfully.'
        );
    }

    /**
     * Update cost details and print cost items for a print job.
     */
    public function updateCost(UpdatePrintJobCostRequest $request, int $id): JsonResponse
    {
        $printJob = $this->printJobService->getPrintJobById($id);

        if (! $printJob) {
            return $this->notFound('Print job not found.');
        }

        $cost = $this->printJobService->updateCost(
            $printJob,
            (float) $request->input('discount'),
            (array) $request->input('print_cost_ids', [])
        );

        return $this->success(
            new PrintJobCostResource($cost),
            'Print job cost updated successfully.'
        );
=======
    public function destroy($id)
    {
>>>>>>> origin/Ardithya
    }
}
