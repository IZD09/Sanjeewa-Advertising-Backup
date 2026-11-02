<?php

namespace Modules\Design\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Design\Models\PrintCostType;

/**
 * @mixin PrintCostType
 */
class PrintCostTypeResource extends JsonResource
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
            'print_types_id' => $this->print_types_id,
            'print_type' => new PrintTypeResource($this->whenLoaded('printType')),
            'print_costs' => PrintCostResource::collection($this->whenLoaded('printCosts')),
        ];
    }
}
