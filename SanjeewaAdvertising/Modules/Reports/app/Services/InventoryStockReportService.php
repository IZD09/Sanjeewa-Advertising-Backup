<?php

namespace Modules\Reports\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InventoryStockReportService extends BaseReportService
{
    /**
     * Get Inventory & Stock charts payload from the database.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, array<string, mixed>>
     */
    public function getCharts(array $filters = []): array
    {
        // 1. Stock Valuation (Top 5 items by total asset value: qty * buy price)
        $topValuationItems = DB::table('stock')
            ->join('stock_items', 'stock.stock_items_id', '=', 'stock_items.id')
            ->select(
                'stock.id',
                'stock_items.name',
                'stock_items.code',
                'stock.qty',
                'stock.buy',
                DB::raw('(stock.qty * stock.buy) as valuation')
            )
            ->orderByDesc('valuation')
            ->limit(5)
            ->get();

        $valLabels = $topValuationItems->map(fn ($s) => Str::limit($s->name ?: 'Item #'.$s->id, 20))->toArray();
        $valValues = $topValuationItems->map(fn ($s) => (float) $s->valuation)->toArray();

        // 2. Stock Health Distribution (Sufficient, Low Stock Warning, Critical / Out of Stock)
        $healthStats = DB::table('stock')
            ->join('stock_items', 'stock.stock_items_id', '=', 'stock_items.id')
            ->selectRaw('
                COALESCE(SUM(CASE WHEN stock.qty > stock_items.low_stock_qty THEN 1 ELSE 0 END), 0) as sufficient,
                COALESCE(SUM(CASE WHEN stock.qty > 0 AND stock.qty <= stock_items.low_stock_qty THEN 1 ELSE 0 END), 0) as low_stock,
                COALESCE(SUM(CASE WHEN stock.qty <= 0 THEN 1 ELSE 0 END), 0) as out_of_stock
            ')
            ->first();

        $sufficient = (int) ($healthStats->sufficient ?? 0);
        $lowStock = (int) ($healthStats->low_stock ?? 0);
        $outOfStock = (int) ($healthStats->out_of_stock ?? 0);

        // 3. Stock Price Comparison (Buy Price vs Selling Price)
        $priceComparisonItems = DB::table('stock')
            ->join('stock_items', 'stock.stock_items_id', '=', 'stock_items.id')
            ->select('stock.id', 'stock_items.name', 'stock.buy', 'stock.price')
            ->orderByDesc('stock.price')
            ->limit(5)
            ->get();

        $priceLabels = $priceComparisonItems->map(fn ($s) => Str::limit($s->name ?: 'Item #'.$s->id, 16))->toArray();
        $buyPrices = $priceComparisonItems->map(fn ($s) => (float) $s->buy)->toArray();
        $sellPrices = $priceComparisonItems->map(fn ($s) => (float) $s->price)->toArray();

        return [
            'stockValuation' => [
                'labels' => $valLabels,
                'values' => $valValues,
            ],
            'stockHealth' => [
                'labels' => ['Sufficient Stock', 'Low Stock Warning', 'Critical / Out of Stock'],
                'values' => [$sufficient, $lowStock, $outOfStock],
            ],
            'stockPriceComparison' => [
                'labels' => $priceLabels,
                'buyPrices' => $buyPrices,
                'sellPrices' => $sellPrices,
            ],
        ];
    }

    /**
     * Get paginated Inventory & Stock table from the database.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getInventoryStockTable(array $filters = []): array
    {
        $search = trim($filters['search'] ?? '');
        $perPage = max(5, min(100, (int) ($filters['per_page'] ?? 15)));
        $page = max(1, (int) ($filters['page'] ?? 1));

        $query = DB::table('stock')
            ->leftJoin('stock_items', 'stock.stock_items_id', '=', 'stock_items.id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('stock_items.name', 'like', "%{$search}%")
                    ->orWhere('stock_items.code', 'like', "%{$search}%");
            });
        }

        $sortCol = (int) ($filters['sort_col'] ?? 0);
        $sortDir = ($filters['sort_dir'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $colMap = [
            0 => 'stock_items.code',
            1 => 'stock_items.name',
            2 => 'stock.qty',
            3 => 'stock.buy',
            4 => 'stock.price',
        ];
        $orderBy = $colMap[$sortCol] ?? 'stock.id';
        $query->orderBy($orderBy, $sortDir);

        $total = $query->count();
        $items = $query->skip(($page - 1) * $perPage)->take($perPage)
            ->select('stock.id', 'stock_items.name as item_name', 'stock_items.code', 'stock.qty', 'stock.price', 'stock.buy', 'stock_items.low_stock_qty')
            ->get()
            ->map(function ($s) {
                $qty = (int) ($s->qty ?: 0);
                $low = (int) ($s->low_stock_qty ?: 15);
                $buy = (float) ($s->buy ?: 100);
                $sell = (float) ($s->price ?: 150);
                $status = $qty > $low ? 'In Stock' : ($qty > 0 ? 'Low Stock' : 'Out of Stock');

                return [
                    'id' => $s->id,
                    'item_code' => $s->code ?: sprintf('ITM-%04d', $s->id),
                    'item_name' => $s->item_name ?: 'Stock Item #'.$s->id,
                    'quantity' => $qty,
                    'buy_price' => $buy,
                    'sell_price' => $sell,
                    'valuation' => $qty * $buy,
                    'health_status' => $status,
                ];
            });

        return [
            'data' => $items,
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'last_page' => max(1, (int) ceil($total / $perPage)),
        ];
    }
}
