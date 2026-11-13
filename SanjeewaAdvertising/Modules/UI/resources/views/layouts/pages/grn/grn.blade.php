@php
    $totalGrnCount = \Modules\Supplier\Models\Grn::count();
    $totalPoCount = \Modules\Supplier\Models\PurchaseOrder::count();
    $totalSupplierCount = \Modules\Supplier\Models\Supplier::count();
@endphp
@extends('ui::layouts.master')

@section('title', request('view') === 'po' ? 'Purchase Orders (PO)' : (request('view') === 'suppliers' ? 'Suppliers Directory' : 'Goods Received Note (GRN)'))
@section('page_title', request('view') === 'po' ? 'Purchase Orders (PO)' : (request('view') === 'suppliers' ? 'Suppliers Directory' : 'Goods Received Note (GRN)'))
@section('breadcrumb')Workspace / Inventory / <span>{{ request('view') === 'po' ? 'Purchase Orders (PO)' : (request('view') === 'suppliers' ? 'Suppliers Directory' : 'Goods Received (GRN)') }}</span>@endsection

@push('styles')
    {{ module_vite('build-ui', 'resources/assets/css/core.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/grn.css') }}
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
             MODULE 8: GOODS RECEIVED NOTE (GRN)
             ================================================================== -->
        <div class="app-module" id="module-grn" data-module="grn">
          <div class="grn-container">

            <!-- 1. Page Header -->
            <div class="grn-page-header">
              <div class="grn-page-title-wrap">
                <h2><i class="fa-solid fa-file-invoice-dollar"></i> Goods Received Note (GRN)</h2>
                <p class="grn-page-subtitle">Record supplier consignments, generate inward stock batches, audit vendor invoices, and update inventory.</p>
              </div>
              <div class="grn-header-actions">
                <button type="button" class="ant-btn ant-btn-default" id="grnExportBtn">
                  <i class="fa-solid fa-file-export"></i> Export CSV
                </button>
                <button type="button" class="ant-btn ant-btn-default" id="grnHeaderRegisterSupplierBtn">
                  <i class="fa-solid fa-user-plus"></i> + Register Supplier
                </button>
                <button type="button" class="ant-btn ant-btn-default" id="grnHeaderCreatePOBtn">
                  <i class="fa-solid fa-cart-arrow-down"></i> + Create Purchase Order
                </button>
                <button type="button" class="ant-btn ant-btn-primary" id="grnHeaderCreateBtn">
                  <i class="fa-solid fa-plus"></i> Create New GRN
                </button>
              </div>
            </div>

            <!-- 2. Summary KPI Cards (4 Cards Grid) -->
            <div class="grn-summary-grid">
              <!-- Card 1: Total GRNs -->
              <div class="grn-kpi-card">
                <div class="grn-kpi-meta">
                  <span class="grn-kpi-label">Total GRNs</span>
                  <div class="grn-kpi-val" id="grnKpiTotal">0</div>
                  <span class="grn-kpi-desc"><i class="fa-solid fa-layer-group" style="color: #1677ff;"></i> Logged Consignments</span>
                </div>
                <div class="grn-kpi-icon blue">
                  <i class="fa-solid fa-file-invoice"></i>
                </div>
              </div>

              <!-- Card 2: Completed GRNs -->
              <div class="grn-kpi-card">
                <div class="grn-kpi-meta">
                  <span class="grn-kpi-label">Completed GRNs</span>
                  <div class="grn-kpi-val" id="grnKpiCompleted" style="color: #52c41a;">0</div>
                  <span class="grn-kpi-desc"><i class="fa-solid fa-circle-check" style="color: #52c41a;"></i> Stock Batches Created</span>
                </div>
                <div class="grn-kpi-icon green">
                  <i class="fa-solid fa-boxes-packing"></i>
                </div>
              </div>

              <!-- Card 3: Total Value Received -->
              <div class="grn-kpi-card">
                <div class="grn-kpi-meta">
                  <span class="grn-kpi-label">Total Value Received</span>
                  <div class="grn-kpi-val" id="grnKpiValue">Rs. 0.00</div>
                  <span class="grn-kpi-desc"><i class="fa-solid fa-vault" style="color: #1677ff;"></i> Total Inward Inflow</span>
                </div>
                <div class="grn-kpi-icon purple">
                  <i class="fa-solid fa-money-bill-trend-up"></i>
                </div>
              </div>

              <!-- Card 4: Draft GRNs -->
              <div class="grn-kpi-card">
                <div class="grn-kpi-meta">
                  <span class="grn-kpi-label">Draft GRNs</span>
                  <div class="grn-kpi-val" id="grnKpiDraft" style="color: #faad14;">0</div>
                  <span class="grn-kpi-desc"><i class="fa-solid fa-clock" style="color: #faad14;"></i> Pending Stock Finalization</span>
                </div>
                <div class="grn-kpi-icon yellow">
                  <i class="fa-solid fa-clock-rotate-left"></i>
                </div>
              </div>
            </div>

            <!-- 3. Section Switcher Tabs -->
            <div class="grn-tabs-wrap">
              <button type="button" class="grn-tab-btn {{ (!request()->has('view') || request('view') === 'list') ? 'active' : '' }}" id="grnTabListBtn">
                <i class="fa-solid fa-list-check"></i> All GRN Records <span class="tab-count-badge" id="grnRecordCountBadge">{{ $totalGrnCount }}</span>
              </button>
              <button type="button" class="grn-tab-btn {{ request('view') === 'po' ? 'active' : '' }}" id="grnTabPOBtn">
                <i class="fa-solid fa-clipboard-list"></i> Purchase Orders (PO) <span class="tab-count-badge" id="grnPoCountBadge">{{ $totalPoCount }}</span>
              </button>
              <button type="button" class="grn-tab-btn {{ request('view') === 'suppliers' ? 'active' : '' }}" id="grnTabSuppliersBtn">
                <i class="fa-solid fa-truck-field"></i> Suppliers Directory <span class="tab-count-badge" id="grnSupplierCountBadge">{{ $totalSupplierCount }}</span>
              </button>
            </div>

            <!-- ======================================================================
                 VIEW A: ALL GRN DIRECTORY & TABLE VIEW
                 ====================================================================== -->
            <div id="grnListView" style="{{ (request()->has('view') && request('view') !== 'list') ? 'display: none;' : '' }}">
              <div class="grn-card">
                <!-- Toolbar Controls -->
                <div class="grn-toolbar">
                  <div class="grn-toolbar-left">
                    <!-- Search Bar -->
                    <div class="grn-search-wrap">
                      <i class="fa-solid fa-magnifying-glass"></i>
                      <input type="text" id="grnSearchInput" name="grn_search" aria-label="Search GRN records" class="grn-search-input" placeholder="Search by GRN #, PO #, supplier, contact...">
                    </div>

                    <!-- Supplier Filter -->
                    <select id="grnSupplierFilter" name="grn_supplier_filter" class="grn-select" aria-label="Filter by Supplier">
                      <option value="ALL">All Suppliers</option>
                    </select>

                    <!-- Status Filter -->
                    <select id="grnStatusFilter" name="grn_status_filter" class="grn-select" aria-label="Filter by Status">
                      <option value="ALL">All Statuses</option>
                      <option value="Completed">Completed</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>

                  <div class="grn-toolbar-right">
                    <span id="grnTableCount" style="font-size: 12px; color: var(--text-muted); font-weight: 500;">
                      Showing GRNs...
                    </span>
                  </div>
                </div>

                <!-- Main GRN Data Table -->
                <div class="inv-table-responsive">
                  <table class="ant-table">
                    <thead>
                      <tr>
                        <th style="width: 140px;">GRN No</th>
                        <th style="width: 180px;">Supplier</th>
                        <th style="width: 160px;">Supplier Contact</th>
                        <th style="width: 130px;">Received Date</th>
                        <th style="width: 150px;">Purchase Order</th>
                        <th class="text-right" style="width: 150px;">Net Total</th>
                        <th style="width: 130px;">Received By</th>
                        <th style="width: 130px;">Status</th>
                        <th class="text-center" style="width: 140px;">Actions</th>
                      </tr>
                    </thead>
                    <tbody id="grnTableBody">
                      <!-- Dynamically populated via js/grn.js -->
                    </tbody>
                  </table>
                </div>

                <!-- GRN Table Pagination (Visible only when results > 20) -->
                <div class="grn-pagination-bar" id="grnPaginationBar" style="display: none;">
                  <div class="grn-pagination-info" id="grnPaginationInfo"></div>
                  <div class="grn-pagination-controls" id="grnPaginationControls"></div>
                </div>
              </div>
            </div>

            <!-- ==================================================================
                 VIEW B: PURCHASE ORDERS (PO) DIRECTORY & TRACKING VIEW
                 ================================================================== -->
            <div id="grnPOView" style="{{ request('view') === 'po' ? '' : 'display: none;' }}">
              <div class="grn-card">
                <!-- PO Toolbar Controls -->
                <div class="grn-toolbar">
                  <div class="grn-toolbar-left">
                    <!-- Search Bar -->
                    <div class="grn-search-wrap">
                      <i class="fa-solid fa-magnifying-glass"></i>
                      <input type="text" id="poSearchInput" name="po_search" aria-label="Search Purchase Orders" class="grn-search-input" placeholder="Search by PO #, supplier, materials...">
                    </div>

                    <!-- Supplier Filter -->
                    <select id="poSupplierFilter" name="po_supplier_filter" class="grn-select" aria-label="Filter by Supplier">
                      <option value="ALL">All Suppliers</option>
                    </select>

                    <!-- Status Filter -->
                    <select id="poStatusFilter" name="po_status_filter" class="grn-select" aria-label="Filter by Status">
                      <option value="ALL">All Statuses</option>
                      <option value="Pending">Pending (Awaiting GRN)</option>
                      <option value="Partial">Partial (Partially Received)</option>
                      <option value="Completed">Completed (Fully Received)</option>
                    </select>
                  </div>

                  <div class="grn-toolbar-right">
                    <button type="button" class="ant-btn ant-btn-primary" id="poToolbarCreateBtn">
                      <i class="fa-solid fa-plus"></i> + Create Purchase Order
                    </button>
                  </div>
                </div>

                <!-- PO Table -->
                <div class="inv-table-responsive">
                  <table class="ant-table">
                    <thead>
                      <tr>
                        <th style="width: 140px;">PO Number</th>
                        <th style="width: 120px;">Order Date</th>
                        <th style="width: 130px;">Expected Date</th>
                        <th style="width: 180px;">Supplier / Vendor</th>
                        <th>Ordered Materials & Quantities</th>
                        <th class="text-right" style="width: 140px;">Estimated Total</th>
                        <th style="width: 120px;">Status</th>
                        <th class="text-center" style="width: 190px;">Actions</th>
                      </tr>
                    </thead>
                    <tbody id="poTableBody">
                      <!-- Dynamically populated via js/grn.js -->
                    </tbody>
                  </table>
                </div>

                <!-- PO Table Pagination (Visible only when results > 20) -->
                <div class="grn-pagination-bar" id="poPaginationBar" style="display: none;">
                  <div class="grn-pagination-info" id="poPaginationInfo"></div>
                  <div class="grn-pagination-controls" id="poPaginationControls"></div>
                </div>
              </div>
            </div>

            <!-- ==================================================================
                 VIEW D: SUPPLIERS DIRECTORY VIEW
                 ================================================================== -->
            <div id="grnSuppliersView" style="{{ request('view') === 'suppliers' ? '' : 'display: none;' }}">
              <div class="grn-card">
                <!-- Supplier Toolbar Controls -->
                <div class="grn-toolbar">
                  <div class="grn-toolbar-left">
                    <div class="grn-search-wrap">
                      <i class="fa-solid fa-magnifying-glass"></i>
                      <input type="text" id="supplierSearchInput" name="supplier_search" aria-label="Search suppliers" class="grn-search-input" placeholder="Search suppliers by name, contact, city, category...">
                    </div>
                    <select id="supplierCategoryFilter" name="supplier_category_filter" class="grn-select" aria-label="Filter by Category">
                      <option value="ALL">All Material Categories</option>
                      <option value="Paper & Boards">Paper & Boards</option>
                      <option value="Inks & Solvents">Inks & Solvents</option>
                      <option value="Flex & Banners">Flex & Banners</option>
                      <option value="Vinyl & Stickers">Vinyl & Stickers</option>
                      <option value="Rigid Boards & Hardware">Rigid Boards & Hardware</option>
                      <option value="Rollup Stands & Displays">Rollup Stands & Displays</option>
                    </select>
                  </div>
                  <div class="grn-toolbar-right">
                    <button type="button" class="ant-btn ant-btn-primary" id="supplierToolbarCreateBtn">
                      <i class="fa-solid fa-user-plus"></i> + Register New Supplier
                    </button>
                  </div>
                </div>

                <!-- Supplier Grid Cards -->
                <div class="supplier-grid" id="suppliersCardsContainer">
                  <!-- Dynamically populated via js/grn.js -->
                </div>

                <!-- Suppliers Pagination (Visible only when results > 20) -->
                <div class="grn-pagination-bar" id="supplierPaginationBar" style="display: none;">
                  <div class="grn-pagination-info" id="supplierPaginationInfo"></div>
                  <div class="grn-pagination-controls" id="supplierPaginationControls"></div>
                </div>
              </div>
            </div>

          </div>

          <!-- ==========================================================================
               CREATE NEW GRN MODAL (Multi-PO Support)
               ========================================================================== -->
          <div class="po-modal-overlay" id="createGrnModal">
            <div class="po-modal po-modal-large" style="max-width: 1040px; max-height: 94vh;">
              <!-- Modal Header -->
              <div class="po-modal-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 34px; height: 34px; border-radius: 8px; background: rgba(22, 119, 255, 0.1); color: #1677ff; display: flex; align-items: center; justify-content: center; font-size: 17px;">
                    <i class="fa-solid fa-file-circle-plus"></i>
                  </div>
                  <div>
                    <h3 style="margin: 0; font-size: 16px; font-weight: 700;">Receive &amp; Create Goods Received Note (GRN)</h3>
                    <span style="font-size: 11.5px; color: var(--text-muted);">Link one or more active Purchase Orders, record received quantities, and update stock</span>
                  </div>
                </div>
                <button type="button" class="modal-close-btn" data-close-grn-modal="createGrnModal" aria-label="Close modal">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>

              <!-- Modal Body -->
              <div class="po-modal-body" style="gap: 16px; padding: 18px 24px; max-height: calc(94vh - 130px); overflow-y: auto;">
                
                <!-- Top Row: GRN Meta Details -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; background: var(--surface-2, #fafafa); padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border);">
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="grnModalNumber" style="margin-bottom: 2px;">
                      <span>GRN Document Code</span>
                      <span class="hint">System allocated</span>
                    </label>
                    <input type="text" id="grnModalNumber" name="grn_number" class="grn-inline-input" style="font-family: ui-monospace; font-weight: 700; color: #1677ff;" readonly>
                  </div>

                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="grnCreateModalDate" style="margin-bottom: 2px;">
                      <span>Received Date <span class="req" style="color: #ff4d4f;">*</span></span>
                    </label>
                    <input type="date" id="grnCreateModalDate" name="grn_received_date" class="grn-inline-input" required>
                  </div>

                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="grnModalReceivedBy" style="margin-bottom: 2px;">
                      <span>Received By / Stock Custodian</span>
                    </label>
                    <input type="text" id="grnModalReceivedBy" name="received_by" class="grn-inline-input" value="Admin User" readonly>
                  </div>
                </div>

                <!-- SECTION 1: SEARCH & LINK PURCHASE ORDERS -->
                <div style="border-top: 1px solid var(--border); padding-top: 14px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="font-size: 13.5px; font-weight: 700; color: var(--text);">
                      <i class="fa-solid fa-clipboard-list" style="color: #1677ff;"></i> 1. Linked Purchase Orders (PO) <span class="tab-count-badge" id="grnModalPoCount" style="margin-left: 6px;">0</span>
                    </div>
                    <span style="font-size: 11.5px; color: var(--text-muted);">
                      A single GRN can receive items from multiple Purchase Orders
                    </span>
                  </div>

                  <!-- Active PO Search Selector -->
                  <div style="margin-bottom: 12px; position: relative;">
                    <label class="po-label" for="grnModalPoSearchInput" style="margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
                      <span><i class="fa-solid fa-magnifying-glass" style="color: #1677ff;"></i> Search &amp; Add Active Purchase Order <span class="req" style="color: #ff4d4f;">*</span></span>
                      <span class="hint" id="grnModalPoSearchHint" style="font-size: 11px; color: var(--text-muted);">Type PO #, supplier name, or click to browse active POs</span>
                    </label>
                    <div style="position: relative;">
                      <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 11px; color: var(--text-muted); font-size: 13px;"></i>
                      <input type="text" id="grnModalPoSearchInput" name="po_search_selector" aria-label="Search active Purchase Order to link" class="grn-inline-input" style="padding-left: 34px; padding-right: 34px; width: 100%; height: 38px; border-radius: 6px;" placeholder="Search active PO (e.g. PO-0001, supplier name, materials...) to add..." autocomplete="off">
                      <span id="grnModalPoSearchLoading" style="display: none; position: absolute; right: 12px; top: 11px; color: #1677ff; font-size: 13px;">
                        <i class="fa-solid fa-spinner fa-spin"></i>
                      </span>
                      <!-- Live Search Results Dropdown -->
                      <div id="grnModalPoSearchDropdown" style="display: none; position: absolute; left: 0; right: 0; top: 100%; z-index: 1050; background: var(--surface, #fff); border: 1px solid var(--border); border-radius: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); max-height: 250px; overflow-y: auto; margin-top: 4px;">
                      </div>
                    </div>
                  </div>

                  <!-- Table of Currently Linked Purchase Orders -->
                  <div class="inv-table-responsive" style="margin-bottom: 8px;">
                    <table class="ant-table" style="font-size: 12.5px;">
                      <thead>
                        <tr>
                          <th style="width: 130px;">PO Number</th>
                          <th style="min-width: 180px;">Supplier / Vendor</th>
                          <th style="width: 110px;">Order Date</th>
                          <th class="text-right" style="width: 130px;">PO Value (Rs.)</th>
                          <th style="width: 100px;">Status</th>
                          <th style="width: 180px;">Supplier Invoice #</th>
                          <th class="text-center" style="width: 70px;">Action</th>
                        </tr>
                      </thead>
                      <tbody id="grnModalPoTableBody">
                        <!-- Dynamically populated via CreateGrnModal.js -->
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- SECTION 2: RECEIVED MATERIAL ITEMS LIST -->
                <div style="border-top: 1px solid var(--border); padding-top: 14px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div style="font-size: 13.5px; font-weight: 700; color: var(--text);">
                      <i class="fa-solid fa-boxes-stacked" style="color: #1677ff;"></i> 2. Received Material Items List <span class="tab-count-badge" id="grnModalItemCount" style="margin-left: 6px;">0</span>
                    </div>
                    <span style="font-size: 11.5px; color: var(--text-muted);" id="grnModalItemHint">
                      Items auto-loaded from linked Purchase Orders. Adjust receiving quantities or unit costs.
                    </span>
                  </div>

                  <div class="inv-table-responsive">
                    <table class="grn-items-table">
                      <thead>
                        <tr>
                          <th style="min-width: 200px;">Material Item</th>
                          <th style="width: 110px;">Linked PO</th>
                          <th style="width: 70px;">Unit</th>
                          <th class="text-right" style="width: 85px;">Ordered</th>
                          <th class="text-right" style="width: 85px;">Prev Rec.</th>
                          <th class="text-right" style="width: 115px;">Receiving Qty <span class="req" style="color: #ff4d4f;">*</span></th>
                          <th class="text-right" style="width: 125px;">Unit Cost (Rs.) <span class="req" style="color: #ff4d4f;">*</span></th>
                          <th class="text-right" style="width: 125px;">Line Total (Rs.)</th>
                          <th class="text-center" style="width: 50px;">Action</th>
                        </tr>
                      </thead>
                      <tbody id="grnModalItemsTbody">
                        <!-- Dynamically populated via CreateGrnModal.js -->
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- SECTION 3: FINANCIAL CALCULATION SUMMARY & NOTES -->
                <div style="display: grid; grid-template-columns: 1fr 340px; gap: 16px; align-items: stretch; border-top: 1px solid var(--border); padding-top: 14px;">
                  <div style="display: flex; flex-direction: column;">
                    <div class="po-field" style="margin: 0; display: flex; flex-direction: column; height: 100%;">
                      <label class="po-label" for="grnModalRemarks" style="margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                        <span><i class="fa-solid fa-comment-dots" style="color: #1677ff; margin-right: 4px;"></i> Delivery Remarks &amp; Storage Notes</span>
                        <span class="hint" style="font-size: 11px; color: var(--text-muted); font-weight: 500;">Vehicle no, condition of packages, location</span>
                      </label>
                      <textarea id="grnModalRemarks"
                                name="delivery_remarks"
                                class="po-textarea grn-textarea"
                                rows="4"
                                placeholder="Condition of bundles/rolls, vehicle number, batch notes, warehouse rack/shelf location..."
                                style="width: 100%; min-height: 108px; flex: 1; padding: 10px 14px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface-2); font-family: inherit; font-size: 12.5px; line-height: 1.5; color: var(--text); resize: vertical; box-sizing: border-box; outline: none;"></textarea>
                    </div>
                  </div>

                  <div class="grn-financial-summary-box" style="margin: 0; padding: 14px 18px; border-radius: 8px;">
                    <div class="grn-fin-row">
                      <span>Sub Total:</span>
                      <strong id="grnModalSubTotal">Rs. 0.00</strong>
                    </div>
                    <div class="grn-fin-row">
                      <label for="grnModalDiscount" style="cursor: pointer; font-size: 13px;">Discount (LKR):</label>
                      <div style="width: 130px;">
                        <input type="number" id="grnModalDiscount" name="grn_discount" aria-label="GRN Discount" class="grn-inline-input text-right" min="0" step="0.01" value="0.00" style="height: 30px; font-weight: 600;">
                      </div>
                    </div>
                    <div class="grn-fin-row net-total" style="border-top: 2px solid #1677ff; margin-top: 8px; padding-top: 8px;">
                      <span style="font-weight: 700; color: #1677ff; font-size: 14px;">Net Total:</span>
                      <strong id="grnModalNetTotal" style="color: #1677ff; font-size: 17px;">Rs. 0.00</strong>
                    </div>
                  </div>
                </div>

              </div>

              <!-- Modal Footer -->
              <div class="po-modal-footer">
                <button type="button" class="ant-btn ant-btn-default" data-close-grn-modal="createGrnModal">Cancel</button>
                <button type="button" class="ant-btn ant-btn-primary" id="saveNewGrnModalBtn">
                  <i class="fa-solid fa-circle-check"></i> Complete &amp; Save GRN
                </button>
              </div>

            </div>
          </div>

          <!-- ==========================================================================
               VIEW / PRINT GRN VOUCHER MODAL
               ========================================================================== -->
          <div class="po-modal-overlay" id="viewGrnModal">
            <div class="po-modal po-modal-large" style="max-width: 820px; max-height: 90vh;">
              <div class="po-modal-header">
                <h3><i class="fa-solid fa-file-invoice"></i> Goods Received Note (GRN) Document</h3>
                <button type="button" class="modal-close-btn" data-close-grn-modal="viewGrnModal" aria-label="Close modal">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div class="po-modal-body" style="background: var(--surface-2); padding: 18px;">
                <div id="grnPrintArea" class="grn-voucher-sheet">
                  <!-- Header -->
                  <div class="grn-voucher-header">
                    <div class="grn-voucher-brand">
                      <strong>Sanjeewa</strong>
                      <span>ADVERTISING & PRINTING</span>
                      <div style="font-size: 11px; color: #666; margin-top: 3px;">
                        No. 42 Main Street, Colombo 03, Sri Lanka &bull; Tel: +94 11 234 5678
                      </div>
                    </div>
                    <div style="text-align: right;">
                      <h2 style="margin: 0; font-size: 18px; color: #1677ff; text-transform: uppercase;">Goods Received Note</h2>
                      <div style="font-size: 14px; font-weight: bold; margin-top: 4px;" id="grnDocNumber">GRN-2610-001</div>
                      <div style="margin-top: 6px;"><span class="grn-status-badge completed" id="grnDocStatus">Completed</span></div>
                    </div>
                  </div>

                  <!-- Meta Table -->
                  <table class="grn-voucher-meta-table">
                    <tr>
                      <td style="width: 15%; color: #666;"><strong>Supplier:</strong></td>
                      <td style="width: 35%; font-weight: bold;" id="grnDocSupplier">-</td>
                      <td style="width: 15%; color: #666;"><strong>Received Date:</strong></td>
                      <td style="width: 35%; font-weight: bold;" id="grnDocDate">-</td>
                    </tr>
                    <tr>
                      <td style="color: #666;"><strong>Supplier Contact:</strong></td>
                      <td style="font-weight: bold;" id="grnDocContact">-</td>
                      <td style="color: #666;"><strong>Purchase Order:</strong></td>
                      <td style="font-weight: bold;" id="grnDocPO">-</td>
                    </tr>
                    <tr>
                      <td style="color: #666;"><strong>Received By:</strong></td>
                      <td style="font-weight: bold;" id="grnDocReceivedBy">-</td>
                      <td style="color: #666;"><strong>Status:</strong></td>
                      <td style="font-weight: bold;"><span id="grnDocStatusTable" class="grn-status-badge completed">Completed</span></td>
                    </tr>
                  </table>

                  <!-- Items Table -->
                  <table class="grn-voucher-items-table">
                    <thead>
                      <tr>
                        <th style="width: 40px;">#</th>
                        <th>Item Description</th>
                        <th style="width: 120px;">Batch ID</th>
                        <th style="width: 80px;">Unit</th>
                        <th class="text-right" style="width: 90px;">Qty</th>
                        <th class="text-right" style="width: 110px;">Unit Cost</th>
                        <th class="text-right" style="width: 120px;">Total (LKR)</th>
                      </tr>
                    </thead>
                    <tbody id="grnDocItemsTbody">
                      <!-- Dynamically populated -->
                    </tbody>
                  </table>

                  <!-- Financial Summary -->
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 14px;">
                    <div style="max-width: 55%; font-size: 12px; color: #555;">
                      <strong>Remarks:</strong>
                      <p id="grnDocRemarks" style="margin: 4px 0 0; font-style: italic;">Consignment inspected upon receipt.</p>
                    </div>
                    <div style="min-width: 250px;">
                      <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px;">
                        <span>Sub Total:</span>
                        <strong id="grnDocSubTotal">Rs. 0.00</strong>
                      </div>
                      <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px;">
                        <span>Discount:</span>
                        <strong id="grnDocDiscount">Rs. 0.00</strong>
                      </div>
                      <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 15px; font-weight: bold; border-top: 2px solid #1677ff; margin-top: 4px; color: #1677ff;">
                        <span>Net Total:</span>
                        <strong id="grnDocNetTotal">Rs. 0.00</strong>
                      </div>
                    </div>
                  </div>

                  <!-- Signatures -->
                  <div class="grn-voucher-signatures">
                    <div class="grn-sig-box">Storekeeper / Received By</div>
                    <div class="grn-sig-box">Stock Auditor / Inspected By</div>
                    <div class="grn-sig-box">Authorized Officer Approval</div>
                  </div>
                </div>
              </div>

              <div class="po-modal-footer">
                <button type="button" class="ant-btn ant-btn-default" data-close-grn-modal="viewGrnModal">Close</button>
                <button type="button" class="ant-btn ant-btn-primary" id="printGrnDocBtn">
                  <i class="fa-solid fa-print"></i> Print GRN Voucher
                </button>
              </div>
            </div>
          </div>

          <!-- ==================================================================
               CREATE NEW PURCHASE ORDER (PO) MODAL
               ================================================================== -->
          <div class="po-modal-overlay" id="createPOModal">
            <div class="po-modal po-modal-large" style="max-width: 840px; max-height: 90vh;">
              <div class="po-modal-header">
                <h3><i class="fa-solid fa-cart-arrow-down" style="color: #1677ff;"></i> Create New Purchase Order (PO)</h3>
                <button type="button" class="modal-close-btn" data-close-grn-modal="createPOModal" aria-label="Close modal">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div class="po-modal-body" style="gap: 16px;">
                <!-- Header Info Grid -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
                  <!-- PO Number -->
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="newPoNumber">
                      <span>PO Number <span class="req">*</span></span>
                    </label>
                    <input type="text" id="newPoNumber" name="po_number" class="grn-inline-input" style="font-family: ui-monospace; font-weight: 700; color: #1677ff;" readonly>
                  </div>

                  <!-- Order Date -->
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="newPoDate">
                      <span>Order Date <span class="req">*</span></span>
                    </label>
                    <input type="date" id="newPoDate" name="po_date" class="grn-inline-input" required>
                  </div>

                  <!-- Expected Date -->
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="newPoExpectedDate">
                      <span>Expected Delivery <span class="req">*</span></span>
                    </label>
                    <input type="date" id="newPoExpectedDate" name="po_expected_date" class="grn-inline-input" required>
                  </div>

                  <!-- Supplier (with Quick Add Supplier) -->
                  <div class="po-field" style="margin: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                      <label class="po-label" for="newPoSupplier" style="margin: 0;">
                        <span>Supplier / Vendor <span class="req">*</span></span>
                      </label>
                      <button type="button" id="poQuickAddSupplierBtn" style="background: none; border: none; color: #1677ff; font-size: 11px; font-weight: 700; cursor: pointer; padding: 0;" title="Register a new supplier">
                        <i class="fa-solid fa-user-plus"></i> New
                      </button>
                    </div>
                    <input type="text" id="newPoSupplier" name="po_supplier" class="grn-inline-input" list="grnSupplierList" placeholder="Select or enter supplier" required>
                    <datalist id="grnSupplierList"></datalist>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px;">
                  <!-- Supplier Contact -->
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="newPoContact">
                      <span>Supplier Contact / Tel <span class="req">*</span></span>
                    </label>
                    <input type="text" id="newPoContact" name="po_contact" class="grn-inline-input" placeholder="E.g. 077 123 4567 / 011 234 5678">
                  </div>

                  <!-- Remarks / Notes -->
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="newPoRemarks">
                      <span>Order Instructions / Notes</span>
                    </label>
                    <input type="text" id="newPoRemarks" name="po_remarks" class="grn-inline-input" placeholder="Urgent order, standard packaging, batch requirement...">
                  </div>
                </div>

                <!-- Materials to Order Table -->
                <div style="border-top: 1px solid var(--border); padding-top: 14px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div style="font-size: 13px; font-weight: 700; color: var(--text);">
                      <i class="fa-solid fa-boxes-stacked" style="color: #1677ff;"></i> Materials to Order
                    </div>
                    <span style="font-size: 11.5px; color: var(--text-muted);">
                      Search and select items from database, then adjust quantity or cost
                    </span>
                  </div>

                  <!-- Database Item Search & Add Selector -->
                  <div style="margin-bottom: 12px; position: relative;">
                    <label class="po-label" for="newPoItemSearchInput" style="margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
                      <span><i class="fa-solid fa-magnifying-glass" style="color: #1677ff;"></i> Search &amp; Add Material Item <span class="req" style="color: #ff4d4f;">*</span></span>
                      <span class="hint" id="newPoItemSearchHint" style="font-size: 11px; color: var(--text-muted);">Type SKU code or material name to load &amp; add directly</span>
                    </label>
                    <div style="position: relative;">
                      <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 11px; color: var(--text-muted); font-size: 13px;"></i>
                      <input type="text" id="newPoItemSearchInput" name="po_item_search" aria-label="Search material items from database" class="grn-inline-input" style="padding-left: 34px; padding-right: 34px; width: 100%; height: 38px; border-radius: 6px;" placeholder="Search material item from database by SKU code or name..." autocomplete="off">
                      <span id="newPoItemSearchLoading" style="display: none; position: absolute; right: 12px; top: 11px; color: #1677ff; font-size: 13px;">
                        <i class="fa-solid fa-spinner fa-spin"></i>
                      </span>
                      <!-- Live Match Results Dropdown -->
                      <div id="newPoItemSearchDropdown" style="display: none; position: absolute; left: 0; right: 0; top: 100%; z-index: 1050; background: var(--surface, #fff); border: 1px solid var(--border); border-radius: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); max-height: 240px; overflow-y: auto; margin-top: 4px;">
                      </div>
                    </div>
                  </div>

                  <div class="inv-table-responsive">
                    <table class="grn-items-table">
                      <thead>
                        <tr>
                          <th>Material Item</th>
                          <th style="width: 100px;">Unit</th>
                          <th class="text-right" style="width: 120px;">Order Qty</th>
                          <th class="text-right" style="width: 140px;">Est. Unit Cost (Rs.)</th>
                          <th class="text-right" style="width: 150px;">Total (Rs.)</th>
                          <th class="text-center" style="width: 60px;">Action</th>
                        </tr>
                      </thead>
                      <tbody id="newPoItemsTbody">
                        <tr id="newPoEmptyStateRow">
                          <td colspan="6" style="text-align: center; padding: 36px 20px; background: rgba(0, 0, 0, 0.015); border-radius: 8px;">
                            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;">
                              <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(22, 119, 255, 0.08); display: flex; align-items: center; justify-content: center; color: #1677ff; font-size: 22px;">
                                <i class="fa-solid fa-boxes-stacked"></i>
                              </div>
                              <div>
                                <div style="font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 4px;">
                                  No Materials Added Yet
                                </div>
                                <div style="font-size: 12px; color: var(--text-muted); max-width: 380px; line-height: 1.5;">
                                  Click the <strong>"Add Item Line"</strong> button below to select material items, enter quantities, and specify estimated unit costs.
                                </div>
                              </div>
                              <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" style="margin-top: 4px;" onclick="window.grnManager.addNewPoRow()">
                                <i class="fa-solid fa-plus"></i> Add First Item
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div class="grn-add-row-bar" style="margin-top: 8px;">
                    <button type="button" class="ant-btn ant-btn-dashed" id="newPoAddRowBtn">
                      <i class="fa-solid fa-plus"></i> Add Item Line
                    </button>
                  </div>
                </div>

                <!-- Order Financial Summary -->
                <div style="display: flex; justify-content: flex-end; padding: 12px 16px; background: var(--surface-2); border-radius: 8px; border: 1px solid var(--border);">
                  <div style="display: flex; align-items: center; gap: 20px;">
                    <span style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Total Estimated PO Value:</span>
                    <span id="newPoTotalDisplay" style="font-size: 18px; font-weight: 800; color: #1677ff;">Rs. 0.00</span>
                  </div>
                </div>
              </div>

              <div class="po-modal-footer">
                <button type="button" class="ant-btn ant-btn-default" data-close-grn-modal="createPOModal">Cancel</button>
                <button type="button" class="ant-btn ant-btn-primary" id="saveNewPoBtn">
                  <i class="fa-solid fa-check"></i> Place & Save Purchase Order
                </button>
              </div>
            </div>
          </div>

          <!-- ==================================================================
               VIEW PURCHASE ORDER (PO) MODAL
               ================================================================== -->
          <div class="po-modal-overlay" id="viewPOModal">
            <div class="po-modal po-modal-large" style="max-width: 820px; max-height: 90vh;">
              <div class="po-modal-header">
                <h3><i class="fa-solid fa-file-invoice"></i> Purchase Order Document</h3>
                <button type="button" class="modal-close-btn" data-close-grn-modal="viewPOModal" aria-label="Close modal">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div class="po-modal-body" style="background: var(--surface-2); padding: 18px;">
                <div id="poPrintArea" class="grn-voucher-sheet">
                  <!-- Header -->
                  <div class="grn-voucher-header">
                    <div class="grn-voucher-brand">
                      <strong>Sanjeewa</strong>
                      <span>ADVERTISING & PRINTING</span>
                      <div style="font-size: 11px; color: #666; margin-top: 3px;">
                        No. 42 Main Street, Colombo 03, Sri Lanka &bull; Tel: +94 11 234 5678
                      </div>
                    </div>
                    <div style="text-align: right;">
                      <h2 style="margin: 0; font-size: 18px; color: #1677ff; text-transform: uppercase;">Purchase Order</h2>
                      <div style="font-size: 14px; font-weight: bold; margin-top: 4px;" id="poDocNumber">PO-2026-088</div>
                      <div style="margin-top: 6px;"><span class="grn-status-badge pending" id="poDocStatus">Pending</span></div>
                    </div>
                  </div>

                  <!-- Meta Table -->
                  <table class="grn-voucher-meta-table">
                    <tr>
                      <td style="width: 15%; color: #666;"><strong>Supplier:</strong></td>
                      <td style="width: 35%; font-weight: bold;" id="poDocSupplier">-</td>
                      <td style="width: 15%; color: #666;"><strong>Order Date:</strong></td>
                      <td style="width: 35%; font-weight: bold;" id="poDocDate">-</td>
                    </tr>
                    <tr>
                      <td style="color: #666;"><strong>Supplier Contact:</strong></td>
                      <td style="font-weight: bold;" id="poDocContact">-</td>
                      <td style="color: #666;"><strong>Expected Date:</strong></td>
                      <td style="font-weight: bold;" id="poDocExpectedDate">-</td>
                    </tr>
                    <tr>
                      <td style="color: #666;"><strong>Created By:</strong></td>
                      <td style="font-weight: bold;" id="poDocCreatedBy">Admin User</td>
                      <td style="color: #666;"><strong>Instructions:</strong></td>
                      <td style="font-style: italic;" id="poDocRemarks">-</td>
                    </tr>
                  </table>

                  <!-- Items Table -->
                  <table class="grn-voucher-items-table">
                    <thead>
                      <tr>
                        <th style="width: 40px;">#</th>
                        <th>Material Description</th>
                        <th style="width: 80px;">Unit</th>
                        <th class="text-right" style="width: 110px;">Ordered Qty</th>
                        <th class="text-right" style="width: 110px;">Received Qty</th>
                        <th class="text-right" style="width: 120px;">Unit Cost</th>
                        <th class="text-right" style="width: 130px;">Total (LKR)</th>
                      </tr>
                    </thead>
                    <tbody id="poDocItemsTbody">
                      <!-- Dynamically populated -->
                    </tbody>
                  </table>

                  <!-- Financial Summary -->
                  <div style="display: flex; justify-content: flex-end; margin-top: 14px;">
                    <div style="min-width: 260px;">
                      <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 15px; font-weight: bold; border-top: 2px solid #1677ff; color: #1677ff;">
                        <span>Total PO Amount:</span>
                        <strong id="poDocTotal">Rs. 0.00</strong>
                      </div>
                    </div>
                  </div>

                  <!-- Signatures -->
                  <div class="grn-voucher-signatures">
                    <div class="grn-sig-box">Prepared By (Purchasing)</div>
                    <div class="grn-sig-box">Authorized Officer Approval</div>
                    <div class="grn-sig-box">Supplier Acceptance</div>
                  </div>
                </div>
              </div>

              <div class="po-modal-footer">
                <button type="button" class="ant-btn ant-btn-default" data-close-grn-modal="viewPOModal">Close</button>
                <button type="button" class="ant-btn ant-btn-default" id="printPoDocBtn">
                  <i class="fa-solid fa-print"></i> Print Purchase Order
                </button>
                <button type="button" class="ant-btn ant-btn-primary" id="poCreateGrnActionBtn">
                  <i class="fa-solid fa-truck-ramp-box"></i> Create GRN for this PO
                </button>
              </div>
            </div>
          </div>
          </div>

          <!-- ==================================================================
               REGISTER NEW SUPPLIER MODAL
               ================================================================== -->
          <div class="po-modal-overlay" id="registerSupplierModal">
            <div class="po-modal" style="max-width: 620px; max-height: 90vh;">
              <div class="po-modal-header">
                <h3 id="registerSupplierModalTitle"><i class="fa-solid fa-truck-field" style="color: #1677ff;"></i> Register New Supplier / Vendor</h3>
                <button type="button" class="modal-close-btn" data-close-grn-modal="registerSupplierModal" aria-label="Close modal">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div class="po-modal-body" style="gap: 14px;">
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px;">
                  <!-- Supplier Code -->
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="newSupCode">
                      <span>Supplier Code <span class="req">*</span></span>
                    </label>
                    <input type="text" id="newSupCode" name="supplier_code" class="grn-inline-input" style="font-family: ui-monospace; font-weight: 700; color: #1677ff;" readonly>
                  </div>

                  <!-- Supplier / Company Name -->
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="newSupName">
                      <span>Company / Business Name <span class="req">*</span></span>
                    </label>
                    <input type="text" id="newSupName" name="supplier_name" autocomplete="organization" class="grn-inline-input" placeholder="E.g. PrintCare Lanka (Pvt) Ltd" required>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <!-- Contact Person -->
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="newSupPerson">
                      <span>Contact Person <span class="req">*</span></span>
                    </label>
                    <input type="text" id="newSupPerson" name="contact_person" autocomplete="name" class="grn-inline-input" placeholder="E.g. Samantha Perera" required>
                  </div>

                  <!-- Phone Number -->
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="newSupPhone">
                      <span>Mobile / Phone No <span class="req">*</span></span>
                    </label>
                    <input type="text" id="newSupPhone" name="phone" autocomplete="tel" class="grn-inline-input" placeholder="E.g. 077 123 4567" required>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <!-- Landline / Alt Phone -->
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="newSupAltPhone">
                      <span>Office Landline (Optional)</span>
                    </label>
                    <input type="text" id="newSupAltPhone" name="alt_phone" autocomplete="tel" class="grn-inline-input" placeholder="E.g. 011 234 5678">
                  </div>

                  <!-- Email -->
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="newSupEmail">
                      <span>Email Address</span>
                    </label>
                    <input type="email" id="newSupEmail" name="email" autocomplete="email" class="grn-inline-input" placeholder="E.g. orders@supplier.lk">
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <!-- Primary Supplied Category -->
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="newSupCategory">
                      <span>Primary Material Category <span class="req">*</span></span>
                    </label>
                    <select id="newSupCategory" name="category" class="grn-inline-input">
                      <option value="Paper & Boards">Paper & Boards</option>
                      <option value="Inks & Solvents">Inks & Solvents</option>
                      <option value="Flex & Banners">Flex & Banners</option>
                      <option value="Vinyl & Stickers">Vinyl & Stickers</option>
                      <option value="Rigid Boards & Hardware">Rigid Boards & Hardware</option>
                      <option value="Rollup Stands & Displays">Rollup Stands & Displays</option>
                      <option value="General Printing Media">General Printing Media</option>
                    </select>
                  </div>

                  <!-- Payment Terms -->
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="newSupTerms">
                      <span>Payment Terms / Credit</span>
                    </label>
                    <select id="newSupTerms" name="payment_terms" class="grn-inline-input">
                      <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                      <option value="7 Days Credit">7 Days Credit</option>
                      <option value="14 Days Credit">14 Days Credit</option>
                      <option value="30 Days Credit" selected>30 Days Credit</option>
                      <option value="45 Days Credit">45 Days Credit</option>
                      <option value="60 Days Credit">60 Days Credit</option>
                    </select>
                  </div>
                </div>

                <!-- Address / City -->
                <div class="po-field" style="margin: 0;">
                  <label class="po-label" for="newSupAddress">
                    <span>Warehouse Address / City</span>
                  </label>
                  <input type="text" id="newSupAddress" name="address" autocomplete="street-address" class="grn-inline-input" placeholder="E.g. No. 54, Central Road, Colombo 11">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <!-- Tax / VAT / BRN -->
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="newSupTaxNo">
                      <span>BRN / VAT No</span>
                    </label>
                    <input type="text" id="newSupTaxNo" name="tax_no" class="grn-inline-input" placeholder="E.g. PV-12345 / VAT-998811">
                  </div>

                  <!-- Bank Account Details -->
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="newSupBank">
                      <span>Bank Payment Details</span>
                    </label>
                    <input type="text" id="newSupBank" name="bank_details" class="grn-inline-input" placeholder="Bank, Branch, Account No">
                  </div>
                </div>
              </div>

              <div class="po-modal-footer">
                <button type="button" class="ant-btn ant-btn-default" data-close-grn-modal="registerSupplierModal">Cancel</button>
                <button type="button" class="ant-btn ant-btn-primary" id="saveNewSupplierBtn">
                  <i class="fa-solid fa-user-check"></i> Save & Register Supplier
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
    {{ module_vite('build-ui', 'resources/assets/js/core.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/sidebar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/topbar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/grn.js') }}
@endpush

