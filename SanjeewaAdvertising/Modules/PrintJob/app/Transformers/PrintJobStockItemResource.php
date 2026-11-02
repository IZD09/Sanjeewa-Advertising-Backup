<?php

namespace Modules\PrintJob\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\PrintJob\Models\PrintJobStockItem;

/**
 * @mixin PrintJobStockItem
 */
class PrintJobStockItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'print_jobs_id' => $this->print_jobs_id,
            'stock_id' => $this->stock_id,
            'qty' => (int) $this->qty,
            'stock' => $this->whenLoaded('stock', function () {
                return [
                    'id' => $this->stock->id,
                    'stock_items_id' => $this->stock->stock_items_id,
                    'price' => (float) $this->stock->price,
                    'buy' => (float) $this->stock->buy,
                    'qty_available' => (int) $this->stock->qty,
                    'item_name' => $this->stock->relationLoaded('stockItem') ? $this->stock->stockItem?->item_name : null,
                ];
            }),
        ];
    }
}
