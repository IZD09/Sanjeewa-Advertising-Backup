<?php

namespace Modules\Invoice\Transformers;

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
        return [
            'id' => $this->id,
            'customer_id' => $this->customer_id,
            'invoice_no' => $this->invoice_no ?? ($this->id ? 'INV-2026-' . str_pad((string) $this->id, 4, '0', STR_PAD_LEFT) : 'INV-2026-1048'),
            'customer_name' => $this->customer_name ?? $this->customer?->name ?? 'Customer',
            'customer_mobile' => $this->customer_mobile ?? $this->customer?->mobile ?? '',
            'product_name' => $this->product_name ?? 'Printing Job',
            'total_amount' => (float) ($this->total_amount ?? $this->totalBill ?? 0),
            'paid_amount' => (float) ($this->paid_amount ?? $this->amount ?? 0),
            'balance_amount' => (float) ($this->balance_amount ?? $this->balance ?? 0),
            'stage' => $this->stage ?? 'Complete Payment',
            'payment_status' => $this->payment_status ?? 'Paid',
            'order_status' => $this->order_status ?? 'Completed',
            'method' => $this->method ?? 'Cash',
            'ref' => $this->ref ?? ('REC-' . ($this->id ?? '1048')),
            'note' => $this->note ?? '',
            'date' => $this->date ?? ($this->invoice_at instanceof \DateTimeInterface ? $this->invoice_at->format('Y-m-d') : ($this->invoice_at ?? now()->toDateString())),
            'invoice_at' => $this->invoice_at?->toIso8601String() ?? $this->invoice_at,
            'due_date' => $this->due_date?->toIso8601String() ?? $this->due_date,
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'print_jobs' => PrintJobResource::collection($this->whenLoaded('printJobs')),
            'print_jobs_count' => $this->whenCounted('printJobs'),
        ];
    }
}
