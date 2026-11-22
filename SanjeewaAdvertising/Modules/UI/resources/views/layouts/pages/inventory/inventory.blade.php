@extends('ui::layouts.master')

@section('title', 'Inventory & Stock Management')
@section('page_title', 'Stock Management')
@section('breadcrumb')Workspace / Inventory / <span>Stock Management</span>@endsection

@push('styles')
    {{ module_vite('build-ui', 'resources/assets/css/core.css') }}
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

            <!-- TAB PANE 1: MATERIAL STOCK INVENTORY -->
            @include('ui::layouts.pages.inventory.tabs.material-stock-inventory')

            <!-- TAB PANE 2: STOCK MOVEMENTS & AUDIT LOG -->
            @include('ui::layouts.pages.inventory.tabs.stock-movements')

            <!-- TAB PANE 3: CATEGORIES & SUBCATEGORIES -->
            @include('ui::layouts.pages.inventory.tabs.categories')

            <!-- TAB PANE 4: STOCK ITEMS & BRANDS REGISTRY -->
            @include('ui::layouts.pages.inventory.tabs.stock-items')

          </div>

          {{-- Inventory Page Modals --}}
          @include('ui::layouts.modals.inventory.view-stock-details-modal')
          @include('ui::layouts.modals.inventory.select-brands-modal')
          @include('ui::layouts.modals.inventory.adjust-stock-modal')
          @include('ui::layouts.modals.inventory.add-stock-modal')
          @include('ui::layouts.modals.grn.view-grn-modal')



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
        use Modules\Inventory\Services\InventoryCategoryService;

        $initialCategoriesTabData = app(InventoryCategoryService::class)->getCategoriesTabData();
    @endphp
    <script id="inventory-categories-data" type="application/json">@json($initialCategoriesTabData)</script>
    <script>
        window.__INITIAL_INVENTORY_CATEGORIES_DATA__ = JSON.parse(document.getElementById('inventory-categories-data')?.textContent || 'null');
    </script>
    {{ module_vite('build-ui', 'resources/assets/js/core.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/sidebar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/topbar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/inventory.js') }}
@endpush

