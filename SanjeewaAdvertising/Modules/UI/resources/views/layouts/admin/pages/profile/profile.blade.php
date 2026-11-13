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
                                                        <label for="profCurrentPassword">Current Password <span style="color: #64748b; font-weight: 400;">(Required only when changing password)</span></label>
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
                                            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border, #e2e8f0); display: flex; justify-content: flex-end;">
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

                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

                <!-- ==================================================================
                     PERMISSION VERIFICATION MODAL (MANDATORY GATEWAY)
                     ================================================================== -->
                <div class="ap-lock-overlay" id="adminProfileLockModal">
                    <div class="ap-lock-card">
                        <div class="ap-lock-icon-wrap">
                            <i class="fa-solid fa-lock"></i>
                        </div>
                        <h3 class="ap-lock-title">Security Permission Required</h3>
                        <p class="ap-lock-desc">
                            This panel contains sensitive administrator credentials and account configurations. Please verify your administrator username and password to proceed.
                        </p>

                        <form class="ap-lock-form" id="formVerifyAdminAccess">
                            <div class="ap-lock-field">
                                <label for="verifyAdminUsername">Admin Username</label>
                                <input type="text" id="verifyAdminUsername" placeholder="e.g. admin" required autocomplete="username">
                            </div>
                            <div class="ap-lock-field">
                                <label for="verifyAdminPassword">Admin Password</label>
                                <input type="password" id="verifyAdminPassword" placeholder="••••••••" required autocomplete="current-password">
                            </div>

                            <div class="ap-lock-error" id="verifyAccessError"></div>

                            <div class="ap-lock-actions">
                                <button type="button" class="ap-lock-btn-cancel" id="btnCancelVerify">
                                    <i class="fa-solid fa-arrow-left"></i> Cancel
                                </button>
                                <button type="submit" class="ap-lock-btn-submit" id="btnVerifyAccessSubmit">
                                    <i class="fa-solid fa-key"></i> Verify & Unlock
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

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

