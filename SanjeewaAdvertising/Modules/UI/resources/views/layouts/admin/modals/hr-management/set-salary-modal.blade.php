<!-- ==================================================================
     HR MODAL 2: SET / UPDATE BASE SALARY
     ================================================================== -->
@php
    $salaryStaffOptions = collect($staffMembers ?? [])->map(function ($member): array {
        $latestSalary = $member->relationLoaded('salaries') ? $member->salaries->first() : null;

        return [
            'id' => (int) $member->id,
            'full_name' => trim($member->first_name.' '.$member->last_name),
            'nic' => (string) $member->nic,
            'mobile' => (string) $member->mobile,
            'status' => (string) ($member->status?->staff_status ?? 'Active'),
            'latest_salary' => $latestSalary ? (float) $latestSalary->amount : null,
        ];
    })->values();
@endphp
<div class="hr-modal-overlay" id="modalSetSalary">
    <div class="hr-modal-card">
        <div class="hr-modal-header">
            <h3><i class="fa-solid fa-money-check-dollar" style="color: #722ed1;"></i> Set Base Salary</h3>
            <button type="button" class="hr-modal-close hr-modal-close-trigger" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <form id="formSetSalary">
            <div class="hr-modal-body">
                <div class="hr-form-error" id="setSalaryError" style="display: none;"></div>
                <div class="hr-form-grid hr-form-grid-single">
                    <div class="hr-form-group full">
                        <label for="hrSalaryStaffSearch">Select Staff Member <span class="req">*</span></label>
                        <div
                            class="hr-staff-combobox"
                            id="salaryStaffCombobox"
                            data-staff-list='@json($salaryStaffOptions)'
                        >
                            <i class="fa-solid fa-magnifying-glass hr-combobox-icon"></i>
                            <input
                                type="text"
                                id="hrSalaryStaffSearch"
                                placeholder="Search staff by name, NIC, mobile, or ID..."
                                autocomplete="off"
                                role="combobox"
                                aria-expanded="false"
                                aria-autocomplete="list"
                                aria-controls="hrSalaryStaffResults"
                            >
                            <button
                                type="button"
                                class="hr-combobox-clear"
                                id="btnSalaryStaffClear"
                                title="Clear selection"
                                style="display: none;"
                            >
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                            <button
                                type="button"
                                class="hr-combobox-toggle"
                                id="btnSalaryStaffToggle"
                                title="Show staff members"
                                tabindex="-1"
                            >
                                <i class="fa-solid fa-chevron-down"></i>
                            </button>
                            <div
                                class="hr-combobox-results"
                                id="hrSalaryStaffResults"
                                role="listbox"
                                style="display: none;"
                            ></div>
                        </div>
                        <input type="hidden" id="hrSalaryStaffId" name="staff_id" value="">
                        <div class="hr-combobox-selected-hint" id="hrSalarySelectedHint" style="display: none;"></div>
                    </div>
                    <div class="hr-form-group full">
                        <label for="hrSalaryAmount">Monthly Base Salary (Rs.) <span class="req">*</span></label>
                        <input type="number" id="hrSalaryAmount" name="amount" placeholder="e.g. 55000.00" min="0" step="0.01" required>
                    </div>
                </div>
            </div>
            <div class="hr-modal-footer">
                <button type="button" class="ant-btn ant-btn-default hr-modal-close-trigger">Cancel</button>
                <button type="submit" class="ant-btn ant-btn-secondary">
                    <i class="fa-solid fa-check"></i> Update Salary
                </button>
            </div>
        </form>
    </div>
</div>
