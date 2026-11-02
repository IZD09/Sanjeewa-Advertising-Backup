<?php

namespace Modules\Core\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Core\Models\ActivityType;

/**
 * @mixin ActivityType
 */
class ActivityTypeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'activity_type' => $this->activity_type,
            'name' => $this->activity_type,
        ];
    }
}
