<?php

namespace Modules\Inventory\Services;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Modules\Inventory\Models\Brand;
use Modules\Inventory\Models\Category;
use Modules\Inventory\Models\GrmItem;
use Modules\Inventory\Models\ItemBatch;
use Modules\Inventory\Models\Stock;
use Modules\Inventory\Models\StockItem;
use Modules\Inventory\Models\StockMovement;
use Modules\Supplier\Models\Grn;

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
            'brand',
            'grn.purchaseOrders.supplier',
            'grmItems.itemBatch',
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
                'unit' => 'Units',
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

        $batches = $stock->grmItems->map(function ($grm) {
            return [
                'batch_id' => $grm->item_batches_id,
                'qty' => (int) $grm->qty,
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
            'unit' => 'Units',
            'totalValue' => $totalVal,
            'status' => $status,
            'minThreshold' => $lowThreshold,
            'low_stock_qty' => $lowThreshold,
            'reorder_qty' => (int) ($item?->reorder_qty ?? 20),
            'grn_id' => $stock->grn_id,
            'add_date' => $stock->add_date ? $stock->add_date->format('Y-m-d') : null,
            'batches' => $batches,
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
        ])->orderBy('name')->get()->map(function (StockItem $item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'code' => $item->code,
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
            'purchaseOrders.supplier',
            'purchaseOrders.items.stockItem.subcategory.category',
            'purchaseOrders.items.stockItem.brands',
            'purchaseOrders.items.stockItem.batches',
            'purchaseOrders.items.stockItem.stocks.brand',
            'stocks.stockItem.subcategory.category',
            'stocks.stockItem.brands',
            'stocks.stockItem.batches',
            'stocks.stockItem.stocks.brand',
        ])->orderByDesc('id')->limit(50)->get()->map(function (Grn $grn) {
            $itemsMap = collect();

            foreach ($grn->purchaseOrders as $po) {
                foreach ($po->items as $poi) {
                    $item = $poi->stockItem;
                    if ($item && ! $itemsMap->has($item->id)) {
                        $itemsMap->put($item->id, [
                            'id' => $item->id,
                            'name' => $item->name,
                            'code' => $item->code,
                            'subcategories_id' => $item->subcategories_id,
                            'category_id' => $item->subcategory?->categories_id,
                            'category_name' => $item->subcategory?->category?->category ?? 'General',
                            'subcategory_name' => $item->subcategory?->subcategory ?? 'General',
                            'unit_cost' => (float) $poi->unit_cost,
                            'qty_ordered' => (int) $poi->qty_ordered,
                            'qty_received' => (int) $poi->qty_received,
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

            foreach ($grn->stocks as $stock) {
                if ($stock->stockItem && ! $itemsMap->has($stock->stockItem->id)) {
                    $item = $stock->stockItem;
                    $itemsMap->put($item->id, [
                        'id' => $item->id,
                        'name' => $item->name,
                        'code' => $item->code,
                        'subcategories_id' => $item->subcategories_id,
                        'category_id' => $item->subcategory?->categories_id,
                        'category_name' => $item->subcategory?->category?->category ?? 'General',
                        'subcategory_name' => $item->subcategory?->subcategory ?? 'General',
                        'unit_cost' => (float) $stock->buy,
                        'qty_ordered' => (int) $stock->qty,
                        'qty_received' => (int) $stock->qty,
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

            $supplierNames = $grn->purchaseOrders->pluck('supplier.name')->filter()->unique()->values()->join(', ');
            $poNumbers = $grn->purchaseOrders->pluck('id')->map(fn ($id) => 'PO #'.$id)->join(', ');
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

            return [
                'id' => $grn->id,
                'label' => implode(' - ', array_filter($labelParts)),
                'at_time' => $grn->at_time ? $grn->at_time->format('Y-m-d H:i') : null,
                'supplier_name' => $supplierNames,
                'po_numbers' => $poNumbers,
                'items' => $itemsMap->values()->all(),
            ];
        });

        return [
            'categories' => $categories,
            'brands' => $brands,
            'stock_items' => $stockItems,
            'grns' => $grns,
        ];
    }

    /**
     * Create a new Stock record and log movement.
     *
     * @param  array<string, mixed>  $data
     */
    public function createStock(array $data): Stock
    {
        return DB::transaction(function () use ($data) {
            $addDate = ! empty($data['add_date'])
                ? Carbon::parse($data['add_date'])
                : now();

            $stock = Stock::create([
                'stock_items_id' => $data['stock_items_id'],
                'brands_id' => $data['brands_id'],
                'qty' => $data['qty'],
                'price' => $data['price'],
                'buy' => $data['buy'],
                'grn_id' => $data['grn_id'],
                'add_date' => $addDate,
            ]);

            // Determine Batch
            $batchId = $data['batch_id'] ?? null;
            if (! empty($data['create_new_batch']) || empty($batchId)) {
                $batch = ItemBatch::create([
                    'stock_items_id' => $data['stock_items_id'],
                ]);
                $batchId = $batch->id;
            }

            // Link in grm_items
            GrmItem::create([
                'grn_id' => $data['grn_id'],
                'item_batches_id' => $batchId,
                'stock_id' => $stock->id,
                'qty' => $data['qty'],
            ]);

            // Add Stock Movement record with source_id = GRN ID as requested
            StockMovement::create([
                'stock_id' => $stock->id,
                'stock_movements_types_id' => 1, // GRN / Purchase Receipt
                'qty' => $data['qty'],
                'date' => $addDate,
                'source_id' => $data['grn_id'],
            ]);

            return $stock->load(['stockItem.subcategory.category', 'brand', 'grn', 'grmItems.itemBatch']);
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

            return $stock->load(['stockItem.subcategory.category', 'brand', 'grn', 'grmItems.itemBatch']);
        });
    }
}
