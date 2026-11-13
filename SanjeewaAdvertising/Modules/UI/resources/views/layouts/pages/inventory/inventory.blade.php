@extends('ui::layouts.master')

@section('title', 'Inventory & Stock Management')
@section('page_title', 'Stock Management')
@section('breadcrumb')Workspace / Inventory / <span>Stock Management</span>@endsection

@push('styles')
    {{ module_vite('build-ui', 'resources/assets/css/core.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/modules.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/inventory.css') }}
@endpush

@section('content')

    <div class="app-layout app" id="app">

        @include('ui::components.sidebar')

        <!-- Sidebar Backdrop Overlay -->
        <div class="sidebar-overlay" id="sidebarOverlay"></div>

        <main class="main-area" id="mainArea">

            @include('ui::components.topbar')

            <!-- Dynamic Main Content Viewport -->
            <div class="main-content-viewport" id="mainContentViewport">

<!-- ==================================================================
             MODULE 3: INVENTORY & STOCK MANAGEMENT (Ant Design / Gravity UI Style)
             ================================================================== -->
        <div class="app-module" id="module-inventory" data-module="inventory">
          <div class="inv-container">

            <!-- 1. Page Header -->
            <div class="inv-page-header">
              <div class="inv-page-title-wrap">
                <h2><i class="fa-solid fa-boxes-stacked"></i> Stock Management</h2>
                <p class="inv-page-subtitle">Real-time inventory levels, multi-batch costing, stock adjustments, and material valuation.</p>
              </div>
              <div class="inv-header-actions">
                <button type="button" class="ant-btn ant-btn-default" id="invCategoriesBtn">
                  <i class="fa-solid fa-tags"></i> Categories
                </button>
                <button type="button" class="ant-btn ant-btn-default" id="invSuppliersBtn">
                  <i class="fa-solid fa-truck-field"></i> Suppliers
                </button>
                <button type="button" class="ant-btn ant-btn-default" id="invExportBtn">
                  <i class="fa-solid fa-file-export"></i> Export CSV
                </button>
                <button type="button" class="ant-btn ant-btn-primary" id="invAddStockBtn">
                  <i class="fa-solid fa-plus"></i> Add Stock
                </button>
              </div>
            </div>

            <!-- Navigation Tabs Switcher -->
            <div class="inv-tab-nav" id="invTabNav">
              <button type="button" class="inv-tab-btn active" data-tab="stock" id="invTabStockBtn">
                <i class="fa-solid fa-boxes-stacked"></i>
                Material Stock Inventory
              </button>
              <button type="button" class="inv-tab-btn" data-tab="items" id="invTabStockItemsBtn">
                <i class="fa-solid fa-boxes-stacked"></i>
                Stock Items
                <span class="tab-count" id="tabBadgeStockItemsCount">0</span>
              </button>
              <button type="button" class="inv-tab-btn" data-tab="movements" id="invTabMovementsBtn">
                <i class="fa-solid fa-clock-rotate-left"></i>
                Stock Movements
                <span class="tab-count" id="tabBadgeMovementsCount">0</span>
              </button>
              <button type="button" class="inv-tab-btn" data-tab="categories" id="invTabCategoriesBtn">
                <i class="fa-solid fa-tags"></i>
                Categories
                <span class="tab-count" id="tabBadgeCategoriesCount">0</span>
              </button>
            </div>

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
                    <div class="inv-view-toggle-group" style="display: inline-flex; background: #f0f2f5; padding: 3px; border-radius: 6px; border: 1px solid var(--border, #d9d9d9);">
                      <button type="button" id="invViewToggleAggregatedBtn" class="inv-view-toggle-btn active" data-view="aggregated" style="display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 4px; border: none; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; background: #fff; color: #1677ff; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
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
                <div class="inv-table-responsive" id="invAggregatedTableWrap" style="display: block;">
                  <table class="ant-table">
                    <thead>
                      <tr>
                        <th style="width: 50px;">#</th>
                        <th style="width: 105px;">Item Code</th>
                        <th>Material Item Name</th>
                        <th style="width: 170px;">Category &amp; Subcategory</th>
                        <th style="width: 170px;">Compatible Brands</th>
                        <th class="text-center" style="width: 110px;">Batches</th>
                        <th class="text-right" style="width: 140px;">Total Stock Qty</th>
                        <th class="text-right" style="width: 145px;">Total Valuation</th>
                        <th style="width: 120px;">Status</th>
                        <th class="text-center" style="width: 170px;">Actions</th>
                      </tr>
                    </thead>
                    <tbody id="invAggregatedTableBody">
                      <!-- Dynamically populated via StockItemAggregatedRowBuilder -->
                    </tbody>
                  </table>
                </div>

                <!-- VIEW 2: Detailed Stock Batches Table -->
                <div class="inv-table-responsive" id="invBatchesTableWrap" style="display: none;">
                  <table class="ant-table">
                    <thead>
                      <tr>
                        <th style="width: 105px;">Item Code</th>
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
                <div class="po-pagination-bar" id="invPaginationBar" style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                  <div id="invPaginationInfo" class="po-pagination-info" style="font-size: 12.5px; color: var(--text-muted); font-weight: 500;">
                    Showing 0 materials
                  </div>
                  <div id="invPaginationControls" class="po-pagination-controls" style="display: flex; gap: 6px; align-items: center;">
                    <!-- Rendered by BasePaginationHandler -->
                  </div>
                </div>
              </div>
            </div>

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
                <div class="inv-table-responsive">
                  <table class="ant-table" id="invMovementsTable">
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
                        <th class="text-right" style="width: 125px;">Unit Price</th>
                        <th class="text-right" style="width: 135px;">Total Value</th>
                      </tr>
                    </thead>
                    <tbody id="invMovementsTableBody">
                      <!-- Rendered dynamically by StockMovementsHandler via StockMovementRowBuilder -->
                    </tbody>
                  </table>
                </div>

                <!-- Non-Reloading Pagination Bar (BasePaginationHandler standard) -->
                <div class="po-pagination-bar" style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                  <div id="movementsPaginationInfo" class="po-pagination-info" style="font-size: 12.5px; color: var(--text-muted); font-weight: 500;">
                    Showing 0 to 0 of 0 movements
                  </div>
                  <div id="movementsPaginationControls" class="po-pagination-controls" style="display: flex; gap: 6px; align-items: center;">
                    <!-- Rendered by BasePaginationHandler -->
                  </div>
                </div>
              </div>
            </div>

            <!-- ========================================== -->
            <!-- TAB PANE 3: CATEGORIES & SUBCATEGORIES     -->
            <!-- ========================================== -->
            <div id="invTabPaneCategories" class="inv-tab-pane" style="display: none; flex-direction: column; gap: 22px;">
              <!-- Categories KPI Metric Cards (3 Cards) -->
              <div class="inv-summary-grid" id="invCategoriesKpiGrid" style="grid-template-columns: repeat(3, minmax(0, 1fr));">
                <!-- Card 1: Total Categories -->
                <div class="inv-kpi-card">
                  <div class="inv-kpi-meta">
                    <span class="inv-kpi-label">Material Categories</span>
                    <div class="inv-kpi-val" id="catKpiTotalCategories">0</div>
                    <span class="inv-kpi-desc"><i class="fa-solid fa-folder-tree" style="color: #1677ff;"></i> Primary Classifications</span>
                  </div>
                  <div class="inv-kpi-icon blue">
                    <i class="fa-solid fa-folder-open"></i>
                  </div>
                </div>

                <!-- Card 2: Total Subcategories -->
                <div class="inv-kpi-card">
                  <div class="inv-kpi-meta">
                    <span class="inv-kpi-label">Subcategories</span>
                    <div class="inv-kpi-val" id="catKpiTotalSubcategories" style="color: #52c41a;">0</div>
                    <span class="inv-kpi-desc"><i class="fa-solid fa-tags" style="color: #52c41a;"></i> Material Sub-groups</span>
                  </div>
                  <div class="inv-kpi-icon green">
                    <i class="fa-solid fa-tags"></i>
                  </div>
                </div>

                <!-- Card 3: Material SKUs -->
                <div class="inv-kpi-card">
                  <div class="inv-kpi-meta">
                    <span class="inv-kpi-label">Mapped Stock SKUs</span>
                    <div class="inv-kpi-val" id="catKpiTotalItems" style="color: #722ed1;">0</div>
                    <span class="inv-kpi-desc"><i class="fa-solid fa-boxes-stacked" style="color: #722ed1;"></i> Registered Material Items</span>
                  </div>
                  <div class="inv-kpi-icon purple">
                    <i class="fa-solid fa-layer-group"></i>
                  </div>
                </div>
              </div>

              <!-- Main Master-Detail 2-Column Layout -->
              <div class="cat-split-layout">
                <!-- LEFT COLUMN: Categories Master List -->
                <div class="cat-col-card cat-col-categories">
                  <div class="cat-card-header">
                    <div class="cat-card-title">
                      <h3><i class="fa-solid fa-folder-tree"></i> Categories</h3>
                      <span class="cat-header-sub" id="catListSubtitle">Master classifications</span>
                    </div>
                    <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" id="catToggleNewCategoryBtn">
                      <i class="fa-solid fa-plus"></i> Add Category
                    </button>
                  </div>

                  <!-- Quick Add Category Form (Inline) -->
                  <div id="catNewCategoryBox" class="cat-inline-form-box" style="display: none;">
                    <div class="cat-form-title">
                      <span><i class="fa-solid fa-circle-plus" style="color: #1677ff;"></i> New Category</span>
                      <button type="button" class="cat-close-btn" id="catCancelNewCategoryBtn">&times;</button>
                    </div>
                    <div class="po-field" style="margin-top: 8px;">
                      <label class="po-label" for="newCategoryInput">Category Name <span class="req">*</span></label>
                      <input type="text" id="newCategoryInput" name="category_name" class="inv-search-input" placeholder="E.g. Speciality Media">
                      <small class="err" style="color: #ff4d4f; font-size: 11px;"></small>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
                      <button type="button" class="ant-btn ant-btn-default ant-btn-sm" id="catCancelNewCategoryBtn2">Cancel</button>
                      <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" id="catSaveCategoryBtn">
                        <i class="fa-solid fa-check"></i> Save
                      </button>
                    </div>
                  </div>

                  <!-- Category Search Input -->
                  <div class="cat-search-box" style="margin: 14px 0 10px;">
                    <div class="inv-search-wrap" style="width: 100%;">
                      <i class="fa-solid fa-magnifying-glass"></i>
                      <input type="text" id="catFilterInput" name="cat_filter_search" class="inv-search-input" placeholder="Search categories..." aria-label="Search categories">
                    </div>
                  </div>

                  <!-- Categories Dynamic List -->
                  <div class="cat-list-container" id="categoriesListContainer">
                    <!-- Populated dynamically -->
                  </div>
                </div>

                <!-- RIGHT COLUMN: Subcategories Detail Table -->
                <div class="cat-col-card cat-col-subcategories">
                  <div class="cat-card-header">
                    <div class="cat-card-title">
                      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <h3><i class="fa-solid fa-tags"></i> Subcategories</h3>
                        <span id="activeCategoryBadge" class="cat-active-badge">All Categories</span>
                      </div>
                      <span class="cat-header-sub" id="subcatTableSubtitle">Manage sub-groups and material classifications</span>
                    </div>
                    <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" id="subcatToggleNewBtn">
                      <i class="fa-solid fa-plus"></i> Add Subcategory
                    </button>
                  </div>

                  <!-- Quick Add Subcategory Form (Inline) -->
                  <div id="subcatNewBox" class="cat-inline-form-box" style="display: none;">
                    <div class="cat-form-title">
                      <span><i class="fa-solid fa-circle-plus" style="color: #52c41a;"></i> New Subcategory</span>
                      <button type="button" class="cat-close-btn" id="subcatCancelNewBtn">&times;</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 12px; margin-top: 8px;">
                      <div class="po-field">
                        <label class="po-label" for="newSubcatCategorySelect">Parent Category <span class="req">*</span></label>
                        <select id="newSubcatCategorySelect" name="parent_category" class="inv-select" style="width: 100%;">
                          <!-- Options dynamically populated -->
                        </select>
                        <small class="err" style="color: #ff4d4f; font-size: 11px;"></small>
                      </div>
                      <div class="po-field">
                        <label class="po-label" for="newSubcatNameInput">Subcategory Name <span class="req">*</span></label>
                        <input type="text" id="newSubcatNameInput" name="subcategory_name" class="inv-search-input" placeholder="E.g. Matte Canvas 380gsm">
                        <small class="err" style="color: #ff4d4f; font-size: 11px;"></small>
                      </div>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
                      <button type="button" class="ant-btn ant-btn-default ant-btn-sm" id="subcatCancelNewBtn2">Cancel</button>
                      <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" id="subcatSaveBtn">
                        <i class="fa-solid fa-check"></i> Save Subcategory
                      </button>
                    </div>
                  </div>

                  <!-- Subcategory Filter & Search Bar -->
                  <div class="inv-toolbar" style="margin-top: 14px;">
                    <div class="inv-toolbar-left" style="flex: 1;">
                      <div class="inv-search-wrap" style="width: 100%; max-width: 320px;">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input type="text" id="subcatSearchInput" name="subcat_search" class="inv-search-input" placeholder="Search subcategories..." aria-label="Search subcategories">
                      </div>
                      <button type="button" class="ant-btn ant-btn-default" id="subcatRefreshBtn" title="Refresh list">
                        <i class="fa-solid fa-arrows-rotate"></i>
                      </button>
                    </div>
                    <div class="inv-toolbar-right">
                      <span id="subcategoriesTableCount" style="font-size: 12px; color: var(--text-muted); font-weight: 500;">
                        Showing 0 subcategories
                      </span>
                    </div>
                  </div>

                  <!-- Subcategories Table -->
                  <div class="inv-table-responsive" style="margin-top: 10px;">
                    <table class="ant-table" id="subcategoriesTable">
                      <thead>
                        <tr>
                          <th style="width: 60px;">#</th>
                          <th>Subcategory Name</th>
                          <th style="width: 220px;">Parent Category</th>
                          <th class="text-center" style="width: 130px;">Stock Items</th>
                          <th class="text-center" style="width: 120px;">Actions</th>
                        </tr>
                      </thead>
                      <tbody id="subcategoriesTableBody">
                        <!-- Populated dynamically -->
                      </tbody>
                    </table>
                  </div>

                  <!-- Non-Reloading Pagination Bar (BasePaginationHandler standard, max 20 rows per page) -->
                  <div class="po-pagination-bar" id="subcategoriesPaginationBar" style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                    <div id="subcategoriesPaginationInfo" class="po-pagination-info" style="font-size: 12.5px; color: var(--text-muted); font-weight: 500;">
                      Showing 0 subcategories
                    </div>
                    <div id="subcategoriesPaginationControls" class="po-pagination-controls" style="display: flex; gap: 6px; align-items: center;">
                      <!-- Rendered by BasePaginationHandler -->
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                        <input type="text" id="itemFormCodeInput" name="item_code" class="inv-search-input" readonly placeholder="Auto Generated by System" style="background: var(--surface-3, #f5f5f5); cursor: not-allowed; color: #1677ff; font-weight: 600;">
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
                  <div class="po-pagination-bar" id="catalogItemsPaginationBar" style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                    <div id="catalogItemsPaginationInfo" class="po-pagination-info" style="font-size: 12.5px; color: var(--text-muted); font-weight: 500;">
                      Showing 0 items
                    </div>
                    <div id="catalogItemsPaginationControls" class="po-pagination-controls" style="display: flex; gap: 6px; align-items: center;">
                      <!-- Rendered by BasePaginationHandler -->
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- VIEW DETAILS MODAL -->
          <div class="po-modal-overlay" id="viewStockDetailsModal">
            <div class="po-modal po-modal-large" style="max-width: 860px; max-height: 90vh;">
              <div class="po-modal-header">
                <h3 id="invViewModalTitle"><i class="fa-solid fa-boxes-stacked" style="color: #1677ff;"></i> Stock Details</h3>
                <button type="button" class="modal-close-btn" data-close-inv-modal="viewStockDetailsModal" aria-label="Close modal">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div class="po-modal-body" style="gap: 18px;">
                <!-- Top Section Highlight Cards -->
                <div class="inv-modal-highlight-row">
                  <div class="inv-stat-highlight">
                    <span>Total Available Quantity</span>
                    <strong id="invViewTotalQty" style="color: #1677ff;">-</strong>
                  </div>
                  <div class="inv-stat-highlight">
                    <span>Total Stock Value</span>
                    <strong id="invViewTotalVal" style="color: #52c41a;">-</strong>
                  </div>
                </div>

                <!-- Middle Section: Batch Breakdown Table -->
                <div>
                  <h4 class="inv-modal-section-title">
                    <i class="fa-solid fa-layer-group"></i> Batch Breakdown
                  </h4>
                  <div class="inv-table-responsive" style="border: 1px solid var(--border); border-radius: 6px;">
                    <table class="ant-table">
                      <thead>
                        <tr>
                          <th>Batch ID</th>
                          <th>Received Date</th>
                          <th class="text-right">Unit Cost</th>
                          <th class="text-right">Initial Qty</th>
                          <th class="text-right">Available Qty</th>
                          <th class="text-right">Batch Value</th>
                        </tr>
                      </thead>
                      <tbody id="invViewBatchTbody">
                        <!-- Dynamically populated -->
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Bottom Section: Recent Transactions Timeline -->
                <div>
                  <h4 class="inv-modal-section-title">
                    <i class="fa-solid fa-clock-rotate-left"></i> Recent Transactions
                  </h4>
                  <div class="inv-timeline" id="invViewTimeline">
                    <!-- Dynamically populated -->
                  </div>
                </div>
              </div>

              <div class="po-modal-footer">
                <button type="button" class="ant-btn ant-btn-default" data-close-inv-modal="viewStockDetailsModal">Close</button>
              </div>
            </div>
          </div>

          <!-- SELECT BRANDS MODAL FOR STOCK ITEMS -->
          <div class="po-modal-overlay" id="selectBrandsModal" aria-hidden="true">
            <div class="po-modal" style="max-width: 520px; max-height: 85vh; display: flex; flex-direction: column;">
              <div class="po-modal-header" style="padding: 14px 18px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                  <i class="fa-solid fa-award" style="color: #1677ff;"></i> Select Compatible Brands
                </h3>
                <button type="button" class="modal-close-btn" data-close-inv-modal="selectBrandsModal" id="closeSelectBrandsModalBtn" aria-label="Close modal">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div class="po-modal-body" style="padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; flex: 1;">
                <!-- Search within modal -->
                <div class="inv-search-wrap" style="width: 100%;">
                  <i class="fa-solid fa-magnifying-glass"></i>
                  <input type="text" id="modalBrandSearchInput" name="modal_brand_search" class="inv-search-input" placeholder="Search brands in registry..." aria-label="Search brands in registry">
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-muted); padding: 0 2px;">
                  <span id="modalBrandSelectCount">0 brands selected</span>
                  <div style="display: flex; gap: 10px;">
                    <a href="javascript:void(0)" id="modalBrandSelectAll" style="color: #1677ff; text-decoration: none; font-weight: 600;">Select All</a>
                    <span>&bull;</span>
                    <a href="javascript:void(0)" id="modalBrandClearAll" style="color: #ff4d4f; text-decoration: none; font-weight: 600;">Clear All</a>
                  </div>
                </div>

                <!-- Scrollable list of brand checkboxes -->
                <div id="modalBrandsListContainer" style="display: flex; flex-direction: column; gap: 6px; max-height: 300px; overflow-y: auto; border: 1px solid var(--border); border-radius: 6px; padding: 8px; background: var(--surface);">
                  <!-- Populated dynamically via JS -->
                </div>
              </div>

              <div class="po-modal-footer" style="padding: 12px 18px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 8px; background: var(--surface-2);">
                <button type="button" class="ant-btn ant-btn-default ant-btn-sm" data-close-inv-modal="selectBrandsModal" id="modalBrandCancelBtn">Cancel</button>
                <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" id="modalBrandConfirmBtn">
                  <i class="fa-solid fa-check"></i> Done &amp; Apply (<span id="modalBrandConfirmCount">0</span>)
                </button>
              </div>
            </div>
          </div>

          <!-- STOCK ADJUSTMENT MODAL -->
          <div class="po-modal-overlay" id="adjustStockModal">
            <div class="po-modal" style="max-width: 600px;">
              <div class="po-modal-header">
                <h3 id="invAdjustModalTitle"><i class="fa-solid fa-sliders" style="color: #faad14;"></i> Adjust Stock</h3>
                <button type="button" class="modal-close-btn" data-close-inv-modal="adjustStockModal" aria-label="Close modal">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div class="po-modal-body" style="gap: 16px;">
                <!-- 1. Select Batch Dropdown -->
                <div class="po-field">
                  <label class="po-label" for="adjBatchSelect">
                    <span>Select Batch <span class="req">*</span></span>
                    <span class="hint">Includes batch available quantity & unit cost</span>
                  </label>
                  <select id="adjBatchSelect" name="adj_batch" class="inv-select" style="width: 100%;">
                    <!-- Populated dynamically -->
                  </select>
                </div>

                <!-- 2. Adjustment Type: (+) Add or (-) Deduct -->
                <div class="po-field">
                  <div class="po-label"><span>Adjustment Type <span class="req">*</span></span></div>
                  <div class="inv-segmented-group">
                    <div class="inv-segmented-option active add" id="adjTypeAdd">
                      <i class="fa-solid fa-plus"></i> (+) Add Stock
                    </div>
                    <div class="inv-segmented-option" id="adjTypeDeduct">
                      <i class="fa-solid fa-minus"></i> (-) Deduct Stock
                    </div>
                  </div>
                </div>

                <!-- 3. Quantity Number Input -->
                <div class="po-field">
                  <label class="po-label" for="adjQtyInput"><span>Adjustment Quantity <span class="req">*</span></span></label>
                  <input type="number" id="adjQtyInput" name="adj_qty" class="inv-search-input" min="1" step="1" placeholder="Enter quantity to adjust">
                </div>

                <!-- 4. Read-Only Financial Impact Value -->
                <div class="inv-impact-box">
                  <span style="color: var(--text-muted); font-weight: 600;">Financial Impact Value:</span>
                  <span id="adjImpactValue">
                    <strong>Rs. 0.00</strong>
                  </span>
                </div>

                <!-- 5. Reason Dropdown -->
                <div class="po-field">
                  <label class="po-label" for="adjReasonSelect"><span>Reason for Adjustment <span class="req">*</span></span></label>
                  <select id="adjReasonSelect" name="adj_reason" class="inv-select" style="width: 100%;">
                    <option value="Physical Count Mismatch">Physical Count Mismatch</option>
                    <option value="Damaged / Wasted">Damaged / Wasted</option>
                    <option value="Lost">Lost</option>
                    <option value="Production Scrap">Production Scrap</option>
                    <option value="Supplier Return">Supplier Return</option>
                    <option value="New Inflow / Restock">New Inflow / Restock</option>
                  </select>
                </div>

                <!-- 6. Remarks Textarea -->
                <div class="po-field">
                  <label class="po-label" for="adjRemarksInput"><span>Remarks / Extra Notes</span></label>
                  <textarea id="adjRemarksInput" name="adj_remarks" class="po-textarea" rows="2" placeholder="Additional audit notes or incident explanation..."></textarea>
                </div>
              </div>

              <div class="po-modal-footer">
                <button type="button" class="ant-btn ant-btn-default" data-close-inv-modal="adjustStockModal">Cancel</button>
                <button type="button" class="ant-btn ant-btn-primary" id="saveStockAdjustmentBtn">
                  <i class="fa-solid fa-check"></i> Save Adjustment
                </button>
              </div>
            </div>
          </div>

          <!-- ==========================================================================
               3. ADD / RECEIVE STOCK SHIPMENT MODAL (Database Aligned)
               ========================================================================== -->
          <div class="po-modal-overlay" id="addStockModal">
            <div class="po-modal po-modal-large" style="max-width: 760px; max-height: 92vh;">
              <div class="po-modal-header">
                <h3><i class="fa-solid fa-boxes-packing" style="color: #1677ff;"></i> <span id="addStockModalTitle">Receive &amp; Add Material Stock</span></h3>
                <button type="button" class="modal-close-btn" data-close-inv-modal="addStockModal" aria-label="Close modal">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div class="po-modal-body" style="gap: 16px; max-height: calc(92vh - 140px); overflow-y: auto;">
                <!-- 0. Stock Action Mode Selection (New Stock vs Update Existing Stock) -->
                <div style="background: var(--surface-2, #f5f5f5); border: 1px solid var(--border); border-radius: 8px; padding: 12px 16px;">
                  <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">
                    <i class="fa-solid fa-layer-group" style="color: #1677ff;"></i> Stock Action Type
                  </div>
                  <div style="display: flex; gap: 24px; flex-wrap: wrap; align-items: center;">
                    <label style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; font-weight: 600;">
                      <input type="radio" name="addStockMode" id="addStockModeNew" value="NEW" checked>
                      <span><i class="fa-solid fa-plus-circle" style="color: #1677ff;"></i> Receive as New Stock Record</span>
                    </label>
                    <label style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; font-weight: 600;">
                      <input type="radio" name="addStockMode" id="addStockModeUpdate" value="UPDATE">
                      <span><i class="fa-solid fa-arrows-rotate" style="color: #52c41a;"></i> Update / Add to Existing Stock Entry</span>
                    </label>
                  </div>

                  <!-- Existing Stock Dropdown (Visible only in UPDATE mode or when item has existing stocks) -->
                  <div id="addStockExistingSelectWrap" style="display: none; margin-top: 12px; padding-top: 10px; border-top: 1px dashed var(--border);">
                    <label class="po-label" for="addStockExistingSelect" style="margin-bottom: 6px;">
                      <span>Select Existing Stock Record to Update <span class="req" style="color: #ff4d4f;">*</span></span>
                      <span class="hint">Choose which stock record's quantity will be incremented</span>
                    </label>
                    <select id="addStockExistingSelect" name="add_stock_existing_item" class="inv-select" style="width: 100%;">
                      <option value="">-- Choose Existing Stock Record --</option>
                    </select>
                  </div>
                </div>

                <!-- 1. GRN Reference Selection (Step 1) -->
                <div class="po-field" style="margin: 0;">
                  <label class="po-label" for="addStockGrnSelect" style="margin-bottom: 6px; display: block; font-size: 12px; font-weight: 700;">
                    <span>Select GRN Reference <span class="req" style="color: #ff4d4f;">*</span></span>
                    <span class="hint" id="addStockGrnHint" style="font-size: 11px; color: var(--text-muted); font-weight: normal; margin-left: 8px;">Select a GRN to filter Purchase Order items</span>
                  </label>
                  <select id="addStockGrnSelect" name="add_stock_grn" class="inv-select" style="width: 100%;">
                    <option value="">-- Select GRN Reference --</option>
                  </select>
                </div>

                <!-- 2. Material Stock Item with Interactive Search Selector (Step 2) -->
                <div class="po-field" style="margin: 0; position: relative;">
                  <label class="po-label" for="addStockItemSearch" style="margin-bottom: 6px; display: block; font-size: 12px; font-weight: 700;">
                    <span>Select Material Item (SKU) <span class="req" style="color: #ff4d4f;">*</span></span>
                    <span class="hint" id="addStockItemHint" style="font-size: 11px; color: var(--text-muted); font-weight: normal; margin-left: 8px;">Search or select items under this GRN's Purchase Orders</span>
                  </label>
                  <input type="hidden" id="addStockSelectedItemId" name="add_stock_item_id" value="">

                  <!-- Selected Item Preview Card (Hidden until an item is picked) -->
                  <div id="addStockSelectedItemDisplay" style="display: none; background: #e6f7ff; border: 1px solid #91d5ff; border-radius: 6px; padding: 10px 14px; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <span class="inv-item-code" id="addStockPickedCode" style="font-size: 12.5px; font-weight: 700; color: #1677ff;">SKU-000</span>
                      <div>
                        <div id="addStockPickedName" style="font-weight: 600; font-size: 13px; color: var(--text);">Material Item Name</div>
                        <div id="addStockPickedCategory" style="font-size: 11px; color: var(--text-muted);">Category / Subcategory</div>
                      </div>
                    </div>
                    <button type="button" class="ant-btn ant-btn-default ant-btn-sm" id="addStockChangeItemBtn" style="font-size: 11px; height: 26px;">
                      <i class="fa-solid fa-pencil"></i> Change
                    </button>
                  </div>

                  <!-- Live Search Input Box -->
                  <div id="addStockItemSearchBoxWrap" style="position: relative;">
                    <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 11px; color: var(--text-muted); font-size: 13px;"></i>
                    <input type="text" id="addStockItemSearch" name="add_stock_item_search" class="inv-search-input" style="padding-left: 34px; width: 100%;" placeholder="Search or pick stock items for this GRN..." autocomplete="off">
                    <!-- Dropdown Matches List -->
                    <div id="addStockItemResultsDropdown" style="display: none; position: absolute; left: 0; right: 0; top: 100%; z-index: 1050; background: var(--surface, #fff); border: 1px solid var(--border); border-radius: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); max-height: 220px; overflow-y: auto; margin-top: 4px;">
                      <!-- Populated via JS -->
                    </div>
                  </div>
                </div>

                <!-- 3. Classification & Brand Selectors (Auto-selected on Item pick) -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="addStockCategorySelect">
                      <span>Category <span class="req" style="color: #ff4d4f;">*</span></span>
                    </label>
                    <select id="addStockCategorySelect" name="add_stock_category" class="inv-select" style="width: 100%;">
                      <option value="">-- Select Category --</option>
                    </select>
                  </div>
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="addStockSubcategorySelect">
                      <span>Subcategory <span class="req" style="color: #ff4d4f;">*</span></span>
                    </label>
                    <select id="addStockSubcategorySelect" name="add_stock_subcategory" class="inv-select" style="width: 100%;" disabled>
                      <option value="">-- Choose Category First --</option>
                    </select>
                  </div>
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="addStockBrandSelect">
                      <span>Brand <span class="req" style="color: #ff4d4f;">*</span></span>
                    </label>
                    <select id="addStockBrandSelect" name="add_stock_brand" class="inv-select" style="width: 100%;">
                      <option value="">-- Select Brand --</option>
                    </select>
                  </div>
                </div>

                <!-- 4. Batch Number Selection (Existing Batch vs New Batch) -->
                <div style="background: var(--surface-2, #f5f5f5); border: 1px solid var(--border); border-radius: 8px; padding: 12px 16px;">
                  <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">
                    <i class="fa-solid fa-barcode" style="color: #722ed1;"></i> Batch Number Allocation
                  </div>
                  <div style="display: flex; gap: 24px; flex-wrap: wrap; align-items: center; margin-bottom: 10px;">
                    <label style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px;">
                      <input type="radio" name="addStockBatchOption" id="addStockBatchOptNew" value="NEW" checked>
                      <span>Generate New Batch</span>
                    </label>
                    <label style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px;">
                      <input type="radio" name="addStockBatchOption" id="addStockBatchOptExisting" value="EXISTING">
                      <span>Select Existing Batch</span>
                    </label>
                  </div>

                  <div id="addStockExistingBatchWrap" style="display: none;">
                    <label class="po-label" for="addStockBatchSelect" style="margin-bottom: 4px;">
                      <span>Existing Batch Number</span>
                    </label>
                    <select id="addStockBatchSelect" name="add_stock_batch" class="inv-select" style="width: 100%;">
                      <option value="">-- Select Existing Batch No --</option>
                    </select>
                  </div>
                </div>

                <!-- 5. Received Date, Quantity & Pricing (4 Fields with Red Asterisks) -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: start;">
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="addStockDate" style="margin-bottom: 6px; display: block; font-size: 11.5px; font-weight: 700;">
                      <span>Received Date <span class="req" style="color: #ff4d4f;">*</span></span>
                    </label>
                    <input type="date" id="addStockDate" name="add_stock_date" class="inv-search-input" style="padding-left: 12px; padding-right: 12px; width: 100%;">
                  </div>
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="addStockQty" style="margin-bottom: 6px; display: block; font-size: 11.5px; font-weight: 700; white-space: nowrap;">
                      <span>Quantity Received <span class="req" style="color: #ff4d4f;">*</span></span>
                    </label>
                    <input type="number" id="addStockQty" name="add_stock_qty" class="inv-search-input" style="padding-left: 12px; padding-right: 12px; width: 100%;" min="1" step="1" placeholder="Enter quantity">
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: start;">
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="addStockUnitCost" style="margin-bottom: 6px; display: block; font-size: 11.5px; font-weight: 700; white-space: nowrap;">
                      <span>Unit Purchase Cost (LKR) <span class="req" style="color: #ff4d4f;">*</span></span>
                    </label>
                    <input type="number" id="addStockUnitCost" name="add_stock_unit_cost" class="inv-search-input" style="padding-left: 12px; padding-right: 12px; width: 100%;" min="0" step="0.01" placeholder="0.00">
                  </div>
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="addStockSellingPrice" style="margin-bottom: 6px; display: block; font-size: 11.5px; font-weight: 700; white-space: nowrap;">
                      <span>Standard Selling Price (LKR) <span class="req" style="color: #ff4d4f;">*</span></span>
                    </label>
                    <input type="number" id="addStockSellingPrice" name="add_stock_selling_price" class="inv-search-input" style="padding-left: 12px; padding-right: 12px; width: 100%;" min="0" step="0.01" placeholder="0.00">
                  </div>
                </div>

                <!-- 6. Live Financial & Stock Calculation Summary Box -->
                <div class="inv-impact-box" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                  <div>
                    <span style="color: var(--text-muted); font-size: 11px; font-weight: 700; text-transform: uppercase;">Total Shipment Purchase Cost:</span>
                    <div id="addStockTotalCost" style="font-size: 16px; font-weight: 800; color: #1677ff; margin-top: 2px;">Rs. 0.00</div>
                  </div>
                  <div id="addStockUpdateQtyIndicator" style="display: none; text-align: center; font-size: 12px; color: var(--text); background: rgba(82, 196, 26, 0.1); padding: 4px 12px; border-radius: 4px; border: 1px solid rgba(82, 196, 26, 0.3);">
                    <span style="color: #52c41a; font-weight: 700;">Stock Increment:</span>
                    <span id="addStockUpdateQtyCalc">0 + 0 = 0 Units</span>
                  </div>
                  <div style="text-align: right;">
                    <span style="color: var(--text-muted); font-size: 11px; font-weight: 700; text-transform: uppercase;">Estimated Retail Value:</span>
                    <div id="addStockTotalValue" style="font-size: 16px; font-weight: 800; color: #52c41a; margin-top: 2px;">Rs. 0.00</div>
                  </div>
                </div>
              </div>

              <div class="po-modal-footer">
                <button type="button" class="ant-btn ant-btn-default" data-close-inv-modal="addStockModal">Cancel</button>
                <button type="button" class="ant-btn ant-btn-primary" id="saveNewStockBtn">
                  <i class="fa-solid fa-plus"></i> <span id="saveStockBtnLabel">Save Stock Shipment</span>
                </button>
              </div>
            </div>
          </div>



        </div>


            </div>

        </main>

    </div>

    {{-- Shared Modals Container --}}
    @include('ui::layouts.modals.modals')

    <!-- Toast Container -->
    <div class="po-toast-container" id="poToastContainer"></div>

@endsection

@push('scripts')
    @php
        $initialCategoriesTabData = app(\Modules\Inventory\Services\InventoryCategoryService::class)->getCategoriesTabData();
    @endphp
    <script>
        window.__INITIAL_INVENTORY_CATEGORIES_DATA__ = @json($initialCategoriesTabData);
    </script>
    {{ module_vite('build-ui', 'resources/assets/js/core.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/sidebar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/topbar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/inventory.js') }}
@endpush

