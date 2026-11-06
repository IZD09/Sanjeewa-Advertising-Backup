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

    /**
     * Retrieve Purchase Orders demo data and KPIs for UI views.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getPurchaseOrdersData(array $filters = []): array
    {
        $orders = $this->resolvePurchaseOrdersDemoData($filters);
        $kpis = $this->resolvePurchaseOrdersKpis($orders);

        return [
            'purchase_orders' => $orders,
            'orders' => $orders,
            'kpis' => $kpis,
        ];
    }

    /**
     * Resolve demo Purchase Orders records with optional search, status, and supplier filtering.
     *
     * @param  array<string, mixed>  $filters
     * @return array<int, array<string, mixed>>
     */
    protected function resolvePurchaseOrdersDemoData(array $filters = []): array
    {
        $today = now();

        $allOrders = [
            [
                'po_number' => 'PO-2026-098',
                'order_date' => $today->copy()->subDays(1)->toDateString(),
                'expected_date' => $today->copy()->addDays(4)->toDateString(),
                'supplier_name' => 'PaperPro Lanka',
                'supplier_contact' => '077 123 4567',
                'status' => 'Pending',
                'total_amount' => 55000.00,
                'created_by' => 'Admin User',
                'remarks' => 'Urgent restocking for premium brochure printing job.',
                'items' => [
                    [
                        'item_id' => 'PAP-001',
                        'item_name' => '300gsm Art Board SRA3',
                        'unit' => 'Sheets',
                        'qty_ordered' => 800,
                        'qty_received' => 0,
                        'unit_cost' => 45.00,
                        'item_total' => 36000.00,
                    ],
                    [
                        'item_id' => 'PAP-002',
                        'item_name' => '250gsm Ivory Board A3',
                        'unit' => 'Sheets',
                        'qty_ordered' => 500,
                        'qty_received' => 0,
                        'unit_cost' => 38.00,
                        'item_total' => 19000.00,
                    ],
                ],
            ],
            [
                'po_number' => 'PO-2026-096',
                'order_date' => $today->copy()->subDays(4)->toDateString(),
                'expected_date' => $today->copy()->addDays(2)->toDateString(),
                'supplier_name' => 'Flora Tech International',
                'supplier_contact' => '071 889 2233',
                'status' => 'Partial',
                'total_amount' => 85000.00,
                'created_by' => 'Admin User',
                'remarks' => 'Regular monthly ink batch for wide-format printer.',
                'items' => [
                    [
                        'item_id' => 'INK-101',
                        'item_name' => 'Flora Solvent Cyan Ink (5L)',
                        'unit' => 'Liters',
                        'qty_ordered' => 6,
                        'qty_received' => 4,
                        'unit_cost' => 8500.00,
                        'item_total' => 51000.00,
                    ],
                    [
                        'item_id' => 'INK-102',
                        'item_name' => 'Flora Solvent Magenta Ink (5L)',
                        'unit' => 'Liters',
                        'qty_ordered' => 4,
                        'qty_received' => 0,
                        'unit_cost' => 8500.00,
                        'item_total' => 34000.00,
                    ],
                ],
            ],
            [
                'po_number' => 'PO-2026-095',
                'order_date' => $today->copy()->subDays(7)->toDateString(),
                'expected_date' => $today->copy()->subDays(2)->toDateString(),
                'supplier_name' => 'Avery Dennison Lanka',
                'supplier_contact' => '077 334 1122',
                'status' => 'Completed',
                'total_amount' => 100800.00,
                'created_by' => 'Nuwan Silva',
                'remarks' => 'Self-adhesive vinyl rolls for corporate branding.',
                'items' => [
                    [
                        'item_id' => 'VIN-301',
                        'item_name' => 'Glossy Self-Adhesive Vinyl (4ft × 50m)',
                        'unit' => 'Rolls',
                        'qty_ordered' => 6,
                        'qty_received' => 6,
                        'unit_cost' => 16800.00,
                        'item_total' => 100800.00,
                    ],
                ],
            ],
            [
                'po_number' => 'PO-2026-092',
                'order_date' => $today->copy()->subDays(10)->toDateString(),
                'expected_date' => $today->copy()->subDays(5)->toDateString(),
                'supplier_name' => 'MegaFlex Imports',
                'supplier_contact' => '076 554 9988',
                'status' => 'Completed',
                'total_amount' => 66000.00,
                'created_by' => 'Admin User',
                'remarks' => 'Outdoor billboard flex rolls.',
                'items' => [
                    [
                        'item_id' => 'FLX-201',
                        'item_name' => 'Star Flex Heavy Banner 380gsm (10ft × 50m)',
                        'unit' => 'Rolls',
                        'qty_ordered' => 3,
                        'qty_received' => 3,
                        'unit_cost' => 22000.00,
                        'item_total' => 66000.00,
                    ],
                ],
            ],
            [
                'po_number' => 'PO-2026-088',
                'order_date' => $today->copy()->subDays(14)->toDateString(),
                'expected_date' => $today->copy()->subDays(9)->toDateString(),
                'supplier_name' => 'SignBoard Supplies',
                'supplier_contact' => '075 443 2211',
                'status' => 'Completed',
                'total_amount' => 68000.00,
                'created_by' => 'Chamara Bandara',
                'remarks' => 'Foam boards for exhibition backdrop signage.',
                'items' => [
                    [
                        'item_id' => 'RIG-401',
                        'item_name' => '5mm White Foam Board (4ft × 8ft)',
                        'unit' => 'Sheets',
                        'qty_ordered' => 20,
                        'qty_received' => 20,
                        'unit_cost' => 3400.00,
                        'item_total' => 68000.00,
                    ],
                ],
            ],
            [
                'po_number' => 'PO-2026-085',
                'order_date' => $today->copy()->subDays(18)->toDateString(),
                'expected_date' => $today->copy()->subDays(12)->toDateString(),
                'supplier_name' => 'DisplayTech Hardware',
                'supplier_contact' => '077 998 7766',
                'status' => 'Pending',
                'total_amount' => 48000.00,
                'created_by' => 'Admin User',
                'remarks' => 'Exhibition hardware display stands order.',
                'items' => [
                    [
                        'item_id' => 'DSP-501',
                        'item_name' => 'Rollup Banner Stand Aluminium (2.5ft × 6ft)',
                        'unit' => 'Units',
                        'qty_ordered' => 15,
                        'qty_received' => 0,
                        'unit_cost' => 3200.00,
                        'item_total' => 48000.00,
                    ],
                ],
            ],
        ];

        $searchTerm = strtolower(trim((string) ($filters['search'] ?? $filters['q'] ?? '')));
        $statusFilter = (string) ($filters['status'] ?? 'ALL');
        $supplierFilter = (string) ($filters['supplier'] ?? 'ALL');

        return array_values(array_filter($allOrders, function ($po) use ($searchTerm, $statusFilter, $supplierFilter) {
            if ($statusFilter !== 'ALL' && strcasecmp($po['status'], $statusFilter) !== 0) {
                return false;
            }

            if ($supplierFilter !== 'ALL' && strcasecmp($po['supplier_name'], $supplierFilter) !== 0) {
                return false;
            }

            if ($searchTerm !== '') {
                $itemNames = implode(' ', array_column($po['items'] ?? [], 'item_name'));
                $searchable = strtolower($po['po_number'] . ' ' . $po['supplier_name'] . ' ' . $po['supplier_contact'] . ' ' . $itemNames);
                if (! str_contains($searchable, $searchTerm)) {
                    return false;
                }
            }

            return true;
        }));
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
