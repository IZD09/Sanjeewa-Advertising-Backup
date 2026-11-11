<?php

namespace Modules\User\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\User\Http\Requests\Profile\UpdatePasswordRequest;
use Modules\User\Http\Requests\Profile\UpdateProfileRequest;
use Modules\User\Models\User;
use Modules\User\Services\UserService;

class UserProfileController extends BaseApiController
{
    public function __construct(
        protected UserService $userService
    ) {}

    /**
     * Display the user profile UI page.
     */
    public function index(): View|RedirectResponse
    {
        /** @var User|null $user */
        $user = Auth::guard('web')->user() ?? Auth::guard('admin')->user();

        if (! $user) {
            return redirect()->route('login');
        }

        return view('ui::layouts.pages.profile.profile', [
            'currentUser' => $user,
        ]);
    }

    /**
     * Retrieve the authenticated user's profile data, permissions, and recent logins.
     */
    public function data(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = Auth::guard('web')->user() ?? Auth::guard('admin')->user();

        if (! $user) {
            return $this->unauthorized('Unauthenticated.');
        }

        $user->load([
            'status',
            'logins' => fn ($query) => $query->latest('id')->limit(15),
            'systemModules',
        ]);

        $modules = $user->systemModules->map(function ($mod) {
            return [
                'id' => $mod->id,
                'name' => $mod->system_module,
                'view' => (bool) ($mod->pivot->view ?? 0),
                'create' => (bool) ($mod->pivot->create ?? 0),
                'edit' => (bool) ($mod->pivot->edit ?? 0),
                'delete' => (bool) ($mod->pivot->delete ?? 0),
                'export' => (bool) ($mod->pivot->export ?? 0),
            ];
        });

        $logins = $user->logins->map(function ($login) {
            return [
                'id' => $login->id,
                'login' => $login->login ? date('Y-m-d H:i:s', strtotime((string) $login->login)) : null,
                'logout' => $login->logout ? date('Y-m-d H:i:s', strtotime((string) $login->logout)) : null,
                'is_active' => empty($login->logout),
            ];
        });

        return $this->success([
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'full_name' => trim("{$user->first_name} {$user->last_name}"),
            'username' => $user->username,
            'mobile' => $user->mobile,
            'register_at' => $user->register_at ? date('Y-m-d H:i:s', strtotime((string) $user->register_at)) : null,
            'status' => $user->status?->user_status ?? 'Active',
            'is_login' => (bool) $user->is_login,
            'modules' => $modules,
            'logins' => $logins,
        ], 'User profile retrieved successfully.');
    }

    /**
     * Update the authenticated user's profile details.
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        /** @var User|null $user */
        $user = Auth::guard('web')->user() ?? Auth::guard('admin')->user();

        if (! $user) {
            return $this->unauthorized('Unauthenticated.');
        }

        $validated = $request->validated();

        if (! empty($validated['password'])) {
            if (empty($validated['current_password']) || ! Hash::check($validated['current_password'], $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['The current password provided is incorrect.'],
                ]);
            }
        } else {
            unset($validated['password']);
        }

        unset($validated['current_password']);

        $updatedUser = $this->userService->updateProfile($user, $validated);

        return $this->success([
            'id' => $updatedUser->id,
            'first_name' => $updatedUser->first_name,
            'last_name' => $updatedUser->last_name,
            'full_name' => trim("{$updatedUser->first_name} {$updatedUser->last_name}"),
            'username' => $updatedUser->username,
            'mobile' => $updatedUser->mobile,
            'status' => $updatedUser->status?->user_status ?? 'Active',
        ], 'Profile details updated successfully.');
    }

    /**
     * Update the authenticated user's password credentials.
     */
    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        /** @var User|null $user */
        $user = Auth::guard('web')->user() ?? Auth::guard('admin')->user();

        if (! $user) {
            return $this->unauthorized('Unauthenticated.');
        }

        $validated = $request->validated();

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password provided is incorrect.'],
            ]);
        }

        $this->userService->updatePassword($user, $validated['password']);

        return $this->success([
            'id' => $user->id,
            'username' => $user->username,
        ], 'Password updated successfully.');
    }
}
