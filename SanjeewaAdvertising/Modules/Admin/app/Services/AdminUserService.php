<?php

namespace Modules\Admin\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Modules\Core\Models\ActivityType;
use Modules\Core\Services\ActivityService;
use Modules\User\Models\SystemModuleUser;
use Modules\User\Models\User;

class AdminUserService
{
    public function __construct(
        protected ?ActivityService $activityService = null
    ) {
        $this->activityService = $activityService ?? app(ActivityService::class);
    }

    /**
     * Build the query for users with search and filters.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<User>
     */
    public function buildQuery(array $filters = []): Builder
    {
        $query = User::query()->with([
            'status',
            'userPermissions.systemModule',
            'userPermissions.permisionState',
        ]);

        $search = $filters['search'] ?? $filters['q'] ?? null;
        if (! empty($search)) {
            $search = trim((string) $search);
            $query->where(function (Builder $q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['user_statuses_id'])) {
            $query->where('user_statuses_id', (int) $filters['user_statuses_id']);
        }

        $sortBy = (string) ($filters['sort_by'] ?? 'id');
        $sortOrder = strtolower((string) ($filters['sort_order'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['id', 'first_name', 'last_name', 'username', 'mobile', 'register_at'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderByDesc('id');
        }

        return $query;
    }

    /**
     * Retrieve all users without pagination.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, User>
     */
    public function getAllUsers(array $filters = []): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    /**
     * Retrieve paginated users.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getUsers(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        return $this->buildQuery($filters)->paginate($perPage);
    }

    /**
     * Find a user by primary key with relations.
     */
    public function getUserById(int $id): ?User
    {
        return User::query()
            ->with([
                'status',
                'userPermissions.systemModule',
                'userPermissions.permisionState',
            ])
            ->find($id);
    }

    /**
     * Create a new user as an administrator and log the action.
     *
     * @param  array<string, mixed>  $data
     */
    public function createUser(array $data, ?int $adminId = null): User
    {
        $password = (string) ($data['password'] ?? '');

        if (Hash::info($password)['algo'] === null) {
            $password = Hash::make($password);
        }

        $user = User::create([
            'first_name' => trim((string) ($data['first_name'] ?? '')),
            'last_name' => trim((string) ($data['last_name'] ?? '')),
            'mobile' => trim((string) ($data['mobile'] ?? '')),
            'username' => trim((string) ($data['username'] ?? '')),
            'password' => $password,
            'register_at' => now(),
            'is_login' => 0,
            'user_statuses_id' => (int) ($data['user_statuses_id'] ?? 1),
        ])->load('status');

        $this->logAdminActivity('Create User', [
            'action' => 'admin_create_user',
            'user_id' => $user->id,
            'username' => $user->username,
            'name' => "{$user->first_name} {$user->last_name}",
            'status' => $user->status?->user_status ?? 'Active',
            'message' => "Administrator created new staff user '{$user->username}' (ID: #{$user->id}).",
        ], $adminId);

        return $user;
    }

    /**
     * Update user status as an administrator.
     */
    public function updateUserStatus(int $userId, int $statusId, ?int $adminId = null): User
    {
        $user = User::findOrFail($userId);
        $user->update([
            'user_statuses_id' => $statusId,
        ]);

        $this->logAdminActivity('Update User Status', [
            'action' => 'admin_update_user_status',
            'user_id' => $user->id,
            'username' => $user->username,
            'new_status_id' => $statusId,
            'message' => "Administrator changed status for user '{$user->username}' (ID: #{$user->id}) to status #{$statusId}.",
        ], $adminId);

        return $user->fresh('status');
    }

    /**
     * Synchronize user module permissions in bulk as an administrator.
     *
     * @param  array<int, array{system_modules_id: int, permision_stateses_id: int}>  $permissions
     */
    public function syncUserPermissions(int $userId, array $permissions, ?int $adminId = null): void
    {
        $user = User::findOrFail($userId);

        DB::transaction(function () use ($user, $permissions) {
            SystemModuleUser::where('users_id', $user->id)->delete();

            $records = [];
            foreach ($permissions as $perm) {
                if (! empty($perm['system_modules_id']) && ! empty($perm['permision_stateses_id'])) {
                    $records[] = [
                        'users_id' => $user->id,
                        'system_modules_id' => (int) $perm['system_modules_id'],
                        'permision_stateses_id' => (int) $perm['permision_stateses_id'],
                    ];
                }
            }

            if (! empty($records)) {
                SystemModuleUser::insert($records);
            }
        });

        $this->logAdminActivity('Update Permissions', [
            'action' => 'admin_sync_permissions',
            'user_id' => $user->id,
            'username' => $user->username,
            'modules_count' => count($permissions),
            'message' => "Administrator updated permissions for user '{$user->username}' (ID: #{$user->id}).",
        ], $adminId);
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
                'user_or_admin' => 2, // 2 = Admin
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
