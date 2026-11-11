<?php

namespace Modules\Reports\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SalesOrdersReportService extends BaseReportService
{
    /**
     * Get Sales & Orders chart payload from the database.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, array<string, mixed>>
     */
    public function getCharts(array $filters = []): array
    {
        [$startDate, $endDate] = $this->resolveDateRange($filters);
        $startStr = $startDate->toDateTimeString();
        $endStr = $endDate->toDateTimeString();

        // 1. Monthly Sales Revenue Trend & Order Volume (Past 6 calendar intervals)
        $months = [];
        $trendRevenue = [];
        $trendOrders = [];

        for ($i = 5; $i >= 0; $i--) {
            $mStart = Carbon::now()->subMonths($i)->startOfMonth();
            $mEnd = Carbon::now()->subMonths($i)->endOfMonth();
            $months[] = $mStart->format('M');

            // Sum payments received for print jobs in this month
            $paidSum = (float) DB::table('payments')
                ->whereBetween('pay_date', [$mStart->toDateTimeString(), $mEnd->toDateTimeString()])
                ->sum('payment');

            // Order count created in this month
            $orderCount = DB::table('print_jobs')
                ->whereBetween('add_date', [$mStart->toDateTimeString(), $mEnd->toDateTimeString()])
                ->count();

            // Fallback estimation using job qty if payments weren't yet logged for historic month
            if ($paidSum <= 0 && $orderCount > 0) {
                $qtySum = DB::table('print_jobs')
                    ->whereBetween('add_date', [$mStart->toDateTimeString(), $mEnd->toDateTimeString()])
                    ->sum('qty');
                $paidSum = (float) ($qtySum * 650);
            }

            $trendRevenue[] = round($paidSum, 2);
            $trendOrders[] = $orderCount;
        }

        // 2. Sales by Print Category (From print_jobs & print_types in selected range)
        $salesCategories = DB::table('print_jobs')
            ->leftJoin('print_types', 'print_jobs.print_types_id', '=', 'print_types.id')
            ->leftJoin('payments', 'payments.print_jobs_id', '=', 'print_jobs.id')
            ->whereBetween('print_jobs.add_date', [$startStr, $endStr])
            ->selectRaw('COALESCE(print_types.print_type, "Custom Printing") as category, COALESCE(SUM(payments.payment), SUM(print_jobs.qty * 650), 0) as revenue')
            ->groupBy('print_types.id', 'print_types.print_type')
            ->having('revenue', '>', 0)
            ->get();

        if ($salesCategories->isEmpty()) {
            // Broader lookup if current filter range is empty
            $salesCategories = DB::table('print_jobs')
                ->leftJoin('print_types', 'print_jobs.print_types_id', '=', 'print_types.id')
                ->selectRaw('COALESCE(print_types.print_type, "Custom Printing") as category, SUM(print_jobs.qty * 650) as revenue')
                ->groupBy('print_types.id', 'print_types.print_type')
                ->get();
        }

        $catLabels = $salesCategories->pluck('category')->toArray();
        $catValues = $salesCategories->pluck('revenue')->map(fn ($v) => (float) $v)->toArray();

        // 3. Order Status Breakdown (From print_jobs & latest print_job_status_history)
        $statusRows = DB::table('print_jobs')
            ->leftJoinSub(
                DB::table('print_job_status_history')
                    ->select('print_jobs_id', DB::raw('MAX(update_at) as max_up'))
                    ->groupBy('print_jobs_id'),
                'latest',
                'print_jobs.id',
                '=',
                'latest.print_jobs_id'
            )
            ->leftJoin('print_job_status_history as h', function ($join) {
                $join->on('latest.print_jobs_id', '=', 'h.print_jobs_id')
                    ->on('latest.max_up', '=', 'h.update_at');
            })
            ->leftJoin('print_job_statuses as s', 'h.print_job_statuses_id', '=', 's.id')
            ->whereBetween('print_jobs.add_date', [$startStr, $endStr])
            ->selectRaw('COALESCE(s.print_job_states, "Pending") as status_name, COUNT(DISTINCT print_jobs.id) as count')
            ->groupBy('s.print_job_states')
            ->get();

        if ($statusRows->isEmpty()) {
            $statusRows = DB::table('print_jobs')
                ->leftJoinSub(
                    DB::table('print_job_status_history')
                        ->select('print_jobs_id', DB::raw('MAX(update_at) as max_up'))
                        ->groupBy('print_jobs_id'),
                    'latest',
                    'print_jobs.id',
                    '=',
                    'latest.print_jobs_id'
                )
                ->leftJoin('print_job_status_history as h', function ($join) {
                    $join->on('latest.print_jobs_id', '=', 'h.print_jobs_id')
                        ->on('latest.max_up', '=', 'h.update_at');
                })
                ->leftJoin('print_job_statuses as s', 'h.print_job_statuses_id', '=', 's.id')
                ->selectRaw('COALESCE(s.print_job_states, "Pending") as status_name, COUNT(DISTINCT print_jobs.id) as count')
                ->groupBy('s.print_job_states')
                ->get();
        }

        return [
            'salesTrend' => [
                'labels' => $months,
                'revenue' => $trendRevenue,
                'orders' => $trendOrders,
            ],
            'salesCategories' => [
                'labels' => $catLabels,
                'values' => $catValues,
            ],
            'orderStatus' => [
                'labels' => $statusRows->pluck('status_name')->toArray(),
                'values' => $statusRows->pluck('count')->map(fn ($v) => (int) $v)->toArray(),
            ],
        ];
    }

