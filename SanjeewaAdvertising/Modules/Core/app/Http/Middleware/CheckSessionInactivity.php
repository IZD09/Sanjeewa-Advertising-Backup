<?php

namespace Modules\Core\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Admin\Models\Admin;
use Modules\Admin\Models\AdminLogin;
use Modules\Core\Models\ActivityType;
use Modules\Core\Services\ActivityService;
use Modules\User\Models\User;
use Modules\User\Services\AuthService;
use Symfony\Component\HttpFoundation\Response;

class CheckSessionInactivity
{
    /**
     * Handle an incoming request to verify that the active user or admin session
     * has not exceeded the inactivity idle timeout (default: 10 minutes).
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $isAdmin = Auth::guard('admin')->check();
        $isUser = Auth::guard('web')->check();

        // 1. Skip if neither guard is authenticated
        if (! $isAdmin && ! $isUser) {
            return $next($request);
        }

        // 2. Skip authentication / logout / heartbeat endpoints
        if ($this->shouldSkipRoute($request)) {
            return $next($request);
        }

        if (! $request->hasSession()) {
            return $next($request);
        }

        $lastActivity = $request->session()->get('last_activity_time');
        $inactivityLimitMinutes = (int) config('session.inactivity_timeout', 10);
        $maxIdleSeconds = $inactivityLimitMinutes * 60;
        $now = now()->timestamp;

        // 3. Check if idle timeout has been exceeded
        if ($lastActivity && ($now - (int) $lastActivity) >= $maxIdleSeconds) {
            return $this->deactivateInactiveSession($request);
        }

        // 4. Update last activity timestamp for active user requests.
        // Background polls (indicated by header or query param) must not reset the inactivity timer.
        $isBackgroundPoll = $request->header('X-Background-Poll') === '1'
            || $request->query('bg_poll') === '1';

        if (! $isBackgroundPoll) {
            $request->session()->put('last_activity_time', $now);
        }

        return $next($request);
    }

    /**
     * Determine whether the incoming request should bypass inactivity inspection.
     */
    protected function shouldSkipRoute(Request $request): bool
    {
        return $request->is(
            'login',
            'logout',
            'admin/login',
            'admin/logout',
            'session/keep-alive',
            'session/inactivity-timeout',
            'advertising/session/*'
        );
    }

    /**
     * Deactivate the active session, record logout metrics in database, and redirect or return 401.
     */
    protected function deactivateInactiveSession(Request $request): Response
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

        $timeoutMessage = 'Your session has been deactivated due to 10 minutes of inactivity. Please log in again.';

        if ($request->wantsJson() || $request->ajax() || $request->expectsJson() || $request->is('advertising/*') || $request->is('api/*')) {
            return response()->json([
                'success' => false,
                'message' => $timeoutMessage,
                'session_expired' => true,
                'redirect_url' => $redirectUrl,
            ], 401);
        }

        return redirect($redirectUrl)->withErrors([
            'username' => $timeoutMessage,
        ])->with('session_timeout', $timeoutMessage);
    }
}
