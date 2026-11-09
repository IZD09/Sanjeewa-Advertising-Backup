<?php

namespace Modules\Inventory\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Modules\Inventory\Models\ItemBatch;

class ItemBatchService
{
    /**
     * Build base query for item batches.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<ItemBatch>
     */
    public function buildBatchesQuery(array $filters = []): Builder
    {
        $query = ItemBatch::with([
            'stockItem.subcategory.category',
            'stockItem.brands',
            'grmItems.grn',
            'grmItems.stock.brand',
        ])->withCount('grmItems')->orderByDesc('id');

        if (! empty($filters['stock_items_id'])) {
            $query->where('stock_items_id', (int) $filters['stock_items_id']);
        }

        $search = isset($filters['search']) ? trim((string) $filters['search']) : '';
        if ($search !== '') {
            $query->where(function (Builder $q) use ($search): void {
                if (is_numeric($search)) {
                    $q->where('id', (int) $search);
                }

                $q->orWhereHas('stockItem', function (Builder $sq) use ($search): void {
                    $sq->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            });
        }

        return $query;
    }

    /**
     * Paginate item batches.
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginateBatches(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));
        $page = isset($filters['page']) ? max(1, (int) $filters['page']) : null;

        return $this->buildBatchesQuery($filters)->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get all batches matching filters.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, ItemBatch>
     */
    public function getAllBatches(array $filters = []): Collection
    {
        return $this->buildBatchesQuery($filters)->get();
    }

    /**
     * Find a batch by ID.
     */
    public function getBatchById(int $id): ?ItemBatch
    {
        return ItemBatch::with([
            'stockItem.subcategory.category',
            'stockItem.brands',
            'grmItems.grn',
            'grmItems.stock.brand',
        ])->find($id);
    }

    /**
     * Create a new item batch.
     *
     * @param  array<string, mixed>  $data
     */
    public function createBatch(array $data): ItemBatch
    {
        return ItemBatch::create([
            'stock_items_id' => (int) $data['stock_items_id'],
        ]);
    }

    /**
     * Delete an item batch.
     */
    public function deleteBatch(ItemBatch $batch): bool
    {
        return DB::transaction(function () use ($batch): bool {
            $batch->grmItems()->delete();

            return (bool) $batch->delete();
        });
    }
}
