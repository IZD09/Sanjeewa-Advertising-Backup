<!-- ==================================================================
     HR MODAL 4: VIEW STAFF MEMBER DETAILS
     ================================================================== -->
<div class="hr-modal-overlay" id="modalViewStaff">
    <div class="hr-modal-card hr-modal-card-xl">
        <div class="hr-modal-header">
            <h3><i class="fa-solid fa-id-badge" style="color: #1677ff;"></i> Staff Member Profile & Payroll Details</h3>
            <button type="button" class="hr-modal-close hr-modal-close-trigger" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="hr-modal-body hr-view-staff-body">
            <!-- Loading State -->
            <div class="hr-view-staff-loading" id="viewStaffLoading" style="display: none;">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Loading staff details...</span>
            </div>

            <!-- Error State -->
            <div class="hr-form-error" id="viewStaffError" style="display: none;"></div>

            <!-- Profile Content -->
            <div id="viewStaffContent" style="display: none;">
                <!-- Profile Banner -->
                <div class="hr-view-profile-banner">
                    <div class="hr-view-profile-identity">
                        <div class="hr-view-avatar" id="viewStaffAvatar">ST</div>
                        <div>
                            <div class="hr-view-name-row">
                                <h4 id="viewStaffFullName">—</h4>
                                <span class="hr-tag hr-tag-green" id="viewStaffStatusBadge">
                                    <span class="hr-dot"></span> Active
                                </span>
                            </div>
                            <div class="hr-view-sub" id="viewStaffCode">ID #STF-000</div>
                        </div>
                    </div>
                    <div class="hr-view-quick-actions">
                        <button type="button" class="ant-btn ant-btn-default ant-btn-sm" id="btnViewStaffSetSalary">
                            <i class="fa-solid fa-money-check-dollar" style="color: #722ed1;"></i> Set Salary
                        </button>
                        <button type="button" class="ant-btn ant-btn-default ant-btn-sm" id="btnViewStaffPayDaily">
                            <i class="fa-solid fa-hand-holding-dollar" style="color: #10b981;"></i> Daily Pay
                        </button>
                    </div>
                </div>

                <!-- Personal & Registration Info Grid -->
                <div class="hr-view-info-grid">
                    <div class="hr-view-info-tile">
                        <span class="hr-selected-meta-label"><i class="fa-solid fa-id-card"></i> NIC Number</span>
                        <span class="hr-view-info-val hr-mono" id="viewStaffNic">—</span>
                    </div>
                    <div class="hr-view-info-tile">
                        <span class="hr-selected-meta-label"><i class="fa-solid fa-phone"></i> Mobile Phone</span>
                        <span class="hr-view-info-val" id="viewStaffMobile">—</span>
                    </div>
                    <div class="hr-view-info-tile">
                        <span class="hr-selected-meta-label"><i class="fa-solid fa-calendar-check"></i> Joined Date</span>
                        <span class="hr-view-info-val" id="viewStaffJoinedAt">—</span>
                    </div>
                    <div class="hr-view-info-tile">
                        <span class="hr-selected-meta-label"><i class="fa-solid fa-user-shield"></i> Added By</span>
                        <span class="hr-view-info-val" id="viewStaffAddedBy">—</span>
                    </div>
                </div>

                <!-- Payroll Summary Strip -->
                <div class="hr-view-payroll-strip">
                    <div class="hr-view-payroll-card">
                        <span class="hr-selected-meta-label"><i class="fa-solid fa-money-bill-wave" style="color: #722ed1;"></i> Current Base Salary</span>
                        <div class="hr-view-payroll-val purple" id="viewStaffBaseSalary">Not Set</div>
                    </div>
                    <div class="hr-view-payroll-card">
                        <span class="hr-selected-meta-label" id="viewStaffMonthPaidLabel"><i class="fa-solid fa-hand-holding-dollar" style="color: #f59e0b;"></i> Daily Paid</span>
                        <div class="hr-view-payroll-val orange" id="viewStaffMonthPaid">Rs. 0.00</div>
                        <span class="hr-daily-metric-sub" id="viewStaffMonthPaidCount">0 payments</span>
                    </div>
                    <div class="hr-view-payroll-card">
                        <span class="hr-selected-meta-label"><i class="fa-solid fa-wallet" style="color: #10b981;"></i> Remaining This Month</span>
                        <div class="hr-view-payroll-val emerald" id="viewStaffMonthRemaining">—</div>
                    </div>
                </div>

                <!-- Sub-Tabs: Salary History & Daily Payments -->
                <div class="hr-view-tabs-nav">
                    <button type="button" class="hr-view-tab-btn active" data-view-tab="paneViewStaffSalaries">
                        <i class="fa-solid fa-money-check-dollar"></i> Base Salary History
                        <span class="hr-tab-badge" id="viewStaffSalaryHistoryCount">0</span>
                    </button>
                    <button type="button" class="hr-view-tab-btn" data-view-tab="paneViewStaffDaily">
                        <i class="fa-solid fa-calendar-day"></i> Daily Salary Payments
                        <span class="hr-tab-badge" id="viewStaffDailyHistoryCount">0</span>
                    </button>
                </div>

                <div class="hr-view-tab-pane active" id="paneViewStaffSalaries">
                    <div class="hr-table-responsive hr-view-table-scroll">
                        <table class="ant-table">
                            <thead>
                                <tr>
                                    <th>Record ID</th>
                                    <th>Base Salary Amount</th>
                                    <th>Updated At</th>
                                </tr>
                            </thead>
                            <tbody id="viewStaffSalariesTbody"></tbody>
                        </table>
                    </div>
                </div>

                <div class="hr-view-tab-pane" id="paneViewStaffDaily">
                    <div class="hr-table-responsive hr-view-table-scroll">
                        <table class="ant-table">
                            <thead>
                                <tr>
                                    <th>Payment Ref</th>
                                    <th>Amount Paid</th>
                                    <th>Paid Date & Time</th>
                                </tr>
                            </thead>
                            <tbody id="viewStaffDailyTbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div class="hr-modal-footer">
            <button type="button" class="ant-btn ant-btn-default hr-modal-close-trigger">Close</button>
        </div>
    </div>
</div>
