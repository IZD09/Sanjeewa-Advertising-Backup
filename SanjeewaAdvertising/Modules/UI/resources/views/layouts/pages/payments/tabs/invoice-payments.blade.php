<!-- TAB PANE 1: INVOICE PAYMENTS -->
<div id="payTabPaneInvoice" class="pay-tab-pane">
  <div style="display: flex; flex-direction: column; gap: 20px;">
    <div class="pay-metric-grid">
      <div class="pay-metric-card metric-blue">
        <div class="pay-metric-label">
          <span>Total Jobs Invoiced</span>
          <i class="fa-solid fa-file-invoice" style="color: var(--blue);"></i>
        </div>
        <div class="pay-metric-value" id="kpiInvTotalBilled">Rs. 0.00</div>
        <div class="pay-metric-sub">Gross billed job revenue</div>
      </div>

      <div class="pay-metric-card metric-green">
        <div class="pay-metric-label">
          <span>Total Collected Revenue</span>
          <i class="fa-solid fa-circle-check" style="color: #10b981;"></i>
        </div>
        <div class="pay-metric-value" id="kpiInvTotalCollected" style="color: #10b981;">Rs. 0.00</div>
        <div class="pay-metric-sub">Settled &amp; realized customer funds</div>
      </div>

      <div class="pay-metric-card metric-amber">
        <div class="pay-metric-label">
          <span>Pending Receivables</span>
          <i class="fa-solid fa-clock-rotate-left" style="color: #f59e0b;"></i>
        </div>
        <div class="pay-metric-value" id="kpiInvTotalPending" style="color: #ef4444;">Rs. 0.00</div>
        <div class="pay-metric-sub">Balance due from clients on collection</div>
      </div>

      <div class="pay-metric-card metric-purple">
        <div class="pay-metric-label">
          <span>Payment Stages Breakdown</span>
          <i class="fa-solid fa-chart-pie" style="color: #8b5cf6;"></i>
        </div>
        <div class="pay-metric-sub" id="kpiInvStageCounts" style="font-size: 13px; color: var(--text); margin-top: 6px;">
          <strong>0</strong> Complete | <strong>0</strong> Advance | <strong>0</strong> Pending
        </div>
        <div class="pay-metric-sub" style="font-size: 10.5px; margin-top: auto;">Complete / Advance / Pending</div>
      </div>
    </div>

    <div class="methods-bar-card">
      <div class="methods-bar-top">
        <span><i class="fa-solid fa-wallet" style="margin-right: 6px; color: var(--blue);"></i> Realized Collections by Payment Method</span>
        <span style="font-size: 11px; color: var(--text-muted);">Card • Cash • Check • Bank Transfer</span>
      </div>
      <div class="methods-badges-row">
        <div class="method-stat-box card-box">
          <i class="fa-solid fa-credit-card"></i>
          <div class="method-stat-meta">
            <span>Card Collections</span>
            <strong id="invMethodCardTotal">Rs. 0</strong>
          </div>
        </div>
        <div class="method-stat-box cash-box">
          <i class="fa-solid fa-money-bill-wave"></i>
          <div class="method-stat-meta">
            <span>Cash Payments</span>
            <strong id="invMethodCashTotal">Rs. 0</strong>
          </div>
        </div>
        <div class="method-stat-box check-box">
          <i class="fa-solid fa-money-check"></i>
          <div class="method-stat-meta">
            <span>Cheque Deposits</span>
            <strong id="invMethodCheckTotal">Rs. 0</strong>
          </div>
        </div>
        <div class="method-stat-box transfer-box">
          <i class="fa-solid fa-building-columns"></i>
          <div class="method-stat-meta">
            <span>Bank Transfers</span>
            <strong id="invMethodTransferTotal">Rs. 0</strong>
          </div>
        </div>
      </div>
    </div>

    <div class="pay-filter-bar">
      <div class="pay-search-box">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" id="payInvoiceSearch" class="pay-search-input" placeholder="Search by Job #, Invoice #, Customer or Ref...">
      </div>
      <div class="pay-filter-group">
        <select id="payInvoiceStatusFilter" class="pay-select" aria-label="Filter by Stage">
          <option value="ALL">All Stages</option>
          <option value="Complete Payment">Complete Payment</option>
          <option value="Pending Payment">Pending Payment</option>
          <option value="Advance Payment">Advance Payment</option>
        </select>
        <select id="payInvoiceMethodFilter" class="pay-select" aria-label="Filter by Method">
          <option value="ALL">All Methods</option>
          <option value="Card">Card</option>
          <option value="Cash">Cash</option>
          <option value="Check">Cheque / Check</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Online">Online / QR</option>
        </select>
        <button type="button" class="pay-btn-reset" id="payInvoiceResetFilters">
          <i class="fa-solid fa-rotate-left"></i> Reset
        </button>
      </div>
    </div>

    <div class="pay-table-card">
      <div class="pay-table-wrapper">
        <table class="pay-table">
          <thead>
            <tr>
              <th>Invoice / Date</th>
              <th>Customer / Ref</th>
              <th>Payment Stage</th>
              <th>Method</th>
              <th>Total Bill</th>
              <th>Paid Amount</th>
              <th>Balance Due</th>
              <th style="text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody id="payInvoiceTableBody">
          </tbody>
        </table>
      </div>

      <!-- Invoice Payments Pagination -->
      <div class="po-pagination" id="payInvoicePaginationBar">
        <div class="pagination-info" id="payInvoicePaginationInfo">Showing 0 invoices</div>
        <div class="pagination-controls" id="payInvoicePaginationControls"></div>
      </div>
    </div>
  </div>
</div>
