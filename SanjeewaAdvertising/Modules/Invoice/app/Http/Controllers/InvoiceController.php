<?php

namespace Modules\Invoice\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\Invoice\Http\Requests\StoreInvoiceRequest;
use Modules\Invoice\Http\Requests\UpdateInvoiceRequest;
use Modules\Invoice\Services\InvoiceService;
use Modules\Invoice\Transformers\InvoiceResource;

class InvoiceController extends BaseApiController
{
    public function __construct(
        protected InvoiceService $invoiceService
    ) {}

    /**
     * Display a listing of invoices with optional search and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $invoices = $this->invoiceService->getAllInvoices($request->query());

            return $this->success(
                InvoiceResource::collection($invoices),
                'All invoices retrieved successfully.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $invoices = $this->invoiceService->getInvoices($request->query(), $perPage);

        $invoices->through(fn ($item) => new InvoiceResource($item));

        return $this->paginated($invoices, 'Invoices retrieved successfully.');
    }

    /**
     * Retrieve all invoices without pagination limit.
     */
    public function all(Request $request): JsonResponse
    {
        $invoices = $this->invoiceService->getAllInvoices($request->query());

        return $this->success(
            InvoiceResource::collection($invoices),
            'All invoices retrieved successfully.'
        );
    }

    /**
     * Retrieve live available print jobs from database for invoice payment selection.
     */
    public function availableJobs(Request $request): JsonResponse
    {
        $jobs = $this->invoiceService->getAvailablePrintJobs($request->all());

        return $this->success(
            $jobs,
            'Available print jobs retrieved successfully from database.'
        );
    }

    /**
     * Retrieve invoice payments data and KPIs for UI views.
     */
    public function invoicesData(Request $request): JsonResponse
    {
        $data = $this->invoiceService->getInvoicePaymentsData($request->all());

        return $this->success(
            $data,
            'Invoice payments data retrieved successfully.'
        );
    }

    /**
     * Search invoices.
     */
    public function search(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $invoices = $this->invoiceService->getAllInvoices($request->query());

            return $this->success(
                InvoiceResource::collection($invoices),
                'Invoices search results.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $invoices = $this->invoiceService->getInvoices($request->query(), $perPage);

        $invoices->through(fn ($item) => new InvoiceResource($item));

        return $this->paginated($invoices, 'Invoices search results.');
    }

    /**
     * Store a newly created invoice in storage.
     */
    public function store(StoreInvoiceRequest $request): JsonResponse
    {
        $invoice = $this->invoiceService->createInvoice($request->validated());

        return $this->created(
            new InvoiceResource($invoice),
            'Invoice created successfully.'
        );
    }

    /**
     * Display the specified invoice.
     */
    public function show(int $id): JsonResponse
    {
        $invoice = $this->invoiceService->getInvoiceById($id);

        if (! $invoice) {
            return $this->notFound('Invoice not found.');
        }

        return $this->success(
            new InvoiceResource($invoice),
            'Invoice details retrieved successfully.'
        );
    }

    /**
     * Update the specified invoice in storage.
     */
    public function update(UpdateInvoiceRequest $request, int $id): JsonResponse
    {
        $invoice = $this->invoiceService->getInvoiceById($id);

        if (! $invoice) {
            return $this->notFound('Invoice not found.');
        }

        $updated = $this->invoiceService->updateInvoice($invoice, $request->validated());

        return $this->success(
            new InvoiceResource($updated),
            'Invoice updated successfully.'
        );
    }

    /**
     * Remove the specified invoice from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $invoice = $this->invoiceService->getInvoiceById($id);

        if (! $invoice) {
            return $this->notFound('Invoice not found.');
        }

        $this->invoiceService->deleteInvoice($invoice);

        return $this->success(null, 'Invoice deleted successfully.');
    }

    /**
     * Attach a print job to this invoice.
     */
    public function attachJob(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'print_job_id' => ['required', 'integer', 'exists:print_jobs,id'],
        ]);

        $invoice = $this->invoiceService->getInvoiceById($id);

        if (! $invoice) {
            return $this->notFound('Invoice not found.');
        }

        $updated = $this->invoiceService->attachPrintJob($invoice, $request->integer('print_job_id'));

        return $this->success(
            new InvoiceResource($updated),
            'Print job attached to invoice successfully.'
        );
    }

    /**
     * Detach a print job from this invoice.
     */
    public function detachJob(int $id, int $jobId): JsonResponse
    {
        $invoice = $this->invoiceService->getInvoiceById($id);

        if (! $invoice) {
            return $this->notFound('Invoice not found.');
        }

        $updated = $this->invoiceService->detachPrintJob($invoice, $jobId);

        return $this->success(
            new InvoiceResource($updated),
            'Print job detached from invoice successfully.'
        );
    }
}
