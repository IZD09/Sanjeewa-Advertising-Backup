<!-- TAB 3: DAILY SALARY PAYMENTS -->
<div class="hr-tab-pane" id="paneHrDailySalaries">
    <div class="hr-toolbar">
        <div class="hr-search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="searchHrDailySalaries" placeholder="Search daily payments by staff name or NIC...">
        </div>
        <div class="hr-filters">
            <input type="date" class="ant-select" id="filterHrDailyDate" title="Filter by payment date">
            <button type="button" class="ant-btn ant-btn-default ant-btn-sm" id="btnClearHrDailyDate" title="Clear Date Filter">
                <i class="fa-solid fa-rotate-left"></i> Clear
            </button>
        </div>
    </div>

    <div class="hr-table-responsive">
        <table class="ant-table" id="hrDailySalariesTable">
            <thead>
                <tr>
                    <th>Payment Ref</th>
                    <th>Staff Member</th>
                    <th>NIC Number</th>
                    <th>Amount Paid</th>
                    <th>Paid Date & Time</th>
                </tr>
            </thead>
            <tbody id="hrDailySalariesTableBody">
                @php
                    $dailyDateColorMap = [];
                    $dailyDateGroupIndex = 0;
                @endphp
                @forelse($dailySalaries as $daily)
                    @php
                        $staff = $daily->staff;
                        $fullName = $staff ? trim($staff->first_name.' '.$staff->last_name) : 'Unknown Staff';
                        $initials = $staff ? strtoupper(substr($staff->first_name, 0, 1).substr($staff->last_name, 0, 1)) : 'ST';
                        $payDateIso = $daily->pay_at ? $daily->pay_at->format('Y-m-d') : '';
                        if ($payDateIso !== '' && ! array_key_exists($payDateIso, $dailyDateColorMap)) {
                            $dailyDateColorMap[$payDateIso] = $dailyDateGroupIndex % 6;
                            $dailyDateGroupIndex++;
                        }
                        $dateGroupClass = $payDateIso !== '' ? 'hr-daily-date-'.$dailyDateColorMap[$payDateIso] : '';
                    @endphp
                    <tr
                        class="{{ $dateGroupClass }}"
                        data-daily-search="{{ strtolower($fullName.' '.($staff?->nic ?? '')) }}"
                        data-daily-date="{{ $payDateIso }}"
                    >
                        <td><span class="hr-mono">#DS-{{ str_pad((string) $daily->id, 4, '0', STR_PAD_LEFT) }}</span></td>
                        <td>
                            <div class="hr-person-cell">
                                <div class="hr-avatar green">{{ $initials }}</div>
                                <div>
                                    <div class="hr-person-name">{{ $fullName }}</div>
                                    <div class="hr-person-sub">{{ $staff?->mobile ?? '—' }}</div>
                                </div>
                            </div>
                        </td>
                        <td><span class="hr-mono">{{ $staff?->nic ?? '—' }}</span></td>
                        <td><strong class="hr-amount green">Rs. {{ number_format((float) $daily->amount, 2) }}</strong></td>
                        <td>{{ $daily->pay_at ? $daily->pay_at->format('Y-m-d H:i') : '—' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="hr-empty-cell">
                            <i class="fa-solid fa-calendar-day"></i>
                            <div>No daily salary payments recorded yet.</div>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="hr-pagination-bar" id="hrDailySalariesPagination" style="display: none;">
        <span class="hr-pagination-info" id="hrDailySalariesPageInfo"></span>
        <div class="hr-pagination-controls" id="hrDailySalariesPageControls"></div>
    </div>
</div>
