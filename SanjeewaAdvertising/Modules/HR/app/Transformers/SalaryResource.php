<?php

namespace Modules\HR\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\HR\Models\Salary;

/**
 * @mixin Salary
 */
class SalaryResource extends JsonResource
{
    /**
     * Transform the salary resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'staff_id' => (int) $this->staff_id,
            'amount' => (float) $this->amount,
            'update_at' => $this->update_at?->format('Y-m-d H:i'),
            'update_at_iso' => $this->update_at?->toIso8601String(),
            'staff' => $this->whenLoaded('staff', function (): ?array {
                if (! $this->staff) {
                    return null;
                }

                return [
                    'id' => (int) $this->staff->id,
                    'first_name' => $this->staff->first_name,
                    'last_name' => $this->staff->last_name,
                    'full_name' => trim("{$this->staff->first_name} {$this->staff->last_name}"),
                    'nic' => $this->staff->nic,
                    'mobile' => $this->staff->mobile,
                    'staff_statuses_id' => (int) $this->staff->staff_statuses_id,
                    'status' => $this->staff->relationLoaded('status')
                        ? new StaffStatusResource($this->staff->status)
                        : null,
                ];
            }),
            'monthly_payroll_total' => $this->when(
                $this->getAttribute('monthly_payroll_total') !== null,
                fn (): float => (float) $this->getAttribute('monthly_payroll_total')
            ),
        ];
    }
}
