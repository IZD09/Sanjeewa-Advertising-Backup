<?php

namespace Modules\Invoice\Services;

use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Modules\Invoice\Models\Invoice;
use Modules\Invoice\Transformers\InvoiceResource;
use Modules\PrintJob\Models\PrintJob;
use Modules\Transaction\Models\Payment;

class InvoiceService
{
    /**
     * Build the query for invoices with relations, search, and filters.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<Invoice>
     */
    public function buildQuery(array $filters = []): Builder
    {
        $query = Invoice::query()->with(['customer', 'printJobs'])->withCount('printJobs');

        $search = $filters['search'] ?? $filters['q'] ?? null;
        if (! empty($search)) {
            $search = trim((string) $search);
            $query->where(function (Builder $q) use ($search) {
                if (is_numeric($search)) {
                    $q->where('id', (int) $search);
                }
                $q->orWhereHas('customer', function (Builder $cq) use ($search) {
                    $cq->where('name', 'like', "%{$search}%")
                        ->orWhere('mobile', 'like', "%{$search}%");
                });
            });
        }

        if (! empty($filters['customer_id'])) {
            $query->where('customer_id', (int) $filters['customer_id']);
        }

        if (! empty($filters['from_date'])) {
            $query->whereDate('invoice_at', '>=', $filters['from_date']);
        }

        if (! empty($filters['to_date'])) {
            $query->whereDate('invoice_at', '<=', $filters['to_date']);
        }

        $sortBy = (string) ($filters['sort_by'] ?? 'id');
        $sortOrder = strtolower((string) ($filters['sort_order'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['id', 'invoice_at', 'due_date', 'customer_id'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderByDesc('id');
        }

        return $query;
    }

    /**
     * Retrieve all invoices matching criteria.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Invoice>
     */
    /**
     * Auto-sync initial invoices from print jobs in database if invoice table is empty.
     */
    public function syncInvoicesFromPrintJobs(): void
    {
        if (Invoice::count() > 0) {
            return;
        }

        $printJobs = PrintJob::orderBy('id')->get();
        foreach ($printJobs as $job) {
            $addDate = $job->add_date ? Carbon::parse($job->add_date) : now();
            $invoice = Invoice::create([
                'customer_id' => $job->customer_id,
                'invoice_at' => $addDate,
                'due_date' => $addDate->copy()->addDays(14),
            ]);
            $invoice->printJobs()->syncWithoutDetaching([$job->id]);
        }
    }

    /**
     * Retrieve all invoices matching criteria from database.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Invoice>
     */
    public function getAllInvoices(array $filters = []): Collection
    {
        $this->syncInvoicesFromPrintJobs();

        return $this->buildQuery($filters)->get();
    }

    /**
     * Retrieve Invoice payments data and KPIs for UI views directly from database.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getInvoicePaymentsData(array $filters = []): array
    {
        $invoices = $this->getAllInvoices($filters);
        $resources = InvoiceResource::collection($invoices);
        $invoicesData = $resources->resolve();

        $totalBilled = (float) array_sum(array_column($invoicesData, 'total_amount'));
        $totalCollected = (float) array_sum(array_column($invoicesData, 'paid_amount'));
        $totalPending = (float) array_sum(array_column($invoicesData, 'balance_amount'));

        $completeCount = count(array_filter($invoicesData, fn ($i) => ($i['stage'] ?? '') === 'Complete Payment' || ($i['payment_status'] ?? '') === 'Paid'));
        $advanceCount = count(array_filter($invoicesData, fn ($i) => ($i['stage'] ?? '') === 'Advance Payment' || ($i['payment_status'] ?? '') === 'Partial'));
        $pendingCount = count(array_filter($invoicesData, fn ($i) => ($i['stage'] ?? '') === 'Pending Payment' || ($i['payment_status'] ?? '') === 'Pending'));

        return [
            'invoices' => $resources,
            'kpis' => [
                'total_billed' => $totalBilled,
                'total_collected' => $totalCollected,
                'total_pending' => $totalPending,
                'counts' => [
                    'complete' => $completeCount,
                    'advance' => $advanceCount,
                    'pending' => $pendingCount,
                    'total' => count($invoicesData),
                ],
            ],
        ];
    }

    /**
     * Retrieve a paginated list of invoices from database.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getInvoices(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $this->syncInvoicesFromPrintJobs();
        $perPage = max(1, min(100, $perPage));

        return $this->buildQuery($filters)->paginate($perPage);
    }

    /**
     * Find an invoice by ID with relationships.
     */
    public function getInvoiceById(int $id): ?Invoice
    {
        return Invoice::query()
            ->with(['customer', 'printJobs'])
            ->withCount('printJobs')
            ->find($id);
    }

    /**
     * Retrieve live available print jobs from the database for invoice consolidation.
     *
     * @param  array<string, mixed>  $filters
     * @return array<int, array<string, mixed>>
     */
    public function getAvailablePrintJobs(array $filters = []): array
    {
        $query = PrintJob::query()->with([
            'customer',
            'printType',
            'cost.printCosts',
            'payments',
            'statusHistory.status',
        ]);

        if (! empty($filters['customer_id'])) {
            $query->where('customer_id', (int) $filters['customer_id']);
        }

        $jobs = $query->orderByDesc('id')->get();

        $available = [];
        foreach ($jobs as $job) {
            $costSum = $job->cost?->printCosts?->sum('price') ?? 0;
            $unitPrice = $costSum > 0 ? (float) $costSum : 120.00;
            $qty = max(1, (int) $job->qty);
            $subtotal = $unitPrice * $qty;
            $discount = (float) ($job->cost?->discount ?? 0);
            $totalAmount = max(0, $subtotal - $discount);

            $paidAmount = (float) $job->payments->sum('payment');
            $balanceAmount = max(0, $totalAmount - $paidAmount);

            $latestStatus = $job->relationLoaded('statusHistory')
                ? $job->statusHistory->sortByDesc('update_at')->first()?->status?->print_job_states ?? 'Pending'
                : 'Pending';

            $available[] = [
                'id' => (string) $job->id,
                'job_id' => $job->id,
                'formattedId' => 'ORD-2026-'.(1000 + $job->id),
                'orderId' => 'ORD-2026-'.(1000 + $job->id),
                'customerId' => $job->customer_id,
                'customerName' => $job->customer?->name ?? 'Customer #'.$job->customer_id,
                'customerMobile' => $job->customer?->mobile ?? '',
                'productName' => $job->printType?->print_type ?? 'Print Job #'.$job->id,
                'qty' => $qty,
                'totalAmount' => $totalAmount,
                'paidAmount' => $paidAmount,
                'balanceAmount' => $balanceAmount,
                'status' => $latestStatus,
                'addDate' => $job->add_date ? (is_string($job->add_date) ? $job->add_date : $job->add_date->toDateString()) : null,
            ];
        }

        return $available;
    }

    /**
     * Create a new invoice and associate print jobs.
     *
     * @param  array<string, mixed>  $data
     */
    public function createInvoice(array $data): Invoice
    {
        return DB::transaction(function () use ($data) {
            $invoice = Invoice::create([
                'customer_id' => (int) $data['customer_id'],
                'invoice_at' => ! empty($data['invoice_at']) ? $data['invoice_at'] : now(),
                'due_date' => ! empty($data['due_date']) ? $data['due_date'] : now()->addDays(30),
            ]);

            if (! empty($data['print_job_ids']) && is_array($data['print_job_ids'])) {
                $invoice->printJobs()->sync($data['print_job_ids']);

                // If payment amount is included, record payment transactions for print jobs
                $paymentAmount = (float) ($data['payment_amount'] ?? 0);
                if ($paymentAmount > 0) {
                    $allocations = ! empty($data['allocations']) && is_array($data['allocations']) ? $data['allocations'] : [];
                    $paymentTypeId = (int) ($data['payment_types_id'] ?? 1);
                    $paymentStatusId = (int) ($data['payment_statuses_id'] ?? 2);
                    $payDate = ! empty($data['invoice_at']) ? $data['invoice_at'] : now();

                    if (! empty($allocations)) {
                        foreach ($allocations as $alloc) {
                            $jobId = (int) ($alloc['job_id'] ?? $alloc['id'] ?? 0);
                            $allocAmount = (float) ($alloc['allocated_amount'] ?? $alloc['amount'] ?? 0);
                            if ($jobId > 0 && $allocAmount > 0) {
                                Payment::create([
                                    'payment' => $allocAmount,
                                    'print_jobs_id' => $jobId,
                                    'payment_types_id' => $paymentTypeId,
                                    'pay_date' => $payDate,
                                    'payment_statuses_id' => $paymentStatusId,
                                ]);
                            }
                        }
                    } else {
                        $firstJobId = (int) $data['print_job_ids'][0];
                        Payment::create([
                            'payment' => $paymentAmount,
                            'print_jobs_id' => $firstJobId,
                            'payment_types_id' => $paymentTypeId,
                            'pay_date' => $payDate,
                            'payment_statuses_id' => $paymentStatusId,
                        ]);
                    }
                }
            }

            return $invoice->load(['customer', 'printJobs']);
        });
    }

    /**
     * Update an existing invoice.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateInvoice(Invoice $invoice, array $data): Invoice
    {
        return DB::transaction(function () use ($invoice, $data) {
            $attributes = [];

            if (isset($data['customer_id'])) {
                $attributes['customer_id'] = (int) $data['customer_id'];
            }
            if (isset($data['invoice_at'])) {
                $attributes['invoice_at'] = $data['invoice_at'];
            }
            if (isset($data['due_date'])) {
                $attributes['due_date'] = $data['due_date'];
            }

            $invoice->update($attributes);

            if (isset($data['print_job_ids']) && is_array($data['print_job_ids'])) {
                $invoice->printJobs()->sync($data['print_job_ids']);
            }

            return $invoice->fresh(['customer', 'printJobs']);
        });
    }

    /**
     * Delete an invoice.
     */
    public function deleteInvoice(Invoice $invoice): bool
    {
        return DB::transaction(function () use ($invoice) {
            $invoice->printJobs()->detach();

            return (bool) $invoice->delete();
        });
    }

    /**
     * Attach a print job to an invoice.
     */
    public function attachPrintJob(Invoice $invoice, int $printJobId): Invoice
    {
        $invoice->printJobs()->syncWithoutDetaching([$printJobId]);

        return $invoice->fresh(['customer', 'printJobs']);
    }

    /**
     * Detach a print job from an invoice.
     */
    public function detachPrintJob(Invoice $invoice, int $printJobId): Invoice
    {
        $invoice->printJobs()->detach($printJobId);

        return $invoice->fresh(['customer', 'printJobs']);
    }
}
