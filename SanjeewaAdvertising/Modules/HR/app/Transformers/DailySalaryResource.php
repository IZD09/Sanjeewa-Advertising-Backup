<?php

namespace Modules\HR\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\HR\Models\DalySalary;

/**
 * @mixin DalySalary
 */
class DailySalaryResource extends JsonResource
{
    /**
     * Transform the daily salary payment resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'staff_id' => (int) $this->staff_id,
            'amount' => (float) $this->amount,
            'pay_at' => $this->pay_at?->format('Y-m-d H:i'),
            'pay_at_date' => $this->pay_at?->format('Y-m-d'),
            'pay_at_month' => $this->pay_at?->format('Y-m'),
            'pay_at_iso' => $this->pay_at?->toIso8601String(),
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
            'daily_salary_total' => $this->when(
                $this->getAttribute('daily_salary_total') !== null,
                fn (): float => (float) $this->getAttribute('daily_salary_total')
            ),
            'daily_salary_count' => $this->when(
                $this->getAttribute('daily_salary_count') !== null,
                fn (): int => (int) $this->getAttribute('daily_salary_count')
            ),
            'today_daily_salary_total' => $this->when(
                $this->getAttribute('today_daily_salary_total') !== null,
                fn (): float => (float) $this->getAttribute('today_daily_salary_total')
            ),
            'today_daily_salary_count' => $this->when(
                $this->getAttribute('today_daily_salary_count') !== null,
                fn (): int => (int) $this->getAttribute('today_daily_salary_count')
            ),
        ];
    }
}
