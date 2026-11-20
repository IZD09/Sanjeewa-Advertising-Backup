<?php

namespace Modules\HR\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Modules\Core\Models\ActivityType;
use Modules\Core\Services\ActivityService;
use Modules\HR\Models\Salary;
use Modules\HR\Models\Staff;

class SalaryService
{
    public function __construct(
        protected ?ActivityService $activityService = null
    ) {
        $this->activityService = $activityService ?? app(ActivityService::class);
    }

    /**
     * Build the base salary query with optional search or staff filtering.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<Salary>
     */
    public function buildQuery(array $filters = []): Builder
    {
        $query = Salary::query()->with(['staff.status']);

        if (! empty($filters['staff_id'])) {
            $query->where('staff_id', (int) $filters['staff_id']);
        }

        $search = $filters['search'] ?? $filters['q'] ?? null;
        if (! empty($search)) {
            $search = trim((string) $search);
            $query->whereHas('staff', function (Builder $staffQuery) use ($search): void {
                $staffQuery->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('nic', 'like', "%{$search}%");
            });
        }

        return $query->orderByDesc('update_at')->orderByDesc('id');
    }

    /**
     * Retrieve all base salary records matching optional filters.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Salary>
     */
    public function getAllSalaries(array $filters = []): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    /**
     * Set or update a staff member's monthly base salary and log the admin action.
     *
     * @param  array<string, mixed>  $data
     */
    public function setBaseSalary(array $data, ?int $adminId = null): Salary
    {
        $staff = Staff::query()->with('status')->findOrFail((int) $data['staff_id']);
        $amount = round((float) $data['amount'], 2);

        $salary = Salary::create([
            'staff_id' => $staff->id,
            'amount' => $amount,
            'update_at' => now(),
        ])->load(['staff.status']);

        $monthlyPayrollTotal = $this->calculateMonthlyPayrollTotal();
        $salary->setAttribute('monthly_payroll_total', $monthlyPayrollTotal);

        $fullName = trim("{$staff->first_name} {$staff->last_name}");

        $this->logAdminActivity('Set Base Salary', [
            'action' => 'hr_set_base_salary',
            'salary_id' => $salary->id,
            'staff_id' => $staff->id,
            'staff_name' => $fullName,
            'nic' => $staff->nic,
            'amount' => $amount,
            'message' => "Administrator set monthly base salary for '{$fullName}' (NIC: {$staff->nic}) to Rs. ".number_format($amount, 2).'.',
        ], $adminId);

        return $salary;
    }

    /**
     * Calculate the total monthly base payroll across all staff using each staff member's latest salary record.
     */
    public function calculateMonthlyPayrollTotal(): float
    {
        $staffMembers = Staff::query()
            ->with([
                'salaries' => fn ($query) => $query->orderByDesc('update_at')->orderByDesc('id'),
            ])
            ->get();

        return (float) $staffMembers->sum(function (Staff $member): float {
            $latestSalary = $member->salaries->first();

            return $latestSalary ? (float) $latestSalary->amount : 0.0;
        });
    }

    /**
     * Record an administrative activity log via Core ActivityService.
     *
     * @param  array<string, mixed>  $payload
     */
    protected function logAdminActivity(string $type, array $payload, ?int $adminId = null): void
    {
        try {
            $activityType = ActivityType::firstOrCreate(['activity_type' => $type]);

            $resolvedAdminId = $adminId;
            if (! $resolvedAdminId && Auth::guard('admin')->check()) {
                $resolvedAdminId = (int) Auth::guard('admin')->id();
            }

            $logData = [
                'activity_time' => now(),
                'activity_types_id' => $activityType->id,
                'activity' => $payload,
                'user_or_admin' => 2,
            ];

            if ($resolvedAdminId) {
                $logData['admins_id'] = $resolvedAdminId;
            } elseif (Auth::guard('web')->check()) {
                $logData['users_id'] = (int) Auth::guard('web')->id();
            }

            $this->activityService->logActivity($logData);
        } catch (\Throwable $e) {
            report($e);
        }
    }
}
