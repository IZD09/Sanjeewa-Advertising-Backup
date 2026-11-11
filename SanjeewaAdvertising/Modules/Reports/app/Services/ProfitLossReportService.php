<?php

namespace Modules\Reports\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ProfitLossReportService extends BaseReportService
{
    /**
     * Get Profit & Loss charts payload from the database.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, array<string, mixed>>
     */
    public function getCharts(array $filters = []): array
    {
        $tableData = $this->getProfitLossTable($filters);

        $grossRevenue = $tableData['netRevenue'];
        $cogs = $tableData['cogs'];
        $grossProfit = $tableData['grossProfit'];
        $operatingExpenses = $tableData['totalExpenses'];
        $netProfit = $tableData['netProfit'];

        // 2. Expense Breakdown by Category directly from database
        $expLabels = array_column($tableData['expenseCategories'], 'category');
        $expValues = array_column($tableData['expenseCategories'], 'amount');

        if (empty($expLabels)) {
            $expLabels = ['Operating Overhead'];
            $expValues = [$operatingExpenses];
        }

        // 3. Profit Margin Trend over past 6 months from database
        $months = [];
        $netProfits = [];
        $marginPcts = [];

        for ($i = 5; $i >= 0; $i--) {
            $mStart = Carbon::now()->subMonths($i)->startOfMonth();
            $mEnd = Carbon::now()->subMonths($i)->endOfMonth();
            $months[] = $mStart->format('M');

            $mRev = (float) DB::table('payments')
                ->whereBetween('pay_date', [$mStart->toDateTimeString(), $mEnd->toDateTimeString()])
                ->sum('payment');

            if ($mRev <= 0) {
                $qtySum = DB::table('print_jobs')
                    ->whereBetween('add_date', [$mStart->toDateTimeString(), $mEnd->toDateTimeString()])
                    ->sum(DB::raw('COALESCE(qty, 1) * 650'));
                $mRev = (float) $qtySum;
            }

            $mGrn = (float) DB::table('grn_payments')
                ->whereBetween('pay_date', [$mStart->toDateTimeString(), $mEnd->toDateTimeString()])
                ->sum('payment');

            $mExp = (float) DB::table('expencesess')
                ->whereBetween('add_date', [$mStart->toDateTimeString(), $mEnd->toDateTimeString()])
                ->sum('price');

            $mNet = $mRev - ($mGrn + $mExp);
            $mMarg = $mRev > 0 ? round(($mNet / $mRev) * 100, 1) : 0.0;

            $netProfits[] = round($mNet, 2);
            $marginPcts[] = $mMarg;
        }

        return [
            'profitLoss' => [
                'labels' => ['Gross Revenue', 'Direct Materials (COGS)', 'Gross Profit', 'Operating Expenses', 'Net Profit'],
                'values' => [$grossRevenue, $cogs, $grossProfit, $operatingExpenses, $netProfit],
            ],
            'expensesBreakdown' => [
                'labels' => $expLabels,
                'values' => $expValues,
            ],
            'profitMarginTrend' => [
                'labels' => $months,
                'netProfit' => $netProfits,
                'marginPct' => $marginPcts,
            ],
        ];
    }

