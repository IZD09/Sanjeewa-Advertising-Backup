<?php

namespace Modules\Admin\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Modules\Admin\Models\Admin;
use Modules\Admin\Models\AdminLogin;
use Modules\Admin\Models\AdminStatus;
use Modules\Admin\Models\AdminType;
use Modules\Core\Models\ActivityType;
use Modules\Core\Services\ActivityService;

class AdminService
{
    public function __construct(
        protected ?ActivityService $activityService = null
    ) {
        $this->activityService = $activityService ?? app(ActivityService::class);
    }

    /**
     * Build the query for admins with search and filters.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<Admin>
     */
    public function buildQuery(array $filters = []): Builder
    {
        $query = Admin::query()->with(['status', 'type']);

        $search = $filters['search'] ?? $filters['q'] ?? null;
        if (! empty($search)) {
            $search = trim((string) $search);
            $query->where(function (Builder $q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['admin_statuses_id'])) {
            $query->where('admin_statuses_id', (int) $filters['admin_statuses_id']);
        }

        if (! empty($filters['admin_types_id'])) {
            $query->where('admin_types_id', (int) $filters['admin_types_id']);
        }

        $sortBy = (string) ($filters['sort_by'] ?? 'id');
        $sortOrder = strtolower((string) ($filters['sort_order'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['id', 'first_name', 'last_name', 'username', 'mobile', 'email', 'add_time'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderByDesc('id');
        }

        return $query;
    }

    /**
     * Retrieve all admins matching criteria without pagination limit.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Admin>
     */
    public function getAllAdmins(array $filters = []): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    /**
     * Retrieve paginated admins.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getAdmins(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        return $this->buildQuery($filters)->paginate($perPage);
    }

    /**
     * Find an admin by ID with relations.
     */
    public function getAdminById(int $id): ?Admin
    {
        return Admin::query()
            ->with([
                'status',
                'type',
                'logins' => fn ($q) => $q->latest('id')->limit(10),
            ])
            ->find($id);
    }

    /**
     * Create a new admin and log the activity via Core ActivityService.
     *
     * @param  array<string, mixed>  $data
     */
    public function createAdmin(array $data, ?int $actingAdminId = null): Admin
    {
        $password = (string) ($data['password'] ?? '');
        if (Hash::info($password)['algo'] === null) {
            $password = Hash::make($password);
        }

        $admin = Admin::create([
            'first_name' => trim((string) ($data['first_name'] ?? '')),
            'last_name' => trim((string) ($data['last_name'] ?? '')),
            'username' => trim((string) ($data['username'] ?? '')),
            'password' => $password,
            'mobile' => trim((string) ($data['mobile'] ?? '')),
            'email' => trim((string) ($data['email'] ?? '')),
            'add_time' => now(),
            'is_log' => 0,
            'admin_statuses_id' => (int) ($data['admin_statuses_id'] ?? 1),
            'admin_types_id' => (int) ($data['admin_types_id'] ?? 1),
        ])->load(['status', 'type']);

        $this->logAdminActivity('Create Admin', [
            'action' => 'create_admin',
            'admin_id' => $admin->id,
            'username' => $admin->username,
            'name' => "{$admin->first_name} {$admin->last_name}",
            'email' => $admin->email,
            'type' => $admin->type?->admin_type ?? 'Administrator',
            'status' => $admin->status?->admin_statas ?? 'Active',
            'message' => "Created new administrator '{$admin->username}' (ID: #{$admin->id}).",
        ], $actingAdminId ?? $admin->id);

        return $admin;
    }

    /**
     * Update an existing admin.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateAdmin(Admin $admin, array $data, ?int $actingAdminId = null): Admin
    {
        $attributes = [];

        if (isset($data['first_name'])) {
            $attributes['first_name'] = trim((string) $data['first_name']);
        }
        if (isset($data['last_name'])) {
            $attributes['last_name'] = trim((string) $data['last_name']);
        }
        if (isset($data['username'])) {
            $attributes['username'] = trim((string) $data['username']);
        }
        if (! empty($data['password'])) {
            $password = (string) $data['password'];
            if (Hash::info($password)['algo'] === null) {
                $password = Hash::make($password);
            }
            $attributes['password'] = $password;
        }
        if (isset($data['mobile'])) {
            $attributes['mobile'] = trim((string) $data['mobile']);
        }
        if (isset($data['email'])) {
            $attributes['email'] = trim((string) $data['email']);
        }
        if (isset($data['admin_statuses_id'])) {
            $attributes['admin_statuses_id'] = (int) $data['admin_statuses_id'];
        }
        if (isset($data['admin_types_id'])) {
            $attributes['admin_types_id'] = (int) $data['admin_types_id'];
        }

        $admin->update($attributes);

        $this->logAdminActivity('Update Admin', [
            'action' => 'update_admin',
            'admin_id' => $admin->id,
            'username' => $admin->username,
            'message' => "Updated administrator profile for '{$admin->username}' (ID: #{$admin->id}).",
        ], $actingAdminId);

        return $admin->fresh(['status', 'type']);
    }

    /**
     * Delete an admin record.
     */
    public function deleteAdmin(Admin $admin, ?int $actingAdminId = null): bool
    {
        $adminId = $admin->id;
        $username = $admin->username;

        $deleted = (bool) $admin->delete();

        if ($deleted) {
            $this->logAdminActivity('Delete Admin', [
                'action' => 'delete_admin',
                'admin_id' => $adminId,
                'username' => $username,
                'message' => "Deleted administrator account '{$username}' (ID: #{$adminId}).",
            ], $actingAdminId);
        }

        return $deleted;
    }

    /**
     * Update admin status.
     */
    public function updateAdminStatus(Admin $admin, int $statusId, ?int $actingAdminId = null): Admin
    {
        $admin->update([
            'admin_statuses_id' => $statusId,
        ]);

        $this->logAdminActivity('Update Admin Status', [
            'action' => 'update_admin_status',
            'admin_id' => $admin->id,
            'username' => $admin->username,
            'new_status_id' => $statusId,
            'message' => "Changed status for administrator '{$admin->username}' (ID: #{$admin->id}) to status #{$statusId}.",
        ], $actingAdminId);

        return $admin->fresh(['status', 'type']);
    }

    /**
     * Record an administrative activity log via Core ActivityService.
     *
     * @param  array<string, mixed>  $payload
     */
    protected function logAdminActivity(string $type, array $payload, ?int $actingAdminId = null): void
    {
        try {
            $activityType = ActivityType::firstOrCreate(['activity_type' => $type]);

            $resolvedAdminId = $actingAdminId;
            if (! $resolvedAdminId && Auth::guard('admin')->check()) {
                $resolvedAdminId = (int) Auth::guard('admin')->id();
            }

            $logData = [
                'activity_time' => now(),
                'activity_types_id' => $activityType->id,
                'activity' => $payload,
                'user_or_admin' => 2, // 2 = Admin
            ];

            if ($resolvedAdminId && Admin::whereKey($resolvedAdminId)->exists()) {
                $logData['admins_id'] = $resolvedAdminId;
            } elseif (Auth::guard('web')->check()) {
                $logData['users_id'] = (int) Auth::guard('web')->id();
            }

            $this->activityService->logActivity($logData);
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * Get paginated login history for an admin.
     */
    public function getAdminLogins(int $adminId, int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        return AdminLogin::query()
            ->where('admins_id', $adminId)
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    /**
     * Retrieve all admin statuses.
     *
     * @return Collection<int, AdminStatus>
     */
    public function getAllStatuses(): Collection
    {
        return AdminStatus::query()->orderBy('id')->get();
    }

    /**
     * Retrieve all admin types.
     *
     * @return Collection<int, AdminType>
     */
    public function getAllTypes(): Collection
    {
        return AdminType::query()->orderBy('id')->get();
    }
}
