<?php

use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Auth;
use Modules\Core\Http\Middleware\BroadcastLiveSyncVersion;
use Modules\Core\Http\Middleware\CheckSessionInactivity;
use Modules\Core\Http\Middleware\RequestPriorityMiddleware;
use Modules\User\Http\Middleware\CheckModulePermission;
use Modules\User\Models\User;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->redirectGuestsTo(function (Request $request) {
            if ($request->is('admin*') || $request->routeIs('admin.*')) {
                return route('admin.login');
            }

            return route('login');
        });

        $middleware->redirectUsersTo(function () {
            if (Auth::guard('admin')->check()) {
                return route('admin.dashboard');
            }

            /** @var User|null $user */
            $user = Auth::guard('web')->user();

            return $user && method_exists($user, 'getDefaultLandingRoute')
                ? $user->getDefaultLandingRoute()
                : route('ui.dashboard');
        });

        $middleware->alias([
            'module.permission' => CheckModulePermission::class,
            'request.priority' => RequestPriorityMiddleware::class,
        ]);

        $middleware->web(append: [
            CheckSessionInactivity::class,
            RequestPriorityMiddleware::class,
            BroadcastLiveSyncVersion::class,
        ]);

        $middleware->api(prepend: [
            EncryptCookies::class,
            AddQueuedCookiesToResponse::class,
            StartSession::class,
        ], append: [
            CheckSessionInactivity::class,
            RequestPriorityMiddleware::class,
            BroadcastLiveSyncVersion::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('advertising/*') || $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
