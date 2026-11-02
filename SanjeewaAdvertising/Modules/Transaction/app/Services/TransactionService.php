<?php

namespace Modules\Transaction\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\Paginator;
use Modules\Transaction\Models\GrnPayment;
use Modules\Transaction\Models\Payment;
use Modules\Transaction\Models\PaymentStatus;
use Modules\Transaction\Models\PaymentType;

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
     * Retrieve all customer payments.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Payment>
     */
    public function getAllPayments(array $filters = []): Collection
    {
        $payments = $this->buildPaymentsQuery($filters)->get();

        if ($payments->isEmpty()) {
            return $this->resolveDemoOperatingExpenses($filters);
        }

        return $payments;
    }

    /**
     * Retrieve paginated customer payments.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getPayments(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        $paginator = $this->buildPaymentsQuery($filters)->paginate($perPage);

        if ($paginator->isEmpty()) {
            return $this->resolveDemoOperatingExpensesPaginator($filters, $perPage);
        }

        return $paginator;
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
        $query = GrnPayment::query()->with(['paymentType', 'paymentStatus', 'grn']);

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
     * Retrieve all GRN payments.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, GrnPayment>
     */
    public function getAllGrnPayments(array $filters = []): Collection
    {
        $payments = $this->buildGrnPaymentsQuery($filters)->get();

        if ($payments->isEmpty()) {
            return $this->resolveDemoGrnPayments($filters);
        }

        return $payments;
    }

    /**
     * Retrieve paginated GRN payments.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getGrnPayments(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        $paginator = $this->buildGrnPaymentsQuery($filters)->paginate($perPage);

        if ($paginator->isEmpty()) {
            return $this->resolveDemoGrnPaymentsPaginator($filters, $perPage);
        }

        return $paginator;
    }

    /**
     * Find a GRN payment by ID.
     */
    public function getGrnPaymentById(int $id): ?GrnPayment
    {
        return GrnPayment::query()->with(['paymentType', 'paymentStatus', 'grn'])->find($id);
    }

    /**
     * Create a GRN payment.
     *
     * @param  array<string, mixed>  $data
     */
    public function createGrnPayment(array $data): GrnPayment
    {
        return GrnPayment::create([
            'payment' => (float) $data['payment'],
            'grn_id' => (int) $data['grn_id'],
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

    /**
     * Resolve demo GRN payment records modeled after UI DashboardService.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, GrnPayment>
     */
    public function resolveDemoGrnPayments(array $filters = []): Collection
    {
        $today = now();

        $demoData = [
            [
                'id' => 1,
                'grn_id' => 1,
                'grn_number' => 'GRN-2610-001',
                'po_number' => 'PO-2026-088',
                'supplier_id' => 'SUP-001',
                'supplier_name' => 'PaperPro Lanka',
                'stock_category' => '300gsm Art Board & Cyan Ink',
                'net_total' => 87500.00,
                'totalBill' => 87500.00,
                'payment' => 87500.00,
                'paid_amount' => 87500.00,
                'balance' => 0.00,
                'stage' => 'Complete Payment',
                'payment_status' => 'Paid',
                'method' => 'Check',
                'ref' => 'CHQ-882019-COMBANK',
                'note' => 'Account payee crossed cheque issued for full SRA3 board delivery',
                'date' => $today->copy()->subDays(2)->toDateString(),
                'pay_date' => $today->copy()->subDays(2),
            ],
            [
                'id' => 2,
                'grn_id' => 2,
                'grn_number' => 'GRN-2610-002',
                'po_number' => 'PO-2026-074',
                'supplier_id' => 'SUP-003',
                'supplier_name' => 'MegaFlex Imports',
                'stock_category' => 'Flex Banner Heavy Star 380gsm',
                'net_total' => 108000.00,
                'totalBill' => 108000.00,
                'payment' => 50000.00,
                'paid_amount' => 50000.00,
                'balance' => 58000.00,
                'stage' => 'Advance Payment',
                'payment_status' => 'Partial',
                'method' => 'Bank Transfer',
                'ref' => 'HNB-FT-992011',
                'note' => 'Initial advance transferred on container unloading. Balance on 30 days.',
                'date' => $today->copy()->subDays(1)->toDateString(),
                'pay_date' => $today->copy()->subDays(1),
            ],
            [
                'id' => 3,
                'grn_id' => 3,
                'grn_number' => 'GRN-2610-003',
                'po_number' => 'PO-2026-092',
                'supplier_id' => 'SUP-002',
                'supplier_name' => 'Flora Tech International',
                'stock_category' => 'Solvent Inks & Cleaning Solvents',
                'net_total' => 64000.00,
                'totalBill' => 64000.00,
                'payment' => 0.00,
                'paid_amount' => 0.00,
                'balance' => 64000.00,
                'stage' => 'Pending Payment',
                'payment_status' => 'Pending',
                'method' => 'Check',
                'ref' => 'DUE-14-DAYS',
                'note' => 'Credit invoice received, payable within 14 days credit terms',
                'date' => $today->toDateString(),
                'pay_date' => $today,
            ],
            [
                'id' => 4,
                'grn_id' => 4,
                'grn_number' => 'GRN-2610-004',
                'po_number' => 'PO-2026-068',
                'supplier_id' => 'SUP-005',
                'supplier_name' => 'Star Media Group',
                'stock_category' => 'Foam Boards 5mm & Acrylic Sheets',
                'net_total' => 42000.00,
                'totalBill' => 42000.00,
                'payment' => 42000.00,
                'paid_amount' => 42000.00,
                'balance' => 0.00,
                'stage' => 'Complete Payment',
                'payment_status' => 'Paid',
                'method' => 'Cash',
                'ref' => 'PETTY-CASH-402',
                'note' => 'Cash on delivery paid from petty cash voucher',
                'date' => $today->toDateString(),
                'pay_date' => $today,
            ],
            [
                'id' => 5,
                'grn_id' => 5,
                'grn_number' => 'GRN-2610-005',
                'po_number' => 'PO-2026-095',
                'supplier_id' => 'SUP-004',
                'supplier_name' => 'Avery Dennison Lanka',
                'stock_category' => 'Vinyl Sticker Glossy Rolls',
                'net_total' => 96000.00,
                'totalBill' => 96000.00,
                'payment' => 30000.00,
                'paid_amount' => 30000.00,
                'balance' => 66000.00,
                'stage' => 'Advance Payment',
                'payment_status' => 'Partial',
                'method' => 'Card',
                'ref' => 'CORP-CARD-8832',
                'note' => 'Deposit paid using company credit card on order placement',
                'date' => $today->toDateString(),
                'pay_date' => $today,
            ],
            [
                'id' => 6,
                'grn_id' => 6,
                'grn_number' => 'GRN-2610-006',
                'po_number' => 'PO-2026-098',
                'supplier_id' => 'SUP-006',
                'supplier_name' => 'PrintCare Supplies',
                'stock_category' => 'Gloss & Matte Lamination Films',
                'net_total' => 54000.00,
                'totalBill' => 54000.00,
                'payment' => 54000.00,
                'paid_amount' => 54000.00,
                'balance' => 0.00,
                'stage' => 'Complete Payment',
                'payment_status' => 'Paid',
                'method' => 'Bank Transfer',
                'ref' => 'BOC-FT-77610',
                'note' => 'Direct transfer for 20 rolls thermal film',
                'date' => $today->copy()->subDays(3)->toDateString(),
                'pay_date' => $today->copy()->subDays(3),
            ],
            [
                'id' => 7,
                'grn_id' => 7,
                'grn_number' => 'GRN-2610-007',
                'po_number' => 'PO-2026-099',
                'supplier_id' => 'SUP-007',
                'supplier_name' => 'Sun Chemical Lanka',
                'stock_category' => 'Eco-Solvent Inks CMYK Pack',
                'net_total' => 120000.00,
                'totalBill' => 120000.00,
                'payment' => 60000.00,
                'paid_amount' => 60000.00,
                'balance' => 60000.00,
                'stage' => 'Advance Payment',
                'payment_status' => 'Partial',
                'method' => 'Check',
                'ref' => 'CHQ-99120-NTB',
                'note' => 'Part payment by cheque, balance due in 30 days',
                'date' => $today->copy()->subDays(4)->toDateString(),
                'pay_date' => $today->copy()->subDays(4),
            ],
            [
                'id' => 8,
                'grn_id' => 8,
                'grn_number' => 'GRN-2610-008',
                'po_number' => 'PO-2026-101',
                'supplier_id' => 'SUP-001',
                'supplier_name' => 'PaperPro Lanka',
                'stock_category' => 'Ivory Board 260gsm 500pk',
                'net_total' => 38000.00,
                'totalBill' => 38000.00,
                'payment' => 0.00,
                'paid_amount' => 0.00,
                'balance' => 38000.00,
                'stage' => 'Pending Payment',
                'payment_status' => 'Pending',
                'method' => 'Check',
                'ref' => 'DUE-30-DAYS',
                'note' => 'Delivery received under regular monthly invoice cycle',
                'date' => $today->copy()->subDays(5)->toDateString(),
                'pay_date' => $today->copy()->subDays(5),
            ],
            [
                'id' => 9,
                'grn_id' => 9,
                'grn_number' => 'GRN-2610-009',
                'po_number' => 'PO-2026-103',
                'supplier_id' => 'SUP-008',
                'supplier_name' => 'ColorCraft Packaging',
                'stock_category' => 'Die-Cut Corrugated Carton Boxes',
                'net_total' => 29000.00,
                'totalBill' => 29000.00,
                'payment' => 29000.00,
                'paid_amount' => 29000.00,
                'balance' => 0.00,
                'stage' => 'Complete Payment',
                'payment_status' => 'Paid',
                'method' => 'Cash',
                'ref' => 'PETTY-CASH-410',
                'note' => 'Paid on shop arrival',
                'date' => $today->copy()->subDays(6)->toDateString(),
                'pay_date' => $today->copy()->subDays(6),
            ],
            [
                'id' => 10,
                'grn_id' => 10,
                'grn_number' => 'GRN-2610-010',
                'po_number' => 'PO-2026-105',
                'supplier_id' => 'SUP-003',
                'supplier_name' => 'MegaFlex Imports',
                'stock_category' => 'Rollup Stand Aluminum Mechanisms',
                'net_total' => 75000.00,
                'totalBill' => 75000.00,
                'payment' => 75000.00,
                'paid_amount' => 75000.00,
                'balance' => 0.00,
                'stage' => 'Complete Payment',
                'payment_status' => 'Paid',
                'method' => 'Bank Transfer',
                'ref' => 'HNB-FT-10492',
                'note' => '50 aluminium rollup cassette frames',
                'date' => $today->copy()->subDays(7)->toDateString(),
                'pay_date' => $today->copy()->subDays(7),
            ],
        ];

        $search = strtolower(trim((string) ($filters['search'] ?? $filters['q'] ?? '')));
        if ($search !== '') {
            $demoData = array_filter($demoData, function ($item) use ($search) {
                return str_contains(strtolower($item['grn_number']), $search)
                    || str_contains(strtolower($item['po_number']), $search)
                    || str_contains(strtolower($item['supplier_name']), $search)
                    || str_contains(strtolower($item['stock_category']), $search);
            });
        }

        $models = array_map(function ($attributes) {
            $grnPayment = new GrnPayment;
            $grnPayment->forceFill($attributes);

            return $grnPayment;
        }, array_values($demoData));

        return new Collection($models);
    }

    /**
     * Resolve paginated demo GRN payments matching requested page & per_page.
     *
     * @param  array<string, mixed>  $filters
     */
    public function resolveDemoGrnPaymentsPaginator(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $collection = $this->resolveDemoGrnPayments($filters);
        $page = (int) ($filters['page'] ?? 1);
        $sliced = $collection->slice(($page - 1) * $perPage, $perPage)->values();

        return new \Illuminate\Pagination\LengthAwarePaginator(
            $sliced,
            $collection->count(),
            $perPage,
            $page,
            ['path' => Paginator::resolveCurrentPath()]
        );
    }

    /**
     * Resolve demo operating expense utility records modeled after UI DashboardService.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Payment>
     */
    public function resolveDemoOperatingExpenses(array $filters = []): Collection
    {
        $demoData = [
            [
                'id' => 1,
                'title' => 'CEB Heavy Power (3-Phase Workshop & HP Scitex)',
                'category' => 'Electricity',
                'provider' => 'Ceylon Electricity Board (CEB)',
                'account_no' => '042-881-9921',
                'month' => '2026-10',
                'due_date' => '2026-10-31',
                'amount' => 48500.00,
                'payment' => 48500.00,
                'status' => 'Pending',
                'notes' => 'Main factory meter reading 4,200 units power consumption for digital presses',
                'paid_date' => '',
                'paid_amount' => 0.00,
                'paid_method' => '',
                'paid_ref' => '',
                'paid_note' => '',
            ],
            [
                'id' => 2,
                'title' => 'NWSDB Water Supply (Workshop & Washing Bay)',
                'category' => 'Water Board',
                'provider' => 'National Water Supply & Drainage Board',
                'account_no' => '11/204/883/02',
                'month' => '2026-10',
                'due_date' => '2026-10-31',
                'amount' => 4800.00,
                'payment' => 4800.00,
                'status' => 'Paid',
                'paid_date' => '2026-10-28',
                'paid_amount' => 4800.00,
                'paid_method' => 'Cash',
                'paid_ref' => 'WATER-REC-9941',
                'paid_note' => 'Settled at post office counter',
                'notes' => 'Monthly municipal water charges',
            ],
            [
                'id' => 3,
                'title' => 'SLT Megaline 100Mbps Ultra Fiber Line (October)',
                'category' => 'Internet & Fiber',
                'provider' => 'Sri Lanka Telecom (SLT-Mobitel)',
                'account_no' => '011-234-5678',
                'month' => '2026-10',
                'due_date' => '2026-10-25',
                'amount' => 14200.00,
                'payment' => 14200.00,
                'status' => 'Pending',
                'notes' => 'High-speed prepress cloud design upload and client file transfers',
                'paid_date' => '',
                'paid_amount' => 0.00,
                'paid_method' => '',
                'paid_ref' => '',
                'paid_note' => '',
            ],
            [
                'id' => 4,
                'title' => 'Main Street Printing Shop & Factory Premises Rent (October)',
                'category' => 'Shop Rent',
                'provider' => 'Premises Landlord (Mr. K. Perera)',
                'account_no' => 'RENT-PREM-128',
                'month' => '2026-10',
                'due_date' => '2026-10-05',
                'amount' => 65000.00,
                'payment' => 65000.00,
                'status' => 'Paid',
                'paid_date' => '2026-10-04',
                'paid_amount' => 65000.00,
                'paid_method' => 'Bank Transfer',
                'paid_ref' => 'COMBANK-FT-88219',
                'paid_note' => 'Monthly lease rental transferred',
                'notes' => 'Monthly commercial workshop lease rental',
            ],
            [
                'id' => 5,
                'title' => 'Dialog Axiata Corporate Mobile Lines (5 SIMs)',
                'category' => 'Telephone & Mobile',
                'provider' => 'Dialog Axiata PLC',
                'account_no' => '077-889-0012',
                'month' => '2026-10',
                'due_date' => '2026-10-22',
                'amount' => 8900.00,
                'payment' => 8900.00,
                'status' => 'Paid',
                'paid_date' => '2026-10-20',
                'paid_amount' => 8900.00,
                'paid_method' => 'Card',
                'paid_ref' => 'VISA-AUTO-9912',
                'paid_note' => 'Automatic credit card debit',
                'notes' => 'Sales representatives and dispatch riders communication bill',
            ],
            [
                'id' => 6,
                'title' => 'Konica Minolta & Roland Plotter Service Contract',
                'category' => 'Maintenance & Other',
                'provider' => 'Techno Graphic Services',
                'account_no' => 'AMC-TGS-2026',
                'month' => '2026-10',
                'due_date' => '2026-10-29',
                'amount' => 18000.00,
                'payment' => 18000.00,
                'status' => 'Pending',
                'notes' => 'Scheduled printhead cleaning, UV lamp maintenance and RIP calibration',
                'paid_date' => '',
                'paid_amount' => 0.00,
                'paid_method' => '',
                'paid_ref' => '',
                'paid_note' => '',
            ],
            [
                'id' => 7,
                'title' => 'CEB Heavy Power (September)',
                'category' => 'Electricity',
                'provider' => 'Ceylon Electricity Board (CEB)',
                'account_no' => '042-881-9921',
                'month' => '2026-09',
                'due_date' => '2026-09-30',
                'amount' => 46200.00,
                'payment' => 46200.00,
                'status' => 'Paid',
                'paid_date' => '2026-09-28',
                'paid_amount' => 46200.00,
                'paid_method' => 'Bank Transfer',
                'paid_ref' => 'BOC-TXN-55410',
                'paid_note' => 'Settled prior to month end',
                'notes' => 'September workshop electricity usage',
            ],
            [
                'id' => 8,
                'title' => 'NWSDB Water Supply (September)',
                'category' => 'Water Board',
                'provider' => 'National Water Supply & Drainage Board',
                'account_no' => '11/204/883/02',
                'month' => '2026-09',
                'due_date' => '2026-09-30',
                'amount' => 4600.00,
                'payment' => 4600.00,
                'status' => 'Paid',
                'paid_date' => '2026-09-29',
                'paid_amount' => 4600.00,
                'paid_method' => 'Cash',
                'paid_ref' => 'WATER-REC-8810',
                'paid_note' => 'Settled at post office cash counter',
                'notes' => 'September municipal water bill',
            ],
            [
                'id' => 9,
                'title' => 'SLT Megaline 100Mbps Ultra Fiber Line (September)',
                'category' => 'Internet & Fiber',
                'provider' => 'Sri Lanka Telecom (SLT-Mobitel)',
                'account_no' => '011-234-5678',
                'month' => '2026-09',
                'due_date' => '2026-09-25',
                'amount' => 14200.00,
                'payment' => 14200.00,
                'status' => 'Paid',
                'paid_date' => '2026-09-24',
                'paid_amount' => 14200.00,
                'paid_method' => 'Bank Transfer',
                'paid_ref' => 'BOC-ONLINE-8812',
                'paid_note' => 'Settled online',
                'notes' => 'September high-speed internet fiber',
            ],
            [
                'id' => 10,
                'title' => 'Main Street Printing Shop & Factory Premises Rent (September)',
                'category' => 'Shop Rent',
                'provider' => 'Premises Landlord (Mr. K. Perera)',
                'account_no' => 'RENT-PREM-128',
                'month' => '2026-09',
                'due_date' => '2026-09-05',
                'amount' => 65000.00,
                'payment' => 65000.00,
                'status' => 'Paid',
                'paid_date' => '2026-09-04',
                'paid_amount' => 65000.00,
                'paid_method' => 'Bank Transfer',
                'paid_ref' => 'COMBANK-FT-3391',
                'paid_note' => 'Monthly shop lease rental',
                'notes' => 'September workshop rental',
            ],
        ];

        $search = strtolower(trim((string) ($filters['search'] ?? $filters['q'] ?? '')));
        if ($search !== '') {
            $demoData = array_filter($demoData, function ($item) use ($search) {
                return str_contains(strtolower($item['title']), $search)
                    || str_contains(strtolower($item['category']), $search)
                    || str_contains(strtolower($item['provider']), $search)
                    || str_contains(strtolower($item['account_no']), $search);
            });
        }

        $models = array_map(function ($attributes) {
            $payment = new Payment;
            $payment->forceFill($attributes);

            return $payment;
        }, array_values($demoData));

        return new Collection($models);
    }

    /**
     * Resolve paginated demo operating expenses matching requested page & per_page.
     *
     * @param  array<string, mixed>  $filters
     */
    public function resolveDemoOperatingExpensesPaginator(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $collection = $this->resolveDemoOperatingExpenses($filters);
        $page = (int) ($filters['page'] ?? 1);
        $sliced = $collection->slice(($page - 1) * $perPage, $perPage)->values();

        return new \Illuminate\Pagination\LengthAwarePaginator(
            $sliced,
            $collection->count(),
            $perPage,
            $page,
            ['path' => Paginator::resolveCurrentPath()]
        );
    }
}
