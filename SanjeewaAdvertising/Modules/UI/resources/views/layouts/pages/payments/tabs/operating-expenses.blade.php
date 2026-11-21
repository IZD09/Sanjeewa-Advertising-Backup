<!-- ====================================================================
     TAB PANE 3: OPERATING EXPENSES (MONTHLY UTILITY BILLS)
     ==================================================================== -->
<div id="payTabPaneExpenses" class="pay-tab-pane" style="display: none;">
  <div style="display: flex; flex-direction: column; gap: 20px;">

    <!-- Month Navigation & Quick Actions Bar -->
    <div class="expense-month-bar">
      <div class="month-selector-wrap">
        <div class="month-selector-label">
          <i class="fa-regular fa-calendar-check" style="color: #f59e0b; font-size: 18px;"></i>
          <div>
            <strong>Monthly Operating Bills</strong>
            <span id="expCurrentMonthLabel">Billing Month: October 2026</span>
          </div>
        </div>
        <div class="month-controls">
          <select id="expMonthSelect" class="pay-select" style="min-width: 170px; font-weight: 700;">
            <option value="ALL" selected>All Months</option>
            <option value="2026-11">November 2026 (Current)</option>
            <option value="2026-10">October 2026</option>
            <option value="2026-09">September 2026</option>
            <option value="2026-08">August 2026</option>
          </select>
          <button type="button" class="po-btn po-btn-secondary" id="btnExpThisMonth" style="height: 38px; padding: 0 12px; font-size: 12px; border-radius: 8px;">
            <i class="fa-solid fa-calendar-day"></i> This Month
          </button>
        </div>
      </div>
      <div class="expense-bar-actions" style="display: flex; align-items: center; gap: 8px;">
        <button type="button" class="po-btn pay-action-btn pay-btn-bill" id="btnOpenRecordBillPaymentTab" title="Record Bill Payment">
          <i class="fa-solid fa-bolt-lightning"></i> Record bill payment
        </button>
        <button type="button" class="po-btn po-btn-secondary" id="btnOpenAddExpenseModal" style="height: 40px; font-weight: 700; border-radius: 9px;">
          <i class="fa-solid fa-circle-plus"></i> Add New Bill
        </button>
      </div>
    </div>

    <!-- KPI Cards Grid for Monthly Bills -->
    <div class="pay-metric-grid">
      <div class="pay-metric-card metric-purple">
        <div class="pay-metric-label">
          <span>Total Monthly Bills</span>
          <i class="fa-solid fa-file-invoice-dollar" style="color: #8b5cf6;"></i>
        </div>
        <div class="pay-metric-value" id="kpiExpTotalBilled">Rs. 0.00</div>
        <div class="pay-metric-sub" id="kpiExpTotalSub">Total overhead bills for this month</div>
      </div>

      <div class="pay-metric-card metric-green">
        <div class="pay-metric-label">
          <span>Paid Bills</span>
          <i class="fa-solid fa-circle-check" style="color: #10b981;"></i>
        </div>
        <div class="pay-metric-value" id="kpiExpTotalPaid" style="color: #10b981;">Rs. 0.00</div>
        <div class="pay-metric-sub" id="kpiExpPaidCount">0 bills settled</div>
      </div>

      <div class="pay-metric-card metric-amber" style="border-left: 4px solid #ef4444;">
        <div class="pay-metric-label">
          <span>Due at Month-End</span>
          <i class="fa-solid fa-hourglass-start" style="color: #ef4444;"></i>
        </div>
        <div class="pay-metric-value" id="kpiExpTotalPending" style="color: #ef4444;">Rs. 0.00</div>
        <div class="pay-metric-sub" id="kpiExpPendingCount" style="color: #ef4444; font-weight: 700;">0 bills pending settlement</div>
      </div>

      <div class="pay-metric-card metric-blue">
        <div class="pay-metric-label">
          <span>Settlement Progress</span>
          <i class="fa-solid fa-chart-pie" style="color: var(--blue);"></i>
        </div>
        <div class="pay-metric-value" id="kpiExpProgressPercent" style="color: var(--blue);">0%</div>
        <div class="pay-metric-sub">
          <div class="exp-progress-bar-wrap">
            <div class="exp-progress-bar-fill" id="kpiExpProgressBar" style="width: 0%;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Categories Summary Cards -->
    <div class="methods-bar-card" style="background: var(--surface);">
      <div class="methods-bar-top">
        <span><i class="fa-solid fa-layer-group" style="margin-right: 6px; color: #f59e0b;"></i> Overhead Bills by Category</span>
        <span style="font-size: 11px; color: var(--text-muted);">Electricity • Water • Internet • Rent • Maintenance</span>
      </div>
      <div class="methods-badges-row">
        <div class="method-stat-box" style="border-left: 3px solid #f59e0b;">
          <i class="fa-solid fa-bolt-lightning" style="color: #f59e0b;"></i>
          <div class="method-stat-meta">
            <span>Electricity (CEB/LECO)</span>
            <strong id="catTotalElectricity">Rs. 0</strong>
          </div>
        </div>
        <div class="method-stat-box" style="border-left: 3px solid #0284c7;">
          <i class="fa-solid fa-droplet" style="color: #0284c7;"></i>
          <div class="method-stat-meta">
            <span>Water Board (NWSDB)</span>
            <strong id="catTotalWater">Rs. 0</strong>
          </div>
        </div>
        <div class="method-stat-box" style="border-left: 3px solid #8b5cf6;">
          <i class="fa-solid fa-wifi" style="color: #8b5cf6;"></i>
          <div class="method-stat-meta">
            <span>Internet / Fiber</span>
            <strong id="catTotalInternet">Rs. 0</strong>
          </div>
        </div>
        <div class="method-stat-box" style="border-left: 3px solid #ec4899;">
          <i class="fa-solid fa-building" style="color: #ec4899;"></i>
          <div class="method-stat-meta">
            <span>Shop / Office Rent</span>
            <strong id="catTotalRent">Rs. 0</strong>
          </div>
        </div>
        <div class="method-stat-box" style="border-left: 3px solid #64748b;">
          <i class="fa-solid fa-wrench" style="color: #64748b;"></i>
          <div class="method-stat-meta">
            <span>Maintenance / Other</span>
            <strong id="catTotalOther">Rs. 0</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="pay-filter-bar">
      <div class="pay-search-box">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" id="payExpenseSearch" class="pay-search-input" placeholder="Search by Bill name, Provider, Account #, or Reference...">
      </div>
      <div class="pay-filter-group">
        <select id="payExpenseCategoryFilter" class="pay-select" aria-label="Filter by Category">
          <option value="ALL">All Categories</option>
          <option value="Electricity">Electricity</option>
          <option value="Water Board">Water Board</option>
          <option value="Internet & Fiber">Internet &amp; Fiber</option>
          <option value="Shop Rent">Shop Rent</option>
          <option value="Mobile & Telephone">Mobile &amp; Telephone</option>
          <option value="Maintenance & Other">Maintenance &amp; Other</option>
        </select>
        <select id="payExpenseStatusFilter" class="pay-select" aria-label="Filter by Status">
          <option value="ALL">All Statuses</option>
          <option value="Pending">Pending Only</option>
          <option value="Paid">Paid Only</option>
          <option value="Overdue">Overdue</option>
        </select>
        <button type="button" class="pay-btn-reset" id="payExpenseResetFilters">
          <i class="fa-solid fa-rotate-left"></i> Reset
        </button>
      </div>
    </div>

    <!-- Operating Expenses Table -->
    <div class="pay-table-card">
      <div class="pay-table-wrapper">
        <table class="pay-table">
          <thead>
            <tr>
              <th>Bill Details &amp; Category</th>
              <th>Account / Ref #</th>
              <th>Month</th>
              <th>Due Date</th>
              <th>Bill Amount (Rs.)</th>
              <th>Status</th>
              <th style="text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody id="payExpenseTableBody">
          </tbody>
        </table>
      </div>

      <!-- Operating Expenses Pagination -->
      <div class="po-pagination" id="payExpensePaginationBar">
        <div class="pagination-info" id="payExpensePaginationInfo">Showing 0 bills</div>
        <div class="pagination-controls" id="payExpensePaginationControls"></div>
      </div>
    </div>

  </div>
</div>
