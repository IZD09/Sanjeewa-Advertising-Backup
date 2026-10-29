<?php

namespace Modules\User\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\User\Models\UserLogin;

/**
 * @mixin UserLogin
 */
class UserLoginResource extends JsonResource
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
            'user_id' => $this->user_id,
            'login' => $this->login,
            'logout' => $this->logout,
        ];
    }
}
