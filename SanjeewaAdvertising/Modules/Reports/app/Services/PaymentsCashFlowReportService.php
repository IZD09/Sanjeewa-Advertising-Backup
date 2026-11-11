<?php

namespace Modules\Reports\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PaymentsCashFlowReportService extends BaseReportService
{
    /**
     * Get Payments & Cash Flow charts payload from the database.
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

        // 1. Operating Expenses by Category (from expencesess & expencesess_types)
        $expensesRows = DB::table('expencesess')
            ->leftJoin('expencesess_types', 'expencesess.expencesess_types_id', '=', 'expencesess_types.id')
            ->whereBetween('expencesess.add_date', [$startStr, $endStr])
            ->selectRaw('COALESCE(expencesess_types.expencesess_type, "General Overhead") as exp_type, SUM(expencesess.price) as total_price')
            ->groupBy('expencesess_types.id', 'expencesess_types.expencesess_type')
            ->get();

        if ($expensesRows->isEmpty()) {
            $expensesRows = DB::table('expencesess')
                ->leftJoin('expencesess_types', 'expencesess.expencesess_types_id', '=', 'expencesess_types.id')
                ->selectRaw('COALESCE(expencesess_types.expencesess_type, "General Overhead") as exp_type, SUM(expencesess.price) as total_price')
                ->groupBy('expencesess_types.id', 'expencesess_types.expencesess_type')
                ->get();
        }

        $expLabels = $expensesRows->pluck('exp_type')->toArray();
        $expValues = $expensesRows->pluck('total_price')->map(fn ($v) => (float) $v)->toArray();

        // 2. Operating Expenses by Status (Paid vs Pending/Approved/Overdue)
        $expStatusRows = DB::table('expencesess')
            ->leftJoin('expencesess_statuses', 'expencesess.expencesess_statuses_id', '=', 'expencesess_statuses.id')
            ->whereBetween('expencesess.add_date', [$startStr, $endStr])
            ->selectRaw('COALESCE(expencesess_statuses.expencesess_status, "Pending") as status_name, SUM(expencesess.price) as total_price')
            ->groupBy('expencesess_statuses.id', 'expencesess_statuses.expencesess_status')
            ->get();

        if ($expStatusRows->isEmpty()) {
            $expStatusRows = DB::table('expencesess')
                ->leftJoin('expencesess_statuses', 'expencesess.expencesess_statuses_id', '=', 'expencesess_statuses.id')
                ->selectRaw('COALESCE(expencesess_statuses.expencesess_status, "Pending") as status_name, SUM(expencesess.price) as total_price')
                ->groupBy('expencesess_statuses.id', 'expencesess_statuses.expencesess_status')
                ->get();
        }

        // 3. Payment Methods Distribution (from payments & payment_types)
        $paymentMethodsRows = DB::table('payments')
            ->leftJoin('payment_types', 'payments.payment_types_id', '=', 'payment_types.id')
            ->whereBetween('payments.pay_date', [$startStr, $endStr])
            ->selectRaw('COALESCE(payment_types.payment_type, "Cash") as method, SUM(payments.payment) as total_amount')
            ->groupBy('payment_types.id', 'payment_types.payment_type')
            ->get();

        if ($paymentMethodsRows->isEmpty()) {
            $paymentMethodsRows = DB::table('payments')
                ->leftJoin('payment_types', 'payments.payment_types_id', '=', 'payment_types.id')
                ->selectRaw('COALESCE(payment_types.payment_type, "Cash") as method, SUM(payments.payment) as total_amount')
                ->groupBy('payment_types.id', 'payment_types.payment_type')
                ->get();
        }

        // 4. Cash Flow Intervals (Break date range into 4 equal sub-intervals from DB)
        $diffSeconds = max(1, $endDate->diffInSeconds($startDate));
        $intervalSec = (int) floor($diffSeconds / 4);

        $flowLabels = [];
        $flowInflow = [];
        $flowGrnOutflow = [];
        $flowExpOutflow = [];
        $flowTotalOutflow = [];
        $flowNet = [];

        for ($i = 0; $i < 4; $i++) {
            $subStart = $startDate->copy()->addSeconds($i * $intervalSec);
            $subEnd = ($i === 3) ? $endDate->copy() : $startDate->copy()->addSeconds(($i + 1) * $intervalSec);

            $flowLabels[] = 'Period '.($i + 1).' ('.$subStart->format('d M').')';

            $in = (float) DB::table('payments')
                ->whereBetween('pay_date', [$subStart->toDateTimeString(), $subEnd->toDateTimeString()])
                ->sum('payment');

            $grn = (float) DB::table('grn_payments')
                ->whereBetween('pay_date', [$subStart->toDateTimeString(), $subEnd->toDateTimeString()])
                ->sum('payment');

            $exp = (float) DB::table('expencesess')
                ->whereBetween('add_date', [$subStart->toDateTimeString(), $subEnd->toDateTimeString()])
                ->sum('price');

            $totalOut = $grn + $exp;
            $net = $in - $totalOut;

            $flowInflow[] = round($in, 2);
            $flowGrnOutflow[] = round($grn, 2);
            $flowExpOutflow[] = round($exp, 2);
            $flowTotalOutflow[] = round($totalOut, 2);
            $flowNet[] = round($net, 2);
        }

        // 5. Channel Distribution (Customer Inflows, GRN Outflows, Operating Expenses)
        $totalCollected = (float) DB::table('payments')
            ->whereBetween('pay_date', [$startStr, $endStr])
            ->sum('payment');
        if ($totalCollected <= 0) {
            $totalCollected = (float) $financials['totalCollected'];
        }

        $totalGrn = (float) DB::table('grn_payments')
            ->whereBetween('pay_date', [$startStr, $endStr])
            ->sum('payment');
        if ($totalGrn <= 0) {
            $totalGrn = (float) $financials['totalGrnPayments'];
        }

        $totalExp = (float) DB::table('expencesess')
            ->whereBetween('add_date', [$startStr, $endStr])
            ->sum('price');
        if ($totalExp <= 0) {
            $totalExp = (float) $financials['totalExpenses'];
        }

        return [
            'cashFlow' => [
                'labels' => $flowLabels,
                'inflow' => $flowInflow,
                'grnOutflow' => $flowGrnOutflow,
                'operatingExpenses' => $flowExpOutflow,
                'outflow' => $flowTotalOutflow,
                'net' => $flowNet,
            ],
            'operatingExpensesByCategory' => [
                'labels' => $expLabels,
                'values' => $expValues,
            ],
            'operatingExpensesStatus' => [
                'labels' => $expStatusRows->pluck('status_name')->toArray(),
                'values' => $expStatusRows->pluck('total_price')->map(fn ($v) => (float) $v)->toArray(),
            ],
            'paymentMethods' => [
                'labels' => $paymentMethodsRows->pluck('method')->toArray(),
                'values' => $paymentMethodsRows->pluck('total_amount')->map(fn ($v) => (float) $v)->toArray(),
            ],
            'channelDistribution' => [
                'labels' => ['Customer Payments (Inflow)', 'GRN Supplier Settlements (Outflow)', 'Operating Overhead Bills (Outflow)'],
                'values' => [round($totalCollected, 2), round($totalGrn, 2), round($totalExp, 2)],
            ],
        ];
    }

    /**
     * Get paginated, searchable, sorted Payments & Cash Flow records (Multi-channel ledger).
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getPaymentsCashFlowTable(array $filters = []): array
    {
        [$startDate, $endDate] = $this->resolveDateRange($filters);
        $search = trim($filters['search'] ?? '');
        $channelFilter = strtolower(trim($filters['filter'] ?? 'all'));
        $perPage = max(5, min(100, (int) ($filters['per_page'] ?? 15)));
        $page = max(1, (int) ($filters['page'] ?? 1));
        $startStr = $startDate->toDateTimeString();
        $endStr = $endDate->toDateTimeString();

        $rows = collect();

        // 1. Operating Expenses (Outflow)
        if ($channelFilter === 'all' || str_contains($channelFilter, 'expense')) {
            $expQuery = DB::table('expencesess')
                ->leftJoin('expencesess_types', 'expencesess.expencesess_types_id', '=', 'expencesess_types.id')
                ->leftJoin('expencesess_statuses', 'expencesess.expencesess_statuses_id', '=', 'expencesess_statuses.id')
                ->whereBetween('expencesess.add_date', [$startStr, $endStr])
                ->select(
                    'expencesess.id',
                    'expencesess.price as amount',
                    'expencesess.add_date as date',
                    'expencesess.pay_at',
                    'expencesess_types.expencesess_type as ref',
                    'expencesess_statuses.expencesess_status as status',
                    DB::raw("'Operating Expense' as channel"),
                    DB::raw("'outflow' as direction"),
                    DB::raw("CASE WHEN expencesess.pay_by IS NOT NULL THEN 'Bank / Cash' ELSE 'Pending Settlement' END as method")
                );

            if ($search !== '') {
                $expQuery->where(function ($q) use ($search) {
                    $q->where('expencesess_types.expencesess_type', 'like', "%{$search}%")
                        ->orWhere('expencesess_statuses.expencesess_status', 'like', "%{$search}%")
                        ->orWhere('expencesess.id', 'like', "%{$search}%");
                });
            }

            $rows = $rows->concat($expQuery->get()->map(function ($e) {
                return [
                    'id' => $e->id,
                    'transactionId' => sprintf('#TX-EXP-%04d', $e->id),
                    'channel' => 'Operating Expense',
                    'reference' => $e->ref ?: 'General Overhead',
                    'method' => $e->method,
                    'date' => $e->pay_at ? Carbon::parse($e->pay_at)->format('Y-m-d H:i') : ($e->date ? Carbon::parse($e->date)->format('Y-m-d H:i') : '—'),
                    'status' => $e->status ?: 'Pending',
                    'amount' => (float) $e->amount,
                    'direction' => 'outflow',
                ];
            }));
        }

        // 2. GRN Supplier Payments (Outflow)
        if ($channelFilter === 'all' || str_contains($channelFilter, 'grn')) {
            $grnQuery = DB::table('grn_payments')
                ->leftJoin('payment_types', 'grn_payments.payment_types_id', '=', 'payment_types.id')
                ->leftJoin('payment_statuses', 'grn_payments.payment_statuses_id', '=', 'payment_statuses.id')
                ->whereBetween('grn_payments.pay_date', [$startStr, $endStr])
                ->select(
                    'grn_payments.id',
                    'grn_payments.grn_id',
                    'grn_payments.payment as amount',
                    'grn_payments.pay_date as date',
                    'payment_types.payment_type as method',
                    'payment_statuses.payment_status as status',
                    DB::raw("'GRN Supplier Outflow' as channel"),
                    DB::raw("'outflow' as direction")
                );

            if ($search !== '') {
                $grnQuery->where(function ($q) use ($search) {
                    $q->where('payment_types.payment_type', 'like', "%{$search}%")
                        ->orWhere('payment_statuses.payment_status', 'like', "%{$search}%")
                        ->orWhere('grn_payments.grn_id', 'like', "%{$search}%");
                });
            }

            $rows = $rows->concat($grnQuery->get()->map(function ($g) {
                return [
                    'id' => $g->id,
                    'transactionId' => sprintf('#TX-GRN-%04d', $g->id),
                    'channel' => 'GRN Supplier Outflow',
                    'reference' => 'GRN Batch #GRN-'.($g->grn_id ?: $g->id),
                    'method' => $g->method ?: 'Bank Transfer',
                    'date' => $g->date ? Carbon::parse($g->date)->format('Y-m-d H:i') : '—',
                    'status' => $g->status ?: 'Completed',
                    'amount' => (float) $g->amount,
                    'direction' => 'outflow',
                ];
            }));
        }

        // 3. Customer Payments (Inflow)
        if ($channelFilter === 'all' || str_contains($channelFilter, 'inflow') || str_contains($channelFilter, 'customer')) {
            $payQuery = DB::table('payments')
                ->leftJoin('payment_types', 'payments.payment_types_id', '=', 'payment_types.id')
                ->leftJoin('payment_statuses', 'payments.payment_statuses_id', '=', 'payment_statuses.id')
                ->whereBetween('payments.pay_date', [$startStr, $endStr])
                ->select(
                    'payments.id',
                    'payments.payment as amount',
                    'payments.pay_date as date',
                    'payments.print_jobs_id',
                    'payment_types.payment_type as method',
                    'payment_statuses.payment_status as status',
                    DB::raw("'Customer Inflow' as channel"),
                    DB::raw("'inflow' as direction")
                );

            if ($search !== '') {
                $payQuery->where(function ($q) use ($search) {
                    $q->where('payment_types.payment_type', 'like', "%{$search}%")
                        ->orWhere('payment_statuses.payment_status', 'like', "%{$search}%")
                        ->orWhere('payments.print_jobs_id', 'like', "%{$search}%");
                });
            }

            $rows = $rows->concat($payQuery->get()->map(function ($p) {
                return [
                    'id' => $p->id,
                    'transactionId' => sprintf('#TX-INV-%04d', $p->id),
                    'channel' => 'Customer Inflow',
                    'reference' => 'Print Job #PJ-'.sprintf('%04d', $p->print_jobs_id ?: $p->id),
                    'method' => $p->method ?: 'Cash',
                    'date' => $p->date ? Carbon::parse($p->date)->format('Y-m-d H:i') : '—',
                    'status' => $p->status ?: 'Completed',
                    'amount' => (float) $p->amount,
                    'direction' => 'inflow',
                ];
            }));
        }

        // Apply sorting to combined rows
        $sortCol = (int) ($filters['sort_col'] ?? 4);
        $sortDir = ($filters['sort_dir'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $sorted = $rows->sortBy(function ($item) use ($sortCol) {
            return match ($sortCol) {
                0 => $item['transactionId'],
                1 => $item['channel'],
                2 => $item['reference'],
                3 => $item['method'],
                4 => $item['date'],
                5 => $item['status'],
                6, 7 => $item['amount'],
                default => $item['date'],
            };
        }, SORT_REGULAR, $sortDir === 'desc');

        $total = $sorted->count();
        $pageItems = $sorted->slice(($page - 1) * $perPage, $perPage)->values();

        return [
            'data' => $pageItems,
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'last_page' => max(1, (int) ceil($total / $perPage)),
        ];
    }

    /**
     * Get paginated, searchable, sorted Operating Expenses detailed table.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getOperatingExpensesTable(array $filters = []): array
    {
        [$startDate, $endDate] = $this->resolveDateRange($filters);
        $search = trim($filters['search'] ?? '');
        $status = strtolower(trim($filters['filter'] ?? 'all'));
        $perPage = max(5, min(100, (int) ($filters['per_page'] ?? 15)));
        $page = max(1, (int) ($filters['page'] ?? 1));

        $query = DB::table('expencesess')
            ->leftJoin('expencesess_types', 'expencesess.expencesess_types_id', '=', 'expencesess_types.id')
            ->leftJoin('expencesess_statuses', 'expencesess.expencesess_statuses_id', '=', 'expencesess_statuses.id')
            ->leftJoin('users as added_user', 'expencesess.add_by', '=', 'added_user.id')
            ->leftJoin('users as paid_user', 'expencesess.pay_by', '=', 'paid_user.id')
            ->whereBetween('expencesess.add_date', [$startDate->toDateTimeString(), $endDate->toDateTimeString()]);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('expencesess_types.expencesess_type', 'like', "%{$search}%")
                    ->orWhere('added_user.first_name', 'like', "%{$search}%")
                    ->orWhere('added_user.last_name', 'like', "%{$search}%")
                    ->orWhere('paid_user.first_name', 'like', "%{$search}%")
                    ->orWhere('paid_user.last_name', 'like', "%{$search}%")
                    ->orWhere('expencesess.id', 'like', "%{$search}%");
            });
        }

        if ($status !== '' && $status !== 'all') {
            $query->where('expencesess_statuses.expencesess_status', 'like', "%{$status}%");
        }

        $sortCol = (int) ($filters['sort_col'] ?? 4);
        $sortDir = ($filters['sort_dir'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $colMap = [
            0 => 'expencesess.id',
            1 => 'expencesess_types.expencesess_type',
            2 => 'added_user.first_name',
            3 => 'paid_user.first_name',
            4 => 'expencesess.add_date',
            5 => 'expencesess.pay_at',
            6 => 'expencesess_statuses.expencesess_status',
            7 => 'expencesess.price',
        ];
        $orderBy = $colMap[$sortCol] ?? 'expencesess.add_date';
        $query->orderBy($orderBy, $sortDir);

        $total = $query->count();
        $items = $query->skip(($page - 1) * $perPage)->take($perPage)
            ->select(
                'expencesess.id',
                'expencesess.price',
                'expencesess.add_date',
                'expencesess.pay_at',
                'expencesess_types.expencesess_type',
                'expencesess_statuses.expencesess_status',
                DB::raw("CONCAT(COALESCE(added_user.first_name, 'System'), ' ', COALESCE(added_user.last_name, 'Admin')) as added_by_name"),
                DB::raw("CASE WHEN expencesess.pay_by IS NOT NULL THEN CONCAT(COALESCE(paid_user.first_name, 'System'), ' ', COALESCE(paid_user.last_name, 'Admin')) ELSE '—' END as paid_by_name")
            )
            ->get()
            ->map(function ($exp) {
                return [
                    'id' => $exp->id,
                    'expense_code' => sprintf('#EXP-%04d', $exp->id),
                    'expense_type' => $exp->expencesess_type ?: 'Operating Overhead',
                    'added_by_name' => $exp->added_by_name ?: 'System Admin',
                    'paid_by_name' => $exp->paid_by_name ?: '—',
                    'add_date' => $exp->add_date ? Carbon::parse($exp->add_date)->format('Y-m-d H:i') : '—',
                    'pay_at' => $exp->pay_at ? Carbon::parse($exp->pay_at)->format('Y-m-d H:i') : 'Not Paid Yet',
                    'status' => $exp->expencesess_status ?: 'Pending',
                    'price' => (float) $exp->price,
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
