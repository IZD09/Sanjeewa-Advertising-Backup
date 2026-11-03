<?php

namespace Modules\User\Services;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Modules\User\Models\SystemModuleUser;
use Modules\User\Models\User;

class UserPermissionService
{
    /**
     * Get all assigned permissions for a given user.
     *
     * @return Collection<int, SystemModuleUser>
     */
    public function getUserPermissions(int $userId): Collection
    {
        return SystemModuleUser::query()
            ->with(['systemModule', 'permisionState'])
            ->where('users_id', $userId)
            ->get();
    }

    /**
     * Assign or update a permission state for a user and module.
     */
    public function assignPermission(int $userId, int $moduleId, int $permissionStateId): SystemModuleUser
    {
        SystemModuleUser::query()
            ->where('users_id', $userId)
            ->where('system_modules_id', $moduleId)
            ->delete();

        return SystemModuleUser::create([
            'users_id' => $userId,
            'system_modules_id' => $moduleId,
            'permision_stateses_id' => $permissionStateId,
        ]);
    }

    /**
     * Sync multiple module permissions for a user in a single transaction.
     *
     * @param  list<array{system_modules_id: int, permision_stateses_id: int}>  $permissions
     * @return Collection<int, SystemModuleUser>
     */
    public function syncUserPermissions(int $userId, array $permissions): Collection
    {
        return DB::transaction(function () use ($userId, $permissions) {
            SystemModuleUser::query()
                ->where('users_id', $userId)
                ->delete();

            foreach ($permissions as $item) {
                SystemModuleUser::create([
                    'users_id' => $userId,
                    'system_modules_id' => (int) $item['system_modules_id'],
                    'permision_stateses_id' => (int) $item['permision_stateses_id'],
                ]);
            }

            return $this->getUserPermissions($userId);
        });
    }

    /**
     * Revoke a module permission from a user.
     */
    public function revokePermission(int $userId, int $moduleId): bool
    {
        return (bool) SystemModuleUser::query()
            ->where('users_id', $userId)
            ->where('system_modules_id', $moduleId)
            ->delete();
    }

    /**
     * Check if a user has a specific permission state on a module.
     */
    public function hasPermission(int $userId, string|int $module, string|int $expectedState): bool
    {
        $query = SystemModuleUser::query()->where('users_id', $userId);

        if (is_int($module)) {
            $query->where('system_modules_id', $module);
        } else {
            $query->whereHas('systemModule', fn ($q) => $q->where('system_module', $module));
        }

        if (is_int($expectedState)) {
            $query->where('permision_stateses_id', $expectedState);
        } else {
            $query->whereHas('permisionState', fn ($q) => $q->where('permision_states', $expectedState));
        }

        return $query->exists();
    }
}
