<div class="pay-modal-backdrop" id="modalMarkExpensePaid">
  <div class="pay-modal-card" style="max-width: 620px;">
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
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 6px; font-size: 12px;">
          <span id="markExpAccountDisplay" style="color: var(--text-muted); font-family: ui-monospace; min-width: 0; flex: 1;">A/C: -</span>
          <span style="white-space: nowrap; flex-shrink: 0;">Amount Due: <strong id="markExpAmountDisplay" style="color: #ef4444; font-size: 14px;">Rs. 0.00</strong></span>
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
        <label class="pay-label" for="markExpPaidRef">Transaction Reference #</label>
        <input type="text" id="markExpPaidRef" name="mark_exp_paid_ref" maxlength="50" class="pay-input" placeholder="E.g. BOC-TXN-99812 / SLT-SLIP-4521">
      </div>

      <div class="pay-field">
        <label class="pay-label" for="markExpPaidNote">Settlement Note</label>
        <input type="text" id="markExpPaidNote" name="mark_exp_paid_note" maxlength="255" class="pay-input" placeholder="E.g. Paid online via Commercial Bank app">
      </div>

      <div id="markExpErrorBanner" style="display: none; padding: 9px 12px; border-radius: 8px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #dc2626; font-size: 12px; font-weight: 600;"></div>
    </div>
    <div class="pay-modal-footer">
      <button type="button" class="po-btn po-btn-secondary" data-close-pay-modal>Cancel</button>
      <button type="button" class="po-btn po-btn-primary" id="btnConfirmMarkExpensePaid" style="background: linear-gradient(135deg, #10b981, #059669); border-color: #059669;">
        <i class="fa-solid fa-check-double"></i> Confirm Paid Status
      </button>
    </div>
  </div>
</div>

<!-- ==========================================================================
     EXPENSE REVERT CONFIRMATION MODAL
     ========================================================================== -->
<div class="pay-modal-backdrop" id="expenseActionConfirmModal" aria-hidden="true">
  <div class="pay-modal-card" style="max-width: 440px;" role="dialog" aria-modal="true" aria-labelledby="expConfirmModalTitle">
    <div class="pay-modal-header">
      <h3 id="expConfirmModalTitle">
        <i class="fa-solid fa-rotate-left" style="color: #f59e0b;"></i>
        <span>Revert Bill to Pending</span>
      </h3>
      <button type="button" class="pay-modal-close" data-close-pay-modal aria-label="Close modal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="pay-modal-body" style="gap: 12px;">
      <input type="hidden" id="expConfirmBillId">
      <div style="display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border-radius: 10px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.28);">
        <i class="fa-solid fa-triangle-exclamation" style="color: #d97706; font-size: 20px; margin-top: 2px;"></i>
        <div>
          <div style="font-size: 13.5px; font-weight: 700; color: var(--text);">
            Are you sure you want to revert <span id="expConfirmBillTitle" style="color: #d97706;">this bill</span> back to Pending?
          </div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
            This will clear the payment settlement timestamp and mark the expense as Pending in the Transaction module.
          </div>
        </div>
      </div>
    </div>

    <div class="pay-modal-footer">
      <button type="button" class="po-btn po-btn-secondary" data-close-pay-modal>Cancel</button>
      <button type="button" class="po-btn po-btn-primary" id="btnConfirmExpenseRevert" style="background: linear-gradient(135deg, #f59e0b, #d97706); border-color: #d97706;">
        <i class="fa-solid fa-rotate-left"></i> Yes, Revert to Pending
      </button>
    </div>
  </div>
</div>