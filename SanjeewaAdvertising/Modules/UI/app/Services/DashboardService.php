<?php

namespace Modules\UI\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Modules\Customer\Models\Customer;
use Modules\Inventory\Models\Stock;
use Modules\PrintJob\Models\PrintJob;
use Modules\Transaction\Models\Expencesess;
use Modules\Transaction\Models\GrnPayment;
use Modules\Transaction\Models\Payment;
use Modules\UI\Transformers\DashboardResource;

class DashboardService
{
    public const string CACHE_KEY = 'ui:dashboard:shared_snapshot';

    public const string CACHE_LOCK_KEY = 'ui:dashboard:shared_snapshot_lock';

    public const int CACHE_TTL_SECONDS = 15;

    /**
     * Retrieve the shared dashboard snapshot cached across all Users and Admins.
     * Ensures database aggregations are computed once and broadcast identically to all clients.
     *
     * @param  array<string, mixed>  $filters
     * @return array{data: array<string, mixed>, json: string, hash: string, generated_at: string}
     */
    public function getSharedDashboardSnapshot(array $filters = [], bool $forceRefresh = false): array
    {
        if (! $forceRefresh) {
            $cached = Cache::get(self::CACHE_KEY);
            if (is_array($cached) && isset($cached['data'], $cached['json'], $cached['hash'])) {
                return $cached;
            }
        }

        $computeSnapshot = function () use ($filters, $forceRefresh): array {
            if (! $forceRefresh) {
                $cached = Cache::get(self::CACHE_KEY);
                if (is_array($cached) && isset($cached['data'], $cached['json'], $cached['hash'])) {
                    return $cached;
                }
            }

            $rawData = $this->getDashboardData($filters);
            $resolved = (new DashboardResource($rawData))->resolve();
            $json = (string) json_encode($resolved, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $hash = md5($json);

            $snapshot = [
                'data' => $resolved,
                'json' => $json,
                'hash' => $hash,
                'generated_at' => Carbon::now()->toIso8601String(),
            ];

            Cache::put(self::CACHE_KEY, $snapshot, now()->addSeconds(self::CACHE_TTL_SECONDS));

            return $snapshot;
        };

        try {
            return Cache::lock(self::CACHE_LOCK_KEY, 10)->block(5, $computeSnapshot);
        } catch (\Throwable) {
            return $computeSnapshot();
        }
    }

    /**
     * Clear the shared dashboard snapshot cache so the next request recomputes fresh data.
     */
    public static function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Retrieve aggregated dashboard metrics and chart datasets populated from real database records.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getDashboardData(array $filters = []): array
    {
        return [
            'overview' => $this->resolveOverviewData(),
            'revenue' => $this->resolveRevenueData(),
            'jobs' => $this->resolveJobsData(),
            'stock' => $this->resolveStockData(),
            'finance' => $this->resolveFinanceData(),
        ];
    }

    /**
     * Resolve Slide 1: Business Overview stats and charts from real database records.
     *
     * @return array<string, mixed>
     */
    protected function resolveOverviewData(): array
    {
        $now = Carbon::now();
        $currentYear = (int) $now->year;
        $currentMonth = (int) $now->month;
        $lastMonthDate = (clone $now)->subMonth();
        $lastMonthYear = (int) $lastMonthDate->year;
        $lastMonth = (int) $lastMonthDate->month;

        // 1. Article 1: Total Sales Revenue
        $totalSales = 0.0;
        $currentMonthSales = 0.0;
        $lastMonthSales = 0.0;
        $salesBars = array_fill(0, 7, 0);

        if (Schema::hasTable('payments')) {
            $totalSales = (float) Payment::sum('payment');
            $currentMonthSales = (float) Payment::whereYear('pay_date', $currentYear)
                ->whereMonth('pay_date', $currentMonth)
                ->sum('payment');
            $lastMonthSales = (float) Payment::whereYear('pay_date', $lastMonthYear)
                ->whereMonth('pay_date', $lastMonth)
                ->sum('payment');

            $dailySums = collect(range(6, 0))->map(function ($daysAgo) use ($now) {
                $date = (clone $now)->subDays($daysAgo)->toDateString();

                return (float) Payment::whereDate('pay_date', $date)->sum('payment');
            });

            $maxDaily = $dailySums->max();
            $salesBars = $dailySums->map(function ($val) use ($maxDaily) {
                return $maxDaily > 0 ? max(10, min(100, (int) round(($val / $maxDaily) * 100))) : 0;
            })->values()->all();
        }

        $salesTrend = $lastMonthSales > 0
            ? round((($currentMonthSales - $lastMonthSales) / $lastMonthSales) * 100, 1)
            : ($currentMonthSales > 0 ? 100.0 : 0.0);
        $salesTrendState = $salesTrend >= 0 ? 'positive' : 'negative';

        // 2. Article 2: Active Print Jobs & Status Breakdown
        $activeJobCount = 0;
        $completedJobs = 0;
        $printingJobs = 0;
        $designingJobs = 0;
        $pendingJobs = 0;
        $jobsBars = array_fill(0, 7, 0);
        $currentMonthJobs = 0;
        $lastMonthJobs = 0;

        if (Schema::hasTable('print_jobs')) {
            $allJobs = DB::table('print_jobs')->select('id', 'add_date')->get();

            $statusHistory = collect();
            if (Schema::hasTable('print_job_status_history')) {
                $statusHistory = DB::table('print_job_status_history')
                    ->select('print_jobs_id', 'print_job_statuses_id', 'update_at')
                    ->orderBy('update_at', 'desc')
                    ->get()
                    ->groupBy('print_jobs_id')
                    ->map(fn ($group) => (int) $group->first()->print_job_statuses_id);
            }

            foreach ($allJobs as $job) {
                $statusId = $statusHistory->get($job->id, 1);
                if (! in_array($statusId, [7, 8, 9], true)) {
                    $activeJobCount++;
                }
                if ($statusId === 7 || $statusId === 8) {
                    $completedJobs++;
                } elseif ($statusId === 4) {
                    $printingJobs++;
                } elseif ($statusId === 2) {
                    $designingJobs++;
                } else {
                    $pendingJobs++;
                }
            }

            $currentMonthJobs = PrintJob::whereYear('add_date', $currentYear)
                ->whereMonth('add_date', $currentMonth)
                ->count();
            $lastMonthJobs = PrintJob::whereYear('add_date', $lastMonthYear)
                ->whereMonth('add_date', $lastMonth)
                ->count();

            $dailyJobCounts = collect(range(6, 0))->map(function ($daysAgo) use ($now) {
                $date = (clone $now)->subDays($daysAgo)->toDateString();

                return PrintJob::whereDate('add_date', $date)->count();
            });

            $maxJobDaily = $dailyJobCounts->max();
            $jobsBars = $dailyJobCounts->map(function ($val) use ($maxJobDaily) {
                return $maxJobDaily > 0 ? max(10, min(100, (int) round(($val / $maxJobDaily) * 100))) : 0;
            })->values()->all();
        }

        $jobsTrend = $lastMonthJobs > 0
            ? round((($currentMonthJobs - $lastMonthJobs) / $lastMonthJobs) * 100, 1)
            : ($currentMonthJobs > 0 ? 100.0 : 0.0);
        $jobsTrendState = $jobsTrend >= 0 ? 'positive' : 'negative';

        // 3. Article 3: New Customers
        $totalCustomers = 0;
        $currentMonthCustomers = 0;
        $lastMonthCustomers = 0;
        $custBars = array_fill(0, 7, 0);

        if (Schema::hasTable('customer')) {
            $totalCustomers = Customer::count();
            $currentMonthCustomers = Customer::whereYear('register_at', $currentYear)
                ->whereMonth('register_at', $currentMonth)
                ->count();
            $lastMonthCustomers = Customer::whereYear('register_at', $lastMonthYear)
                ->whereMonth('register_at', $lastMonth)
                ->count();

            $dailyCustCounts = collect(range(6, 0))->map(function ($daysAgo) use ($now) {
                $date = (clone $now)->subDays($daysAgo)->toDateString();

                return Customer::whereDate('register_at', $date)->count();
            });

            $maxCustDaily = $dailyCustCounts->max();
            $custBars = $dailyCustCounts->map(function ($val) use ($maxCustDaily) {
                return $maxCustDaily > 0 ? max(10, min(100, (int) round(($val / $maxCustDaily) * 100))) : 0;
            })->values()->all();
        }

        $custTrend = $lastMonthCustomers > 0
            ? round((($currentMonthCustomers - $lastMonthCustomers) / $lastMonthCustomers) * 100, 1)
            : ($currentMonthCustomers > 0 ? 100.0 : 0.0);
        $custTrendState = $custTrend >= 0 ? 'positive' : 'negative';

        // 4. Article 4: Pending Invoices / Receivables
        $pendingInvoicesAmount = 0.0;
        $currentMonthPending = 0.0;
        $lastMonthPending = 0.0;
        $invoicesBars = array_fill(0, 7, 0);

        if (Schema::hasTable('payments')) {
            $pendingInvoicesAmount = (float) Payment::where('payment_statuses_id', 1)->sum('payment');
            $currentMonthPending = (float) Payment::where('payment_statuses_id', 1)
                ->whereYear('pay_date', $currentYear)
                ->whereMonth('pay_date', $currentMonth)
                ->sum('payment');
            $lastMonthPending = (float) Payment::where('payment_statuses_id', 1)
                ->whereYear('pay_date', $lastMonthYear)
                ->whereMonth('pay_date', $lastMonth)
                ->sum('payment');

            $dailyPendingSums = collect(range(6, 0))->map(function ($daysAgo) use ($now) {
                $date = (clone $now)->subDays($daysAgo)->toDateString();

                return (float) Payment::where('payment_statuses_id', 1)->whereDate('pay_date', $date)->sum('payment');
            });

            $maxInvDaily = $dailyPendingSums->max();
            $invoicesBars = $dailyPendingSums->map(function ($val) use ($maxInvDaily) {
                return $maxInvDaily > 0 ? max(10, min(100, (int) round(($val / $maxInvDaily) * 100))) : 0;
            })->values()->all();
        }

        $pendingTrend = $lastMonthPending > 0
            ? round((($currentMonthPending - $lastMonthPending) / $lastMonthPending) * 100, 1)
            : ($currentMonthPending > 0 ? 100.0 : 0.0);
        $pendingTrendState = $pendingTrend <= 0 ? 'positive' : 'negative';

        // 5. Monthly Revenue Trend (12 Months)
        $monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $monthlyRevenueValues = array_fill(0, 12, 0);

        if (Schema::hasTable('payments')) {
            $payments = Payment::whereYear('pay_date', $currentYear)->select('pay_date', 'payment')->get();
            foreach ($payments as $p) {
                if ($p->pay_date) {
                    $mIdx = (int) Carbon::parse($p->pay_date)->month - 1;
                    if ($mIdx >= 0 && $mIdx < 12) {
                        $monthlyRevenueValues[$mIdx] += (float) $p->payment;
                    }
                }
            }
            $monthlyRevenueValues = array_map(fn ($v) => round($v, 2), $monthlyRevenueValues);
        }

        return [
            'states' => [
                'articles' => [
                    'article1' => [
                        'value' => round($totalSales, 0),
                        'trendState' => $salesTrendState,
                        'trend' => abs($salesTrend),
                        'bars' => $salesBars,
                    ],
                    'article2' => [
                        'value' => $activeJobCount,
                        'trendState' => $jobsTrendState,
                        'trend' => abs($jobsTrend),
                        'bars' => $jobsBars,
                    ],
                    'article3' => [
                        'value' => $totalCustomers,
                        'trendState' => $custTrendState,
                        'trend' => abs($custTrend),
                        'bars' => $custBars,
                    ],
                    'article4' => [
                        'value' => round($pendingInvoicesAmount, 0),
                        'trendState' => $pendingTrendState,
                        'trend' => abs($pendingTrend),
                        'bars' => $invoicesBars,
                    ],
                ],
                'chartTitle' => $currentYear,
                'jobStatas' => [
                    'completed' => $completedJobs,
                    'printing' => $printingJobs,
                    'designing' => $designingJobs,
                    'pending' => $pendingJobs,
                ],
            ],
            'revenueTrend' => [
                'labels' => $monthLabels,
                'values' => $monthlyRevenueValues,
            ],
            'ordersBreakdown' => [
                'completed' => $completedJobs,
                'printing' => $printingJobs,
                'designing' => $designingJobs,
                'pending' => $pendingJobs,
                'values' => [$completedJobs, $printingJobs, $designingJobs, $pendingJobs],
            ],
        ];
    }

    /**
     * Resolve Slide 2: Sales & Revenue Analytics data and charts from real database records.
     *
     * @return array<string, mixed>
     */
    protected function resolveRevenueData(): array
    {
        $currentYear = (int) date('Y');
        $previousYear = $currentYear - 1;
        $monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        $currentYearData = array_fill(0, 12, 0);
        $previousYearData = array_fill(0, 12, 0);

        if (Schema::hasTable('payments')) {
            $currPayments = Payment::whereYear('pay_date', $currentYear)->select('pay_date', 'payment')->get();
            foreach ($currPayments as $p) {
                if ($p->pay_date) {
                    $idx = (int) Carbon::parse($p->pay_date)->month - 1;
                    if ($idx >= 0 && $idx < 12) {
                        $currentYearData[$idx] += (float) $p->payment;
                    }
                }
            }
            $currentYearData = array_map(fn ($v) => round($v, 2), $currentYearData);

            $prevPayments = Payment::whereYear('pay_date', $previousYear)->select('pay_date', 'payment')->get();
            foreach ($prevPayments as $p) {
                if ($p->pay_date) {
                    $idx = (int) Carbon::parse($p->pay_date)->month - 1;
                    if ($idx >= 0 && $idx < 12) {
                        $previousYearData[$idx] += (float) $p->payment;
                    }
                }
            }
            $previousYearData = array_map(fn ($v) => round($v, 2), $previousYearData);
        }

        // Payment Methods Breakdown from real database
        $methodLabels = [];
        $methodValues = [];

        if (Schema::hasTable('payment_types')) {
            $typeTotals = DB::table('payment_types as pt')
                ->leftJoin('payments as p', 'p.payment_types_id', '=', 'pt.id')
                ->select('pt.payment_type', DB::raw('COALESCE(SUM(p.payment), 0) as total'))
                ->groupBy('pt.id', 'pt.payment_type')
                ->orderBy('pt.id')
                ->pluck('total', 'payment_type');

            $methodLabels = $typeTotals->keys()->all();
            $methodValues = $typeTotals->values()->map(fn ($v) => round((float) $v, 2))->all();
        }

        if (empty($methodLabels)) {
            $methodLabels = ['No Payment Records'];
            $methodValues = [0];
        }

        $methodColors = [
            '#10b981', // Cash - Emerald Green
            '#2563eb', // Bank Transfer - Royal Blue
            '#8b5cf6', // Credit Card - Purple
            '#06b6d4', // Debit Card - Cyan
            '#f59e0b', // Cheque - Amber Orange
            '#ec4899', // Online / QR Payment - Hot Pink
            '#f97316', // Orange
            '#14b8a6', // Teal
        ];

        return [
            'states' => (object) [],
            'income' => [
                'labels' => $monthLabels,
                'currentYear' => $currentYear,
                'previousYear' => $previousYear,
                'currentYearData' => $currentYearData,
                'previousYearData' => $previousYearData,
            ],
            'paymentMethods' => [
                'labels' => $methodLabels,
                'values' => $methodValues,
                'colors' => array_slice($methodColors, 0, count($methodLabels)),
            ],
        ];
    }

    /**
     * Resolve Slide 3: Print Jobs & Production Flow from real database records.
     *
     * @return array<string, mixed>
     */
    protected function resolveJobsData(): array
    {
        $dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        $weeklyOutputValues = [0, 0, 0, 0, 0, 0, 0];
        $colors = ['#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

        if (Schema::hasTable('print_jobs')) {
            $jobs = PrintJob::select('add_date', 'qty')->get();

            foreach ($jobs as $job) {
                if ($job->add_date) {
                    $c = Carbon::parse($job->add_date);
                    // dayOfWeekIso: 1 for Monday to 7 for Sunday
                    $dayIndex = $c->dayOfWeekIso - 1;
                    if ($dayIndex >= 0 && $dayIndex < 7) {
                        $weeklyOutputValues[$dayIndex] += (int) ($job->qty ?: 1);
                    }
                }
            }
        }

        // Material / Print Type Usage Breakdown from real database
        $materialLabels = [];
        $materialValues = [];

        if (Schema::hasTable('print_types')) {
            $typeUsage = DB::table('print_types as pt')
                ->leftJoin('print_jobs as pj', 'pj.print_types_id', '=', 'pt.id')
                ->select('pt.print_type', DB::raw('COALESCE(SUM(pj.qty), 0) as total_qty'))
                ->groupBy('pt.id', 'pt.print_type')
                ->orderBy('pt.id')
                ->pluck('total_qty', 'print_type');

            $materialLabels = $typeUsage->keys()->all();
            $materialValues = $typeUsage->values()->map(fn ($v) => (int) $v)->all();
        }

        if (empty($materialLabels)) {
            $materialLabels = ['No Print Jobs'];
            $materialValues = [0];
        }

        $materialColors = [
            '#2563eb', // Flex Banner - Royal Blue
            '#10b981', // Sticker / Vinyl - Emerald Green
            '#8b5cf6', // Visiting Cards - Purple
            '#f59e0b', // Leaflets & Flyers - Amber Orange
            '#06b6d4', // Signage & Backlit - Cyan
            '#ec4899', // Custom Printing - Hot Pink
            '#f97316', // Coral Orange
            '#14b8a6', // Teal
            '#6366f1', // Indigo
            '#e11d48', // Crimson
        ];

        return [
            'states' => (object) [],
            'weeklyOutput' => [
                'labels' => $dayLabels,
                'values' => $weeklyOutputValues,
                'colors' => $colors,
            ],
            'materialUsage' => [
                'labels' => $materialLabels,
                'values' => $materialValues,
                'colors' => array_slice($materialColors, 0, count($materialLabels)),
            ],
        ];
    }

    /**
     * Resolve Slide 4: Stock & Inventory Management data and charts from real database records.
     *
     * @return array<string, mixed>
     */
    protected function resolveStockData(): array
    {
        $health = [];
        $levelsLabels = [];
        $levelsValues = [];
        $levelsOrdered = [];
        $levelsUnits = [];
        $palette = ['#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#2563eb', '#10b981'];

        if (Schema::hasTable('stock_items') && Schema::hasTable('stock')) {
            $hasUnits = Schema::hasTable('stock_units') && Schema::hasColumn('stock_items', 'stock_units_id');
            $hasPo = Schema::hasTable('purchase_order_items');

            $query = DB::table('stock_items as si')
                ->leftJoin('stock as s', 's.stock_items_id', '=', 'si.id');

            $selects = [
                'si.id',
                'si.name',
                'si.code',
                'si.low_stock_qty',
                'si.reorder_qty',
                DB::raw('COALESCE(SUM(s.qty), 0) as total_qty'),
            ];
            $groupBys = ['si.id', 'si.name', 'si.code', 'si.low_stock_qty', 'si.reorder_qty'];

            if ($hasUnits) {
                $query->leftJoin('stock_units as su', 'su.id', '=', 'si.stock_units_id');
                $selects[] = 'su.unit as unit_name';
                $selects[] = 'su.symble as unit_symbol';
                $groupBys[] = 'su.unit';
                $groupBys[] = 'su.symble';
            }

            if ($hasPo) {
                $selects[] = DB::raw('(SELECT COALESCE(SUM(poi.qty_ordered), 0) FROM purchase_order_items poi LEFT JOIN purchase_orders po ON po.id = poi.purchase_orders_id WHERE poi.stock_items_id = si.id AND (po.purchase_orders_status_id IS NULL OR po.purchase_orders_status_id != 4)) as total_ordered');
            }

            $items = $query->select($selects)
                ->groupBy($groupBys)
                ->orderBy('total_qty', 'asc')
                ->limit(6)
                ->get();

            $i = 0;
            foreach ($items as $item) {
                $qty = (int) $item->total_qty;
                $lowQty = (int) ($item->low_stock_qty ?: 10);
                $reorderQty = (int) ($item->reorder_qty ?: 20);
                $orderedQty = isset($item->total_ordered) ? (int) $item->total_ordered : 0;
                $unit = ($item->unit_name ?? null) ?: (($item->unit_symbol ?? null) ?: 'Units');

                // Visual progress percentage against reorder target
                if ($orderedQty > 0) {
                    $percentage = min(100, max(10, (int) round(($orderedQty / max(1, $reorderQty)) * 100)));
                    $statusText = "Ordered: {$orderedQty} {$unit}";
                    $color = $palette[$i % count($palette)];
                } else {
                    $percentage = 0;
                    $statusText = "Ordered: 0 {$unit}";
                    $color = '#ef4444'; // Red alert for un-ordered critical stock
                }

                $health[] = [
                    'name' => $item->name,
                    'value' => $statusText,
                    'ordered_qty' => $orderedQty,
                    'remaining_qty' => $qty,
                    'reorder_qty' => $reorderQty,
                    'unit' => $unit,
                    'percentage' => $percentage,
                    'color' => $color,
                ];

                $levelsLabels[] = $item->name;
                $levelsValues[] = $qty;
                $levelsOrdered[] = $orderedQty;
                $levelsUnits[] = $unit;
                $i++;
            }
        }

        if (empty($health)) {
            $health = [
                ['name' => 'No Stock Items', 'value' => 'Ordered: 0 Units', 'percentage' => 0, 'color' => '#94a3b8'],
            ];
            $levelsLabels = ['No Items'];
            $levelsValues = [0];
            $levelsOrdered = [0];
            $levelsUnits = ['Units'];
        }

        return [
            'states' => (object) [],
            'health' => $health,
            'levels' => [
                'labels' => $levelsLabels,
                'values' => $levelsValues,
                'ordered' => $levelsOrdered,
                'units' => $levelsUnits,
                'colors' => array_slice($palette, 0, count($levelsLabels)),
            ],
        ];
    }

    /**
     * Resolve Slide 5: Financial Summary & Margins from real database records.
     *
     * @return array<string, mixed>
     */
    protected function resolveFinanceData(): array
    {
        $currentYear = (int) date('Y');
        $monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $monthlyRevenue = array_fill(0, 12, 0);
        $monthlyExpenses = array_fill(0, 12, 0);

        $totalRevenue = 0.0;
        $totalExpenses = 0.0;
        $supplierPayablesAmount = 0.0;

        if (Schema::hasTable('payments')) {
            $totalRevenue = (float) Payment::sum('payment');

            $payments = Payment::whereYear('pay_date', $currentYear)->select('pay_date', 'payment')->get();
            foreach ($payments as $p) {
                if ($p->pay_date) {
                    $idx = (int) Carbon::parse($p->pay_date)->month - 1;
                    if ($idx >= 0 && $idx < 12) {
                        $monthlyRevenue[$idx] += (float) $p->payment;
                    }
                }
            }
            $monthlyRevenue = array_map(fn ($v) => round($v, 2), $monthlyRevenue);
        }

        if (Schema::hasTable('expencesess')) {
            $totalExpenses += (float) Expencesess::sum('price');
        }

        if (Schema::hasTable('grn_payments')) {
            $totalExpenses += (float) GrnPayment::sum('payment');
            $supplierPayablesAmount = (float) GrnPayment::where('payment_statuses_id', '!=', 2)->sum('payment');
        }

        // If direct expenses records are 0, sum stock inward acquisition costs
        if ($totalExpenses <= 0 && Schema::hasTable('stock')) {
            $totalExpenses = (float) DB::table('stock')->select(DB::raw('SUM(qty * buy) as total'))->value('total');

            $stocks = DB::table('stock')->whereYear('add_date', $currentYear)->select('add_date', 'qty', 'buy')->get();
            foreach ($stocks as $stk) {
                if ($stk->add_date) {
                    $idx = (int) Carbon::parse($stk->add_date)->month - 1;
                    if ($idx >= 0 && $idx < 12) {
                        $monthlyExpenses[$idx] += ((float) $stk->qty * (float) $stk->buy);
                    }
                }
            }
            $monthlyExpenses = array_map(fn ($v) => round($v, 2), $monthlyExpenses);
        }

        $netProfit = $totalRevenue - $totalExpenses;
        $profitMargin = $totalRevenue > 0
            ? round(($netProfit / $totalRevenue) * 100, 1)
            : 0.0;

        $formatCurrency = function (float $amount): string {
            if ($amount >= 1000000) {
                return 'Rs. '.round($amount / 1000000, 2).'M';
            }
            if ($amount >= 1000) {
                return 'Rs. '.number_format($amount, 0);
            }

            return 'Rs. '.number_format($amount, 2);
        };

        return [
            'states' => (object) [],
            'totalRevenue' => $formatCurrency($totalRevenue),
            'totalExpenses' => $formatCurrency($totalExpenses),
            'netProfit' => $formatCurrency($netProfit),
            'profitMargin' => $profitMargin,
            'supplierPayables' => $supplierPayablesAmount > 0 ? ('Rs. '.number_format($supplierPayablesAmount, 0).' Due') : 'Rs. 0 Due',
            'comparison' => [
                'labels' => $monthLabels,
                'revenue' => $monthlyRevenue,
                'expenses' => $monthlyExpenses,
            ],
        ];
    }

    /**
     * Format a message for Server-Sent Events (SSE).
     *
     * @param  array<string, mixed>  $data
     */
    public function formatEventStreamMessage(array $data, string $event = 'message', ?string $id = null): string
    {
        $id = $id ?? (string) round(microtime(true) * 1000);
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        return "id: {$id}\nevent: {$event}\ndata: {$json}\n\n";
    }
}
