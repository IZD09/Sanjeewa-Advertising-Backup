<!-- ==================================================================
     HR MODAL 5: CHANGE STAFF EMPLOYMENT STATUS
     ================================================================== -->
<div class="hr-modal-overlay" id="modalChangeStaffStatus">
    <div class="hr-modal-card">
        <div class="hr-modal-header">
            <h3><i class="fa-solid fa-arrows-rotate" style="color: #1677ff;"></i> Change Staff Status</h3>
            <button type="button" class="hr-modal-close hr-modal-close-trigger" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <form id="formChangeStaffStatus">
            <div class="hr-modal-body">
                <div class="hr-form-error" id="changeStaffStatusError" style="display: none;"></div>
                <input type="hidden" id="changeStatusStaffId" name="staff_id" value="">

                <!-- Target Staff Summary -->
                <div class="hr-status-modal-staff-box">
                    <div class="hr-avatar" id="changeStatusStaffAvatar">ST</div>
                    <div class="hr-status-modal-staff-info">
                        <div class="hr-selected-staff-name" id="changeStatusStaffName">—</div>
                        <div class="hr-selected-staff-id" id="changeStatusStaffMeta">—</div>
                    </div>
                    <span class="hr-tag hr-tag-default" id="changeStatusCurrentBadge">
                        <span class="hr-dot"></span> —
                    </span>
                </div>

                <!-- Employment Status Options -->
                <div class="hr-form-group" style="margin-top: 14px;">
                    <label>Select New Employment Status <span class="req">*</span></label>
                    <div class="hr-status-options-list" id="changeStatusOptionsList">
                        @foreach($staffStatuses ?? [] as $status)
                            @php
                                $optClass = match (strtolower($status->staff_status)) {
                                    'active' => 'opt-active',
                                    'on leave' => 'opt-on-leave',
                                    'suspended' => 'opt-suspended',
                                    'resigned' => 'opt-resigned',
                                    default => 'opt-inactive',
                                };
                            @endphp
                            <label class="hr-status-option-item {{ $optClass }}">
                                <input
                                    type="radio"
                                    name="staff_statuses_id"
                                    value="{{ $status->id }}"
                                    data-status-label="{{ $status->staff_status }}"
                                >
                                <span class="hr-status-option-dot"></span>
                                <span class="hr-status-option-text">{{ $status->staff_status }}</span>
                                <i class="fa-solid fa-circle-check hr-status-option-check"></i>
                            </label>
                        @endforeach
                    </div>
                </div>
            </div>
            <div class="hr-modal-footer">
                <button type="button" class="ant-btn ant-btn-default hr-modal-close-trigger">Cancel</button>
                <button type="submit" class="ant-btn ant-btn-primary">
                    <i class="fa-solid fa-check"></i> Update Status
                </button>
            </div>
        </form>
    </div>
</div>
