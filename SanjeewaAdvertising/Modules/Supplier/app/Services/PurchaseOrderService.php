<?php

namespace Modules\Supplier\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Modules\Supplier\Models\PurchaseOrder;
use Modules\Supplier\Models\PurchaseOrderItem;

class PurchaseOrderService
{
    /**
     * Build the query for purchase orders.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<PurchaseOrder>
     */
    public function buildQuery(array $filters = []): Builder
    {
        $query = PurchaseOrder::query()->with(['supplier', 'items.stockItem', 'grns'])->withCount('items');

        $search = $filters['search'] ?? $filters['q'] ?? null;
        if (! empty($search)) {
            $search = trim((string) $search);
            $query->where(function (Builder $q) use ($search) {
                if (is_numeric($search)) {
                    $q->where('id', (int) $search);
                }
                $q->orWhereHas('supplier', function (Builder $sq) use ($search) {
                    $sq->where('name', 'like', "%{$search}%")
                        ->orWhere('mobile', 'like', "%{$search}%");
                });
            });
        }

        if (! empty($filters['suppliers_id'])) {
            $query->where('suppliers_id', (int) $filters['suppliers_id']);
        }

        if (! empty($filters['from_date'])) {
            $query->whereDate('add_date', '>=', $filters['from_date']);
        }

        if (! empty($filters['to_date'])) {
            $query->whereDate('add_date', '<=', $filters['to_date']);
        }

        return $query->orderByDesc('id');
    }

    /**
     * Retrieve all purchase orders.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, PurchaseOrder>
     */
    public function getAllPurchaseOrders(array $filters = []): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    /**
     * Retrieve paginated purchase orders.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getPurchaseOrders(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        return $this->buildQuery($filters)->paginate($perPage);
    }

    /**
     * Find a purchase order by ID with relations.
     */
    public function getPurchaseOrderById(int $id): ?PurchaseOrder
    {
        return PurchaseOrder::query()
            ->with(['supplier', 'items.stockItem', 'grns'])
            ->withCount('items')
            ->find($id);
    }

    /**
     * Create a new purchase order with line items.
     *
     * @param  array<string, mixed>  $data
     */
    public function createPurchaseOrder(array $data): PurchaseOrder
    {
        return DB::transaction(function () use ($data) {
            $po = PurchaseOrder::create([
                'suppliers_id' => (int) $data['suppliers_id'],
                'add_date' => ! empty($data['add_date']) ? $data['add_date'] : now(),
            ]);

            if (! empty($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $item) {
                    PurchaseOrderItem::create([
                        'purchase_orders_id' => $po->id,
                        'stock_items_id' => (int) $item['stock_items_id'],
                        'unit_cost' => (float) ($item['unit_cost'] ?? 0),
                        'qty_ordered' => (int) ($item['qty_ordered'] ?? 1),
                        'qty_received' => (int) ($item['qty_received'] ?? 0),
                    ]);
                }
            }

            return $this->getPurchaseOrderById($po->id) ?? $po;
        });
    }

    /**
     * Update an existing purchase order.
     *
     * @param  array<string, mixed>  $data
     */
    public function updatePurchaseOrder(PurchaseOrder $purchaseOrder, array $data): PurchaseOrder
    {
        $attributes = [];

        if (isset($data['suppliers_id'])) {
            $attributes['suppliers_id'] = (int) $data['suppliers_id'];
        }
        if (isset($data['add_date'])) {
            $attributes['add_date'] = $data['add_date'];
        }

        $purchaseOrder->update($attributes);

        return $this->getPurchaseOrderById($purchaseOrder->id) ?? $purchaseOrder;
    }

    /**
     * Delete a purchase order.
     */
    public function deletePurchaseOrder(PurchaseOrder $purchaseOrder): bool
    {
        return DB::transaction(function () use ($purchaseOrder) {
            $purchaseOrder->items()->delete();
            $purchaseOrder->grns()->detach();

            return (bool) $purchaseOrder->delete();
        });
    }

    /**
     * Add a line item to a purchase order.
     *
     * @param  array<string, mixed>  $itemData
     */
    public function addItem(PurchaseOrder $purchaseOrder, array $itemData): PurchaseOrderItem
    {
        return PurchaseOrderItem::create([
            'purchase_orders_id' => $purchaseOrder->id,
            'stock_items_id' => (int) $itemData['stock_items_id'],
            'unit_cost' => (float) ($itemData['unit_cost'] ?? 0),
            'qty_ordered' => (int) ($itemData['qty_ordered'] ?? 1),
            'qty_received' => (int) ($itemData['qty_received'] ?? 0),
        ]);
    }
}
