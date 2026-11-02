<!-- ==========================================================================
     VIEW ORDER MODAL (100% Read-Only) (#viewOrderModal)
     ========================================================================== -->
<div class="po-modal-overlay" id="viewOrderModal">
  <div class="po-modal po-modal-large">
    <div class="po-modal-header">
      <h3 id="viewModalTitle"><i class="fa-solid fa-eye"></i> Order Details</h3>
      <button type="button" class="modal-close-btn" data-close-modal="viewOrderModal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="po-modal-body">
      <div class="info-summary-grid">
        <div class="info-item"><span class="info-label">Order ID</span><span class="info-value" id="voId" style="color: var(--po-orange);">-</span></div>
        <div class="info-item"><span class="info-label">Order Date</span><span class="info-value" id="voDate">-</span></div>
        <div class="info-item"><span class="info-label">Customer Name</span><span class="info-value" id="voCustName">-</span></div>
        <div class="info-item"><span class="info-label">Customer Mobile</span><span class="info-value" id="voCustMobile">-</span></div>
        <div class="info-item"><span class="info-label">Printing Type / Product</span><span class="info-value" id="voProduct">-</span></div>
        <div class="info-item"><span class="info-label">Dimensions & Unit</span><span class="info-value" id="voDimensions">-</span></div>
        <div class="info-item"><span class="info-label">Quantity</span><span class="info-value" id="voQuantity">-</span></div>
        <div class="info-item"><span class="info-label">Unit Price</span><span class="info-value" id="voUnitPrice">-</span></div>
        <div class="info-item"><span class="info-label">Total Amount</span><span class="info-value" id="voTotal">-</span></div>
        <div class="info-item"><span class="info-label">Paid Amount</span><span class="info-value" id="voPaid" style="color: var(--green);">-</span></div>
        <div class="info-item"><span class="info-label">Balance Amount</span><span class="info-value" id="voBalance" style="color: var(--po-orange);">-</span></div>
        <div class="info-item"><span class="info-label">Payment Status</span><span class="info-value" id="voPaymentStatus">-</span></div>
        <div class="info-item"><span class="info-label">Required Date / Deadline</span><span class="info-value" id="voDeadline">-</span></div>
        <div class="info-item"><span class="info-label">Order Status</span><span class="info-value" id="voOrderStatus">-</span></div>
        <div class="info-item"><span class="info-label">Assigned Employee</span><span class="info-value" id="voAssigned">-</span></div>
      </div>
    </div>
    <div class="po-modal-footer">
      <button type="button" class="po-btn po-btn-secondary" data-close-modal="viewOrderModal">Close</button>
    </div>
  </div>
</div>

