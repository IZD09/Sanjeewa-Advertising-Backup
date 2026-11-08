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
                                <h2><span class="badge-icon" style="background: var(--blue);"><i
                                            class="fa-solid fa-users"></i></span> Customer Accounts Directory</h2>
                                <p>Manage customer profiles, credit histories, corporate accounts, and contact records.</p>
                            </div>
                            <button type="button" class="po-btn po-btn-primary"
                                onclick="window.customersApp?.openModal('addCustomerModal')">
                                <i class="fa-solid fa-user-plus"></i> Register Customer
                            </button>
                        </div>

                        <!-- Search Toolbar -->
                        <div class="po-table-toolbar" style="margin-bottom: 20px;">
                            <div class="po-search-box" style="max-width: 450px;">
                                <i class="fa-solid fa-magnifying-glass"></i>
                                <input type="text" id="customerListSearchInput"
                                    placeholder="Search customer by name, mobile, or email...">
                            </div>
                        </div>

                        <!-- Dynamic Customer Cards Grid -->
                        <div class="cust-grid" id="customersCardsGrid">
                            <!-- Dynamically populated via CustomerCardHandler & CustomerCardBuilder -->
                        </div>

                        <!-- Pagination (20 cards per page) -->
                        <div class="po-pagination" style="margin-top: 24px;">
                            <div id="customerPaginationInfo">Showing 1-20 customers</div>
                            <div class="pagination-controls" id="customerPaginationControls"></div>
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
    {{ module_vite('build-ui', 'resources/assets/js/customers.js') }}
@endpush
