<?php

namespace Modules\Supplier\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Supplier\Models\Supplier;

/**
 * @mixin Supplier
 */
class SupplierResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'mobile' => $this->mobile,
            'email' => $this->email,
            'purchase_orders_count' => $this->whenCounted('purchaseOrders'),
            'purchase_orders' => PurchaseOrderResource::collection($this->whenLoaded('purchaseOrders')),
        ];
    }
}
