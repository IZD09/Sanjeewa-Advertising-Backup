<?php

namespace Modules\UI\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Modules\Customer\Models\Customer;
use Modules\Inventory\Models\Stock;
use Modules\PrintJob\Models\PrintJob;
use Modules\Transaction\Models\Expencesess;
use Modules\Transaction\Models\GrnPayment;
use Modules\Transaction\Models\Payment;

class DashboardService
{
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
        $colors = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
        $palette = ['#ef4444', '#f59e0b', '#8b5cf6', '#0ea5e9', '#2563eb', '#10b981'];

        if (Schema::hasTable('stock_items') && Schema::hasTable('stock')) {
            // Aggregate remaining stock by stock item
            $items = DB::table('stock_items as si')
                ->leftJoin('stock as s', 's.stock_items_id', '=', 'si.id')
                ->select(
                    'si.id',
                    'si.name',
                    'si.code',
                    'si.low_stock_qty',
                    'si.reorder_qty',
                    DB::raw('COALESCE(SUM(s.qty), 0) as total_qty')
                )
                ->groupBy('si.id', 'si.name', 'si.code', 'si.low_stock_qty', 'si.reorder_qty')
                ->orderBy('total_qty', 'asc')
                ->limit(6)
                ->get();

            $i = 0;
            foreach ($items as $item) {
                $qty = (int) $item->total_qty;
                $lowQty = (int) ($item->low_stock_qty ?: 10);
                $reorderQty = (int) ($item->reorder_qty ?: 20);

                $percentage = min(100, max(5, (int) round(($qty / max(1, $reorderQty)) * 100)));

                if ($qty <= $lowQty) {
                    $color = '#ef4444'; // Red (Critical)
                    $statusText = $qty === 0 ? 'Out of Stock' : "Low Stock: {$qty} Units";
                } elseif ($qty <= $reorderQty) {
                    $color = '#f59e0b'; // Amber (Reorder Alert)
                    $statusText = "Stock: {$qty} Units";
                } else {
                    $color = $palette[$i % count($palette)];
                    $statusText = "Stock: {$qty} Units";
                }

                $health[] = [
                    'name' => $item->name,
                    'value' => $statusText,
                    'percentage' => $percentage,
                    'color' => $color,
                ];

                $levelsLabels[] = $item->name;
                $levelsValues[] = $qty;
                $i++;
            }
        }

        if (empty($health)) {
            $health = [
                ['name' => 'No Stock Items', 'value' => '0 Units', 'percentage' => 0, 'color' => '#94a3b8'],
            ];
            $levelsLabels = ['No Items'];
            $levelsValues = [0];
        }

        return [
            'states' => (object) [],
            'health' => $health,
            'levels' => [
                'labels' => $levelsLabels,
                'values' => $levelsValues,
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
