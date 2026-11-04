<?php

namespace Modules\Admin\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Admin\Http\Requests\StoreAdminUserRequest;
use Modules\Admin\Http\Requests\UpdateAdminUserStatusRequest;
use Modules\Admin\Services\AdminUserService;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\User\Transformers\UserResource;

class AdminUserController extends BaseApiController
{
    public function __construct(
        protected AdminUserService $adminUserService
    ) {}

    /**
     * Display a listing of users managed by administrators.
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $users = $this->adminUserService->getAllUsers($request->query());

            return $this->success(
                UserResource::collection($users),
                'All users retrieved successfully.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $users = $this->adminUserService->getUsers($request->query(), $perPage);

        $users->through(fn ($user) => new UserResource($user));

        return $this->paginated($users, 'Users retrieved successfully.');
    }

    /**
     * Retrieve all users without pagination.
     */
    public function all(Request $request): JsonResponse
    {
        $users = $this->adminUserService->getAllUsers($request->query());

        return $this->success(
            UserResource::collection($users),
            'All users retrieved successfully.'
        );
    }

    /**
     * Retrieve a specific user by ID.
     */
    public function show(int $id): JsonResponse
    {
        $user = $this->adminUserService->getUserById($id);

        if (! $user) {
            return $this->notFound('User not found.');
        }

        return $this->success(
            new UserResource($user),
            'User retrieved successfully.'
        );
    }

    /**
     * Store a newly created user in the Admin module process.
     */
    public function store(StoreAdminUserRequest $request): JsonResponse
    {
        $adminId = Auth::guard('admin')->id();
        $user = $this->adminUserService->createUser($request->validated(), $adminId);

        return $this->created(
            new UserResource($user),
            'User created successfully.'
        );
    }

    /**
     * Update user status as an administrator.
     */
    public function updateStatus(UpdateAdminUserStatusRequest $request, int $id): JsonResponse
    {
        $adminId = Auth::guard('admin')->id();
        $statusId = (int) $request->input('user_statuses_id');
        $user = $this->adminUserService->updateUserStatus($id, $statusId, $adminId);

        return $this->success(
            new UserResource($user),
            'User status updated successfully.'
        );
    }

    /**
     * Bulk synchronize user module permissions.
     */
    public function syncPermissions(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*.system_modules_id' => ['required', 'integer', 'exists:system_modules,id'],
            'permissions.*.permision_stateses_id' => ['required', 'integer', 'exists:permision_stateses,id'],
        ]);

        $adminId = Auth::guard('admin')->id();
        $this->adminUserService->syncUserPermissions($id, $validated['permissions'], $adminId);

        return $this->success(
            null,
            'User permissions synchronized successfully.'
        );
    }
}
