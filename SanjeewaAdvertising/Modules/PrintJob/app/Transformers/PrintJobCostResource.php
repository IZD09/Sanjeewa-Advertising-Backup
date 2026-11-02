<?php

namespace Modules\PrintJob\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\PrintJob\Models\PrintJobCost;

/**
 * @mixin PrintJobCost
 */
class PrintJobCostResource extends JsonResource
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
            'discount' => (float) $this->discount,
            'print_costs' => $this->whenLoaded('printCosts', function () {
                return $this->printCosts->map(fn ($cost) => [
                    'id' => $cost->id,
                    'print_cost_type_id' => $cost->print_cost_type_id,
                    'price' => (float) $cost->price,
                    'cost_type' => $cost->relationLoaded('printCostType') ? $cost->printCostType?->cost_type : null,
                ]);
            }),
        ];
    }
}
