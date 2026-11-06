<?php

namespace Modules\PrintJob\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Modules\PrintJob\Models\PrintJob;
use Modules\PrintJob\Models\PrintJobCost;
use Modules\PrintJob\Models\PrintJobStatusHistory;
use Modules\User\Models\User;

class PrintJobService
{
    /**
     * Build the query for print jobs with relations, search, and filtering.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<PrintJob>
     */
    public function buildQuery(array $filters = []): Builder
    {
        $query = PrintJob::query()->with([
            'user',
            'customer',
            'printType',
            'statusHistory.status',
            'cost.printCosts.printCostType',
            'stockItems.stockItem',
        ]);

        $search = $filters['search'] ?? $filters['q'] ?? null;
        if (! empty($search)) {
            $search = trim((string) $search);
            $query->where(function (Builder $q) use ($search) {
                if (is_numeric($search)) {
                    $q->where('id', (int) $search);
                }

                $q->orWhereHas('customer', function (Builder $cq) use ($search) {
                    $cq->where('name', 'like', "%{$search}%")
                        ->orWhere('mobile', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('printType', function (Builder $ptq) use ($search) {
                    $ptq->where('print_type', 'like', "%{$search}%");
                })->orWhereHas('statusHistory.status', function (Builder $sq) use ($search) {
                    $sq->where('print_job_states', 'like', "%{$search}%");
                });
            });
        }

        if (! empty($filters['customer_id'])) {
            $query->where('customer_id', (int) $filters['customer_id']);
        }

        if (! empty($filters['users_id'])) {
            $query->where('users_id', (int) $filters['users_id']);
        }

        if (! empty($filters['print_types_id'])) {
            $query->where('print_types_id', (int) $filters['print_types_id']);
        }

        if (! empty($filters['status_id'])) {
            $query->whereHas('statusHistory', function (Builder $sq) use ($filters) {
                $sq->where('print_job_statuses_id', (int) $filters['status_id']);
            });
        }

        if (! empty($filters['from_date'])) {
            $query->whereDate('add_date', '>=', $filters['from_date']);
        }

        if (! empty($filters['to_date'])) {
            $query->whereDate('add_date', '<=', $filters['to_date']);
        }

        $sortBy = (string) ($filters['sort_by'] ?? 'id');
        $sortOrder = strtolower((string) ($filters['sort_order'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['id', 'add_date', 'qty', 'customer_id', 'print_types_id', 'users_id'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderByDesc('id');
        }

        return $query;
    }

    /**
     * Retrieve all print jobs matching criteria without pagination limit.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, PrintJob>
     */
    public function getAllPrintJobs(array $filters = []): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    /**
     * Retrieve a paginated list of print jobs based on filter criteria.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getPrintJobs(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        return $this->buildQuery($filters)->paginate($perPage);
    }

    /**
     * Find a print job by primary key with all relations.
     */
    public function getPrintJobById(int $id): ?PrintJob
    {
        return PrintJob::query()
            ->with([
                'user',
                'customer',
                'printType',
                'statusHistory.status',
                'cost.printCosts.printCostType',
                'stockItems.stockItem',
                'payments',
                'invoices',
            ])
            ->find($id);
    }

    /**
     * Create a new print job along with its initial status, optional cost, and stock items.
     *
     * @param  array<string, mixed>  $data
     */
    public function createPrintJob(array $data): PrintJob
    {
        return DB::transaction(function () use ($data) {
            $userId = ! empty($data['users_id'])
                ? (int) $data['users_id']
                : (Auth::id() ?? User::query()->value('id') ?? 1);

            $printJob = PrintJob::create([
                'users_id' => $userId,
                'customer_id' => (int) $data['customer_id'],
                'print_types_id' => (int) $data['print_types_id'],
                'add_date' => ! empty($data['add_date']) ? $data['add_date'] : now(),
                'qty' => (int) $data['qty'],
            ]);

            // Create initial status history entry (default to 1: Pending/New)
            $statusId = ! empty($data['print_job_statuses_id'])
                ? (int) $data['print_job_statuses_id']
                : 1;

            PrintJobStatusHistory::create([
                'print_jobs_id' => $printJob->id,
                'print_job_statuses_id' => $statusId,
                'update_at' => now(),
            ]);

            // Create cost record if discount or print costs provided
            if (isset($data['discount']) || ! empty($data['print_cost_ids'])) {
                $cost = PrintJobCost::create([
                    'print_jobs_id' => $printJob->id,
                    'discount' => (float) ($data['discount'] ?? 0),
                ]);

                if (! empty($data['print_cost_ids']) && is_array($data['print_cost_ids'])) {
                    $cost->printCosts()->sync($data['print_cost_ids']);
                }
            }

            // Attach stock items if provided
            if (! empty($data['stock_items']) && is_array($data['stock_items'])) {
                $syncData = [];
                foreach ($data['stock_items'] as $item) {
                    if (! empty($item['stock_id'])) {
                        $syncData[$item['stock_id']] = ['qty' => (int) ($item['qty'] ?? 1)];
                    }
                }
                if (! empty($syncData)) {
                    $printJob->stockItems()->sync($syncData);
                }
            }

            return $this->getPrintJobById($printJob->id) ?? $printJob;
        });
    }

    /**
     * Update an existing print job.
     *
     * @param  array<string, mixed>  $data
     */
    public function updatePrintJob(PrintJob $printJob, array $data): PrintJob
    {
        $attributes = [];

        if (isset($data['users_id'])) {
            $attributes['users_id'] = (int) $data['users_id'];
        }
        if (isset($data['customer_id'])) {
            $attributes['customer_id'] = (int) $data['customer_id'];
        }
        if (isset($data['print_types_id'])) {
            $attributes['print_types_id'] = (int) $data['print_types_id'];
        }
        if (isset($data['add_date'])) {
            $attributes['add_date'] = $data['add_date'];
        }
        if (isset($data['qty'])) {
            $attributes['qty'] = (int) $data['qty'];
        }

        $printJob->update($attributes);

        return $this->getPrintJobById($printJob->id) ?? $printJob;
    }

    /**
     * Delete a print job and its cascade dependencies.
     */
    public function deletePrintJob(PrintJob $printJob): bool
    {
        return DB::transaction(function () use ($printJob) {
            // Delete dependent records
            $printJob->statusHistory()->delete();
            $printJob->stockItems()->detach();

            if ($printJob->cost) {
                $printJob->cost->printCosts()->detach();
                $printJob->cost->delete();
            }

            return (bool) $printJob->delete();
        });
    }

    /**
     * Record a new status update in the print job history.
     */
    public function updateStatus(PrintJob $printJob, int $statusId): PrintJob
    {
        PrintJobStatusHistory::updateOrCreate(
            [
                'print_jobs_id' => $printJob->id,
                'print_job_statuses_id' => $statusId,
            ],
            [
                'update_at' => now(),
            ]
        );

        return $this->getPrintJobById($printJob->id) ?? $printJob;
    }

    /**
     * Retrieve full status history for a print job.
     *
     * @return Collection<int, PrintJobStatusHistory>
     */
    public function getStatusHistory(int $printJobId): Collection
    {
        return PrintJobStatusHistory::query()
            ->with('status')
            ->where('print_jobs_id', $printJobId)
            ->orderByDesc('update_at')
            ->get();
    }

    /**
     * Assign or update a stock item for the print job.
     */
    public function assignStockItem(PrintJob $printJob, int $stockId, int $qty): PrintJob
    {
        $printJob->stockItems()->syncWithoutDetaching([
            $stockId => ['qty' => $qty],
        ]);

        return $this->getPrintJobById($printJob->id) ?? $printJob;
    }

    /**
     * Remove a stock item from the print job.
     */
    public function removeStockItem(PrintJob $printJob, int $stockId): PrintJob
    {
        $printJob->stockItems()->detach($stockId);

        return $this->getPrintJobById($printJob->id) ?? $printJob;
    }

    /**
     * Update cost and linked print cost items for a print job.
     *
     * @param  array<int, int>  $printCostIds
     */
    public function updateCost(PrintJob $printJob, float $discount, array $printCostIds = []): PrintJobCost
    {
        return DB::transaction(function () use ($printJob, $discount, $printCostIds) {
            $cost = PrintJobCost::updateOrCreate(
                ['print_jobs_id' => $printJob->id],
                ['discount' => $discount]
            );

            if (! empty($printCostIds)) {
                $cost->printCosts()->sync($printCostIds);
            }

            return $cost->load('printCosts.printCostType');
        });
    }

    /**
     * Retrieve place-order demo datasets (orders, payments, summary).
     * Note: Database queries are disabled; mock dummy data is returned (similar to DashboardService).
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getPlaceOrderData(array $filters = []): array
    {
        $orders = $this->resolvePlaceOrderOrders($filters);
        $payments = $this->resolvePlaceOrderPayments();
        $kpis = $this->resolvePlaceOrderKpis($orders);

        return [
            'orders' => $orders,
            'payments' => $payments,
            'kpis' => $kpis,
        ];
    }

    /**
     * Resolve place-order demo printing orders without database query.
     *
     * @param  array<string, mixed>  $filters
     * @return array<int, array<string, mixed>>
     */
    protected function resolvePlaceOrderOrders(array $filters = []): array
    {
        $today = now();

        $allOrders = [
            [
                'id' => 'ORD-2026-1048',
                'orderDate' => $today->copy()->subDays(3)->toDateString(),
                'customerId' => 'CUST-001',
                'customerName' => 'Kasun Jayasundara',
                'customerMobile' => '0771234567',
                'productKey' => 'flex_normal',
                'productName' => 'Flex Banner (Normal 280gsm)',
                'width' => 10,
                'height' => 4,
                'unit' => 'feet',
                'quantity' => 2,
                'areaSqFt' => 80,
                'unitPrice' => 95.00,
                'designStatus' => 'Customer Provides Design',
                'deliveryMethod' => 'Pickup',
                'requiredDate' => $today->copy()->addDays(2)->toDateString(),
                'totalAmount' => 7600.00,
                'paidAmount' => 7600.00,
                'balanceAmount' => 0.00,
                'paymentStatus' => 'Paid',
                'orderStatus' => 'Completed',
                'assignedEmployee' => 'Kasun Perera',
                'notes' => 'Grommets on all 4 corners and reinforcement borders.',
            ],
            [
                'id' => 'ORD-2026-1049',
                'orderDate' => $today->copy()->subDays(2)->toDateString(),
                'customerId' => 'CUST-002',
                'customerName' => 'Dilhani Senaratne',
                'customerMobile' => '0719876543',
                'productKey' => 'sticker_glossy',
                'productName' => 'Vinyl Sticker (Glossy)',
                'width' => 6,
                'height' => 3,
                'unit' => 'feet',
                'quantity' => 3,
                'areaSqFt' => 54,
                'unitPrice' => 140.00,
                'designStatus' => 'Shop Creates Design',
                'deliveryMethod' => 'Delivery',
                'requiredDate' => $today->copy()->addDays(1)->toDateString(),
                'totalAmount' => 8060.00,
                'paidAmount' => 5000.00,
                'balanceAmount' => 3060.00,
                'paymentStatus' => 'Partially Paid',
                'orderStatus' => 'In Progress',
                'assignedEmployee' => 'Nuwan Silva',
                'notes' => 'Die-cut individual stickers for retail packaging.',
            ],
            [
                'id' => 'ORD-2026-1050',
                'orderDate' => $today->toDateString(),
                'customerId' => 'CUST-003',
                'customerName' => 'Sajith Warnakula',
                'customerMobile' => '0755554321',
                'productKey' => 'business_card_lux',
                'productName' => 'Business Cards (Matte + Spot UV)',
                'width' => 90,
                'height' => 54,
                'unit' => 'mm',
                'quantity' => 500,
                'areaSqFt' => 0,
                'unitPrice' => 22.00,
                'designStatus' => 'Customer Provides Design',
                'deliveryMethod' => 'Pickup',
                'requiredDate' => $today->copy()->addDays(4)->toDateString(),
                'totalAmount' => 11000.00,
                'paidAmount' => 0.00,
                'balanceAmount' => 11000.00,
                'paymentStatus' => 'Unpaid',
                'orderStatus' => 'Pending',
                'assignedEmployee' => 'Dilshan Fernando',
                'notes' => 'Double sided luxury print with spot UV logo.',
            ],
            [
                'id' => 'ORD-2026-1051',
                'orderDate' => $today->toDateString(),
                'customerId' => 'CUST-005',
                'customerName' => 'Nuwan Weerasinghe',
                'customerMobile' => '0781122334',
                'productKey' => 'rollup_banner',
                'productName' => 'Rollup Banner Display (Complete Set)',
                'width' => 2.5,
                'height' => 6,
                'unit' => 'feet',
                'quantity' => 2,
                'areaSqFt' => 30,
                'unitPrice' => 6500.00,
                'designStatus' => 'Customer Provides Design',
                'deliveryMethod' => 'Delivery',
                'requiredDate' => $today->copy()->addDays(3)->toDateString(),
                'totalAmount' => 13000.00,
                'paidAmount' => 6500.00,
                'balanceAmount' => 6500.00,
                'paymentStatus' => 'Partially Paid',
                'orderStatus' => 'In Progress',
                'assignedEmployee' => 'Kasun Perera',
                'notes' => 'Aluminium heavy-duty pull up base.',
            ],
            [
                'id' => 'ORD-2026-1052',
                'orderDate' => $today->copy()->subDays(4)->toDateString(),
                'customerId' => 'CUST-001',
                'customerName' => 'Kasun Jayasundara',
                'customerMobile' => '0771234567',
                'productKey' => 'backlit_film',
                'productName' => 'Lightbox Backlit Film',
                'width' => 8,
                'height' => 4,
                'unit' => 'feet',
                'quantity' => 1,
                'areaSqFt' => 32,
                'unitPrice' => 240.00,
                'designStatus' => 'Shop Creates Design',
                'deliveryMethod' => 'Pickup',
                'requiredDate' => $today->copy()->subDays(1)->toDateString(),
                'totalAmount' => 7680.00,
                'paidAmount' => 7680.00,
                'balanceAmount' => 0.00,
                'paymentStatus' => 'Paid',
                'orderStatus' => 'Completed',
                'assignedEmployee' => 'Chamara Bandara',
                'notes' => 'High-density UV ink for backlight showroom display.',
            ],
            [
                'id' => 'ORD-2026-1053',
                'orderDate' => $today->copy()->subDays(1)->toDateString(),
                'customerId' => 'CUST-004',
                'customerName' => 'Nadeeka Perera',
                'customerMobile' => '0723456789',
                'productKey' => 'oneway_vision',
                'productName' => 'One-Way Vision Film',
                'width' => 12,
                'height' => 5,
                'unit' => 'feet',
                'quantity' => 1,
                'areaSqFt' => 60,
                'unitPrice' => 210.00,
                'designStatus' => 'Customer Provides Design',
                'deliveryMethod' => 'Delivery',
                'requiredDate' => $today->copy()->addDays(5)->toDateString(),
                'totalAmount' => 12600.00,
                'paidAmount' => 5000.00,
                'balanceAmount' => 7600.00,
                'paymentStatus' => 'Partially Paid',
                'orderStatus' => 'In Progress',
                'assignedEmployee' => 'Nuwan Silva',
                'notes' => 'Micro-perforated film for showroom glass facade.',
            ],
            [
                'id' => 'ORD-2026-1054',
                'orderDate' => $today->toDateString(),
                'customerId' => 'CUST-002',
                'customerName' => 'Dilhani Senaratne',
                'customerMobile' => '0719876543',
                'productKey' => 'foam_board',
                'productName' => 'Foam Board Signage (5mm)',
                'width' => 4,
                'height' => 3,
                'unit' => 'feet',
                'quantity' => 4,
                'areaSqFt' => 48,
                'unitPrice' => 280.00,
                'designStatus' => 'Customer Provides Design',
                'deliveryMethod' => 'Pickup',
                'requiredDate' => $today->copy()->addDays(6)->toDateString(),
                'totalAmount' => 13440.00,
                'paidAmount' => 0.00,
                'balanceAmount' => 13440.00,
                'paymentStatus' => 'Unpaid',
                'orderStatus' => 'Pending',
                'assignedEmployee' => 'Dilshan Fernando',
                'notes' => 'Direct UV flatbed printing on rigid PVC foam board.',
            ],
        ];

        // Apply in-memory search/filter if present
        $search = strtolower(trim((string) ($filters['search'] ?? $filters['q'] ?? '')));
        $status = $filters['status'] ?? $filters['order_status'] ?? 'ALL';
        $payment = $filters['payment'] ?? $filters['payment_status'] ?? 'ALL';

        return array_values(array_filter($allOrders, function ($order) use ($search, $status, $payment) {
            if ($status !== 'ALL' && strcasecmp($order['orderStatus'], $status) !== 0) {
                return false;
            }
            if ($payment !== 'ALL' && strcasecmp($order['paymentStatus'], $payment) !== 0) {
                return false;
            }
            if ($search !== '') {
                $haystack = strtolower(
                    $order['id'] . ' ' .
                    $order['customerName'] . ' ' .
                    $order['customerMobile'] . ' ' .
                    $order['productName'] . ' ' .
                    $order['assignedEmployee']
                );
                if (! str_contains($haystack, $search)) {
                    return false;
                }
            }

            return true;
        }));
    }

    /**
     * Resolve place-order demo payment installment records.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function resolvePlaceOrderPayments(): array
    {
        $today = now();

        return [
            [
                'paymentId' => 'PAY-2026-0001',
                'orderId' => 'ORD-2026-1048',
                'installmentNo' => 1,
                'date' => $today->copy()->subDays(3)->toDateString(),
                'amount' => 4000.00,
                'method' => 'Cash',
                'ref' => 'RCPT-4091',
                'receivedBy' => 'Admin User',
                'status' => 'Successful',
                'note' => 'Initial advance on order booking',
            ],
            [
                'paymentId' => 'PAY-2026-0002',
                'orderId' => 'ORD-2026-1048',
                'installmentNo' => 2,
                'date' => $today->copy()->subDays(1)->toDateString(),
                'amount' => 3600.00,
                'method' => 'Card',
                'ref' => 'TXN-88402',
                'receivedBy' => 'Admin User',
                'status' => 'Successful',
                'note' => 'Final payment settlement on collection',
            ],
            [
                'paymentId' => 'PAY-2026-0003',
                'orderId' => 'ORD-2026-1049',
                'installmentNo' => 1,
                'date' => $today->copy()->subDays(2)->toDateString(),
                'amount' => 5000.00,
                'method' => 'Bank Transfer',
                'ref' => 'COM-SLIP-771',
                'receivedBy' => 'Admin User',
                'status' => 'Successful',
                'note' => 'Commercial Bank online deposit',
            ],
            [
                'paymentId' => 'PAY-2026-0004',
                'orderId' => 'ORD-2026-1051',
                'installmentNo' => 1,
                'date' => $today->toDateString(),
                'amount' => 6500.00,
                'method' => 'Cash',
                'ref' => 'CSH-104',
                'receivedBy' => 'Admin User',
                'status' => 'Successful',
                'note' => '50% advance deposit',
            ],
            [
                'paymentId' => 'PAY-2026-0005',
                'orderId' => 'ORD-2026-1052',
                'installmentNo' => 1,
                'date' => $today->copy()->subDays(4)->toDateString(),
                'amount' => 7680.00,
                'method' => 'Card',
                'ref' => 'TXN-91204',
                'receivedBy' => 'Admin User',
                'status' => 'Successful',
                'note' => 'Full advance payment by POS card terminal',
            ],
            [
                'paymentId' => 'PAY-2026-0006',
                'orderId' => 'ORD-2026-1053',
                'installmentNo' => 1,
                'date' => $today->copy()->subDays(1)->toDateString(),
                'amount' => 5000.00,
                'method' => 'Bank Transfer',
                'ref' => 'BOC-TXN-5582',
                'receivedBy' => 'Admin User',
                'status' => 'Successful',
                'note' => 'Advance bank transfer for one-way vision',
            ],
        ];
    }

    /**
     * Resolve aggregated KPIs based on orders dataset.
     *
     * @param  array<int, array<string, mixed>>  $orders
     * @return array<string, mixed>
     */
    protected function resolvePlaceOrderKpis(array $orders = []): array
    {
        $totalOrders = count($orders);
        $inProduction = 0;
        $totalRevenue = 0.0;
        $outstandingBalance = 0.0;

        foreach ($orders as $order) {
            $totalRevenue += (float) ($order['totalAmount'] ?? 0);
            $outstandingBalance += (float) ($order['balanceAmount'] ?? 0);
            if (in_array(strtolower((string) ($order['orderStatus'] ?? '')), ['in progress', 'pending'], true)) {
                $inProduction++;
            }
        }

        return [
            'totalOrders' => $totalOrders,
            'inProduction' => $inProduction,
            'totalRevenue' => $totalRevenue,
            'outstandingBalance' => $outstandingBalance,
        ];
    }
}
