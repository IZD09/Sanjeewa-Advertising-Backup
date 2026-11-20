<!-- ==================================================================
     HR MODAL 3: PAY DAILY SALARY
     ================================================================== -->
@php
    $dailySalaryStaffOptions = collect($staffMembers ?? [])->map(function ($member): array {
        $latestSalary = $member->relationLoaded('salaries') ? $member->salaries->first() : null;
        $dailyPayments = $member->relationLoaded('dailySalaries')
            ? $member->dailySalaries->map(fn ($payment): array => [
                'amount' => (float) $payment->amount,
                'month' => $payment->pay_at?->format('Y-m') ?? '',
            ])->values()->all()
            : [];

        return [
            'id' => (int) $member->id,
            'full_name' => trim($member->first_name.' '.$member->last_name),
            'nic' => (string) $member->nic,
            'mobile' => (string) $member->mobile,
            'status' => (string) ($member->status?->staff_status ?? 'Active'),
            'latest_salary' => $latestSalary ? (float) $latestSalary->amount : null,
            'daily_payments' => $dailyPayments,
        ];
    })->values();
@endphp
<div class="hr-modal-overlay" id="modalPayDailySalary">
    <div class="hr-modal-card hr-modal-card-wide">
        <div class="hr-modal-header">
            <h3><i class="fa-solid fa-hand-holding-dollar" style="color: #10b981;"></i> Record Daily Salary Payment</h3>
            <button type="button" class="hr-modal-close hr-modal-close-trigger" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <form id="formPayDailySalary">
            <div class="hr-modal-body">
                <div class="hr-form-error" id="payDailySalaryError" style="display: none;"></div>
                <div class="hr-form-grid">
                    <div class="hr-form-group full">
                        <label for="hrDailySalaryStaffSearch">Select Staff Member <span class="req">*</span></label>
                        <div
                            class="hr-staff-combobox emerald"
                            id="dailySalaryStaffCombobox"
                            data-staff-list='@json($dailySalaryStaffOptions)'
                        >
                            <i class="fa-solid fa-magnifying-glass hr-combobox-icon"></i>
                            <input
                                type="text"
                                id="hrDailySalaryStaffSearch"
                                placeholder="Search staff by name, NIC, mobile, or ID..."
                                autocomplete="off"
                                role="combobox"
                                aria-expanded="false"
                                aria-autocomplete="list"
                                aria-controls="hrDailySalaryStaffResults"
                            >
                            <button
                                type="button"
                                class="hr-combobox-clear"
                                id="btnDailySalaryStaffClear"
                                title="Clear selection"
                                style="display: none;"
                            >
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                            <button
                                type="button"
                                class="hr-combobox-toggle"
                                id="btnDailySalaryStaffToggle"
                                title="Show staff members"
                                tabindex="-1"
                            >
                                <i class="fa-solid fa-chevron-down"></i>
                            </button>
                            <div
                                class="hr-combobox-results"
                                id="hrDailySalaryStaffResults"
                                role="listbox"
                                style="display: none;"
                            ></div>
                        </div>
                        <input type="hidden" id="hrDailySalaryStaffId" name="staff_id" value="">
                        <div class="hr-combobox-selected-hint" id="hrDailySelectedSummary" style="display: none;"></div>
                    </div>
                    <div class="hr-form-group full">
                        <span class="hr-quick-amounts-label"><i class="fa-solid fa-bolt"></i> Quick Amount</span>
                        <div class="hr-quick-amounts-wrap" id="hrDailyQuickAmounts">
                            @foreach([1000, 1500, 2000, 2500, 3000, 5000] as $presetAmount)
                                <button
                                    type="button"
                                    class="hr-quick-amount-btn js-hr-quick-amount"
                                    data-quick-amount="{{ $presetAmount }}"
                                >
                                    Rs. {{ number_format($presetAmount) }}
                                </button>
                            @endforeach
                        </div>
                    </div>
                    <div class="hr-form-group">
                        <label for="hrDailySalaryAmount">Amount (Rs.) <span class="req">*</span></label>
                        <input type="number" id="hrDailySalaryAmount" name="amount" placeholder="e.g. 2500.00" min="0" step="0.01" required>
                    </div>
                    <div class="hr-form-group">
                        <label for="hrDailySalaryPayAt">Payment Date & Time <span class="req">*</span></label>
                        <input type="datetime-local" id="hrDailySalaryPayAt" name="pay_at" value="{{ now()->format('Y-m-d\TH:i') }}" required>
                    </div>
                </div>
            </div>
            <div class="hr-modal-footer">
                <button type="button" class="ant-btn ant-btn-default hr-modal-close-trigger">Cancel</button>
                <button type="submit" class="ant-btn ant-btn-success">
                    <i class="fa-solid fa-check"></i> Record Payment
                </button>
            </div>
        </form>
    </div>
</div>
