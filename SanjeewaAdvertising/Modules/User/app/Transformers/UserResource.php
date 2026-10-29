<?php

namespace Modules\User\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\User\Models\User;

/**
 * @mixin User
 */
class UserResource extends JsonResource
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
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => trim("{$this->first_name} {$this->last_name}"),
            'mobile' => $this->mobile,
            'username' => $this->username,
            'is_login' => (bool) $this->is_login,
            'register_at' => $this->register_at?->toIso8601String() ?? $this->register_at,
            'user_statuses_id' => $this->user_statuses_id,
            'status' => new UserStatusResource($this->whenLoaded('status')),
            'logins' => UserLoginResource::collection($this->whenLoaded('logins')),
        ];
    }
}
