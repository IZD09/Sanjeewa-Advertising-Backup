<?php

namespace Modules\Design\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Design\Models\PrintCost;

/**
 * @mixin PrintCost
 */
class PrintCostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'print_cost_type_id' => $this->print_cost_type_id,
            'price' => (float) $this->price,
            'add_at' => $this->add_at?->toIso8601String() ?? $this->add_at,
            'print_type' => $this->whenLoaded('printCostType', function () {
                return $this->printCostType?->relationLoaded('printType')
                    ? new PrintTypeResource($this->printCostType->printType)
                    : null;
            }),
        ];
    }
}
