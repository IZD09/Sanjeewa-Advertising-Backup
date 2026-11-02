<?php

namespace Modules\Transaction\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
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
        return $this->buildPaymentsQuery($filters)->get();
    }

    /**
     * Retrieve paginated customer payments.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getPayments(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        return $this->buildPaymentsQuery($filters)->paginate($perPage);
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
        return $this->buildGrnPaymentsQuery($filters)->get();
    }

    /**
     * Retrieve paginated GRN payments.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getGrnPayments(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        return $this->buildGrnPaymentsQuery($filters)->paginate($perPage);
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
}
