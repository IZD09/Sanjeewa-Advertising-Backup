<!-- TAB 1: STAFF DIRECTORY -->
<div class="hr-tab-pane active" id="paneHrStaff">
    <div class="hr-toolbar">
        <div class="hr-search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="searchHrStaff" placeholder="Search by name, NIC, or mobile...">
        </div>
        <div class="hr-filters">
            <select class="ant-select" id="filterHrStaffStatus">
                <option value="ALL">All Statuses</option>
                @foreach($staffStatuses as $status)
                    <option value="{{ $status->staff_status }}">{{ $status->staff_status }}</option>
                @endforeach
            </select>
        </div>
    </div>

    <div class="hr-table-responsive">
        <table class="ant-table" id="hrStaffTable">
            <thead>
                <tr>
                    <th>Staff Member</th>
                    <th>NIC Number</th>
                    <th>Mobile Phone</th>
                    <th>Status</th>
                    <th>Joined Date</th>
                    <th class="hr-col-actions" style="width: 265px; text-align: center;">Actions</th>
                </tr>
            </thead>
            <tbody id="hrStaffTableBody">
                @forelse($staffMembers as $member)
                    @php
                        $fullName = trim($member->first_name.' '.$member->last_name);
                        $initials = strtoupper(substr($member->first_name, 0, 1).substr($member->last_name, 0, 1));
                        $statusLabel = $member->status?->staff_status ?? 'Unknown';
                        $statusClass = match (strtolower($statusLabel)) {
                            'active' => 'hr-tag-green',
                            'on leave' => 'hr-tag-orange',
                            'suspended', 'resigned' => 'hr-tag-red',
                            default => 'hr-tag-default',
                        };
                        $statusRowClass = match (strtolower($statusLabel)) {
                            'active' => 'hr-status-row-active',
                            'on leave' => 'hr-status-row-on-leave',
                            'suspended' => 'hr-status-row-suspended',
                            'resigned' => 'hr-status-row-resigned',
                            default => 'hr-status-row-inactive',
                        };
                    @endphp
                    <tr
                        class="hr-staff-clickable-row {{ $statusRowClass }}"
                        data-staff-id="{{ $member->id }}"
                        data-staff-search="{{ strtolower($fullName.' '.$member->nic.' '.$member->mobile) }}"
                        data-staff-status="{{ $statusLabel }}"
                    >
                        <td>
                            <div class="hr-person-cell js-hr-view-staff" data-staff-id="{{ $member->id }}" title="Click to view staff details">
                                <div class="hr-avatar">{{ $initials }}</div>
                                <div>
                                    <div class="hr-person-name hr-person-link">{{ $fullName }}</div>
                                    <div class="hr-person-sub">ID #STF-{{ str_pad((string) $member->id, 3, '0', STR_PAD_LEFT) }}</div>
                                </div>
                            </div>
                        </td>
                        <td><span class="hr-mono">{{ $member->nic }}</span></td>
                        <td>
                            <span class="hr-phone"><i class="fa-solid fa-phone"></i> {{ $member->mobile }}</span>
                        </td>
                        <td>
                            <span class="hr-tag {{ $statusClass }}"><span class="hr-dot"></span> {{ $statusLabel }}</span>
                        </td>
                        <td>{{ $member->add_at ? $member->add_at->format('Y-m-d') : '—' }}</td>
                        <td>
                            <div class="hr-row-actions">
                                <button
                                    type="button"
                                    class="ant-btn ant-btn-default ant-btn-sm js-hr-quick-salary"
                                    data-staff-id="{{ $member->id }}"
                                    title="Update Base Salary"
                                >
                                    <i class="fa-solid fa-money-check-dollar" style="color: #722ed1;"></i> Salary
                                </button>
                                <button
                                    type="button"
                                    class="ant-btn ant-btn-default ant-btn-sm js-hr-quick-daily-pay"
                                    data-staff-id="{{ $member->id }}"
                                    title="Record Daily Salary Payment"
                                >
                                    <i class="fa-solid fa-hand-holding-dollar" style="color: #10b981;"></i> Pay
                                </button>
                                <button
                                    type="button"
                                    class="ant-btn ant-btn-default ant-btn-sm js-hr-change-status"
                                    data-staff-id="{{ $member->id }}"
                                    data-staff-name="{{ $fullName }}"
                                    data-staff-nic="{{ $member->nic }}"
                                    data-status-id="{{ $member->staff_statuses_id }}"
                                    data-status-label="{{ $statusLabel }}"
                                    title="Change Employment Status"
                                >
                                    <i class="fa-solid fa-arrows-rotate" style="color: #1677ff;"></i> Status
                                </button>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="hr-empty-cell">
                            <i class="fa-solid fa-people-group"></i>
                            <div>No staff members found. Click <strong>Add Staff</strong> to register an employee.</div>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="hr-pagination-bar" id="hrStaffPagination" style="display: none;">
        <span class="hr-pagination-info" id="hrStaffPageInfo"></span>
        <div class="hr-pagination-controls" id="hrStaffPageControls"></div>
    </div>
</div>
