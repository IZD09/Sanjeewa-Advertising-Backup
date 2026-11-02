<?php

namespace Modules\PrintJob\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\PrintJob\Models\PrintJobStatusHistory;

/**
 * @mixin PrintJobStatusHistory
 */
class PrintJobStatusHistoryResource extends JsonResource
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
            'print_job_statuses_id' => $this->print_job_statuses_id,
            'update_at' => $this->update_at?->toIso8601String() ?? $this->update_at,
            'status' => new PrintJobStatusResource($this->whenLoaded('status')),
        ];
    }
}
