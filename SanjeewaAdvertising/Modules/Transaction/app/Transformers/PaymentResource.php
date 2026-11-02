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
        return [
            'id' => $this->id,
            'payment' => (float) $this->payment,
            'amount' => (float) $this->payment,
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
