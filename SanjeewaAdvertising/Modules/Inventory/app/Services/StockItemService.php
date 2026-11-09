<?php

namespace Modules\Inventory\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Modules\Inventory\Models\Brand;
use Modules\Inventory\Models\Category;
use Modules\Inventory\Models\StockItem;
use Modules\Inventory\Models\Subcategory;

class StockItemService
{
    /**
     * Build base query for stock items with subcategories, categories, and brands.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<StockItem>
     */
    protected function buildStockItemsQuery(array $filters = []): Builder
    {
        $query = StockItem::with([
            'subcategory.category',
            'brands',
            'stocks.brand',
        ])->withCount(['stocks', 'brands'])->orderBy('id', 'desc');

        $search = isset($filters['search']) ? trim((string) $filters['search']) : '';
        if ($search !== '') {
            $query->where(function (Builder $q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhereHas('subcategory', function (Builder $sq) use ($search): void {
                        $sq->where('subcategory', 'like', "%{$search}%")
                            ->orWhereHas('category', function (Builder $cq) use ($search): void {
                                $cq->where('category', 'like', "%{$search}%");
                            });
                    })
                    ->orWhereHas('brands', function (Builder $bq) use ($search): void {
                        $bq->where('brand', 'like', "%{$search}%");
                    });
            });
        }

        $subcategoryId = $filters['subcategory_id'] ?? null;
        if (! empty($subcategoryId) && $subcategoryId !== 'ALL') {
            $query->where('subcategories_id', (int) $subcategoryId);
        }

        $categoryId = $filters['category_id'] ?? null;
        if (! empty($categoryId) && $categoryId !== 'ALL') {
            $query->whereHas('subcategory', function (Builder $sq) use ($categoryId): void {
                $sq->where('categories_id', (int) $categoryId);
            });
        }

        $brandId = $filters['brand_id'] ?? null;
        if (! empty($brandId) && $brandId !== 'ALL') {
            $query->where(function (Builder $q) use ($brandId): void {
                $q->whereHas('brands', function (Builder $bq) use ($brandId): void {
                    $bq->where('brands.id', (int) $brandId);
                })->orWhereHas('stocks', function (Builder $stq) use ($brandId): void {
                    $stq->where('brands_id', (int) $brandId);
                });
            });
        }

        return $query;
    }

    /**
     * Retrieve all stock items matching filters.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, StockItem>
     */
    public function getStockItems(array $filters = []): Collection
    {
        return $this->buildStockItemsQuery($filters)->get();
    }

    /**
     * Retrieve paginated stock items matching filters (20 per page by default).
     *
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, StockItem>
     */
    public function paginateStockItems(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->buildStockItemsQuery($filters)->paginate($perPage);
    }

    /**
     * Create a new stock item and associate any selected brands.
     *
     * @param  array{name: string, code?: ?string, subcategories_id: int|string, brands?: list<int>}  $data
     */
    public function createStockItem(array $data): StockItem
    {
        $code = ! empty($data['code']) ? strtoupper(trim((string) $data['code'])) : null;
        if (! $code) {
            $latestId = (int) (StockItem::max('id') ?? 0);
            $candidate = sprintf('ITM-%04d', $latestId + 1);
            while (StockItem::where('code', $candidate)->exists()) {
                $latestId++;
                $candidate = sprintf('ITM-%04d', $latestId + 1);
            }
            $code = $candidate;
        }

        $stockItem = StockItem::create([
            'name' => trim($data['name']),
            'code' => $code,
            'subcategories_id' => (int) $data['subcategories_id'],
            'low_stock_qty' => isset($data['low_stock_qty']) ? (int) $data['low_stock_qty'] : 10,
            'reorder_qty' => isset($data['reorder_qty']) ? (int) $data['reorder_qty'] : 20,
        ]);

        if (! empty($data['brands']) && is_array($data['brands'])) {
            $stockItem->brands()->sync($data['brands']);
        }

        $stockItem->load(['subcategory.category', 'brands', 'stocks.brand'])->loadCount(['stocks', 'brands']);

        return $stockItem;
    }

    /**
     * Update an existing stock item.
     *
     * @param  array{name?: string, code?: string, subcategories_id?: int|string, brands?: list<int>}  $data
     */
    public function updateStockItem(StockItem $stockItem, array $data): StockItem
    {
        $updateData = [];
        if (isset($data['name'])) {
            $updateData['name'] = trim($data['name']);
        }
        if (isset($data['code'])) {
            $updateData['code'] = strtoupper(trim($data['code']));
        }
        if (isset($data['subcategories_id'])) {
            $updateData['subcategories_id'] = (int) $data['subcategories_id'];
        }
        if (isset($data['low_stock_qty'])) {
            $updateData['low_stock_qty'] = (int) $data['low_stock_qty'];
        }
        if (isset($data['reorder_qty'])) {
            $updateData['reorder_qty'] = (int) $data['reorder_qty'];
        }

        if (! empty($updateData)) {
            $stockItem->update($updateData);
        }

        if (array_key_exists('brands', $data) && is_array($data['brands'])) {
            $stockItem->brands()->sync($data['brands']);
        }

        $stockItem->load(['subcategory.category', 'brands', 'stocks.brand'])->loadCount(['stocks', 'brands']);

        return $stockItem;
    }

    /**
     * Retrieve all brands with associated stock items count.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Brand>
     */
    public function getBrands(array $filters = []): Collection
    {
        $query = Brand::withCount(['stockItems', 'stocks'])->orderBy('brand', 'asc');

        $search = isset($filters['search']) ? trim((string) $filters['search']) : '';
        if ($search !== '') {
            $query->where('brand', 'like', "%{$search}%");
        }

        return $query->get();
    }

    /**
     * Create a new brand.
     *
     * @param  array{brand: string}  $data
     */
    public function createBrand(array $data): Brand
    {
        $brand = Brand::create([
            'brand' => trim($data['brand']),
        ]);

        $brand->loadCount(['stockItems', 'stocks']);

        return $brand;
    }

    /**
     * Update an existing brand.
     *
     * @param  array{brand: string}  $data
     */
    public function updateBrand(Brand $brand, array $data): Brand
    {
        $brand->update([
            'brand' => trim($data['brand']),
        ]);

        $brand->loadCount(['stockItems', 'stocks']);

        return $brand;
    }

    /**
     * Get aggregate KPI statistics for stock items and brands.
     *
     * @return array{total_items: int, total_brands: int, mapped_categories: int, mapped_subcategories: int}
     */
    public function getStockItemStats(): array
    {
        return [
            'total_items' => StockItem::count(),
            'total_brands' => Brand::count(),
            'mapped_categories' => Category::count(),
            'mapped_subcategories' => Subcategory::count(),
        ];
    }

    /**
     * Combined payload for the Stock Items & Brands tab initialization.
     *
     * @param  array<string, mixed>  $filters
     * @return array{stock_items: Collection<int, StockItem>, brands: Collection<int, Brand>, categories: Collection<int, Category>, stats: array{total_items: int, total_brands: int, mapped_categories: int, mapped_subcategories: int}}
     */
    public function getStockItemsTabData(array $filters = []): array
    {
        return [
            'stock_items' => $this->getStockItems($filters),
            'brands' => $this->getBrands(),
            'categories' => Category::with(['subcategories' => function ($sq): void {
                $sq->orderBy('subcategory');
            }])->orderBy('category')->get(),
            'stats' => $this->getStockItemStats(),
        ];
    }
}
