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
