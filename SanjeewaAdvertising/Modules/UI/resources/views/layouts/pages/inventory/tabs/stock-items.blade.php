<!-- ========================================== -->
<!-- TAB PANE 4: STOCK ITEMS & BRANDS REGISTRY -->
<!-- ========================================== -->
<div id="invTabPaneStockItems" class="inv-tab-pane" style="display: none; flex-direction: column; gap: 22px;">
  <!-- Summary KPI Metric Cards (3 Cards) -->
  <div class="inv-summary-grid" id="invStockItemsKpiGrid" style="grid-template-columns: repeat(3, minmax(0, 1fr));">
    <!-- Card 1: Registered Stock Items -->
    <div class="inv-kpi-card">
      <div class="inv-kpi-meta">
        <span class="inv-kpi-label">Registered Stock Items</span>
        <div class="inv-kpi-val" id="kpiCatalogTotalItems">0</div>
        <span class="inv-kpi-desc"><i class="fa-solid fa-boxes-stacked" style="color: #1677ff;"></i> Catalog Material SKUs</span>
      </div>
      <div class="inv-kpi-icon blue">
        <i class="fa-solid fa-boxes-stacked"></i>
      </div>
    </div>

    <!-- Card 2: Registered Brands -->
    <div class="inv-kpi-card">
      <div class="inv-kpi-meta">
        <span class="inv-kpi-label">Registered Brands</span>
        <div class="inv-kpi-val" id="kpiCatalogTotalBrands" style="color: #52c41a;">0</div>
        <span class="inv-kpi-desc"><i class="fa-solid fa-copyright" style="color: #52c41a;"></i> Manufacturer Brands</span>
      </div>
      <div class="inv-kpi-icon green">
        <i class="fa-solid fa-award"></i>
      </div>
    </div>

    <!-- Card 3: Active Classifications -->
    <div class="inv-kpi-card">
      <div class="inv-kpi-meta">
        <span class="inv-kpi-label">Active Categories</span>
        <div class="inv-kpi-val" id="kpiCatalogMappedCategories" style="color: #722ed1;">0</div>
        <span class="inv-kpi-desc"><i class="fa-solid fa-folder-tree" style="color: #722ed1;"></i> Material Classifications</span>
      </div>
      <div class="inv-kpi-icon purple">
        <i class="fa-solid fa-layer-group"></i>
      </div>
    </div>
  </div>

  <!-- Main Master-Detail 2-Column Layout (Brands Left, Stock Items Right) -->
  <div class="cat-split-layout">
    <!-- LEFT COLUMN: Brands Directory & Quick Add/Edit -->
    <div class="cat-col-card cat-col-categories" style="flex: 0 0 340px;">
      <div class="cat-card-header">
        <div class="cat-card-title">
          <h3><i class="fa-solid fa-award"></i> Brands Registry</h3>
          <span class="cat-header-sub">View &amp; manage manufacturers</span>
        </div>
        <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" id="brandToggleNewBtn">
          <i class="fa-solid fa-plus"></i> Add Brand
        </button>
      </div>

      <!-- Quick Add / Edit Brand Inline Form -->
      <div id="brandFormBox" class="cat-inline-form-box" style="display: none;">
        <div class="cat-form-title">
          <span id="brandFormTitle"><i class="fa-solid fa-circle-plus" style="color: #1677ff;"></i> Register New Brand</span>
          <button type="button" class="cat-close-btn" id="brandCancelFormBtn">&times;</button>
        </div>
        <div class="po-field" style="margin-top: 8px;">
          <label class="po-label" for="brandFormInput">Brand Name <span class="req">*</span></label>
          <input type="text" id="brandFormInput" name="brand_name" class="inv-search-input" placeholder="E.g. Avery Dennison">
          <small class="err" style="color: #ff4d4f; font-size: 11px;"></small>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
          <button type="button" class="ant-btn ant-btn-default ant-btn-sm" id="brandCancelFormBtn2">Cancel</button>
          <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" id="brandSaveBtn">
            <i class="fa-solid fa-check"></i> Save Brand
          </button>
        </div>
      </div>

      <!-- Brand Search Input -->
      <div class="cat-search-box" style="margin: 14px 0 10px;">
        <div class="inv-search-wrap" style="width: 100%;">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="catalogBrandSearchInput" name="catalog_brand_search" class="inv-search-input" placeholder="Search brands..." aria-label="Search brands">
        </div>
      </div>

      <!-- Brands Cards Container -->
      <div class="cat-list-container" id="catalogBrandsContainer" style="gap: 8px; display: flex; flex-direction: column;">
        <!-- Populated dynamically via BrandCardBuilder -->
      </div>
    </div>

    <!-- RIGHT COLUMN: Stock Items Catalog Table & Add/Edit Form -->
    <div class="cat-col-card cat-col-subcategories" style="flex: 1;">
      <div class="cat-card-header">
        <div class="cat-card-title">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <h3><i class="fa-solid fa-boxes-stacked"></i> Material Stock Items (SKUs)</h3>
            <span class="cat-active-badge">Catalog Master</span>
          </div>
          <span class="cat-header-sub">Manage raw materials, substrates, inks and SKUs</span>
        </div>
        <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" id="itemToggleNewBtn">
          <i class="fa-solid fa-plus"></i> Add Stock Item
        </button>
      </div>

      <!-- Add / Edit Stock Item Inline Form -->
      <div id="stockItemFormBox" class="cat-inline-form-box" style="display: none; background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 14px; margin-top: 10px;">
        <div class="cat-form-title">
          <span id="stockItemFormTitle"><i class="fa-solid fa-circle-plus" style="color: #1677ff;"></i> Register New Stock Item</span>
          <button type="button" class="cat-close-btn" id="itemCancelFormBtn">&times;</button>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px; margin-top: 10px;">
          <div class="po-field">
            <label class="po-label" for="itemFormCodeInput">Item Code / SKU <span style="font-size: 11px; font-weight: normal; color: var(--text-muted);">(System Generated)</span></label>
            <input type="text" id="itemFormCodeInput" name="item_code" class="inv-search-input" readonly placeholder="Auto Generated by System" style="background: var(--surface-2, #f5f5f5); cursor: not-allowed; color: #1677ff; font-weight: 600;">
            <small class="err" style="color: #ff4d4f; font-size: 11px;"></small>
          </div>
          <div class="po-field">
            <label class="po-label" for="itemFormNameInput">Item Name <span class="req">*</span></label>
            <input type="text" id="itemFormNameInput" name="item_name" class="inv-search-input" placeholder="E.g. 380gsm Matte Canvas High Res">
            <small class="err" style="color: #ff4d4f; font-size: 11px;"></small>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px;">
          <div class="po-field">
            <label class="po-label" for="itemFormCategorySelect">Material Category <span class="req">*</span></label>
            <select id="itemFormCategorySelect" name="material_category" class="inv-select" style="width: 100%;">
              <option value="">-- Select Category --</option>
            </select>
            <small class="err" style="color: #ff4d4f; font-size: 11px;"></small>
          </div>
          <div class="po-field">
            <label class="po-label" for="itemFormSubcatSelect">Material Subcategory <span class="req">*</span></label>
            <select id="itemFormSubcatSelect" name="material_subcategory" class="inv-select" style="width: 100%;" disabled>
              <option value="">-- Select Category First --</option>
            </select>
            <small class="err" style="color: #ff4d4f; font-size: 11px;"></small>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px;">
          <div class="po-field">
            <label class="po-label" for="itemFormLowStockInput">Low Stock Alert Threshold (Qty) <span class="req">*</span></label>
            <input type="number" id="itemFormLowStockInput" name="low_stock_threshold" class="inv-search-input" style="padding-left: 12px; padding-right: 12px;" min="0" step="1" value="10" placeholder="E.g. 10">
            <small class="err" style="color: #ff4d4f; font-size: 11px;"></small>
          </div>
          <div class="po-field">
            <label class="po-label" for="itemFormReorderInput">Reorder Quantity <span class="req">*</span></label>
            <input type="number" id="itemFormReorderInput" name="reorder_quantity" class="inv-search-input" style="padding-left: 12px; padding-right: 12px;" min="0" step="1" value="20" placeholder="E.g. 20">
            <small class="err" style="color: #ff4d4f; font-size: 11px;"></small>
          </div>
        </div>
        <div class="po-field" style="margin-top: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div class="po-label" style="margin-bottom: 0;">Compatible / Associated Brands <span class="req">*</span></div>
            <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" id="itemOpenBrandSelectModalBtn" style="font-size: 12px; height: 28px; display: inline-flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-plus"></i> Add Brand
            </button>
          </div>
          <!-- Selected Brands Display Container -->
          <div id="itemSelectedBrandsTags" style="display: flex; flex-wrap: wrap; gap: 6px; min-height: 42px; padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); align-items: center;">
            <span class="text-muted" id="itemBrandsEmptyPlaceholder" style="font-size: 12px; color: var(--text-muted);">
              No brands selected yet. Click "Add Brand" to select compatible manufacturers.
            </span>
          </div>
          <small id="itemBrandsErr" class="err" style="color: #ff4d4f; font-size: 11px; display: none; margin-top: 4px;"></small>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px;">
          <button type="button" class="ant-btn ant-btn-default ant-btn-sm" id="itemCancelFormBtn2">Cancel</button>
          <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" id="itemSaveBtn">
            <i class="fa-solid fa-check"></i> Save Item
          </button>
        </div>
      </div>

      <!-- Toolbar & Filters -->
      <div class="inv-toolbar" style="margin-top: 14px;">
        <div class="inv-toolbar-left" style="flex: 1; flex-wrap: wrap; gap: 8px;">
          <div class="inv-search-wrap" style="width: 100%; max-width: 240px;">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="catalogItemsSearchInput" name="catalog_items_search" class="inv-search-input" placeholder="Search SKU or name..." aria-label="Search SKU or name">
          </div>

          <select id="catalogCategoryFilter" name="catalog_category_filter" class="inv-select" aria-label="Filter by Category" style="max-width: 180px;">
            <option value="ALL">All Categories</option>
          </select>

          <select id="catalogBrandFilter" name="catalog_brand_filter" class="inv-select" aria-label="Filter by Brand" style="max-width: 160px;">
            <option value="ALL">All Brands</option>
          </select>

          <button type="button" class="ant-btn ant-btn-default" id="catalogItemsRefreshBtn" title="Refresh catalog">
            <i class="fa-solid fa-arrows-rotate"></i>
          </button>
        </div>
        <div class="inv-toolbar-right">
          <span id="catalogItemsTableCount" style="font-size: 12px; color: var(--text-muted); font-weight: 500;">
            Showing 0 items
          </span>
        </div>
      </div>

      <!-- Stock Items Table -->
      <div class="inv-table-responsive" style="margin-top: 10px;">
        <table class="ant-table" id="catalogItemsTable">
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th style="width: 110px;">Item Code</th>
              <th>Item Name</th>
              <th style="width: 200px;">Classification</th>
              <th style="width: 180px;">Brands</th>
              <th class="text-center" style="width: 100px;">Stocks</th>
              <th class="text-center" style="width: 90px;">Actions</th>
            </tr>
          </thead>
          <tbody id="catalogItemsTableBody">
            <!-- Populated dynamically via StockItemRowBuilder -->
          </tbody>
        </table>
      </div>

      <!-- Non-Reloading Pagination Bar (BasePaginationHandler, max 20 rows per page) -->
      <div class="po-pagination po-pagination-bar" id="catalogItemsPaginationBar">
        <div id="catalogItemsPaginationInfo" class="po-pagination-info">
          Showing 0 items
        </div>
        <div id="catalogItemsPaginationControls" class="pagination-controls po-pagination-controls">
          <!-- Rendered by BasePaginationHandler -->
        </div>
      </div>
    </div>
  </div>
</div>
