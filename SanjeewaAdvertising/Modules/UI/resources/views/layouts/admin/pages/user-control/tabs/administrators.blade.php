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
