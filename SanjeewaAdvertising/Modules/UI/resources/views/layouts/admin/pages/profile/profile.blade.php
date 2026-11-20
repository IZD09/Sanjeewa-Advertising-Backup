@php
    $isAdminAuth = Auth::guard('admin')->check();
    $currentAdmin = $isAdminAuth ? Auth::guard('admin')->user() : (Auth::guard('web')->user() ?? Auth::guard('admin')->user());
    $adminUsername = $currentAdmin->username ?? 'admin';
@endphp
@extends('ui::layouts.master')

@section('title', 'Admin Profile & Security')
@section('page_title', 'Administrator Profile')
@section('breadcrumb')Admin Workspace / Management / <span>Admin Profile</span>@endsection

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

                <div class="app-module" id="module-admin-profile" data-module="admin-profile">
                    <div class="ap-container">

                        <!-- Page Header -->
                        <div class="ap-page-header">
                            <div class="ap-page-title-wrap">
                                <h2><i class="fa-solid fa-user-gear"></i> Administrator Profile & Credentials</h2>
                                <p class="ap-page-subtitle">View admin details, configure security credentials, and inspect recent login sessions.</p>
                            </div>
                            <div class="ap-header-actions">
                                <a href="{{ route('admin.user-control') }}" class="ant-btn ant-btn-default">
                                    <i class="fa-solid fa-user-shield"></i> User Control
                                </a>
                                <a href="{{ route('admin.dashboard') }}" class="ant-btn ant-btn-primary">
                                    <i class="fa-solid fa-gauge"></i> Dashboard
                                </a>
                            </div>
                        </div>

                        <!-- Main Profile Content (Initially blurred until verified) -->
                        <div class="ap-content-wrap" id="adminProfileContent">
                            <div class="ap-grid">

                                <!-- Left Profile Overview Card -->
                                <div class="ap-card">
                                    <div class="ap-avatar-block">
                                        <div class="ap-avatar-circle" id="adminAvatarCircle">AD</div>
                                        <h3 class="ap-name" id="adminDisplayName">{{ $currentAdmin->first_name ?? 'System' }} {{ $currentAdmin->last_name ?? 'Admin' }}</h3>
                                        <span class="ap-username" id="adminDisplayUsername">&#64;{{ $adminUsername }}</span>
                                        <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                                            <span class="ap-badge ap-badge-purple" id="adminBadgeRole">Administrator</span>
                                            <span class="ap-badge ap-badge-green" id="adminBadgeStatus">Active</span>
                                        </div>
                                    </div>

                                    <div class="ap-info-list">
                                        <div class="ap-info-row">
                                            <span class="ap-info-label"><i class="fa-solid fa-envelope" style="color: #1677ff;"></i> Email</span>
                                            <span class="ap-info-val" id="adminMetaEmail">{{ $currentAdmin->email ?? '—' }}</span>
                                        </div>
                                        <div class="ap-info-row">
                                            <span class="ap-info-label"><i class="fa-solid fa-phone" style="color: #52c41a;"></i> Mobile</span>
                                            <span class="ap-info-val" id="adminMetaMobile">{{ $currentAdmin->mobile ?? '—' }}</span>
                                        </div>
                                        <div class="ap-info-row">
                                            <span class="ap-info-label"><i class="fa-solid fa-calendar-check" style="color: #722ed1;"></i> Provisioned</span>
                                            <span class="ap-info-val" id="adminMetaAdded">—</span>
                                        </div>
                                        <div class="ap-info-row">
                                            <span class="ap-info-label"><i class="fa-solid fa-clock-rotate-left" style="color: #fa8c16;"></i> Login Logs</span>
                                            <span class="ap-info-val" id="adminMetaLoginsCount">—</span>
                                        </div>
                                        <div class="ap-info-row">
                                            <span class="ap-info-label"><i class="fa-solid fa-timeline" style="color: #722ed1;"></i> Activities</span>
                                            <span class="ap-info-val" id="adminMetaActivitiesCount">—</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Right Profile Details & Settings Tabs Card -->
                                <div class="ap-tabs-card">
                                    <div class="ap-tabs-header">
                                        <button type="button" class="ap-tab-btn active" data-tab="tabProfileDetails">
                                            <i class="fa-solid fa-id-card"></i> Personal Details
                                        </button>
                                        <button type="button" class="ap-tab-btn" data-tab="tabSecurity">
                                            <i class="fa-solid fa-shield-halved"></i> Password & Security
                                        </button>
                                        <button type="button" class="ap-tab-btn" data-tab="tabLoginHistory">
                                            <i class="fa-solid fa-list-check"></i> Recent Logins
                                        </button>
                                        <button type="button" class="ap-tab-btn" data-tab="tabActivities">
                                            <i class="fa-solid fa-clock-rotate-left"></i> Activities
                                            <i class="fa-solid fa-lock" id="actTabLockIcon" style="font-size: 11px; margin-left: 4px; color: #faad14;"></i>
                                        </button>
                                    </div>

                                    <div class="ap-tab-body">
                                        <form id="formUpdateProfile">
                                            <!-- Tab 1: Personal Details -->
                                            <div class="ap-tab-pane active" id="tabProfileDetails">
                                                <div class="ap-form-grid">
                                                    <div class="ap-form-group">
                                                        <label for="profFirstName">First Name</label>
                                                        <input type="text" id="profFirstName" name="first_name" required autocomplete="given-name">
                                                    </div>
                                                    <div class="ap-form-group">
                                                        <label for="profLastName">Last Name</label>
                                                        <input type="text" id="profLastName" name="last_name" required autocomplete="family-name">
                                                    </div>
                                                    <div class="ap-form-group">
                                                        <label for="profUsername">Username (Immutable)</label>
                                                        <input type="text" id="profUsername" name="username" readonly disabled autocomplete="username">
                                                    </div>
                                                    <div class="ap-form-group">
                                                        <label for="profEmail">Email Address</label>
                                                        <input type="email" id="profEmail" name="email" required autocomplete="email">
                                                    </div>
                                                    <div class="ap-form-group">
                                                        <label for="profMobile">Mobile Phone</label>
                                                        <input type="tel" id="profMobile" name="mobile" required autocomplete="tel">
                                                    </div>
                                                    <div class="ap-form-group">
                                                        <label for="profRole">Privilege Role</label>
                                                        <input type="text" id="profRole" name="role" readonly disabled>
                                                    </div>
                                                    <div class="ap-form-group full">
                                                        <label for="profStatus">Account Status</label>
                                                        <input type="text" id="profStatus" name="status" readonly disabled>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Tab 2: Password & Security -->
                                            <div class="ap-tab-pane" id="tabSecurity">
                                                <div class="ap-form-grid">
                                                    <div class="ap-form-group full">
                                                        <label for="profCurrentPassword">Current Password <span style="color: var(--text-muted); font-weight: 400;">(Required only when changing password)</span></label>
                                                        <input type="password" id="profCurrentPassword" name="current_password" placeholder="Enter current password" autocomplete="current-password">
                                                    </div>
                                                    <div class="ap-form-group">
                                                        <label for="profNewPassword">New Password</label>
                                                        <input type="password" id="profNewPassword" name="new_password" placeholder="At least 6 characters" minlength="6" autocomplete="new-password">
                                                    </div>
                                                    <div class="ap-form-group">
                                                        <label for="profConfirmPassword">Confirm New Password</label>
                                                        <input type="password" id="profConfirmPassword" name="password_confirmation" placeholder="Confirm new password" minlength="6" autocomplete="new-password">
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Action Button -->
                                            <div id="profActionWrap" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border, #e2e8f0); display: flex; justify-content: flex-end;">
                                                <button type="submit" class="ant-btn ant-btn-primary" id="btnSaveProfile">
                                                    <i class="fa-solid fa-floppy-disk"></i> Update Profile
                                                </button>
                                            </div>
                                        </form>

                                        <!-- Tab 3: Recent Logins -->
                                        <div class="ap-tab-pane" id="tabLoginHistory">
                                            <div class="uc-table-responsive" style="margin-top: 6px;">
                                                <table class="ant-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Session ID</th>
                                                            <th>Login Timestamp</th>
                                                            <th>Logout Timestamp</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="adminLoginsTableBody">
                                                        <!-- Dynamic log entries injected here -->
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <!-- Tab 4: Activities -->
                                        <div class="ap-tab-pane" id="tabActivities">
                                            <!-- Activities Toolbar: Search & Filter -->
                                            <div class="upm-activity-filters" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
                                                <div style="display: flex; gap: 10px; align-items: center; flex: 1; max-width: 480px;">
                                                    <div style="position: relative; flex: 1;">
                                                        <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted, #64748b); font-size: 13px;"></i>
                                                        <input type="text" id="adminActivitySearchInput" placeholder="Search activities, actions or messages..." style="padding-left: 34px; height: 36px; width: 100%; border-radius: 6px; border: 1px solid var(--border, #d9d9d9); background: var(--input-bg, #ffffff); color: var(--text, #1e293b); font-size: 13px;">
                                                    </div>
                                                    <select id="adminActivityTypeSelect" style="height: 36px; padding: 0 10px; border-radius: 6px; border: 1px solid var(--border, #d9d9d9); font-size: 13px; background: var(--surface, #ffffff); color: var(--text, #1e293b);">
                                                        <option value="ALL">All Activity Types</option>
                                                    </select>
                                                </div>
                                                <div style="display: flex; gap: 8px; align-items: center;">
                                                    <button type="button" class="ant-btn ant-btn-default" id="btnRefreshAdminActivities" title="Refresh activities">
                                                        <i class="fa-solid fa-arrows-rotate"></i> Refresh
                                                    </button>
                                                    <button type="button" class="ant-btn ant-btn-default" id="btnLockAdminActivities" title="Lock Activities tab" style="color: #faad14;">
                                                        <i class="fa-solid fa-lock"></i> Lock Tab
                                                    </button>
                                                </div>
                                            </div>

                                            <!-- Activity Table Legend -->
                                            <div class="upm-activity-legend">
                                                <span style="font-weight: 700; color: var(--text); margin-right: 4px;">Activity Types:</span>
                                                <span class="upm-legend-item"><span class="upm-legend-dot upm-dot-login"></span> Login</span>
                                                <span class="upm-legend-item"><span class="upm-legend-dot upm-dot-logout"></span> Logout</span>
                                                <span class="upm-legend-item"><span class="upm-legend-dot upm-dot-permission"></span> Permissions</span>
                                                <span class="upm-legend-item"><span class="upm-legend-dot upm-dot-security"></span> Security</span>
                                                <span class="upm-legend-item"><span class="upm-legend-dot upm-dot-status"></span> User Management</span>
                                            </div>

                                            <!-- Activities Table -->
                                            <div class="uc-table-responsive" style="margin-top: 10px;">
                                                <table class="ant-table">
                                                    <thead>
                                                        <tr>
                                                            <th style="width: 160px;">Activity ID / Type</th>
                                                            <th>Description & Details</th>
                                                            <th style="width: 190px;">Timestamp</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="adminActivitiesTableBody">
                                                        <!-- Dynamic activity entries injected here -->
                                                    </tbody>
                                                </table>
                                            </div>

                                            <!-- Pagination Footer -->
                                            <div id="adminActivitiesPagination" style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; font-size: 12.5px; color: var(--text-muted, #64748b);">
                                                <span id="adminActivitiesCountInfo">Showing 0 activities</span>
                                                <div style="display: flex; gap: 6px;">
                                                    <button type="button" class="ant-btn ant-btn-default ant-btn-sm" id="btnAdminActPrev" disabled>
                                                        <i class="fa-solid fa-chevron-left"></i> Previous
                                                    </button>
                                                    <button type="button" class="ant-btn ant-btn-default ant-btn-sm" id="btnAdminActNext" disabled>
                                                        Next <i class="fa-solid fa-chevron-right"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

                {{-- Profile Page Modals --}}
                @include('ui::layouts.admin.modals.profile.profile-lock-modal')
                @include('ui::layouts.admin.modals.profile.activities-verify-modal')

                <!-- Toast Alert Component -->
                <div class="uc-toast" id="apToast">
                    <i class="fa-solid fa-circle-check" style="color: #52c41a;"></i>
                    <span class="toast-msg">Operation completed successfully.</span>
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
    {{ module_vite('build-ui', 'resources/assets/js/admin/profile/AdminProfileManager.js') }}
@endpush

