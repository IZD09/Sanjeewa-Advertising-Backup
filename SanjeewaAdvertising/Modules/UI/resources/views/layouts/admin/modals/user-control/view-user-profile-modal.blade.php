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