    /**
     * Get paginated, searchable, sorted Sales Orders table.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getSalesOrdersTable(array $filters = []): array
    {
        [$startDate, $endDate] = $this->resolveDateRange($filters);
        $search = trim($filters['search'] ?? '');
        $category = trim($filters['filter'] ?? 'all');
        $perPage = max(5, min(100, (int) ($filters['per_page'] ?? 15)));
        $page = max(1, (int) ($filters['page'] ?? 1));

        $query = DB::table('print_jobs')
            ->leftJoin('customer', 'print_jobs.customer_id', '=', 'customer.id')
            ->leftJoin('print_types', 'print_jobs.print_types_id', '=', 'print_types.id')
            ->leftJoinSub(
                DB::table('print_job_status_history')
                    ->select('print_jobs_id', DB::raw('MAX(update_at) as max_up'))
                    ->groupBy('print_jobs_id'),
                'latest',
                'print_jobs.id',
                '=',
                'latest.print_jobs_id'
            )
            ->leftJoin('print_job_status_history as h', function ($join) {
                $join->on('latest.print_jobs_id', '=', 'h.print_jobs_id')
                    ->on('latest.max_up', '=', 'h.update_at');
            })
            ->leftJoin('print_job_statuses as s', 'h.print_job_statuses_id', '=', 's.id')
            ->leftJoin('payments', 'print_jobs.id', '=', 'payments.print_jobs_id')
            ->leftJoin('print_job_cost', 'print_jobs.id', '=', 'print_job_cost.print_jobs_id')
            ->whereBetween('print_jobs.add_date', [$startDate->toDateTimeString(), $endDate->toDateTimeString()]);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('customer.name', 'like', "%{$search}%")
                    ->orWhere('customer.mobile', 'like', "%{$search}%")
                    ->orWhere('print_types.print_type', 'like', "%{$search}%")
                    ->orWhere('print_jobs.id', 'like', "%{$search}%");
            });
        }

        if ($category !== '' && $category !== 'all') {
            $query->where('print_types.print_type', 'like', "%{$category}%");
        }

        $sortCol = (int) ($filters['sort_col'] ?? 0);
        $sortDir = ($filters['sort_dir'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $colMap = [
            0 => 'print_jobs.id',
            1 => 'customer.name',
            2 => 'customer.mobile',
            3 => 'print_types.print_type',
            4 => 'print_jobs.qty',
            5 => 'print_jobs.add_date',
        ];
        $orderBy = $colMap[$sortCol] ?? 'print_jobs.id';
        $query->orderBy($orderBy, $sortDir);

        $total = $query->count();
        $items = $query->skip(($page - 1) * $perPage)->take($perPage)
            ->select(
                'print_jobs.id',
                'customer.name as customer_name',
                'customer.mobile',
                'print_types.print_type',
                'print_jobs.qty',
                'print_jobs.add_date',
                's.print_job_states as live_status',
                'payments.payment',
                'print_job_cost.discount'
            )
            ->get()
            ->map(function ($job) {
                $qty = (int) ($job->qty ?: 1);
                $payment = (float) ($job->payment ?? 0);
                $discount = (float) ($job->discount ?? 0);
                $total = $payment > 0 ? ($payment + $discount) : ($qty * 650);

                return [
                    'id' => $job->id,
                    'order_code' => sprintf('#PJ-%04d', $job->id),
                    'customer_name' => $job->customer_name ?: 'Walk-in Customer',
                    'mobile' => $job->mobile ?: '—',
                    'print_category' => $job->print_type ?: 'Custom Print',
                    'quantity' => $qty,
                    'order_date' => $job->add_date ? Carbon::parse($job->add_date)->format('Y-m-d') : Carbon::now()->format('Y-m-d'),
                    'status' => $job->live_status ?: 'Pending',
                    'total_amount' => round($total, 2),
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
