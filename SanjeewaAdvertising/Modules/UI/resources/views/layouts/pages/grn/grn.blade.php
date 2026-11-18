@php
    use Modules\Supplier\Models\Grn;
    use Modules\Supplier\Models\PurchaseOrder;
    use Modules\Supplier\Models\Supplier;

    $totalGrnCount = Grn::count();
    $totalPoCount = PurchaseOrder::count();
    $totalSupplierCount = Supplier::count();
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
            <div id="grnListView" @if(request()->has('view') && request('view') !== 'list') style="display: none;" @endif>
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
            <div id="grnPOView" @if(request('view') !== 'po') style="display: none;" @endif>
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
                        <th style="min-width: 220px; max-width: 320px;">Ordered Materials</th>
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
            <div id="grnSuppliersView" @if(request('view') !== 'suppliers') style="display: none;" @endif>
              <div class="grn-suppliers-wrapper">
                <!-- Supplier Toolbar Controls -->
                <div class="grn-toolbar supplier-toolbar">
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
                <div class="grn-pagination-bar supplier-pagination-bar" id="supplierPaginationBar" style="display: none;">
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
              @php
                $grnAuthUser = Auth::guard('admin')->check()
                  ? Auth::guard('admin')->user()
                  : (Auth::guard('web')->user() ?? Auth::guard('admin')->user());
                $grnReceivedByName = $grnAuthUser
                  ? trim(($grnAuthUser->first_name ?? '') . ' ' . ($grnAuthUser->last_name ?? ''))
                  : '';
                if (empty($grnReceivedByName)) {
                  $grnReceivedByName = $grnAuthUser->username ?? $grnAuthUser->name ?? 'Administrator';
                }
              @endphp
              <div class="po-modal-body" style="gap: 16px; padding: 18px 24px; max-height: calc(94vh - 130px); overflow-y: auto;">
                
                <!-- Top Row: Supplier Search Selector & Received By (Logged-in User) -->
                <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 14px; align-items: start; background: var(--surface-2, #fafafa); padding: 14px 16px; border-radius: 10px; border: 1px solid var(--border);">
                  <!-- Searchable Supplier Selector -->
                  <div class="po-field" style="margin: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                      <label class="po-label" for="grnCreateSuppSearchInput" style="margin: 0; font-weight: 700;">
                        <i class="fa-solid fa-truck-field" style="color: #1677ff; margin-right: 4px;"></i>
                        <span>Select Supplier / Vendor <span class="req" style="color: #ff4d4f;">*</span></span>
                      </label>
                      <span class="hint" style="font-size: 11px; color: var(--text-muted);">Search to load supplier's Approved POs</span>
                    </div>

                    <div id="grnCreateSuppSearchGroup" style="position: relative;">
                      <div style="position: relative; display: flex; align-items: center;">
                        <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; color: var(--text-muted); font-size: 12.5px; z-index: 2; pointer-events: none;"></i>
                        <input type="text" id="grnCreateSuppSearchInput" name="grn_supplier_search" class="grn-inline-input" placeholder="Search supplier by name or phone (or click to browse)..." autocomplete="off" style="padding-left: 34px; padding-right: 36px; height: 40px; width: 100%; border-radius: 8px;">
                        <input type="hidden" id="grnCreateSelectedSupplierId" value="">
                        <button type="button" id="grnCreateToggleSuppDropdownBtn" style="position: absolute; right: 6px; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 6px; z-index: 2;" title="Browse suppliers">
                          <i class="fa-solid fa-chevron-down" id="grnCreateSuppDropdownIcon"></i>
                        </button>
                      </div>
                      <div id="grnCreateSuppDropdown" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: var(--surface, #fff); border: 1px solid var(--border); border-radius: 8px; max-height: 220px; overflow-y: auto; z-index: 1050; box-shadow: 0 10px 25px rgba(0,0,0,0.15);"></div>
                    </div>

                    <!-- Selected Supplier Card -->
                    <div id="grnCreateSelectedSupplierCard" style="display: none; align-items: center; justify-content: space-between; background: var(--surface, #fff); border: 1.5px solid #1677ff; border-radius: 8px; padding: 6px 10px; min-height: 40px; box-sizing: border-box;">
                      <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
                        <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(22, 119, 255, 0.12); color: #1677ff; display: grid; place-items: center; font-size: 12px; flex-shrink: 0;">
                          <i class="fa-solid fa-truck-fast"></i>
                        </div>
                        <div style="min-width: 0;">
                          <div id="grnCreateSelectedSuppName" style="font-weight: 700; font-size: 13px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Supplier Name</div>
                          <div id="grnCreateSelectedSuppMeta" style="font-size: 11px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">077 123 4567 • 0 Approved POs</div>
                        </div>
                      </div>
                      <button type="button" id="grnCreateClearSupplierBtn" class="ant-btn ant-btn-default ant-btn-sm" style="height: 26px; font-size: 11px; padding: 0 8px; flex-shrink: 0;">
                        <i class="fa-solid fa-rotate"></i> Change
                      </button>
                    </div>
                  </div>

                  <!-- Received By / Stock Custodian (Logged-in User) -->
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="grnModalReceivedBy" style="margin-bottom: 6px; font-weight: 700; display: block;">
                      <i class="fa-solid fa-user-shield" style="color: #1677ff; margin-right: 4px;"></i>
                      <span>Received By / Stock Custodian</span>
                    </label>
                    <input type="text" id="grnModalReceivedBy" name="received_by" class="grn-inline-input" style="height: 40px; border-radius: 8px; font-weight: 600; opacity: 0.9;" value="{{ $grnReceivedByName }}" data-logged-user="{{ $grnReceivedByName }}" readonly>
                  </div>
                </div>

                <!-- SECTION 1: LINK APPROVED PURCHASE ORDERS -->
                <div style="border-top: 1px solid var(--border); padding-top: 14px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="font-size: 13.5px; font-weight: 700; color: var(--text);">
                      <i class="fa-solid fa-clipboard-list" style="color: #1677ff;"></i> 1. Linked Purchase Orders (PO) <span class="tab-count-badge" id="grnModalPoCount" style="margin-left: 6px;">0</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <button type="button" id="grnCreateAddAllApprovedPoBtn" class="ant-btn ant-btn-default ant-btn-sm" style="display: none; height: 26px; font-size: 11px; color: #1677ff; border-color: rgba(22,119,255,0.35);">
                        <i class="fa-solid fa-check-double"></i> Add All Approved POs
                      </button>
                      <span style="font-size: 11.5px; color: var(--text-muted);">
                        Only Approved POs for the selected supplier can be linked
                      </span>
                    </div>
                  </div>

                  <!-- Approved PO Selector for Selected Supplier -->
                  <div style="margin-bottom: 12px;">
                    <label class="po-label" for="grnModalApprovedPoSelect" style="margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
                      <span><i class="fa-solid fa-file-circle-check" style="color: #1677ff;"></i> Select Approved Purchase Order <span class="req" style="color: #ff4d4f;">*</span></span>
                      <span class="hint" id="grnModalPoSearchHint" style="font-size: 11px; color: var(--text-muted);">Select a supplier above to view their Approved Purchase Orders</span>
                    </label>
                    <select id="grnModalApprovedPoSelect" name="approved_po_select" class="grn-inline-input" style="height: 40px; width: 100%; border-radius: 8px; font-weight: 600;" disabled>
                      <option value="">-- Please select a supplier above first --</option>
                    </select>
                    <div id="grnCreateApprovedPoChips" style="display: none; flex-wrap: wrap; gap: 8px; margin-top: 8px;"></div>
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
                  @php
                    $grnVoucherSettings = \Modules\UI\Http\Controllers\SettingsController::getAppSettings();
                    $grnBrandParts = explode(' ', trim($grnVoucherSettings['shop_name'] ?? 'Sanjeewa Advertising'), 2);
                  @endphp
                  <!-- Header -->
                  <div class="grn-voucher-header">
                    <div class="grn-voucher-brand">
                      <strong>{{ $grnBrandParts[0] ?? 'Sanjeewa' }}</strong>
                      <span>{{ strtoupper($grnBrandParts[1] ?? 'ADVERTISING & PRINTING') }}</span>
                      <div style="font-size: 11px; color: #666; margin-top: 3px;">
                        {{ $grnVoucherSettings['shop_address'] ?? 'No. 42 Main Street, Colombo 03, Sri Lanka' }} &bull; Tel: {{ $grnVoucherSettings['shop_phone'] ?? '+94 11 234 5678' }}
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
                <!-- Header Info Grid: Supplier Search Selector & Expected Delivery -->
                <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 14px; align-items: start; background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px;">
                  <!-- Supplier / Vendor Searchable Selector -->
                  <div class="po-field" style="margin: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                      <label class="po-label" for="newPoSuppSearchInput" style="margin: 0; font-weight: 700;">
                        <i class="fa-solid fa-truck-field" style="color: #1677ff; margin-right: 4px;"></i>
                        <span>Supplier / Vendor <span class="req">*</span></span>
                      </label>
                      <button type="button" id="poQuickAddSupplierBtn" style="background: none; border: none; color: #1677ff; font-size: 11.5px; font-weight: 700; cursor: pointer; padding: 0;" title="Register a new supplier">
                        <i class="fa-solid fa-user-plus"></i> + New
                      </button>
                    </div>

                    <div id="newPoSuppSearchGroup" style="position: relative;">
                      <div style="position: relative; display: flex; align-items: center;">
                        <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; color: var(--text-muted); font-size: 12.5px; z-index: 2; pointer-events: none;"></i>
                        <input type="text" id="newPoSuppSearchInput" name="po_supplier_search" class="grn-inline-input" placeholder="Search supplier by name or phone (or click to browse)..." autocomplete="off" style="padding-left: 34px; padding-right: 36px; height: 40px; width: 100%; border-radius: 8px;">
                        <input type="hidden" id="newPoSupplier" name="po_supplier" value="">
                        <input type="hidden" id="newPoSupplierId" name="po_supplier_id" value="">
                        <button type="button" id="newPoToggleSuppDropdownBtn" style="position: absolute; right: 6px; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 6px; z-index: 2;" title="Browse suppliers">
                          <i class="fa-solid fa-chevron-down" id="newPoSuppDropdownIcon"></i>
                        </button>
                      </div>
                      <div id="newPoSuppDropdown" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: var(--surface, #fff); border: 1px solid var(--border); border-radius: 8px; max-height: 220px; overflow-y: auto; z-index: 1050; box-shadow: 0 10px 25px rgba(0,0,0,0.15);"></div>
                    </div>

                    <!-- Selected Supplier Card -->
                    <div id="newPoSelectedSupplierCard" style="display: none; align-items: center; justify-content: space-between; background: var(--surface, #fff); border: 1.5px solid #1677ff; border-radius: 8px; padding: 6px 10px; min-height: 40px; box-sizing: border-box;">
                      <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
                        <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(22, 119, 255, 0.12); color: #1677ff; display: grid; place-items: center; font-size: 12px; flex-shrink: 0;">
                          <i class="fa-solid fa-truck-fast"></i>
                        </div>
                        <div style="min-width: 0;">
                          <div id="newPoSelectedSuppName" style="font-weight: 700; font-size: 13px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Supplier Name</div>
                          <div id="newPoSelectedSuppMeta" style="font-size: 11px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">077 123 4567 • SUP-001</div>
                        </div>
                      </div>
                      <button type="button" id="newPoClearSupplierBtn" class="ant-btn ant-btn-default ant-btn-sm" style="height: 26px; font-size: 11px; padding: 0 8px; flex-shrink: 0;">
                        <i class="fa-solid fa-rotate"></i> Change
                      </button>
                    </div>
                  </div>

                  <!-- Expected Delivery Date -->
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="newPoExpectedDate" style="margin-bottom: 6px; font-weight: 700; display: block;">
                      <i class="fa-solid fa-calendar-check" style="color: #1677ff; margin-right: 4px;"></i>
                      <span>Expected Delivery <span class="req">*</span></span>
                    </label>
                    <input type="date" id="newPoExpectedDate" name="po_expected_date" class="grn-inline-input" style="height: 40px; width: 100%; border-radius: 8px;" required>
                  </div>
                </div>

                <!-- Order Instructions / Notes -->
                <div class="po-field" style="margin: 0;">
                  <label class="po-label" for="newPoRemarks" style="font-weight: 700;">
                    <i class="fa-solid fa-note-sticky" style="color: #1677ff; margin-right: 4px;"></i>
                    <span>Order Instructions / Notes</span>
                  </label>
                  <input type="text" id="newPoRemarks" name="po_remarks" maxlength="255" class="grn-inline-input" style="height: 38px; border-radius: 8px;" placeholder="Urgent order, standard packaging, batch requirement...">
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

                  <!-- Category & Subcategory Filters for Easy Material Item Search -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                    <div class="po-field" style="margin: 0;">
                      <label class="po-label" for="newPoItemCategoryFilter" style="margin-bottom: 4px; font-size: 11.5px; font-weight: 700;">
                        <i class="fa-solid fa-layer-group" style="color: #1677ff; margin-right: 4px;"></i> Category
                      </label>
                      <select id="newPoItemCategoryFilter" name="po_item_category_filter" class="grn-inline-input" style="height: 36px; width: 100%; border-radius: 6px; font-size: 12.5px;">
                        <option value="ALL">All Categories</option>
                      </select>
                    </div>
                    <div class="po-field" style="margin: 0;">
                      <label class="po-label" for="newPoItemSubcategoryFilter" style="margin-bottom: 4px; font-size: 11.5px; font-weight: 700;">
                        <i class="fa-solid fa-tags" style="color: #1677ff; margin-right: 4px;"></i> Subcategory
                      </label>
                      <select id="newPoItemSubcategoryFilter" name="po_item_subcategory_filter" class="grn-inline-input" style="height: 36px; width: 100%; border-radius: 6px; font-size: 12.5px; opacity: 0.6; cursor: not-allowed;" disabled>
                        <option value="ALL">-- Select Category First --</option>
                      </select>
                    </div>
                  </div>

                  <!-- Database Item Search & Add Selector -->
                  <div style="margin-bottom: 12px; position: relative;">
                    <label class="po-label" for="newPoItemSearchInput" style="margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
                      <span><i class="fa-solid fa-magnifying-glass" style="color: #1677ff;"></i> Search &amp; Add Material Item <span class="req" style="color: #ff4d4f;">*</span></span>
                      <span class="hint" id="newPoItemSearchHint" style="font-size: 11px; color: var(--text-muted);">Type SKU code or material name to load &amp; add directly</span>
                    </label>
                    <div style="position: relative; display: flex; align-items: center;">
                      <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 11px; color: var(--text-muted); font-size: 13px; z-index: 2;"></i>
                      <input type="text" id="newPoItemSearchInput" name="po_item_search" aria-label="Search material items from database" class="grn-inline-input" style="padding-left: 34px; padding-right: 145px; width: 100%; height: 38px; border-radius: 6px;" placeholder="Search material item from database by SKU code or name..." autocomplete="off">
                      <span id="newPoItemSearchLoading" style="display: none; position: absolute; right: 150px; top: 11px; color: #1677ff; font-size: 13px; z-index: 2;">
                        <i class="fa-solid fa-spinner fa-spin"></i>
                      </span>
                      <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" id="newPoAddRowBtn" style="position: absolute; right: 4px; top: 4px; bottom: 4px; height: 30px; display: inline-flex; align-items: center; gap: 6px; padding: 0 12px; font-size: 12px; font-weight: 600; border-radius: 4px; z-index: 3;" title="View items & add item line">
                        <i class="fa-solid fa-plus"></i> Add Item Line
                      </button>
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
                                  Click the <strong>"Add Item Line"</strong> button above to select material items, enter quantities, and specify estimated unit costs.
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
                  @php
                    $grnVoucherSettings = \Modules\UI\Http\Controllers\SettingsController::getAppSettings();
                    $grnBrandParts = explode(' ', trim($grnVoucherSettings['shop_name'] ?? 'Sanjeewa Advertising'), 2);
                  @endphp
                  <!-- Header -->
                  <div class="grn-voucher-header">
                    <div class="grn-voucher-brand">
                      <strong>{{ $grnBrandParts[0] ?? 'Sanjeewa' }}</strong>
                      <span>{{ strtoupper($grnBrandParts[1] ?? 'ADVERTISING & PRINTING') }}</span>
                      <div style="font-size: 11px; color: #666; margin-top: 3px;">
                        {{ $grnVoucherSettings['shop_address'] ?? 'No. 42 Main Street, Colombo 03, Sri Lanka' }} &bull; Tel: {{ $grnVoucherSettings['shop_phone'] ?? '+94 11 234 5678' }}
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
            <div class="po-modal" style="max-width: 520px; max-height: 90vh;">
              <div class="po-modal-header">
                <h3 id="registerSupplierModalTitle"><i class="fa-solid fa-truck-field" style="color: #1677ff;"></i> Register New Supplier / Vendor</h3>
                <button type="button" class="modal-close-btn" data-close-grn-modal="registerSupplierModal" aria-label="Close modal">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div class="po-modal-body" style="gap: 14px;">
                <!-- Supplier / Company Name -->
                <div class="po-field" style="margin: 0;">
                  <label class="po-label" for="newSupName">
                    <span>Company / Business Name <span class="req">*</span></span>
                  </label>
                  <input type="text" id="newSupName" name="name" maxlength="100" autocomplete="organization" class="grn-inline-input" placeholder="E.g. PrintCare Lanka (Pvt) Ltd" required>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <!-- Phone Number / Mobile -->
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="newSupPhone">
                      <span>Mobile / Phone No <span class="req">*</span></span>
                    </label>
                    <input type="text" id="newSupPhone" name="mobile" maxlength="15" autocomplete="tel" class="grn-inline-input" placeholder="E.g. 0771234567" required>
                  </div>

                  <!-- Email -->
                  <div class="po-field" style="margin: 0;">
                    <label class="po-label" for="newSupEmail">
                      <span>Email Address</span>
                    </label>
                    <input type="email" id="newSupEmail" name="email" maxlength="100" autocomplete="email" class="grn-inline-input" placeholder="E.g. orders@supplier.lk">
                  </div>
                </div>

                <!-- Bank Account -->
                <div class="po-field" style="margin: 0;">
                  <label class="po-label" for="newSupBankAccount">
                    <span>Bank Account Details</span>
                  </label>
                  <input type="text" id="newSupBankAccount" name="bank_account" maxlength="50" class="grn-inline-input" placeholder="E.g. BOC - 0019283746 (Colombo 03)">
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

          <!-- ==================================================================
               GRN / PO ACTION CONFIRMATION MODAL (APPROVE / CANCEL / RESTORE)
               ================================================================== -->
          <div class="po-modal-overlay" id="grnActionConfirmModal" aria-hidden="true">
            <div class="po-modal" style="max-width: 440px;" role="dialog" aria-modal="true" aria-labelledby="grnConfirmModalTitle">
              <div class="po-modal-header">
                <h3 id="grnConfirmModalTitle">
                  <i id="grnConfirmTitleIcon" class="fa-solid fa-circle-check" style="color: #16a34a;"></i>
                  <span id="grnConfirmTitleText">Confirm Action</span>
                </h3>
                <button type="button" class="modal-close-btn" id="grnConfirmCloseBtn" aria-label="Close">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div class="po-modal-body" style="gap: 12px;">
                <div id="grnConfirmBanner" style="display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border-radius: 10px; background: rgba(22, 163, 74, 0.08); border: 1px solid rgba(22, 163, 74, 0.22);">
                  <i id="grnConfirmBannerIcon" class="fa-solid fa-circle-check" style="color: #16a34a; font-size: 20px; margin-top: 2px;"></i>
                  <div>
                    <div style="font-size: 13.5px; font-weight: 700; color: var(--text, #0f172a);">
                      <span id="grnConfirmQuestionPrefix">Are you sure you want to proceed with</span>
                      <span id="grnConfirmTargetLabel" style="color: #16a34a;">this record</span>?
                    </div>
                    <div id="grnConfirmSubtext" style="font-size: 12px; color: var(--text-muted, #64748b); margin-top: 4px;">
                      This will update the status immediately.
                    </div>
                  </div>
                </div>
              </div>

              <div class="po-modal-footer">
                <button type="button" class="ant-btn ant-btn-default" id="grnConfirmCancelBtn">
                  Close
                </button>
                <button type="button" class="ant-btn ant-btn-primary" id="grnConfirmSubmitBtn">
                  <i class="fa-solid fa-check"></i> Confirm
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

