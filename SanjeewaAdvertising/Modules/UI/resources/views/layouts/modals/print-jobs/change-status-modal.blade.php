<!-- ==================================================================
     MODAL 2: CHANGE PRODUCTION STATUS MODAL
     ================================================================== -->
<div class="pj-modal-overlay" id="modalChangeStatus">
    <div class="pj-modal" style="max-width: 480px;">
        <div class="pj-modal-header">
            <h3><i class="fa-solid fa-arrow-right" style="color: #1677ff;"></i> Update Production Status</h3>
            <button type="button" class="pj-modal-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="pj-modal-body">
            <div style="font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 8px;" id="statusJobHeader">
                —
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
                <span style="font-size: 12px; color: var(--text-muted);">Current Stage:</span>
                <span id="statusCurrentBadge" class="pj-badge pending">—</span>
            </div>

            <div class="pj-form-group">
                <label for="selectNewStatus">Select New Production Stage <span style="color: #ff4d4f;">*</span></label>
                <select class="pj-select" id="selectNewStatus" style="width: 100%;">
                    <option value="">-- Choose New Status --</option>
                    @foreach($statuses ?? [] as $st)
                        <option value="{{ $st['id'] }}">{{ $st['name'] }}</option>
                    @endforeach
                </select>
            </div>
        </div>
        <div class="pj-modal-footer">
            <button type="button" class="ant-btn ant-btn-default pj-modal-close">Cancel</button>
            <button type="button" class="ant-btn ant-btn-primary" id="btnSubmitStatusChange">
                <i class="fa-solid fa-check"></i> Update Status
            </button>
        </div>
    </div>
</div>
