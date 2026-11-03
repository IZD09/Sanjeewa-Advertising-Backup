<?php

namespace Modules\Transaction\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Transaction\Models\ExpencesessStatus;

/**
 * @mixin ExpencesessStatus
 */
class ExpencesessStatusResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'expencesess_status' => $this->expencesess_status,
            'name' => $this->expencesess_status,
        ];
    }
}
