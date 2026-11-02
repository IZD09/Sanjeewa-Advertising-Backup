<?php

namespace Modules\Supplier\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Supplier\Models\Grn;

/**
 * @mixin Grn
 */
class GrnResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'at_time' => $this->at_time?->toIso8601String() ?? $this->at_time,
            'supplier_invoice' => $this->pivot?->supplyer_invoice ?? null,
            'stocks_count' => $this->whenCounted('stocks'),
            'purchase_orders' => PurchaseOrderResource::collection($this->whenLoaded('purchaseOrders')),
            'stocks' => $this->whenLoaded('stocks'),
        ];
    }
}
