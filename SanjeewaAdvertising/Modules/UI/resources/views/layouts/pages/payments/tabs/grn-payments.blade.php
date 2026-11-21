<!-- TAB PANE 2: GRN PAYMENTS -->
<div id="payTabPaneGrn" class="pay-tab-pane" style="display: none;">
  <div style="display: flex; flex-direction: column; gap: 20px;">
    <div class="pay-metric-grid">
      <div class="pay-metric-card metric-green">
        <div class="pay-metric-label">
          <span>Total GRN Stock Billed</span>
          <i class="fa-solid fa-boxes-packing" style="color: #10b981;"></i>
        </div>
        <div class="pay-metric-value" id="kpiGrnTotalBilled">Rs. 0.00</div>
        <div class="pay-metric-sub">Total inventory consignments received</div>
      </div>

      <div class="pay-metric-card metric-blue">
        <div class="pay-metric-label">
          <span>Paid to Suppliers</span>
          <i class="fa-solid fa-circle-check" style="color: var(--blue);"></i>
        </div>
        <div class="pay-metric-value" id="kpiGrnTotalPaid" style="color: var(--blue);">Rs. 0.00</div>
        <div class="pay-metric-sub">Company disbursements cleared</div>
      </div>

      <div class="pay-metric-card metric-amber">
        <div class="pay-metric-label">
          <span>Outstanding Payables</span>
          <i class="fa-solid fa-hand-holding-dollar" style="color: #f59e0b;"></i>
        </div>
        <div class="pay-metric-value" id="kpiGrnTotalDue" style="color: #ef4444;">Rs. 0.00</div>
        <div class="pay-metric-sub">Credit terms due to suppliers</div>
      </div>

      <div class="pay-metric-card metric-purple">
        <div class="pay-metric-label">
          <span>Payment Stages Breakdown</span>
          <i class="fa-solid fa-chart-pie" style="color: #8b5cf6;"></i>
        </div>
        <div class="pay-metric-sub" id="kpiGrnStageCounts" style="font-size: 13px; color: var(--text); margin-top: 6px;">
          <strong>0</strong> Complete | <strong>0</strong> Advance | <strong>0</strong> Pending
        </div>
        <div class="pay-metric-sub" style="font-size: 10.5px; margin-top: auto;">Complete / Advance / Pending</div>
      </div>
    </div>

    <div class="methods-bar-card">
      <div class="methods-bar-top">
        <span><i class="fa-solid fa-wallet" style="margin-right: 6px; color: #10b981;"></i> Supplier Disbursements by Payment Method</span>
        <span style="font-size: 11px; color: var(--text-muted);">Card • Cash • Check • Bank Transfer</span>
      </div>
      <div class="methods-badges-row">
        <div class="method-stat-box card-box">
          <i class="fa-solid fa-credit-card"></i>
          <div class="method-stat-meta">
            <span>Corporate Card</span>
            <strong id="grnMethodCardTotal">Rs. 0</strong>
          </div>
        </div>
        <div class="method-stat-box cash-box">
          <i class="fa-solid fa-money-bill-wave"></i>
          <div class="method-stat-meta">
            <span>Petty Cash / COD</span>
            <strong id="grnMethodCashTotal">Rs. 0</strong>
          </div>
        </div>
        <div class="method-stat-box check-box">
          <i class="fa-solid fa-money-check"></i>
          <div class="method-stat-meta">
            <span>Company Cheques</span>
            <strong id="grnMethodCheckTotal">Rs. 0</strong>
          </div>
        </div>
        <div class="method-stat-box transfer-box">
          <i class="fa-solid fa-building-columns"></i>
          <div class="method-stat-meta">
            <span>Bank Transfers</span>
            <strong id="grnMethodTransferTotal">Rs. 0</strong>
          </div>
        </div>
      </div>
    </div>

    <div class="pay-filter-bar">
      <div class="pay-search-box">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" id="payGrnSearch" class="pay-search-input" placeholder="Search by GRN #, PO #, Supplier, Ref or Stock item...">
      </div>
      <div class="pay-filter-group">
        <select id="payGrnStatusFilter" class="pay-select" aria-label="Filter by Stage">
          <option value="ALL">All Stages</option>
          <option value="Complete Payment">Complete Payment</option>
          <option value="Pending Payment">Pending Payment</option>
          <option value="Advance Payment">Advance Payment</option>
        </select>
        <select id="payGrnMethodFilter" class="pay-select" aria-label="Filter by Method">
          <option value="ALL">All Methods</option>
          <option value="Card">Card</option>
          <option value="Cash">Cash</option>
          <option value="Check">Cheque / Check</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Online">Online / QR</option>
        </select>
        <button type="button" class="pay-btn-reset" id="payGrnResetFilters">
          <i class="fa-solid fa-rotate-left"></i> Reset
        </button>
      </div>
    </div>

    <div class="pay-table-card">
      <div class="pay-table-wrapper">
        <table class="pay-table">
          <thead>
            <tr>
              <th>GRN # / Date</th>
              <th>Supplier / Category</th>
              <th>Payment Stage</th>
              <th>Method</th>
              <th>Bill Total</th>
              <th>Paid Amount</th>
              <th>Balance Due</th>
              <th style="text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody id="payGrnTableBody">
          </tbody>
        </table>
      </div>

      <!-- GRN Payments Pagination -->
      <div class="po-pagination" id="payGrnPaginationBar">
        <div class="pagination-info" id="payGrnPaginationInfo">Showing 0 disbursements</div>
        <div class="pagination-controls" id="payGrnPaginationControls"></div>
      </div>
    </div>
  </div>
</div>
