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

            <!-- 2. Summary KPI Cards (4 Cards Grid) -->
            <div class="inv-summary-grid">
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
                    <input type="text" id="invSearchInput" class="inv-search-input" placeholder="Search by item code, name, category...">
                  </div>

                  <!-- Category Filter -->
                  <select id="invCategoryFilter" class="inv-select" aria-label="Filter by Category">
                    <option value="ALL">All Categories</option>
                    <option value="Paper & Boards">Paper & Boards</option>
                    <option value="Inks & Toners">Inks & Toners</option>
                    <option value="Flex & Banners">Flex & Banners</option>
                    <option value="Vinyl & Stickers">Vinyl & Stickers</option>
                    <option value="Rigid Boards & Hardware">Rigid Boards & Hardware</option>
                  </select>
                </div>

                <div class="inv-toolbar-right">
                  <span id="invTableCount" style="font-size: 12px; color: var(--text-muted); font-weight: 500;">
                    Showing items...
                  </span>
                </div>
              </div>

              <!-- Main Data Table -->
              <div class="inv-table-responsive">
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
                    <!-- Dynamically populated rows via js/inventory.js -->
                  </tbody>
                </table>
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
                  <select id="adjBatchSelect" class="inv-select" style="width: 100%;">
                    <!-- Populated dynamically -->
                  </select>
                </div>

                <!-- 2. Adjustment Type: (+) Add or (-) Deduct -->
                <div class="po-field">
                  <label class="po-label"><span>Adjustment Type <span class="req">*</span></span></label>
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
                  <input type="number" id="adjQtyInput" class="inv-search-input" min="1" step="1" placeholder="Enter quantity to adjust">
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
                  <select id="adjReasonSelect" class="inv-select" style="width: 100%;">
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
                  <textarea id="adjRemarksInput" class="po-textarea" rows="2" placeholder="Additional audit notes or incident explanation..."></textarea>
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
               3. ADD / RECEIVE STOCK SHIPMENT MODAL
               ========================================================================== -->
          <div class="po-modal-overlay" id="addStockModal">
            <div class="po-modal po-modal-large" style="max-width: 720px; max-height: 90vh;">
              <div class="po-modal-header">
                <h3><i class="fa-solid fa-boxes-packing" style="color: #1677ff;"></i> Receive & Add Stock Shipment</h3>
                <button type="button" class="modal-close-btn" data-close-inv-modal="addStockModal" aria-label="Close modal">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div class="po-modal-body" style="gap: 16px;">
                <!-- 1. Material Item Selection -->
                <div class="po-field">
                  <label class="po-label" for="addStockItemSelect">
                    <span>Select Material / Item SKU <span class="req">*</span></span>
                    <span class="hint">Choose existing catalog SKU or register a new one</span>
                  </label>
                  <select id="addStockItemSelect" class="inv-select" style="width: 100%;">
                    <!-- Dynamically populated options + [+ Register New Material SKU] -->
                  </select>
                </div>

                <!-- 1.1 New SKU details row (Visible only if [+ Register New Material SKU] selected) -->
                <div id="newSkuDetailsSection" style="display: none; background: var(--surface-2); border: 1px dashed var(--border); border-radius: 8px; padding: 14px; margin-top: -6px;">
                  <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #1677ff; margin-bottom: 10px;">
                    <i class="fa-solid fa-sparkles"></i> New Material SKU Specification
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px; margin-bottom: 12px;">
                    <div class="po-field" style="margin: 0;">
                      <label class="po-label" for="newSkuCode"><span>Item Code <span class="req">*</span></span></label>
                      <input type="text" id="newSkuCode" class="inv-search-input" placeholder="E.g. PAP-004">
                    </div>
                    <div class="po-field" style="margin: 0;">
                      <label class="po-label" for="newSkuName"><span>Item Name <span class="req">*</span></span></label>
                      <input type="text" id="newSkuName" class="inv-search-input" placeholder="E.g. 260gsm Matt Photo Paper A3">
                    </div>
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div class="po-field" style="margin: 0;">
                      <label class="po-label" for="newSkuCategory"><span>Category <span class="req">*</span></span></label>
                      <select id="newSkuCategory" class="inv-select" style="width: 100%;">
                        <option value="Paper & Boards">Paper & Boards</option>
                        <option value="Inks & Toners">Inks & Toners</option>
                        <option value="Flex & Banners">Flex & Banners</option>
                        <option value="Vinyl & Stickers">Vinyl & Stickers</option>
                        <option value="Rigid Boards & Hardware">Rigid Boards & Hardware</option>
                      </select>
                    </div>
                    <div class="po-field" style="margin: 0;">
                      <label class="po-label" for="newSkuUnit"><span>Unit of Measure <span class="req">*</span></span></label>
                      <select id="newSkuUnit" class="inv-select" style="width: 100%;">
                        <option value="Sheets">Sheets</option>
                        <option value="Liters">Liters</option>
                        <option value="Rolls">Rolls</option>
                        <option value="Sets">Sets</option>
                        <option value="Pcs">Pcs</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- 2. Supplier & Batch Details -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                  <div class="po-field">
                    <label class="po-label" for="addStockSupplier">
                      <span>Supplier / Vendor <span class="req">*</span></span>
                    </label>
                    <input type="text" id="addStockSupplier" class="inv-search-input" list="supplierOptionsList" placeholder="E.g. PaperPro Lanka">
                    <datalist id="supplierOptionsList">
                      <option value="PaperPro Lanka">
                      <option value="Flora Tech International">
                      <option value="MegaFlex Imports">
                      <option value="Avery Dennison Lanka">
                      <option value="PrintCare Materials">
                      <option value="Star Media Group">
                      <option value="SignBoard Supplies">
                      <option value="DisplayTech Hardware">
                    </datalist>
                  </div>
                  <div class="po-field">
                    <label class="po-label" for="addStockBatchId">
                      <span>Batch ID / Lot No <span class="req">*</span></span>
                    </label>
                    <input type="text" id="addStockBatchId" class="inv-search-input" placeholder="E.g. BAT-105">
                  </div>
                </div>

                <!-- 3. Received Date & Quantity -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                  <div class="po-field">
                    <label class="po-label" for="addStockDate">
                      <span>Received Date <span class="req">*</span></span>
                    </label>
                    <input type="date" id="addStockDate" class="inv-search-input">
                  </div>
                  <div class="po-field">
                    <label class="po-label" for="addStockQty">
                      <span>Quantity Received <span class="req">*</span></span>
                      <span class="hint" id="addStockUnitLabel">Units</span>
                    </label>
                    <input type="number" id="addStockQty" class="inv-search-input" min="1" step="1" placeholder="Enter quantity">
                  </div>
                </div>

                <!-- 4. Unit Cost & Retail Unit Price -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                  <div class="po-field">
                    <label class="po-label" for="addStockUnitCost">
                      <span>Unit Purchase Cost (LKR) <span class="req">*</span></span>
                      <span class="hint">Inward buy price per unit</span>
                    </label>
                    <input type="number" id="addStockUnitCost" class="inv-search-input" min="0" step="0.01" placeholder="0.00">
                  </div>
                  <div class="po-field">
                    <label class="po-label" for="addStockSellingPrice">
                      <span>Standard Retail / Selling Price (LKR) <span class="req">*</span></span>
                    </label>
                    <input type="number" id="addStockSellingPrice" class="inv-search-input" min="0" step="0.01" placeholder="0.00">
                  </div>
                </div>

                <!-- 5. Live Financial Summary Box -->
                <div class="inv-impact-box" style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <span style="color: var(--text-muted); font-size: 11px; font-weight: 700; text-transform: uppercase;">Total Shipment Purchase Cost:</span>
                    <div id="addStockTotalCost" style="font-size: 16px; font-weight: 800; color: #1677ff; margin-top: 2px;">Rs. 0.00</div>
                  </div>
                  <div style="text-align: right;">
                    <span style="color: var(--text-muted); font-size: 11px; font-weight: 700; text-transform: uppercase;">Estimated Retail Value:</span>
                    <div id="addStockTotalValue" style="font-size: 16px; font-weight: 800; color: #52c41a; margin-top: 2px;">Rs. 0.00</div>
                  </div>
                </div>

                <!-- 6. Supplier Invoice Ref & Notes -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                  <div class="po-field">
                    <label class="po-label" for="addStockInvoiceRef"><span>Supplier Invoice / Delivery Note #</span></label>
                    <input type="text" id="addStockInvoiceRef" class="inv-search-input" placeholder="E.g. INV-2026-4418">
                  </div>
                  <div class="po-field">
                    <label class="po-label" for="addStockRemarks"><span>Remarks / Storage Rack</span></label>
                    <input type="text" id="addStockRemarks" class="inv-search-input" placeholder="E.g. Stored on Rack B-3">
                  </div>
                </div>
              </div>

              <div class="po-modal-footer">
                <button type="button" class="ant-btn ant-btn-default" data-close-inv-modal="addStockModal">Cancel</button>
                <button type="button" class="ant-btn ant-btn-primary" id="saveNewStockBtn">
                  <i class="fa-solid fa-plus"></i> Save Stock Shipment
                </button>
              </div>
            </div>
          </div>

          <!-- ==========================================================================
               4. CATEGORIES MANAGEMENT MODAL
               ========================================================================== -->
          <div class="po-modal-overlay" id="invCategoriesModal" style="z-index: 1050;">
            <div class="po-modal po-modal-large" style="max-width: 840px;">
              <div class="po-modal-header">
                <h3><i class="fa-solid fa-tags"></i> Material Categories Management</h3>
                <button type="button" class="modal-close-btn" data-close-inv-modal="invCategoriesModal">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div class="po-modal-body" style="gap: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                  <p style="margin: 0; font-size: 13px; color: var(--text-muted);">
                    Material classification directory, real-time item counts, and category stock valuations.
                  </p>
                  <button type="button" class="ant-btn ant-btn-primary" id="openNewCategoryFormBtn" style="font-size: 12px; padding: 4px 12px;">
                    <i class="fa-solid fa-plus"></i> Add New Category
                  </button>
                </div>

                <!-- Add Category Inline Form -->
                <div id="newCategoryFormWrap" style="display: none; background: var(--surface-2); border: 1px dashed var(--border); border-radius: 8px; padding: 14px;">
                  <h4 style="margin: 0 0 10px; font-size: 13px; color: var(--text);"><i class="fa-solid fa-folder-plus"></i> Create New Material Category</h4>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div class="po-field">
                      <label class="po-label" for="newCatName"><span>Category Name <span class="req">*</span></span></label>
                      <input type="text" id="newCatName" class="inv-search-input" placeholder="E.g. Acrylic & Foamboards">
                    </div>
                    <div class="po-field">
                      <label class="po-label" for="newCatDesc"><span>Description / Notes</span></label>
                      <input type="text" id="newCatDesc" class="inv-search-input" placeholder="E.g. Rigid substrate materials">
                    </div>
                  </div>
                  <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
                    <button type="button" class="ant-btn ant-btn-default" id="cancelNewCategoryBtn">Cancel</button>
                    <button type="button" class="ant-btn ant-btn-primary" id="saveNewCategoryBtn"><i class="fa-solid fa-check"></i> Save Category</button>
                  </div>
                </div>

                <!-- Categories Grid Cards Container -->
                <div class="inv-categories-grid" id="categoriesGridContainer" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; max-height: 420px; overflow-y: auto; padding: 2px;">
                  <!-- Dynamically populated from inventory.js -->
                </div>
              </div>
              <div class="po-modal-footer">
                <button type="button" class="ant-btn ant-btn-default" data-close-inv-modal="invCategoriesModal">Close</button>
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
    {{ module_vite('build-ui', 'resources/assets/js/core.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/sidebar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/topbar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/inventory.js') }}
@endpush

