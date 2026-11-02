<?php

namespace Modules\PrintJob\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\PrintJob\Models\PrintJobStatus;

/**
 * @mixin PrintJobStatus
 */
class PrintJobStatusResource extends JsonResource
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
            'print_job_states' => $this->print_job_states,
            'name' => $this->print_job_states,
        ];
    }
}