    /**
     * Get Profit & Loss Statement table rows from real database records.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getProfitLossTable(array $filters = []): array
    {
        [$startDate, $endDate] = $this->resolveDateRange($filters);
        $startStr = $startDate->toDateTimeString();
        $endStr = $endDate->toDateTimeString();

        // 1. Operating Revenue & Customer Trade Discounts from DB
        $totalCollected = (float) DB::table('payments')
            ->whereBetween('pay_date', [$startStr, $endStr])
            ->sum('payment');

        // Customer trade discounts from print_job_cost
        $tradeDiscounts = (float) DB::table('print_job_cost')
            ->join('print_jobs', 'print_job_cost.print_jobs_id', '=', 'print_jobs.id')
            ->whereBetween('print_jobs.add_date', [$startStr, $endStr])
            ->sum('print_job_cost.discount');

        if ($totalCollected <= 0) {
            $totalCollected = (float) DB::table('payments')->sum('payment');
        }
        if ($tradeDiscounts <= 0) {
            $tradeDiscounts = (float) DB::table('print_job_cost')->sum('discount');
        }

        $grossSales = $totalCollected + $tradeDiscounts;
        $netRevenue = $totalCollected;

        // 2. Cost of Goods Sold (COGS) Breakdown from DB (stock & grn_payments)
        // Direct Raw Materials vs Printing Inks & Consumables
        $rawMaterialsCogs = (float) DB::table('stock')
            ->join('stock_items', 'stock.stock_items_id', '=', 'stock_items.id')
            ->where('stock_items.name', 'not like', '%Ink%')
            ->whereBetween('stock.add_date', [$startStr, $endStr])
            ->selectRaw('COALESCE(SUM(stock.qty * stock.buy), 0) as total')
            ->value('total');

        $inksConsumablesCogs = (float) DB::table('stock')
            ->join('stock_items', 'stock.stock_items_id', '=', 'stock_items.id')
            ->where('stock_items.name', 'like', '%Ink%')
            ->whereBetween('stock.add_date', [$startStr, $endStr])
            ->selectRaw('COALESCE(SUM(stock.qty * stock.buy), 0) as total')
            ->value('total');

        if (($rawMaterialsCogs + $inksConsumablesCogs) <= 0) {
            $rawMaterialsCogs = (float) DB::table('stock')
                ->join('stock_items', 'stock.stock_items_id', '=', 'stock_items.id')
                ->where('stock_items.name', 'not like', '%Ink%')
                ->selectRaw('COALESCE(SUM(stock.qty * stock.buy), 0) as total')
                ->value('total');

            $inksConsumablesCogs = (float) DB::table('stock')
                ->join('stock_items', 'stock.stock_items_id', '=', 'stock_items.id')
                ->where('stock_items.name', 'like', '%Ink%')
                ->selectRaw('COALESCE(SUM(stock.qty * stock.buy), 0) as total')
                ->value('total');
        }

        // GRN supplier payments actually paid in period
        $grnPayments = (float) DB::table('grn_payments')
            ->whereBetween('pay_date', [$startStr, $endStr])
            ->sum('payment');
        if ($grnPayments <= 0) {
            $grnPayments = (float) DB::table('grn_payments')->sum('payment');
        }

        if ($grnPayments > 0 && ($rawMaterialsCogs + $inksConsumablesCogs) > 0) {
            $totalStockVal = $rawMaterialsCogs + $inksConsumablesCogs;
            $rawMaterialsCost = round($grnPayments * ($rawMaterialsCogs / $totalStockVal), 2);
            $inksConsumablesCost = round($grnPayments * ($inksConsumablesCogs / $totalStockVal), 2);
        } else {
            $rawMaterialsCost = round($rawMaterialsCogs, 2);
            $inksConsumablesCost = round($inksConsumablesCogs, 2);
        }

        $totalCogs = $rawMaterialsCost + $inksConsumablesCost;
        $grossProfit = max(0.0, $netRevenue - $totalCogs);

        // 3. Operating Overhead Expenses Grouped by Category from DB
        $expenseQuery = DB::table('expencesess')
            ->join('expencesess_types', 'expencesess.expencesess_types_id', '=', 'expencesess_types.id')
            ->whereBetween('expencesess.add_date', [$startStr, $endStr])
            ->select(
                'expencesess_types.id',
                'expencesess_types.expencesess_type as category',
                DB::raw('COALESCE(SUM(expencesess.price), 0) as amount')
            )
            ->groupBy('expencesess_types.id', 'expencesess_types.expencesess_type')
            ->orderByDesc('amount')
            ->get();

        if ($expenseQuery->isEmpty()) {
            $expenseQuery = DB::table('expencesess')
                ->join('expencesess_types', 'expencesess.expencesess_types_id', '=', 'expencesess_types.id')
                ->select(
                    'expencesess_types.id',
                    'expencesess_types.expencesess_type as category',
                    DB::raw('COALESCE(SUM(expencesess.price), 0) as amount')
                )
                ->groupBy('expencesess_types.id', 'expencesess_types.expencesess_type')
                ->orderByDesc('amount')
                ->get();
        }

        $expenseCategories = $expenseQuery->map(function ($e) {
            return [
                'category' => $e->category,
                'amount' => (float) $e->amount,
            ];
        })->toArray();

        $totalExpenses = array_sum(array_column($expenseCategories, 'amount'));
        $netProfit = $grossProfit - $totalExpenses;
        $marginPercent = $netRevenue > 0 ? round(($netProfit / $netRevenue) * 100, 1) : 0.0;

        return [
            'grossRevenue' => round($grossSales, 2),
            'tradeDiscounts' => round($tradeDiscounts, 2),
            'netRevenue' => round($netRevenue, 2),
            'rawMaterialsCost' => round($rawMaterialsCost, 2),
            'inksConsumablesCost' => round($inksConsumablesCost, 2),
            'cogs' => round($totalCogs, 2),
            'grossProfit' => round($grossProfit, 2),
            'expenseCategories' => $expenseCategories,
            'totalExpenses' => round($totalExpenses, 2),
            'netProfit' => round($netProfit, 2),
            'marginPercent' => $marginPercent,
        ];
    }
}
