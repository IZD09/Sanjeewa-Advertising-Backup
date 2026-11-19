<?php

namespace Modules\User\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\User\Http\Requests\UserPermission\AssignUserPermissionRequest;
use Modules\User\Http\Requests\UserPermission\SyncUserPermissionsRequest;
use Modules\User\Models\User;
use Modules\User\Services\UserPermissionService;
use Modules\User\Transformers\SystemModuleUserResource;

class UserPermissionController extends BaseApiController
{
    public function __construct(
        protected UserPermissionService $permissionService
    ) {
    }

    /**
     * Display all assigned permissions for a specified user.
     */
    public function index(int $userId): JsonResponse
    {
        $user = User::find($userId);

        if (! $user) {
            return $this->notFound('User not found.');
        }

        $permissions = $this->permissionService->getUserPermissions($userId);

        return $this->success(
            SystemModuleUserResource::collection($permissions),
            'User permissions retrieved successfully.'
        );
    }

    /**
     * Assign or update a permission for a user on a specific module.
     */
    public function store(AssignUserPermissionRequest $request, int $userId): JsonResponse
    {
        $user = User::find($userId);

        if (! $user) {
            return $this->notFound('User not found.');
        }

        $data = $request->validated();
        $permission = $this->permissionService->assignPermission(
            $userId,
            (int) $data['system_modules_id'],
            $data
        );

        $permission->load(['systemModule']);

        return $this->created(
            new SystemModuleUserResource($permission),
            'Permission assigned successfully.'
        );
    }

    /**
     * Bulk sync all permissions for a user.
     */
    public function sync(SyncUserPermissionsRequest $request, int $userId): JsonResponse
    {
        $user = User::find($userId);

        if (! $user) {
            return $this->notFound('User not found.');
        }

        $data = $request->validated();
        $permissions = $this->permissionService->syncUserPermissions($userId, $data['permissions']);

        return $this->success(
            SystemModuleUserResource::collection($permissions),
            'User permissions synchronized successfully.'
        );
    }

    /**
     * Revoke a module permission from a user.
     */
    public function destroy(int $userId, int $moduleId): JsonResponse
    {
        $user = User::find($userId);

        if (! $user) {
            return $this->notFound('User not found.');
        }

        $revoked = $this->permissionService->revokePermission($userId, $moduleId);

        if (! $revoked) {
            return $this->notFound('Permission assignment not found for this user and module.');
        }

        return $this->success(null, 'User module permission revoked successfully.');
    }
}
