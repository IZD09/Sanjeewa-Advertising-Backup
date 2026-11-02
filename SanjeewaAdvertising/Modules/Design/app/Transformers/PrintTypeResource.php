<?php

namespace Modules\Design\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Design\Models\PrintType;

/**
 * @mixin PrintType
 */
class PrintTypeResource extends JsonResource
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
            'print_type' => $this->print_type,
            'name' => $this->print_type,
            'cost_types' => PrintCostTypeResource::collection($this->whenLoaded('printCostTypes')),
            'print_jobs_count' => $this->whenCounted('printJobs'),
        ];
    }
}
