@php
    $userStatuses = \Modules\User\Models\UserStatus::orderBy('id', 'asc')->get();
    $adminTypes = \Modules\Admin\Models\AdminType::orderBy('id', 'asc')->get();
    $adminStatuses = \Modules\Admin\Models\AdminStatus::orderBy('id', 'asc')->get();
    $isAdminAuth = Auth::guard('admin')->check();
    $currentAdmin = $isAdminAuth ? Auth::guard('admin')->user() : (Auth::guard('web')->user() ?? Auth::guard('admin')->user());
    $adminUsername = $currentAdmin->username ?? 'admin';
@endphp
@extends('ui::layouts.master')

@section('title', 'Admin User Control & Permissions')
@section('page_title', 'User & Access Control')
@section('breadcrumb')Admin Workspace / Management / <span>User Control</span>@endsection

@push('styles')
    {{ module_vite('build-ui', 'resources/assets/css/core.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/admin-user-control.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/admin-profile.css') }}
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
                     ADMIN MODULE: USER CONTROL & ROLE PERMISSION MANAGEMENT
                     ================================================================== -->
                <div class="app-module" id="module-user-control" data-module="user-control">
                    <div class="uc-container">

                        <!-- 1. Page Header -->
                        <div class="uc-page-header">
                            <div class="uc-page-title-wrap">
                                <h2><i class="fa-solid fa-user-shield"></i> User Control & Access Privileges</h2>
                                <p class="uc-page-subtitle">Add staff users, provision system administrators, and manage granular module permission matrices.</p>
                            </div>
                            <div class="uc-header-actions">
                                <button type="button" class="ant-btn ant-btn-default" id="btnQuickPermissions">
                                    <i class="fa-solid fa-key" style="color: #1677ff;"></i> Set Permissions
                                </button>
                                <button type="button" class="ant-btn ant-btn-secondary" id="btnOpenAddAdminModal">
                                    <i class="fa-solid fa-shield-halved"></i> Add Admin
                                </button>
                                <button type="button" class="ant-btn ant-btn-primary" id="btnOpenAddUserModal">
                                    <i class="fa-solid fa-user-plus"></i> Add User
                                </button>
                            </div>
                        </div>

                        <!-- 2. Summary KPI Cards (4 Cards Grid) -->
                        <div class="uc-summary-grid">
                            <!-- Card 1: Total Staff Users -->
                            <div class="uc-kpi-card">
                                <div>
                                    <span class="uc-kpi-label">Staff Users</span>
                                    <div class="uc-kpi-val" id="kpiTotalUsers">4</div>
                                    <span class="uc-kpi-desc"><i class="fa-solid fa-users" style="color: #1677ff;"></i> Production & Sales Staff</span>
                                </div>
                                <div class="uc-kpi-icon blue">
                                    <i class="fa-solid fa-users"></i>
                                </div>
                            </div>

                            <!-- Card 2: Total Administrators -->
                            <div class="uc-kpi-card">
                                <div>
                                    <span class="uc-kpi-label">Administrators</span>
                                    <div class="uc-kpi-val" id="kpiTotalAdmins">3</div>
                                    <span class="uc-kpi-desc"><i class="fa-solid fa-shield-halved" style="color: #722ed1;"></i> Management & Admins</span>
                                </div>
                                <div class="uc-kpi-icon purple">
                                    <i class="fa-solid fa-user-shield"></i>
                                </div>
                            </div>

                            <!-- Card 3: Active Accounts -->
                            <div class="uc-kpi-card">
                                <div>
                                    <span class="uc-kpi-label">Active Accounts</span>
                                    <div class="uc-kpi-val" id="kpiActiveAccounts">6</div>
                                    <span class="uc-kpi-desc"><i class="fa-solid fa-circle-check" style="color: #52c41a;"></i> Unlocked Logins</span>
                                </div>
                                <div class="uc-kpi-icon green">
                                    <i class="fa-solid fa-circle-check"></i>
                                </div>
                            </div>

                            <!-- Card 4: Configured Permissions -->
                            <div class="uc-kpi-card">
                                <div>
                                    <span class="uc-kpi-label">Permissions Configured</span>
                                    <div class="uc-kpi-val" id="kpiConfiguredPerms">4 Users</div>
                                    <span class="uc-kpi-desc"><i class="fa-solid fa-sliders" style="color: #fa8c16;"></i> Granular Matrix Rules</span>
                                </div>
                                <div class="uc-kpi-icon orange">
                                    <i class="fa-solid fa-lock-open"></i>
                                </div>
                            </div>
                        </div>

                        <!-- 3. Main Ant Design Tab Container -->
                        <div class="uc-card">
                            <!-- Tab Navigation Header -->
                            <div class="uc-tabs-nav">
                                <button type="button" class="uc-tab-btn active" data-tab="paneStaffUsers">
                                    <i class="fa-solid fa-users"></i> Staff Users 
                                    <span class="uc-tab-badge" id="badgeStaffCount">4</span>
                                </button>
                                <button type="button" class="uc-tab-btn" data-tab="paneAdmins">
                                    <i class="fa-solid fa-shield-halved"></i> Administrators 
                                    <span class="uc-tab-badge" id="badgeAdminCount">3</span>
                                    <i class="fa-solid fa-lock" id="adminTabLockIcon" style="font-size: 11px; margin-left: 4px; color: #faad14;" title="Permission required"></i>
                                </button>
                                <button type="button" class="uc-tab-btn" data-tab="panePermissions">
                                    <i class="fa-solid fa-key"></i> Set User Permissions
                                    <i class="fa-solid fa-lock" id="permTabLockIcon" style="font-size: 11px; margin-left: 4px; color: #faad14;" title="Permission required"></i>
                                </button>
                            </div>

                            <!-- TAB 1: STAFF USERS -->
                            <div class="uc-tab-pane active" id="paneStaffUsers">
                                <div class="uc-toolbar">
                                    <div class="uc-search-box">
                                        <i class="fa-solid fa-magnifying-glass"></i>
                                        <input type="text" id="searchUsers" placeholder="Search by name, username, mobile...">
                                    </div>
                                    <div class="uc-filters">
                                        <select class="ant-select" id="filterUserStatus">
                                            <option value="ALL">All Statuses</option>
                                            @foreach($userStatuses as $status)
                                                <option value="{{ $status->user_status }}">{{ $status->user_status }}</option>
                                            @endforeach
                                        </select>
                                        <div class="uc-live-badge" id="ucUsersLiveBadge" title="Live auto-update active (updates every 5 seconds)">
                                            <span class="uc-live-pulse"></span>
                                            <span class="uc-live-text">Live Update</span>
                                        </div>
                                        <button type="button" class="ant-btn ant-btn-default ant-btn-icon-only" id="btnRefreshUsers" title="Refresh Staff Users Now">
                                            <i class="fa-solid fa-arrows-rotate"></i>
                                        </button>
                                    </div>
                                </div>

                                <div class="uc-table-responsive">
                                    <table class="ant-table">
                                        <thead>
                                            <tr>
                                                <th>User Details</th>
                                                <th>Mobile Phone</th>
                                                <th>Registered</th>
                                                <th>Status</th>
                                                <th style="width: 220px;">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="usersTableBody">
                                            <!-- Injected dynamically via UserHandler -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- TAB 2: ADMINISTRATORS -->
                            <div class="uc-tab-pane" id="paneAdmins">
                                <div class="uc-toolbar">
                                    <div class="uc-search-box">
                                        <i class="fa-solid fa-magnifying-glass"></i>
                                        <input type="text" id="searchAdmins" placeholder="Search by name, email, mobile...">
                                    </div>
                                    <div class="uc-filters">
                                        <select class="ant-select" id="filterAdminType">
                                            <option value="ALL">All Admin Types</option>
                                            <option value="Super Admin">Super Admin</option>
                                            <option value="Administrator">Administrator</option>
                                            <option value="Manager">Manager</option>
                                            <option value="Accountant">Accountant</option>
                                            <option value="Operator">Operator</option>
                                        </select>
                                        <button type="button" class="ant-btn ant-btn-default" id="btnLockAdminTab" title="Lock Administrators Tab">
                                            <i class="fa-solid fa-lock"></i> Lock
                                        </button>
                                    </div>
                                </div>

                                <div class="uc-table-responsive">
                                    <table class="ant-table">
                                        <thead>
                                            <tr>
                                                <th>Administrator</th>
                                                <th>Access Level</th>
                                                <th>Email Address</th>
                                                <th>Mobile Phone</th>
                                                <th>Created Date</th>
                                                <th>Status</th>
                                                <th style="width: 80px;">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="adminsTableBody">
                                            <!-- Injected dynamically via AdminHandler -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- TAB 3: USER PERMISSIONS MATRIX -->
                            <div class="uc-tab-pane" id="panePermissions">
                                <!-- Permission Configuration Toolbar -->
                                <div class="uc-perm-header">
                                    <div class="uc-perm-user-picker">
                                        <label for="permSearchUser"><i class="fa-solid fa-user-check" style="color: #1677ff;"></i> Select User:</label>

                                        <!-- Unified Search + Dropdown (Searchable Select) -->
                                        <div class="uc-perm-search-box" id="permUserCombobox">
                                            <i class="fa-solid fa-magnifying-glass"></i>
                                            <input type="text" id="permSearchUser" placeholder="Search or select user by ID or Name (e.g. 1, Kamal)..." autocomplete="off" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="permSearchResults">
                                            <button type="button" class="uc-perm-search-clear" id="btnPermSearchClear" title="Clear search" style="display: none;">
                                                <i class="fa-solid fa-xmark"></i>
                                            </button>
                                            <button type="button" class="uc-perm-dropdown-toggle" id="btnPermDropdownToggle" title="Show users" tabindex="-1">
                                                <i class="fa-solid fa-chevron-down"></i>
                                            </button>
                                            <div class="uc-perm-search-results" id="permSearchResults" role="listbox" style="display: none;"></div>
                                        </div>

                                        <input type="hidden" id="permSelectUser" value="">

                                        <div id="permActiveUserBadge" class="uc-active-user-badge"></div>
                                    </div>

                                    <div class="uc-perm-presets">
                                        <select class="ant-select" id="permPresetRole">
                                            <option value="">-- Apply Role Preset --</option>
                                            <option value="production">Production Lead Preset</option>
                                            <option value="designer">Graphic Designer Preset</option>
                                            <option value="cashier">Front Desk Cashier Preset</option>
                                            <option value="inventory">Inventory Clerk Preset</option>
                                            <option value="manager">Full Manager Preset</option>
                                        </select>
                                        <button type="button" class="ant-btn ant-btn-sm" id="btnPermSelectAll">
                                            <i class="fa-solid fa-check-double"></i> Select All
                                        </button>
                                        <button type="button" class="ant-btn ant-btn-sm" id="btnPermClearAll">
                                            <i class="fa-solid fa-ban"></i> Clear All
                                        </button>
                                        <button type="button" class="ant-btn ant-btn-primary" id="btnSavePermissions">
                                            <i class="fa-solid fa-floppy-disk"></i> Save Permissions
                                        </button>
                                        <button type="button" class="ant-btn ant-btn-default ant-btn-sm" id="btnLockPermTab" title="Lock Permissions Tab">
                                            <i class="fa-solid fa-lock"></i> Lock
                                        </button>
                                    </div>
                                </div>

                                <div class="uc-table-responsive">
                                    <table class="ant-table uc-perm-table">
                                        <thead>
                                            <tr>
                                                <th style="width: 320px;">System Module</th>
                                                <th>View</th>
                                                <th>Create</th>
                                                <th>Edit</th>
                                                <th>Delete</th>
                                                <th>Export / Print</th>
                                            </tr>
                                        </thead>
                                        <tbody id="permissionsTableBody">
                                            <!-- Injected dynamically via PermissionHandler -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {{-- User Control Page Modals --}}
                @include('ui::layouts.admin.modals.user-control.add-user-modal')

                @include('ui::layouts.admin.modals.user-control.add-admin-modal')
                @include('ui::layouts.admin.modals.user-control.view-user-profile-modal')

                <!-- Toast Alert Component -->
                <div class="uc-toast" id="ucToast">
                    <i class="fa-solid fa-circle-check" style="color: #52c41a;"></i>
                    <span class="toast-msg">Operation completed successfully.</span>
                </div>

                @include('ui::layouts.admin.modals.user-control.security-lock-modal')

            </div>
        </main>
    </div>

@endsection

@push('scripts')
    <script>
        window.__CURRENT_ADMIN_USERNAME__ = "{{ $adminUsername }}";
    </script>
    {{ module_vite('build-ui', 'resources/assets/js/core.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/sidebar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/topbar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/admin/user-control/processes/UserControlManager.js') }}
@endpush

