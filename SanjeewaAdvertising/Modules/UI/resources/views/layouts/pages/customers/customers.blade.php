@extends('ui::layouts.master')

@section('title', 'Customer Accounts Directory')
@section('page_title', 'Customer Directory')
@section('breadcrumb')Workspace / Sales / <span>Customers</span>@endsection

@push('styles')
    {{ module_vite('build-ui', 'resources/assets/css/core.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/modules.css') }}
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
             MODULE 3: CUSTOMERS DIRECTORY
             ================================================================== -->
        <div class="app-module" id="module-customers" data-module="customers">
          <div class="module-container">
            <div class="po-header-banner">
              <div class="po-banner-content">
                <h2><span class="badge-icon" style="background: var(--blue);"><i class="fa-solid fa-users"></i></span> Customer Accounts Directory</h2>
                <p>Manage customer profiles, credit histories, corporate accounts, and contact records.</p>
              </div>
              <button type="button" class="po-btn po-btn-primary" onclick="window.placeOrderApp.openModal('addCustomerModal')">
                <i class="fa-solid fa-user-plus"></i> Register Customer
              </button>
            </div>

            <div class="cust-grid" id="customersCardsGrid">
              <!-- Customer cards pre-populated -->
              <div class="customer-card-box">
                <div class="cust-box-top">
                  <div class="cust-avatar">KJ</div>
                  <div class="cust-box-meta">
                    <strong>Kasun Jayasundara</strong>
                    <span><i class="fa-solid fa-phone"></i> 0771234567</span>
                    <span><i class="fa-solid fa-location-dot"></i> Colombo 03</span>
                  </div>
                  <span class="cust-item-badge">Regular</span>
                </div>
                <div class="cust-stats-row">
                  <div class="cust-stat-item"><span>Total Orders</span><strong>8 Orders</strong></div>
                  <div class="cust-stat-item"><span>Total Spent</span><strong>Rs. 74,500</strong></div>
                </div>
                <div class="cust-card-actions">
                  <a href="{{ route('ui.place-order') }}" class="po-btn po-btn-secondary" style="height: 32px; font-size: 11px;">
                    <i class="fa-solid fa-cart-plus"></i> New Order
                  </a>
                </div>
              </div>

              <div class="customer-card-box">
                <div class="cust-box-top">
                  <div class="cust-avatar" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">DS</div>
                  <div class="cust-box-meta">
                    <strong>Dilhani Senaratne</strong>
                    <span><i class="fa-solid fa-phone"></i> 0719876543</span>
                    <span><i class="fa-solid fa-location-dot"></i> Kandy</span>
                  </div>
                  <span class="cust-item-badge" style="background: var(--green-subtle); color: var(--green);">VIP</span>
                </div>
                <div class="cust-stats-row">
                  <div class="cust-stat-item"><span>Total Orders</span><strong>14 Orders</strong></div>
                  <div class="cust-stat-item"><span>Total Spent</span><strong>Rs. 182,000</strong></div>
                </div>
                <div class="cust-card-actions">
                  <a href="{{ route('ui.place-order') }}" class="po-btn po-btn-secondary" style="height: 32px; font-size: 11px;">
                    <i class="fa-solid fa-cart-plus"></i> New Order
                  </a>
                </div>
              </div>

              <div class="customer-card-box">
                <div class="cust-box-top">
                  <div class="cust-avatar" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">SW</div>
                  <div class="cust-box-meta">
                    <strong>Sajith Warnakula</strong>
                    <span><i class="fa-solid fa-phone"></i> 0755554321</span>
                    <span><i class="fa-solid fa-location-dot"></i> Gampaha</span>
                  </div>
                  <span class="cust-item-badge" style="background: var(--purple-subtle); color: var(--purple);">Corporate</span>
                </div>
                <div class="cust-stats-row">
                  <div class="cust-stat-item"><span>Total Orders</span><strong>22 Orders</strong></div>
                  <div class="cust-stat-item"><span>Total Spent</span><strong>Rs. 320,400</strong></div>
                </div>
                <div class="cust-card-actions">
                  <a href="{{ route('ui.place-order') }}" class="po-btn po-btn-secondary" style="height: 32px; font-size: 11px;">
                    <i class="fa-solid fa-cart-plus"></i> New Order
                  </a>
                </div>
              </div>

              <div class="customer-card-box">
                <div class="cust-box-top">
                  <div class="cust-avatar" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">NW</div>
                  <div class="cust-box-meta">
                    <strong>Nuwan Weerasinghe</strong>
                    <span><i class="fa-solid fa-phone"></i> 0781122334</span>
                    <span><i class="fa-solid fa-location-dot"></i> Kurunegala</span>
                  </div>
                  <span class="cust-item-badge" style="background: var(--purple-subtle); color: var(--purple);">Corporate</span>
                </div>
                <div class="cust-stats-row">
                  <div class="cust-stat-item"><span>Total Orders</span><strong>6 Orders</strong></div>
                  <div class="cust-stat-item"><span>Total Spent</span><strong>Rs. 68,000</strong></div>
                </div>
                <div class="cust-card-actions">
                  <a href="{{ route('ui.place-order') }}" class="po-btn po-btn-secondary" style="height: 32px; font-size: 11px;">
                    <i class="fa-solid fa-cart-plus"></i> New Order
                  </a>
                </div>
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
    {{ module_vite('build-ui', 'resources/assets/js/place-order.js') }}
@endpush

