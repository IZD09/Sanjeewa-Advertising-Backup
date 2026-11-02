<?php

namespace Modules\Admin\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Admin\Models\AdminType;

/**
 * @mixin AdminType
 */
class AdminTypeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'admin_type' => $this->admin_type,
            'name' => $this->admin_type,
        ];
    }
}
