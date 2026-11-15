<!-- ==========================================================================
     PAYMENT HISTORY MODAL (#paymentHistoryModal)
     ========================================================================== -->
<div class="po-modal-overlay" id="paymentHistoryModal" aria-hidden="true" role="dialog" aria-labelledby="histModalTitle">
  <div class="po-modal po-modal-large" style="max-width: 1050px; width: 95vw; border-radius: 14px; overflow: hidden; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);">
    <!-- Modal Header -->
    <div class="po-modal-header" style="align-items: center; padding: 18px 24px; background: var(--surface);">
      <div style="display: flex; align-items: center; gap: 14px;">
        <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.24) 100%); color: #10b981; display: grid; place-items: center; font-size: 20px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.15);">
          <i class="fa-solid fa-clock-rotate-left"></i>
        </div>
        <div>
          <h3 id="histModalTitle" style="margin: 0; font-size: 16.5px; font-weight: 800; color: var(--text); letter-spacing: -0.2px;">Payment Installment History</h3>
          <p style="margin: 3px 0 0; font-size: 11.5px; color: var(--text-muted);">View all installment payments, invoice references, and receipt records for this order</p>
        </div>
      </div>
      <button type="button" class="modal-close-btn" data-close-modal="paymentHistoryModal" aria-label="Close modal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- Modal Body -->
    <div class="po-modal-body" style="padding: 20px 24px; gap: 16px; max-height: calc(88vh - 140px); overflow-y: auto;">

      <!-- 1. Top Order Context Banner -->
      <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 12px 18px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px;">Order ID:</span>
            <span id="phOrderId" style="font-size: 13.5px; font-weight: 800; color: #1677ff; background: rgba(22, 119, 255, 0.08); padding: 3px 10px; border-radius: 6px; border: 1px solid rgba(22, 119, 255, 0.2); font-family: monospace;">-</span>
          </div>
          <span style="color: var(--border); font-size: 14px;">|</span>
          <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted);">
            <i class="fa-regular fa-calendar" style="color: #1677ff;"></i>
            <span>Order Date:</span>
            <strong id="phOrderDate" style="color: var(--text); font-weight: 700;">-</strong>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <span id="phInvoiceBadge" style="font-size: 11px; font-weight: 700; color: #1677ff; background: rgba(22, 119, 255, 0.08); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(22, 119, 255, 0.2); display: inline-flex; align-items: center; gap: 5px;">
            <i class="fa-solid fa-file-invoice"></i> <span id="phInvoiceNo">-</span>
          </span>
          <span id="phOrderStatus" class="status-badge pending">-</span>
          <span id="phPaymentStatus" class="status-badge unpaid">-</span>
        </div>
      </div>

      <!-- 2. Customer & Product Summary (2-column row) -->
      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;">
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%); color: #fff; font-size: 13px; font-weight: 800; display: grid; place-items: center; flex-shrink: 0;">
            <i class="fa-solid fa-user"></i>
          </div>
          <div style="min-width: 0; flex: 1;">
            <span style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block;">Customer</span>
            <strong id="phCustName" style="font-size: 13px; color: var(--text); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">-</strong>
            <span id="phCustMobile" style="font-size: 11px; color: var(--text-muted);">-</span>
          </div>
        </div>

        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(255, 107, 0, 0.1); color: #ff6b00; font-size: 15px; display: grid; place-items: center; flex-shrink: 0;">
            <i class="fa-solid fa-layer-group"></i>
          </div>
          <div style="min-width: 0; flex: 1;">
            <span style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block;">Print Job / Product</span>
            <strong id="phProduct" style="font-size: 13px; color: var(--text); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">-</strong>
            <span id="phSpecs" style="font-size: 11px; color: var(--text-muted);">-</span>
          </div>
        </div>
      </div>

      <!-- 3. Financial Metrics (4 Cards Grid) -->
      <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px;">
        <!-- Total -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Total Order Amount</span>
          <strong id="phTotal" style="font-size: 15px; font-weight: 800; color: var(--text);">Rs. 0.00</strong>
        </div>

        <!-- Paid -->
        <div style="background: var(--surface); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 12px; text-align: center; box-shadow: 0 1px 3px rgba(16, 185, 129, 0.05);">
          <span style="font-size: 10px; color: #10b981; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Total Paid</span>
          <strong id="phPaid" style="font-size: 15px; font-weight: 800; color: #10b981;">Rs. 0.00</strong>
        </div>

        <!-- Balance -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Remaining Balance</span>
          <strong id="phBalance" style="font-size: 15px; font-weight: 800; color: #ef4444;">Rs. 0.00</strong>
        </div>

        <!-- Installment Count -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Installments</span>
          <strong id="phInstCount" style="font-size: 15px; font-weight: 800; color: #1677ff;">0 Paid</strong>
        </div>
      </div>

      <!-- 4. Installments Table -->
      <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #10b981; letter-spacing: 0.6px; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-receipt"></i>
            <span>Recorded Installments</span>
          </div>
          <span id="phTableSubtitle" style="font-size: 11px; color: var(--text-muted);">-</span>
        </div>

        <div class="po-table-responsive" style="border: 1px solid var(--border); border-radius: 8px; overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch;">
          <table class="history-table" style="width: 100%; min-width: 860px;">
            <thead>
              <tr>
                <th style="width: 45px; text-align: center;">#</th>
                <th style="min-width: 115px;">Payment ID</th>
                <th style="min-width: 110px;">Invoice No</th>
                <th style="min-width: 130px;">Date &amp; Time</th>
                <th style="min-width: 120px;">Amount (Rs.)</th>
                <th style="min-width: 130px;">Payment Method</th>
                <th style="min-width: 95px;">Status</th>
                <th style="min-width: 95px;">Reference</th>
                <th style="text-align: center; min-width: 90px; width: 90px;">Actions</th>
              </tr>
            </thead>
            <tbody id="historyTableBody">
              <!-- Populated dynamically -->
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Modal Footer -->
    <div class="po-modal-footer" style="justify-content: space-between;">
      <div>
        <button type="button" class="po-btn po-btn-primary" id="phAddPaymentBtn" style="display: none; background: #1677ff; border-color: #1677ff; color: #fff;">
          <i class="fa-solid fa-credit-card"></i> Add Payment Installment
        </button>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <button type="button" class="po-btn po-btn-secondary" id="phPrintLatestReceiptBtn" style="display: none;">
          <i class="fa-solid fa-print"></i> Print Latest Receipt
        </button>
        <button type="button" class="po-btn po-btn-secondary" data-close-modal="paymentHistoryModal">Close</button>
      </div>
    </div>
  </div>
</div>
