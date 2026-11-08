<?php

namespace Modules\User\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Admin\Models\Admin;
use Modules\User\Models\User;
use Symfony\Component\HttpFoundation\Response;

class CheckModulePermission
{
    /**
     * Handle an incoming request and ensure the user has permission to the module.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $module): Response
    {
        // 1. If unauthenticated, redirect to appropriate login route
        if (! Auth::guard('admin')->check() && ! Auth::guard('web')->check()) {
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.',
                ], 401);
            }

            return redirect()->guest($request->is('admin*') ? route('admin.login') : route('login'));
        }

        // 2. Administrators with active status have full access to all modules
        if (Auth::guard('admin')->check()) {
            /** @var Admin|null $admin */
            $admin = Auth::guard('admin')->user();
            if ($admin && $admin->canAccessModule($module)) {
                return $next($request);
            }

            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Administrator account is inactive or suspended.',
                ], 403);
            }

            return redirect()->route('admin.login')
                ->withErrors(['username' => 'Administrator account is inactive or suspended.']);
        }

        // 3. Check regular user module permissions
        /** @var User|null $user */
        $user = Auth::guard('web')->user();

        if ($user && $user->canAccessModule($module)) {
            return $next($request);
        }

        // 4. Access Denied response
        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => false,
                'message' => "Access denied. You do not have permission to access the '{$module}' module.",
            ], 403);
        }

        $fallbackRoute = $user && method_exists($user, 'getDefaultLandingRoute')
            ? $user->getDefaultLandingRoute()
            : route('login');

        // Prevent infinite redirect loop if current URL is already the fallback URL
        if ($fallbackRoute === $request->url() || $fallbackRoute === url()->current()) {
            abort(403, "Access denied. You do not have permission to access the '{$module}' module.");
        }

        return redirect($fallbackRoute)
            ->with('error', "Access denied. You do not have permission to access the '{$module}' module.");
    }
}
