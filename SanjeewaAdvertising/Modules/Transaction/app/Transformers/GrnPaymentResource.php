<?php

namespace Modules\Transaction\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Supplier\Transformers\GrnResource;
use Modules\Transaction\Models\GrnPayment;

/**
 * @mixin GrnPayment
 */
class GrnPaymentResource extends JsonResource
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
            'grn_id' => $this->grn_id,
            'payment_types_id' => $this->payment_types_id,
            'payment_statuses_id' => $this->payment_statuses_id,
            'pay_date' => $this->pay_date?->toIso8601String() ?? $this->pay_date,
            'type' => new PaymentTypeResource($this->whenLoaded('paymentType')),
            'status' => new PaymentStatusResource($this->whenLoaded('paymentStatus')),
            'grn' => new GrnResource($this->whenLoaded('grn')),
        ];
    }
}
