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
                                </button>
                                <button type="button" class="uc-tab-btn" data-tab="panePermissions">
                                    <i class="fa-solid fa-key"></i> Set User Permissions
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

                <!-- ==================================================================
                     MODAL 1: ADD USER
                     ================================================================== -->
                <div class="uc-modal-overlay" id="modalAddUser">
                    <div class="uc-modal-card">
                        <div class="uc-modal-header">
                            <h3><i class="fa-solid fa-user-plus" style="color: #1677ff;"></i> Add New User</h3>
                            <button type="button" class="uc-modal-close modal-close-trigger"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                        <form id="formAddUser">
                            <div class="uc-modal-body">
                                <div class="uc-form-grid">
                                    <div class="uc-form-group">
                                        <label for="userFirstName">First Name <span class="req">*</span></label>
                                        <input type="text" id="userFirstName" placeholder="e.g. Kasun" required maxlength="50">
                                    </div>
                                    <div class="uc-form-group">
                                        <label for="userLastName">Last Name <span class="req">*</span></label>
                                        <input type="text" id="userLastName" placeholder="e.g. Bandara" required maxlength="50">
                                    </div>
                                    <div class="uc-form-group">
                                        <label for="userUsername">Username <span class="req">*</span></label>
                                        <input type="text" id="userUsername" placeholder="e.g. kasun_p" required maxlength="30">
                                    </div>
                                    <div class="uc-form-group">
                                        <label for="userMobile">Mobile Phone <span class="req">*</span></label>
                                        <input type="tel" id="userMobile" placeholder="e.g. 0771234567" required maxlength="15">
                                    </div>
                                    <div class="uc-form-group">
                                        <label for="userPassword">Password <span class="req">*</span></label>
                                        <input type="password" id="userPassword" placeholder="••••••••" required minlength="6" maxlength="255">
                                    </div>
                                    <div class="uc-form-group">
                                        <label for="userPasswordConfirm">Confirm Password <span class="req">*</span></label>
                                        <input type="password" id="userPasswordConfirm" placeholder="••••••••" required minlength="6" maxlength="255">
                                    </div>
                                    <div class="uc-form-group full">
                                        <label for="userStatusSelect">User Status <span class="req">*</span></label>
                                        <select id="userStatusSelect" name="user_statuses_id" required>
                                            @foreach($userStatuses as $status)
                                                <option value="{{ $status->id }}" {{ $status->user_status === 'Active' ? 'selected' : '' }}>
                                                    {{ $status->user_status }}
                                                </option>
                                            @endforeach
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="uc-modal-footer">
                                <button type="button" class="ant-btn ant-btn-default modal-close-trigger">Cancel</button>
                                <button type="submit" class="ant-btn ant-btn-primary">
                                    <i class="fa-solid fa-check"></i> Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- ==================================================================
                     MODAL 2: ADD ADMINISTRATOR
                     ================================================================== -->
                <div class="uc-modal-overlay" id="modalAddAdmin">
                    <div class="uc-modal-card">
                        <div class="uc-modal-header">
                            <h3><i class="fa-solid fa-shield-halved" style="color: #722ed1;"></i> Provision New Administrator</h3>
                            <button type="button" class="uc-modal-close modal-close-trigger"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                        <form id="formAddAdmin">
                            <div class="uc-modal-body">
                                <div class="uc-form-grid">
                                    <div class="uc-form-group">
                                        <label for="adminFirstName">First Name <span class="req">*</span></label>
                                        <input type="text" id="adminFirstName" placeholder="e.g. Sanjeewa" required>
                                    </div>
                                    <div class="uc-form-group">
                                        <label for="adminLastName">Last Name <span class="req">*</span></label>
                                        <input type="text" id="adminLastName" placeholder="e.g. Pushpakumara" required>
                                    </div>
                                    <div class="uc-form-group">
                                        <label for="adminUsername">Admin Username <span class="req">*</span></label>
                                        <input type="text" id="adminUsername" placeholder="e.g. admin_sanjeewa" required>
                                    </div>
                                    <div class="uc-form-group">
                                        <label for="adminEmail">Email Address <span class="req">*</span></label>
                                        <input type="email" id="adminEmail" placeholder="admin@advertising.lk" required>
                                    </div>
                                    <div class="uc-form-group">
                                        <label for="adminMobile">Mobile Phone <span class="req">*</span></label>
                                        <input type="tel" id="adminMobile" placeholder="e.g. 0777112233" required>
                                    </div>
                                    <div class="uc-form-group">
                                        <label for="adminTypeSelect">Admin Privilege Type <span class="req">*</span></label>
                                        <select id="adminTypeSelect" name="admin_types_id" required>
                                            @foreach($adminTypes as $type)
                                                <option value="{{ $type->id }}" {{ $type->admin_type === 'Administrator' ? 'selected' : '' }}>
                                                    {{ $type->admin_type }}
                                                </option>
                                            @endforeach
                                        </select>
                                    </div>
                                    <div class="uc-form-group">
                                        <label for="adminPassword">Password <span class="req">*</span></label>
                                        <input type="password" id="adminPassword" placeholder="••••••••" required minlength="6" maxlength="255">
                                    </div>
                                    <div class="uc-form-group">
                                        <label for="adminPasswordConfirm">Confirm Password <span class="req">*</span></label>
                                        <input type="password" id="adminPasswordConfirm" placeholder="••••••••" required minlength="6" maxlength="255">
                                    </div>
                                    <div class="uc-form-group full">
                                        <label for="adminStatusSelect">Account Status <span class="req">*</span></label>
                                        <select id="adminStatusSelect" name="admin_statuses_id" required>
                                            @foreach($adminStatuses as $status)
                                                <option value="{{ $status->id }}" {{ $status->admin_statas === 'Active' ? 'selected' : '' }}>
                                                    {{ $status->admin_statas }}
                                                </option>
                                            @endforeach
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="uc-modal-footer">
                                <button type="button" class="ant-btn ant-btn-default modal-close-trigger">Cancel</button>
                                <button type="submit" class="ant-btn ant-btn-secondary">
                                    <i class="fa-solid fa-shield-check"></i> Provision Admin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- ==================================================================
                     MODAL 3: VIEW USER PROFILE, LOGIN/LOGOUT, ACTIVITY & PASSWORD RESET
                     ================================================================== -->
                <div class="uc-modal-overlay" id="modalViewUserProfile">
                    <div class="uc-modal-card upm-modal-card">
                        <!-- Modal Header -->
                        <div class="uc-modal-header upm-modal-header">
                            <div class="upm-header-profile">
                                <div class="upm-avatar-circle" id="upModalAvatar">U</div>
                                <div class="upm-header-info">
                                    <div class="upm-header-title-row">
                                        <h3 id="upModalFullName">Staff User Profile</h3>
                                        <span class="ant-tag ant-tag-default" id="upModalUserIdBadge">ID #—</span>
                                        <span class="ant-tag ant-tag-green" id="upModalStatusBadge">Active</span>
                                        <span class="ant-tag ant-tag-default" id="upModalSessionBadge">Offline</span>
                                    </div>
                                    <span class="upm-header-username" id="upModalUsername">&#64;username</span>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <button type="button" class="ant-btn ant-btn-sm" id="btnUpModalRefresh" title="Refresh user profile & logs">
                                    <i class="fa-solid fa-rotate-right"></i> Refresh
                                </button>
                                <button type="button" class="uc-modal-close upm-close-trigger" title="Close">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Quick Summary Strip -->
                        <div class="upm-summary-strip">
                            <div class="upm-summary-item">
                                <i class="fa-solid fa-phone" style="color: #1677ff;"></i>
                                <div>
                                    <span class="upm-summary-label">Mobile Phone</span>
                                    <strong class="upm-summary-val" id="upModalMetaMobile">—</strong>
                                </div>
                            </div>
                            <div class="upm-summary-item">
                                <i class="fa-solid fa-calendar-check" style="color: #10b981;"></i>
                                <div>
                                    <span class="upm-summary-label">Registered Date</span>
                                    <strong class="upm-summary-val" id="upModalMetaRegistered">—</strong>
                                </div>
                            </div>
                            <div class="upm-summary-item">
                                <i class="fa-solid fa-clock-rotate-left" style="color: #f59e0b;"></i>
                                <div>
                                    <span class="upm-summary-label">Login Sessions</span>
                                    <strong class="upm-summary-val" id="upModalMetaLoginsCount">0 Sessions</strong>
                                </div>
                            </div>
                            <div class="upm-summary-item">
                                <i class="fa-solid fa-clipboard-list" style="color: #722ed1;"></i>
                                <div>
                                    <span class="upm-summary-label">Activity Records</span>
                                    <strong class="upm-summary-val" id="upModalMetaActivitiesCount">0 Logs</strong>
                                </div>
                            </div>
                            <div class="upm-summary-item">
                                <i class="fa-solid fa-shield-halved" style="color: #0284c7;"></i>
                                <div>
                                    <span class="upm-summary-label">Enabled Modules</span>
                                    <strong class="upm-summary-val" id="upModalMetaModulesCount">0 Modules</strong>
                                </div>
                            </div>
                        </div>

                        <!-- Profile Navigation Tabs -->
                        <div class="upm-tabs-nav">
                            <button type="button" class="upm-tab-btn active" data-upm-tab="upModalPaneOverview">
                                <i class="fa-solid fa-id-card"></i> Profile & Permissions
                            </button>
                            <button type="button" class="upm-tab-btn" data-upm-tab="upModalPaneLogins">
                                <i class="fa-solid fa-right-to-bracket"></i> Login & Logout Details
                                <span class="uc-tab-badge" id="upModalBadgeLogins">0</span>
                            </button>
                            <button type="button" class="upm-tab-btn" data-upm-tab="upModalPaneActivities">
                                <i class="fa-solid fa-list-check"></i> User Activity Details
                                <span class="uc-tab-badge" id="upModalBadgeActivities">0</span>
                            </button>
                            <button type="button" class="upm-tab-btn" data-upm-tab="upModalPanePassword">
                                <i class="fa-solid fa-key"></i> Change Password
                            </button>
                        </div>

                        <!-- Modal Body with Tab Panes -->
                        <div class="uc-modal-body upm-modal-body">

                            <!-- TAB PANE 1: PROFILE & PERMISSIONS -->
                            <div class="upm-tab-pane active" id="upModalPaneOverview">
                                <div class="upm-section-title">
                                    <h4><i class="fa-solid fa-user-check" style="color: #1677ff;"></i> Account & Personal Information</h4>
                                </div>
                                <div class="upm-details-grid">
                                    <div class="upm-detail-box">
                                        <span class="upm-detail-label">User ID</span>
                                        <strong class="upm-detail-value" id="upModalDetailId">#—</strong>
                                    </div>
                                    <div class="upm-detail-box">
                                        <span class="upm-detail-label">Username</span>
                                        <strong class="upm-detail-value" id="upModalDetailUsername">—</strong>
                                    </div>
                                    <div class="upm-detail-box">
                                        <span class="upm-detail-label">First Name</span>
                                        <strong class="upm-detail-value" id="upModalDetailFirstName">—</strong>
                                    </div>
                                    <div class="upm-detail-box">
                                        <span class="upm-detail-label">Last Name</span>
                                        <strong class="upm-detail-value" id="upModalDetailLastName">—</strong>
                                    </div>
                                    <div class="upm-detail-box">
                                        <span class="upm-detail-label">Mobile Phone</span>
                                        <strong class="upm-detail-value" id="upModalDetailMobile">—</strong>
                                    </div>
                                    <div class="upm-detail-box">
                                        <span class="upm-detail-label">Account Status</span>
                                        <strong class="upm-detail-value" id="upModalDetailStatus">—</strong>
                                    </div>
                                    <div class="upm-detail-box">
                                        <span class="upm-detail-label">Registered Timestamp</span>
                                        <strong class="upm-detail-value" id="upModalDetailRegistered">—</strong>
                                    </div>
                                    <div class="upm-detail-box">
                                        <span class="upm-detail-label">Current Session State</span>
                                        <strong class="upm-detail-value" id="upModalDetailSession">—</strong>
                                    </div>
                                </div>

                                <div class="upm-section-header" style="margin-top: 24px;">
                                    <div>
                                        <h4><i class="fa-solid fa-shield-halved" style="color: #722ed1;"></i> Assigned Module Permissions</h4>
                                        <p class="upm-section-sub">Granular access rights, operational privileges, and security restrictions for this staff account.</p>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <button type="button" class="ant-btn ant-btn-sm" id="btnUpModalManagePerms">
                                            <i class="fa-solid fa-sliders" style="color: #1677ff;"></i> Configure Permissions Matrix
                                        </button>
                                    </div>
                                </div>

                                <!-- Permissions Filter & Stats Bar -->
                                <div class="upm-perm-toolbar">
                                    <div class="upm-perm-filter-pills" id="upmPermFilterGroup">
                                        <button type="button" class="upm-filter-pill active" data-filter="ALL">
                                            All Modules <span class="upm-filter-count" id="upmPermCountAll">0</span>
                                        </button>
                                        <button type="button" class="upm-filter-pill" data-filter="GRANTED">
                                            <i class="fa-solid fa-circle-check" style="color: #16a34a; font-size: 11px;"></i> Active Access <span class="upm-filter-count" id="upmPermCountGranted">0</span>
                                        </button>
                                        <button type="button" class="upm-filter-pill" data-filter="RESTRICTED">
                                            <i class="fa-solid fa-ban" style="color: #94a3b8; font-size: 11px;"></i> Restricted <span class="upm-filter-count" id="upmPermCountRestricted">0</span>
                                        </button>
                                    </div>
                                    <div class="uc-search-box upm-perm-search-box">
                                        <i class="fa-solid fa-magnifying-glass"></i>
                                        <input type="text" id="upModalPermSearch" placeholder="Search module (e.g. Print, Inventory)...">
                                    </div>
                                </div>

                                <!-- Clean, Orderly Permissions Cards Grid -->
                                <div class="upm-permissions-grid" id="upModalPermissionsGrid">
                                    <!-- Populated dynamically via ViewUserProfileModal -->
                                </div>
                            </div>

                            <!-- TAB PANE 2: LOGIN & LOGOUT DETAILS -->
                            <div class="upm-tab-pane" id="upModalPaneLogins">
                                <div class="upm-section-header">
                                    <div>
                                        <h4><i class="fa-solid fa-clock-rotate-left" style="color: #16a34a;"></i> User Login & Logout Session History</h4>
                                        <p class="upm-section-sub">Complete audit trail of sign-in timestamps, sign-out timestamps, and session durations.</p>
                                    </div>
                                </div>
                                <div class="uc-table-responsive" style="margin-top: 10px;">
                                    <table class="ant-table">
                                        <thead>
                                            <tr>
                                                <th style="width: 100px;">Session ID</th>
                                                <th>Login Date & Time</th>
                                                <th>Logout Date & Time</th>
                                                <th style="width: 150px;">Session Duration</th>
                                                <th style="width: 130px;">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody id="upModalLoginsTableBody">
                                            <!-- Populated dynamically -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- TAB PANE 3: USER ACTIVITY DETAILS -->
                            <div class="upm-tab-pane" id="upModalPaneActivities">
                                <div class="upm-section-header">
                                    <div>
                                        <h4><i class="fa-solid fa-clipboard-list" style="color: #722ed1;"></i> User Activity & Audit Details</h4>
                                        <p class="upm-section-sub">Track actions performed by this user (logins, print jobs, profile edits) and admin operations on this account.</p>
                                    </div>
                                    <div class="upm-activity-filters">
                                        <div class="uc-search-box" style="min-width: 220px;">
                                            <i class="fa-solid fa-magnifying-glass"></i>
                                            <input type="text" id="upModalActivitySearch" placeholder="Search activities...">
                                        </div>
                                        <select class="ant-select" id="upModalActivityFilter">
                                            <option value="ALL">All Activities</option>
                                            <option value="User">User Actions Only</option>
                                            <option value="Admin">Admin Actions Only</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="upm-activity-legend">
                                    <span class="upm-legend-item"><span class="upm-legend-dot upm-dot-login"></span> Login</span>
                                    <span class="upm-legend-item"><span class="upm-legend-dot upm-dot-logout"></span> Logout</span>
                                    <span class="upm-legend-item"><span class="upm-legend-dot upm-dot-password"></span> Password & Security</span>
                                    <span class="upm-legend-item"><span class="upm-legend-dot upm-dot-permission"></span> Permissions</span>
                                    <span class="upm-legend-item"><span class="upm-legend-dot upm-dot-status"></span> Status Change</span>
                                    <span class="upm-legend-item"><span class="upm-legend-dot upm-dot-printjob"></span> Print Jobs</span>
                                </div>
                                <div class="uc-table-responsive" style="margin-top: 10px;">
                                    <table class="ant-table">
                                        <thead>
                                            <tr>
                                                <th style="width: 95px;">Ref ID</th>
                                                <th style="width: 165px;">Date & Time</th>
                                                <th style="width: 165px;">Activity Type</th>
                                                <th>Activity Details</th>
                                                <th style="width: 160px;">Performed By</th>
                                            </tr>
                                        </thead>
                                        <tbody id="upModalActivitiesTableBody">
                                            <!-- Populated dynamically -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- TAB PANE 4: CHANGE USER PASSWORD (WITH ADMIN VERIFICATION) -->
                            <div class="upm-tab-pane" id="upModalPanePassword">
                                <div class="upm-security-notice">
                                    <div class="upm-security-notice-icon">
                                        <i class="fa-solid fa-user-shield"></i>
                                    </div>
                                    <div>
                                        <h4>Administrator Verification Required</h4>
                                        <p>You are resetting the password for <strong id="upModalPassTargetUser">this staff user</strong>. Submitting a new password will prompt you to verify your <strong>Administrator Username & Password</strong> before the change is applied.</p>
                                    </div>
                                </div>

                                <form id="formAdminResetUserPassword" class="upm-password-form">
                                    <div class="uc-form-grid">
                                        <div class="uc-form-group">
                                            <label for="upModalNewPassword">New User Password <span class="req">*</span></label>
                                            <div class="upm-pass-input-wrap">
                                                <input type="password" id="upModalNewPassword" placeholder="Minimum 6 characters" minlength="6" maxlength="255" required autocomplete="new-password">
                                                <button type="button" class="upm-toggle-pass" data-target="upModalNewPassword" title="Show / Hide Password">
                                                    <i class="fa-solid fa-eye"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="uc-form-group">
                                            <label for="upModalConfirmPassword">Confirm New Password <span class="req">*</span></label>
                                            <div class="upm-pass-input-wrap">
                                                <input type="password" id="upModalConfirmPassword" placeholder="Re-enter new password" minlength="6" maxlength="255" required autocomplete="new-password">
                                                <button type="button" class="upm-toggle-pass" data-target="upModalConfirmPassword" title="Show / Hide Password">
                                                    <i class="fa-solid fa-eye"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="upm-pass-alert error" id="upModalPasswordError" style="display: none;"></div>
                                    <div class="upm-pass-alert success" id="upModalPasswordSuccess" style="display: none;"></div>

                                    <div class="upm-password-actions">
                                        <button type="submit" class="ant-btn ant-btn-primary" id="btnUpModalSavePassword">
                                            <i class="fa-solid fa-shield-halved"></i> Verify Admin & Update Password
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </div>

                        <!-- Modal Footer -->
                        <div class="uc-modal-footer">
                            <button type="button" class="ant-btn ant-btn-default upm-close-trigger">Close</button>
                        </div>
                    </div>
                </div>

                <!-- Toast Alert Component -->
                <div class="uc-toast" id="ucToast">
                    <i class="fa-solid fa-circle-check" style="color: #52c41a;"></i>
                    <span class="toast-msg">Operation completed successfully.</span>
                </div>

                <!-- Admin Security Permission Modal for Administrators Tab & Add Admin -->
                <div class="ap-lock-overlay" id="adminSecurityLockModal">
                    <div class="ap-lock-card">
                        <div class="ap-lock-icon-wrap">
                            <i class="fa-solid fa-lock"></i>
                        </div>
                        <h3 class="ap-lock-title">Security Permission Required</h3>
                        <p class="ap-lock-desc" id="secVerifyDesc">
                            This action requires administrator credentials. Please enter your administrator username and password to proceed.
                        </p>

                        <form class="ap-lock-form" id="formVerifySecurityAccess">
                            <div class="ap-lock-field">
                                <label for="secVerifyUsername">Admin Username</label>
                                <input type="text" id="secVerifyUsername" placeholder="e.g. admin" required autocomplete="username">
                            </div>
                            <div class="ap-lock-field">
                                <label for="secVerifyPassword">Admin Password</label>
                                <input type="password" id="secVerifyPassword" placeholder="••••••••" required autocomplete="current-password">
                            </div>

                            <div class="ap-lock-error" id="secVerifyError"></div>

                            <div class="ap-lock-actions">
                                <button type="button" class="ap-lock-btn-cancel" id="btnSecVerifyCancel">
                                    <i class="fa-solid fa-xmark"></i> Cancel
                                </button>
                                <button type="submit" class="ap-lock-btn-submit" id="btnSecVerifySubmit">
                                    <i class="fa-solid fa-key"></i> Verify & Proceed
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

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

