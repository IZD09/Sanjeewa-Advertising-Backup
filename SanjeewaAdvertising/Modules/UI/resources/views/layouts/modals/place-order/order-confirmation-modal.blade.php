<!-- ==========================================================================
     ORDER CONFIRMATION MODAL (#orderConfirmationModal)
     ========================================================================== -->
<div class="po-modal-overlay" id="orderConfirmationModal">
  <div class="po-modal">
    <div class="po-modal-header">
      <h3><i class="fa-solid fa-clipboard-check"></i> Confirm Order Placement</h3>
      <button type="button" class="modal-close-btn" data-close-modal="orderConfirmationModal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="po-modal-body">
      <p style="margin: 0; font-size: 12.5px; color: var(--text-muted);">
        Please review the order details and billing breakdown before saving.
      </p>

      <div class="info-summary-grid">
        <div class="info-item"><span class="info-label">Customer Name</span><span class="info-value" id="confCustName">-</span></div>
        <div class="info-item"><span class="info-label">Mobile Number</span><span class="info-value" id="confCustMobile">-</span></div>
        <div class="info-item"><span class="info-label">Product / Job</span><span class="info-value" id="confProduct">-</span></div>
        <div class="info-item"><span class="info-label">Dimensions & Quantity</span><span class="info-value" id="confSpecs">-</span></div>
        <div class="info-item"><span class="info-label">Total Amount</span><span class="info-value" id="confTotal" style="color: var(--text);">-</span></div>
        <div class="info-item"><span class="info-label">Advance Deposit</span><span class="info-value" id="confPaid" style="color: var(--green);">-</span></div>
        <div class="info-item"><span class="info-label">Remaining Balance</span><span class="info-value" id="confBalance" style="color: var(--po-orange);">-</span></div>
        <div class="info-item"><span class="info-label">Payment Status</span><span class="info-value" id="confStatus">-</span></div>
        <div class="info-item"><span class="info-label">Required Deadline</span><span class="info-value" id="confDeadline">-</span></div>
      </div>
    </div>
    <div class="po-modal-footer">
      <button type="button" class="po-btn po-btn-secondary" data-close-modal="orderConfirmationModal">Cancel</button>
      <button type="button" class="po-btn po-btn-primary" id="confirmPlaceOrderBtn">
        <i class="fa-solid fa-check-double"></i> Confirm & Save Order
      </button>
    </div>
  </div>
</div>

