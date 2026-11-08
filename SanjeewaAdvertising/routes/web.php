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

        return redirect($user && method_exists($user, 'getDefaultLandingRoute') ? $user->getDefaultLandingRoute() : route('ui.dashboard'));
    }

    return redirect()->route('login');
});
