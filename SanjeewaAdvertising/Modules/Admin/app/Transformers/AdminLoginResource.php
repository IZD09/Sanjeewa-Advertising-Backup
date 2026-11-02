<?php

namespace Modules\Admin\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Admin\Models\AdminLogin;

/**
 * @mixin AdminLogin
 */
class AdminLoginResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'admins_id' => $this->admins_id,
            'login' => $this->login?->toIso8601String() ?? $this->login,
            'logout' => $this->logout?->toIso8601String() ?? $this->logout,
        ];
    }
}
