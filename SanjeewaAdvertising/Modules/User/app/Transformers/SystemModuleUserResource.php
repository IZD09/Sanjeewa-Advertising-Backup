<?php

namespace Modules\User\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\User\Models\SystemModuleUser;

/**
 * @mixin SystemModuleUser
 */
class SystemModuleUserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'system_modules_id' => $this->system_modules_id,
            'users_id' => $this->users_id,
            'permision_stateses_id' => $this->permision_stateses_id,
            'module' => new SystemModuleResource($this->whenLoaded('systemModule')),
            'permission_state' => new PermisionStateResource($this->whenLoaded('permisionState')),
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
