<!-- ========================================== -->
<!-- TAB PANE 1: MATERIAL STOCK INVENTORY       -->
<!-- ========================================== -->
<div id="invTabPaneStock" class="inv-tab-pane active" style="display: flex; flex-direction: column; gap: 22px;">
  <!-- 2. Summary KPI Cards (4 Cards Grid) -->
  <div class="inv-summary-grid" id="invStockKpiGrid">
    <!-- Card 1: Total Items -->
    <div class="inv-kpi-card">
      <div class="inv-kpi-meta">
        <span class="inv-kpi-label">Total Items</span>
        <div class="inv-kpi-val" id="invKpiTotalItems">12</div>
        <span class="inv-kpi-desc"><i class="fa-solid fa-layer-group" style="color: #1677ff;"></i> Active Material SKUs</span>
      </div>
      <div class="inv-kpi-icon blue">
        <i class="fa-solid fa-boxes-stacked"></i>
      </div>
    </div>

    <!-- Card 2: Total Stock Value -->
    <div class="inv-kpi-card">
      <div class="inv-kpi-meta">
        <span class="inv-kpi-label">Total Stock Value</span>
        <div class="inv-kpi-val" id="invKpiTotalValue">Rs. 0.00</div>
        <span class="inv-kpi-desc"><i class="fa-solid fa-chart-line" style="color: #52c41a;"></i> Warehouse Valuation</span>
      </div>
      <div class="inv-kpi-icon green">
        <i class="fa-solid fa-vault"></i>
      </div>
    </div>

    <!-- Card 3: Low Stock Items -->
    <div class="inv-kpi-card">
      <div class="inv-kpi-meta">
        <span class="inv-kpi-label">Low Stock Items</span>
        <div class="inv-kpi-val" id="invKpiLowStock" style="color: #faad14;">0</div>
        <span class="inv-kpi-desc"><i class="fa-solid fa-triangle-exclamation" style="color: #faad14;"></i> Reorder Threshold Reached</span>
      </div>
      <div class="inv-kpi-icon yellow">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
    </div>

    <!-- Card 4: Out of Stock -->
    <div class="inv-kpi-card">
      <div class="inv-kpi-meta">
        <span class="inv-kpi-label">Out of Stock</span>
        <div class="inv-kpi-val" id="invKpiOutOfStock" style="color: #ff4d4f;">0</div>
        <span class="inv-kpi-desc"><i class="fa-solid fa-circle-exclamation" style="color: #ff4d4f;"></i> Immediate Action Required</span>
      </div>
      <div class="inv-kpi-icon red">
        <i class="fa-solid fa-box-open"></i>
      </div>
    </div>
  </div>

  <!-- 3. Main Data Card & Table -->
  <div class="inv-card">
    <!-- Toolbar Controls -->
    <div class="inv-toolbar">
      <div class="inv-toolbar-left">
        <!-- Search Bar -->
        <div class="inv-search-wrap">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="invSearchInput" name="inv_search" class="inv-search-input" placeholder="Search by item code, name, category..." aria-label="Search by item code, name, category">
        </div>

        <!-- Category Filter -->
        <select id="invCategoryFilter" name="inv_category_filter" class="inv-select" aria-label="Filter by Category">
          <option value="ALL">All Categories</option>
          <option value="Paper & Boards">Paper & Boards</option>
          <option value="Inks & Toners">Inks & Toners</option>
          <option value="Flex & Banners">Flex & Banners</option>
          <option value="Vinyl & Stickers">Vinyl & Stickers</option>
          <option value="Rigid Boards & Hardware">Rigid Boards & Hardware</option>
        </select>
      </div>

      <div class="inv-toolbar-right" style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <!-- Segmented View Toggle -->
        <div class="inv-view-toggle-group" style="display: inline-flex; background: var(--surface-2, #f0f2f5); padding: 3px; border-radius: 6px; border: 1px solid var(--border, #d9d9d9);">
          <button type="button" id="invViewToggleAggregatedBtn" class="inv-view-toggle-btn active" data-view="aggregated" style="display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 4px; border: none; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; background: var(--surface, #fff); color: #1677ff; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
            <i class="fa-solid fa-layer-group"></i> Consolidated Summary
          </button>
          <button type="button" id="invViewToggleBatchesBtn" class="inv-view-toggle-btn" data-view="batches" style="display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 4px; border: none; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; background: transparent; color: var(--text-muted, #595959); box-shadow: none;">
            <i class="fa-solid fa-boxes-stacked"></i> Detailed Stock Batches
          </button>
        </div>

        <span id="invTableCount" style="font-size: 12px; color: var(--text-muted); font-weight: 500; white-space: nowrap;">
          Showing items...
        </span>
      </div>
    </div>

    <!-- VIEW 1: Aggregated Item Summary Table -->
    <div class="po-table-responsive inv-table-responsive" id="invAggregatedTableWrap" style="display: block;">
      <table class="po-table">
        <thead>
          <tr>
            <th style="width: 50px;">#</th>
            <th style="width: 110px;">Item Code</th>
            <th>Material Item Name</th>
            <th style="width: 200px;">Category &amp; Subcategory</th>
            <th class="text-center" style="width: 120px;">Batches</th>
            <th class="text-right" style="width: 150px;">Total Stock Qty</th>
            <th style="width: 130px;">Status</th>
            <th class="text-center" style="width: 140px;">Actions</th>
          </tr>
        </thead>
        <tbody id="invAggregatedTableBody">
          <!-- Dynamically populated via StockItemAggregatedRowBuilder -->
        </tbody>
      </table>
    </div>

    <!-- VIEW 2: Detailed Stock Batches Table -->
    <div class="po-table-responsive inv-table-responsive" id="invBatchesTableWrap" style="display: none;">
      <table class="po-table">
        <thead>
          <tr>
            <th style="width: 110px;">Item Code</th>
            <th>Item Name</th>
            <th style="width: 160px;">Category</th>
            <th style="width: 170px;">Supplier</th>
            <th class="text-right" style="width: 125px;">Unit Price</th>
            <th class="text-right" style="width: 115px;">Available Qty</th>
            <th style="width: 85px;">Unit</th>
            <th class="text-right" style="width: 145px;">Total Value</th>
            <th style="width: 125px;">Status</th>
            <th class="text-center" style="width: 145px;">Actions</th>
          </tr>
        </thead>
        <tbody id="invTableBody">
          <!-- Dynamically populated via InventoryRowBuilder -->
        </tbody>
      </table>
    </div>

    <!-- Non-Reloading Pagination Bar (BasePaginationHandler, max 20 rows per page) -->
    <div class="po-pagination po-pagination-bar" id="invPaginationBar">
      <div id="invPaginationInfo" class="po-pagination-info">
        Showing 0 materials
      </div>
      <div id="invPaginationControls" class="pagination-controls po-pagination-controls">
        <!-- Rendered by BasePaginationHandler -->
      </div>
    </div>
  </div>
</div>
