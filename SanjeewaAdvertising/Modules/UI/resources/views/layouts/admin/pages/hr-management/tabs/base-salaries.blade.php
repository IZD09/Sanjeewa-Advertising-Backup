<!-- TAB 2: BASE SALARIES -->
<div class="hr-tab-pane" id="paneHrSalaries">
    <div class="hr-toolbar">
        <div class="hr-search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="searchHrSalaries" placeholder="Search salary records by staff name or NIC...">
        </div>
        <div class="hr-filters">
            <button type="button" class="ant-btn ant-btn-secondary ant-btn-sm" id="btnToolbarSetSalary">
                <i class="fa-solid fa-plus"></i> Record Salary Update
            </button>
        </div>
    </div>

    <div class="hr-table-responsive">
        <table class="ant-table" id="hrSalariesTable">
            <thead>
                <tr>
                    <th>Record ID</th>
                    <th>Staff Member</th>
                    <th>NIC Number</th>
                    <th>Salary Amount</th>
                    <th>Last Updated</th>
                    <th>Employment Status</th>
                </tr>
            </thead>
            <tbody id="hrSalariesTableBody">
                @forelse($salaries as $salary)
                    @php
                        $staff = $salary->staff;
                        $fullName = $staff ? trim($staff->first_name.' '.$staff->last_name) : 'Unknown Staff';
                        $initials = $staff ? strtoupper(substr($staff->first_name, 0, 1).substr($staff->last_name, 0, 1)) : 'ST';
                        $statusLabel = $staff?->status?->staff_status ?? 'Unknown';
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
                    <tr class="{{ $statusRowClass }}" data-salary-search="{{ strtolower($fullName.' '.($staff?->nic ?? '')) }}">
                        <td><span class="hr-mono">#SAL-{{ str_pad((string) $salary->id, 4, '0', STR_PAD_LEFT) }}</span></td>
                        <td>
                            <div class="hr-person-cell">
                                <div class="hr-avatar purple">{{ $initials }}</div>
                                <div>
                                    <div class="hr-person-name">{{ $fullName }}</div>
                                    <div class="hr-person-sub">{{ $staff?->mobile ?? '—' }}</div>
                                </div>
                            </div>
                        </td>
                        <td><span class="hr-mono">{{ $staff?->nic ?? '—' }}</span></td>
                        <td><strong class="hr-amount purple">Rs. {{ number_format((float) $salary->amount, 2) }}</strong></td>
                        <td>{{ $salary->update_at ? $salary->update_at->format('Y-m-d H:i') : '—' }}</td>
                        <td><span class="hr-tag {{ $statusClass }}"><span class="hr-dot"></span> {{ $statusLabel }}</span></td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="hr-empty-cell">
                            <i class="fa-solid fa-money-check-dollar"></i>
                            <div>No base salary records available yet.</div>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="hr-pagination-bar" id="hrSalariesPagination" style="display: none;">
        <span class="hr-pagination-info" id="hrSalariesPageInfo"></span>
        <div class="hr-pagination-controls" id="hrSalariesPageControls"></div>
    </div>
</div>
