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
            'view' => (bool) $this->view,
            'create' => (bool) $this->create,
            'edit' => (bool) $this->edit,
            'delete' => (bool) $this->delete,
            'export' => (bool) $this->export,
            'module' => new SystemModuleResource($this->whenLoaded('systemModule')),
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
