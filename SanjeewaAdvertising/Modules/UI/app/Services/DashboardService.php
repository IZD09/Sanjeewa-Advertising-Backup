<?php

namespace Modules\UI\Services;

class DashboardService
{
    /**
     * Retrieve aggregated dashboard metrics and chart datasets.
     * Note: Database queries are disabled; mock dummy data is returned.
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
     * Resolve Slide 1: Business Overview stats and charts (Dummy Data).
     *
     * @return array<string, mixed>
     */
    protected function resolveOverviewData(): array
    {
        return [
            'states' => [
                'articles' => [
                    'article1' => [
                        'value' => 845000,
                        'trendState' => 'positive',
                        'trend' => 12.8,
                        'bars' => [30, 45, 35, 62, 50, 78, 95],
                    ],
                    'article2' => [
                        'value' => 14,
                        'trendState' => 'positive',
                        'trend' => 8.4,
                        'bars' => [35, 50, 40, 68, 55, 80, 95],
                    ],
                    'article3' => [
                        'value' => 14,
                        'trendState' => 'positive',
                        'trend' => 4.2,
                        'bars' => [25, 40, 30, 55, 45, 70, 88],
                    ],
                    'article4' => [
                        'value' => 182500,
                        'trendState' => 'negative',
                        'trend' => 3.1,
                        'bars' => [40, 55, 48, 70, 60, 82, 90],
                    ],
                ],
                'chartTitle' => 2026,
                'jobStatas' => [
                    'completed' => 14,
                    'printing' => 8,
                    'designing' => 6,
                    'pending' => 4,
                ],
            ],
            'revenueTrend' => [
                'labels' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                'values' => [420, 510, 480, 650, 590, 720, 680, 790, 740, 845],
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
     * Resolve Slide 2: Sales & Revenue Analytics data and charts (Dummy Data).
     *
     * @return array<string, mixed>
     */
    protected function resolveRevenueData(): array
    {
        return [
            'states' => (object) [],
            'income' => [
                'labels' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                'currentYear' => 2026,
                'previousYear' => 2025,
                'currentYearData' => [65, 70, 30, 65, 20, 30, 64, 80, 50, 90],
                'previousYearData' => [30, 45, 80, 40, 50, 75, 10, 55, 35, 60, 50, 65],
            ],
            'paymentMethods' => [
                'labels' => ['Cash', 'Card', 'Bank Transfer', 'Online / QR', 'Cheque'],
                'values' => [38, 26, 20, 11, 5],
            ],
        ];
    }

    /**
     * Resolve Slide 3: Print Jobs & Production Flow (Dummy Data).
     *
     * @return array<string, mixed>
     */
    protected function resolveJobsData(): array
    {
        return [
            'states' => (object) [],
            'weeklyOutput' => [
                'labels' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                'values' => [1240, 1680, 1450, 2100, 2480, 1950, 850],
                'colors' => ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
            ],
            'materialUsage' => [
                'labels' => ['Frontlit', 'Star Flex', 'Glossy', 'Matte', 'Backlit'],
                'values' => [42, 24, 18, 10, 6],
            ],
        ];
    }

    /**
     * Resolve Slide 4: Stock & Inventory Management data and charts (Dummy Data).
     *
     * @return array<string, mixed>
     */
    protected function resolveStockData(): array
    {
        return [
            'states' => (object) [],
            'health' => [
                ['name' => 'Glossy Vinyl Sticker (4ft)', 'value' => 'Ordered: 200m', 'percentage' => 75, 'color' => '#ef4444'],
                ['name' => 'Cyan Solvent Ink', 'value' => 'Ordered: 40 Units', 'percentage' => 65, 'color' => '#f59e0b'],
                ['name' => 'Frontlit Flex Banner (10ft)', 'value' => 'Ordered: 300m', 'percentage' => 85, 'color' => '#8b5cf6'],
                ['name' => 'Star Flex Banner (380gsm)', 'value' => 'Ordered: 150m', 'percentage' => 50, 'color' => '#0ea5e9'],
                ['name' => 'Foam Board Sheets (5mm)', 'value' => 'Ordered: 100 Sheets', 'percentage' => 70, 'color' => '#2563eb'],
            ],
            'levels' => [
                'labels' => ['Glossy Vinyl (4ft)', 'Cyan Solvent Ink', 'Frontlit Flex (10ft)', 'Star Flex Banner', 'Foam Board (5mm)'],
                'values' => [18, 6, 35, 42, 20],
                'colors' => ['#ef4444', '#f59e0b', '#8b5cf6', '#0ea5e9', '#2563eb'],
            ],
        ];
    }

    /**
     * Resolve Slide 5: Financial Summary & Margins (Dummy Data).
     *
     * @return array<string, mixed>
     */
    protected function resolveFinanceData(): array
    {
        return [
            'states' => (object) [],
            'totalRevenue' => 'Rs. 8.45M',
            'totalExpenses' => 'Rs. 4.68M',
            'netProfit' => 'Rs. 3.77M',
            'profitMargin' => 44.6,
            'supplierPayables' => 'Rs. 325,000 Due',
            'comparison' => [
                'labels' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
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
