<?php

namespace Modules\User\Services;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Modules\Core\Models\ActivityType;
use Modules\Core\Services\ActivityService;
use Modules\User\Models\SystemModuleUser;
use Modules\User\Models\User;

class UserPermissionService
{
    public function __construct(
        protected ?ActivityService $activityService = null
    ) {
        $this->activityService = $activityService ?? app(ActivityService::class);
    }

    /**
     * Get all assigned permissions for a given user.
     *
     * @return Collection<int, SystemModuleUser>
     */
    public function getUserPermissions(int $userId): Collection
    {
        return SystemModuleUser::query()
            ->with(['systemModule'])
            ->where('users_id', $userId)
            ->get();
    }

    /**
     * Assign or update boolean permissions for a user and module.
     *
     * @param  array{view?: bool|int, create?: bool|int, edit?: bool|int, delete?: bool|int, export?: bool|int}  $actions
     */
    public function assignPermission(int $userId, int $moduleId, array $actions = []): SystemModuleUser
    {
        SystemModuleUser::query()
            ->where('users_id', $userId)
            ->where('system_modules_id', $moduleId)
            ->delete();

        $assignment = SystemModuleUser::create([
            'users_id' => $userId,
            'system_modules_id' => $moduleId,
            'view' => (int) (bool) ($actions['view'] ?? 0),
            'create' => (int) (bool) ($actions['create'] ?? 0),
            'edit' => (int) (bool) ($actions['edit'] ?? 0),
            'delete' => (int) (bool) ($actions['delete'] ?? 0),
            'export' => (int) (bool) ($actions['export'] ?? 0),
        ]);

        $this->logActivity('Update Permissions', [
            'action' => 'assign_permission',
            'user_id' => $userId,
            'system_modules_id' => $moduleId,
            'permissions' => [
                'view' => (bool) $assignment->view,
                'create' => (bool) $assignment->create,
                'edit' => (bool) $assignment->edit,
                'delete' => (bool) $assignment->delete,
                'export' => (bool) $assignment->export,
            ],
            'message' => "Updated permission on module #{$moduleId} for user (ID: #{$userId}).",
        ]);

        return $assignment;
    }

    /**
     * Sync multiple module permissions for a user in a single transaction.
     *
     * @param  list<array{system_modules_id: int, view?: bool|int, create?: bool|int, edit?: bool|int, delete?: bool|int, export?: bool|int}>  $permissions
     * @return Collection<int, SystemModuleUser>
     */
    public function syncUserPermissions(int $userId, array $permissions): Collection
    {
        $result = DB::transaction(function () use ($userId, $permissions) {
            SystemModuleUser::query()
                ->where('users_id', $userId)
                ->delete();

            foreach ($permissions as $item) {
                SystemModuleUser::create([
                    'users_id' => $userId,
                    'system_modules_id' => (int) $item['system_modules_id'],
                    'view' => (int) (bool) ($item['view'] ?? 0),
                    'create' => (int) (bool) ($item['create'] ?? 0),
                    'edit' => (int) (bool) ($item['edit'] ?? 0),
                    'delete' => (int) (bool) ($item['delete'] ?? 0),
                    'export' => (int) (bool) ($item['export'] ?? 0),
                ]);
            }

            return $this->getUserPermissions($userId);
        });

        $this->logActivity('Update Permissions', [
            'action' => 'sync_permissions',
            'user_id' => $userId,
            'modules_count' => count($permissions),
            'message' => "Synchronized permissions for user (ID: #{$userId}).",
        ]);

        return $result;
    }

    /**
     * Revoke a module permission from a user.
     */
    public function revokePermission(int $userId, int $moduleId): bool
    {
        $deleted = (bool) SystemModuleUser::query()
            ->where('users_id', $userId)
            ->where('system_modules_id', $moduleId)
            ->delete();

        if ($deleted) {
            $this->logActivity('Update Permissions', [
                'action' => 'revoke_permission',
                'user_id' => $userId,
                'system_modules_id' => $moduleId,
                'message' => "Revoked module #{$moduleId} permission from user (ID: #{$userId}).",
            ]);
        }

        return $deleted;
    }

    /**
     * Log an administrative activity using Core Module's ActivityService.
     *
     * @param  array<string, mixed>  $payload
     */
    protected function logActivity(string $type, array $payload): void
    {
        try {
            $activityType = ActivityType::firstOrCreate(['activity_type' => $type]);

            $logData = [
                'activity_time' => now(),
                'activity_types_id' => $activityType->id,
                'activity' => $payload,
            ];

            if (Auth::guard('admin')->check()) {
                $logData['user_or_admin'] = 2; // Admin
                $logData['admins_id'] = Auth::guard('admin')->id();
            } elseif (Auth::guard('web')->check()) {
                $logData['user_or_admin'] = 1; // User
                $logData['users_id'] = Auth::guard('web')->id();
            } else {
                $logData['user_or_admin'] = 2;
            }

            $this->activityService->logActivity($logData);
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * Check if a user has a specific action permission on a module.
     */
    public function hasPermission(int $userId, string|int $module, string $action = 'view'): bool
    {
        $allowedActions = ['view', 'create', 'edit', 'delete', 'export'];
        if (! in_array($action, $allowedActions, true)) {
            return false;
        }

        $query = SystemModuleUser::query()->where('users_id', $userId);

        if (is_int($module)) {
            $query->where('system_modules_id', $module);
        } else {
            $query->whereHas('systemModule', fn ($q) => $q->where('system_module', $module));
        }

        return $query->where($action, 1)->exists();
    }
}
