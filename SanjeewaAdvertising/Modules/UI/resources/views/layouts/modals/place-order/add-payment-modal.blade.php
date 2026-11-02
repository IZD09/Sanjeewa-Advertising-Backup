<!-- ==========================================================================
     ADD PAYMENT INSTALLMENT MODAL (#addPaymentModal)
     ========================================================================== -->
<div class="po-modal-overlay" id="addPaymentModal">
  <div class="po-modal">
    <div class="po-modal-header">
      <h3><i class="fa-solid fa-credit-card"></i> Add Payment Installment</h3>
      <button type="button" class="modal-close-btn" data-close-modal="addPaymentModal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="po-modal-body">
      <div class="area-calc-pill" style="margin-bottom: 4px;">
        <span>Outstanding Remaining Balance:</span>
        <span class="area-val" id="pmRemainingBalance" style="color: var(--red); font-size: 13px;">Rs. 0.00</span>
      </div>

      <div class="po-field-row">
        <div class="po-field"><label class="po-label" for="pmPaymentId">Payment ID</label><input type="text" id="pmPaymentId" class="po-input" readonly></div>
        <div class="po-field"><label class="po-label" for="pmOrderId">Order ID</label><input type="text" id="pmOrderId" class="po-input" readonly></div>
      </div>

      <div class="po-field-row">
        <div class="po-field"><label class="po-label" for="pmInstallmentNo">Installment Number</label><input type="text" id="pmInstallmentNo" class="po-input" readonly></div>
        <div class="po-field"><label class="po-label" for="pmDate">Payment Date</label><input type="date" id="pmDate" class="po-input" required></div>
      </div>

      <div class="po-field-row">
        <div class="po-field">
          <label class="po-label" for="pmAmount"><span>Payment Amount (Rs.) <span class="req">*</span></span></label>
          <input type="number" id="pmAmount" class="po-input" min="1" step="10" required>
        </div>
        <div class="po-field">
          <label class="po-label" for="pmMethod"><span>Payment Method <span class="req">*</span></span></label>
          <select id="pmMethod" class="po-select">
            <option value="Cash" selected>Cash</option>
            <option value="Card">Credit / Debit Card</option>
            <option value="Bank Transfer">Bank Transfer / Deposit</option>
            <option value="Online / QR">Online / LankaQR</option>
            <option value="Cheque">Cheque</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div class="po-field-row">
        <div class="po-field"><label class="po-label" for="pmRef">Transaction Reference (Optional)</label><input type="text" id="pmRef" class="po-input" placeholder="Slip / TXN / Cheque No"></div>
        <div class="po-field"><label class="po-label" for="pmReceivedBy">Received By</label><input type="text" id="pmReceivedBy" class="po-input" readonly></div>
      </div>

      <div class="po-field">
        <label class="po-label" for="pmNote">Payment Note (Optional)</label>
        <input type="text" id="pmNote" class="po-input" placeholder="E.g. Final balance settlement, partial advance">
      </div>
    </div>
    <div class="po-modal-footer">
      <button type="button" class="po-btn po-btn-secondary" data-close-modal="addPaymentModal">Cancel</button>
      <button type="button" class="po-btn po-btn-primary" id="submitAddPaymentBtn"><i class="fa-solid fa-check"></i> Record Payment & Generate Receipt</button>
    </div>
  </div>
</div>

