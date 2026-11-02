<?php

namespace Modules\Supplier\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Modules\Inventory\Models\Stock;
use Modules\Supplier\Models\Grn;

class GrnService
{
    /**
     * Build the query for GRNs.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<Grn>
     */
    public function buildQuery(array $filters = []): Builder
    {
        $query = Grn::query()->with(['purchaseOrders.supplier', 'stocks.stockItem'])->withCount('stocks');

        if (! empty($filters['from_date'])) {
            $query->whereDate('at_time', '>=', $filters['from_date']);
        }

        if (! empty($filters['to_date'])) {
            $query->whereDate('at_time', '<=', $filters['to_date']);
        }

        return $query->orderByDesc('id');
    }

    /**
     * Retrieve all GRNs.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Grn>
     */
    public function getAllGrns(array $filters = []): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    /**
     * Retrieve paginated GRNs.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getGrns(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        return $this->buildQuery($filters)->paginate($perPage);
    }

    /**
     * Find a GRN by ID with relations.
     */
    public function getGrnById(int $id): ?Grn
    {
        return Grn::query()
            ->with(['purchaseOrders.supplier', 'stocks.stockItem', 'payments'])
            ->withCount('stocks')
            ->find($id);
    }

    /**
     * Create a new GRN with optional purchase order link and stock items.
     *
     * @param  array<string, mixed>  $data
     */
    public function createGrn(array $data): Grn
    {
        return DB::transaction(function () use ($data) {
            $grn = Grn::create([
                'at_time' => ! empty($data['at_time']) ? $data['at_time'] : now(),
            ]);

            if (! empty($data['purchase_orders_id'])) {
                $grn->purchaseOrders()->attach((int) $data['purchase_orders_id'], [
                    'supplyer_invoice' => $data['supplyer_invoice'] ?? null,
                ]);
            }

            if (! empty($data['stocks']) && is_array($data['stocks'])) {
                foreach ($data['stocks'] as $stockItem) {
                    Stock::create([
                        'stock_items_id' => (int) $stockItem['stock_items_id'],
                        'brands_id' => (int) $stockItem['brands_id'],
                        'qty' => (int) $stockItem['qty'],
                        'price' => (float) $stockItem['price'],
                        'buy' => (float) $stockItem['buy'],
                        'add_date' => now(),
                        'grn_id' => $grn->id,
                    ]);
                }
            }

            return $this->getGrnById($grn->id) ?? $grn;
        });
    }

    /**
     * Delete a GRN.
     */
    public function deleteGrn(Grn $grn): bool
    {
        return DB::transaction(function () use ($grn) {
            $grn->purchaseOrders()->detach();

            return (bool) $grn->delete();
        });
    }
}
