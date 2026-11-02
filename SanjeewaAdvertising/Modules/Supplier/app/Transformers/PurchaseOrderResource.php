<?php

namespace Modules\Supplier\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Supplier\Models\PurchaseOrder;

/**
 * @mixin PurchaseOrder
 */
class PurchaseOrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'suppliers_id' => $this->suppliers_id,
            'add_date' => $this->add_date?->toIso8601String() ?? $this->add_date,
            'supplier' => new SupplierResource($this->whenLoaded('supplier')),
            'items' => PurchaseOrderItemResource::collection($this->whenLoaded('items')),
            'items_count' => $this->whenCounted('items'),
            'grns' => GrnResource::collection($this->whenLoaded('grns')),
        ];
    }
}
