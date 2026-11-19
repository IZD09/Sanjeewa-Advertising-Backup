<?php

namespace Modules\PrintJob\Services;

use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Modules\Core\Support\MobileNumberHelper;
use Modules\Design\Models\PrintCost;
use Modules\Design\Models\PrintType;
use Modules\Inventory\Models\Category;
use Modules\Inventory\Models\Stock;
use Modules\Inventory\Models\StockMovement;
use Modules\Inventory\Models\Subcategory;
use Modules\PrintJob\Models\DeliveryMethod;
use Modules\PrintJob\Models\PrintJob;
use Modules\PrintJob\Models\PrintJobCost;
use Modules\PrintJob\Models\PrintJobStatus;
use Modules\PrintJob\Models\PrintJobStatusHistory;
use Modules\PrintJob\Models\Unit;
use Modules\Transaction\Models\Payment;
use Modules\Transaction\Models\PaymentStatus;
use Modules\Transaction\Models\PaymentType;
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
            'unit',
            'deliveryMethod',
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
                        ->orWhere('email', 'like', "%{$search}%");
                    MobileNumberHelper::orWhereMobileLike($cq, 'mobile', $search);
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
                'unit',
                'statusHistory.status',
                'cost.printCosts.printCostType',
                'stockItems.stockItem',
                'stockItems.brand',
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

            $rawDiscription = $data['discription'] ?? $data['notes'] ?? null;
            $discription = is_string($rawDiscription) && trim($rawDiscription) !== ''
                ? mb_substr(trim($rawDiscription), 0, 255)
                : null;

            $rawDeliveryDate = ! empty($data['delivery_date'])
                ? $data['delivery_date']
                : (! empty($data['deadline'])
                    ? $data['deadline']
                    : (! empty($data['add_date']) ? $data['add_date'] : now()));

            $deliveryDate = $rawDeliveryDate instanceof CarbonInterface
                ? $rawDeliveryDate->format('Y-m-d')
                : (is_string($rawDeliveryDate) ? substr(trim($rawDeliveryDate), 0, 10) : now()->format('Y-m-d'));

            $printJob = PrintJob::create([
                'users_id' => $userId,
                'customer_id' => (int) $data['customer_id'],
                'print_types_id' => (int) $data['print_types_id'],
                'add_date' => ! empty($data['add_date']) ? $data['add_date'] : now(),
                'delivery_date' => $deliveryDate,
                'qty' => (int) $data['qty'],
                'wtdth' => (int) round((float) ($data['wtdth'] ?? 0)),
                'hight' => (int) round((float) ($data['hight'] ?? 0)),
                'unit_id' => ! empty($data['unit_id']) ? (int) $data['unit_id'] : 1,
                'delivery_method_id' => ! empty($data['delivery_method_id'])
                    ? (int) $data['delivery_method_id']
                    : (! empty($data['delivery_method']) && is_numeric($data['delivery_method']) ? (int) $data['delivery_method'] : 1),
                'discription' => $discription,
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

            // Create cost record if discount, unit_price, or print costs provided
            if (isset($data['discount']) || isset($data['unit_price']) || ! empty($data['print_cost_ids'])) {
                $cost = PrintJobCost::firstOrCreate(
                    ['print_jobs_id' => $printJob->id],
                    ['discount' => (float) ($data['discount'] ?? 0)]
                );

                $costIds = ! empty($data['print_cost_ids']) && is_array($data['print_cost_ids'])
                    ? $data['print_cost_ids']
                    : [];

                if (! empty($data['unit_price']) && (float) $data['unit_price'] > 0) {
                    $costType = DB::table('print_cost_type')->where('print_types_id', (int) $data['print_types_id'])->first();
                    if ($costType) {
                        $printCost = PrintCost::create([
                            'print_cost_type_id' => $costType->id,
                            'price' => (float) $data['unit_price'],
                            'add_at' => now(),
                        ]);
                        $costIds[] = $printCost->id;
                    }
                }

                if (! empty($costIds)) {
                    $cost->printCosts()->sync($costIds);
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

            // Calculate total amount for this print job
            $unitPrice = (float) ($data['unit_price'] ?? 0);
            $qty = max(1, (int) ($data['qty'] ?? 1));
            $width = (float) ($data['wtdth'] ?? 0);
            $height = (float) ($data['hight'] ?? 0);
            $unit = ! empty($data['unit_id']) ? Unit::find($data['unit_id']) : null;
            $unitSymbol = $unit?->simble ?? 'ft';

            if ($unitSymbol === 'pcs') {
                $subtotal = $unitPrice * $qty;
            } else {
                $areaSqFt = match ($unitSymbol) {
                    'in' => ($width * $height) / 144,
                    'cm' => ($width * $height) / 929.0304,
                    'mm' => ($width * $height) / 92903.04,
                    'm' => ($width * $height) * 10.7639,
                    default => ($width * $height),
                };
                $subtotal = $areaSqFt * $unitPrice * $qty;
            }

            $designFee = (isset($data['design_status']) && $data['design_status'] === 'Shop Creates Design') ? 500.0 : 0.0;
            $discount = (float) ($data['discount'] ?? 0);
            $totalAmount = max(0, $subtotal + $designFee - $discount);
            if (! empty($data['total_amount']) && (float) $data['total_amount'] > 0) {
                $totalAmount = (float) $data['total_amount'];
            }

            $paidAmount = max(0, (float) ($data['payment_amount'] ?? $data['paid_amount'] ?? 0));

            // Auto-determine payment_statuses_id based on paid vs total amount (or accept explicit override)
            if (! empty($data['payment_statuses_id'])) {
                $paymentStatusId = (int) $data['payment_statuses_id'];
            } else {
                $paymentStatusId = $this->resolveAutoPaymentStatusId($paidAmount, $totalAmount);
            }

            $paymentTypeId = ! empty($data['payment_types_id'])
                ? (int) $data['payment_types_id']
                : (int) (PaymentType::query()->value('id') ?? 1);

            if (! DB::table('payment_types')->where('id', $paymentTypeId)->exists()) {
                $paymentTypeId = (int) (DB::table('payment_types')->value('id') ?? 0);
            }

            if (! DB::table('payment_statuses')->where('id', $paymentStatusId)->exists()) {
                $paymentStatusId = (int) (DB::table('payment_statuses')->value('id') ?? 0);
            }

            // Record payment transaction only when actual payment amount is made (> 0) and valid payment type exists
            if ($paidAmount > 0 && $paymentTypeId > 0 && $paymentStatusId > 0) {
                Payment::create([
                    'payment' => $paidAmount,
                    'print_jobs_id' => $printJob->id,
                    'payment_types_id' => $paymentTypeId,
                    'pay_date' => ! empty($data['add_date']) ? $data['add_date'] : now(),
                    'payment_statuses_id' => $paymentStatusId,
                ]);
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
        if (isset($data['wtdth'])) {
            $attributes['wtdth'] = (int) $data['wtdth'];
        }
        if (isset($data['hight'])) {
            $attributes['hight'] = (int) $data['hight'];
        }
        if (isset($data['unit_id'])) {
            $attributes['unit_id'] = (int) $data['unit_id'];
        }
        if (isset($data['delivery_method_id'])) {
            $attributes['delivery_method_id'] = (int) $data['delivery_method_id'];
        }
        if (isset($data['delivery_date'])) {
            $raw = $data['delivery_date'];
            $attributes['delivery_date'] = $raw instanceof CarbonInterface
                ? $raw->format('Y-m-d')
                : (is_string($raw) ? substr(trim($raw), 0, 10) : $raw);
        } elseif (isset($data['deadline'])) {
            $raw = $data['deadline'];
            $attributes['delivery_date'] = $raw instanceof CarbonInterface
                ? $raw->format('Y-m-d')
                : (is_string($raw) ? substr(trim($raw), 0, 10) : $raw);
        }
        if (array_key_exists('discription', $data) || array_key_exists('notes', $data)) {
            $rawDiscription = $data['discription'] ?? $data['notes'] ?? null;
            $attributes['discription'] = is_string($rawDiscription) && trim($rawDiscription) !== ''
                ? mb_substr(trim($rawDiscription), 0, 255)
                : null;
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
        return DB::transaction(function () use ($printJob, $statusId) {
            PrintJobStatusHistory::updateOrCreate(
                [
                    'print_jobs_id' => $printJob->id,
                    'print_job_statuses_id' => $statusId,
                ],
                [
                    'update_at' => now(),
                ]
            );

            // Deduct allocated materials from stock and record movements when moving to Finishing or beyond
            if ($statusId >= 5 && $statusId !== 9) {
                $this->deductStockMaterialsForJob($printJob);
            }

            return $this->getPrintJobById($printJob->id) ?? $printJob;
        });
    }

    /**
     * Deduct allocated materials from warehouse stock and record in stock_movements.
     * Prevents duplicate deductions using source_id check in stock_movements.
     */
    protected function deductStockMaterialsForJob(PrintJob $printJob): void
    {
        // Check if stock has already been deducted for this print job
        $alreadyDeducted = StockMovement::query()
            ->where('stock_movements_types_id', 2) // Job Usage / Issue
            ->where('source_id', $printJob->id)
            ->exists();

        if ($alreadyDeducted) {
            return;
        }

        // Reload stock items with pivot data
        $printJob->loadMissing('stockItems');

        foreach ($printJob->stockItems as $stockItem) {
            $qtyUsed = (int) ($stockItem->pivot?->qty ?? 0);
            if ($qtyUsed <= 0) {
                continue;
            }

            // Lock stock row and decrement quantity
            $stock = Stock::query()->lockForUpdate()->find($stockItem->id);
            if ($stock) {
                $newQty = max(0, ((int) $stock->qty) - $qtyUsed);
                $stock->update(['qty' => $newQty]);

                // Record stock movement (Job Usage / Issue, Type ID: 2)
                StockMovement::create([
                    'stock_id' => $stock->id,
                    'stock_movements_types_id' => 2,
                    'qty' => $qtyUsed,
                    'date' => now(),
                    'source_id' => $printJob->id,
                ]);
            }
        }
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
     * Sync multiple stock materials allocated to the print job.
     *
     * @param  array<int, array<string, mixed>>  $items
     */
    public function syncStockItems(PrintJob $printJob, array $items): PrintJob
    {
        $syncData = [];
        foreach ($items as $item) {
            $stockId = (int) ($item['stock_id'] ?? 0);
            $qty = max(1, (int) ($item['qty'] ?? 1));
            if ($stockId > 0) {
                $syncData[$stockId] = ['qty' => $qty];
            }
        }

        $printJob->stockItems()->sync($syncData);

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
     * Retrieve comprehensive live Print Job Production Floor data
     * including KPIs, Kanban stage columns, jobs list, statuses, and stock items.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getPrintJobFloorData(array $filters = []): array
    {
        // 1. Load statuses & print types
        $statuses = PrintJobStatus::query()->orderBy('id')->get();
        $printTypes = PrintType::query()->orderBy('id')->get();

        // 2. Load available stocks with stock item name, code, brand, category and subcategory
        $categories = Category::query()->orderBy('category')->get()->map(fn ($c) => [
            'id' => (int) $c->id,
            'name' => $c->category,
        ])->values()->all();

        $subcategories = Subcategory::query()->orderBy('subcategory')->get()->map(fn ($sc) => [
            'id' => (int) $sc->id,
            'category_id' => (int) $sc->categories_id,
            'name' => $sc->subcategory,
        ])->values()->all();

        $availableStocks = Stock::query()
            ->with(['stockItem.subcategory.category', 'brand'])
            ->where('qty', '>', 0)
            ->orderBy('id')
            ->get()
            ->map(function ($s) {
                return [
                    'id' => (int) $s->id,
                    'name' => $s->stockItem?->name ?? 'Stock #'.$s->id,
                    'code' => $s->stockItem?->code ?? '',
                    'brand' => $s->brand?->brand ?? 'Generic',
                    'category' => $s->stockItem?->subcategory?->category?->category ?? '',
                    'category_id' => (int) ($s->stockItem?->subcategory?->categories_id ?? 0),
                    'subcategory' => $s->stockItem?->subcategory?->subcategory ?? '',
                    'subcategory_id' => (int) ($s->stockItem?->subcategories_id ?? 0),
                    'qty' => (int) $s->qty,
                    'price' => (float) $s->price,
                ];
            });

        // 3. Query all print jobs with relations
        $jobsQuery = PrintJob::query()->with([
            'customer',
            'printType',
            'unit',
            'user',
            'statusHistory.status',
            'cost.printCosts',
            'payments',
            'stockItems.stockItem',
            'stockItems.brand',
        ]);

        $search = trim((string) ($filters['search'] ?? $filters['q'] ?? ''));
        if ($search !== '') {
            $jobsQuery->where(function (Builder $q) use ($search) {
                if (is_numeric($search)) {
                    $q->where('id', (int) $search);
                }
                $q->orWhereHas('customer', function (Builder $cq) use ($search) {
                    $cq->where('name', 'like', "%{$search}%");
                    MobileNumberHelper::orWhereMobileLike($cq, 'mobile', $search);
                })->orWhereHas('printType', function (Builder $ptq) use ($search) {
                    $ptq->where('print_type', 'like', "%{$search}%");
                });
            });
        }

        if (! empty($filters['print_types_id'])) {
            $jobsQuery->where('print_types_id', (int) $filters['print_types_id']);
        }

        if (! empty($filters['status_id'])) {
            $statusFilterId = (int) $filters['status_id'];
            $jobsQuery->whereHas('statusHistory', function (Builder $sq) use ($statusFilterId) {
                $sq->where('print_job_statuses_id', $statusFilterId);
            });
        }

        $allJobs = $jobsQuery->orderByDesc('id')->get();

        // 4. Map jobs and compute KPI metrics
        $formattedJobs = [];
        $kpis = [
            'total' => 0,
            'active' => 0,
            'prepress' => 0,
            'printing' => 0,
            'finishing' => 0,
            'ready_completed' => 0,
        ];

        $kanban = [
            'prepress' => [],
            'printing' => [],
            'finishing' => [],
            'ready' => [],
            'completed' => [],
        ];

        foreach ($allJobs as $job) {
            $latestHistory = $job->statusHistory->sortByDesc('update_at')->first();
            $statusId = (int) ($latestHistory?->print_job_statuses_id ?? 1);
            $statusName = $latestHistory?->status?->print_job_states ?? 'Pending';

            // Stage mapping (Design & Prepress tab loads Approved jobs only)
            $stageKey = match ($statusId) {
                3 => 'prepress',
                4 => 'printing',
                5 => 'finishing',
                6 => 'ready',
                7, 8 => 'completed',
                default => null,
            };

            $badgeClass = match ($statusId) {
                1 => 'pending',
                2 => 'designing',
                3 => 'approved',
                4 => 'in-progress',
                5 => 'finishing',
                6 => 'ready',
                7, 8 => 'completed',
                9 => 'cancelled',
                default => 'pending',
            };

            // Financials
            $costSum = $job->cost?->printCosts?->sum('price') ?? 0;
            $unitPrice = $costSum > 0 ? (float) $costSum : 150.00;
            $qty = max(1, (int) $job->qty);
            $discount = (float) ($job->cost?->discount ?? 0);
            $totalAmount = max(0, ($unitPrice * $qty) - $discount);
            $paidAmount = (float) $job->payments->sum('payment');
            $balanceAmount = max(0, $totalAmount - $paidAmount);

            if ($paidAmount >= $totalAmount && $totalAmount > 0) {
                $paymentStatus = 'Paid';
            } elseif ($paidAmount > 0) {
                $paymentStatus = 'Partially Paid';
            } else {
                $paymentStatus = 'Unpaid';
            }

            // Assigned Materials
            $materials = $job->stockItems->map(function ($stock) {
                return [
                    'stock_id' => (int) $stock->id,
                    'name' => $stock->stockItem?->name ?? 'Material #'.$stock->id,
                    'brand' => $stock->brand?->brand ?? '',
                    'qty' => (int) ($stock->pivot?->qty ?? 1),
                ];
            })->values()->all();

            $jobItem = [
                'id' => (int) $job->id,
                'job_number' => 'JOB-'.str_pad((string) $job->id, 4, '0', STR_PAD_LEFT),
                'order_number' => 'ORD-2026-'.(1000 + $job->id),
                'customer_id' => (int) $job->customer_id,
                'customer_name' => $job->customer?->name ?? 'Walk-in Customer',
                'customer_mobile' => $job->customer?->mobile ?? '—',
                'customer_email' => $job->customer?->email ?? '',
                'print_types_id' => (int) $job->print_types_id,
                'print_type_name' => $job->printType?->print_type ?? 'Print Job',
                'qty' => $qty,
                'wtdth' => (int) $job->wtdth,
                'hight' => (int) $job->hight,
                'unit_id' => (int) ($job->unit_id ?? 1),
                'unit_simble' => $job->unit?->simble ?? 'ft',
                'unit_name' => $job->unit?->name ?? 'Feet',
                'dimensions' => ($job->wtdth > 0 && $job->hight > 0)
                    ? "{$job->wtdth} × {$job->hight} ".($job->unit?->simble ?? 'ft')
                    : '—',
                'delivery_method_id' => (int) ($job->delivery_method_id ?? 1),
                'delivery_method_name' => $job->deliveryMethod?->methord ?? 'Customer Pickup',
                'discription' => $job->discription,
                'date_raw' => $job->add_date ? Carbon::parse($job->add_date)->toIso8601String() : null,
                'date_formatted' => $job->add_date ? Carbon::parse($job->add_date)->format('M d, Y') : '—',
                'time_formatted' => $job->add_date ? Carbon::parse($job->add_date)->format('h:i A') : '—',
                'time_24' => $job->add_date ? Carbon::parse($job->add_date)->format('H:i') : '',
                'date_search' => $job->add_date ? Carbon::parse($job->add_date)->format('Y-m-d H:i:s M d, Y h:i A') : '',
                'status_id' => $statusId,
                'status_name' => $statusName,
                'stage_key' => $stageKey,
                'badge_class' => $badgeClass,
                'materials' => $materials,
                'materials_count' => count($materials),
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'balance_amount' => $balanceAmount,
                'payment_status' => $paymentStatus,
                'operator_name' => $job->user ? trim("{$job->user->first_name} {$job->user->last_name}") : 'Production Team',
            ];

            $formattedJobs[] = $jobItem;

            // Compute KPIs
            $kpis['total']++;
            if (! in_array($statusId, [7, 8, 9], true)) {
                $kpis['active']++;
            }
            if ($statusId === 3) {
                $kpis['prepress']++;
            } elseif ($statusId === 4) {
                $kpis['printing']++;
            } elseif ($statusId === 5) {
                $kpis['finishing']++;
            } elseif (in_array($statusId, [6, 7, 8], true)) {
                $kpis['ready_completed']++;
            }

            // Assign to kanban column
            if (isset($kanban[$stageKey])) {
                $kanban[$stageKey][] = $jobItem;
            }
        }

        return [
            'kpis' => $kpis,
            'kanban' => $kanban,
            'jobs' => $formattedJobs,
            'statuses' => $statuses->map(fn ($s) => ['id' => (int) $s->id, 'name' => $s->print_job_states])->values()->all(),
            'print_types' => $printTypes->map(fn ($pt) => ['id' => (int) $pt->id, 'name' => $pt->print_type])->values()->all(),
            'units' => Unit::all()->map(fn ($u) => ['id' => (int) $u->id, 'simble' => $u->simble, 'name' => $u->name])->values()->all(),
            'available_stocks' => $availableStocks->values()->all(),
            'material_categories' => $categories,
            'material_subcategories' => $subcategories,
        ];
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
            'print_types' => PrintType::query()->orderBy('id')->get()->map(fn ($pt) => ['id' => (int) $pt->id, 'name' => $pt->print_type])->values()->all(),
            'units' => Unit::query()->orderBy('id')->get()->map(fn ($u) => ['id' => (int) $u->id, 'simble' => $u->simble, 'name' => $u->name])->values()->all(),
            'payment_types' => PaymentType::query()->orderBy('id')->get()->map(fn ($pt) => ['id' => (int) $pt->id, 'name' => $pt->payment_type])->values()->all(),
            'statuses' => PrintJobStatus::query()->orderBy('id')->get()->map(fn ($st) => ['id' => (int) $st->id, 'name' => $st->print_job_states])->values()->all(),
            'delivery_methods' => DeliveryMethod::query()->orderBy('id')->get()->map(fn ($dm) => ['id' => (int) $dm->id, 'name' => $dm->methord])->values()->all(),
            'users' => User::query()->orderBy('first_name')->get()->map(fn ($u) => ['id' => (int) $u->id, 'name' => trim("{$u->first_name} {$u->last_name}")])->values()->all(),
            'payment_statuses' => PaymentStatus::query()->orderBy('id')->get()->map(fn ($ps) => ['id' => (int) $ps->id, 'name' => $ps->payment_status])->values()->all(),
        ];
    }

    /**
     * Resolve place-order printing orders from the database.
     *
     * @param  array<string, mixed>  $filters
     * @return array<int, array<string, mixed>>
     */
    protected function resolvePlaceOrderOrders(array $filters = []): array
    {
        $query = PrintJob::query()->with([
            'customer',
            'printType',
            'unit',
            'deliveryMethod',
            'user',
            'latestStatusHistory.status',
            'cost.printCosts',
            'payments.paymentType',
            'payments.status',
        ]);

        $search = strtolower(trim((string) ($filters['search'] ?? $filters['q'] ?? '')));
        if ($search !== '') {
            $query->where(function (Builder $q) use ($search) {
                if (is_numeric($search)) {
                    $q->where('id', (int) $search);
                }
                $q->orWhereHas('customer', function (Builder $cq) use ($search) {
                    $cq->where('name', 'like', "%{$search}%");
                    MobileNumberHelper::orWhereMobileLike($cq, 'mobile', $search);
                })->orWhereHas('printType', function (Builder $pq) use ($search) {
                    $pq->where('print_type', 'like', "%{$search}%");
                });
            });
        }

        $jobs = $query->orderByDesc('id')->get();

        $statusFilter = $filters['status'] ?? $filters['order_status'] ?? 'ALL';
        $paymentFilter = $filters['payment'] ?? $filters['payment_status'] ?? 'ALL';

        $orders = [];
        foreach ($jobs as $job) {
            $statusName = $job->latestStatusHistory?->status?->print_job_states ?? 'Pending';

            // Calculate total amount from costs or default
            $costSum = $job->cost?->printCosts?->sum('price') ?? 0;
            $unitPrice = $costSum > 0 ? (float) $costSum : 120.00;
            $qty = max(1, (int) $job->qty);
            $width = (float) ($job->wtdth > 0 ? $job->wtdth : 10);
            $height = (float) ($job->hight > 0 ? $job->hight : 4);
            $unitSymbol = $job->unit?->simble ?? 'ft';
            $unitName = $job->unit?->name ?? 'Feet';

            $areaSqFt = match ($unitSymbol) {
                'ft', 'feet' => $width * $height,
                'in', 'inches' => ($width * $height) / 144,
                'cm' => ($width * $height) / 929.0304,
                'mm' => ($width * $height) / 92903.04,
                'm' => ($width * $height) * 10.7639,
                default => ($width * $height),
            };

            if ($unitSymbol === 'pcs') {
                $subtotal = $unitPrice * $qty;
            } else {
                $subtotal = $areaSqFt * $unitPrice * $qty;
            }

            $discount = (float) ($job->cost?->discount ?? 0);
            $totalAmount = max(0, $subtotal - $discount);

            // Calculate paid amount from payments
            $paidAmount = (float) $job->payments->sum('payment');
            $balanceAmount = max(0, $totalAmount - $paidAmount);

            $lastPayment = $job->payments->sortByDesc('id')->first();
            $dbPaymentStatusName = $lastPayment?->status?->payment_status;

            if ($dbPaymentStatusName && in_array(strtolower(trim($dbPaymentStatusName)), ['partial', 'completed'], true)) {
                $paymentStatus = match (strtolower(trim($dbPaymentStatusName))) {
                    'completed' => 'Paid',
                    'partial' => 'Partially Paid',
                    default => $dbPaymentStatusName,
                };
            } elseif ($paidAmount >= $totalAmount && $totalAmount > 0) {
                $paymentStatus = 'Paid';
            } elseif ($paidAmount > 0) {
                $paymentStatus = 'Partially Paid';
            } else {
                $paymentStatus = 'Unpaid';
            }

            if ($statusFilter !== 'ALL' && strcasecmp($statusName, $statusFilter) !== 0) {
                continue;
            }
            if ($paymentFilter !== 'ALL' && strcasecmp($paymentStatus, $paymentFilter) !== 0) {
                continue;
            }

            $addDate = $job->add_date ?? now();
            $employeeName = $job->user ? ($job->user->first_name.' '.$job->user->last_name) : 'Admin User';

            $orders[] = [
                'id' => 'ORD-2026-'.(1000 + $job->id),
                'printJobId' => (int) $job->id,
                'orderDate' => $addDate->toDateString(),
                'orderDateTime' => $addDate->format('Y-m-d H:i:s'),
                'orderTime' => $addDate->format('h:i A'),
                'orderTime24' => $addDate->format('H:i'),
                'customerId' => 'CUST-'.str_pad((string) $job->customer_id, 3, '0', STR_PAD_LEFT),
                'customerName' => $job->customer?->name ?? 'Customer #'.$job->customer_id,
                'customerMobile' => $job->customer?->mobile ?? '',
                'productKey' => strtolower(str_replace([' ', '/', '&'], ['_', '_', ''], $job->printType?->print_type ?? 'flex')),
                'productName' => $job->printType?->print_type ?? 'Flex Banner',
                'width' => $width,
                'height' => $height,
                'unit' => $unitSymbol,
                'unitName' => $unitName,
                'quantity' => $qty,
                'areaSqFt' => round($areaSqFt, 2),
                'unitPrice' => $unitPrice,
                'designStatus' => 'Customer Provides Design',
                'deliveryMethod' => $job->deliveryMethod?->methord ?? 'Customer Pickup',
                'deliveryMethodId' => (int) ($job->delivery_method_id ?? 1),
                'requiredDate' => $job->delivery_date instanceof CarbonInterface
                    ? $job->delivery_date->format('Y-m-d')
                    : ($job->delivery_date ? substr((string) $job->delivery_date, 0, 10) : $addDate->toDateString()),
                'delivery_date' => $job->delivery_date instanceof CarbonInterface
                    ? $job->delivery_date->format('Y-m-d')
                    : ($job->delivery_date ? substr((string) $job->delivery_date, 0, 10) : null),
                'deadline' => $job->delivery_date instanceof CarbonInterface
                    ? $job->delivery_date->format('Y-m-d')
                    : ($job->delivery_date ? substr((string) $job->delivery_date, 0, 10) : null),
                'totalAmount' => round($totalAmount, 2),
                'paidAmount' => round($paidAmount, 2),
                'balanceAmount' => round($balanceAmount, 2),
                'paymentStatus' => $paymentStatus,
                'orderStatus' => $statusName,
                'assignedEmployee' => $employeeName,
                'discription' => $job->discription,
                'notes' => $job->discription ?: ('Print job order #'.$job->id),
            ];
        }

        return $orders;
    }

    /**
     * Resolve place-order payment installment records from database.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function resolvePlaceOrderPayments(): array
    {
        $payments = Payment::query()
            ->with(['printJob', 'paymentType', 'status'])
            ->where('payment', '>', 0)
            ->orderByDesc('id')
            ->get();

        $result = [];
        foreach ($payments as $idx => $p) {
            $result[] = [
                'paymentId' => 'PAY-2026-'.str_pad((string) $p->id, 4, '0', STR_PAD_LEFT),
                'orderId' => 'ORD-2026-'.(1000 + (int) $p->print_jobs_id),
                'installmentNo' => $idx + 1,
                'date' => $p->pay_date ? $p->pay_date->toDateString() : now()->toDateString(),
                'amount' => (float) $p->payment,
                'method' => $p->paymentType?->payment_type ?? 'Cash',
                'ref' => 'RCPT-'.$p->id,
                'receivedBy' => 'Admin User',
                'status' => $p->status?->payment_status ?? 'Successful',
                'note' => 'Payment transaction #'.$p->id,
            ];
        }

        return $result;
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

    /**
     * Automatically resolve the payment status ID based on paid amount vs total amount.
     */
    protected function resolveAutoPaymentStatusId(float $paidAmount, float $totalAmount): int
    {
        $statuses = PaymentStatus::query()->orderBy('id')->get();

        if ($paidAmount >= $totalAmount && $totalAmount > 0) {
            $match = $statuses->first(fn ($s) => preg_match('/^(paid|completed)$/i', (string) $s->payment_status) === 1);

            return (int) ($match?->id ?? 2);
        }

        if ($paidAmount > 0) {
            $match = $statuses->first(fn ($s) => stripos((string) $s->payment_status, 'partial') !== false);

            return (int) ($match?->id ?? 3);
        }

        $match = $statuses->first(fn ($s) => preg_match('/^(pending|unpaid)$/i', (string) $s->payment_status) === 1);

        return (int) ($match?->id ?? 1);
    }
}
