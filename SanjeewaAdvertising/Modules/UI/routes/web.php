<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Modules\UI\Http\Controllers\DashboardController;
use Modules\UI\Http\Controllers\UIController;

// =========================================================================
// PUBLIC AUTHENTICATION ROUTES (Accessible to guests)
// =========================================================================

Route::get('/login', function () {
    if (Auth::guard('admin')->check()) {
        return redirect()->route('admin.dashboard');
    }
    if (Auth::guard('web')->check()) {
        return redirect()->route('ui.dashboard');
    }

    return view('ui::layouts.pages.login.login');
})->name('login');

Route::get('/admin/login', function () {
    if (Auth::guard('admin')->check()) {
        return redirect()->route('admin.dashboard');
    }
    if (Auth::guard('web')->check()) {
        return redirect()->route('ui.dashboard');
    }

    return view('ui::layouts.admin.pages.login.login');
})->name('admin.login');

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

    Route::view('/customers', 'ui::layouts.pages.customers.customers')
        ->middleware('module.permission:Customers')
        ->name('ui.customers');

    Route::view('/print-jobs', 'ui::layouts.pages.print-jobs.print-jobs')
        ->middleware('module.permission:Print Jobs')
        ->name('ui.print-jobs');

    Route::view('/reports', 'ui::layouts.pages.reports.reports')
        ->middleware('module.permission:Reports')
        ->name('ui.reports');

    Route::view('/settings', 'ui::layouts.pages.settings.settings')
        ->middleware('module.permission:Settings')
        ->name('ui.settings');

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
    Route::view('/admin/user-control', 'ui::layouts.admin.pages.user-control.user-control')
        ->middleware('module.permission:User Control')
        ->name('admin.user-control');

    Route::get('/user-control', fn () => redirect()->route('admin.user-control'));

    Route::resource('uis', UIController::class)->names('ui');
});
