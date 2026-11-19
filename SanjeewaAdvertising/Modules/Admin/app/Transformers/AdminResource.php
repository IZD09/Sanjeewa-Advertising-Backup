<?php

namespace Modules\Admin\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Admin\Models\Admin;

/**
 * @mixin Admin
 */
class AdminResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => trim("{$this->first_name} {$this->last_name}"),
            'username' => $this->username,
            'mobile' => $this->mobile,
            'email' => $this->email,
            'add_time' => $this->add_time?->toIso8601String() ?? $this->add_time,
            'is_log' => (bool) $this->is_log,
            'admin_statuses_id' => $this->admin_statuses_id,
            'admin_types_id' => $this->admin_types_id,
            'status' => new AdminStatusResource($this->whenLoaded('status')),
            'type' => new AdminTypeResource($this->whenLoaded('type')),
            'logins' => AdminLoginResource::collection($this->whenLoaded('logins')),
            'activities' => $this->whenLoaded('activities', function () {
                return $this->activities->map(function ($adminAct) {
                    $act = $adminAct->relationLoaded('activity') ? $adminAct->activity : null;
                    if (! $act) {
                        return null;
                    }

                    $payload = is_array($act->activity) ? $act->activity : (json_decode($act->activity, true) ?? []);
                    $typeName = $act->relationLoaded('activityType') && $act->activityType ? $act->activityType->activity_type : ($payload['type'] ?? 'Activity');

                    return [
                        'id' => 'ACT-'.$act->id,
                        'raw_id' => (int) $act->id,
                        'timestamp' => $act->activity_time?->toIso8601String(),
                        'formatted_time' => $act->activity_time?->format('Y-m-d H:i:s'),
                        'type' => $typeName,
                        'action' => (string) ($payload['action'] ?? strtolower(str_replace(' ', '_', $typeName))),
                        'message' => (string) ($payload['message'] ?? $typeName),
                        'details' => $payload,
                    ];
                })->filter()->values();
            }),
        ];
    }
}
