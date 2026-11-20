<!-- ==================================================================
     GRN / PO ACTION CONFIRMATION MODAL (APPROVE / CANCEL / RESTORE)
     ================================================================== -->
<div class="po-modal-overlay" id="grnActionConfirmModal" aria-hidden="true">
  <div class="po-modal" style="max-width: 440px;" role="dialog" aria-modal="true" aria-labelledby="grnConfirmModalTitle">
    <div class="po-modal-header">
      <h3 id="grnConfirmModalTitle">
        <i id="grnConfirmTitleIcon" class="fa-solid fa-circle-check" style="color: #16a34a;"></i>
        <span id="grnConfirmTitleText">Confirm Action</span>
      </h3>
      <button type="button" class="modal-close-btn" id="grnConfirmCloseBtn" aria-label="Close">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="po-modal-body" style="gap: 12px;">
      <div id="grnConfirmBanner" style="display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border-radius: 10px; background: rgba(22, 163, 74, 0.08); border: 1px solid rgba(22, 163, 74, 0.22);">
        <i id="grnConfirmBannerIcon" class="fa-solid fa-circle-check" style="color: #16a34a; font-size: 20px; margin-top: 2px;"></i>
        <div>
          <div style="font-size: 13.5px; font-weight: 700; color: var(--text, #0f172a);">
            <span id="grnConfirmQuestionPrefix">Are you sure you want to proceed with</span>
            <span id="grnConfirmTargetLabel" style="color: #16a34a;">this record</span>?
          </div>
          <div id="grnConfirmSubtext" style="font-size: 12px; color: var(--text-muted, #64748b); margin-top: 4px;">
            This will update the status immediately.
          </div>
        </div>
      </div>
    </div>

    <div class="po-modal-footer">
      <button type="button" class="ant-btn ant-btn-default" id="grnConfirmCancelBtn">
        Close
      </button>
      <button type="button" class="ant-btn ant-btn-primary" id="grnConfirmSubmitBtn">
        <i class="fa-solid fa-check"></i> Confirm
      </button>
    </div>
  </div>
</div>
