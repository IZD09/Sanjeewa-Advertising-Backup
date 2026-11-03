<?php

namespace Modules\Transaction\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Transaction\Models\Expencesess;

/**
 * @mixin Expencesess
 */
class ExpencesessResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'expencesess_types_id' => $this->expencesess_types_id,
            'price' => (float) $this->price,
            'amount' => (float) $this->price,
            'expencesess_statuses_id' => $this->expencesess_statuses_id,
            'add_by' => $this->add_by,
            'pay_by' => $this->pay_by,
            'add_date' => $this->add_date?->toIso8601String() ?? $this->add_date,
            'pay_at' => $this->pay_at?->toIso8601String() ?? $this->pay_at,
            'type' => new ExpencesessTypeResource($this->whenLoaded('type')),
            'status' => new ExpencesessStatusResource($this->whenLoaded('status')),
            'added_by' => $this->whenLoaded('addedBy', function () {
                return [
                    'id' => $this->addedBy->id,
                    'name' => trim("{$this->addedBy->first_name} {$this->addedBy->last_name}"),
                    'username' => $this->addedBy->username,
                ];
            }),
            'paid_by' => $this->whenLoaded('paidBy', function () {
                return $this->paidBy ? [
                    'id' => $this->paidBy->id,
                    'name' => trim("{$this->paidBy->first_name} {$this->paidBy->last_name}"),
                    'username' => $this->paidBy->username,
                ] : null;
            }),
        ];
    }
}
