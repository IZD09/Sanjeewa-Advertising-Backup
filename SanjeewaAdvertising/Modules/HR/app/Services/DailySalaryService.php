<?php

namespace Modules\HR\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Modules\Core\Models\ActivityType;
use Modules\Core\Services\ActivityService;
use Modules\HR\Models\DalySalary;
use Modules\HR\Models\Staff;

class DailySalaryService
{
    public function __construct(
        protected ?ActivityService $activityService = null
    ) {
        $this->activityService = $activityService ?? app(ActivityService::class);
    }

    /**
     * Build the daily salary query with optional staff, date, or search filters.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<DalySalary>
     */
    public function buildQuery(array $filters = []): Builder
    {
        $query = DalySalary::query()->with(['staff.status']);

        if (! empty($filters['staff_id'])) {
            $query->where('staff_id', (int) $filters['staff_id']);
        }

        if (! empty($filters['date'])) {
            $query->whereDate('pay_at', (string) $filters['date']);
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

        return $query->orderByDesc('pay_at')->orderByDesc('id');
    }

    /**
     * Retrieve all daily salary payment records matching optional filters.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, DalySalary>
     */
    public function getAllDailySalaries(array $filters = []): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    /**
     * Record a new daily salary disbursement and log the admin action.
     *
     * @param  array<string, mixed>  $data
     */
    public function recordDailySalary(array $data, ?int $adminId = null): DalySalary
    {
        $staff = Staff::query()->with('status')->findOrFail((int) $data['staff_id']);
        $amount = round((float) $data['amount'], 2);
        $payAt = Carbon::parse((string) $data['pay_at']);

        $dailySalary = DalySalary::create([
            'staff_id' => $staff->id,
            'amount' => $amount,
            'pay_at' => $payAt,
        ])->load(['staff.status']);

        $dailySalaryTotal = (float) DalySalary::query()->sum('amount');
        $dailySalaryCount = DalySalary::query()->count();
        $todayDailySalaryTotal = (float) DalySalary::query()->whereDate('pay_at', today())->sum('amount');
        $todayDailySalaryCount = DalySalary::query()->whereDate('pay_at', today())->count();

        $dailySalary->setAttribute('daily_salary_total', $dailySalaryTotal);
        $dailySalary->setAttribute('daily_salary_count', $dailySalaryCount);
        $dailySalary->setAttribute('today_daily_salary_total', $todayDailySalaryTotal);
        $dailySalary->setAttribute('today_daily_salary_count', $todayDailySalaryCount);

        $fullName = trim("{$staff->first_name} {$staff->last_name}");

        $this->logAdminActivity('Pay Daily Salary', [
            'action' => 'hr_pay_daily_salary',
            'daily_salary_id' => $dailySalary->id,
            'staff_id' => $staff->id,
            'staff_name' => $fullName,
            'nic' => $staff->nic,
            'amount' => $amount,
            'pay_at' => $payAt->format('Y-m-d H:i:s'),
            'message' => 'Administrator recorded daily salary payment of Rs. '.number_format($amount, 2)." for '{$fullName}' (NIC: {$staff->nic}).",
        ], $adminId);

        return $dailySalary;
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
