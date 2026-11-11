<?php

namespace Modules\Reports\Services;

use Illuminate\Support\Facades\DB;

class SupplierGrnReportService extends BaseReportService
{
    /**
     * Get Supplier & GRN charts payload from the database.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, array<string, mixed>>
     */
    public function getCharts(array $filters = []): array
    {
        $supplierPaymentsSub = DB::table('purchase_orders')
            ->join('grn_has_puches_order', 'purchase_orders.id', '=', 'grn_has_puches_order.purchase_orders_id')
            ->join('grn_payments', 'grn_has_puches_order.grn_id', '=', 'grn_payments.grn_id')
            ->select('purchase_orders.suppliers_id', DB::raw('COALESCE(SUM(grn_payments.payment), 0) as total_paid'))
            ->groupBy('purchase_orders.suppliers_id');

        $supplierPurchasesSub = DB::table('purchase_orders')
            ->join('grn_has_puches_order', 'purchase_orders.id', '=', 'grn_has_puches_order.purchase_orders_id')
            ->join('stock', 'grn_has_puches_order.grn_id', '=', 'stock.grn_id')
            ->select('purchase_orders.suppliers_id', DB::raw('COALESCE(SUM(stock.qty * stock.buy), 0) as total_purchases'))
            ->groupBy('purchase_orders.suppliers_id');

        // Query suppliers with their actual GRN payment and purchase records from database
        $suppliersQuery = DB::table('suppliers')
            ->leftJoinSub($supplierPaymentsSub, 'sp', 'suppliers.id', '=', 'sp.suppliers_id')
            ->leftJoinSub($supplierPurchasesSub, 'sc', 'suppliers.id', '=', 'sc.suppliers_id')
            ->select(
                'suppliers.id',
                'suppliers.name',
                DB::raw('COALESCE(sp.total_paid, 0) as paid_amount'),
                DB::raw('COALESCE(sc.total_purchases, 0) as purchases_amount')
            )
            ->get();

        $labels = [];
        $purchases = [];
        $paidList = [];
        $payableList = [];
        $settlementRates = [];

        foreach ($suppliersQuery as $sup) {
            $paid = (float) $sup->paid_amount;
            $purchase = (float) $sup->purchases_amount;
            $payable = max(0.0, $purchase - $paid);
            $rate = $purchase > 0 ? round(($paid / $purchase) * 100, 1) : 100.0;

            $labels[] = $sup->name;
            $purchases[] = round($purchase, 2);
            $paidList[] = round($paid, 2);
            $payableList[] = round($payable, 2);
            $settlementRates[] = $rate;
        }

        return [
            'suppliers' => [
                'labels' => $labels,
                'purchases' => $purchases,
                'paid' => $paidList,
                'payable' => $payableList,
                'settlementRate' => $settlementRates,
            ],
        ];
    }

    /**
     * Get paginated Supplier & GRN table from the database.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getSupplierGrnTable(array $filters = []): array
    {
        $search = trim($filters['search'] ?? '');
        $perPage = max(5, min(100, (int) ($filters['per_page'] ?? 15)));
        $page = max(1, (int) ($filters['page'] ?? 1));

        $supplierPaymentsSub = DB::table('purchase_orders')
            ->join('grn_has_puches_order', 'purchase_orders.id', '=', 'grn_has_puches_order.purchase_orders_id')
            ->join('grn_payments', 'grn_has_puches_order.grn_id', '=', 'grn_payments.grn_id')
            ->select('purchase_orders.suppliers_id', DB::raw('COALESCE(SUM(grn_payments.payment), 0) as total_paid'))
            ->groupBy('purchase_orders.suppliers_id');

        $supplierPurchasesSub = DB::table('purchase_orders')
            ->join('grn_has_puches_order', 'purchase_orders.id', '=', 'grn_has_puches_order.purchase_orders_id')
            ->join('stock', 'grn_has_puches_order.grn_id', '=', 'stock.grn_id')
            ->select('purchase_orders.suppliers_id', DB::raw('COALESCE(SUM(stock.qty * stock.buy), 0) as total_purchases'))
            ->groupBy('purchase_orders.suppliers_id');

        $query = DB::table('suppliers')
            ->leftJoinSub($supplierPaymentsSub, 'sp', 'suppliers.id', '=', 'sp.suppliers_id')
            ->leftJoinSub($supplierPurchasesSub, 'sc', 'suppliers.id', '=', 'sc.suppliers_id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('suppliers.name', 'like', "%{$search}%")
                    ->orWhere('suppliers.mobile', 'like', "%{$search}%")
                    ->orWhere('suppliers.email', 'like', "%{$search}%");
            });
        }

        $sortCol = (int) ($filters['sort_col'] ?? 0);
        $sortDir = ($filters['sort_dir'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $colMap = [
            0 => 'suppliers.id',
            1 => 'suppliers.name',
            2 => 'suppliers.mobile',
            3 => 'suppliers.email',
            4 => 'sc.total_purchases',
            5 => 'sp.total_paid',
        ];
        $orderBy = $colMap[$sortCol] ?? 'suppliers.id';
        $query->orderBy($orderBy, $sortDir);

        $total = $query->count();
        $items = $query->skip(($page - 1) * $perPage)->take($perPage)
            ->select(
                'suppliers.id',
                'suppliers.name',
                'suppliers.mobile',
                'suppliers.email',
                DB::raw('COALESCE(sp.total_paid, 0) as paid_amount'),
                DB::raw('COALESCE(sc.total_purchases, 0) as purchases_amount')
            )
            ->get()
            ->map(function ($sup) {
                $paid = (float) $sup->paid_amount;
                $purchases = (float) $sup->purchases_amount;
                $payable = max(0.0, $purchases - $paid);
                $rate = $purchases > 0 ? round(($paid / $purchases) * 100, 1) : 100.0;

                return [
                    'id' => $sup->id,
                    'supplier_name' => $sup->name,
                    'mobile' => $sup->mobile ?: '—',
                    'email' => $sup->email ?: '—',
                    'total_purchases' => round($purchases, 2),
                    'amount_paid' => round($paid, 2),
                    'pending_payable' => round($payable, 2),
                    'settlement_rate' => $rate,
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
