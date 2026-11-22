<?php

namespace Modules\Inventory\Services;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Modules\Inventory\Models\Brand;
use Modules\Inventory\Models\Category;
use Modules\Inventory\Models\GrmItem;
use Modules\Inventory\Models\ItemBatch;
use Modules\Inventory\Models\Stock;
use Modules\Inventory\Models\StockItem;
use Modules\Inventory\Models\StockMovement;
use Modules\Supplier\Models\Grn;
use Modules\Supplier\Models\GrnStatus;
use Modules\Supplier\Services\PurchaseOrderService;

class StockService
{
    /**
     * Get paginated or all Material Stock Inventory records with KPI metrics.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getStockInventoryData(array $filters = []): array
    {
        $perPage = max(1, (int) ($filters['per_page'] ?? 20));
        $page = max(1, (int) ($filters['page'] ?? 1));
        $search = trim((string) ($filters['search'] ?? ''));
        $categoryId = $filters['category_id'] ?? 'ALL';
        $brandId = $filters['brand_id'] ?? 'ALL';

        $query = Stock::with([
            'stockItem.subcategory.category',
            'stockItem.stockUnit',
            'brand',
            'grn.purchaseOrders.supplier',
            'grmItems.itemBatch',
            'movements.movementType',
        ]);

        if ($search !== '') {
            $query->where(function (Builder $q) use ($search) {
                $q->whereHas('stockItem', function (Builder $sq) use ($search) {
                    $sq->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                })->orWhereHas('brand', function (Builder $bq) use ($search) {
                    $bq->where('brand', 'like', "%{$search}%");
                })->orWhereHas('stockItem.subcategory', function (Builder $subq) use ($search) {
                    $subq->where('subcategory', 'like', "%{$search}%");
                })->orWhere('id', 'like', "%{$search}%")
                    ->orWhere('grn_id', 'like', "%{$search}%");
            });
        }

        if ($categoryId !== 'ALL' && ! empty($categoryId)) {
            $query->whereHas('stockItem.subcategory', function (Builder $q) use ($categoryId) {
                if (is_numeric($categoryId)) {
                    $q->where('categories_id', (int) $categoryId);
                } else {
                    $q->whereHas('category', function (Builder $cq) use ($categoryId) {
                        $cq->where('category', $categoryId);
                    });
                }
            });
        }

        if ($brandId !== 'ALL' && ! empty($brandId)) {
            if (is_numeric($brandId)) {
                $query->where('brands_id', (int) $brandId);
            } else {
                $query->whereHas('brand', function (Builder $bq) use ($brandId) {
                    $bq->where('brand', $brandId);
                });
            }
        }

        $query->orderByDesc('id');

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        $transformedItems = collect($paginator->items())->map(function (Stock $stock) {
            return $this->transformStockRecord($stock);
        })->all();

        // Calculate KPIs across all stocks
        $allStocks = Stock::all(['id', 'qty', 'price']);
        $totalItems = $allStocks->count();
        $totalValue = $allStocks->sum(fn ($st) => (float) $st->qty * (float) $st->price);
        $lowStockCount = $allStocks->filter(fn ($st) => (int) $st->qty > 0 && (int) $st->qty <= 10)->count();
        $outOfStockCount = $allStocks->filter(fn ($st) => (int) $st->qty <= 0)->count();

        return [
            'items' => $transformedItems,
            'aggregated_items' => $this->getAggregatedStockItems($filters),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
            'stats' => [
                'total_items' => $totalItems,
                'total_value' => round($totalValue, 2),
                'low_stock_count' => $lowStockCount,
                'out_of_stock_count' => $outOfStockCount,
            ],
        ];
    }

    /**
     * Retrieve aggregated catalog stock items with summed inventory metrics across batches.
     *
     * @param  array<string, mixed>  $filters
     * @return array<int, array<string, mixed>>
     */
    public function getAggregatedStockItems(array $filters = []): array
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $categoryId = $filters['category_id'] ?? 'ALL';

        $query = StockItem::with([
            'subcategory.category',
            'brands',
            'stocks.grn.purchaseOrders.supplier',
            'stocks.brand',
            'batches',
            'stockUnit',
        ]);

