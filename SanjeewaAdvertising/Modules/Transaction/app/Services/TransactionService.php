<?php

namespace Modules\Transaction\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Modules\Supplier\Models\Grn;
use Modules\Supplier\Models\PurchaseOrder;
use Modules\Transaction\Models\GrnPayment;
use Modules\Transaction\Models\Payment;
use Modules\Transaction\Models\PaymentStatus;
use Modules\Transaction\Models\PaymentType;
use Modules\Transaction\Transformers\GrnPaymentResource;
use Modules\Transaction\Transformers\PaymentResource;

class TransactionService
{
    /**
     * Build the query for customer print job payments.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<Payment>
     */
    public function buildPaymentsQuery(array $filters = []): Builder
    {
        $query = Payment::query()->with(['paymentType', 'paymentStatus', 'printJob.customer']);

        if (! empty($filters['print_jobs_id'])) {
            $query->where('print_jobs_id', (int) $filters['print_jobs_id']);
        }

        if (! empty($filters['payment_types_id'])) {
            $query->where('payment_types_id', (int) $filters['payment_types_id']);
        }

        if (! empty($filters['payment_statuses_id'])) {
            $query->where('payment_statuses_id', (int) $filters['payment_statuses_id']);
        }

        if (! empty($filters['from_date'])) {
            $query->whereDate('pay_date', '>=', $filters['from_date']);
        }

        if (! empty($filters['to_date'])) {
            $query->whereDate('pay_date', '<=', $filters['to_date']);
        }

        return $query->orderByDesc('id');
    }

    /**
     * Retrieve all customer payments from database.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Payment>
     */
    public function getAllPayments(array $filters = []): Collection
    {
        return $this->buildPaymentsQuery($filters)->get();
    }

    /**
     * Retrieve paginated customer payments from database.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getPayments(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));
        $page = isset($filters['page']) ? max(1, (int) $filters['page']) : null;

        return $this->buildPaymentsQuery($filters)->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Find a payment by ID.
     */
    public function getPaymentById(int $id): ?Payment
    {
        return Payment::query()->with(['paymentType', 'paymentStatus', 'printJob.customer'])->find($id);
    }

    /**
     * Create a customer payment.
     *
     * @param  array<string, mixed>  $data
     */
    public function createPayment(array $data): Payment
    {
        return Payment::create([
            'payment' => (float) $data['payment'],
            'print_jobs_id' => (int) $data['print_jobs_id'],
            'payment_types_id' => (int) $data['payment_types_id'],
            'payment_statuses_id' => (int) $data['payment_statuses_id'],
            'pay_date' => ! empty($data['pay_date']) ? $data['pay_date'] : now(),
        ])->load(['paymentType', 'paymentStatus', 'printJob']);
    }

    /**
     * Update a customer payment.
     *
     * @param  array<string, mixed>  $data
     */
    public function updatePayment(Payment $payment, array $data): Payment
    {
        $attributes = [];

        if (isset($data['payment'])) {
            $attributes['payment'] = (float) $data['payment'];
        }
        if (isset($data['payment_types_id'])) {
            $attributes['payment_types_id'] = (int) $data['payment_types_id'];
        }
        if (isset($data['payment_statuses_id'])) {
            $attributes['payment_statuses_id'] = (int) $data['payment_statuses_id'];
        }
        if (isset($data['pay_date'])) {
            $attributes['pay_date'] = $data['pay_date'];
        }

        $payment->update($attributes);

        return $payment->fresh(['paymentType', 'paymentStatus', 'printJob']);
    }

    /**
     * Delete a payment.
     */
    public function deletePayment(Payment $payment): bool
    {
        return (bool) $payment->delete();
    }

    /**
     * Build the query for GRN payments.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<GrnPayment>
     */
    public function buildGrnPaymentsQuery(array $filters = []): Builder
    {
        $query = GrnPayment::query()->with(['paymentType', 'paymentStatus', 'grn.purchaseOrders.supplier', 'grn.stocks']);

        if (! empty($filters['grn_id'])) {
            $query->where('grn_id', (int) $filters['grn_id']);
        }

        if (! empty($filters['payment_types_id'])) {
            $query->where('payment_types_id', (int) $filters['payment_types_id']);
        }

        if (! empty($filters['payment_statuses_id'])) {
            $query->where('payment_statuses_id', (int) $filters['payment_statuses_id']);
        }

        return $query->orderByDesc('id');
    }

