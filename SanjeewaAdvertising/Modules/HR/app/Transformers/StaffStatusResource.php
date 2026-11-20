<?php

namespace Modules\HR\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\HR\Models\StaffStatus;

/**
 * @mixin StaffStatus
 */
class StaffStatusResource extends JsonResource
{
    /**
     * Transform the staff status resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'staff_status' => $this->staff_status,
        ];
    }
}
