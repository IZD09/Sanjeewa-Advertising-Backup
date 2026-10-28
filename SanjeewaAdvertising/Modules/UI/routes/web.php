<?php

use Illuminate\Support\Facades\Route;
use Modules\UI\Http\Controllers\UIController;

Route::view('/dashboard', 'ui::layouts.pages.dashboard.dashboard')->name('ui.dashboard');
Route::view('/place-order', 'ui::layouts.pages.place-order.place-order')->name('ui.place-order');
Route::view('/customers', 'ui::layouts.pages.customers.customers')->name('ui.customers');
Route::view('/print-jobs', 'ui::layouts.pages.print-jobs.print-jobs')->name('ui.print-jobs');
Route::view('/reports', 'ui::layouts.pages.reports.reports')->name('ui.reports');
Route::view('/settings', 'ui::layouts.pages.settings.settings')->name('ui.settings');
Route::view('/inventory', 'ui::layouts.pages.inventory.inventory')->name('ui.inventory');
Route::view('/grn', 'ui::layouts.pages.grn.grn')->name('ui.grn');
Route::view('/payments', 'ui::layouts.pages.payments.payments')->name('ui.payments');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('uis', UIController::class)->names('ui');
});
