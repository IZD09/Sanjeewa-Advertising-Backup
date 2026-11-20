<?php

namespace Modules\HR\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\HR\Models\Staff;

/**
 * @mixin Staff
 */
class StaffResource extends JsonResource
{
    /**
     * Transform the staff resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $latestSalary = $this->relationLoaded('salaries') ? $this->salaries->first() : null;
        $latestSalaryAmount = $latestSalary ? (float) $latestSalary->amount : null;

        return [
            'id' => (int) $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => trim("{$this->first_name} {$this->last_name}"),
            'mobile' => $this->mobile,
            'nic' => $this->nic,
            'staff_statuses_id' => (int) $this->staff_statuses_id,
            'status' => new StaffStatusResource($this->whenLoaded('status')),
            'add_at' => $this->add_at?->format('Y-m-d H:i:s'),
            'add_at_date' => $this->add_at?->format('Y-m-d'),
            'add_by' => (int) $this->add_by,
            'added_by' => $this->whenLoaded('addedBy', function (): ?array {
                if (! $this->addedBy) {
                    return null;
                }

                return [
                    'id' => (int) $this->addedBy->id,
                    'first_name' => $this->addedBy->first_name,
                    'last_name' => $this->addedBy->last_name,
                    'full_name' => trim("{$this->addedBy->first_name} {$this->addedBy->last_name}"),
                    'username' => $this->addedBy->username,
                ];
            }),
            'latest_salary' => $latestSalaryAmount,
            'salaries' => $this->whenLoaded('salaries', function (): array {
                return $this->salaries->map(fn ($salary): array => [
                    'id' => (int) $salary->id,
                    'amount' => (float) $salary->amount,
                    'update_at' => $salary->update_at?->format('Y-m-d H:i'),
                ])->values()->all();
            }),
            'daily_salaries' => $this->whenLoaded('dailySalaries', function (): array {
                return $this->dailySalaries->map(fn ($daily): array => [
                    'id' => (int) $daily->id,
                    'amount' => (float) $daily->amount,
                    'pay_at' => $daily->pay_at?->format('Y-m-d H:i'),
                    'pay_at_date' => $daily->pay_at?->format('Y-m-d'),
                    'pay_at_month' => $daily->pay_at?->format('Y-m'),
                ])->values()->all();
            }),
            'payroll_summary' => $this->whenLoaded('dailySalaries', function () use ($latestSalaryAmount): array {
                $currentMonth = now()->format('Y-m');
                $monthPayments = $this->dailySalaries->filter(
                    fn ($daily): bool => $daily->pay_at?->format('Y-m') === $currentMonth
                );
                $monthDailyTotal = (float) $monthPayments->sum('amount');
                $allDailyTotal = (float) $this->dailySalaries->sum('amount');

                return [
                    'month_key' => $currentMonth,
                    'month_label' => now()->format('F Y'),
                    'base_salary' => $latestSalaryAmount,
                    'month_daily_total' => $monthDailyTotal,
                    'month_daily_count' => $monthPayments->count(),
                    'month_remaining' => $latestSalaryAmount !== null ? $latestSalaryAmount - $monthDailyTotal : null,
                    'all_daily_total' => $allDailyTotal,
                    'all_daily_count' => $this->dailySalaries->count(),
                ];
            }),
            'kpi_active_staff' => $this->when(
                $this->getAttribute('kpi_active_staff') !== null,
                fn (): int => (int) $this->getAttribute('kpi_active_staff')
            ),
            'kpi_on_leave_staff' => $this->when(
                $this->getAttribute('kpi_on_leave_staff') !== null,
                fn (): int => (int) $this->getAttribute('kpi_on_leave_staff')
            ),
        ];
    }
}
