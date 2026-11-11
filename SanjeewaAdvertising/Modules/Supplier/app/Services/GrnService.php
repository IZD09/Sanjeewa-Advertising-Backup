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
        $query = Grn::query()
            ->with(['purchaseOrders.supplier', 'stocks.stockItem'])
            ->withCount('stocks');

        if (! empty($filters['from_date'])) {
            $query->whereDate('at_time', '>=', $filters['from_date']);
        }

        if (! empty($filters['to_date'])) {
            $query->whereDate('at_time', '<=', $filters['to_date']);
        }

        $statusFilter = (string) ($filters['status'] ?? 'ALL');
        if ($statusFilter !== '' && strcasecmp($statusFilter, 'ALL') !== 0) {
            if (strcasecmp($statusFilter, 'Completed') === 0) {
                $query->whereHas('stocks');
            } elseif (strcasecmp($statusFilter, 'Draft') === 0) {
                $query->whereDoesntHave('stocks');
            }
        }

        if (! empty($filters['suppliers_id'])) {
            $supplierId = (int) $filters['suppliers_id'];
            $query->whereHas('purchaseOrders', function (Builder $q) use ($supplierId) {
                $q->where('suppliers_id', $supplierId);
            });
        } elseif (! empty($filters['supplier']) && strcasecmp((string) $filters['supplier'], 'ALL') !== 0) {
            $supplierName = trim((string) $filters['supplier']);
            $query->whereHas('purchaseOrders.supplier', function (Builder $q) use ($supplierName) {
                $q->where('name', $supplierName);
            });
        }

        $search = trim((string) ($filters['search'] ?? $filters['q'] ?? ''));
        if ($search !== '') {
            $numericId = preg_replace('/\D+/', '', $search);
            $query->where(function (Builder $q) use ($search, $numericId) {
                if ($numericId !== '') {
                    $q->where('id', (int) $numericId)
                        ->orWhereHas('purchaseOrders', function (Builder $poQuery) use ($numericId) {
                            $poQuery->where('purchase_orders.id', (int) $numericId);
                        });
                }

                $q->orWhereHas('purchaseOrders', function (Builder $poQuery) use ($search) {
                    $poQuery->where('grn_has_puches_order.supplyer_invoice', 'like', "%{$search}%");
                })->orWhereHas('purchaseOrders.supplier', function (Builder $supQuery) use ($search) {
                    $supQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('mobile', 'like', "%{$search}%");
                });
            });
        }

        return $query->orderByDesc('id');
    }

    /**
     * Retrieve all GRNs from database.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Grn>
     */
    public function getAllGrns(array $filters = []): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    /**
     * Retrieve paginated GRNs from database.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getGrns(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));
        $page = isset($filters['page']) ? max(1, (int) $filters['page']) : null;

        return $this->buildQuery($filters)->paginate($perPage, ['*'], 'page', $page);
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

    /**
     * Retrieve Goods Received Notes (GRN) database records, pagination, and KPIs for UI views.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getGrnData(array $filters = []): array
    {
        $perPage = isset($filters['per_page']) ? max(1, min(100, (int) $filters['per_page'])) : 20;
        $paginator = $this->getGrns($filters, $perPage);

        $grns = collect($paginator->items())
            ->map(fn (Grn $grn) => $this->formatGrnRecord($grn))
            ->values()
            ->all();

        $kpis = $this->resolveDatabaseGrnKpis();

        return [
            'grns' => $grns,
            'records' => $grns,
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
     * Format a Grn Eloquent model into the UI array representation.
     *
     * @return array<string, mixed>
     */
    public function formatGrnRecord(Grn $grn): array
    {
        $purchaseOrders = $grn->purchaseOrders;
        $poCodes = [];
        $supplierInvoices = [];
        $poList = [];
        $primarySupplier = null;

        foreach ($purchaseOrders as $order) {
            $code = 'PO-'.str_pad((string) $order->id, 4, '0', STR_PAD_LEFT);
            $poCodes[] = $code;
            if ($order->supplier && ! $primarySupplier) {
                $primarySupplier = $order->supplier;
            }
            $inv = $order->pivot?->supplyer_invoice;
            if (! empty($inv)) {
                $supplierInvoices[] = $inv;
            }
            $poList[] = [
                'id' => $order->id,
                'po_number' => $code,
                'supplier_invoice' => $inv ?? '',
                'supplier_id' => $order->suppliers_id ?? $order->supplier_id,
                'supplier_name' => $order->supplier?->name ?? 'Supplier',
            ];
        }

        $supplier = $primarySupplier;
        $supplierInvoice = implode(', ', array_unique($supplierInvoices));

        $items = [];
        $subTotal = 0.0;

        foreach ($grn->stocks as $stock) {
            $qty = (int) $stock->qty;
            $unitCost = (float) $stock->buy;
            $itemTotal = $qty * $unitCost;
            $subTotal += $itemTotal;

            $items[] = [
                'item_id' => $stock->stockItem?->code ?? ('ITM-'.$stock->stock_items_id),
                'stock_items_id' => $stock->stock_items_id,
                'item_name' => $stock->stockItem?->name ?? ('Item #'.$stock->stock_items_id),
                'unit' => 'Units',
                'qty_received' => $qty,
                'unit_cost' => $unitCost,
                'item_total' => $itemTotal,
                'batch_id' => 'BAT-'.str_pad((string) $stock->id, 3, '0', STR_PAD_LEFT),
            ];
        }

        $grnCode = 'GRN-'.str_pad((string) $grn->id, 4, '0', STR_PAD_LEFT);
        $poCode = count($poCodes) > 0 ? implode(', ', $poCodes) : 'N/A';
        $status = count($items) > 0 ? 'Completed' : 'Draft';

        return [
            'id' => $grn->id,
            'grn_id' => $grnCode,
            'grn_number' => $grnCode,
            'purchase_order_id' => $purchaseOrders->first()?->id,
            'purchase_order_no' => $poCode,
            'purchase_orders' => $poList,
            'purchase_order_count' => count($poList),
            'supplier_id' => $supplier ? ('SUP-'.str_pad((string) $supplier->id, 3, '0', STR_PAD_LEFT)) : null,
            'supplier_name' => $supplier?->name ?? 'Direct Consignment',
            'supplier_contact' => $supplier?->mobile ?? ($supplierInvoice !== '' ? $supplierInvoice : 'N/A'),
            'supplier_invoice_no' => $supplierInvoice,
            'received_date' => $grn->at_time?->toDateString() ?? '',
            'sub_total' => $subTotal,
            'discount' => 0.00,
            'net_total' => $subTotal,
            'received_by' => 'Admin User',
            'status' => $status,
            'created_at' => $grn->at_time?->toDateTimeString() ?? '',
            'remarks' => $supplierInvoice !== '' ? "Supplier Invoices: {$supplierInvoice}" : '',
            'items' => $items,
        ];
    }

    /**
     * Calculate summary metrics / KPIs for GRNs from the database.
     *
     * @return array<string, mixed>
     */
    protected function resolveDatabaseGrnKpis(): array
    {
        $totalCount = Grn::query()->count();
        $completedCount = Grn::query()->whereHas('stocks')->count();
        $draftCount = max(0, $totalCount - $completedCount);
        $totalValue = (float) Stock::query()
            ->whereNotNull('grn_id')
            ->selectRaw('COALESCE(SUM(qty * buy), 0) as total_val')
            ->value('total_val');

        return [
            'total' => $totalCount,
            'completed' => $completedCount,
            'draft' => $draftCount,
            'total_value' => $totalValue,
        ];
    }
}
