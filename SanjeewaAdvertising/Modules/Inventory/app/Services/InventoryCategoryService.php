<?php

namespace Modules\Inventory\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Modules\Inventory\Models\Category;
use Modules\Inventory\Models\StockItem;
use Modules\Inventory\Models\Subcategory;

class InventoryCategoryService
{
    /**
     * Retrieve all categories with subcategory counts and related subcategories.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Category>
     */
    public function getCategories(array $filters = []): Collection
    {
        $query = Category::withCount(['subcategories'])
            ->with(['subcategories' => function ($subQuery): void {
                $subQuery->withCount('stockItems')->orderBy('subcategory');
            }])
            ->orderBy('category');

        $search = isset($filters['search']) ? trim((string) $filters['search']) : '';
        if ($search !== '') {
            $query->where('category', 'like', "%{$search}%");
        }

        return $query->get();
    }

    /**
     * Create a new category record in the database.
     *
     * @param  array{category: string}  $data
     */
    public function createCategory(array $data): Category
    {
        $category = Category::create([
            'category' => trim($data['category']),
        ]);

        $category->loadCount('subcategories');
        $category->setRelation('subcategories', new Collection([]));

        return $category;
    }

    /**
     * Build the base query for subcategories with parent category and stock item counts.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<Subcategory>
     */
    protected function buildSubcategoriesQuery(array $filters = []): Builder
    {
        $query = Subcategory::with(['category'])
            ->withCount('stockItems')
            ->orderBy('subcategory');

        $categoryId = $filters['category_id'] ?? null;
        if (! empty($categoryId) && $categoryId !== 'ALL') {
            $query->where('categories_id', (int) $categoryId);
        }

        $search = isset($filters['search']) ? trim((string) $filters['search']) : '';
        if ($search !== '') {
            $query->where(function ($subQuery) use ($search): void {
                $subQuery->where('subcategory', 'like', "%{$search}%")
                    ->orWhereHas('category', function ($catQuery) use ($search): void {
                        $catQuery->where('category', 'like', "%{$search}%");
                    });
            });
        }

        return $query;
    }

    /**
     * Retrieve subcategories with parent category and stock item counts.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Subcategory>
     */
    public function getSubcategories(array $filters = []): Collection
    {
        return $this->buildSubcategoriesQuery($filters)->get();
    }

    /**
     * Retrieve paginated subcategories (default 20 per page) with parent category and stock item counts.
     *
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, Subcategory>
     */
    public function paginateSubcategories(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->buildSubcategoriesQuery($filters)->paginate($perPage);
    }

    /**
     * Create a new subcategory record in the database.
     *
     * @param  array{subcategory: string, categories_id: int|string}  $data
     */
    public function createSubcategory(array $data): Subcategory
    {
        $subcategory = Subcategory::create([
            'subcategory' => trim($data['subcategory']),
            'categories_id' => (int) $data['categories_id'],
        ]);

        $subcategory->load(['category'])->loadCount('stockItems');

        return $subcategory;
    }

    /**
     * Get aggregate KPI statistics for categories, subcategories, and mapped stock items.
     *
     * @return array{total_categories: int, total_subcategories: int, total_items: int}
     */
    public function getCategoryStats(): array
    {
        return [
            'total_categories' => Category::count(),
            'total_subcategories' => Subcategory::count(),
            'total_items' => StockItem::count(),
        ];
    }

    /**
     * Get combined categories, subcategories, and KPI statistics payload for the UI.
     *
     * @param  array<string, mixed>  $filters
     * @return array{categories: Collection<int, Category>, subcategories: Collection<int, Subcategory>, stats: array{total_categories: int, total_subcategories: int, total_items: int}}
     */
    public function getCategoriesTabData(array $filters = []): array
    {
        return [
            'categories' => $this->getCategories($filters),
            'subcategories' => $this->getSubcategories($filters),
            'stats' => $this->getCategoryStats(),
        ];
    }
}
