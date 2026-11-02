<?php

namespace Modules\Transaction\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Transaction\Models\PaymentStatus;

/**
 * @mixin PaymentStatus
 */
class PaymentStatusResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payment_status' => $this->payment_status,
            'name' => $this->payment_status,
        ];
    }
}
