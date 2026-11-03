<?php

namespace Modules\Transaction\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Modules\Transaction\Models\Expencesess;
use Modules\Transaction\Models\ExpencesessStatus;
use Modules\Transaction\Models\ExpencesessType;
use Modules\Transaction\Transformers\ExpencesessResource;

class ExpencesessService
{
    /**
     * Build the query for operating expenses.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<Expencesess>
     */
    public function buildExpencesessQuery(array $filters = []): Builder
    {
        $query = Expencesess::query()->with(['type', 'status', 'addedBy', 'paidBy']);

        if (! empty($filters['expencesess_types_id'])) {
            $query->where('expencesess_types_id', (int) $filters['expencesess_types_id']);
        }

        if (! empty($filters['expencesess_statuses_id'])) {
            $query->where('expencesess_statuses_id', (int) $filters['expencesess_statuses_id']);
        }

        if (! empty($filters['add_by'])) {
            $query->where('add_by', (int) $filters['add_by']);
        }

        if (! empty($filters['pay_by'])) {
            $query->where('pay_by', (int) $filters['pay_by']);
        }

        if (! empty($filters['from_date'])) {
            $query->whereDate('add_date', '>=', $filters['from_date']);
        }

        if (! empty($filters['to_date'])) {
            $query->whereDate('add_date', '<=', $filters['to_date']);
        }

        $search = trim((string) ($filters['search'] ?? $filters['q'] ?? ''));
        if ($search !== '') {
            $query->where(function (Builder $q) use ($search) {
                $q->whereHas('type', function (Builder $typeQ) use ($search) {
                    $typeQ->where('expencesess_type', 'like', "%{$search}%");
                })->orWhereHas('status', function (Builder $statusQ) use ($search) {
                    $statusQ->where('expencesess_status', 'like', "%{$search}%");
                });
            });
        }

        return $query->orderByDesc('id');
    }

    /**
     * Retrieve all operating expenses matching filters.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Expencesess>
     */
    public function getAllExpencesess(array $filters = []): Collection
    {
        return $this->buildExpencesessQuery($filters)->get();
    }

    /**
     * Retrieve paginated operating expenses.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getExpencesess(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        return $this->buildExpencesessQuery($filters)->paginate($perPage);
    }

    /**
     * Find an expense by ID.
     */
    public function getExpencesessById(int $id): ?Expencesess
    {
        return Expencesess::with(['type', 'status', 'addedBy', 'paidBy'])->find($id);
    }

    /**
     * Create a new expense.
     *
     * @param  array<string, mixed>  $data
     */
    public function createExpencesess(array $data): Expencesess
    {
        if (empty($data['add_by'])) {
            $data['add_by'] = Auth::id() ?? 1;
        }

        if (empty($data['add_date'])) {
            $data['add_date'] = now();
        }

        $expense = Expencesess::create($data);

        return $expense->load(['type', 'status', 'addedBy', 'paidBy']);
    }

    /**
     * Update an expense.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateExpencesess(Expencesess $expense, array $data): Expencesess
    {
        $expense->update($data);

        return $expense->fresh(['type', 'status', 'addedBy', 'paidBy']);
    }

    /**
     * Delete an expense.
     */
    public function deleteExpencesess(Expencesess $expense): bool
    {
        return (bool) $expense->delete();
    }

    /**
     * Retrieve all expense types.
     *
     * @return Collection<int, ExpencesessType>
     */
    public function getAllTypes(): Collection
    {
        return ExpencesessType::orderBy('expencesess_type')->get();
    }

    /**
     * Find an expense type by ID.
     */
    public function getTypeById(int $id): ?ExpencesessType
    {
        return ExpencesessType::find($id);
    }

    /**
     * Create an expense type.
     *
     * @param  array<string, mixed>  $data
     */
    public function createType(array $data): ExpencesessType
    {
        return ExpencesessType::create($data);
    }

    /**
     * Update an expense type.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateType(ExpencesessType $type, array $data): ExpencesessType
    {
        $type->update($data);

        return $type->fresh();
    }

    /**
     * Delete an expense type.
     */
    public function deleteType(ExpencesessType $type): bool
    {
        return (bool) $type->delete();
    }

    /**
     * Retrieve all expense statuses.
     *
     * @return Collection<int, ExpencesessStatus>
     */
    public function getAllStatuses(): Collection
    {
        return ExpencesessStatus::orderBy('expencesess_status')->get();
    }

    /**
     * Find an expense status by ID.
     */
    public function getStatusById(int $id): ?ExpencesessStatus
    {
        return ExpencesessStatus::find($id);
    }

    /**
     * Create an expense status.
     *
     * @param  array<string, mixed>  $data
     */
    public function createStatus(array $data): ExpencesessStatus
    {
        return ExpencesessStatus::create($data);
    }

    /**
     * Update an expense status.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateStatus(ExpencesessStatus $status, array $data): ExpencesessStatus
    {
        $status->update($data);

        return $status->fresh();
    }

    /**
     * Delete an expense status.
     */
    public function deleteStatus(ExpencesessStatus $status): bool
    {
        return (bool) $status->delete();
    }

    /**
     * Retrieve operating expenses data and KPIs for UI views.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getOperatingExpensesData(array $filters = []): array
    {
        $expenses = $this->getAllExpencesess($filters);

        $totalBilled = (float) $expenses->sum('price');
        $totalPaid = (float) $expenses->filter(function ($item) {
            $statusName = strtolower($item->status?->expencesess_status ?? '');

            return $statusName === 'paid' || $item->pay_by !== null;
        })->sum('price');
        $totalPending = max(0.0, $totalBilled - $totalPaid);

        return [
            'expenses' => ExpencesessResource::collection($expenses),
            'kpis' => [
                'total_billed' => $totalBilled,
                'total_paid' => $totalPaid,
                'total_pending' => $totalPending,
                'total_count' => $expenses->count(),
            ],
        ];
    }
}
