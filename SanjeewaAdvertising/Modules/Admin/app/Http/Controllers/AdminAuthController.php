<?php

namespace Modules\Admin\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Modules\Admin\Models\Admin;
use Modules\Admin\Models\AdminLogin;
use Modules\Admin\Transformers\AdminResource;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\Core\Models\ActivityType;
use Modules\Core\Services\ActivityService;

class AdminAuthController extends BaseApiController
{
    /**
     * Authenticate administrator credentials.
     */
    public function login(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ]);

        $identifier = trim((string) $validated['username']);
        $password = (string) $validated['password'];
        $remember = (bool) ($validated['remember'] ?? false);

        /** @var Admin|null $admin */
        $admin = Admin::query()
            ->with(['status', 'type'])
            ->where('username', $identifier)
            ->orWhere('email', $identifier)
            ->orWhere('mobile', $identifier)
            ->first();

        if (! $admin || ! Hash::check($password, $admin->password)) {
            if ($request->wantsJson() || $request->ajax()) {
                return $this->unauthorized('Invalid administrator credentials.');
            }

            return back()->withInput()->withErrors(['username' => 'Invalid administrator credentials.']);
        }

        // Record admin login session
        $loginRecord = AdminLogin::create([
            'admins_id' => $admin->id,
            'login' => now(),
            'logout' => null,
        ]);

        $admin->update(['is_log' => 1]);

        if (Auth::guard('admin')->hasUser() || $request->hasSession()) {
            Auth::guard('admin')->login($admin, $remember);
        }

        try {
            $loginType = ActivityType::firstOrCreate(['activity_type' => 'Login']);
            app(ActivityService::class)->logActivity([
                'activity_time' => now(),
                'user_or_admin' => 2,
                'activity_types_id' => $loginType->id,
                'admins_id' => $admin->id,
                'activity' => [
                    'action' => 'admin_login',
                    'message' => "Administrator '{$admin->username}' logged in successfully.",
                ],
            ]);
        } catch (\Throwable $e) {
            report($e);
        }

        if ($request->wantsJson() || $request->ajax()) {
            return $this->success([
                'admin' => new AdminResource($admin),
                'login_id' => $loginRecord->id,
                'login_at' => $loginRecord->login,
            ], 'Admin authentication successful.');
        }

        return redirect()->intended(route('ui.dashboard'));
    }

    /**
     * Terminate the administrator session.
     */
    public function logout(Request $request): JsonResponse|RedirectResponse
    {
        /** @var Admin|null $admin */
        $admin = Auth::guard('admin')->user();

        if ($admin) {
            $admin->update(['is_log' => 0]);

            AdminLogin::query()
                ->where('admins_id', $admin->id)
                ->whereNull('logout')
                ->latest('id')
                ->first()
                ?->update(['logout' => now()]);

            try {
                $logoutType = ActivityType::firstOrCreate(['activity_type' => 'Logout']);
                app(ActivityService::class)->logActivity([
                    'activity_time' => now(),
                    'user_or_admin' => 2,
                    'activity_types_id' => $logoutType->id,
                    'admins_id' => $admin->id,
                    'activity' => [
                        'action' => 'admin_logout',
                        'message' => "Administrator '{$admin->username}' logged out.",
                    ],
                ]);
            } catch (\Throwable $e) {
                report($e);
            }
        }

        Auth::guard('admin')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        if ($request->wantsJson() || $request->ajax()) {
            return $this->success(null, 'Admin logged out successfully.');
        }

        return redirect()->route('admin.login');
    }
}
