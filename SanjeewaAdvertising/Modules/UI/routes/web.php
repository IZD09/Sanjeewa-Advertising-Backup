<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Modules\Admin\Models\Admin;
use Modules\HR\Http\Controllers\HRController;
use Modules\UI\Http\Controllers\DashboardController;
use Modules\UI\Http\Controllers\SettingsController;
use Modules\UI\Http\Controllers\UIController;
use Modules\User\Http\Controllers\UserProfileController;
use Modules\User\Models\User;

// =========================================================================
// PUBLIC AUTHENTICATION ROUTES (Accessible to guests)
// =========================================================================

Route::get('/login', function () {
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
        $target = $user && method_exists($user, 'getDefaultLandingRoute')
            ? $user->getDefaultLandingRoute()
            : route('ui.user-profile');

        if (empty($target) || $target === route('login') || $target === url('/login')) {
            $target = route('ui.user-profile');
        }

        return redirect($target);
    }

    return view('ui::layouts.pages.login.login');
})->name('login');

Route::get('/admin/login', function () {
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

        if (empty($target) || $target === route('admin.login') || $target === url('/admin/login')) {
            $target = route('ui.user-profile');
        }

        return redirect($target);
    }

    return view('ui::layouts.admin.pages.login.login');
})->name('admin.login');

Route::get('/access-restricted', function () {
    $pendingUser = session('pending_user');

    if (! $pendingUser) {
        return redirect()->route('login');
    }

    return view('ui::layouts.pages.access-restricted.access-restricted', [
        'pendingUser' => $pendingUser,
    ]);
})->name('access.restricted');

// =========================================================================
// AUTHENTICATED & PERMISSION-PROTECTED APPLICATION ROUTES
// =========================================================================

Route::middleware(['auth:web,admin'])->group(function () {
    // Dashboard & Real-Time SSE Streams
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('module.permission:Dashboard')
        ->name('ui.dashboard');

    Route::get('/admin/dashboard', [DashboardController::class, 'index'])
        ->middleware('module.permission:Dashboard')
        ->name('admin.dashboard');

    Route::get('/dashboard/stream', [DashboardController::class, 'stream'])
        ->name('ui.dashboard.stream');

    Route::get('/dashboard/data', [DashboardController::class, 'data'])
        ->name('ui.dashboard.data');

    // Granular Module Permission Protected SPA Pages
    Route::view('/place-order', 'ui::layouts.pages.place-order.place-order')
        ->middleware('module.permission:Place Order')
        ->name('ui.place-order');

    Route::view('/reports', 'ui::layouts.pages.reports.reports')
        ->middleware('module.permission:Reports')
        ->name('ui.reports');

    Route::get('/settings', [SettingsController::class, 'index'])
        ->middleware('module.permission:Settings')
        ->name('ui.settings');

    Route::post('/settings', [SettingsController::class, 'update'])
        ->middleware('module.permission:Settings')
        ->name('ui.settings.update');

    Route::get('/settings/data', [SettingsController::class, 'getSettings'])
        ->middleware('module.permission:Settings')
        ->name('ui.settings.data');

    Route::view('/inventory', 'ui::layouts.pages.inventory.inventory')
        ->middleware('module.permission:Inventory')
        ->name('ui.inventory');

    Route::view('/grn', 'ui::layouts.pages.grn.grn')
        ->middleware('module.permission:GRN & Purchase Orders')
        ->name('ui.grn');

    Route::view('/payments', 'ui::layouts.pages.payments.payments')
        ->middleware('module.permission:Payments & Financials')
        ->name('ui.payments');

    // Administration & User Control (Restricted to Administrators & Granted Privilege)
    Route::get('/admin/hr-management', [HRController::class, 'index'])
        ->middleware('module.permission:User Control')
        ->name('admin.hr-management');

    Route::get('/hr-management', fn () => redirect()->route('admin.hr-management'));

    Route::view('/admin/user-control', 'ui::layouts.admin.pages.user-control.user-control')
        ->middleware('module.permission:User Control')
        ->name('admin.user-control');

    Route::view('/admin/profile', 'ui::layouts.admin.pages.profile.profile')
        ->middleware('module.permission:User Control')
        ->name('admin.profile.view');

    Route::get('/profile', [UserProfileController::class, 'index'])
        ->name('ui.user-profile');

    Route::get('/user/profile', fn () => redirect()->route('ui.user-profile'));

    Route::get('/user-control', fn () => redirect()->route('admin.user-control'));

    Route::resource('uis', UIController::class)->names('ui');
});
