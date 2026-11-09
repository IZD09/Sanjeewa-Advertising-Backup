<?php

namespace Modules\PrintJob\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\PrintJob\Http\Requests\Status\StorePrintJobStatusRequest;
use Modules\PrintJob\Http\Requests\Status\UpdatePrintJobStatusRequest;
use Modules\PrintJob\Services\PrintJobStatusService;
use Modules\PrintJob\Transformers\PrintJobStatusResource;

class PrintJobStatusController extends BaseApiController
{
    public function __construct(
        protected PrintJobStatusService $statusService
    ) {}

    /**
     * Display a listing of all available print job statuses.
     */
    public function index(): JsonResponse
    {
        $statuses = $this->statusService->getAllStatuses();

        return $this->success(
            PrintJobStatusResource::collection($statuses),
            'Print job statuses retrieved successfully.'
        );
    }

    /**
     * Store a newly created print job status.
     */
    public function store(StorePrintJobStatusRequest $request): JsonResponse
    {
        $status = $this->statusService->createStatus($request->validated());

        return $this->created(
            new PrintJobStatusResource($status),
            'Print job status created successfully.'
        );
    }

    /**
     * Display the specified print job status.
     */
    public function show(int $id): JsonResponse
    {
        $status = $this->statusService->getStatusById($id);

        if (! $status) {
            return $this->notFound('Print job status not found.');
        }

        return $this->success(
            new PrintJobStatusResource($status),
            'Print job status retrieved successfully.'
        );
    }

    /**
     * Update the specified print job status.
     */
    public function update(UpdatePrintJobStatusRequest $request, int $id): JsonResponse
    {
        $status = $this->statusService->getStatusById($id);

        if (! $status) {
            return $this->notFound('Print job status not found.');
        }

        $updated = $this->statusService->updateStatus($status, $request->validated());

        return $this->success(
            new PrintJobStatusResource($updated),
            'Print job status updated successfully.'
        );
    }

    /**
     * Remove the specified print job status.
     */
    public function destroy(int $id): JsonResponse
    {
        $status = $this->statusService->getStatusById($id);

        if (! $status) {
            return $this->notFound('Print job status not found.');
        }

        $this->statusService->deleteStatus($status);

        return $this->success(null, 'Print job status deleted successfully.');
    }
}
