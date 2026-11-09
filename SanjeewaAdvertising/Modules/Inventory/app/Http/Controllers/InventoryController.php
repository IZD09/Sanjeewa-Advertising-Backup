<?php

namespace Modules\Inventory\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\Inventory\Http\Requests\StoreBrandRequest;
use Modules\Inventory\Http\Requests\StoreCategoryRequest;
use Modules\Inventory\Http\Requests\StoreStockItemRequest;
use Modules\Inventory\Http\Requests\StoreSubcategoryRequest;
use Modules\Inventory\Http\Requests\UpdateBrandRequest;
use Modules\Inventory\Http\Requests\UpdateStockItemRequest;
use Modules\Inventory\Models\Brand;
use Modules\Inventory\Models\StockItem;
use Modules\Inventory\Models\StockMovement;
use Modules\Inventory\Models\StockMovementType;
use Modules\Inventory\Services\InventoryCategoryService;
use Modules\Inventory\Services\StockItemService;

class InventoryController extends BaseApiController
{
    public function __construct(
        protected InventoryCategoryService $categoryService,
        protected StockItemService $stockItemService
    ) {}

    /**
     * Retrieve combined catalog data for the Stock Items & Brands UI tab.
     */
    public function stockItemsData(Request $request): JsonResponse
    {
        $data = $this->stockItemService->getStockItemsTabData($request->query());

        return $this->success($data, 'Stock items catalog data retrieved successfully.');
    }

    /**
     * Display a paginated listing of stock items.
     */
    public function stockItems(Request $request): JsonResponse
    {
        $perPage = max(1, (int) $request->input('per_page', 20));
        $paginator = $this->stockItemService->paginateStockItems($request->query(), $perPage);

        return $this->paginated($paginator, 'Stock items retrieved successfully.');
    }

    /**
     * Store a newly created stock item.
     */
    public function storeStockItem(StoreStockItemRequest $request): JsonResponse
    {
        $stockItem = $this->stockItemService->createStockItem($request->validated());

        return $this->created($stockItem, 'Stock item created successfully.');
    }

    /**
     * Update an existing stock item.
     */
    public function updateStockItem(UpdateStockItemRequest $request, StockItem $stockItem): JsonResponse
    {
        $updated = $this->stockItemService->updateStockItem($stockItem, $request->validated());

        return $this->success($updated, 'Stock item updated successfully.');
    }

    /**
     * Display all brands.
     */
    public function brands(Request $request): JsonResponse
    {
        $brands = $this->stockItemService->getBrands($request->query());

        return $this->success($brands, 'Brands retrieved successfully.');
    }

    /**
     * Store a newly created brand.
     */
    public function storeBrand(StoreBrandRequest $request): JsonResponse
    {
        $brand = $this->stockItemService->createBrand($request->validated());

        return $this->created($brand, 'Brand created successfully.');
    }

    /**
     * Update an existing brand.
     */
    public function updateBrand(UpdateBrandRequest $request, Brand $brand): JsonResponse
    {
        $updated = $this->stockItemService->updateBrand($brand, $request->validated());

        return $this->success($updated, 'Brand updated successfully.');
    }

    /**
     * Retrieve combined categories, subcategories, and KPI statistics payload for the UI.
     */
    public function categoriesData(Request $request): JsonResponse
    {
        $data = $this->categoryService->getCategoriesTabData($request->query());

        return $this->success($data, 'Categories and subcategories data retrieved successfully.');
    }

    /**
     * Display all material categories with subcategory relations and counts.
     */
    public function categories(Request $request): JsonResponse
    {
        $categories = $this->categoryService->getCategories($request->query());

        return $this->success($categories, 'Categories retrieved successfully.');
    }

    /**
     * Store a newly created category.
     */
    public function storeCategory(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->categoryService->createCategory($request->validated());

        return $this->created($category, 'Category created successfully.');
    }

    /**
     * Display a listing of subcategories with category and item counts.
     * Supports optional pagination when `page` or `per_page` is passed (default 20 per page).
     */
    public function subcategories(Request $request): JsonResponse
    {
        if ($request->has('page') || $request->has('per_page')) {
            $perPage = max(1, (int) $request->input('per_page', 20));
            $paginator = $this->categoryService->paginateSubcategories($request->query(), $perPage);

            return $this->paginated($paginator, 'Subcategories retrieved successfully.');
        }

        $subcategories = $this->categoryService->getSubcategories($request->query());

        return $this->success($subcategories, 'Subcategories retrieved successfully.');
    }

    /**
     * Store a newly created subcategory.
     */
    public function storeSubcategory(StoreSubcategoryRequest $request): JsonResponse
    {
        $subcategory = $this->categoryService->createSubcategory($request->validated());

        return $this->created($subcategory, 'Subcategory created successfully.');
    }

    /**
     * Aggregate statistics for categories, subcategories, and material items.
     */
    public function categoriesStats(): JsonResponse
    {
        return $this->success(
            $this->categoryService->getCategoryStats(),
            'Category statistics retrieved successfully.'
        );
    }

