<?php

namespace Modules\Inventory\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Modules\Inventory\Models\GrmItem;

class GrnItemService
{
    /**
     * Build base query for GRN line items.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<GrmItem>
     */
    public function buildGrnItemsQuery(array $filters = []): Builder
    {
        $query = GrmItem::with([
            'grn',
            'itemBatch.stockItem.subcategory',
            'stock.brand',
        ]);

        if (! empty($filters['grn_id'])) {
            $query->where('grn_id', (int) $filters['grn_id']);
        }

        if (! empty($filters['item_batches_id'])) {
            $query->where('item_batches_id', (int) $filters['item_batches_id']);
        }

        if (! empty($filters['stock_id'])) {
            $query->where('stock_id', (int) $filters['stock_id']);
        }

        $search = isset($filters['search']) ? trim((string) $filters['search']) : '';
        if ($search !== '') {
            $query->where(function (Builder $q) use ($search): void {
                if (is_numeric($search)) {
                    $q->where('grn_id', (int) $search)
                        ->orWhere('item_batches_id', (int) $search)
                        ->orWhere('stock_id', (int) $search);
                }

                $q->orWhereHas('itemBatch.stockItem', function (Builder $sq) use ($search): void {
                    $sq->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            });
        }

        return $query;
    }

    /**
     * Paginate GRN items.
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginateGrnItems(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));
        $page = isset($filters['page']) ? max(1, (int) $filters['page']) : null;

        return $this->buildGrnItemsQuery($filters)->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get all GRN items matching filters.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, GrmItem>
     */
    public function getAllGrnItems(array $filters = []): Collection
    {
        return $this->buildGrnItemsQuery($filters)->get();
    }

    /**
     * Get all items for a specific GRN.
     *
     * @return Collection<int, GrmItem>
     */
    public function getItemsByGrnId(int $grnId): Collection
    {
        return $this->buildGrnItemsQuery(['grn_id' => $grnId])->get();
    }

    /**
     * Create a new GRN item record.
     *
     * @param  array<string, mixed>  $data
     */
    public function createGrnItem(array $data): GrmItem
    {
        return GrmItem::create([
            'grn_id' => (int) $data['grn_id'],
            'item_batches_id' => (int) $data['item_batches_id'],
            'stock_id' => (int) $data['stock_id'],
            'qty' => (int) $data['qty'],
        ]);
    }

    /**
     * Delete a specific GRN item by composite key.
     */
    public function deleteGrnItem(int $grnId, int $itemBatchesId, int $stockId): bool
    {
        return (bool) GrmItem::where('grn_id', $grnId)
            ->where('item_batches_id', $itemBatchesId)
            ->where('stock_id', $stockId)
            ->delete();
    }
}
