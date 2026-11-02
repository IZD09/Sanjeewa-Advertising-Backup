<?php

namespace Modules\Transaction\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\PrintJob\Transformers\PrintJobResource;
use Modules\Transaction\Models\Payment;

/**
 * @mixin Payment
 */
class PaymentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $amount = (float) ($this->amount ?? $this->payment ?? 0);
        $paid = (float) ($this->paid_amount ?? ($this->status === 'Paid' ? $amount : 0));

        return [
            'id' => $this->id,
            'payment' => (float) $this->payment,
            'amount' => $amount,
            'title' => $this->title ?? 'Operating Bill',
            'category' => $this->category ?? 'Electricity',
            'provider' => $this->provider ?? 'Ceylon Electricity Board (CEB)',
            'account_no' => $this->account_no ?? '042-881-9921',
            'month' => $this->month ?? '2026-10',
            'due_date' => $this->due_date ?? ($this->pay_date instanceof \DateTimeInterface ? $this->pay_date->format('Y-m-d') : ($this->pay_date ?? now()->toDateString())),
            'status' => $this->status ?? 'Pending',
            'paid_date' => $this->paid_date ?? '',
            'paid_amount' => $paid,
            'paid_method' => $this->paid_method ?? '',
            'paid_ref' => $this->paid_ref ?? '',
            'paid_note' => $this->paid_note ?? '',
            'notes' => $this->notes ?? '',
            'print_jobs_id' => $this->print_jobs_id,
            'payment_types_id' => $this->payment_types_id,
            'payment_statuses_id' => $this->payment_statuses_id,
            'pay_date' => $this->pay_date?->toIso8601String() ?? $this->pay_date,
            'type' => new PaymentTypeResource($this->whenLoaded('paymentType')),
            'status' => new PaymentStatusResource($this->whenLoaded('paymentStatus')),
            'print_job' => new PrintJobResource($this->whenLoaded('printJob')),
        ];
    }
}