        if ($search !== '') {
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhereHas('subcategory', function (Builder $sq) use ($search) {
                        $sq->where('subcategory', 'like', "%{$search}%")
                            ->orWhereHas('category', function (Builder $cq) use ($search) {
                                $cq->where('category', 'like', "%{$search}%");
                            });
                    })
                    ->orWhereHas('brands', function (Builder $bq) use ($search) {
                        $bq->where('brand', 'like', "%{$search}%");
                    });
            });
        }

        if ($categoryId !== 'ALL' && ! empty($categoryId)) {
            $query->whereHas('subcategory', function (Builder $q) use ($categoryId) {
                if (is_numeric($categoryId)) {
                    $q->where('categories_id', (int) $categoryId);
                } else {
                    $q->whereHas('category', function (Builder $cq) use ($categoryId) {
                        $cq->where('category', $categoryId);
                    });
                }
            });
        }

        $items = $query->orderBy('name')->get();

        return $items->map(function (StockItem $item) {
            $subcat = $item->subcategory;
            $cat = $subcat?->category;

            $totalQty = (int) $item->stocks->sum('qty');
            $totalVal = round($item->stocks->sum(function (Stock $st) {
                return (int) $st->qty * (float) $st->price;
            }), 2);

            $lowThreshold = (int) ($item->low_stock_qty ?? 10);
            $reorderQty = (int) ($item->reorder_qty ?? 20);

            $status = match (true) {
                $totalQty <= 0 => ['label' => 'Out of Stock', 'class' => 'ant-tag-red'],
                $totalQty <= $lowThreshold => ['label' => 'Low Stock', 'class' => 'ant-tag-orange'],
                default => ['label' => 'In Stock', 'class' => 'ant-tag-green'],
            };

            $brandsList = $item->brands->map(fn (Brand $b) => [
                'id' => $b->id,
                'brand' => $b->brand,
            ])->values()->all();

            $batchesCount = $item->stocks->count();
            if ($batchesCount === 0 && $item->batches->isNotEmpty()) {
                $batchesCount = $item->batches->count();
            }

            $suppliers = $item->stocks->map(function (Stock $st) {
                if ($st->grn && $st->grn->purchaseOrders->isNotEmpty()) {
                    return $st->grn->purchaseOrders->first()->supplier?->name;
                }

                return null;
            })->filter()->unique()->values()->all();

            $avgPrice = $item->stocks->isNotEmpty()
                ? round((float) $item->stocks->avg('price'), 2)
                : 0.0;

            return [
                'id' => $item->id,
                'stock_items_id' => $item->id,
                'code' => $item->code,
                'name' => $item->name,
                'category' => $cat?->category ?? ($subcat?->subcategory ?? 'General'),
                'category_id' => $cat?->id,
                'subcategory' => $subcat?->subcategory ?? 'General',
                'subcategory_id' => $subcat?->id,
                'brands' => $brandsList,
                'batches_count' => $batchesCount,
                'total_qty' => $totalQty,
                'currentStock' => $totalQty,
                'qty' => $totalQty,
                'unit' => $item->stockUnit?->unit ?? $item->stockUnit?->symble ?? 'Units',
                'unitPrice' => $avgPrice,
                'total_val' => $totalVal,
                'totalValue' => $totalVal,
                'minThreshold' => $lowThreshold,
                'low_stock_qty' => $lowThreshold,
                'reorder_qty' => $reorderQty,
                'status' => $status,
                'suppliers' => $suppliers,
                'supplier' => ! empty($suppliers) ? implode(', ', $suppliers) : 'General Supplier',
            ];
        })->values()->all();
    }

    /**
     * Transform a single Stock Eloquent model into a rich representation for the frontend.
     *
     * @return array<string, mixed>
     */
    public function transformStockRecord(Stock $stock): array
    {
        $item = $stock->stockItem;
        $subcat = $item?->subcategory;
        $cat = $subcat?->category;
        $brand = $stock->brand;

        $qty = (int) $stock->qty;
        $unitPrice = (float) $stock->price;
        $buyPrice = (float) $stock->buy;
        $totalVal = round($qty * $unitPrice, 2);

        $lowThreshold = (int) ($item?->low_stock_qty ?? 10);
        $status = match (true) {
            $qty <= 0 => ['label' => 'Out of Stock', 'class' => 'ant-tag-red'],
            $qty <= $lowThreshold => ['label' => 'Low Stock', 'class' => 'ant-tag-orange'],
            default => ['label' => 'In Stock', 'class' => 'ant-tag-green'],
        };

        // Supplier resolution
        $supplierName = 'General Supplier';
        if ($stock->grn && $stock->grn->purchaseOrders->isNotEmpty()) {
            $supplierName = $stock->grn->purchaseOrders->first()->supplier?->name ?? 'PaperPro Lanka';
        }

        $batches = $stock->grmItems->map(function ($grm) use ($stock, $supplierName, $buyPrice, $qty) {
            $batchNo = $grm->itemBatch?->batch_no ?? ($grm->item_batches_id ? 'BAT-'.str_pad((string) $grm->item_batches_id, 4, '0', STR_PAD_LEFT) : 'BAT-'.$stock->id);
            $batchQty = (int) $grm->qty;

            return [
                'id' => $batchNo,
                'batch_id' => $grm->item_batches_id,
                'batch_no' => $batchNo,
                'receivedDate' => $stock->add_date ? $stock->add_date->format('Y-m-d') : null,
                'unitCost' => $buyPrice,
                'initialQty' => $batchQty > 0 ? $batchQty : $qty,
                'availableQty' => $batchQty > 0 ? $batchQty : $qty,
                'qty' => $batchQty > 0 ? $batchQty : $qty,
                'supplier' => $supplierName,
            ];
        })->values()->all();

        if (empty($batches)) {
            $batchNo = 'BAT-'.str_pad((string) $stock->id, 4, '0', STR_PAD_LEFT);
            $batches = [
                [
                    'id' => $batchNo,
                    'batch_id' => $stock->id,
                    'batch_no' => $batchNo,
                    'receivedDate' => $stock->add_date ? $stock->add_date->format('Y-m-d') : null,
                    'unitCost' => $buyPrice,
                    'initialQty' => $qty,
                    'availableQty' => $qty,
                    'qty' => $qty,
                    'supplier' => $supplierName,
                ],
            ];
        }

        $transactions = $stock->movements->take(8)->map(function ($mov) {
            $type = in_array((int) $mov->stock_movements_types_id, [1, 5], true) ? 'ADD' : 'DEDUCT';

            return [
                'id' => 'TXN-'.$mov->id,
                'date' => $mov->date ? $mov->date->format('Y-m-d H:i') : null,
                'type' => $type,
                'qty' => (int) $mov->qty,
                'reason' => $mov->movementType?->stock_movements_type ?? 'Stock Movement',
                'batchId' => 'BAT-'.$mov->stock_id,
                'user' => 'Admin',
            ];
        })->values()->all();

        return [
            'id' => $stock->id,
            'stock_id' => $stock->id,
            'stock_items_id' => $stock->stock_items_id,
            'code' => $item?->code ?? ('SKU-'.$stock->id),
            'name' => $item?->name ?? ('Material Item #'.$stock->stock_items_id),
            'category' => $cat?->category ?? ($subcat?->subcategory ?? 'General'),
            'category_id' => $cat?->id,
            'subcategory' => $subcat?->subcategory ?? 'General',
            'subcategory_id' => $subcat?->id,
            'brand' => $brand?->brand ?? 'Generic',
            'brands_id' => $stock->brands_id,
            'supplier' => $supplierName,
            'unitPrice' => $unitPrice,
            'buyPrice' => $buyPrice,
            'currentStock' => $qty,
            'qty' => $qty,
            'unit' => $item?->stockUnit?->unit ?? $item?->stockUnit?->symble ?? 'Units',
            'totalValue' => $totalVal,
            'status' => $status,
            'minThreshold' => $lowThreshold,
            'low_stock_qty' => $lowThreshold,
            'reorder_qty' => (int) ($item?->reorder_qty ?? 20),
            'grn_id' => $stock->grn_id,
            'add_date' => $stock->add_date ? $stock->add_date->format('Y-m-d') : null,
            'batches' => $batches,
            'transactions' => $transactions,
        ];
    }

    /**
     * Retrieve form data for Add/Update Stock Modal:
     * Categories, Subcategories, Brands, Stock Items with existing batches and existing stocks, and GRNs.
     *
     * @return array<string, mixed>
     */
    public function getFormData(): array
    {
        $categories = Category::with('subcategories')->orderBy('category')->get();
        $brands = Brand::orderBy('brand')->get();

        $stockItems = StockItem::with([
            'subcategory.category',
            'brands',
            'batches',
            'stocks.brand',
            'stockUnit',
        ])->orderBy('name')->get()->map(function (StockItem $item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'code' => $item->code,
                'unit' => $item->stockUnit?->unit ?? $item->stockUnit?->symble ?? 'Units',
                'subcategories_id' => $item->subcategories_id,
                'category_id' => $item->subcategory?->categories_id,
                'category_name' => $item->subcategory?->category?->category ?? 'General',
                'subcategory_name' => $item->subcategory?->subcategory ?? 'General',
                'low_stock_qty' => (int) ($item->low_stock_qty ?? 10),
                'reorder_qty' => (int) ($item->reorder_qty ?? 20),
                'compatible_brands' => $item->brands->map(fn ($b) => [
                    'id' => $b->id,
                    'brand' => $b->brand,
                ])->values()->all(),
                'existing_batches' => $item->batches->map(fn ($b) => [
                    'id' => $b->id,
                    'batch_no' => 'BAT-'.$b->id,
                ])->values()->all(),
                'existing_stocks' => $item->stocks->map(fn (Stock $st) => [
                    'id' => $st->id,
                    'brands_id' => $st->brands_id,
                    'brand_name' => $st->brand?->brand ?? 'Generic',
                    'qty' => (int) $st->qty,
                    'buy' => (float) $st->buy,
                    'price' => (float) $st->price,
                    'grn_id' => $st->grn_id,
                    'add_date' => $st->add_date ? $st->add_date->format('Y-m-d') : null,
                ])->values()->all(),
            ];
        });

        $grns = Grn::with([
            'grnStatus',
            'purchaseOrders.supplier',
            'purchaseOrders.items.stockItem.subcategory.category',
            'purchaseOrders.items.stockItem.stockUnit',
            'purchaseOrders.items.stockItem.brands',
            'purchaseOrders.items.stockItem.batches',
            'purchaseOrders.items.stockItem.stocks.brand',
            'stocks.stockItem.subcategory.category',
            'stocks.stockItem.stockUnit',
            'stocks.stockItem.brands',
            'stocks.stockItem.batches',
            'stocks.stockItem.stocks.brand',
            'stocks.brand',
            'stocks.grmItems.itemBatch',
            'grmItems.itemBatch',
        ])->where('grn_statuses_id', GrnStatus::STATUS_PENDING_STOCK)
            ->orderByDesc('id')
            ->limit(50)
            ->get()
            ->map(function (Grn $grn) use ($brands) {
                $itemsMap = collect();
                $grnAtTimeStr = $grn->at_time ? $grn->at_time->format('Y-m-d H:i:s') : null;

                // Item IDs that have already been added to stock via Stock Management (after GRN creation)
                $stockedItemIds = DB::table('grm_items')
                    ->join('stock', 'grm_items.stock_id', '=', 'stock.id')
                    ->where('grm_items.grn_id', $grn->id)
                    ->when($grnAtTimeStr !== null, function ($query) use ($grnAtTimeStr) {
                        $query->where('stock.add_date', '!=', $grnAtTimeStr);
                    })
                    ->pluck('stock.stock_items_id')
                    ->unique()
                    ->all();

                $resolveGrnItemMeta = function (StockItem $item) use ($grn, $brands): array {
                    $grnStock = $grn->stocks->firstWhere('stock_items_id', $item->id);
                    $grmItem = null;

                    if ($grnStock && $grnStock->relationLoaded('grmItems')) {
                        $grmItem = $grnStock->grmItems->firstWhere('grn_id', $grn->id)
                            ?? $grnStock->grmItems->first();
                    }

                    if (! $grmItem && $grn->relationLoaded('grmItems')) {
                        $grmItem = $grn->grmItems->first(function ($gi) use ($item, $grnStock) {
                            if ($grnStock && (int) $gi->stock_id === (int) $grnStock->id) {
                                return true;
                            }

                            return (int) ($gi->itemBatch?->stock_items_id ?? 0) === (int) $item->id;
                        });
                    }

                    $batchId = $grmItem?->item_batches_id ? (int) $grmItem->item_batches_id : null;
                    $batchNo = $batchId ? ('BAT-'.str_pad((string) $batchId, 3, '0', STR_PAD_LEFT)) : null;

                    $brandId = $grnStock?->brands_id
                        ?? $item->brands->first()?->id
                        ?? $brands->first()?->id
                        ?? 1;

                    $brandName = $grnStock?->brand?->brand
                        ?? $item->brands->first()?->brand
                        ?? $brands->first()?->brand
                        ?? 'Generic';

                    return [
                        'grn_stock' => $grnStock,
                        'batch_id' => $batchId,
                        'batch_no' => $batchNo,
                        'brand_id' => (int) $brandId,
                        'brand_name' => $brandName,
                    ];
                };

                foreach ($grn->purchaseOrders as $po) {
                    foreach ($po->items as $poi) {
                        $item = $poi->stockItem;
                        // Exclude items that are already added to stock for this GRN
                        if ($item && ! in_array($item->id, $stockedItemIds)) {
                            $meta = $resolveGrnItemMeta($item);
                            $grnStock = $meta['grn_stock'];

                            $qty = (int) ($grnStock && $grnStock->qty > 0
                                ? $grnStock->qty
                                : ($poi->qty_received > 0 ? $poi->qty_received : $poi->qty_ordered));
                            if ($qty <= 0) {
                                $qty = 1;
                            }

                            $unitCost = (float) ($grnStock && $grnStock->buy > 0 ? $grnStock->buy : $poi->unit_cost);
                            $existingAvgPrice = (float) ($item->stocks->where('price', '>', 0)->avg('price') ?? 0);
                            $sellingPrice = $grnStock && (float) $grnStock->price > 0
                                ? (float) $grnStock->price
                                : ($existingAvgPrice > 0 ? round($existingAvgPrice, 2) : round($unitCost * 1.25, 2));

                            if ($itemsMap->has($item->id)) {
                                $existing = $itemsMap->get($item->id);
                                if (! $grnStock) {
                                    $existing['qty'] += $qty;
                                }
                                $existing['qty_ordered'] += (int) $poi->qty_ordered;
                                $existing['qty_received'] += (int) $poi->qty_received;
                                $existing['total_cost'] = round($existing['qty'] * $existing['unit_cost'], 2);
                                $existing['total_value'] = round($existing['qty'] * $existing['selling_price'], 2);
                                $itemsMap->put($item->id, $existing);
                            } else {
                                $itemsMap->put($item->id, [
                                    'id' => $item->id,
                                    'name' => $item->name,
                                    'code' => $item->code,
                                    'unit' => $item->stockUnit?->unit ?? $item->stockUnit?->symble ?? 'Units',
                                    'subcategories_id' => $item->subcategories_id,
                                    'category_id' => $item->subcategory?->categories_id,
                                    'category_name' => $item->subcategory?->category?->category ?? 'General',
                                    'subcategory_name' => $item->subcategory?->subcategory ?? 'General',
                                    'brand_id' => $meta['brand_id'],
                                    'brand_name' => $meta['brand_name'],
                                    'batch_id' => $meta['batch_id'],
                                    'batch_no' => $meta['batch_no'],
                                    'unit_cost' => $unitCost,
                                    'selling_price' => $sellingPrice,
                                    'qty' => $qty,
                                    'qty_ordered' => (int) $poi->qty_ordered,
                                    'qty_received' => (int) $poi->qty_received,
                                    'total_cost' => round($qty * $unitCost, 2),
                                    'total_value' => round($qty * $sellingPrice, 2),
                                    'po_id' => $po->id,
                                    'compatible_brands' => $item->brands->map(fn ($b) => [
                                        'id' => $b->id,
                                        'brand' => $b->brand,
                                    ])->values()->all(),
                                    'existing_batches' => $item->batches->map(fn ($b) => [
                                        'id' => $b->id,
                                        'batch_no' => 'BAT-'.$b->id,
                                    ])->values()->all(),
                                    'existing_stocks' => $item->stocks->map(fn (Stock $st) => [
                                        'id' => $st->id,
                                        'brands_id' => $st->brands_id,
                                        'brand_name' => $st->brand?->brand ?? 'Generic',
                                        'qty' => (int) $st->qty,
                                        'buy' => (float) $st->buy,
                                        'price' => (float) $st->price,
                                        'grn_id' => $st->grn_id,
                                    ])->values()->all(),
                                ]);
                            }
                        }
                    }
                }

                // Fallback: If GRN has no PO items, check $grn->stocks
                if ($itemsMap->isEmpty() && $grn->stocks->isNotEmpty()) {
                    foreach ($grn->stocks as $stock) {
                        $item = $stock->stockItem;
                        if ($item && ! in_array($item->id, $stockedItemIds) && ! $itemsMap->has($item->id)) {
                            $meta = $resolveGrnItemMeta($item);
                            $qty = (int) $stock->qty > 0 ? (int) $stock->qty : 1;
                            $unitCost = (float) $stock->buy;
                            $sellingPrice = (float) $stock->price > 0 ? (float) $stock->price : round($unitCost * 1.25, 2);

                            $itemsMap->put($item->id, [
                                'id' => $item->id,
                                'name' => $item->name,
                                'code' => $item->code,
                                'unit' => $item->stockUnit?->unit ?? $item->stockUnit?->symble ?? 'Units',
                                'subcategories_id' => $item->subcategories_id,
                                'category_id' => $item->subcategory?->categories_id,
                                'category_name' => $item->subcategory?->category?->category ?? 'General',
                                'subcategory_name' => $item->subcategory?->subcategory ?? 'General',
                                'brand_id' => $meta['brand_id'],
                                'brand_name' => $meta['brand_name'],
                                'batch_id' => $meta['batch_id'],
                                'batch_no' => $meta['batch_no'],
                                'unit_cost' => $unitCost,
                                'selling_price' => $sellingPrice,
                                'qty' => $qty,
                                'qty_ordered' => $qty,
                                'qty_received' => $qty,
                                'total_cost' => round($qty * $unitCost, 2),
                                'total_value' => round($qty * $sellingPrice, 2),
                                'po_id' => null,
                                'compatible_brands' => $item->brands->map(fn ($b) => [
                                    'id' => $b->id,
                                    'brand' => $b->brand,
                                ])->values()->all(),
                                'existing_batches' => $item->batches->map(fn ($b) => [
                                    'id' => $b->id,
                                    'batch_no' => 'BAT-'.$b->id,
                                ])->values()->all(),
                                'existing_stocks' => $item->stocks->map(fn (Stock $st) => [
                                    'id' => $st->id,
                                    'brands_id' => $st->brands_id,
                                    'brand_name' => $st->brand?->brand ?? 'Generic',
                                    'qty' => (int) $st->qty,
                                    'buy' => (float) $st->buy,
                                    'price' => (float) $st->price,
                                    'grn_id' => $st->grn_id,
                                ])->values()->all(),
                            ]);
                        }
                    }
                }

                $supplierNames = $grn->purchaseOrders->pluck('supplier.name')->filter()->unique()->values()->join(', ');
                $poNumbers = $grn->purchaseOrders->pluck('id')->map(fn ($id) => 'PO #'.$id)->join(', ');
                $pendingCount = $itemsMap->count();
                // If all items under this GRN have already been added to stock, exclude it from Select GRN Reference
                if ($pendingCount === 0) {
                    return null;
                }

                $supplierNames = $grn->purchaseOrders->pluck('supplier.name')->filter()->unique()->values()->join(', ');
                $poNumbers = $grn->purchaseOrders->pluck('id')->map(fn ($id) => 'PO #'.$id)->join(', ');
                $statusText = " ({$pendingCount} items pending)";

                $labelParts = ['GRN #'.$grn->id];
                if ($supplierNames) {
                    $labelParts[] = $supplierNames;
                }
                if ($poNumbers) {
                    $labelParts[] = '('.$poNumbers.')';
                }
                if ($grn->at_time) {
                    $labelParts[] = '['.$grn->at_time->format('Y-m-d').']';
                }
                $labelParts[] = $statusText;

                return [
                    'id' => $grn->id,
                    'label' => implode(' - ', array_filter($labelParts)),
                    'at_time' => $grn->at_time ? $grn->at_time->format('Y-m-d H:i') : null,
                    'grn_statuses_id' => (int) $grn->grn_statuses_id,
                    'status' => $grn->grnStatus?->grn_status ?? 'Pending Stock',
                    'supplier_name' => $supplierNames,
                    'po_numbers' => $poNumbers,
                    'items' => $itemsMap->values()->all(),
                    'pending_count' => $pendingCount,
                ];
            })->filter()->values();

        return [
            'categories' => $categories,
            'brands' => $brands,
            'stock_items' => $stockItems,
            'grns' => $grns,
        ];
    }

    /**
     * Receive and add stock for a Pending Stock GRN item.
     * - Verifies GRN is in Pending Stock status.
     * - If a batch is allocated for the item, adds received qty to the batch's stock.
     * - If no batch is allocated, creates a new ItemBatch and new Stock record.
     * - Logs movement in stock_movements and syncs PO & GRN completion status.
     *
     * @param  array<string, mixed>  $data
     */
    public function createStock(array $data): Stock
    {
        return DB::transaction(function () use ($data) {
            $grnId = (int) ($data['grn_id'] ?? 0);
            $grn = Grn::with('grnStatus')->find($grnId);

            if (! $grn || (int) $grn->grn_statuses_id !== GrnStatus::STATUS_PENDING_STOCK) {
                $statusLabel = $grn?->grnStatus?->grn_status ?? 'Unknown';
                $grnCode = $grn ? ('GRN-'.str_pad((string) $grn->id, 4, '0', STR_PAD_LEFT)) : "GRN #{$grnId}";
                throw ValidationException::withMessages([
                    'grn_id' => ["Selected GRN ({$grnCode}) is in '{$statusLabel}' status. Only GRNs in 'Pending Stock' status can be added to stock."],
                ]);
            }

            $stockItemId = (int) $data['stock_items_id'];
            $receivedQty = (int) $data['qty'];
            $addDate = ! empty($data['add_date'])
                ? Carbon::parse($data['add_date'])
                : now();

            // Ensure add_date differs from initial GRN creation timestamp so it is recognized as received in Stock Management
            if ($grn->at_time && $addDate->format('Y-m-d H:i:s') === $grn->at_time->format('Y-m-d H:i:s')) {
                $addDate = $addDate->copy()->addSecond();
            }

            // 1. Check whether a Batch is allocated for this item (either from payload or GRN items)
            $requestedBatchId = ! empty($data['batch_id']) ? (int) $data['batch_id'] : null;

            if ($requestedBatchId === null && empty($data['create_new_batch'])) {
                $grnLinkedBatchId = DB::table('grm_items')
                    ->join('stock', 'grm_items.stock_id', '=', 'stock.id')
                    ->where('grm_items.grn_id', $grn->id)
                    ->where('stock.stock_items_id', $stockItemId)
                    ->value('grm_items.item_batches_id');

                if ($grnLinkedBatchId) {
                    $requestedBatchId = (int) $grnLinkedBatchId;
                }
            }

            $allocatedBatch = null;
            if ($requestedBatchId !== null && empty($data['create_new_batch'])) {
                $allocatedBatch = ItemBatch::query()
                    ->where('id', $requestedBatchId)
                    ->where('stock_items_id', $stockItemId)
                    ->first();
            }

            // 2. Branch A vs Branch B based on Batch Allocation
            if ($allocatedBatch !== null) {
                $batchId = $allocatedBatch->id;

                // Find existing stock record linked to this allocated batch
                $batchStock = Stock::query()
                    ->where('stock_items_id', $stockItemId)
                    ->whereHas('grmItems', function (Builder $q) use ($batchId) {
                        $q->where('item_batches_id', $batchId);
                    })
                    ->orderByDesc('id')
                    ->first();

                if ($batchStock) {
                    // Add received quantity to the existing batch's stock
                    $batchStock->qty = (int) $batchStock->qty + $receivedQty;
                    $batchStock->add_date = $addDate;
                    if (isset($data['buy']) && (float) $data['buy'] > 0) {
                        $batchStock->buy = (float) $data['buy'];
                    }
                    if (isset($data['price']) && (float) $data['price'] > 0) {
                        $batchStock->price = (float) $data['price'];
                    }
                    $batchStock->save();
                    $stock = $batchStock;
                } else {
                    // Batch exists in item_batches without a stock record yet -> create stock for this batch
                    $stock = Stock::create([
                        'stock_items_id' => $stockItemId,
                        'brands_id' => (int) $data['brands_id'],
                        'qty' => $receivedQty,
                        'price' => (float) $data['price'],
                        'buy' => (float) $data['buy'],
                        'grn_id' => $grn->id,
                        'add_date' => $addDate,
                    ]);
                }

                // Record or update grm_items link for this GRN, batch, and stock
                $existingGrmItem = DB::table('grm_items')
                    ->where('grn_id', $grn->id)
                    ->where('item_batches_id', $batchId)
                    ->where('stock_id', $stock->id)
                    ->first();

                if ($existingGrmItem) {
                    DB::table('grm_items')
                        ->where('grn_id', $grn->id)
                        ->where('item_batches_id', $batchId)
                        ->where('stock_id', $stock->id)
                        ->update(['qty' => $receivedQty]);
                } else {
                    GrmItem::create([
                        'grn_id' => $grn->id,
                        'item_batches_id' => $batchId,
                        'stock_id' => $stock->id,
                        'qty' => $receivedQty,
                    ]);
                }
            } else {
                // No batch allocated -> allocate a new ItemBatch and create a new Stock record
                $newBatch = ItemBatch::create([
                    'stock_items_id' => $stockItemId,
                ]);
                $batchId = $newBatch->id;

                $stock = Stock::create([
                    'stock_items_id' => $stockItemId,
                    'brands_id' => (int) $data['brands_id'],
                    'qty' => $receivedQty,
                    'price' => (float) $data['price'],
                    'buy' => (float) $data['buy'],
                    'grn_id' => $grn->id,
                    'add_date' => $addDate,
                ]);

                GrmItem::create([
                    'grn_id' => $grn->id,
                    'item_batches_id' => $batchId,
                    'stock_id' => $stock->id,
                    'qty' => $receivedQty,
                ]);
            }

            // 3. Record Stock Movement in stock_movements table
            StockMovement::create([
                'stock_id' => $stock->id,
                'stock_movements_types_id' => 1, // GRN / Purchase Receipt
                'qty' => $receivedQty,
                'date' => $addDate,
                'source_id' => $grn->id,
            ]);

            // 4. Sync purchase order items if linked to this GRN
            $poIds = DB::table('grn_has_puches_order')
                ->where('grn_id', $grn->id)
                ->pluck('purchase_orders_id')
                ->all();

            if (! empty($poIds)) {
                DB::table('purchase_order_items')
                    ->whereIn('purchase_orders_id', $poIds)
                    ->where('stock_items_id', $stockItemId)
                    ->increment('qty_received', $receivedQty);

                $poService = app(PurchaseOrderService::class);
                foreach ($poIds as $poId) {
                    $poService->syncPurchaseOrderStatus((int) $poId);
                }
            }

            // 5. Sync GRN completion status if all items of this GRN have been received
            if (empty($data['_defer_grn_status_sync'])) {
                $this->syncGrnCompletionStatus($grn);
            }

            return $stock->load(['stockItem.subcategory.category', 'brand', 'grn', 'grmItems.itemBatch']);
        });
    }

    /**
     * Check if all items of a Pending Stock GRN have been received into stock,
     * and if so, mark the GRN status as Completed.
     */
    protected function syncGrnCompletionStatus(Grn $grn): void
    {
        if ((int) $grn->grn_statuses_id !== GrnStatus::STATUS_PENDING_STOCK) {
            return;
        }

        $grn->loadMissing(['purchaseOrders.items', 'stocks']);
        $grnAtTimeStr = $grn->at_time ? $grn->at_time->format('Y-m-d H:i:s') : null;

        $expectedItemIds = collect();
        foreach ($grn->purchaseOrders as $po) {
            foreach ($po->items as $poi) {
                if ($poi->stock_items_id) {
                    $expectedItemIds->push((int) $poi->stock_items_id);
                }
            }
        }
        if ($expectedItemIds->isEmpty()) {
            foreach ($grn->stocks as $st) {
                if ($st->stock_items_id) {
                    $expectedItemIds->push((int) $st->stock_items_id);
                }
            }
        }
        $expectedItemIds = $expectedItemIds->unique()->values();

        if ($expectedItemIds->isEmpty()) {
            return;
        }

        $stockedItemIds = DB::table('grm_items')
            ->join('stock', 'grm_items.stock_id', '=', 'stock.id')
            ->where('grm_items.grn_id', $grn->id)
            ->when($grnAtTimeStr !== null, function ($query) use ($grnAtTimeStr) {
                $query->where('stock.add_date', '!=', $grnAtTimeStr);
            })
            ->pluck('stock.stock_items_id')
            ->map(fn ($id) => (int) $id)
            ->unique();

        $remaining = $expectedItemIds->diff($stockedItemIds);
        if ($remaining->isEmpty()) {
            $grn->update(['grn_statuses_id' => GrnStatus::STATUS_COMPLETED]);
        }
    }

    /**
     * Create multiple new Stock records in a single transaction.
     *
     * @param  array<string, mixed>  $data
     * @return array<int, Stock>
     */
    public function createStocksBulk(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $createdStocks = [];
            $grnId = (int) $data['grn_id'];
            $addDate = ! empty($data['add_date'])
                ? Carbon::parse($data['add_date'])
                : now();

            foreach ($data['items'] as $itemData) {
                $itemData['grn_id'] = $grnId;
                $itemData['_defer_grn_status_sync'] = true;
                if (empty($itemData['add_date'])) {
                    $itemData['add_date'] = $addDate;
                }
                $createdStocks[] = $this->createStock($itemData);
            }

            $grn = Grn::find($grnId);
            if ($grn) {
                $this->syncGrnCompletionStatus($grn);
            }

            return $createdStocks;
        });
    }

    /**
     * Update an existing Stock entry (receive additional quantities or update attributes) and log movement.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateStock(Stock $stock, array $data): Stock
    {
        return DB::transaction(function () use ($stock, $data) {
            $incomingQty = (int) $data['qty'];
            $addDate = ! empty($data['add_date'])
                ? Carbon::parse($data['add_date'])
                : now();

            // Increment existing stock quantity with the received shipment quantity
            $stock->qty = (int) $stock->qty + $incomingQty;

            if (isset($data['price'])) {
                $stock->price = $data['price'];
            }
            if (isset($data['buy'])) {
                $stock->buy = $data['buy'];
            }
            if (isset($data['grn_id'])) {
                $stock->grn_id = $data['grn_id'];
            }
            if (isset($data['brands_id'])) {
                $stock->brands_id = $data['brands_id'];
            }
            $stock->save();

            // Handle Batch
            $batchId = $data['batch_id'] ?? null;
            if (! empty($data['create_new_batch']) || empty($batchId)) {
                $batch = ItemBatch::create([
                    'stock_items_id' => $stock->stock_items_id,
                ]);
                $batchId = $batch->id;
            }

            $grnId = $data['grn_id'] ?? $stock->grn_id;

            // Link in grm_items
            GrmItem::create([
                'grn_id' => $grnId,
                'item_batches_id' => $batchId,
                'stock_id' => $stock->id,
                'qty' => $incomingQty,
            ]);

            // Add Stock Movement record with source_id = GRN ID
            StockMovement::create([
                'stock_id' => $stock->id,
                'stock_movements_types_id' => 1, // GRN / Purchase Receipt
                'qty' => $incomingQty,
                'date' => $addDate,
                'source_id' => $grnId,
            ]);

            // Sync purchase order items if linked to this GRN
            if (! empty($grnId)) {
                $poIds = DB::table('grn_has_puches_order')
                    ->where('grn_id', $grnId)
                    ->pluck('purchase_orders_id')
                    ->all();

                if (! empty($poIds)) {
                    DB::table('purchase_order_items')
                        ->whereIn('purchase_orders_id', $poIds)
                        ->where('stock_items_id', $stock->stock_items_id)
                        ->increment('qty_received', $incomingQty);

                    $poService = app(PurchaseOrderService::class);
                    foreach ($poIds as $poId) {
                        $poService->syncPurchaseOrderStatus((int) $poId);
                    }
                }
            }

            return $stock->load(['stockItem.subcategory.category', 'brand', 'grn', 'grmItems.itemBatch']);
        });
    }

    /**
     * Adjust stock quantity (physical count adjustment, damage, manual stock in/out, etc.) and log stock movement.
     *
     * @param  array<string, mixed>  $data
     */
    public function adjustStock(Stock $stock, array $data): Stock
    {
        return DB::transaction(function () use ($stock, $data) {
            $oldQty = (int) $stock->qty;
            $type = strtoupper((string) ($data['adjustment_type'] ?? 'ADD'));

            // Check if final target quantity is provided or delta qty
            if (isset($data['new_qty']) && is_numeric($data['new_qty'])) {
                $finalQty = max(0, (int) $data['new_qty']);
                $diff = abs($finalQty - $oldQty);
                $isIncrease = $finalQty >= $oldQty;
            } else {
                $deltaQty = (int) ($data['qty'] ?? 0);
                if ($type === 'DEDUCT') {
                    $finalQty = max(0, $oldQty - $deltaQty);
                    $diff = min($oldQty, $deltaQty);
                    $isIncrease = false;
                } else {
                    $finalQty = $oldQty + $deltaQty;
                    $diff = $deltaQty;
                    $isIncrease = true;
                }
            }

            // Determine stock movement type
            $movementTypeId = match ($data['reason'] ?? '') {
                'Damaged / Wasted', 'Production Scrap' => 6, // Damage / Wastage
                'Supplier Return' => 7, // Return to Supplier
                'New Inflow / Restock' => 3, // Manual Stock In
                'Lost' => 4, // Manual Stock Out
                default => ($isIncrease ? 3 : 5), // Manual Stock In or Inventory Adjustment
            };

            // Update Stock record quantity
            $stock->qty = $finalQty;
            $stock->save();

            // Record Movement in stock_movements
            if ($diff > 0) {
                StockMovement::create([
                    'stock_id' => $stock->id,
                    'stock_movements_types_id' => $movementTypeId,
                    'qty' => $diff,
                    'date' => now(),
                    'source_id' => $stock->id,
                ]);
            }

            return $stock->load(['stockItem.subcategory.category', 'brand', 'grn', 'grmItems.itemBatch']);
        });
    }
}
