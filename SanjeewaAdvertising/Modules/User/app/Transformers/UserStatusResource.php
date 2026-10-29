<?php

namespace Modules\User\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\User\Models\UserStatus;

/**
 * @mixin UserStatus
 */
class UserStatusResource extends JsonResource
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
            'user_status' => $this->user_status,
        ];
    }
}
