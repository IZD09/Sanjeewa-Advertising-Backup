<?php

namespace Modules\Transaction\Services;

use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Modules\Invoice\Models\Invoice;
use Modules\PrintJob\Models\PrintJob;
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
        $query = Payment::query()->with(['paymentType', 'paymentStatus', 'printJob.customer', 'printJob.invoices']);

        if (empty($filters['include_zero'])) {
            $query->where('payment', '>', 0);
        }

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
        return Payment::query()->with(['paymentType', 'paymentStatus', 'printJob.customer', 'printJob.invoices'])->find($id);
    }

    /**
     * Create a customer payment.
     * Evaluates existing invoices & payments for the print job, verifies if payment is complete,
     * and if there is remaining balance to pay, generates a brand-NEW invoice for this payment.
     *
     * @param  array<string, mixed>  $data
     */
    public function createPayment(array $data): Payment
    {
        return DB::transaction(function () use ($data) {
            $amount = (float) $data['payment'];
            $jobId = (int) $data['print_jobs_id'];
            $statusId = (int) ($data['payment_statuses_id'] ?? 3);

            $job = PrintJob::query()->with(['cost.printCosts', 'payments', 'unit', 'invoices', 'customer'])->find($jobId);

            if (! $job) {
                throw new \InvalidArgumentException("Print job #{$jobId} not found in the database.");
            }

            // 1. Calculate job financials from all previous payments across invoices
            $costSum = (float) ($job->cost?->printCosts?->sum('price') ?? 0);
            $unitPrice = $costSum > 0 ? $costSum : 120.00;
            $qty = max(1, (int) $job->qty);
            $width = (float) ($job->wtdth > 0 ? $job->wtdth : 10);
            $height = (float) ($job->hight > 0 ? $job->hight : 4);
            $unitSymbol = strtolower((string) ($job->unit?->simble ?? 'ft'));
            $areaSqFt = match ($unitSymbol) {
                'ft', 'feet' => $width * $height,
                'in', 'inches' => ($width * $height) / 144,
                'cm' => ($width * $height) / 929.0304,
                'mm' => ($width * $height) / 92903.04,
                'm' => ($width * $height) * 10.7639,
                default => ($width * $height),
            };
            $subtotal = $unitSymbol === 'pcs' ? ($unitPrice * $qty) : ($areaSqFt * $unitPrice * $qty);
            $discount = (float) ($job->cost?->discount ?? 0);
            $totalAmount = max(0, $subtotal - $discount);
            $alreadyPaid = (float) $job->payments->sum('payment');
            $remainingBalance = max(0, $totalAmount - $alreadyPaid);

            // 2. Check if payment for this print job is already completed
            if ($totalAmount > 0 && $remainingBalance <= 0.00) {
                throw new \InvalidArgumentException("All payments for Print Job #{$jobId} have already been completed across existing invoices.");
            }

            if ($totalAmount > 0 && $amount > ($remainingBalance + 0.05)) {
                throw new \InvalidArgumentException(sprintf(
                    'Payment amount (Rs. %s) exceeds the outstanding remaining balance (Rs. %s).',
                    number_format($amount, 2),
                    number_format($remainingBalance, 2)
                ));
            }

            // 3. Since there is still payment to be made, create a NEW invoice for this payment installment
            $invoiceDate = ! empty($data['pay_date']) ? Carbon::parse($data['pay_date']) : now();
            $dueDate = $job->reg_date ? Carbon::parse($job->reg_date) : $invoiceDate->copy()->addDays(14);

            $invoice = Invoice::create([
                'customer_id' => $job->customer_id,
                'invoice_at' => $invoiceDate,
                'due_date' => $dueDate,
            ]);

            // Link the print job to this newly generated invoice
            $job->invoices()->attach($invoice->id);

            // 4. Determine payment status (Completed vs Partial)
            if ($statusId !== 1) {
                if ($amount >= ($remainingBalance - 0.05) && $totalAmount > 0) {
                    $statusId = 2; // Completed
                } else {
                    $statusId = 3; // Partial
                }
            }

            // 5. Create the payment record
            $payment = Payment::create([
                'payment' => $amount,
                'print_jobs_id' => $jobId,
                'payment_types_id' => (int) $data['payment_types_id'],
                'payment_statuses_id' => $statusId,
                'pay_date' => ! empty($data['pay_date']) ? $data['pay_date'] : now(),
            ]);

            // Attach the newly created active invoice to the payment instance
            $payment->setRelation('activeInvoice', $invoice);

            return $payment->load(['paymentType', 'paymentStatus', 'printJob.customer', 'printJob.invoices']);
        });
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
        $query = GrnPayment::query()->with([
            'paymentType',
            'paymentStatus',
            'grn.purchaseOrders.supplier',
            'grn.purchaseOrders.status',
            'grn.purchaseOrders.items.stockItem',
            'grn.stocks.stockItem',
        ]);

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

        $kpiRow = GrnPayment::query()
            ->leftJoin('payment_statuses', 'grn_payments.payment_statuses_id', '=', 'payment_statuses.id')
            ->selectRaw("
                COUNT(*) as total_count,
                COALESCE(SUM(grn_payments.payment), 0) as total_payment,
                SUM(CASE WHEN payment_statuses.payment_status IN ('Completed', 'Paid') THEN 1 ELSE 0 END) as complete_count,
                SUM(CASE WHEN payment_statuses.payment_status IN ('Partial', 'Advance') THEN 1 ELSE 0 END) as advance_count,
                SUM(CASE WHEN payment_statuses.payment_status = 'Pending' THEN 1 ELSE 0 END) as pending_count
            ")
            ->first();

        $totalBilled = (float) ($kpiRow->total_payment ?? 0);
        $totalDisbursed = (float) ($kpiRow->total_payment ?? 0);
        $totalPending = 0.0;
        $completeCount = (int) ($kpiRow->complete_count ?? 0);
        $advanceCount = (int) ($kpiRow->advance_count ?? 0);
        $pendingCount = (int) ($kpiRow->pending_count ?? 0);
        $totalCount = (int) ($kpiRow->total_count ?? 0);

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
                    'total' => $totalCount,
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
        return GrnPayment::query()->with([
            'paymentType',
            'paymentStatus',
            'grn.purchaseOrders.supplier',
            'grn.purchaseOrders.status',
            'grn.purchaseOrders.items.stockItem',
            'grn.stocks.stockItem',
        ])->find($id);
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
            ->with(['supplier', 'status', 'items.stockItem', 'grns.payments'])
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

            $poItems = $po->items->map(function ($item) {
                $qty = (int) ($item->qty_ordered ?? 0);
                $unitCost = (float) ($item->unit_cost ?? 0);

                return [
                    'name' => $item->stockItem?->name ?? 'Material Item',
                    'code' => $item->stockItem?->code ?? '',
                    'qty_ordered' => $qty,
                    'qty_received' => (int) ($item->qty_received ?? 0),
                    'unit_cost' => $unitCost,
                    'line_total' => $qty * $unitCost,
                ];
            })->values()->all();

            $available[] = [
                'id' => $poNum,
                'raw_id' => $po->id,
                'poNumber' => $poNum,
                'orderDate' => $po->add_date?->format('Y-m-d') ?? null,
                'status' => $po->status?->purchase_orders_status ?? 'Pending',
                'notes' => $po->notes ?? '',
                'grn_id' => $po->grns->first()?->id ?? null,
                'grnNumber' => $po->grns->first() ? ('GRN-0'.$po->grns->first()->id) : 'GRN-Pending',
                'supplier_id' => $po->suppliers_id,
                'supplierName' => $supplierName,
                'supplierBankAccount' => $po->supplier?->bank_account ?? '',
                'stockCategory' => $po->items->first()?->stockItem?->name ?? 'Stock Consignment',
                'items' => $poItems,
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
                    'supplierBankAccount' => $firstPo?->supplier?->bank_account ?? '',
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
        return DB::transaction(function () use ($data) {
            $grnId = ! empty($data['grn_id']) ? (int) $data['grn_id'] : null;

            if ($grnId) {
                $grn = Grn::firstOrCreate(
                    ['id' => $grnId],
                    ['at_time' => ! empty($data['pay_date']) ? $data['pay_date'] : now()]
                );
            } else {
                $grn = Grn::create([
                    'at_time' => ! empty($data['pay_date']) ? $data['pay_date'] : now(),
                ]);
            }

            if (! empty($data['purchase_order_ids']) && is_array($data['purchase_order_ids'])) {
                $poIds = array_values(array_unique(array_filter(
                    array_map('intval', $data['purchase_order_ids']),
                    fn (int $id): bool => $id > 0
                )));

                $attachData = [];
                foreach ($poIds as $poId) {
                    $attachData[$poId] = ['supplyer_invoice' => null];
                }

                if (! empty($attachData)) {
                    $grn->purchaseOrders()->syncWithoutDetaching($attachData);
                }
            }

            return GrnPayment::create([
                'payment' => (float) $data['payment'],
                'grn_id' => $grn->id,
                'payment_types_id' => (int) $data['payment_types_id'],
                'payment_statuses_id' => (int) $data['payment_statuses_id'],
                'pay_date' => ! empty($data['pay_date']) ? $data['pay_date'] : now(),
            ])->load(['paymentType', 'paymentStatus', 'grn.purchaseOrders']);
        });
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