    /**
     * Display a paginated listing of stock movements with search and type filters.
     */
    public function stockMovements(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 20);
        $search = trim((string) $request->input('search', ''));
        $typeId = $request->input('type_id');
        $direction = strtoupper(trim((string) $request->input('direction', '')));

        $query = StockMovement::with([
            'stock.stockItem.subcategory.category',
            'stock.brand',
            'stock.grn',
            'movementType',
        ])->orderByDesc('date')->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->whereHas('stock.stockItem', function ($sq) use ($search) {
                    $sq->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                })->orWhereHas('movementType', function ($mq) use ($search) {
                    $mq->where('stock_movements_type', 'like', "%{$search}%");
                })->orWhere('source_id', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%");
            });
        }

        if (! empty($typeId) && $typeId !== 'ALL') {
            $query->where('stock_movements_types_id', (int) $typeId);
        }

        if ($direction !== '' && $direction !== 'ALL') {
            if ($direction === 'IN') {
                $query->whereIn('stock_movements_types_id', [1, 3]);
            } elseif ($direction === 'OUT') {
                $query->whereIn('stock_movements_types_id', [2, 4, 6, 7]);
            } elseif ($direction === 'ADJUST') {
                $query->where('stock_movements_types_id', 5);
            }
        }

        $paginator = $query->paginate($perPage);

        $paginator->getCollection()->transform(function (StockMovement $item) {
            $typeId = (int) $item->stock_movements_types_id;
            $typeName = $item->movementType?->stock_movements_type ?? 'Movement';

            $isIn = in_array($typeId, [1, 3], true);
            $isOut = in_array($typeId, [2, 4, 6, 7], true);
            $dir = $isIn ? 'IN' : ($isOut ? 'OUT' : 'ADJUST');

            $stock = $item->stock;
            $stockItem = $stock?->stockItem;

            $sourceLabel = match ($typeId) {
                1 => 'GRN #'.($item->source_id ?: ($stock?->grn_id ?? 'N/A')),
                2 => 'Job #'.($item->source_id ?: 'ORD-N/A'),
                3 => 'Manual In #'.$item->source_id,
                4 => 'Manual Out #'.$item->source_id,
                5 => 'Audit Adjust #'.$item->source_id,
                6 => 'Damage #'.$item->source_id,
                7 => 'Return #'.$item->source_id,
                default => 'Ref #'.$item->source_id,
            };

            return [
                'id' => $item->id,
                'movement_code' => 'MOV-'.str_pad((string) $item->id, 5, '0', STR_PAD_LEFT),
                'date' => $item->date ? $item->date->format('Y-m-d H:i') : null,
                'date_formatted' => $item->date ? $item->date->format('d M Y, h:i A') : '-',
                'stock_id' => $item->stock_id,
                'item_code' => $stockItem?->code ?? ('SKU-'.$item->stock_id),
                'item_name' => $stockItem?->name ?? 'Stock Item #'.$item->stock_id,
                'category' => $stockItem?->subcategory?->category?->category ?? ($stockItem?->subcategory?->subcategory ?? 'General'),
                'brand' => $stock?->brand?->brand ?? 'Generic',
                'type_id' => $typeId,
                'type_name' => $typeName,
                'direction' => $dir,
                'qty' => (int) $item->qty,
                'qty_display' => ($isIn ? '+' : ($isOut ? '-' : '±')).number_format((float) $item->qty),
                'unit_price' => (float) ($stock?->price ?? 0),
                'buy_price' => (float) ($stock?->buy ?? 0),
                'total_value' => round((float) (($stock?->price ?? 0) * $item->qty), 2),
                'source_id' => $item->source_id,
                'source_label' => $sourceLabel,
            ];
        });

        return $this->paginated($paginator, 'Stock movements retrieved successfully.');
    }

    /**
     * Get aggregate statistics for stock movements.
     */
    public function stockMovementsStats(): JsonResponse
    {
        $totalMovements = StockMovement::count();
        $inwardQty = (int) StockMovement::whereIn('stock_movements_types_id', [1, 3])->sum('qty');
        $outwardQty = (int) StockMovement::whereIn('stock_movements_types_id', [2, 4, 6, 7])->sum('qty');
        $adjustmentCount = StockMovement::where('stock_movements_types_id', 5)->count();

        return $this->success([
            'total_movements' => $totalMovements,
            'inward_qty' => $inwardQty,
            'outward_qty' => $outwardQty,
            'adjustment_count' => $adjustmentCount,
        ], 'Movement metrics retrieved successfully.');
    }

    /**
     * Get stock movement types.
     */
    public function movementTypes(): JsonResponse
    {
        $types = StockMovementType::all(['id', 'stock_movements_type']);

        return $this->success($types, 'Movement types retrieved successfully.');
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return view('inventory::index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('inventory::create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request) {}

    /**
     * Show the specified resource.
     */
    public function show($id)
    {
        return view('inventory::show');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        return view('inventory::edit');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id) {}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id) {}
}
