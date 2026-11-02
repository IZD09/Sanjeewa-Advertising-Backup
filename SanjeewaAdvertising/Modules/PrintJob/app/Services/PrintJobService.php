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
}
