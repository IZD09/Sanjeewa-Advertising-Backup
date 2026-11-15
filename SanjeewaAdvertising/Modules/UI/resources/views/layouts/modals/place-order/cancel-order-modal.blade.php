<!-- ==========================================================================
     MODAL: CANCEL ORDER CONFIRMATION
     ========================================================================== -->
<div class="po-modal-overlay" id="cancelOrderConfirmModal" aria-hidden="true">
  <div class="po-modal" style="max-width: 440px;" role="dialog" aria-modal="true" aria-labelledby="cancelOrderModalTitle">
    <div class="po-modal-header">
      <h3 id="cancelOrderModalTitle">
        <i class="fa-solid fa-triangle-exclamation" style="color: #dc2626;"></i>
        Cancel Order
      </h3>
      <button type="button" class="modal-close-btn" id="cancelOrderModalCloseBtn" aria-label="Close">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="po-modal-body" style="gap: 12px;">
      <div style="display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border-radius: 10px; background: rgba(220, 38, 38, 0.08); border: 1px solid rgba(220, 38, 38, 0.22);">
        <i class="fa-solid fa-circle-exclamation" style="color: #dc2626; font-size: 20px; margin-top: 2px;"></i>
        <div>
          <div style="font-size: 13.5px; font-weight: 700; color: var(--text, #0f172a);">
            Are you sure you want to cancel <span id="cancelOrderTargetLabel" style="color: #dc2626;">this order</span>?
          </div>
          <div style="font-size: 12px; color: var(--text-muted, #64748b); margin-top: 4px;">
            This will update the order status to <strong>Cancelled</strong>.
          </div>
        </div>
      </div>
    </div>

    <div class="po-modal-footer">
      <button type="button" class="po-btn po-btn-secondary" id="cancelOrderModalKeepBtn">
        Keep Order
      </button>
      <button type="button" class="po-btn po-btn-danger" id="cancelOrderModalConfirmBtn">
        <i class="fa-solid fa-xmark"></i> Yes, Cancel Order
      </button>
    </div>
  </div>
</div>
