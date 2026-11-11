<div class="pay-modal-backdrop" id="recordPaymentModal">
  <div class="pay-modal-card">
    <div class="pay-modal-header">
      <h3><i class="fa-solid fa-file-invoice-dollar" style="color: var(--blue);"></i> Record Payment Transaction</h3>
      <button type="button" class="pay-modal-close" data-close-pay-modal aria-label="Close modal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="pay-modal-body">
      <div class="pay-field">
        <label class="pay-label">1. Payment Category / Channel *</label>
        <div class="pay-type-selector">
          <label class="pay-type-option invoice-option selected">
            <input type="radio" name="modalPayType" id="modalRadioInvoice" value="invoice" checked>
            <div class="pay-type-meta">
              <strong>1. Invoice Payment</strong>
              <span>Job / Customer Print Order Payment</span>
            </div>
          </label>
          <label class="pay-type-option grn-option">
            <input type="radio" name="modalPayType" id="modalRadioGrn" value="grn">
            <div class="pay-type-meta">
              <strong>2. GRN Payment</strong>
              <span>Stock Items / Supplier Procurement</span>
            </div>
          </label>
        </div>
      </div>

      <div class="pay-field">
        <label class="pay-label" id="modalPayRefLabel">Select Customer Job / Invoice *</label>
        <select id="modalPayRefSelect" class="pay-select-field">
        </select>
      </div>

      <div class="pay-modal-balance-box">
        <div class="bal-item">
          <span>Bill Total:</span>
          <strong id="modalBalTotal">Rs. 0</strong>
        </div>
        <div class="bal-item">
          <span>Previously Paid:</span>
          <strong id="modalBalPaid" style="color: #10b981;">Rs. 0</strong>
        </div>
        <div class="bal-item">
          <span>Current Balance:</span>
          <strong id="modalBalRemaining" style="color: #ef4444;">Rs. 0</strong>
        </div>
      </div>

      <div class="pay-form-grid">
        <div class="pay-field">
          <label class="pay-label">Payment Amount (Rs.) *</label>
          <input type="number" id="modalPayAmount" class="pay-input" placeholder="0.00" min="0" step="100" required>
        </div>
        <div class="pay-field">
          <label class="pay-label">Payment Stage *</label>
          <select id="modalPayStageSelect" class="pay-select-field">
            <option value="Complete Payment">Complete Payment</option>
            <option value="Advance Payment">Advance Payment</option>
            <option value="Pending Payment">Pending Payment</option>
          </select>
        </div>
      </div>

      <div class="pay-field">
        <label class="pay-label">Payment Method *</label>
        <div class="pay-method-selector">
          <div class="method-choice selected" data-method="Cash">
            <i class="fa-solid fa-money-bill-wave"></i>
            <span>Cash</span>
          </div>
          <div class="method-choice" data-method="Card">
            <i class="fa-solid fa-credit-card"></i>
            <span>Card</span>
          </div>
          <div class="method-choice" data-method="Check">
            <i class="fa-solid fa-money-check"></i>
            <span>Check</span>
          </div>
          <div class="method-choice" data-method="Bank Transfer">
            <i class="fa-solid fa-building-columns"></i>
            <span>Bank Transfer</span>
          </div>
        </div>
      </div>

      <div id="modalMethodSpecificFields">
      </div>

      <div class="pay-form-grid">
        <div class="pay-field">
          <label class="pay-label">Payment Date</label>
          <input type="date" id="modalPayDate" class="pay-input">
        </div>
        <div class="pay-field">
          <label class="pay-label">Authorized Officer</label>
          <input type="text" class="pay-input" value="Admin User" readonly style="opacity: 0.8;">
        </div>
      </div>

      <div class="pay-field">
        <label class="pay-label">Narration / Internal Remarks</label>
        <input type="text" id="modalPayNotes" class="pay-input" placeholder="E.g. Paid in full upon pickup / advance for vinyl rolls">
      </div>
    </div>

    <div class="pay-modal-footer">
      <button type="button" class="po-btn po-btn-secondary" data-close-pay-modal>Cancel</button>
      <button type="button" class="po-btn po-btn-primary" id="btnSaveNewPayment">
        <i class="fa-solid fa-check"></i> Save &amp; Generate Voucher
      </button>
    </div>
  </div>
</div>