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
                            <div class="hr-tab-pane active" id="paneHrStaff">
                                <div class="hr-toolbar">
                                    <div class="hr-search-box">
                                        <i class="fa-solid fa-magnifying-glass"></i>
                                        <input type="text" id="searchHrStaff" placeholder="Search by name, NIC, or mobile...">
                                    </div>
                                    <div class="hr-filters">
                                        <select class="ant-select" id="filterHrStaffStatus">
                                            <option value="ALL">All Statuses</option>
                                            @foreach($staffStatuses as $status)
                                                <option value="{{ $status->staff_status }}">{{ $status->staff_status }}</option>
                                            @endforeach
                                        </select>
                                    </div>
                                </div>

                                <div class="hr-table-responsive">
                                    <table class="ant-table" id="hrStaffTable">
                                        <thead>
                                            <tr>
                                                <th>Staff Member</th>
                                                <th>NIC Number</th>
                                                <th>Mobile Phone</th>
                                                <th>Status</th>
                                                <th>Joined Date</th>
                                                <th class="hr-col-actions" style="width: 265px; text-align: center;">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="hrStaffTableBody">
                                            @forelse($staffMembers as $member)
                                                @php
                                                    $fullName = trim($member->first_name.' '.$member->last_name);
                                                    $initials = strtoupper(substr($member->first_name, 0, 1).substr($member->last_name, 0, 1));
                                                    $statusLabel = $member->status?->staff_status ?? 'Unknown';
                                                    $statusClass = match (strtolower($statusLabel)) {
                                                        'active' => 'hr-tag-green',
                                                        'on leave' => 'hr-tag-orange',
                                                        'suspended', 'resigned' => 'hr-tag-red',
                                                        default => 'hr-tag-default',
                                                    };
                                                    $statusRowClass = match (strtolower($statusLabel)) {
                                                        'active' => 'hr-status-row-active',
                                                        'on leave' => 'hr-status-row-on-leave',
                                                        'suspended' => 'hr-status-row-suspended',
                                                        'resigned' => 'hr-status-row-resigned',
                                                        default => 'hr-status-row-inactive',
                                                    };
                                                @endphp
                                                <tr
                                                    class="hr-staff-clickable-row {{ $statusRowClass }}"
                                                    data-staff-id="{{ $member->id }}"
                                                    data-staff-search="{{ strtolower($fullName.' '.$member->nic.' '.$member->mobile) }}"
                                                    data-staff-status="{{ $statusLabel }}"
                                                >
                                                    <td>
                                                        <div class="hr-person-cell js-hr-view-staff" data-staff-id="{{ $member->id }}" title="Click to view staff details">
                                                            <div class="hr-avatar">{{ $initials }}</div>
                                                            <div>
                                                                <div class="hr-person-name hr-person-link">{{ $fullName }}</div>
                                                                <div class="hr-person-sub">ID #STF-{{ str_pad((string) $member->id, 3, '0', STR_PAD_LEFT) }}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td><span class="hr-mono">{{ $member->nic }}</span></td>
                                                    <td>
                                                        <span class="hr-phone"><i class="fa-solid fa-phone"></i> {{ $member->mobile }}</span>
                                                    </td>
                                                    <td>
                                                        <span class="hr-tag {{ $statusClass }}"><span class="hr-dot"></span> {{ $statusLabel }}</span>
                                                    </td>
                                                    <td>{{ $member->add_at ? $member->add_at->format('Y-m-d') : '—' }}</td>
                                                    <td>
                                                        <div class="hr-row-actions">
                                                            <button
                                                                type="button"
                                                                class="ant-btn ant-btn-default ant-btn-sm js-hr-quick-salary"
                                                                data-staff-id="{{ $member->id }}"
                                                                title="Update Base Salary"
                                                            >
                                                                <i class="fa-solid fa-money-check-dollar" style="color: #722ed1;"></i> Salary
                                                            </button>
                                                            <button
                                                                type="button"
                                                                class="ant-btn ant-btn-default ant-btn-sm js-hr-quick-daily-pay"
                                                                data-staff-id="{{ $member->id }}"
                                                                title="Record Daily Salary Payment"
                                                            >
                                                                <i class="fa-solid fa-hand-holding-dollar" style="color: #10b981;"></i> Pay
                                                            </button>
                                                            <button
                                                                type="button"
                                                                class="ant-btn ant-btn-default ant-btn-sm js-hr-change-status"
                                                                data-staff-id="{{ $member->id }}"
                                                                data-staff-name="{{ $fullName }}"
                                                                data-staff-nic="{{ $member->nic }}"
                                                                data-status-id="{{ $member->staff_statuses_id }}"
                                                                data-status-label="{{ $statusLabel }}"
                                                                title="Change Employment Status"
                                                            >
                                                                <i class="fa-solid fa-arrows-rotate" style="color: #1677ff;"></i> Status
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            @empty
                                                <tr>
                                                    <td colspan="6" class="hr-empty-cell">
                                                        <i class="fa-solid fa-people-group"></i>
                                                        <div>No staff members found. Click <strong>Add Staff</strong> to register an employee.</div>
                                                    </td>
                                                </tr>
                                            @endforelse
                                        </tbody>
                                    </table>
                                </div>

                                <div class="hr-pagination-bar" id="hrStaffPagination" style="display: none;">
                                    <span class="hr-pagination-info" id="hrStaffPageInfo"></span>
                                    <div class="hr-pagination-controls" id="hrStaffPageControls"></div>
                                </div>
                            </div>

                            <!-- TAB 2: BASE SALARIES -->
                            <div class="hr-tab-pane" id="paneHrSalaries">
                                <div class="hr-toolbar">
                                    <div class="hr-search-box">
                                        <i class="fa-solid fa-magnifying-glass"></i>
                                        <input type="text" id="searchHrSalaries" placeholder="Search salary records by staff name or NIC...">
                                    </div>
                                    <div class="hr-filters">
                                        <button type="button" class="ant-btn ant-btn-secondary ant-btn-sm" id="btnToolbarSetSalary">
                                            <i class="fa-solid fa-plus"></i> Record Salary Update
                                        </button>
                                    </div>
                                </div>

                                <div class="hr-table-responsive">
                                    <table class="ant-table" id="hrSalariesTable">
                                        <thead>
                                            <tr>
                                                <th>Record ID</th>
                                                <th>Staff Member</th>
                                                <th>NIC Number</th>
                                                <th>Salary Amount</th>
                                                <th>Last Updated</th>
                                                <th>Employment Status</th>
                                            </tr>
                                        </thead>
                                        <tbody id="hrSalariesTableBody">
                                            @forelse($salaries as $salary)
                                                @php
                                                    $staff = $salary->staff;
                                                    $fullName = $staff ? trim($staff->first_name.' '.$staff->last_name) : 'Unknown Staff';
                                                    $initials = $staff ? strtoupper(substr($staff->first_name, 0, 1).substr($staff->last_name, 0, 1)) : 'ST';
                                                    $statusLabel = $staff?->status?->staff_status ?? 'Unknown';
                                                    $statusClass = match (strtolower($statusLabel)) {
                                                        'active' => 'hr-tag-green',
                                                        'on leave' => 'hr-tag-orange',
                                                        'suspended', 'resigned' => 'hr-tag-red',
                                                        default => 'hr-tag-default',
                                                    };
                                                    $statusRowClass = match (strtolower($statusLabel)) {
                                                        'active' => 'hr-status-row-active',
                                                        'on leave' => 'hr-status-row-on-leave',
                                                        'suspended' => 'hr-status-row-suspended',
                                                        'resigned' => 'hr-status-row-resigned',
                                                        default => 'hr-status-row-inactive',
                                                    };
                                                @endphp
                                                <tr class="{{ $statusRowClass }}" data-salary-search="{{ strtolower($fullName.' '.($staff?->nic ?? '')) }}">
                                                    <td><span class="hr-mono">#SAL-{{ str_pad((string) $salary->id, 4, '0', STR_PAD_LEFT) }}</span></td>
                                                    <td>
                                                        <div class="hr-person-cell">
                                                            <div class="hr-avatar purple">{{ $initials }}</div>
                                                            <div>
                                                                <div class="hr-person-name">{{ $fullName }}</div>
                                                                <div class="hr-person-sub">{{ $staff?->mobile ?? '—' }}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td><span class="hr-mono">{{ $staff?->nic ?? '—' }}</span></td>
                                                    <td><strong class="hr-amount purple">Rs. {{ number_format((float) $salary->amount, 2) }}</strong></td>
                                                    <td>{{ $salary->update_at ? $salary->update_at->format('Y-m-d H:i') : '—' }}</td>
                                                    <td><span class="hr-tag {{ $statusClass }}"><span class="hr-dot"></span> {{ $statusLabel }}</span></td>
                                                </tr>
                                            @empty
                                                <tr>
                                                    <td colspan="6" class="hr-empty-cell">
                                                        <i class="fa-solid fa-money-check-dollar"></i>
                                                        <div>No base salary records available yet.</div>
                                                    </td>
                                                </tr>
                                            @endforelse
                                        </tbody>
                                    </table>
                                </div>

                                <div class="hr-pagination-bar" id="hrSalariesPagination" style="display: none;">
                                    <span class="hr-pagination-info" id="hrSalariesPageInfo"></span>
                                    <div class="hr-pagination-controls" id="hrSalariesPageControls"></div>
                                </div>
                            </div>

                            <!-- TAB 3: DAILY SALARY PAYMENTS -->
                            <div class="hr-tab-pane" id="paneHrDailySalaries">
                                <div class="hr-toolbar">
                                    <div class="hr-search-box">
                                        <i class="fa-solid fa-magnifying-glass"></i>
                                        <input type="text" id="searchHrDailySalaries" placeholder="Search daily payments by staff name or NIC...">
                                    </div>
                                    <div class="hr-filters">
                                        <input type="date" class="ant-select" id="filterHrDailyDate" title="Filter by payment date">
                                        <button type="button" class="ant-btn ant-btn-default ant-btn-sm" id="btnClearHrDailyDate" title="Clear Date Filter">
                                            <i class="fa-solid fa-rotate-left"></i> Clear
                                        </button>
                                    </div>
                                </div>

                                <div class="hr-table-responsive">
                                    <table class="ant-table" id="hrDailySalariesTable">
                                        <thead>
                                            <tr>
                                                <th>Payment Ref</th>
                                                <th>Staff Member</th>
                                                <th>NIC Number</th>
                                                <th>Amount Paid</th>
                                                <th>Paid Date & Time</th>
                                            </tr>
                                        </thead>
                                        <tbody id="hrDailySalariesTableBody">
                                            @php
                                                $dailyDateColorMap = [];
                                                $dailyDateGroupIndex = 0;
                                            @endphp
                                            @forelse($dailySalaries as $daily)
                                                @php
                                                    $staff = $daily->staff;
                                                    $fullName = $staff ? trim($staff->first_name.' '.$staff->last_name) : 'Unknown Staff';
                                                    $initials = $staff ? strtoupper(substr($staff->first_name, 0, 1).substr($staff->last_name, 0, 1)) : 'ST';
                                                    $payDateIso = $daily->pay_at ? $daily->pay_at->format('Y-m-d') : '';
                                                    if ($payDateIso !== '' && ! array_key_exists($payDateIso, $dailyDateColorMap)) {
                                                        $dailyDateColorMap[$payDateIso] = $dailyDateGroupIndex % 6;
                                                        $dailyDateGroupIndex++;
                                                    }
                                                    $dateGroupClass = $payDateIso !== '' ? 'hr-daily-date-'.$dailyDateColorMap[$payDateIso] : '';
                                                @endphp
                                                <tr
                                                    class="{{ $dateGroupClass }}"
                                                    data-daily-search="{{ strtolower($fullName.' '.($staff?->nic ?? '')) }}"
                                                    data-daily-date="{{ $payDateIso }}"
                                                >
                                                    <td><span class="hr-mono">#DS-{{ str_pad((string) $daily->id, 4, '0', STR_PAD_LEFT) }}</span></td>
                                                    <td>
                                                        <div class="hr-person-cell">
                                                            <div class="hr-avatar green">{{ $initials }}</div>
                                                            <div>
                                                                <div class="hr-person-name">{{ $fullName }}</div>
                                                                <div class="hr-person-sub">{{ $staff?->mobile ?? '—' }}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td><span class="hr-mono">{{ $staff?->nic ?? '—' }}</span></td>
                                                    <td><strong class="hr-amount green">Rs. {{ number_format((float) $daily->amount, 2) }}</strong></td>
                                                    <td>{{ $daily->pay_at ? $daily->pay_at->format('Y-m-d H:i') : '—' }}</td>
                                                </tr>
                                            @empty
                                                <tr>
                                                    <td colspan="5" class="hr-empty-cell">
                                                        <i class="fa-solid fa-calendar-day"></i>
                                                        <div>No daily salary payments recorded yet.</div>
                                                    </td>
                                                </tr>
                                            @endforelse
                                        </tbody>
                                    </table>
                                </div>

                                <div class="hr-pagination-bar" id="hrDailySalariesPagination" style="display: none;">
                                    <span class="hr-pagination-info" id="hrDailySalariesPageInfo"></span>
                                    <div class="hr-pagination-controls" id="hrDailySalariesPageControls"></div>
                                </div>
                            </div>
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
