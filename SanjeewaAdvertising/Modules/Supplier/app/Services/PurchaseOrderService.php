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
        $query = PurchaseOrder::query()
            ->with(['supplier', 'items.stockItem', 'grns'])
            ->withCount('items');

        $search = trim((string) ($filters['search'] ?? $filters['q'] ?? ''));
        if ($search !== '') {
            $numericId = preg_replace('/\D+/', '', $search);
            $query->where(function (Builder $q) use ($search, $numericId) {
                if ($numericId !== '') {
                    $q->where('id', (int) $numericId);
                }

                $q->orWhereHas('supplier', function (Builder $sq) use ($search) {
                    $sq->where('name', 'like', "%{$search}%")
                        ->orWhere('mobile', 'like', "%{$search}%");
                })->orWhereHas('items.stockItem', function (Builder $iq) use ($search) {
                    $iq->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            });
        }

        if (! empty($filters['suppliers_id'])) {
            $query->where('suppliers_id', (int) $filters['suppliers_id']);
        } elseif (! empty($filters['supplier']) && strcasecmp((string) $filters['supplier'], 'ALL') !== 0) {
            $supplierName = trim((string) $filters['supplier']);
            $query->whereHas('supplier', function (Builder $q) use ($supplierName) {
                $q->where('name', $supplierName);
            });
        }

        $statusFilter = (string) ($filters['status'] ?? 'ALL');
        if ($statusFilter !== '' && strcasecmp($statusFilter, 'ALL') !== 0) {
            if (strcasecmp($statusFilter, 'Completed') === 0) {
                $query->whereHas('items')
                    ->whereNotExists(function ($sub) {
                        $sub->select(DB::raw(1))
                            ->from('purchase_order_items')
                            ->whereColumn('purchase_order_items.purchase_orders_id', 'purchase_orders.id')
                            ->whereColumn('purchase_order_items.qty_received', '<', 'purchase_order_items.qty_ordered');
                    });
            } elseif (strcasecmp($statusFilter, 'Pending') === 0) {
                $query->whereDoesntHave('grns')
                    ->whereNotExists(function ($sub) {
                        $sub->select(DB::raw(1))
                            ->from('purchase_order_items')
                            ->whereColumn('purchase_order_items.purchase_orders_id', 'purchase_orders.id')
                            ->where('purchase_order_items.qty_received', '>', 0);
                    });
            } elseif (strcasecmp($statusFilter, 'Partial') === 0) {
                $query->where(function (Builder $q) {
                    $q->whereHas('grns')
                        ->orWhereExists(function ($sub) {
                            $sub->select(DB::raw(1))
                                ->from('purchase_order_items')
                                ->whereColumn('purchase_order_items.purchase_orders_id', 'purchase_orders.id')
                                ->where('purchase_order_items.qty_received', '>', 0);
                        });
                })->whereExists(function ($sub) {
                    $sub->select(DB::raw(1))
                        ->from('purchase_order_items')
                        ->whereColumn('purchase_order_items.purchase_orders_id', 'purchase_orders.id')
                        ->whereColumn('purchase_order_items.qty_received', '<', 'purchase_order_items.qty_ordered');
                });
            }
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
     * Retrieve all purchase orders from database.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, PurchaseOrder>
     */
    public function getAllPurchaseOrders(array $filters = []): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    /**
     * Retrieve paginated purchase orders from database.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getPurchaseOrders(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));
        $page = isset($filters['page']) ? max(1, (int) $filters['page']) : null;

        return $this->buildQuery($filters)->paginate($perPage, ['*'], 'page', $page);
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

    /**
     * Retrieve Purchase Orders database records, pagination, and KPIs for UI views.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getPurchaseOrdersData(array $filters = []): array
    {
        $perPage = isset($filters['per_page']) ? max(1, min(100, (int) $filters['per_page'])) : 20;
        $paginator = $this->getPurchaseOrders($filters, $perPage);

        $orders = collect($paginator->items())
            ->map(fn (PurchaseOrder $po) => $this->formatPurchaseOrderRecord($po))
            ->values()
            ->all();

        $allOrdersFormatted = $this->getAllPurchaseOrders([])
            ->map(fn (PurchaseOrder $po) => $this->formatPurchaseOrderRecord($po))
            ->values()
            ->all();

        $kpis = $this->resolvePurchaseOrdersKpis($allOrdersFormatted);

        return [
            'purchase_orders' => $orders,
            'orders' => $orders,
            'kpis' => $kpis,
            'pagination' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem() ?? 0,
                'to' => $paginator->lastItem() ?? 0,
            ],
        ];
    }

    /**
     * Format a PurchaseOrder Eloquent model into the UI array representation.
     *
     * @return array<string, mixed>
     */
    public function formatPurchaseOrderRecord(PurchaseOrder $po): array
    {
        $items = [];
        $totalAmount = 0.0;
        $totalOrdered = 0;
        $totalReceived = 0;

        foreach ($po->items as $item) {
            $qtyOrdered = (int) $item->qty_ordered;
            $qtyReceived = (int) $item->qty_received;
            $unitCost = (float) $item->unit_cost;
            $itemTotal = $qtyOrdered * $unitCost;

            $totalOrdered += $qtyOrdered;
            $totalReceived += $qtyReceived;
            $totalAmount += $itemTotal;

            $items[] = [
                'item_id' => $item->stockItem?->code ?? ('ITM-'.$item->stock_items_id),
                'stock_items_id' => $item->stock_items_id,
                'item_name' => $item->stockItem?->name ?? ('Item #'.$item->stock_items_id),
                'unit' => 'Units',
                'qty_ordered' => $qtyOrdered,
                'qty_received' => $qtyReceived,
                'unit_cost' => $unitCost,
                'item_total' => $itemTotal,
            ];
        }

        if ($totalOrdered > 0 && $totalReceived >= $totalOrdered) {
            $status = 'Completed';
        } elseif ($totalReceived > 0 || $po->grns->isNotEmpty()) {
            $status = ($totalOrdered === 0) ? 'Completed' : 'Partial';
        } else {
            $status = 'Pending';
        }

        $poCode = 'PO-'.str_pad((string) $po->id, 4, '0', STR_PAD_LEFT);
        $orderDate = $po->add_date?->toDateString() ?? '';
        $expectedDate = $po->add_date?->copy()->addDays(7)->toDateString() ?? 'N/A';

        return [
            'id' => $po->id,
            'po_number' => $poCode,
            'order_date' => $orderDate,
            'expected_date' => $expectedDate,
            'suppliers_id' => $po->suppliers_id,
            'supplier_name' => $po->supplier?->name ?? 'Unknown Supplier',
            'supplier_contact' => $po->supplier?->mobile ?? '-',
            'status' => $status,
            'total_amount' => $totalAmount,
            'created_by' => 'Admin User',
            'remarks' => '',
            'items' => $items,
        ];
    }

    /**
     * Calculate summary metrics / KPIs for Purchase Orders.
     *
     * @param  array<int, array<string, mixed>>  $orders
     * @return array<string, mixed>
     */
    protected function resolvePurchaseOrdersKpis(array $orders): array
    {
        $totalCount = count($orders);
        $pendingCount = 0;
        $partialCount = 0;
        $completedCount = 0;
        $totalEstimatedValue = 0.0;

        foreach ($orders as $order) {
            $totalEstimatedValue += (float) ($order['total_amount'] ?? 0);
            match ($order['status'] ?? '') {
                'Pending' => $pendingCount++,
                'Partial' => $partialCount++,
                'Completed' => $completedCount++,
                default => null,
            };
        }

        return [
            'total' => $totalCount,
            'pending' => $pendingCount,
            'partial' => $partialCount,
            'completed' => $completedCount,
            'open' => $pendingCount + $partialCount,
            'total_value' => $totalEstimatedValue,
        ];
    }
}