    /**
     * Retrieve all GRN payments from database.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, GrnPayment>
     */
    public function getAllGrnPayments(array $filters = []): Collection
    {
        return $this->buildGrnPaymentsQuery($filters)->get();
    }

    /**
     * Retrieve GRN payments data and KPIs for UI views.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getGrnPaymentsData(array $filters = []): array
    {
        $perPage = isset($filters['per_page']) ? max(1, min(100, (int) $filters['per_page'])) : 20;
        $paginator = $this->getGrnPayments($filters, $perPage);
        $allPayments = $this->getAllGrnPayments([]);

        $totalBilled = $allPayments->sum(fn ($p) => (float) ($p->net_total ?? $p->totalBill ?? $p->payment ?? 0));
        $totalDisbursed = $allPayments->sum(fn ($p) => (float) ($p->paid_amount ?? $p->payment ?? 0));
        $totalPending = $allPayments->sum(fn ($p) => (float) ($p->balance ?? $p->balance_amount ?? 0));

        $completeCount = $allPayments->filter(fn ($p) => ($p->paymentStatus?->payment_status ?? '') === 'Completed' || ($p->paymentStatus?->payment_status ?? '') === 'Paid')->count();
        $advanceCount = $allPayments->filter(fn ($p) => ($p->paymentStatus?->payment_status ?? '') === 'Partial' || ($p->paymentStatus?->payment_status ?? '') === 'Advance')->count();
        $pendingCount = $allPayments->filter(fn ($p) => ($p->paymentStatus?->payment_status ?? '') === 'Pending')->count();

        return [
            'grn_payments' => GrnPaymentResource::collection($paginator->items()),
            'kpis' => [
                'total_billed' => $totalBilled,
                'total_disbursed' => $totalDisbursed,
                'total_pending' => $totalPending,
                'counts' => [
                    'complete' => $completeCount,
                    'advance' => $advanceCount,
                    'pending' => $pendingCount,
                    'total' => $allPayments->count(),
                ],
            ],
            'pagination' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem() ?? 0,
                'to' => $paginator->lastItem() ?? 0,
            ],
        ];
    }

    /**
     * Retrieve Operating Expenses data and KPIs for UI views.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getOperatingExpensesData(array $filters = []): array
    {
        $expenses = $this->getAllPayments($filters);

        $totalBilled = $expenses->sum(fn ($e) => (float) ($e->payment ?? 0));
        $totalPaid = $expenses->sum(fn ($e) => (float) ($e->payment ?? 0));
        $totalPending = 0.0;

        return [
            'expenses' => PaymentResource::collection($expenses),
            'kpis' => [
                'total_billed' => $totalBilled,
                'total_paid' => $totalPaid,
                'total_pending' => $totalPending,
                'total_count' => $expenses->count(),
            ],
        ];
    }

    /**
     * Retrieve paginated GRN payments from database.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getGrnPayments(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));
        $page = isset($filters['page']) ? max(1, (int) $filters['page']) : null;

        return $this->buildGrnPaymentsQuery($filters)->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Find a GRN payment by ID.
     */
    public function getGrnPaymentById(int $id): ?GrnPayment
    {
        return GrnPayment::query()->with(['paymentType', 'paymentStatus', 'grn'])->find($id);
    }

