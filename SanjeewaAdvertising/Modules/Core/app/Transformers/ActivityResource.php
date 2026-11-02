<?php

namespace Modules\Core\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Core\Models\Activity;

/**
 * @mixin Activity
 */
class ActivityResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'activity_time' => $this->activity_time?->toIso8601String() ?? $this->activity_time,
            'user_or_admin' => $this->user_or_admin,
            'actor_type' => $this->user_or_admin === 2 ? 'admin' : 'user',
            'activity' => $this->activity,
            'activity_types_id' => $this->activity_types_id,
            'type' => new ActivityTypeResource($this->whenLoaded('activityType')),
            'user_activity' => $this->whenLoaded('userActivity'),
            'admin_activity' => $this->whenLoaded('adminActivity'),
        ];
    }
}
