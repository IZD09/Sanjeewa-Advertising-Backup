<?php

namespace Modules\User\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\User\Http\Requests\Auth\ChangePasswordRequest;
use Modules\User\Http\Requests\Auth\LoginRequest;
use Modules\User\Http\Requests\Auth\RegisterRequest;
use Modules\User\Models\User;
use Modules\User\Services\AuthService;
use Modules\User\Transformers\AuthResource;
use Modules\User\Transformers\UserResource;

class AuthController extends BaseApiController
{
    public function __construct(
        protected AuthService $authService
    ) {
    }

    /**
     * Register a new user account.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register($request->validated());

        return $this->created(
            new UserResource($user),
            'User registered successfully.'
        );
    }

    /**
     * Authenticate a user and return user resource with session tracking.
     */
    public function login(LoginRequest $request): JsonResponse|RedirectResponse
    {
        $identifier = $request->string('username')->trim()->value();
        $password = $request->string('password')->value();

        $authData = $this->authService->authenticate($identifier, $password);

        if (! $authData) {
            if ($request->wantsJson() || $request->ajax()) {
                return $this->unauthorized('Invalid username or password.');
            }

            return back()->withInput()->withErrors(['username' => 'Invalid username or password.']);
        }

        if (! empty($authData['requires_permissions'])) {
            /** @var User $pendingUser */
            $pendingUser = $authData['user'];
            $userData = [
                'id' => $pendingUser->id,
                'name' => trim("{$pendingUser->first_name} {$pendingUser->last_name}") ?: $pendingUser->username,
                'username' => $pendingUser->username,
                'mobile' => $pendingUser->mobile,
                'status' => $pendingUser->status?->user_status ?? 'Active',
                'initials' => strtoupper(substr($pendingUser->first_name ?: $pendingUser->username, 0, 1) . substr($pendingUser->last_name ?: '', 0, 1)),
                'register_at' => $pendingUser->register_at?->format('Y-m-d') ?? 'Recent',
            ];

            if ($request->hasSession()) {
                $request->session()->put('pending_user', $userData);
            }

            $restrictedUrl = route('access.restricted');

            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'requires_permissions' => true,
                    'redirect_url' => $restrictedUrl,
                    'message' => 'Your account is verified, but no module permissions have been assigned yet. Please contact the administrator.',
                    'user' => $userData,
                ], 403);
            }

            return redirect($restrictedUrl);
        }

        if (Auth::guard('web')->hasUser() || $request->hasSession()) {
            Auth::guard('web')->login($authData['user'], $request->boolean('remember'));
            if ($request->hasSession()) {
                $portal = ($authData['user']->username ?? '') === 'admin' ? 'admin' : 'user';
                $request->session()->put('active_portal', $portal);
                $request->session()->put('last_activity_time', now()->timestamp);
            }
        }

        /** @var User $user */
        $user = Auth::guard('web')->user() ?? $authData['user'];
        $landingUrl = method_exists($user, 'getDefaultLandingRoute')
            ? $user->getDefaultLandingRoute()
            : route('ui.dashboard');

        if ($request->wantsJson() || $request->ajax()) {
            $authData['redirect_url'] = $landingUrl;

            return $this->success(
                new AuthResource($authData),
                'Login successful.'
            );
        }

        return redirect()->intended($landingUrl);
    }

    /**
     * Terminate the user's active session and record logout time.
     */
    public function logout(Request $request): JsonResponse|RedirectResponse
    {
        /** @var User|null $user */
        $user = Auth::guard('web')->user()
            ?? ($request->input('user_id') ? User::find($request->input('user_id')) : null);

        $this->authService->logout($user);

        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        if ($request->wantsJson() || $request->ajax()) {
            return $this->success(null, 'Logged out successfully.');
        }

        return redirect()->route('login');
    }

    /**
     * Retrieve the currently authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = Auth::guard('web')->user()
            ?? ($request->input('user_id') ? User::find($request->input('user_id')) : null);

        if (! $user) {
            return $this->unauthorized('Unauthenticated.');
        }

        return $this->success(
            new UserResource($user->load('status')),
            'User profile retrieved successfully.'
        );
    }

    /**
     * Change user password after verifying the current password.
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        /** @var User|null $user */
        $user = Auth::guard('web')->user()
            ?? ($request->input('user_id') ? User::find($request->input('user_id')) : null);

        if (! $user) {
            return $this->unauthorized('Unauthenticated.');
        }

        $success = $this->authService->changePassword(
            $user,
            $request->string('current_password')->value(),
            $request->string('new_password')->value()
        );

        if (! $success) {
            return $this->error('The current password provided is incorrect.', 422);
        }

        return $this->success(null, 'Password updated successfully.');
    }
}
