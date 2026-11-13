@php
    $isAdminAuth = Auth::guard('admin')->check();
    $currentUser = $currentUser ?? ($isAdminAuth ? Auth::guard('admin')->user() : (Auth::guard('web')->user() ?? Auth::guard('admin')->user()));
    $username = $currentUser->username ?? 'user';
    $firstName = $currentUser->first_name ?? '';
    $lastName = $currentUser->last_name ?? '';
    $displayName = trim("{$firstName} {$lastName}") ?: $username;
    $initials = strtoupper(substr($firstName, 0, 1) . substr($lastName ?: $username, 0, 1)) ?: 'U';
@endphp
@extends('ui::layouts.master')

@section('title', 'User Profile & Security')
@section('page_title', 'User Profile')
@section('breadcrumb')Workspace / Management / <span>User Profile</span>@endsection

@push('styles')
    {{ module_vite('build-ui', 'resources/assets/css/core.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/user-profile.css') }}
@endpush

@section('content')

    <div class="app-layout app" id="app">

        @include('ui::components.sidebar', ['role' => 'user'])

        <!-- Sidebar Backdrop Overlay -->
        <div class="sidebar-overlay" id="sidebarOverlay"></div>

        <main class="main-area" id="mainArea">

            @include('ui::components.topbar')

            <!-- Dynamic Main Content Viewport -->
            <div class="main-content-viewport" id="mainContentViewport">

                <div class="app-module" id="module-user-profile" data-module="user-profile">
                    <div class="up-container">

                        <!-- Page Header -->
                        <div class="up-page-header">
                            <div class="up-page-title-wrap">
                                <h2><i class="fa-solid fa-user"></i> User Profile & Credentials</h2>
                                <p class="up-page-subtitle">View account profile details, update your mobile contact, modify credentials, and review assigned permissions.</p>
                            </div>
                            <div class="up-header-actions">
                                <a href="{{ route('ui.dashboard') }}" class="po-btn po-btn-secondary">
                                    <i class="fa-solid fa-gauge"></i> Dashboard
                                </a>
                            </div>
                        </div>

                        <!-- Main Profile Grid -->
                        <div class="up-content-wrap">
                            <div class="up-grid">

                                <!-- Left Profile Overview Card -->
                                <div class="up-card">
                                    <div class="up-avatar-block">
                                        <div class="up-avatar-circle" id="userAvatarCircle">{{ $initials }}</div>
                                        <h3 class="up-name" id="userDisplayName">{{ $displayName }}</h3>
                                        <span class="up-username" id="userDisplayUsername">&#64;{{ $username }}</span>
                                        <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                                            <span class="up-badge up-badge-blue" id="userBadgeRole">Staff Member</span>
                                            <span class="up-badge up-badge-green" id="userBadgeStatus">{{ $currentUser->status?->user_status ?? 'Active' }}</span>
                                        </div>
                                    </div>

                                    <div class="up-info-list">
                                        <div class="up-info-row">
                                            <span class="up-info-label"><i class="fa-solid fa-phone" style="color: var(--blue, #2563eb);"></i> Mobile Phone</span>
                                            <span class="up-info-val" id="userMetaMobile">{{ $currentUser->mobile ?? '—' }}</span>
                                        </div>
                                        <div class="up-info-row">
                                            <span class="up-info-label"><i class="fa-solid fa-calendar-check" style="color: #10b981;"></i> Registered On</span>
                                            <span class="up-info-val" id="userMetaRegistered">{{ $currentUser->register_at ? date('Y-m-d', strtotime((string)$currentUser->register_at)) : '—' }}</span>
                                        </div>
                                        <div class="up-info-row">
                                            <span class="up-info-label"><i class="fa-solid fa-clock-rotate-left" style="color: #f59e0b;"></i> Login Sessions</span>
                                            <span class="up-info-val" id="userMetaLoginsCount">—</span>
                                        </div>
                                        <div class="up-info-row">
                                            <span class="up-info-label"><i class="fa-solid fa-shield-halved" style="color: #8b5cf6;"></i> Access Modules</span>
                                            <span class="up-info-val" id="userMetaModulesCount">—</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Right Profile Details & Settings Tabs Card -->
                                <div class="up-tabs-card">
                                    <div class="up-tabs-header">
                                        <button type="button" class="up-tab-btn active" data-tab="tabPersonal">
                                            <i class="fa-solid fa-id-card"></i> Personal Details
                                        </button>
                                        <button type="button" class="up-tab-btn" data-tab="tabSecurity">
                                            <i class="fa-solid fa-shield-halved"></i> Password & Security
                                        </button>
                                        <button type="button" class="up-tab-btn" data-tab="tabPermissions">
                                            <i class="fa-solid fa-key"></i> Assigned Permissions
                                        </button>
                                        <button type="button" class="up-tab-btn" data-tab="tabLogins">
                                            <i class="fa-solid fa-list-check"></i> Recent Logins
                                        </button>
                                    </div>

                                    <div class="up-tab-body">
                                        <!-- Tab 1: Personal Details (Profile Update Form) -->
                                        <div class="up-tab-pane active" id="tabPersonal">
                                            <form id="formUpdateUserProfile">
                                                <div class="up-form-grid">
                                                    <div class="up-form-group">
                                                        <label for="upFirstName">First Name *</label>
                                                        <input type="text" id="upFirstName" name="first_name" value="{{ $firstName }}" required autocomplete="given-name">
                                                    </div>
                                                    <div class="up-form-group">
                                                        <label for="upLastName">Last Name *</label>
                                                        <input type="text" id="upLastName" name="last_name" value="{{ $lastName }}" required autocomplete="family-name">
                                                    </div>
                                                    <div class="up-form-group">
                                                        <label for="upUsername">Username (Immutable)</label>
                                                        <input type="text" id="upUsername" name="username" value="{{ $username }}" readonly disabled autocomplete="username">
                                                    </div>
                                                    <div class="up-form-group">
                                                        <label for="upMobile">Mobile Phone *</label>
                                                        <input type="tel" id="upMobile" name="mobile" value="{{ $currentUser->mobile ?? '' }}" required autocomplete="tel">
                                                    </div>
                                                    <div class="up-form-group full">
                                                        <label for="upStatus">Account Status</label>
                                                        <input type="text" id="upStatus" name="status" value="{{ $currentUser->status?->user_status ?? 'Active' }}" readonly disabled>
                                                    </div>
                                                </div>

                                                <!-- Profile Update Action Button -->
                                                <div class="up-form-actions">
                                                    <button type="submit" class="po-btn po-btn-primary up-btn-primary" id="btnSaveUserProfile">
                                                        <i class="fa-solid fa-floppy-disk"></i> Update Profile
                                                    </button>
                                                </div>
                                            </form>
                                        </div>

                                        <!-- Tab 2: Password & Security (Password Update Form) -->
                                        <div class="up-tab-pane" id="tabSecurity">
                                            <form id="formUpdatePassword">
                                                <div class="up-form-grid">
                                                    <div class="up-form-group full">
                                                        <label for="upCurrentPassword">Current Password *</label>
                                                        <input type="password" id="upCurrentPassword" placeholder="Enter current password" required autocomplete="current-password">
                                                    </div>
                                                    <div class="up-form-group">
                                                        <label for="upNewPassword">New Password *</label>
                                                        <input type="password" id="upNewPassword" placeholder="At least 6 characters" minlength="6" required autocomplete="new-password">
                                                    </div>
                                                    <div class="up-form-group">
                                                        <label for="upConfirmPassword">Confirm New Password *</label>
                                                        <input type="password" id="upConfirmPassword" placeholder="Confirm new password" minlength="6" required autocomplete="new-password">
                                                    </div>
                                                </div>
                                                <div id="upPasswordError" style="display: none; color: #dc2626; font-size: 13px; margin-top: 10px; font-weight: 600;"></div>

                                                <!-- Password Update Action Button -->
                                                <div class="up-form-actions">
                                                    <button type="submit" class="po-btn po-btn-primary up-btn-security" id="btnSaveUserPassword">
                                                        <i class="fa-solid fa-shield-halved"></i> Update Password
                                                    </button>
                                                </div>
                                            </form>
                                        </div>

                                        <!-- Tab 3: Assigned Permissions -->
                                        <div class="up-tab-pane" id="tabPermissions">
                                            <p style="margin-top: 0; color: #64748b; font-size: 13px;">Below is the list of administrative and operational modules enabled on your staff account.</p>
                                            <div class="up-perm-grid" id="userPermissionsContainer">
                                                <div style="text-align: center; color: #94a3b8; padding: 20px;">Loading permissions...</div>
                                            </div>
                                        </div>

                                        <!-- Tab 4: Recent Logins -->
                                        <div class="up-tab-pane" id="tabLogins">
                                            <p style="margin-top: 0; color: #64748b; font-size: 13px;">Inspect your recent login sessions and active sign-in history.</p>
                                            <div class="up-table-responsive" style="margin-top: 10px;">
                                                <table class="up-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Session ID</th>
                                                            <th>Login Timestamp</th>
                                                            <th>Logout Timestamp</th>
                                                            <th>Session Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="userLoginsTableBody">
                                                        <tr>
                                                            <td colspan="4" style="text-align: center; color: #94a3b8; padding: 20px;">Loading login history...</td>
                                                        </tr>
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

                <!-- Toast Notification -->
                <div class="up-toast" id="upToast">
                    <i class="fa-solid fa-circle-check" style="color: #52c41a;"></i>
                    <span id="upToastMsg">Operation completed successfully.</span>
                </div>

            </div>
        </main>
    </div>

@endsection

@push('scripts')
    {{ module_vite('build-ui', 'resources/assets/js/core.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/sidebar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/topbar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/profile.js') }}
@endpush
