<?php

namespace Modules\PrintJob\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\PrintJob\Models\PrintJob;

/**
 * @mixin PrintJob
 */
class PrintJobResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $latestStatusHistory = $this->relationLoaded('statusHistory')
            ? $this->statusHistory->sortByDesc('update_at')->first()
            : null;

        $currentStatus = $latestStatusHistory?->relationLoaded('status')
            ? $latestStatusHistory->status
            : null;

        return [
            'id' => $this->id,
            'users_id' => $this->users_id,
            'customer_id' => $this->customer_id,
            'print_types_id' => $this->print_types_id,
            'add_date' => $this->add_date?->toIso8601String() ?? $this->add_date,
            'qty' => (int) $this->qty,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'first_name' => $this->user->first_name,
                    'last_name' => $this->user->last_name,
                    'full_name' => trim("{$this->user->first_name} {$this->user->last_name}"),
                    'username' => $this->user->username,
                ];
            }),
            'customer' => $this->whenLoaded('customer', function () {
                return [
                    'id' => $this->customer->id,
                    'name' => $this->customer->name,
                    'mobile' => $this->customer->mobile,
                    'email' => $this->customer->email,
                ];
            }),
            'print_type' => $this->whenLoaded('printType', function () {
                return [
                    'id' => $this->printType->id,
                    'print_type' => $this->printType->print_type,
                ];
            }),
            'current_status' => $currentStatus ? new PrintJobStatusResource($currentStatus) : null,
            'status_history' => PrintJobStatusHistoryResource::collection($this->whenLoaded('statusHistory')),
            'cost' => new PrintJobCostResource($this->whenLoaded('cost')),
            'stock_items' => $this->whenLoaded('stockItems', function () {
                return $this->stockItems->map(fn ($stock) => [
                    'stock_id' => $stock->id,
                    'qty' => $stock->pivot ? (int) $stock->pivot->qty : 0,
                    'price' => (float) $stock->price,
                    'item_name' => $stock->relationLoaded('stockItem') ? $stock->stockItem?->item_name : null,
                ]);
            }),
            'payments_count' => $this->whenCounted('payments'),
            'invoices_count' => $this->whenCounted('invoices'),
        ];
    }
}
