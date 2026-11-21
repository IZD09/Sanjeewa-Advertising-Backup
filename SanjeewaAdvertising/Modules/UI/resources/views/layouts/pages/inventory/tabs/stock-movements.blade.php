<!-- ========================================== -->
<!-- TAB PANE 2: STOCK MOVEMENTS & AUDIT LOG    -->
<!-- ========================================== -->
<div id="invTabPaneMovements" class="inv-tab-pane" style="display: none; flex-direction: column; gap: 22px;">
  <!-- Movements Summary KPI Cards (4 Cards Grid) -->
  <div class="inv-summary-grid" id="invMovementsKpiGrid">
    <!-- Card 1: Total Movements -->
    <div class="inv-kpi-card">
      <div class="inv-kpi-meta">
        <span class="inv-kpi-label">Total Movements</span>
        <div class="inv-kpi-val" id="movKpiTotalMovements">0</div>
        <span class="inv-kpi-desc"><i class="fa-solid fa-clock-rotate-left" style="color: #1677ff;"></i> Historical Audit Entries</span>
      </div>
      <div class="inv-kpi-icon blue">
        <i class="fa-solid fa-list-check"></i>
      </div>
    </div>

    <!-- Card 2: Inward Received -->
    <div class="inv-kpi-card">
      <div class="inv-kpi-meta">
        <span class="inv-kpi-label">Stock Inward / GRN</span>
        <div class="inv-kpi-val" id="movKpiInwardQty" style="color: #52c41a;">0</div>
        <span class="inv-kpi-desc"><i class="fa-solid fa-arrow-down-long" style="color: #52c41a;"></i> Purchased &amp; Received</span>
      </div>
      <div class="inv-kpi-icon green">
        <i class="fa-solid fa-boxes-packing"></i>
      </div>
    </div>

    <!-- Card 3: Outward Usage / Jobs -->
    <div class="inv-kpi-card">
      <div class="inv-kpi-meta">
        <span class="inv-kpi-label">Stock Outward / Usage</span>
        <div class="inv-kpi-val" id="movKpiOutwardQty" style="color: #faad14;">0</div>
        <span class="inv-kpi-desc"><i class="fa-solid fa-arrow-up-long" style="color: #faad14;"></i> Consumed in Print Jobs</span>
      </div>
      <div class="inv-kpi-icon yellow">
        <i class="fa-solid fa-truck-ramp-box"></i>
      </div>
    </div>

    <!-- Card 4: Audits & Adjustments -->
    <div class="inv-kpi-card">
      <div class="inv-kpi-meta">
        <span class="inv-kpi-label">Audits &amp; Adjustments</span>
        <div class="inv-kpi-val" id="movKpiAdjustments" style="color: #722ed1;">0</div>
        <span class="inv-kpi-desc"><i class="fa-solid fa-scale-balanced" style="color: #722ed1;"></i> Variance Reconciliations</span>
      </div>
      <div class="inv-kpi-icon purple">
        <i class="fa-solid fa-scale-balanced"></i>
      </div>
    </div>
  </div>

  <!-- Movements Table Card -->
  <div class="inv-card">
    <!-- Toolbar Controls -->
    <div class="inv-toolbar">
      <div class="inv-toolbar-left">
        <!-- Search Input -->
        <div class="inv-search-wrap">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="invMovementsSearchInput" name="movements_search" class="inv-search-input" placeholder="Search item code, name, movement type, source..." aria-label="Search stock movements">
        </div>

        <!-- Direction Filter -->
        <select id="invMovementsDirectionFilter" name="movements_direction_filter" class="inv-select" aria-label="Filter by Direction">
          <option value="ALL">All Directions</option>
          <option value="IN">Inward / In (+)</option>
          <option value="OUT">Outward / Out (-)</option>
          <option value="ADJUST">Adjustments (&plusmn;)</option>
        </select>

        <!-- Type Filter -->
        <select id="invMovementsTypeFilter" name="movements_type_filter" class="inv-select" aria-label="Filter by Movement Type">
          <option value="ALL">All Movement Types</option>
          <option value="1">GRN / Purchase Receipt</option>
          <option value="2">Job Usage / Issue</option>
          <option value="3">Manual Stock In</option>
          <option value="4">Manual Stock Out</option>
          <option value="5">Inventory Adjustment</option>
          <option value="6">Damage / Wastage</option>
          <option value="7">Return to Supplier</option>
        </select>

        <!-- Refresh Button -->
        <button type="button" class="ant-btn ant-btn-default" id="invMovementsRefreshBtn" title="Refresh Movements">
          <i class="fa-solid fa-arrows-rotate"></i>
        </button>
      </div>

      <div class="inv-toolbar-right">
        <span id="invMovementsTableCount" style="font-size: 12px; color: var(--text-muted); font-weight: 500;">
          Showing 0 movements
        </span>
      </div>
    </div>

    <!-- Movements Table -->
    <div class="po-table-responsive inv-table-responsive">
      <table class="po-table" id="invMovementsTable">
        <thead>
          <tr>
            <th style="width: 110px;">Ref Code</th>
            <th style="width: 165px;">Date &amp; Time</th>
            <th style="width: 120px;">Item Code</th>
            <th>Item Description</th>
            <th style="width: 175px;">Movement Type</th>
            <th style="width: 95px;">Direction</th>
            <th style="width: 145px;">Source / Ref</th>
            <th class="text-right" style="width: 115px;">Quantity</th>
          </tr>
        </thead>
        <tbody id="invMovementsTableBody">
          <!-- Rendered dynamically by StockMovementsHandler via StockMovementRowBuilder -->
        </tbody>
      </table>
    </div>

    <!-- Non-Reloading Pagination Bar (BasePaginationHandler standard) -->
    <div class="po-pagination po-pagination-bar">
      <div id="movementsPaginationInfo" class="po-pagination-info">
        Showing 0 to 0 of 0 movements
      </div>
      <div id="movementsPaginationControls" class="pagination-controls po-pagination-controls">
        <!-- Rendered by BasePaginationHandler -->
      </div>
    </div>
  </div>
</div>
