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

            <!-- VIEW A: ALL GRN DIRECTORY & TABLE VIEW -->
            @include('ui::layouts.pages.grn.tabs.all-grn-records')

            <!-- VIEW B: PURCHASE ORDERS (PO) DIRECTORY & TRACKING VIEW -->
            @include('ui::layouts.pages.grn.tabs.purchase-orders')

            <!-- VIEW D: SUPPLIERS DIRECTORY VIEW -->
            @include('ui::layouts.pages.grn.tabs.suppliers-directory')

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

