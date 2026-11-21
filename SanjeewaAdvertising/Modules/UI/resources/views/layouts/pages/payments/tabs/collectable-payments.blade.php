<!-- TAB PANE 1B: COLLECTABLE PAYMENTS (PENDING RECEIVABLES) -->
<div id="payTabPaneCollections" class="pay-tab-pane" style="display: none;">
  <div style="display: flex; flex-direction: column; gap: 20px;">
    <div class="pay-metric-grid">
      <div class="pay-metric-card metric-red">
        <div class="pay-metric-label">
          <span>Total Collectable Balance</span>
          <i class="fa-solid fa-hand-holding-dollar" style="color: #ef4444;"></i>
        </div>
        <div class="pay-metric-value" id="kpiColTotalDue" style="color: #ef4444;">Rs. 0.00</div>
        <div class="pay-metric-sub">Outstanding from customer jobs</div>
      </div>
      <div class="pay-metric-card metric-blue">
        <div class="pay-metric-label">
          <span>Billed Job Value</span>
          <i class="fa-solid fa-file-invoice"></i>
        </div>
        <div class="pay-metric-value" id="kpiColTotalBilled">Rs. 0.00</div>
        <div class="pay-metric-sub">Total value of open jobs</div>
      </div>
      <div class="pay-metric-card metric-green">
        <div class="pay-metric-label">
          <span>Advance Already Collected</span>
          <i class="fa-solid fa-circle-check" style="color: #10b981;"></i>
        </div>
        <div class="pay-metric-value" id="kpiColAdvancePaid" style="color: #10b981;">Rs. 0.00</div>
        <div class="pay-metric-sub">Partial payments received</div>
      </div>
      <div class="pay-metric-card metric-amber">
        <div class="pay-metric-label">
          <span>Collection Status</span>
          <i class="fa-solid fa-clock" style="color: #f59e0b;"></i>
        </div>
        <div class="pay-metric-value" id="kpiColStageCounts" style="font-size: 16px;">0 Unpaid | 0 Partial</div>
        <div class="pay-metric-sub">Jobs awaiting settlement</div>
      </div>
    </div>

    <div class="pay-filter-bar">
      <div class="pay-search-box">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" id="payCollectionSearch" class="pay-search-input" placeholder="Search by Job ID, Customer Name, Mobile, or Product...">
      </div>
      <div class="pay-filter-group">
        <select id="payCollectionStatusFilter" class="pay-select" aria-label="Filter by Collection Status">
          <option value="ALL">All Collectable Statuses</option>
          <option value="Pending Payment">Pending Collection (Unpaid)</option>
          <option value="Advance Payment">Partial / Advance Paid</option>
        </select>
        <button type="button" class="pay-btn-reset" id="payCollectionResetFilters" title="Reset Filters">
          <i class="fa-solid fa-rotate-left"></i> Reset
        </button>
      </div>
    </div>

    <div class="pay-table-card">
      <div class="pay-table-wrapper">
        <table class="pay-table">
          <thead>
            <tr>
              <th>Job ID / Date</th>
              <th>Customer</th>
              <th>Print Job / Specs</th>
              <th>Status</th>
              <th>Total Bill</th>
              <th>Paid Amount</th>
              <th>Balance Due</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody id="payCollectionTableBody">
          </tbody>
        </table>
      </div>

      <div class="po-pagination" id="payCollectionPaginationBar">
        <div class="pagination-info" id="payCollectionPaginationInfo">Showing 0 collectables</div>
        <div class="pagination-controls" id="payCollectionPaginationControls"></div>
      </div>
    </div>
  </div>
</div>
