@extends('ui::layouts.master')

@section('title', 'Place Order')
@section('page_title', 'Place Order & Management')
@section('breadcrumb')Workspace / Sales / <span>Place Order</span>@endsection

@push('styles')
    {{ module_vite('build-ui', 'resources/assets/css/core.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/place-order.css') }}
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
             MODULE 2: PLACE ORDER (Order Creation, Orders Panel, Installments)
             ================================================================== -->
        <div class="app-module" id="module-place-order" data-module="place-order">
          <div class="po-container">

            <!-- Banner with KPIs -->
            <div class="po-header-banner">
              <div class="po-banner-content">
                <h2>
                  <span class="badge-icon"><i class="fa-solid fa-cart-plus"></i></span>
                  Place New Printing Order
                </h2>
                <p>Create custom printing orders, configure square-footage pricing, and manage installment payments.</p>
              </div>

              <div class="po-kpi-row">
                <div class="po-kpi-pill">
                  <i class="fa-solid fa-layer-group" style="color: var(--blue);"></i>
                  <div>
                    <div class="kpi-num" id="kpiTotalOrders">0</div>
                    <div class="kpi-label">Total Orders</div>
                  </div>
                </div>
                <div class="po-kpi-pill orange-pill">
                  <i class="fa-solid fa-spinner" style="color: #faad14;"></i>
                  <div>
                    <div class="kpi-num" id="kpiPendingOrders" style="color: #faad14;">0</div>
                    <div class="kpi-label">In Production</div>
                  </div>
                </div>
                <div class="po-kpi-pill">
                  <i class="fa-solid fa-wallet" style="color: var(--green);"></i>
                  <div>
                    <div class="kpi-num" id="kpiTotalRevenue">Rs. 0</div>
                    <div class="kpi-label">Total Volume</div>
                  </div>
                </div>
                <div class="po-kpi-pill">
                  <i class="fa-solid fa-hand-holding-dollar" style="color: var(--red);"></i>
                  <div>
                    <div class="kpi-num" id="kpiOutstandingBalance" style="color: var(--red);">Rs. 0</div>
                    <div class="kpi-label">Outstanding</div>
                  </div>
                </div>
                <button type="button" class="po-btn po-btn-primary" id="openCreateOrderModalBannerBtn" onclick="window.placeOrderApp?.openModal('createOrderModal')" style="height: 36px; padding: 0 16px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; margin-left: 6px;">
                  <i class="fa-solid fa-plus"></i> Place New Order
                </button>
              </div>
            </div>

            <!-- Order Management Panel -->
            @include('ui::layouts.pages.place-order.tabs.orders-management')

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
    {{ module_vite('build-ui', 'resources/assets/js/place-order.js') }}
@endpush

