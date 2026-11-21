@extends('ui::layouts.master')

@section('title', 'HR & Payroll Management')
@section('page_title', 'HR & Payroll Management')
@section('breadcrumb')Admin Workspace / Management / <span>HR & Payroll</span>@endsection

@push('styles')
    {{ module_vite('build-ui', 'resources/assets/css/core.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/admin-hr-management.css') }}
@endpush

@section('content')

    <div class="app-layout app" id="app">

        @include('ui::components.sidebar', ['role' => 'admin'])

        <!-- Sidebar Backdrop Overlay -->
        <div class="sidebar-overlay" id="sidebarOverlay"></div>

        <main class="main-area" id="mainArea">

            @include('ui::components.topbar')

            <!-- Dynamic Main Content Viewport -->
            <div class="main-content-viewport" id="mainContentViewport">

                <!-- ==================================================================
                     ADMIN MODULE: HR & PAYROLL MANAGEMENT
                     ================================================================== -->
                <div class="app-module" id="module-hr-management" data-module="hr-management">
                    <div class="hr-container">

                        <!-- 1. Page Header -->
                        <div class="hr-page-header">
                            <div class="hr-page-title-wrap">
                                <h2><i class="fa-solid fa-people-group"></i> HR & Payroll Management</h2>
                                <p class="hr-page-subtitle">Manage company staff profiles, employment statuses, base salary records, and daily salary disbursements.</p>
                            </div>
                            <div class="hr-header-actions">
                                <button type="button" class="ant-btn ant-btn-default" id="btnOpenPayDailySalaryModal">
                                    <i class="fa-solid fa-hand-holding-dollar" style="color: #10b981;"></i> Pay Daily Salary
                                </button>
                                <button type="button" class="ant-btn ant-btn-secondary" id="btnOpenSetSalaryModal">
                                    <i class="fa-solid fa-money-check-dollar"></i> Set Base Salary
                                </button>
                                <button type="button" class="ant-btn ant-btn-primary" id="btnOpenAddStaffModal">
                                    <i class="fa-solid fa-user-plus"></i> Add Staff
                                </button>
                            </div>
                        </div>

                        <!-- 2. Summary KPI Cards (4 Cards Grid) -->
                        <div class="hr-summary-grid">
                            <!-- Card 1: Total Staff -->
                            <div class="hr-kpi-card">
                                <div>
                                    <span class="hr-kpi-label">Total Staff</span>
                                    <div class="hr-kpi-val" id="kpiTotalStaff">{{ $kpi['total_staff'] ?? 0 }}</div>
                                    <span class="hr-kpi-desc"><i class="fa-solid fa-id-card" style="color: #1677ff;"></i> Registered Employees</span>
                                </div>
                                <div class="hr-kpi-icon blue">
                                    <i class="fa-solid fa-people-group"></i>
                                </div>
                            </div>

                            <!-- Card 2: Active Staff -->
                            <div class="hr-kpi-card">
                                <div>
                                    <span class="hr-kpi-label">Active Staff</span>
                                    <div class="hr-kpi-val" id="kpiActiveStaff">{{ $kpi['active_staff'] ?? 0 }}</div>
                                    <span class="hr-kpi-desc"><i class="fa-solid fa-circle-check" style="color: #10b981;"></i> <span id="kpiOnLeaveStaffCount">{{ $kpi['on_leave_staff'] ?? 0 }}</span> On Leave</span>
                                </div>
                                <div class="hr-kpi-icon green">
                                    <i class="fa-solid fa-user-check"></i>
                                </div>
                            </div>

                            <!-- Card 3: Base Payroll Total -->
                            <div class="hr-kpi-card">
                                <div>
                                    <span class="hr-kpi-label">Base Payroll Total</span>
                                    <div class="hr-kpi-val" id="kpiMonthlyPayroll">Rs. {{ number_format((float) ($kpi['monthly_payroll_total'] ?? 0), 2) }}</div>
                                    <span class="hr-kpi-desc"><i class="fa-solid fa-wallet" style="color: #722ed1;"></i> Monthly Staff Salaries</span>
                                </div>
                                <div class="hr-kpi-icon purple">
                                    <i class="fa-solid fa-money-bill-wave"></i>
                                </div>
                            </div>

                            <!-- Card 4: Daily Salary Payouts -->
                            <div class="hr-kpi-card">
                                <div>
                                    <span class="hr-kpi-label">Daily Salary Payouts</span>
                                    <div class="hr-kpi-val" id="kpiDailyPayouts">Rs. {{ number_format((float) ($kpi['daily_salary_total'] ?? 0), 2) }}</div>
                                    <span class="hr-kpi-desc"><i class="fa-solid fa-receipt" style="color: #f59e0b;"></i> <span id="kpiDailyPayoutsCount">{{ $kpi['daily_salary_count'] ?? 0 }}</span> Payments Recorded</span>
                                </div>
                                <div class="hr-kpi-icon orange">
                                    <i class="fa-solid fa-hand-holding-dollar"></i>
                                </div>
                            </div>

                            <!-- Card 5: Today's Daily Salary -->
                            <div class="hr-kpi-card">
                                <div>
                                    <span class="hr-kpi-label">Today's Daily Salary</span>
                                    <div class="hr-kpi-val" id="kpiTodayDailyPayouts">Rs. {{ number_format((float) ($kpi['today_daily_salary_total'] ?? 0), 2) }}</div>
                                    <span class="hr-kpi-desc"><i class="fa-solid fa-calendar-day" style="color: #06b6d4;"></i> <span id="kpiTodayDailyPayoutsCount">{{ $kpi['today_daily_salary_count'] ?? 0 }}</span> Paid Today</span>
                                </div>
                                <div class="hr-kpi-icon cyan">
                                    <i class="fa-solid fa-coins"></i>
                                </div>
                            </div>
                        </div>

                        <!-- 3. Main Ant Design Tab Container -->
                        <div class="hr-card">
                            <!-- Tab Navigation Header -->
                            <div class="hr-tabs-nav">
                                <button type="button" class="hr-tab-btn active" data-hr-tab="paneHrStaff">
                                    <i class="fa-solid fa-users"></i> Staff Directory
                                    <span class="hr-tab-badge" id="badgeHrStaffCount">{{ $staffMembers->count() }}</span>
                                </button>
                                <button type="button" class="hr-tab-btn" data-hr-tab="paneHrSalaries">
                                    <i class="fa-solid fa-money-check-dollar"></i> Base Salaries
                                    <span class="hr-tab-badge" id="badgeHrSalaryCount">{{ $salaries->count() }}</span>
                                </button>
                                <button type="button" class="hr-tab-btn" data-hr-tab="paneHrDailySalaries">
                                    <i class="fa-solid fa-calendar-day"></i> Daily Salary Payments
                                    <span class="hr-tab-badge" id="badgeHrDailySalaryCount">{{ $dailySalaries->count() }}</span>
                                </button>
                            </div>

                            <!-- TAB 1: STAFF DIRECTORY -->
                            @include('ui::layouts.admin.pages.hr-management.tabs.staff-directory')

                            <!-- TAB 2: BASE SALARIES -->
                            @include('ui::layouts.admin.pages.hr-management.tabs.base-salaries')

                            <!-- TAB 3: DAILY SALARY PAYMENTS -->
                            @include('ui::layouts.admin.pages.hr-management.tabs.daily-salary-payments')
                        </div>

                    </div>
                </div>

                {{-- HR Management Page Modals --}}
                @include('ui::layouts.admin.modals.hr-management.add-staff-modal')
                @include('ui::layouts.admin.modals.hr-management.set-salary-modal')
                @include('ui::layouts.admin.modals.hr-management.pay-daily-salary-modal')
                @include('ui::layouts.admin.modals.hr-management.view-staff-modal')
                @include('ui::layouts.admin.modals.hr-management.change-staff-status-modal')

                <!-- Toast Alert Component -->
                <div class="hr-toast" id="hrToast">
                    <i class="fa-solid fa-circle-check" style="color: #10b981;"></i>
                    <span class="toast-msg">Operation completed successfully.</span>
                </div>

            </div>
        </main>
    </div>

@endsection

@push('scripts')
    {{ module_vite('build-ui', 'resources/assets/js/core.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/sidebar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/topbar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/admin/hr-management/processes/AdminHRManager.js') }}
@endpush
