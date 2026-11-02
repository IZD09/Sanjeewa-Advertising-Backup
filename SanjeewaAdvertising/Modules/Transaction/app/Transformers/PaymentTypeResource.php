<?php

namespace Modules\Transaction\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Transaction\Models\PaymentType;

/**
 * @mixin PaymentType
 */
class PaymentTypeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payment_type' => $this->payment_type,
            'name' => $this->payment_type,
        ];
    }
}
