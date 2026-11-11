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
        $paidAmount = 0.0;
        $productNames = [];
        $methods = [];
        $jobIds = [];

        foreach ($printJobs as $job) {
            $jobIds[] = $job->id;
            if ($job->printType?->print_type) {
                $productNames[] = $job->printType->print_type;
            }

            $costSum = $job->cost?->printCosts?->sum('price') ?? 0;
            $unitPrice = $costSum > 0 ? (float) $costSum : 120.00;
            $qty = max(1, (int) $job->qty);
            $subtotal = $unitPrice * $qty;
            $discount = (float) ($job->cost?->discount ?? 0);
            $totalAmount += max(0, $subtotal - $discount);

            $jobPaid = (float) $job->payments->sum('payment');
            $paidAmount += $jobPaid;

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
        if ($paidAmount === 0.0 && isset($this->paid_amount)) {
            $paidAmount = (float) $this->paid_amount;
        }

        $balanceAmount = max(0.0, $totalAmount - $paidAmount);

        if ($balanceAmount <= 0.0 && $paidAmount > 0.0) {
            $stage = 'Complete Payment';
            $status = 'Paid';
        } elseif ($paidAmount > 0.0 && $balanceAmount > 0.0) {
            $stage = 'Advance Payment';
            $status = 'Partial';
        } else {
            $stage = 'Pending Payment';
            $status = 'Pending';
        }

        $method = count($methods) > 0 ? $methods[0] : ($this->method ?? 'Cash');
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
            'paid_amount' => $paidAmount,
            'amount' => $paidAmount,
            'balance_amount' => $balanceAmount,
            'balance' => $balanceAmount,
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
