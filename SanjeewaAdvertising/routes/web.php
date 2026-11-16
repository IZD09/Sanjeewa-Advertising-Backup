<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Modules\Admin\Models\Admin;
use Modules\User\Models\User;

Route::get('/', function () {
    if (Auth::guard('admin')->check()) {
        /** @var Admin|null $admin */
        $admin = Auth::guard('admin')->user();
        if ($admin && method_exists($admin, 'canAccessModule') && $admin->canAccessModule('Dashboard')) {
            return redirect()->route('admin.dashboard');
        }
        Auth::guard('admin')->logout();
    }

    if (Auth::guard('web')->check()) {
        /** @var User|null $user */
        $user = Auth::guard('web')->user();

        if ($user && ($user->username === 'admin' || session('active_portal') === 'admin')) {
            return redirect()->route('admin.dashboard');
        }

        $target = $user && method_exists($user, 'getDefaultLandingRoute')
            ? $user->getDefaultLandingRoute()
            : route('ui.user-profile');

        if (empty($target) || $target === route('login') || $target === url('/login') || $target === url('/')) {
            $target = route('ui.user-profile');
        }

        return redirect($target);
    }

    return redirect()->route('login');
});

Route::get('/admin', function () {
    if (Auth::guard('admin')->check()) {
        /** @var Admin|null $admin */
        $admin = Auth::guard('admin')->user();
        if ($admin && method_exists($admin, 'canAccessModule') && $admin->canAccessModule('Dashboard')) {
            return redirect()->route('admin.dashboard');
        }
        Auth::guard('admin')->logout();
    }

    if (Auth::guard('web')->check()) {
        /** @var User|null $user */
        $user = Auth::guard('web')->user();

        if ($user && ($user->username === 'admin' || session('active_portal') === 'admin')) {
            return redirect()->route('admin.dashboard');
        }

        $target = $user && method_exists($user, 'getDefaultLandingRoute')
            ? $user->getDefaultLandingRoute()
            : route('ui.user-profile');

        if (empty($target) || $target === route('admin.login') || $target === url('/admin/login') || $target === url('/admin')) {
            $target = route('ui.user-profile');
        }

        return redirect($target);
    }

    return redirect()->route('admin.login');
});
