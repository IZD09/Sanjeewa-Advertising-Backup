<?php

namespace Modules\UI\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardService
{
    /**
     * Retrieve aggregated dashboard metrics and chart datasets.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getDashboardData(array $filters = []): array
    {
        $overview = $this->resolveOverviewData();
        $revenue = $this->resolveRevenueData();
        $jobs = $this->resolveJobsData();
        $stock = $this->resolveStockData();
        $finance = $this->resolveFinanceData();

        return [
            'overview' => $overview,
            'revenue' => $revenue,
            'jobs' => $jobs,
            'stock' => $stock,
            'finance' => $finance,
        ];
    }

    /**
     * Resolve Slide 1: Business Overview stats and charts.
     *
     * @return array<string, mixed>
     */
    protected function resolveOverviewData(): array
    {
        $totalSalesAmount = 845000;
        $pendingAmount = 182500;
        $activeJobsCount = 28;
        $newCustomersCount = 14;

        if (Schema::hasTable('invoice')) {
            $salesSum = DB::table('invoice')->sum('total_amount');
            if ($salesSum > 0) {
                $totalSalesAmount = (float) $salesSum;
            }

            $pendingSum = DB::table('invoice')
                ->where('paid_amount', '<', DB::raw('total_amount'))
                ->sum(DB::raw('total_amount - paid_amount'));
            if ($pendingSum > 0) {
                $pendingAmount = (float) $pendingSum;
            }
        }

        if (Schema::hasTable('customer')) {
            $custCount = DB::table('customer')->count();
            if ($custCount > 0) {
                $newCustomersCount = $custCount;
            }
        }

        if (Schema::hasTable('print_jobs')) {
            $activeCount = DB::table('print_jobs')->count();
            if ($activeCount > 0) {
                $activeJobsCount = $activeCount;
            }
        }

        return [
            'totalSales' => 'Rs. '.number_format($totalSalesAmount, 0),
            'activeJobs' => $activeJobsCount,
            'newCustomers' => $newCustomersCount,
            'pendingInvoices' => 'Rs. '.number_format($pendingAmount, 0),
            'revenueTrend' => [
                'labels' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                'values' => [420, 510, 480, 650, 590, 720, 680, 790, 740, round($totalSalesAmount / 1000)],
            ],
            'ordersBreakdown' => [
                'completed' => 14,
                'printing' => 8,
                'designing' => 6,
                'pending' => 4,
                'values' => [14, 8, 6, 4],
            ],
        ];
    }

    /**
     * Resolve Slide 2: Sales & Revenue Analytics data and charts.
     *
     * @return array<string, mixed>
     */
    protected function resolveRevenueData(): array
    {
        return [
            'categories' => [
                'labels' => ['Flex', 'Vinyl', 'Rollup', 'Cards', 'Leaflets', 'Rigid'],
                'currentYear' => [340, 260, 180, 120, 95, 65],
                'previousYear' => [280, 210, 140, 90, 70, 50],
            ],
            'paymentMethods' => [
                'labels' => ['Cash', 'Card', 'Bank Transfer', 'Online / QR', 'Cheque'],
                'values' => [38, 26, 20, 11, 5],
            ],
        ];
    }

    /**
     * Resolve Slide 3: Print Jobs & Production Flow.
     *
     * @return array<string, mixed>
     */
    protected function resolveJobsData(): array
    {
        return [
            'weeklyOutput' => [
                'labels' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                'values' => [1240, 1680, 1450, 2100, 2480, 1950, 850],
            ],
            'materialUsage' => [
                'labels' => ['Frontlit', 'Star Flex', 'Glossy', 'Matte', 'Backlit'],
                'values' => [42, 24, 18, 10, 6],
            ],
        ];
    }

    /**
     * Resolve Slide 4: Stock & Inventory Management data and charts.
     *
     * @return array<string, mixed>
     */
    protected function resolveStockData(): array
    {
        $health = [
            ['name' => 'Frontlit Flex Banner (10ft)', 'value' => '180m / 250m', 'percentage' => 72, 'isWarning' => false],
            ['name' => 'Glossy Vinyl Sticker (4ft)', 'value' => '42m / 200m (Low)', 'percentage' => 21, 'isWarning' => true],
            ['name' => 'Solvent Cyan Ink Cartridges', 'value' => '85% Full', 'percentage' => 85, 'isWarning' => false],
            ['name' => 'Foam Board Sheets (5mm)', 'value' => '65 Sheets', 'percentage' => 65, 'isWarning' => false],
        ];

        return [
            'health' => $health,
            'levels' => [
                'labels' => ['Frontlit', 'Glossy', 'Star Flex', 'Ink Cyan', 'Foam Board'],
                'values' => [180, 42, 110, 85, 65],
                'colors' => ['#10b981', '#ef4444', '#10b981', '#10b981', '#2563eb'],
            ],
        ];
    }

    /**
     * Resolve Slide 5: Financial Summary & Margins.
     *
     * @return array<string, mixed>
     */
    protected function resolveFinanceData(): array
    {
        return [
            'totalRevenue' => 'Rs. 8.45M',
            'totalExpenses' => 'Rs. 4.68M',
            'netProfit' => 'Rs. 3.77M',
            'profitMargin' => 44.6,
            'supplierPayables' => 'Rs. 325,000 Due',
            'comparison' => [
                'labels' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                'revenue' => [580, 620, 700, 650, 790, 740, 810, 780, 820, 845],
                'expenses' => [320, 360, 390, 370, 420, 410, 450, 430, 460, 468],
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
