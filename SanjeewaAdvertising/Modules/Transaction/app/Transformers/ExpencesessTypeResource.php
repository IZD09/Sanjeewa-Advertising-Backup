<?php

namespace Modules\Transaction\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Transaction\Models\ExpencesessType;

/**
 * @mixin ExpencesessType
 */
class ExpencesessTypeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'expencesess_type' => $this->expencesess_type,
            'name' => $this->expencesess_type,
        ];
    }
}
