<?php

namespace Modules\Design\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Modules\Design\Models\PrintCost;
use Modules\Design\Models\PrintCostType;
use Modules\Design\Models\PrintType;

class DesignService
{
    /**
     * Build the query for print types.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<PrintType>
     */
    public function buildPrintTypesQuery(array $filters = []): Builder
    {
        $query = PrintType::query()->withCount('printJobs');

        $search = $filters['search'] ?? $filters['q'] ?? null;
        if (! empty($search)) {
            $search = trim((string) $search);
            $query->where('print_type', 'like', "%{$search}%");
        }

        $sortBy = (string) ($filters['sort_by'] ?? 'id');
        $sortOrder = strtolower((string) ($filters['sort_order'] ?? 'asc')) === 'desc' ? 'desc' : 'asc';
        $allowedSorts = ['id', 'print_type'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('id');
        }

        return $query;
    }

    /**
     * Retrieve all print types.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, PrintType>
     */
    public function getAllPrintTypes(array $filters = []): Collection
    {
        return $this->buildPrintTypesQuery($filters)->get();
    }

    /**
     * Retrieve paginated print types.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getPrintTypes(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        return $this->buildPrintTypesQuery($filters)->paginate($perPage);
    }

    /**
     * Find a print type by ID.
     */
    public function getPrintTypeById(int $id): ?PrintType
    {
        return PrintType::query()
            ->with(['printCostTypes.printCosts'])
            ->withCount('printJobs')
            ->find($id);
    }

    /**
     * Create a new print type.
     *
     * @param  array<string, mixed>  $data
     */
    public function createPrintType(array $data): PrintType
    {
        $printType = PrintType::create([
            'print_type' => trim((string) ($data['print_type'] ?? '')),
        ]);

        // Auto-create a linked print_cost_type record so costs can be immediately assigned
        PrintCostType::firstOrCreate([
            'print_types_id' => $printType->id,
        ]);

        return $printType;
    }

    /**
     * Update an existing print type.
     *
     * @param  array<string, mixed>  $data
     */
    public function updatePrintType(PrintType $printType, array $data): PrintType
    {
        $printType->update([
            'print_type' => trim((string) ($data['print_type'] ?? $printType->print_type)),
        ]);

        return $printType->fresh();
    }

    /**
     * Delete a print type.
     */
    public function deletePrintType(PrintType $printType): bool
    {
        return DB::transaction(function () use ($printType) {
            foreach ($printType->printCostTypes as $costType) {
                $costType->printCosts()->delete();
                $costType->delete();
            }

            return (bool) $printType->delete();
        });
    }

    /**
     * Build the query for print costs.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<PrintCost>
     */
    public function buildPrintCostsQuery(array $filters = []): Builder
    {
        $query = PrintCost::query()->with('printCostType.printType');

        if (! empty($filters['print_types_id'])) {
            $query->whereHas('printCostType', function (Builder $q) use ($filters) {
                $q->where('print_types_id', (int) $filters['print_types_id']);
            });
        }

        if (! empty($filters['print_cost_type_id'])) {
            $query->where('print_cost_type_id', (int) $filters['print_cost_type_id']);
        }

        return $query->orderByDesc('id');
    }

    /**
     * Retrieve all print costs.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, PrintCost>
     */
    public function getAllPrintCosts(array $filters = []): Collection
    {
        return $this->buildPrintCostsQuery($filters)->get();
    }

    /**
     * Retrieve paginated print costs.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getPrintCosts(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        return $this->buildPrintCostsQuery($filters)->paginate($perPage);
    }

    /**
     * Find a print cost by ID.
     */
    public function getPrintCostById(int $id): ?PrintCost
    {
        return PrintCost::query()->with('printCostType.printType')->find($id);
    }

    /**
     * Create a new print cost.
     *
     * @param  array<string, mixed>  $data
     */
    public function createPrintCost(array $data): PrintCost
    {
        $costTypeId = ! empty($data['print_cost_type_id'])
            ? (int) $data['print_cost_type_id']
            : null;

        if (! $costTypeId && ! empty($data['print_types_id'])) {
            $costType = PrintCostType::firstOrCreate([
                'print_types_id' => (int) $data['print_types_id'],
            ]);
            $costTypeId = $costType->id;
        }

        return PrintCost::create([
            'print_cost_type_id' => $costTypeId,
            'price' => (float) ($data['price'] ?? 0),
            'add_at' => ! empty($data['add_at']) ? $data['add_at'] : now(),
        ])->load('printCostType.printType');
    }

    /**
     * Update an existing print cost.
     *
     * @param  array<string, mixed>  $data
     */
    public function updatePrintCost(PrintCost $printCost, array $data): PrintCost
    {
        $attributes = [];

        if (isset($data['price'])) {
            $attributes['price'] = (float) $data['price'];
        }
        if (isset($data['print_cost_type_id'])) {
            $attributes['print_cost_type_id'] = (int) $data['print_cost_type_id'];
        }
        if (isset($data['add_at'])) {
            $attributes['add_at'] = $data['add_at'];
        }

        $printCost->update($attributes);

        return $printCost->fresh('printCostType.printType');
    }

    /**
     * Delete a print cost.
     */
    public function deletePrintCost(PrintCost $printCost): bool
    {
        return (bool) $printCost->delete();
    }

    /**
     * Retrieve all print cost types.
     *
     * @return Collection<int, PrintCostType>
     */
    public function getAllCostTypes(): Collection
    {
        return PrintCostType::query()->with('printType')->get();
    }
}
