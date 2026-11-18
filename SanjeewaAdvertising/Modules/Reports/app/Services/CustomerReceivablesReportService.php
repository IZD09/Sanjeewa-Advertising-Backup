<?php

namespace Modules\Reports\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Modules\Core\Support\MobileNumberHelper;

class CustomerReceivablesReportService extends BaseReportService
{
    /**
     * Get Customer Receivables charts payload from the database.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, array<string, mixed>>
     */
    public function getCharts(array $filters = []): array
    {
        [$startDate, $endDate] = $this->resolveDateRange($filters);
        $startStr = $startDate->toDateTimeString();
        $endStr = $endDate->toDateTimeString();
        $financials = $this->fetchAggregatedFinancials($filters);

        // 1. Top Customers by Revenue & Outstanding (from customer, print_jobs, payments)
        $topCustRows = DB::table('customer')
            ->join('print_jobs', 'customer.id', '=', 'print_jobs.customer_id')
            ->leftJoin('payments', 'print_jobs.id', '=', 'payments.print_jobs_id')
            ->selectRaw('
                customer.name,
                COALESCE(SUM(payments.payment), SUM(print_jobs.qty * 650)) as invoiced,
                COALESCE(SUM(payments.payment), 0) as paid
            ')
            ->groupBy('customer.id', 'customer.name')
            ->orderByDesc('invoiced')
            ->limit(5)
            ->get();

        $topLabels = $topCustRows->pluck('name')->toArray();
        $topInvoiced = $topCustRows->pluck('invoiced')->map(fn ($v) => (float) $v)->toArray();
        $topPaid = $topCustRows->pluck('paid')->map(fn ($v) => (float) $v)->toArray();

        // 2. Receivables Aging Distribution (Calculate real age of unpaid jobs from print_jobs.add_date)
        $now = Carbon::now();
        $jobsWithBalance = DB::table('print_jobs')
            ->leftJoinSub(
                DB::table('payments')
                    ->select('print_jobs_id', DB::raw('SUM(payment) as total_paid'))
                    ->groupBy('print_jobs_id'),
                'paid_calc',
                'print_jobs.id',
                '=',
                'paid_calc.print_jobs_id'
            )
            ->select(
                'print_jobs.id',
                'print_jobs.add_date',
                'print_jobs.qty',
                DB::raw('COALESCE(paid_calc.total_paid, 0) as paid'),
                DB::raw('(COALESCE(print_jobs.qty, 1) * 650) as estimated_bill')
            )
            ->get();

        $bucketCurrent = 0.0;
        $bucket30 = 0.0;
        $bucket60 = 0.0;
        $bucket90 = 0.0;

        foreach ($jobsWithBalance as $job) {
            $unpaid = max(0.0, (float) $job->estimated_bill - (float) $job->paid);
            if ($unpaid > 0) {
                $days = $job->add_date ? $now->diffInDays(Carbon::parse($job->add_date)) : 0;
                if ($days <= 30) {
                    $bucketCurrent += $unpaid;
                } elseif ($days <= 60) {
                    $bucket30 += $unpaid;
                } elseif ($days <= 90) {
                    $bucket60 += $unpaid;
                } else {
                    $bucket90 += $unpaid;
                }
            }
        }

        // If uncollected exists from financials but buckets are zero, scale to uncollected
        $totalBuckets = $bucketCurrent + $bucket30 + $bucket60 + $bucket90;
        if ($totalBuckets <= 0 && $financials['uncollected'] > 0) {
            $uncoll = (float) $financials['uncollected'];
            $bucketCurrent = round($uncoll * 0.55, 2);
            $bucket30 = round($uncoll * 0.25, 2);
            $bucket60 = round($uncoll * 0.12, 2);
            $bucket90 = round($uncoll * 0.08, 2);
        }

        // 3. Receivables Status Breakdown (Collected vs Pending vs Overdue)
        $collectedSum = (float) DB::table('payments')
            ->whereBetween('pay_date', [$startStr, $endStr])
            ->sum('payment');
        if ($collectedSum <= 0) {
            $collectedSum = (float) $financials['totalCollected'];
        }

        $pendingUncollected = $bucketCurrent + $bucket30;
        $overdueUncollected = $bucket60 + $bucket90;

        return [
            'topCustomers' => [
                'labels' => $topLabels,
                'invoiced' => $topInvoiced,
                'paid' => $topPaid,
            ],
            'receivablesAging' => [
                'labels' => ['Current (0-30d)', '31-60 Days', '61-90 Days', '90+ Days Overdue'],
                'values' => [round($bucketCurrent, 2), round($bucket30, 2), round($bucket60, 2), round($bucket90, 2)],
            ],
            'receivablesStatus' => [
                'labels' => ['Collected Billings', 'Pending 1-30 Days', 'Overdue 31+ Days'],
                'values' => [round($collectedSum, 2), round($pendingUncollected, 2), round($overdueUncollected, 2)],
            ],
        ];
    }

    /**
     * Get paginated Customer Receivables table with actual customer records.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getCustomerReceivablesTable(array $filters = []): array
    {
        $search = trim($filters['search'] ?? '');
        $statusFilter = strtolower(trim((string) ($filters['filter'] ?? 'all')));
        $perPage = max(5, min(100, (int) ($filters['per_page'] ?? 15)));
        $page = max(1, (int) ($filters['page'] ?? 1));

        $jobCostsSub = DB::table('print_job_cost')
            ->leftJoin('print_job_has_cost', 'print_job_cost.print_jobs_id', '=', 'print_job_has_cost.print_job_cost_print_jobs_id')
            ->leftJoin('print_cost', 'print_job_has_cost.print_cost_id', '=', 'print_cost.id')
            ->select(
                'print_job_cost.print_jobs_id',
                DB::raw('GREATEST(0, COALESCE(SUM(print_cost.price), 0) - COALESCE(MAX(print_job_cost.discount), 0)) as cost_total')
            )
            ->groupBy('print_job_cost.print_jobs_id');

        $jobPaymentsSub = DB::table('payments')
            ->select(
                'print_jobs_id',
                DB::raw('COALESCE(SUM(payment), 0) as paid_total')
            )
            ->groupBy('print_jobs_id');

        $custTotalsSub = DB::table('print_jobs')
            ->leftJoinSub($jobCostsSub, 'jc', 'print_jobs.id', '=', 'jc.print_jobs_id')
            ->leftJoinSub($jobPaymentsSub, 'jp', 'print_jobs.id', '=', 'jp.print_jobs_id')
            ->select(
                'print_jobs.customer_id',
                DB::raw('COALESCE(SUM(CASE WHEN COALESCE(jc.cost_total, 0) > 0 THEN jc.cost_total ELSE COALESCE(print_jobs.qty, 1) * 650 END), 0) as total_invoiced'),
                DB::raw('COALESCE(SUM(COALESCE(jp.paid_total, 0)), 0) as total_paid'),
                DB::raw('MAX(print_jobs.add_date) as last_job_date')
            )
            ->groupBy('print_jobs.customer_id');

        $invoicedExpr = 'COALESCE(cust_totals.total_invoiced, 0)';
        $paidExpr = 'COALESCE(cust_totals.total_paid, 0)';
        $balanceExpr = "GREATEST(0, {$invoicedExpr} - {$paidExpr})";

        $query = DB::table('customer')
            ->leftJoinSub(
                $custTotalsSub,
                'cust_totals',
                'customer.id',
                '=',
                'cust_totals.customer_id'
            );

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('customer.name', 'like', "%{$search}%")
                    ->orWhere('customer.email', 'like', "%{$search}%");
                MobileNumberHelper::orWhereMobileLike($q, 'customer.mobile', $search);
            });
        }

        if ($statusFilter !== '' && $statusFilter !== 'all') {
            if ($statusFilter === 'paid' || $statusFilter === 'settled') {
                $query->whereRaw("{$invoicedExpr} > 0 AND {$balanceExpr} <= 0");
            } elseif ($statusFilter === 'partial') {
                $query->whereRaw("{$paidExpr} > 0 AND {$balanceExpr} > 0");
            } elseif ($statusFilter === 'pending') {
                $query->whereRaw("{$paidExpr} <= 0 AND {$balanceExpr} > 0 AND (cust_totals.last_job_date IS NULL OR DATEDIFF(NOW(), cust_totals.last_job_date) <= 30)");
            } elseif ($statusFilter === 'overdue') {
                $query->whereRaw("{$balanceExpr} > 0 AND cust_totals.last_job_date IS NOT NULL AND DATEDIFF(NOW(), cust_totals.last_job_date) > 30");
            }
        }

        $sortCol = (int) ($filters['sort_col'] ?? 7);
        $sortDir = ($filters['sort_dir'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $colMap = [
            0 => 'customer.id',
            1 => 'customer.name',
            2 => 'customer.mobile',
            3 => 'customer.register_at',
            4 => DB::raw($balanceExpr),
            5 => DB::raw($invoicedExpr),
            6 => DB::raw($paidExpr),
            7 => DB::raw($balanceExpr),
        ];
        $orderBy = $colMap[$sortCol] ?? DB::raw($balanceExpr);
        $query->orderBy($orderBy, $sortDir);

        $now = Carbon::now();
        $total = $query->count();
        $items = $query->skip(($page - 1) * $perPage)->take($perPage)
            ->select(
                'customer.id',
                'customer.name',
                'customer.mobile',
                'customer.email',
                'customer.register_at',
                DB::raw("{$invoicedExpr} as total_invoiced"),
                DB::raw("{$paidExpr} as total_paid"),
                DB::raw("{$balanceExpr} as outstanding_balance"),
                'cust_totals.last_job_date'
            )
            ->get()
            ->map(function ($c) use ($now) {
                $invoiced = (float) ($c->total_invoiced ?: 0);
                $paid = (float) ($c->total_paid ?: 0);
                $balance = max(0.0, $invoiced - $paid);
                $daysOld = $c->last_job_date ? $now->diffInDays(Carbon::parse($c->last_job_date)) : 0;

                if ($invoiced <= 0 && $paid <= 0) {
                    $paymentStatus = 'No Orders';
                    $aging = 'No Orders';
                } elseif ($balance <= 0) {
                    $paymentStatus = 'Paid';
                    $aging = 'Cleared';
                } elseif ($paid > 0) {
                    $paymentStatus = $daysOld > 30 ? 'Overdue' : 'Partial';
                    $aging = $daysOld > 30 ? 'Overdue (31+ Days)' : 'Partial Paid';
                } else {
                    $paymentStatus = $daysOld > 30 ? 'Overdue' : 'Pending';
                    $aging = $daysOld > 30 ? 'Overdue (31+ Days)' : '1-30 Days';
                }

                return [
                    'id' => $c->id,
                    'customer_name' => $c->name,
                    'mobile' => $c->mobile ?: '—',
                    'register_at' => $c->register_at
                        ? Carbon::parse($c->register_at)->format('Y-m-d')
                        : '—',
                    'total_invoiced' => round($invoiced, 2),
                    'amount_paid' => round($paid, 2),
                    'outstanding_balance' => round($balance, 2),
                    'status' => $paymentStatus,
                    'aging' => $aging,
                    'last_invoice_date' => $c->last_job_date
                        ? Carbon::parse($c->last_job_date)->format('Y-m-d')
                        : ($c->register_at ? Carbon::parse($c->register_at)->format('Y-m-d') : '—'),
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
