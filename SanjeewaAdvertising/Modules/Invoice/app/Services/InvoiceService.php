<?php

namespace Modules\Invoice\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Modules\Invoice\Models\Invoice;

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
    public function getAllInvoices(array $filters = []): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    /**
     * Retrieve a paginated list of invoices.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getInvoices(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
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
