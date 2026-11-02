<?php

namespace Modules\Admin\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Admin\Models\AdminStatus;

/**
 * @mixin AdminStatus
 */
class AdminStatusResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'admin_statas' => $this->admin_statas,
            'name' => $this->admin_statas,
        ];
    }
}
