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

          {{-- GRN Page Modals --}}
          @include('ui::layouts.modals.grn.create-grn-modal')

          @include('ui::layouts.modals.grn.view-grn-modal')

          @include('ui::layouts.modals.grn.create-po-modal')
          @include('ui::layouts.modals.grn.view-po-modal')
          @include('ui::layouts.modals.grn.register-supplier-modal')
          @include('ui::layouts.modals.grn.grn-confirm-modal')

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

