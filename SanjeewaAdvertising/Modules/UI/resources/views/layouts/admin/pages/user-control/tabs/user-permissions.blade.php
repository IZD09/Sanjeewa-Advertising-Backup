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
