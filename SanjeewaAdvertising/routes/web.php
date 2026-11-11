<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Modules\User\Models\User;

Route::get('/', function () {
    if (Auth::guard('admin')->check()) {
        return redirect()->route('admin.dashboard');
    }

    if (Auth::guard('web')->check()) {
        /** @var User|null $user */
        $user = Auth::guard('web')->user();

        if ($user && ($user->username === 'admin' || session('active_portal') === 'admin')) {
            return redirect()->route('admin.dashboard');
        }

        return redirect($user && method_exists($user, 'getDefaultLandingRoute') ? $user->getDefaultLandingRoute() : route('ui.dashboard'));
    }

    return redirect()->route('login');
});

Route::get('/admin', function () {
    if (Auth::guard('admin')->check()) {
        return redirect()->route('admin.dashboard');
    }

    if (Auth::guard('web')->check()) {
        /** @var User|null $user */
        $user = Auth::guard('web')->user();

        if ($user && ($user->username === 'admin' || session('active_portal') === 'admin')) {
            return redirect()->route('admin.dashboard');
        }

        return redirect($user && method_exists($user, 'getDefaultLandingRoute') ? $user->getDefaultLandingRoute() : route('ui.dashboard'));
    }

    return redirect()->route('admin.login');
});
