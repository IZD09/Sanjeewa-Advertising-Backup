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
                  <i class="fa-solid fa-spinner" style="color: var(--po-orange);"></i>
                  <div>
                    <div class="kpi-num" id="kpiPendingOrders">0</div>
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
                <button type="button" class="po-btn po-btn-primary" id="openCreateOrderModalBannerBtn" onclick="window.placeOrderApp?.openModal('createOrderModal')" style="height: 42px; padding: 0 18px; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(255, 90, 31, 0.35); margin-left: 6px;">
                  <i class="fa-solid fa-plus"></i> Place New Order
                </button>
              </div>
            </div>

            <!-- Order Management Panel -->
            <section class="po-card">
              <div class="po-card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div>
                  <h2 class="po-card-title">
                    <i class="fa-solid fa-list-check"></i> Orders Management Panel
                  </h2>
                  <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
                    Manage existing printing jobs, view audit details, record multiple installments, and print receipts
                  </div>
                </div>
                <button type="button" class="po-btn po-btn-primary" id="openCreateOrderModalBtn" onclick="window.placeOrderApp?.openModal('createOrderModal')" style="display: inline-flex; align-items: center; gap: 8px; height: 38px; font-size: 12.5px;">
                  <i class="fa-solid fa-plus"></i> Create New Order
                </button>
              </div>

              <!-- Table Search & Filter Toolbar -->
              <div class="po-table-toolbar">
                <div class="po-search-box">
                  <i class="fa-solid fa-magnifying-glass"></i>
                  <input type="text" id="orderSearchInput" placeholder="Search by Order ID, Customer, Phone, Product...">
                </div>

                <div class="po-filter-group">
                  <select id="orderStatusFilter" class="po-filter-select" aria-label="Filter by order status">
                    <option value="ALL">All Order Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <select id="orderPaymentFilter" class="po-filter-select" aria-label="Filter by payment status">
                    <option value="ALL">All Payment Statuses</option>
                    <option value="Paid">Fully Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>
              </div>

              <!-- Responsive Order Table -->
              <div class="po-table-responsive">
                <table class="po-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Name</th>
                      <th>Product & Specs</th>
                      <th>Qty</th>
                      <th>Total (Rs.)</th>
                      <th>Payment Status</th>
                      <th>Deadline</th>
                      <th>Order Status</th>
                      <th>Assigned</th>
                      <th style="text-align: center;">Actions</th>
                    </tr>
                  </thead>
                  <tbody id="ordersTableBody">
                    <!-- Dynamically populated rows -->
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <div class="po-pagination">
                <div id="paginationInfo">Showing 1-10 orders</div>
                <div class="pagination-controls" id="paginationControls"></div>
              </div>
            </section>

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

