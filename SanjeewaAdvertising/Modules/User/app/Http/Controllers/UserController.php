<?php

namespace Modules\User\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\User\Http\Requests\User\StoreUserRequest;
use Modules\User\Http\Requests\User\UpdateUserRequest;
use Modules\User\Services\UserService;
use Modules\User\Transformers\UserLoginResource;
use Modules\User\Transformers\UserResource;

class UserController extends BaseApiController
{
    public function __construct(
        protected UserService $userService
    ) {
    }

    /**
     * Display a listing of users with search and filter capabilities.
     * Supports both paginated listing and fetching all users via ?all=true or ?per_page=all.
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $users = $this->userService->getAllUsers($request->query());

            return $this->success(
                UserResource::collection($users),
                'All users retrieved successfully.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $users = $this->userService->getUsers($request->query(), $perPage);

        $users->through(fn ($user) => new UserResource($user));

        return $this->paginated($users, 'Users retrieved successfully.');
    }

    /**
     * Retrieve all users matching optional search query without pagination limit.
     */
    public function all(Request $request): JsonResponse
    {
        $users = $this->userService->getAllUsers($request->query());

        return $this->success(
            UserResource::collection($users),
            'All users retrieved successfully.'
        );
    }

    /**
     * Search users by keyword across name, username, mobile, and status.
     */
    public function search(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $users = $this->userService->getAllUsers($request->query());

            return $this->success(
                UserResource::collection($users),
                'Users search results.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $users = $this->userService->getUsers($request->query(), $perPage);

        $users->through(fn ($user) => new UserResource($user));

        return $this->paginated($users, 'Users search results.');
    }

    /**
     * Store a newly created user in storage with encrypted password.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->createUser($request->validated());

        return $this->created(
            new UserResource($user),
            'User created successfully.'
        );
    }

    /**
     * Display the specified user details.
     */
    public function show(int $id): JsonResponse
    {
        $user = $this->userService->getUserById($id);

        if (! $user) {
            return $this->notFound('User not found.');
        }

        return $this->success(
            new UserResource($user),
            'User details retrieved successfully.'
        );
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = $this->userService->getUserById($id);

        if (! $user) {
            return $this->notFound('User not found.');
        }

        $updatedUser = $this->userService->updateUser($user, $request->validated());

        return $this->success(
            new UserResource($updatedUser),
            'User updated successfully.'
        );
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $user = $this->userService->getUserById($id);

        if (! $user) {
            return $this->notFound('User not found.');
        }

        $this->userService->deleteUser($user);

        return $this->success(null, 'User deleted successfully.');
    }

    /**
     * Update user status.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'user_statuses_id' => ['required', 'integer', 'exists:user_statuses,id'],
        ]);

        $user = $this->userService->getUserById($id);

        if (! $user) {
            return $this->notFound('User not found.');
        }

        $updatedUser = $this->userService->updateUserStatus($user, $request->integer('user_statuses_id'));

        return $this->success(
            new UserResource($updatedUser),
            'User status updated successfully.'
        );
    }

    /**
     * Get login history for a specific user.
     */
    public function logins(Request $request, int $id): JsonResponse
    {
        $user = $this->userService->getUserById($id);

        if (! $user) {
            return $this->notFound('User not found.');
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $logins = $this->userService->getUserLogins($id, $perPage);

        $logins->through(fn ($login) => new UserLoginResource($login));

        return $this->paginated(
            $logins,
            'User login history retrieved successfully.'
        );
    }
}
