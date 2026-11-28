<?php

namespace Modules\Supplier\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Modules\Core\Services\NotificationService;
use Modules\Core\Support\MobileNumberHelper;
use Modules\Inventory\Models\Brand;
use Modules\Inventory\Models\GrmItem;
use Modules\Inventory\Models\ItemBatch;
use Modules\Inventory\Models\Stock;
use Modules\Inventory\Models\StockMovement;
use Modules\Inventory\Models\StockMovementType;
use Modules\Supplier\Models\Grn;
use Modules\Supplier\Models\GrnStatus;
use Modules\Supplier\Models\Supplier;
use Modules\User\Models\User;

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
            ->with([
                'purchaseOrders.supplier',
                'stocks.stockItem.stockUnit',
                'stocks.brand',
                'stocks.grmItems.itemBatch',
                'grmItems.itemBatch',
                'grnStatus',
            ])
            ->withCount('stocks');

        if (! empty($filters['from_date'])) {
            $query->whereDate('at_time', '>=', $filters['from_date']);
        }

        if (! empty($filters['to_date'])) {
            $query->whereDate('at_time', '<=', $filters['to_date']);
        }

        if (! empty($filters['grn_statuses_id'])) {
            $query->where('grn_statuses_id', (int) $filters['grn_statuses_id']);
        } else {
            $statusFilter = trim((string) ($filters['status'] ?? 'ALL'));
            if ($statusFilter !== '' && strcasecmp($statusFilter, 'ALL') !== 0) {
                if (ctype_digit($statusFilter)) {
                    $query->where('grn_statuses_id', (int) $statusFilter);
                } else {
                    $statusId = GrnStatus::resolveIdByName($statusFilter, 0);
                    if ($statusId > 0) {
                        $query->where('grn_statuses_id', $statusId);
                    } else {
                        $query->whereHas('grnStatus', function (Builder $q) use ($statusFilter) {
                            $q->where('grn_status', $statusFilter);
                        });
                    }
                }
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
                    $supQuery->where('name', 'like', "%{$search}%");
                    MobileNumberHelper::orWhereMobileLike($supQuery, 'mobile', $search);
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
            ->with([
                'purchaseOrders.supplier',
                'purchaseOrders.items.stockItem.stockUnit',
                'stocks.stockItem.stockUnit',
                'stocks.brand',
                'stocks.grmItems.itemBatch',
                'grmItems.itemBatch',
                'payments',
                'grnStatus',
            ])
            ->withCount('stocks')
            ->find($id);
    }

    /**
     * Create a new GRN with linked purchase orders, batches, stock items, GRN items, and stock movements.
     *
     * @param  array<string, mixed>  $data
     */
    public function createGrn(array $data): Grn
    {
        return DB::transaction(function () use ($data) {
            if (! empty($data['grn_statuses_id'])) {
                $statusId = (int) $data['grn_statuses_id'];
            } elseif (! empty($data['status'])) {
                $statusId = GrnStatus::resolveIdByName((string) $data['status'], GrnStatus::STATUS_PENDING);
            } else {
                $statusId = GrnStatus::STATUS_PENDING;
            }

            $atTime = ! empty($data['at_time']) ? $data['at_time'] : now();

            $grn = Grn::create([
                'at_time' => $atTime,
                'grn_statuses_id' => $statusId,
            ]);

            $attachedPos = [];
            $usedInvoices = [];

            $normalizeInvoice = function (?string $rawInv, int $poId) use (&$usedInvoices, $grn): ?string {
                $inv = $rawInv !== null ? trim($rawInv) : '';
                if ($inv === '') {
                    return null;
                }

                $candidate = substr($inv, 0, 45);
                $existsInDb = DB::table('grn_has_puches_order')
                    ->where('supplyer_invoice', $candidate)
                    ->exists();

                if ($existsInDb || in_array($candidate, $usedInvoices, true)) {
                    $suffix = "-{$grn->id}-{$poId}";
                    $candidate = substr($inv, 0, 45 - strlen($suffix)).$suffix;
                }

                $usedInvoices[] = $candidate;

                return $candidate;
            };

            if (! empty($data['purchase_orders']) && is_array($data['purchase_orders'])) {
                foreach ($data['purchase_orders'] as $poItem) {
                    $poId = is_array($poItem) ? (int) ($poItem['id'] ?? $poItem['purchase_orders_id'] ?? 0) : (int) $poItem;
                    $rawInv = is_array($poItem)
                        ? ($poItem['supplyer_invoice'] ?? ($data['supplyer_invoice'] ?? null))
                        : ($data['supplyer_invoice'] ?? null);
                    if ($poId > 0) {
                        $attachedPos[$poId] = ['supplyer_invoice' => $normalizeInvoice($rawInv, $poId)];
                    }
                }
            } elseif (! empty($data['purchase_order_ids']) && is_array($data['purchase_order_ids'])) {
                foreach ($data['purchase_order_ids'] as $poId) {
                    $id = (int) $poId;
                    if ($id > 0) {
                        $attachedPos[$id] = ['supplyer_invoice' => $normalizeInvoice($data['supplyer_invoice'] ?? null, $id)];
                    }
                }
            } elseif (! empty($data['purchase_orders_id'])) {
                $poId = (int) $data['purchase_orders_id'];
                if ($poId > 0) {
                    $attachedPos[$poId] = ['supplyer_invoice' => $normalizeInvoice($data['supplyer_invoice'] ?? null, $poId)];
                }
            }

            if (! empty($attachedPos)) {
                $grn->purchaseOrders()->attach($attachedPos);
            }

            if (! empty($data['stocks']) && is_array($data['stocks'])) {
                $defaultBrandId = Brand::query()->value('id')
                    ?? Brand::query()->create(['brand' => 'Generic'])->id;

                $movementType = StockMovementType::query()->firstOrCreate(
                    ['id' => 1],
                    ['stock_movements_type' => 'GRN / Purchase Receipt']
                );

                $touchedPoIds = [];

                foreach ($data['stocks'] as $stockItem) {
                    $stockItemId = (int) ($stockItem['stock_items_id'] ?? 0);
                    if ($stockItemId <= 0) {
                        continue;
                    }

                    $brandId = ! empty($stockItem['brands_id'])
                        ? (int) $stockItem['brands_id']
                        : ((int) (DB::table('stock_items_has_brands')
                            ->where('stock_items_id', $stockItemId)
                            ->value('brands_id') ?? $defaultBrandId));

                    if (! Brand::where('id', $brandId)->exists()) {
                        $brandId = (int) $defaultBrandId;
                    }

                    DB::table('stock_items_has_brands')->insertOrIgnore([
                        'stock_items_id' => $stockItemId,
                        'brands_id' => $brandId,
                    ]);

                    $qty = round(max(0.001, (float) ($stockItem['qty'] ?? $stockItem['receiving_qty'] ?? 1)), 3);
                    $buyCost = (float) ($stockItem['buy'] ?? $stockItem['unit_cost'] ?? 0);
                    $price = isset($stockItem['price']) && (float) $stockItem['price'] > 0
                        ? (float) $stockItem['price']
                        : round($buyCost * 1.25, 2);

                    // Determine Batch (Existing Batch vs New Stock / New Batch)
                    $requestedBatchId = ! empty($stockItem['batch_id']) ? (int) $stockItem['batch_id'] : null;
                    $batchMode = strtoupper(trim((string) ($stockItem['batch_mode'] ?? '')));
                    $createNewBatch = array_key_exists('create_new_batch', $stockItem)
                        ? (bool) $stockItem['create_new_batch']
                        : ($batchMode !== 'EXISTING' && $requestedBatchId === null);

                    $batchId = null;
                    if (! $createNewBatch && $requestedBatchId !== null) {
                        $existingBatch = ItemBatch::query()
                            ->where('id', $requestedBatchId)
                            ->where('stock_items_id', $stockItemId)
                            ->first() ?? ItemBatch::query()->find($requestedBatchId);

                        if ($existingBatch) {
                            $batchId = $existingBatch->id;
                        }
                    }

                    if ($batchId === null) {
                        $newBatch = ItemBatch::create([
                            'stock_items_id' => $stockItemId,
                        ]);
                        $batchId = $newBatch->id;
                    }

                    // Create Stock record
                    $stock = Stock::create([
                        'stock_items_id' => $stockItemId,
                        'brands_id' => $brandId,
                        'qty' => $qty,
                        'price' => $price,
                        'buy' => $buyCost,
                        'add_date' => $grn->at_time ?? now(),
                        'grn_id' => $grn->id,
                    ]);

                    // Link GRN, ItemBatch, and Stock in grm_items
                    GrmItem::updateOrCreate(
                        [
                            'grn_id' => $grn->id,
                            'item_batches_id' => $batchId,
                            'stock_id' => $stock->id,
                        ],
                        [
                            'qty' => $qty,
                        ]
                    );

                    // Record Stock Movement (GRN / Purchase Receipt)
                    StockMovement::create([
                        'stock_id' => $stock->id,
                        'stock_movements_types_id' => $movementType->id,
                        'qty' => $qty,
                        'date' => $grn->at_time ?? now(),
                        'source_id' => $grn->id,
                    ]);

                    // Update Linked Purchase Order Item (qty_received & unit_cost)
                    $poTargetId = ! empty($stockItem['purchase_orders_id'])
                        ? (int) $stockItem['purchase_orders_id']
                        : (! empty($data['purchase_orders_id']) ? (int) $data['purchase_orders_id'] : null);

                    if (! $poTargetId && ! empty($attachedPos)) {
                        $poTargetId = DB::table('purchase_order_items')
                            ->whereIn('purchase_orders_id', array_keys($attachedPos))
                            ->where('stock_items_id', $stockItemId)
                            ->whereColumn('qty_received', '<', 'qty_ordered')
                            ->value('purchase_orders_id')
                            ?? DB::table('purchase_order_items')
                                ->whereIn('purchase_orders_id', array_keys($attachedPos))
                                ->where('stock_items_id', $stockItemId)
                                ->value('purchase_orders_id')
                            ?? array_key_first($attachedPos);
                    }

                    if ($poTargetId) {
                        $poItemQuery = DB::table('purchase_order_items')
                            ->where('purchase_orders_id', $poTargetId)
                            ->where('stock_items_id', $stockItemId);

                        if ($poItemQuery->exists()) {
                            $updateData = [
                                'qty_received' => DB::raw('qty_received + '.$qty),
                            ];
                            if ($buyCost > 0) {
                                $updateData['unit_cost'] = $buyCost;
                            }
                            $poItemQuery->update($updateData);
                        }

                        $touchedPoIds[$poTargetId] = (int) $poTargetId;
                    }
                }

                if (! empty($touchedPoIds)) {
                    $poService = app(PurchaseOrderService::class);
                    foreach ($touchedPoIds as $poId) {
                        $poService->syncPurchaseOrderStatus($poId);
                    }
                }
            }

            return $this->getGrnById($grn->id) ?? $grn;
        });
    }

    /**
     * Update GRN status (Approved, Cancelled, Completed, Draft, Pending, Pending Stock).
     */
    public function updateGrnStatus(Grn $grn, string|int $status): Grn
    {
        $statusId = GrnStatus::resolveIdByName($status);
        $previousStatusId = (int) $grn->grn_statuses_id;

        if (in_array($statusId, [GrnStatus::STATUS_COMPLETED, GrnStatus::STATUS_PENDING_STOCK], true)
            && $previousStatusId !== GrnStatus::STATUS_APPROVED
        ) {
            throw ValidationException::withMessages([
                'status' => ['Please approve this GRN before completing it.'],
            ]);
        }

        $grn->update(['grn_statuses_id' => $statusId]);

        if ($statusId === GrnStatus::STATUS_PENDING_STOCK && $previousStatusId !== GrnStatus::STATUS_PENDING_STOCK) {
            $this->notifyStockManagers($grn);
        }

        return $this->getGrnById($grn->id) ?? $grn->fresh(['grnStatus']);
    }

    /**
     * Notify all active users with Inventory (Stock Management) permission when a GRN is ready for stock entry.
     */
    protected function notifyStockManagers(Grn $grn): void
    {
        $users = User::query()
            ->where('user_statuses_id', 1)
            ->where(function ($query) {
                $query->where('username', 'admin')
                    ->orWhereHas('userPermissions', function ($permQuery) {
                        $permQuery->whereHas('systemModule', function ($moduleQuery) {
                            $moduleQuery->where('system_module', 'Inventory');
                        })->where(function ($actionQuery) {
                            $actionQuery->where('view', 1)
                                ->orWhere('create', 1)
                                ->orWhere('edit', 1)
                                ->orWhere('delete', 1)
                                ->orWhere('export', 1);
                        });
                    });
            })
            ->get();

        if ($users->isEmpty()) {
            return;
        }

        $grnNumber = sprintf('GRN-%04d', $grn->id);
        $notificationService = app(NotificationService::class);
        $actionUrl = route('ui.inventory');

        foreach ($users as $user) {
            $notificationService->notifyUser(
                user: $user,
                title: 'GRN Ready for Stock Entry',
                message: "{$grnNumber} has been completed and its Purchase Order items are pending addition to stock.",
                actionUrl: $actionUrl,
                type: 'info',
                icon: 'fa-solid fa-boxes-stacked',
                metadata: [
                    'grn_id' => $grn->id,
                    'grn_number' => $grnNumber,
                    'status' => 'Pending Stock',
                ]
            );
        }
    }

    /**
     * Delete a GRN.
     */
    public function deleteGrn(Grn $grn): bool
    {
        return DB::transaction(function () use ($grn) {
            $stockIds = $grn->stocks()->pluck('id')->all();
            DB::table('grm_items')->where('grn_id', $grn->id)->delete();
            if (! empty($stockIds)) {
                DB::table('grm_items')->whereIn('stock_id', $stockIds)->delete();
                DB::table('stock_movements')->whereIn('stock_id', $stockIds)->delete();
                DB::table('stock')->whereIn('id', $stockIds)->delete();
            }
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

        $suppliers = Supplier::query()
            ->orderBy('name')
            ->get(['id', 'name', 'mobile', 'status'])
            ->map(fn (Supplier $s) => [
                'id' => $s->id,
                'name' => $s->name,
                'mobile' => $s->mobile,
                'status' => $s->status ?? 'Active',
            ])
            ->values()
            ->all();

        $dbStatuses = GrnStatus::query()
            ->orderBy('id')
            ->pluck('grn_status')
            ->filter()
            ->values()
            ->all();

        $statuses = ! empty($dbStatuses)
            ? $dbStatuses
            : ['Draft', 'Approved', 'Completed', 'Cancelled', 'Pending'];

        return [
            'grns' => $grns,
            'records' => $grns,
            'suppliers' => $suppliers,
            'statuses' => $statuses,
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
            $qty = round((float) $stock->qty, 3);
            $unitCost = (float) $stock->buy;
            $itemTotal = $qty * $unitCost;
            $subTotal += $itemTotal;

            $grmItem = $stock->relationLoaded('grmItems')
                ? ($stock->grmItems->firstWhere('grn_id', $grn->id) ?? $stock->grmItems->first())
                : null;
            $batchNum = $grmItem?->item_batches_id ?? $stock->id;

            $items[] = [
                'item_id' => $stock->stockItem?->code ?? ('ITM-'.$stock->stock_items_id),
                'stock_items_id' => $stock->stock_items_id,
                'item_name' => $stock->stockItem?->name ?? ('Item #'.$stock->stock_items_id),
                'brands_id' => $stock->brands_id,
                'brand_name' => $stock->brand?->brand ?? 'Generic',
                'unit' => $stock->stockItem?->stockUnit?->unit ?? $stock->stockItem?->stockUnit?->symble ?? 'Units',
                'qty_received' => $qty,
                'unit_cost' => $unitCost,
                'item_total' => $itemTotal,
                'batch_id' => 'BAT-'.str_pad((string) $batchNum, 3, '0', STR_PAD_LEFT),
                'item_batches_id' => $grmItem?->item_batches_id,
            ];
        }

        if (empty($items) && $grn->relationLoaded('purchaseOrders')) {
            foreach ($grn->purchaseOrders as $order) {
                if ($order->relationLoaded('items')) {
                    foreach ($order->items as $poi) {
                        $qty = round((float) ($poi->qty_received > 0 ? $poi->qty_received : $poi->qty_ordered), 3);
                        $unitCost = (float) $poi->unit_cost;
                        $itemTotal = $qty * $unitCost;
                        $subTotal += $itemTotal;

                        $items[] = [
                            'item_id' => $poi->stockItem?->code ?? ('ITM-'.$poi->stock_items_id),
                            'stock_items_id' => $poi->stock_items_id,
                            'item_name' => $poi->stockItem?->name ?? ('Item #'.$poi->stock_items_id),
                            'brands_id' => null,
                            'brand_name' => 'Pending Allocation',
                            'unit' => $poi->stockItem?->stockUnit?->unit ?? $poi->stockItem?->stockUnit?->symble ?? 'Units',
                            'qty_received' => $qty,
                            'unit_cost' => $unitCost,
                            'item_total' => $itemTotal,
                            'batch_id' => 'PENDING',
                            'item_batches_id' => null,
                        ];
                    }
                }
            }
        }

        $grnCode = 'GRN-'.str_pad((string) $grn->id, 4, '0', STR_PAD_LEFT);
        $poCode = count($poCodes) > 0 ? implode(', ', $poCodes) : 'N/A';
        $statusName = $grn->grnStatus?->grn_status;
        $status = ! empty($statusName) ? $statusName : 'Pending';
        $statusId = $grn->grn_statuses_id ?? GrnStatus::resolveIdByName($status, GrnStatus::STATUS_PENDING);

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
            'grn_statuses_id' => $statusId,
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
        $completedCount = Grn::query()->whereIn('grn_statuses_id', [
            GrnStatus::STATUS_COMPLETED,
            GrnStatus::STATUS_APPROVED,
        ])->count();
        $draftCount = Grn::query()->whereIn('grn_statuses_id', [
            GrnStatus::STATUS_DRAFT,
            GrnStatus::STATUS_PENDING,
        ])->count();
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
