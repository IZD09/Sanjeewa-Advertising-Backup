<?php

namespace Modules\Admin\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Modules\Core\Models\Activity;
use Modules\Core\Models\ActivityType;
use Modules\Core\Services\ActivityService;
use Modules\Core\Support\MobileNumberHelper;
use Modules\PrintJob\Models\PrintJob;
use Modules\User\Models\SystemModule;
use Modules\User\Models\SystemModuleUser;
use Modules\User\Models\User;
use Modules\User\Models\UserLogin;

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
        ]);

        $search = $filters['search'] ?? $filters['q'] ?? null;
        if (! empty($search)) {
            $search = trim((string) $search);
            $query->where(function (Builder $q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%");
                MobileNumberHelper::orWhereMobileLike($q, 'mobile', $search);
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
     * @param  array<int, array{system_modules_id: int, view?: bool|int, create?: bool|int, edit?: bool|int, delete?: bool|int, export?: bool|int}>  $permissions
     */
    public function syncUserPermissions(int $userId, array $permissions, ?int $adminId = null): void
    {
        $user = User::findOrFail($userId);

        DB::transaction(function () use ($user, $permissions) {
            SystemModuleUser::where('users_id', $user->id)->delete();

            $records = [];
            foreach ($permissions as $perm) {
                if (! empty($perm['system_modules_id'])) {
                    $records[] = [
                        'users_id' => $user->id,
                        'system_modules_id' => (int) $perm['system_modules_id'],
                        'view' => (int) (bool) ($perm['view'] ?? 0),
                        'create' => (int) (bool) ($perm['create'] ?? 0),
                        'edit' => (int) (bool) ($perm['edit'] ?? 0),
                        'delete' => (int) (bool) ($perm['delete'] ?? 0),
                        'export' => (int) (bool) ($perm['export'] ?? 0),
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
     * Retrieve comprehensive user profile details including login/logout sessions,
     * assigned module permissions, and activity audit logs for administrator inspection.
     *
     * @return array<string, mixed>|null
     */
    public function getUserProfileData(int $userId): ?array
    {
        $user = User::query()
            ->with([
                'status',
                'systemModules',
                'userPermissions.systemModule',
            ])
            ->find($userId);

        if (! $user) {
            return null;
        }

        // 1. Assigned Module Permissions
        $allModules = SystemModule::orderBy('id')->get();
        if ($allModules->isEmpty()) {
            $modules = $user->systemModules->map(function ($mod): array {
                return [
                    'id' => (int) $mod->id,
                    'name' => (string) $mod->system_module,
                    'view' => (bool) ($mod->pivot->view ?? 0),
                    'create' => (bool) ($mod->pivot->create ?? 0),
                    'edit' => (bool) ($mod->pivot->edit ?? 0),
                    'delete' => (bool) ($mod->pivot->delete ?? 0),
                    'export' => (bool) ($mod->pivot->export ?? 0),
                ];
            })->values()->all();
        } else {
            $userPerms = $user->userPermissions->keyBy('system_modules_id');
            $modules = $allModules->map(function (SystemModule $mod) use ($userPerms): array {
                $pivot = $userPerms->get($mod->id);

                return [
                    'id' => (int) $mod->id,
                    'name' => (string) $mod->system_module,
                    'view' => (bool) ($pivot->view ?? 0),
                    'create' => (bool) ($pivot->create ?? 0),
                    'edit' => (bool) ($pivot->edit ?? 0),
                    'delete' => (bool) ($pivot->delete ?? 0),
                    'export' => (bool) ($pivot->export ?? 0),
                ];
            })->values()->all();
        }

        // 2. Login & Logout Session History
        $totalLoginsCount = UserLogin::query()->where('user_id', $user->id)->count();
        $loginRecords = UserLogin::query()
            ->where('user_id', $user->id)
            ->orderByDesc('id')
            ->limit(50)
            ->get();

        $logins = $loginRecords->map(function (UserLogin $login): array {
            $loginStr = $login->login ? $login->login->format('Y-m-d H:i:s') : null;
            $logoutStr = $login->logout ? $login->logout->format('Y-m-d H:i:s') : null;
            $isActive = empty($login->logout);

            return [
                'id' => (int) $login->id,
                'login' => $loginStr,
                'logout' => $logoutStr,
                'is_active' => $isActive,
                'duration' => $this->formatSessionDuration($login->login, $login->logout),
            ];
        })->values()->all();

        // 3. User Activity Details (Both user-performed activities and admin actions on this user)
        $activityRecords = Activity::query()
            ->with(['activityType', 'userActivity', 'adminActivity.admin'])
            ->where(function (Builder $q) use ($user) {
                $q->whereHas('userActivity', function (Builder $uq) use ($user) {
                    $uq->where('users_id', $user->id);
                })
                    ->orWhere('activity->user_id', $user->id)
                    ->orWhere('activity->user_id', (string) $user->id);
            })
            ->orderByDesc('activity_time')
            ->orderByDesc('id')
            ->limit(60)
            ->get();

        $activities = [];

        foreach ($activityRecords as $act) {
            $payload = is_array($act->activity) ? $act->activity : [];
            $typeName = $act->activityType?->activity_type ?? 'Activity';
            $isByAdmin = (int) $act->user_or_admin === 2;
            $adminName = $act->adminActivity?->admin?->username ?? ($payload['admin_username'] ?? 'Admin');

            $activities[] = [
                'id' => 'ACT-'.$act->id,
                'raw_id' => (int) $act->id,
                'timestamp' => $act->activity_time ? $act->activity_time->format('Y-m-d H:i:s') : null,
                'type' => $typeName,
                'action' => (string) ($payload['action'] ?? strtolower(str_replace(' ', '_', $typeName))),
                'message' => (string) ($payload['message'] ?? $typeName),
                'actor_type' => $isByAdmin ? 'Admin' : 'User',
                'actor_name' => $isByAdmin ? "@{$adminName}" : "@{$user->username}",
                'details' => $payload,
            ];
        }

        // Also include recent Print Jobs created by this user as operational activity records
        try {
            $printJobs = PrintJob::query()
                ->with(['customer', 'printType'])
                ->where('users_id', $user->id)
                ->orderByDesc('id')
                ->limit(25)
                ->get();

            foreach ($printJobs as $job) {
                $customerName = trim(($job->customer?->first_name ?? '').' '.($job->customer?->last_name ?? '')) ?: 'Walk-in Customer';
                $printTypeName = $job->printType?->type ?? 'Print Order';
                $jobTime = $job->add_date ? date('Y-m-d H:i:s', strtotime((string) $job->add_date)) : null;

                $activities[] = [
                    'id' => 'PJ-'.$job->id,
                    'raw_id' => (int) $job->id,
                    'timestamp' => $jobTime,
                    'type' => 'Print Job Created',
                    'action' => 'create_print_job',
                    'message' => "Created Print Job #PJ-{$job->id} ({$printTypeName}, Qty: {$job->qty}) for customer {$customerName}.",
                    'actor_type' => 'User',
                    'actor_name' => "@{$user->username}",
                    'details' => [
                        'job_id' => $job->id,
                        'customer' => $customerName,
                        'print_type' => $printTypeName,
                        'qty' => $job->qty,
                    ],
                ];
            }
        } catch (\Throwable $e) {
            // Ignore if PrintJob relation is unavailable
        }

        // Sort combined activities by timestamp descending
        usort($activities, function (array $a, array $b): int {
            $timeA = ! empty($a['timestamp']) ? strtotime((string) $a['timestamp']) : 0;
            $timeB = ! empty($b['timestamp']) ? strtotime((string) $b['timestamp']) : 0;

            return $timeB <=> $timeA;
        });

        return [
            'id' => (int) $user->id,
            'first_name' => (string) $user->first_name,
            'last_name' => (string) $user->last_name,
            'full_name' => trim("{$user->first_name} {$user->last_name}"),
            'username' => (string) $user->username,
            'mobile' => (string) $user->mobile,
            'register_at' => $user->register_at ? $user->register_at->format('Y-m-d H:i:s') : null,
            'user_statuses_id' => (int) $user->user_statuses_id,
            'status' => $user->status?->user_status ?? 'Active',
            'is_login' => (bool) $user->is_login,
            'logins_count' => $totalLoginsCount,
            'activities_count' => count($activities),
            'modules' => $modules,
            'logins' => $logins,
            'activities' => array_slice($activities, 0, 60),
        ];
    }

    /**
     * Format duration between login and logout timestamps.
     */
    protected function formatSessionDuration(mixed $login, mixed $logout): string
    {
        if (! $login) {
            return '—';
        }

        try {
            $start = $login instanceof \DateTimeInterface ? $login->getTimestamp() : strtotime((string) $login);
            $end = $logout
                ? ($logout instanceof \DateTimeInterface ? $logout->getTimestamp() : strtotime((string) $logout))
                : time();

            if (! $start || ! $end || $end < $start) {
                return '—';
            }

            $diff = $end - $start;
            $hours = floor($diff / 3600);
            $minutes = floor(($diff % 3600) / 60);
            $seconds = $diff % 60;

            if ($hours > 24) {
                $days = floor($hours / 24);
                $remHours = $hours % 24;

                return $logout ? "{$days}d {$remHours}h" : "Active ({$days}d {$remHours}h)";
            }

            if ($hours > 0) {
                return $logout ? "{$hours}h {$minutes}m" : "Active ({$hours}h {$minutes}m)";
            }

            if ($minutes > 0) {
                return $logout ? "{$minutes}m {$seconds}s" : "Active ({$minutes}m)";
            }

            return $logout ? "{$seconds}s" : 'Active (Just now)';
        } catch (\Throwable $e) {
            return '—';
        }
    }

    /**
     * Change a staff user's password as a verified administrator and log the action.
     */
    public function changeUserPassword(
        int $userId,
        string $newPassword,
        ?int $adminId = null,
        ?string $adminUsername = null
    ): User {
        $user = User::findOrFail($userId);

        $hashed = Hash::info($newPassword)['algo'] === null
            ? Hash::make($newPassword)
            : $newPassword;

        $user->update([
            'password' => $hashed,
        ]);

        $byText = $adminUsername ? "Administrator '@{$adminUsername}'" : 'Administrator';

        $this->logAdminActivity('Change User Password', [
            'action' => 'admin_change_user_password',
            'user_id' => $user->id,
            'username' => $user->username,
            'admin_id' => $adminId,
            'admin_username' => $adminUsername,
            'message' => "{$byText} changed login password for staff user '{$user->username}' (ID: #{$user->id}).",
        ], $adminId);

        return $user->fresh('status');
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
