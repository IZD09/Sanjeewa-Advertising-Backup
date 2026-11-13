<div class="pay-modal-backdrop" id="modalMarkExpensePaid">
  <div class="pay-modal-card" style="max-width: 520px;">
    <div class="pay-modal-header">
      <h3><i class="fa-solid fa-circle-check" style="color: #10b981;"></i> Record Bill Payment</h3>
      <button type="button" class="pay-modal-close" data-close-pay-modal aria-label="Close modal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="pay-modal-body">
      <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 9px; padding: 12px 16px; margin-bottom: 6px;">
        <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Bill Details</div>
        <div id="markExpTitleDisplay" style="font-size: 14px; font-weight: 800; color: var(--text); margin-top: 2px;">-</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 12px;">
          <span id="markExpAccountDisplay" style="color: var(--text-muted); font-family: ui-monospace;">A/C: -</span>
          <span>Amount Due: <strong id="markExpAmountDisplay" style="color: #ef4444; font-size: 14px;">Rs. 0.00</strong></span>
        </div>
      </div>

      <input type="hidden" id="markExpBillId">

      <div class="pay-form-grid">
        <div class="pay-field">
          <label class="pay-label" for="markExpPaidDate">Payment Date *</label>
          <input type="date" id="markExpPaidDate" name="mark_exp_paid_date" class="pay-input" required>
        </div>
        <div class="pay-field">
          <label class="pay-label" for="markExpPaidAmount">Paid Amount (Rs.) *</label>
          <input type="number" id="markExpPaidAmount" name="mark_exp_paid_amount" class="pay-input" min="1" step="50" required>
        </div>
      </div>

      <div class="pay-field">
        <label class="pay-label" for="markExpPaidMethod">Payment Method *</label>
        <select id="markExpPaidMethod" name="mark_exp_paid_method" class="pay-select-field">
          <option value="Bank Transfer" selected>🏦 Bank Transfer / Online Banking</option>
          <option value="Cash">💵 Cash</option>
          <option value="Online / QR">📱 Online / LankaQR</option>
          <option value="Card">💳 Credit / Debit Card</option>
          <option value="Check">🧾 Cheque</option>
        </select>
      </div>

      <div class="pay-field">
        <label class="pay-label" for="markExpPaidRef">Transaction Reference #</label>
        <input type="text" id="markExpPaidRef" name="mark_exp_paid_ref" class="pay-input" placeholder="E.g. BOC-TXN-99812 / SLT-SLIP-4521">
      </div>

      <div class="pay-field">
        <label class="pay-label" for="markExpPaidNote">Settlement Note</label>
        <input type="text" id="markExpPaidNote" name="mark_exp_paid_note" class="pay-input" placeholder="E.g. Paid online via Commercial Bank app">
      </div>
    </div>
    <div class="pay-modal-footer">
      <button type="button" class="po-btn po-btn-secondary" data-close-pay-modal>Cancel</button>
      <button type="button" class="po-btn po-btn-primary" id="btnConfirmMarkExpensePaid" style="background: linear-gradient(135deg, #10b981, #059669); border-color: #059669;">
        <i class="fa-solid fa-check-double"></i> Confirm Paid Status
      </button>
    </div>
  </div>
</div>