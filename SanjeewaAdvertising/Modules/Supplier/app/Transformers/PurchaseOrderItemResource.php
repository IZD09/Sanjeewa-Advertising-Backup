<?php

namespace Modules\Supplier\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Supplier\Models\PurchaseOrderItem;

/**
 * @mixin PurchaseOrderItem
 */
class PurchaseOrderItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'purchase_orders_id' => $this->purchase_orders_id,
            'stock_items_id' => $this->stock_items_id,
            'unit_cost' => (float) $this->unit_cost,
            'qty_ordered' => (int) $this->qty_ordered,
            'qty_received' => (int) $this->qty_received,
            'stock_item' => $this->whenLoaded('stockItem', function () {
                return [
                    'id' => $this->stockItem->id,
                    'name' => $this->stockItem->name,
                    'code' => $this->stockItem->code,
                    'item_name' => $this->stockItem->name,
                    'item_code' => $this->stockItem->code,
                ];
            }),
        ];
    }
}
