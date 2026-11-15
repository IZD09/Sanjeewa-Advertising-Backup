<!-- ==========================================================================
     ADD PAYMENT INSTALLMENT MODAL (#addPaymentModal)
     ========================================================================== -->
<div class="po-modal-overlay" id="addPaymentModal" aria-hidden="true" role="dialog" aria-labelledby="addPaymentModalTitle">
  <div class="po-modal" style="max-width: 600px;">
    <!-- Modal Header -->
    <div class="po-modal-header" style="align-items: center; padding: 16px 22px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, rgba(255, 107, 0, 0.15) 0%, rgba(255, 140, 0, 0.25) 100%); color: var(--po-orange, #ff6b00); display: grid; place-items: center; font-size: 18px; box-shadow: 0 4px 12px rgba(255, 107, 0, 0.15);">
          <i class="fa-solid fa-credit-card"></i>
        </div>
        <div>
          <h3 id="addPaymentModalTitle" style="margin: 0; font-size: 16px; font-weight: 800; color: var(--text);">Add Payment Installment</h3>
          <p style="margin: 2px 0 0; font-size: 11.5px; color: var(--text-muted);">Record customer installment payment &amp; update order balance</p>
        </div>
      </div>
      <button type="button" class="modal-close-btn" data-close-modal="addPaymentModal" aria-label="Close modal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- Modal Body -->
    <div class="po-modal-body" style="gap: 16px; padding: 20px 22px;">
      <!-- 1. Order & Customer Context Summary Card -->
      <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px;">Order</span>
            <span id="pmDisplayOrderId" style="font-size: 12.5px; font-weight: 800; color: var(--po-orange); background: rgba(255, 107, 0, 0.1); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(255, 107, 0, 0.2);">ORD-2026-0000</span>
            <span id="pmDisplayOrderDate" style="font-size: 11px; color: var(--text-muted);">-</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-user" style="font-size: 11px; color: var(--text-muted);"></i>
            <span id="pmDisplayCustomer" style="font-size: 12px; font-weight: 700; color: var(--text);">-</span>
            <span id="pmCustomer" style="display: none;">-</span>
          </div>
        </div>

        <div style="font-size: 11.5px; color: var(--text-muted); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-print" style="color: var(--blue, #2563eb);"></i>
            <span id="pmDisplayProduct" style="font-weight: 600; color: var(--text);">-</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span id="pmDisplayInvoice" style="font-size: 11px; font-weight: 700; color: #1677ff; background: rgba(22, 119, 255, 0.08); padding: 2px 8px; border-radius: 5px; border: 1px solid rgba(22, 119, 255, 0.2);">
              <i class="fa-solid fa-file-invoice"></i> <span id="pmInvoiceBadge">Invoice: Auto-Create</span>
            </span>
          </div>
        </div>

        <!-- 3-Column Financial Metrics Highlight (Total, Paid, Balance) -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 2px;">
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; text-align: center;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 2px;">Order Total</span>
            <strong id="pmTotalAmount" style="font-size: 13.5px; color: var(--text); font-weight: 800;">Rs. 0.00</strong>
            <span id="pmTotal" style="display: none;">Rs. 0.00</span>
          </div>
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; text-align: center;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 2px;">Total Paid</span>
            <strong id="pmPaidAmount" style="font-size: 13.5px; color: #10b981; font-weight: 800;">Rs. 0.00</strong>
            <span id="pmPaid" style="display: none;">Rs. 0.00</span>
          </div>
          <div style="background: rgba(239, 68, 68, 0.04); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 8px 12px; text-align: center;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #ef4444; display: block; margin-bottom: 2px;">Remaining Balance</span>
            <strong id="pmRemainingBalance" style="font-size: 13.5px; color: #ef4444; font-weight: 800;">Rs. 0.00</strong>
            <span id="pmBalance" style="display: none;">Rs. 0.00</span>
          </div>
        </div>

        <!-- New Invoice per Payment Notice -->
        <div style="background: rgba(22, 119, 255, 0.04); border: 1px dashed rgba(22, 119, 255, 0.25); border-radius: 6px; padding: 7px 12px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--text-muted); gap: 6px;">
          <span><i class="fa-solid fa-circle-info" style="color: #1677ff; margin-right: 5px;"></i> Each installment payment creates a separate new invoice in the system.</span>
          <span id="pmInvoicesCount" style="font-weight: 700; color: #1677ff; white-space: nowrap;"></span>
        </div>
      </div>

      <!-- 2. Payment Amount with Quick Shortcuts & Live Calculated Balance -->
      <div class="po-field" style="background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
          <label class="po-label" for="pmAmount" style="margin: 0; font-size: 12px; font-weight: 800;">
            <i class="fa-solid fa-money-bill-wave" style="color: #10b981; margin-right: 4px;"></i>
            Payment Amount (Rs.) <span class="req">*</span>
          </label>
          <div style="display: flex; gap: 6px;">
            <button type="button" id="btnPayHalf" class="po-btn po-btn-secondary" style="height: 26px; padding: 0 10px; font-size: 11px; border-radius: 6px;">
              Pay 50%
            </button>
            <button type="button" id="btnPayFull" class="po-btn po-btn-secondary" style="height: 26px; padding: 0 10px; font-size: 11px; border-radius: 6px; color: var(--po-orange); border-color: var(--po-orange);">
              Pay Full Balance
            </button>
          </div>
        </div>

        <div style="position: relative;">
          <input type="number" id="pmAmount" name="payment" class="po-input" min="0.01" step="0.01" placeholder="0.00" required style="font-size: 16px; font-weight: 800; height: 42px; padding-left: 14px;">
        </div>
        <div id="pmAmountErrorMsg" style="display: none; color: #ef4444; font-size: 11.5px; font-weight: 700; margin-top: 5px; display: flex; align-items: center; gap: 5px;"></div>

        <!-- Live Real-Time Balance Preview Box -->
        <div id="pmLiveCalcNotice" style="margin-top: 8px; font-size: 12px; display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 6px; background: var(--surface-2); border: 1px solid var(--border-light);">
          <span style="color: var(--text-muted); font-size: 11px;">
            <i class="fa-solid fa-calculator" style="margin-right: 4px; color: var(--blue, #2563eb);"></i> New Balance after this payment:
          </span>
          <strong id="pmNewBalancePreview" style="font-weight: 800; color: var(--text);">Rs. 0.00</strong>
        </div>
      </div>

      <!-- 3. Payment Method & Automatic Payment Status -->
      <div class="po-field-row">
        <!-- Clean Payment Method -->
        <div class="po-field">
          <label class="po-label" for="pmPaymentTypeId">
            <span>Payment Method <span class="req">*</span></span>
          </label>
          <select id="pmPaymentTypeId" name="payment_types_id" class="po-select" style="font-weight: 600;">
            <option value="1" data-code="Cash" selected>💵 Cash</option>
            <option value="2" data-code="Bank Transfer">🏦 Bank Transfer / Deposit</option>
            <option value="3" data-code="Credit Card">💳 Credit Card</option>
            <option value="4" data-code="Debit Card">💳 Debit Card</option>
            <option value="5" data-code="Cheque">📜 Cheque</option>
            <option value="6" data-code="Online / QR Payment">📱 Online / LankaQR Payment</option>
          </select>
          <input type="hidden" id="pmMethod" value="Cash">
        </div>

        <!-- Automatic Payment Status (Computed based on payment amount) -->
        <div class="po-field">
          <span class="po-label" id="pmPaymentStatusLabel">
            <span>Payment Status</span>
            <span class="hint" style="color: var(--text-muted); font-weight: 500;">Auto-computed</span>
          </span>
          <div id="pmStatusDisplayBadge" role="status" aria-labelledby="pmPaymentStatusLabel" style="height: var(--input-height, 38px); display: flex; align-items: center; gap: 8px; padding: 0 14px; border-radius: var(--input-radius, 8px); background: var(--surface-2); border: 1px solid var(--border); font-weight: 700; font-size: 12.5px;">
            <span id="pmStatusIcon"><i class="fa-solid fa-circle-dot" style="color: var(--po-orange);"></i></span>
            <span id="pmStatusText" style="color: var(--text);">Partially Paid (Installment)</span>
          </div>
          <!-- Hidden input holding payment_statuses_id (2: Completed, 3: Partial) -->
          <input type="hidden" id="pmPaymentStatusId" name="payment_statuses_id" value="3">
        </div>
      </div>

      <!-- Hidden Technical & Database Bindings (Automated by System / Backend) -->
      <input type="hidden" id="pmPrintJobId" name="print_jobs_id" value="">
      <input type="hidden" id="pmOrderId" name="order_id" value="">
      <input type="hidden" id="pmInvoiceId" name="invoice_id" value="">
      <input type="hidden" id="pmPaymentId" value="">
      <input type="hidden" id="pmInstallmentNo" value="1">
      <input type="hidden" id="pmPayDate" name="pay_date" value="">
      <input type="hidden" id="pmDate" value="">
      <input type="hidden" id="pmRef" value="-">
      <input type="hidden" id="pmReference" value="-">
      <input type="hidden" id="pmNote" value="">
      <input type="hidden" id="pmReceivedBy" value="">
    </div>

    <!-- Modal Footer -->
    <div class="po-modal-footer">
      <button type="button" class="po-btn po-btn-secondary" data-close-modal="addPaymentModal">
        <i class="fa-solid fa-xmark"></i> Cancel
      </button>
      <button type="button" class="po-btn po-btn-primary" id="submitAddPaymentBtn">
        <i class="fa-solid fa-check"></i> Record Payment &amp; Generate Receipt
      </button>
    </div>
  </div>
</div>
