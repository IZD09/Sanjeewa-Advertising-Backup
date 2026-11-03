<?php

namespace Modules\User\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\User\Models\SystemModule;

/**
 * @mixin SystemModule
 */
class SystemModuleResource extends JsonResource
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
            'system_module' => $this->system_module,
            'users_count' => $this->whenCounted('users'),
        ];
    }
}
