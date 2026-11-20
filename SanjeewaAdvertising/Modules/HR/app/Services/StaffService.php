<?php

namespace Modules\HR\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Modules\Admin\Models\Admin;
use Modules\Core\Models\ActivityType;
use Modules\Core\Services\ActivityService;
use Modules\Core\Support\MobileNumberHelper;
use Modules\HR\Models\Staff;
use Modules\HR\Models\StaffStatus;

class StaffService
{
    public function __construct(
        protected ?ActivityService $activityService = null
    ) {
        $this->activityService = $activityService ?? app(ActivityService::class);
    }

    /**
     * Build the staff query with optional search and status filters.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<Staff>
     */
    public function buildQuery(array $filters = []): Builder
    {
        $query = Staff::query()->with([
            'status',
            'addedBy',
            'salaries' => fn ($salaryQuery) => $salaryQuery->orderByDesc('update_at')->orderByDesc('id'),
        ]);

        $search = $filters['search'] ?? $filters['q'] ?? null;
        if (! empty($search)) {
            $search = trim((string) $search);
            $query->where(function (Builder $q) use ($search): void {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('nic', 'like', "%{$search}%");
                MobileNumberHelper::orWhereMobileLike($q, 'mobile', $search);
            });
        }

        if (! empty($filters['staff_statuses_id'])) {
            $query->where('staff_statuses_id', (int) $filters['staff_statuses_id']);
        }

        return $query->orderByDesc('add_at')->orderByDesc('id');
    }

    /**
     * Retrieve all staff members matching optional filters.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Staff>
     */
    public function getAllStaff(array $filters = []): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    /**
     * Retrieve a single staff member by primary key.
     */
    public function getStaffById(int $id): ?Staff
    {
        return Staff::query()
            ->with([
                'status',
                'addedBy',
                'salaries' => fn ($salaryQuery) => $salaryQuery->orderByDesc('update_at')->orderByDesc('id'),
                'dailySalaries' => fn ($dailyQuery) => $dailyQuery->orderByDesc('pay_at')->orderByDesc('id'),
            ])
            ->find($id);
    }

    /**
     * Create a new staff member with default Active employment status and log the admin action.
     *
     * @param  array<string, mixed>  $data
     */
    public function createStaff(array $data, ?int $adminId = null): Staff
    {
        $activeStatus = StaffStatus::query()->firstOrCreate(['staff_status' => 'Active']);
        $resolvedAdminId = $this->resolveAdminId($adminId);

        $staff = Staff::create([
            'first_name' => trim((string) ($data['first_name'] ?? '')),
            'last_name' => trim((string) ($data['last_name'] ?? '')),
            'mobile' => trim((string) ($data['mobile'] ?? '')),
            'nic' => strtoupper(trim((string) ($data['nic'] ?? ''))),
            'staff_statuses_id' => $activeStatus->id,
            'add_at' => now(),
            'add_by' => $resolvedAdminId,
        ])->load([
            'status',
            'addedBy',
            'salaries' => fn ($salaryQuery) => $salaryQuery->orderByDesc('update_at')->orderByDesc('id'),
        ]);

        $fullName = trim("{$staff->first_name} {$staff->last_name}");

        $this->logAdminActivity('Create Staff', [
            'action' => 'hr_create_staff',
            'staff_id' => $staff->id,
            'name' => $fullName,
            'nic' => $staff->nic,
            'mobile' => $staff->mobile,
            'status' => $staff->status?->staff_status ?? 'Active',
            'message' => "Administrator registered new staff member '{$fullName}' (NIC: {$staff->nic}, ID: #{$staff->id}).",
        ], $resolvedAdminId);

        return $staff;
    }

    /**
     * Update a staff member's employment status and log the admin action.
     */
    public function updateStaffStatus(int $staffId, int $statusId, ?int $adminId = null): Staff
    {
        $staff = Staff::query()->with('status')->findOrFail($staffId);
        $previousStatus = $staff->status?->staff_status ?? 'Unknown';
        $resolvedAdminId = $this->resolveAdminId($adminId);

        $staff->update([
            'staff_statuses_id' => $statusId,
        ]);

        $staff->load([
            'status',
            'addedBy',
            'salaries' => fn ($salaryQuery) => $salaryQuery->orderByDesc('update_at')->orderByDesc('id'),
        ]);

        $newStatus = $staff->status?->staff_status ?? 'Unknown';
        $fullName = trim("{$staff->first_name} {$staff->last_name}");

        $allStaffWithStatus = Staff::query()->with('status')->get();
        $activeCount = $allStaffWithStatus->filter(
            fn (Staff $member): bool => strtolower((string) ($member->status?->staff_status ?? '')) === 'active'
        )->count();
        $onLeaveCount = $allStaffWithStatus->filter(
            fn (Staff $member): bool => strtolower((string) ($member->status?->staff_status ?? '')) === 'on leave'
        )->count();

        $staff->setAttribute('kpi_active_staff', $activeCount);
        $staff->setAttribute('kpi_on_leave_staff', $onLeaveCount);

        $this->logAdminActivity('Update Staff Status', [
            'action' => 'hr_update_staff_status',
            'staff_id' => $staff->id,
            'name' => $fullName,
            'nic' => $staff->nic,
            'previous_status' => $previousStatus,
            'status' => $newStatus,
            'staff_statuses_id' => $statusId,
            'message' => "Administrator changed status for staff member '{$fullName}' (NIC: {$staff->nic}) from '{$previousStatus}' to '{$newStatus}'.",
        ], $resolvedAdminId);

        return $staff;
    }

    /**
     * Resolve a valid administrator ID for the staff.add_by foreign key.
     */
    protected function resolveAdminId(?int $adminId = null): int
    {
        if ($adminId && Admin::query()->whereKey($adminId)->exists()) {
            return $adminId;
        }

        if (Auth::guard('admin')->check()) {
            return (int) Auth::guard('admin')->id();
        }

        $fallbackAdminId = Admin::query()->orderBy('id')->value('id');

        if (! $fallbackAdminId) {
            throw new \RuntimeException('No administrator account is available to attribute this staff record.');
        }

        return (int) $fallbackAdminId;
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

            $logData = [
                'activity_time' => now(),
                'activity_types_id' => $activityType->id,
                'activity' => $payload,
                'user_or_admin' => 2,
            ];

            if ($adminId) {
                $logData['admins_id'] = $adminId;
            } elseif (Auth::guard('web')->check()) {
                $logData['users_id'] = (int) Auth::guard('web')->id();
            }

            $this->activityService->logActivity($logData);
        } catch (\Throwable $e) {
            report($e);
        }
    }
}
