<?php

namespace Modules\Invoice\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
<<<<<<< HEAD
=======
use Illuminate\Pagination\Paginator;
>>>>>>> origin/Ardithya
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
<<<<<<< HEAD
        return $this->buildQuery($filters)->get();
=======
        $invoices = $this->buildQuery($filters)->get();

        if ($invoices->isEmpty()) {
            return $this->resolveDemoInvoices($filters);
        }

        return $invoices;
>>>>>>> origin/Ardithya
    }

    /**
     * Retrieve a paginated list of invoices.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getInvoices(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

<<<<<<< HEAD
        return $this->buildQuery($filters)->paginate($perPage);
=======
        $paginator = $this->buildQuery($filters)->paginate($perPage);

        if ($paginator->isEmpty()) {
            return $this->resolveDemoInvoicesPaginator($filters, $perPage);
        }

        return $paginator;
    }

    /**
     * Resolve demo invoice records modeled after UI DashboardService.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Invoice>
     */
    public function resolveDemoInvoices(array $filters = []): Collection
    {
        $today = now();

        $demoData = [
            [
                'id' => 1048,
                'customer_id' => 1,
                'invoice_no' => 'INV-2026-1048',
                'customer_name' => 'Kasun Jayasundara',
                'customer_mobile' => '0771234567',
                'product_name' => 'Flex Banner (Normal 280gsm)',
                'date' => $today->copy()->subDays(3)->toDateString(),
                'invoice_at' => $today->copy()->subDays(3),
                'due_date' => $today->copy()->addDays(7),
                'total_amount' => 7600.00,
                'paid_amount' => 7600.00,
                'balance_amount' => 0.00,
                'stage' => 'Complete Payment',
                'payment_status' => 'Paid',
                'order_status' => 'Completed',
                'method' => 'Cash',
                'ref' => 'CASH-REC-1048',
                'note' => 'Full settlement paid upon delivery',
            ],
            [
                'id' => 1049,
                'customer_id' => 2,
                'invoice_no' => 'INV-2026-1049',
                'customer_name' => 'Dilhani Senaratne',
                'customer_mobile' => '0719876543',
                'product_name' => 'Vinyl Sticker (Glossy)',
                'date' => $today->copy()->subDays(2)->toDateString(),
                'invoice_at' => $today->copy()->subDays(2),
                'due_date' => $today->copy()->addDays(5),
                'total_amount' => 8060.00,
                'paid_amount' => 5000.00,
                'balance_amount' => 3060.00,
                'stage' => 'Advance Payment',
                'payment_status' => 'Partial',
                'order_status' => 'In Progress',
                'method' => 'Card',
                'ref' => 'VISA-AUTH-9921',
                'note' => '50% upfront advance paid on Visa Debit card',
            ],
            [
                'id' => 1050,
                'customer_id' => 3,
                'invoice_no' => 'INV-2026-1050',
                'customer_name' => 'Sajith Warnakula',
                'customer_mobile' => '0755554433',
                'product_name' => 'Rollup Banner Display',
                'date' => $today->toDateString(),
                'invoice_at' => $today,
                'due_date' => $today->copy()->addDays(3),
                'total_amount' => 11000.00,
                'paid_amount' => 0.00,
                'balance_amount' => 11000.00,
                'stage' => 'Pending Payment',
                'payment_status' => 'Pending',
                'order_status' => 'Pending',
                'method' => 'Check',
                'ref' => 'CHQ-PENDING',
                'note' => 'Cheque promised upon final delivery',
            ],
            [
                'id' => 1051,
                'customer_id' => 4,
                'invoice_no' => 'INV-2026-1051',
                'customer_name' => 'Nuwan Weerasinghe',
                'customer_mobile' => '0721112233',
                'product_name' => 'Foam Board Signage (5mm)',
                'date' => $today->toDateString(),
                'invoice_at' => $today,
                'due_date' => $today->copy()->addDays(4),
                'total_amount' => 13000.00,
                'paid_amount' => 6500.00,
                'balance_amount' => 6500.00,
                'stage' => 'Advance Payment',
                'payment_status' => 'Partial',
                'order_status' => 'In Progress',
                'method' => 'Bank Transfer',
                'ref' => 'BOC-TXN-881920',
                'note' => 'Direct online transfer to Sanjeewa Advertising BOC account',
            ],
            [
                'id' => 1052,
                'customer_id' => 1,
                'invoice_no' => 'INV-2026-1052',
                'customer_name' => 'Kasun Jayasundara',
                'customer_mobile' => '0771234567',
                'product_name' => 'Business Cards (Spot UV 500 pcs)',
                'date' => $today->copy()->subDays(1)->toDateString(),
                'invoice_at' => $today->copy()->subDays(1),
                'due_date' => $today->copy()->addDays(2),
                'total_amount' => 11000.00,
                'paid_amount' => 11000.00,
                'balance_amount' => 0.00,
                'stage' => 'Complete Payment',
                'payment_status' => 'Paid',
                'order_status' => 'Completed',
                'method' => 'Card',
                'ref' => 'MC-AUTH-7731',
                'note' => 'Settled via POS terminal',
            ],
            [
                'id' => 1053,
                'customer_id' => 1,
                'invoice_no' => 'INV-2026-1053',
                'customer_name' => 'Kasun Jayasundara',
                'customer_mobile' => '0771234567',
                'product_name' => 'Lightbox Backlit Film (8x3 ft)',
                'date' => $today->toDateString(),
                'invoice_at' => $today,
                'due_date' => $today->copy()->addDays(5),
                'total_amount' => 5760.00,
                'paid_amount' => 3000.00,
                'balance_amount' => 2760.00,
                'stage' => 'Advance Payment',
                'payment_status' => 'Partial',
                'order_status' => 'In Progress',
                'method' => 'Cash',
                'ref' => 'CASH-REC-1053',
                'note' => 'Cash advance on lightbox graphic print',
            ],
            [
                'id' => 1054,
                'customer_id' => 2,
                'invoice_no' => 'INV-2026-1054',
                'customer_name' => 'Dilhani Senaratne',
                'customer_mobile' => '0719876543',
                'product_name' => 'Flyers / Leaflets (A5 1000 pcs)',
                'date' => $today->toDateString(),
                'invoice_at' => $today,
                'due_date' => $today->copy()->addDays(3),
                'total_amount' => 15000.00,
                'paid_amount' => 0.00,
                'balance_amount' => 15000.00,
                'stage' => 'Pending Payment',
                'payment_status' => 'Pending',
                'order_status' => 'Pending',
                'method' => 'Check',
                'ref' => 'CHQ-DUE-1054',
                'note' => 'Commercial leaflets job queued for printing',
            ],
            [
                'id' => 1055,
                'customer_id' => 5,
                'invoice_no' => 'INV-2026-1055',
                'customer_name' => 'Apex Marketing Pvt Ltd',
                'customer_mobile' => '0112445566',
                'product_name' => 'Corrugated Exhibition Boards',
                'date' => $today->copy()->subDays(4)->toDateString(),
                'invoice_at' => $today->copy()->subDays(4),
                'due_date' => $today->copy()->addDays(14),
                'total_amount' => 34500.00,
                'paid_amount' => 34500.00,
                'balance_amount' => 0.00,
                'stage' => 'Complete Payment',
                'payment_status' => 'Paid',
                'order_status' => 'Completed',
                'method' => 'Bank Transfer',
                'ref' => 'HNB-TXN-100293',
                'note' => 'Corporate account full settlement',
            ],
            [
                'id' => 1056,
                'customer_id' => 6,
                'invoice_no' => 'INV-2026-1056',
                'customer_name' => 'Ruwan Wijethunga',
                'customer_mobile' => '0778899001',
                'product_name' => 'Acrylic 3D LED Letters',
                'date' => $today->copy()->subDays(5)->toDateString(),
                'invoice_at' => $today->copy()->subDays(5),
                'due_date' => $today->copy()->addDays(10),
                'total_amount' => 45000.00,
                'paid_amount' => 25000.00,
                'balance_amount' => 20000.00,
                'stage' => 'Advance Payment',
                'payment_status' => 'Partial',
                'order_status' => 'In Progress',
                'method' => 'Card',
                'ref' => 'VISA-AUTH-3329',
                'note' => 'Advance for acrylic channel lettering',
            ],
            [
                'id' => 1057,
                'customer_id' => 7,
                'invoice_no' => 'INV-2026-1057',
                'customer_name' => 'Sunil Shantha',
                'customer_mobile' => '0712233445',
                'product_name' => 'Mesh Banner Outdoor 12x6 ft',
                'date' => $today->copy()->subDays(6)->toDateString(),
                'invoice_at' => $today->copy()->subDays(6),
                'due_date' => $today->copy()->addDays(7),
                'total_amount' => 18500.00,
                'paid_amount' => 18500.00,
                'balance_amount' => 0.00,
                'stage' => 'Complete Payment',
                'payment_status' => 'Paid',
                'order_status' => 'Completed',
                'method' => 'Cash',
                'ref' => 'CASH-REC-1057',
                'note' => 'Full cash settlement',
            ],
        ];

        $search = strtolower(trim((string) ($filters['search'] ?? $filters['q'] ?? '')));
        if ($search !== '') {
            $demoData = array_filter($demoData, function ($item) use ($search) {
                return str_contains(strtolower($item['invoice_no']), $search)
                    || str_contains(strtolower($item['customer_name']), $search)
                    || str_contains(strtolower($item['customer_mobile']), $search)
                    || str_contains(strtolower($item['product_name']), $search);
            });
        }

        $models = array_map(function ($attributes) {
            $invoice = new Invoice;
            $invoice->forceFill($attributes);

            return $invoice;
        }, array_values($demoData));

        return new Collection($models);
    }

    /**
     * Resolve paginated demo invoices matching requested page & per_page.
     *
     * @param  array<string, mixed>  $filters
     */
    public function resolveDemoInvoicesPaginator(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $collection = $this->resolveDemoInvoices($filters);
        $page = (int) ($filters['page'] ?? 1);
        $sliced = $collection->slice(($page - 1) * $perPage, $perPage)->values();

        return new \Illuminate\Pagination\LengthAwarePaginator(
            $sliced,
            $collection->count(),
            $perPage,
            $page,
            ['path' => Paginator::resolveCurrentPath()]
        );
>>>>>>> origin/Ardithya
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
