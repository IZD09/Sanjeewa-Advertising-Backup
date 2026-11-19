<?php

namespace Modules\Core\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Admin\Models\Admin;
use Modules\Admin\Models\AdminLogin;
use Modules\Core\Models\ActivityType;
use Modules\Core\Services\ActivityService;
use Modules\User\Models\User;
use Modules\User\Services\AuthService;

class SessionController extends BaseApiController
{
    /**
     * Refresh the session's last activity timestamp when a user interacts.
     */
    public function keepAlive(Request $request): JsonResponse
    {
        $hasAuth = Auth::guard('admin')->check() || Auth::guard('web')->check();

        if (! $hasAuth) {
            return response()->json([
                'success' => false,
                'authenticated' => false,
                'message' => 'Unauthenticated session.',
            ], 401);
        }

        if ($request->hasSession()) {
            $request->session()->put('last_activity_time', now()->timestamp);
        }

        return response()->json([
            'success' => true,
            'authenticated' => true,
            'timestamp' => now()->timestamp,
            'message' => 'Session heartbeat refreshed successfully.',
        ]);
    }

    /**
     * Explicitly deactivate the active user or admin session due to inactivity timeout.
     */
    public function timeout(Request $request): JsonResponse
    {
        $isAdmin = Auth::guard('admin')->check();
        $isUser = Auth::guard('web')->check();
        $redirectUrl = route('login');

        if ($isAdmin) {
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
                            'action' => 'session_timeout',
                            'message' => "Administrator '{$admin->username}' session deactivated due to 10 minutes of inactivity.",
                        ],
                    ]);
                } catch (\Throwable $e) {
                    report($e);
                }
            }

            Auth::guard('admin')->logout();
            $redirectUrl = route('admin.login');
        }

        if ($isUser) {
            /** @var User|null $user */
            $user = Auth::guard('web')->user();
            if ($user) {
                app(AuthService::class)->logout($user);
            }

            Auth::guard('web')->logout();
            $redirectUrl = route('login');
        }

        if ($request->hasSession()) {
            $request->session()->forget('last_activity_time');
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'success' => true,
            'session_expired' => true,
            'message' => 'Session deactivated due to 10 minutes of inactivity.',
            'redirect_url' => $redirectUrl,
        ]);
    }
}