    /**
     * Retrieve live available purchase orders and GRN consignments from the database.
     *
     * @param  array<string, mixed>  $filters
     * @return array<int, array<string, mixed>>
     */
    public function getAvailablePurchaseOrders(array $filters = []): array
    {
        $available = [];

        // 1. Fetch live purchase orders from database
        $purchaseOrders = PurchaseOrder::query()
            ->with(['supplier', 'items.stockItem', 'grns.payments'])
            ->orderByDesc('id')
            ->get();

        foreach ($purchaseOrders as $po) {
            $poNum = 'PO-0'.$po->id;
            $supplierName = $po->supplier?->name ?? 'Direct Supplier';
            $totalAmount = (float) $po->items->sum(fn ($i) => ((float) $i->unit_cost * (int) $i->qty_ordered));
            if ($totalAmount <= 0) {
                $totalAmount = 25000.00;
            }

            $paidAmount = 0.0;
            foreach ($po->grns as $grn) {
                $paidAmount += (float) ($grn->payments?->sum('payment') ?? 0);
            }
            $balanceAmount = max(0, $totalAmount - $paidAmount);

            $available[] = [
                'id' => $poNum,
                'poNumber' => $poNum,
                'grn_id' => $po->grns->first()?->id ?? null,
                'grnNumber' => $po->grns->first() ? ('GRN-0'.$po->grns->first()->id) : 'GRN-Pending',
                'supplier_id' => $po->suppliers_id,
                'supplierName' => $supplierName,
                'stockCategory' => $po->items->first()?->stockItem?->item_name ?? 'Stock Consignment',
                'totalAmount' => $totalAmount,
                'paidAmount' => $paidAmount,
                'balanceAmount' => $balanceAmount,
                'supplierInvoice' => '',
                'label' => "{$poNum} | {$supplierName} (Bal: Rs. ".number_format($balanceAmount).')',
            ];
        }

        // 2. Fetch live GRN consignments from database
        $grns = Grn::query()
            ->with(['purchaseOrders.supplier', 'stocks.stockItem', 'payments'])
            ->orderByDesc('id')
            ->get();

        foreach ($grns as $grn) {
            $grnNum = 'GRN-0'.$grn->id;
            $firstPo = $grn->purchaseOrders->first();
            $poNum = $firstPo ? ('PO-0'.$firstPo->id) : "PO-{$grn->id}";
            $supplierName = $firstPo?->supplier?->name ?? 'Direct Consignment Supplier';

            $totalAmount = (float) $grn->stocks->sum(fn ($s) => ((float) $s->price * (int) $s->qty));
            if ($totalAmount <= 0) {
                $totalAmount = 35000.00;
            }

            $paidAmount = (float) ($grn->payments?->sum('payment') ?? 0);
            $balanceAmount = max(0, $totalAmount - $paidAmount);

            if (! collect($available)->contains(fn ($item) => $item['id'] === $poNum || $item['id'] === $grnNum)) {
                $available[] = [
                    'id' => $poNum,
                    'poNumber' => $poNum,
                    'grn_id' => $grn->id,
                    'grnNumber' => $grnNum,
                    'supplier_id' => $firstPo?->suppliers_id ?? null,
                    'supplierName' => $supplierName,
                    'stockCategory' => $grn->stocks->first()?->stockItem?->name ?? 'Stock Materials',
                    'totalAmount' => $totalAmount,
                    'paidAmount' => $paidAmount,
                    'balanceAmount' => $balanceAmount,
                    'supplierInvoice' => $firstPo?->pivot?->supplyer_invoice ?? '',
                    'label' => "{$poNum} | {$grnNum} - {$supplierName} (Bal: Rs. ".number_format($balanceAmount).')',
                ];
            }
        }

        return $available;
    }

    /**
     * Create a GRN payment.
     *
     * @param  array<string, mixed>  $data
     */
    public function createGrnPayment(array $data): GrnPayment
    {
        $grnId = (int) $data['grn_id'];
        Grn::firstOrCreate(['id' => $grnId], ['at_time' => now()]);

        return GrnPayment::create([
            'payment' => (float) $data['payment'],
            'grn_id' => $grnId,
            'payment_types_id' => (int) $data['payment_types_id'],
            'payment_statuses_id' => (int) $data['payment_statuses_id'],
            'pay_date' => ! empty($data['pay_date']) ? $data['pay_date'] : now(),
        ])->load(['paymentType', 'paymentStatus', 'grn']);
    }

    /**
     * Update a GRN payment.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateGrnPayment(GrnPayment $grnPayment, array $data): GrnPayment
    {
        $attributes = [];

        if (isset($data['payment'])) {
            $attributes['payment'] = (float) $data['payment'];
        }
        if (isset($data['payment_types_id'])) {
            $attributes['payment_types_id'] = (int) $data['payment_types_id'];
        }
        if (isset($data['payment_statuses_id'])) {
            $attributes['payment_statuses_id'] = (int) $data['payment_statuses_id'];
        }
        if (isset($data['pay_date'])) {
            $attributes['pay_date'] = $data['pay_date'];
        }

        $grnPayment->update($attributes);

        return $grnPayment->fresh(['paymentType', 'paymentStatus', 'grn']);
    }

    /**
     * Delete a GRN payment.
     */
    public function deleteGrnPayment(GrnPayment $grnPayment): bool
    {
        return (bool) $grnPayment->delete();
    }

    /**
     * Retrieve all payment types.
     *
     * @return Collection<int, PaymentType>
     */
    public function getAllPaymentTypes(): Collection
    {
        return PaymentType::query()->orderBy('id')->get();
    }

    /**
     * Retrieve all payment statuses.
     *
     * @return Collection<int, PaymentStatus>
     */
    public function getAllPaymentStatuses(): Collection
    {
        return PaymentStatus::query()->orderBy('id')->get();
    }
}
