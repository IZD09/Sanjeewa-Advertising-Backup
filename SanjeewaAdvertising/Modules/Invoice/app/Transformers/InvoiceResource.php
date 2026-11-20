<?php

namespace Modules\Invoice\Transformers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Customer\Transformers\CustomerResource;
use Modules\Invoice\Models\Invoice;
use Modules\PrintJob\Transformers\PrintJobResource;

/**
 * @mixin Invoice
 */
class InvoiceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $printJobs = $this->printJobs ?? collect();

        $totalAmount = 0.0;
        $installmentPaidAmount = 0.0;
        $jobCumulativePaidAmount = 0.0;
        $hasMissingCost = false;
        $productNames = [];
        $methods = [];
        $installmentMethods = [];
        $jobIds = [];
        $maxInstallments = 1;
        $currentInstallmentNumber = 1;

        foreach ($printJobs as $job) {
            $jobIds[] = $job->id;
            if ($job->printType?->print_type) {
                $productNames[] = $job->printType->print_type;
            }

            $costSum = $job->cost?->printCosts?->sum('price') ?? 0;
            if ($costSum <= 0) {
                $hasMissingCost = true;
            }
            $unitPrice = $costSum > 0 ? (float) $costSum : 120.00;
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

            if ($unitSymbol === 'pcs') {
                $subtotal = $unitPrice * $qty;
            } else {
                $subtotal = $areaSqFt * $unitPrice * $qty;
            }

            $discount = (float) ($job->cost?->discount ?? 0);
            $totalAmount += max(0, $subtotal - $discount);

            // Job total payments
            $jobTotalPaid = (float) $job->payments->sum('payment');
            $jobCumulativePaidAmount += $jobTotalPaid;

            // Invoices and payments for this specific job sorted chronologically
            $jobInvoices = $job->relationLoaded('invoices')
                ? $job->invoices->sortBy(fn ($inv) => $inv->invoice_at ? Carbon::parse($inv->invoice_at)->getTimestamp() : $inv->id)->values()
                : collect();
            $jobPayments = $job->relationLoaded('payments')
                ? $job->payments->sortBy(fn ($p) => $p->pay_date ? Carbon::parse($p->pay_date)->getTimestamp() : $p->id)->values()
                : collect();

            $totalJobInstallments = max(1, $jobInvoices->count(), $jobPayments->count());
            $invIdx = $jobInvoices->search(fn ($inv) => (int) $inv->id === (int) $this->id);

            // Find this specific invoice's payment installment
            $thisInvoicePayment = 0.0;
            $thisInvoiceMethod = null;

            // 1. Priority 1: Match payment by timestamp with invoice_at (exact or within 60 seconds)
            $matchedPay = null;
            if ($this->invoice_at && $jobPayments->isNotEmpty()) {
                $targetTime = $this->invoice_at instanceof \DateTimeInterface
                    ? $this->invoice_at->getTimestamp()
                    : Carbon::parse($this->invoice_at)->getTimestamp();

                $matchedPay = $jobPayments->first(function ($p) use ($targetTime) {
                    $pTime = $p->pay_date instanceof \DateTimeInterface
                        ? $p->pay_date->getTimestamp()
                        : Carbon::parse($p->pay_date)->getTimestamp();

                    return abs($pTime - $targetTime) <= 60;
                });
            }

            // 2. Priority 2: If no exact timestamp match, align invoice and payment installment positions
            if (! $matchedPay && $invIdx !== false && $jobPayments->isNotEmpty()) {
                if ($jobInvoices->count() === $jobPayments->count()) {
                    $matchedPay = $jobPayments->get($invIdx);
                } elseif ($jobPayments->count() > $jobInvoices->count()) {
                    $payIdx = $jobPayments->count() - ($jobInvoices->count() - $invIdx);
                    $matchedPay = $jobPayments->has($payIdx) ? $jobPayments->get($payIdx) : $jobPayments->last();
                } else {
                    $matchedPay = $jobPayments->get($invIdx) ?? $jobPayments->last();
                }
            }

            if ($matchedPay) {
                $thisInvoicePayment = (float) $matchedPay->payment;
                $thisInvoiceMethod = $matchedPay->paymentType?->payment_type;
                $matchedIdx = $jobPayments->search(fn ($p) => $p->id === $matchedPay->id);
                if ($matchedIdx !== false) {
                    $currentInstallmentNumber = $matchedIdx + 1;
                }
            } elseif ($thisInvoicePayment <= 0.0) {
                if ($totalJobInstallments === 1) {
                    $thisInvoicePayment = $jobTotalPaid;
                    $thisInvoiceMethod = $jobPayments->first()?->paymentType?->payment_type;
                } else {
                    $firstPay = $jobPayments->first();
                    $thisInvoicePayment = (float) ($firstPay?->payment ?? 0);
                    $thisInvoiceMethod = $firstPay?->paymentType?->payment_type;
                }
            }

            $installmentPaidAmount += $thisInvoicePayment;
            $maxInstallments = max($maxInstallments, $totalJobInstallments);
            if ($invIdx !== false) {
                $currentInstallmentNumber = $invIdx + 1;
            }

            if ($thisInvoiceMethod && ! in_array($thisInvoiceMethod, $installmentMethods, true)) {
                $installmentMethods[] = $thisInvoiceMethod;
            }

            foreach ($job->payments as $p) {
                $mName = $p->paymentType?->payment_type ?? 'Cash';
                if (! in_array($mName, $methods, true)) {
                    $methods[] = $mName;
                }
            }
        }

        // Fallback to model attributes if jobs not calculated or explicit attributes present
        if ($totalAmount === 0.0 && isset($this->total_amount)) {
            $totalAmount = (float) $this->total_amount;
        }
        if ($installmentPaidAmount === 0.0 && isset($this->paid_amount)) {
            $installmentPaidAmount = (float) $this->paid_amount;
        }
        if ($installmentPaidAmount === 0.0) {
            $installmentPaidAmount = $jobCumulativePaidAmount;
        }

        if ($hasMissingCost && $jobCumulativePaidAmount > $totalAmount) {
            $totalAmount = $jobCumulativePaidAmount;
        }

        $balanceAmount = max(0.0, $totalAmount - $jobCumulativePaidAmount);

        if ($balanceAmount <= 0.01 && $jobCumulativePaidAmount > 0.0) {
            $balanceAmount = 0.0;
            $stage = 'Complete Payment';
            $status = 'Paid';
        } elseif ($jobCumulativePaidAmount > 0.0 && $balanceAmount > 0.01) {
            $stage = 'Advance Payment';
            $status = 'Partial';
        } else {
            $stage = 'Pending Payment';
            $status = 'Pending';
        }

        $method = count($installmentMethods) > 0 ? $installmentMethods[0] : (count($methods) > 0 ? $methods[0] : ($this->method ?? 'Cash'));
        $productName = count($productNames) > 0 ? implode(', ', array_unique($productNames)) : ($this->product_name ?? 'Printing Job');

        $invAt = $this->invoice_at instanceof \DateTimeInterface
            ? $this->invoice_at
            : ($this->invoice_at ? Carbon::parse($this->invoice_at) : now());

        $dueDate = $this->due_date instanceof \DateTimeInterface
            ? $this->due_date
            : ($this->due_date ? Carbon::parse($this->due_date) : now()->addDays(14));

        return [
            'id' => $this->id,
            'customer_id' => $this->customer_id,
            'invoice_no' => $this->invoice_no ?? 'INV-2026-'.str_pad((string) $this->id, 4, '0', STR_PAD_LEFT),
            'customer_name' => $this->customer_name ?? $this->customer?->name ?? 'Customer #'.$this->customer_id,
            'customer_mobile' => $this->customer_mobile ?? $this->customer?->mobile ?? '',
            'product_name' => $productName,
            'total_amount' => $totalAmount,
            'totalBill' => $totalAmount,
            'paid_amount' => $installmentPaidAmount,
            'amount' => $installmentPaidAmount,
            'cumulative_paid_amount' => $jobCumulativePaidAmount,
            'balance_amount' => $balanceAmount,
            'balance' => $balanceAmount,
            'installment_number' => $currentInstallmentNumber,
            'total_installments' => $maxInstallments,
            'is_multi_installment' => $maxInstallments > 1,
            'stage' => $this->stage ?? $stage,
            'payment_status' => $this->payment_status ?? $status,
            'order_status' => $this->order_status ?? 'Completed',
            'method' => $method,
            'ref' => $this->ref ?? "REC-INV-{$this->id}",
            'note' => $this->note ?? ($stage === 'Complete Payment' ? 'Full settlement cleared' : ($stage === 'Advance Payment' ? 'Advance deposit paid' : 'Payment pending')),
            'date' => $invAt->toDateString(),
            'invoice_at' => $invAt->toIso8601String(),
            'due_date' => $dueDate->toIso8601String(),
            'job_ids' => $jobIds,
            'jobs_count' => count($jobIds),
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'print_jobs' => PrintJobResource::collection($this->whenLoaded('printJobs')),
            'print_jobs_count' => count($jobIds),
        ];
    }
}
