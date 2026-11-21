@extends('ui::layouts.master')

@section('title', 'Payments Management Hub')
@section('page_title', 'Payments & Settlements Hub')
@section('breadcrumb')Workspace / Finance / <span>Payments</span>@endsection

@push('styles')
    {{ module_vite('build-ui', 'resources/assets/css/core.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/payments.css') }}
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

<div class="app-module" id="module-payments" data-module="payments">
  <div class="payments-container">

    <!-- Top Page Header -->
    <div class="pay-header">
      <div class="pay-title-wrap">
        <h2>
          <i class="fa-solid fa-money-bill-transfer"></i>
          Payments &amp; Settlements Hub
        </h2>
        <p class="pay-subtitle">
          Three-Channel Settlements: <strong>1. Invoice Payments</strong> (Job Print Orders), <strong>2. GRN Payments</strong> (Stock Purchases) &amp; <strong>3. Operating Expenses</strong> (Monthly Utility Bills)
        </p>
      </div>
      <div class="pay-header-actions">
        <button type="button" class="po-btn pay-action-btn pay-btn-invoice" id="btnOpenRecordInvoicePayment" title="Record Invoice Payment (Job Print Orders)">
          <i class="fa-solid fa-file-invoice-dollar"></i> Record invoice payment
        </button>
        <button type="button" class="po-btn pay-action-btn pay-btn-grn" id="btnOpenRecordGrnPayment" title="Record GRN Payment (Stock Purchases)">
          <i class="fa-solid fa-boxes-packing"></i> Record grn payment
        </button>
        <button type="button" class="po-btn pay-action-btn pay-btn-bill" id="btnOpenRecordBillPayment" title="Record Bill Payment (Operating Expenses)">
          <i class="fa-solid fa-bolt-lightning"></i> Record bill payment
        </button>
      </div>
    </div>

    <!-- Navigation Tabs Switcher -->
    <div class="payments-tab-nav">
      <button type="button" class="pay-tab-btn active" data-tab="invoice">
        <i class="fa-solid fa-file-invoice-dollar"></i>
        1. Invoice Payments (Job Invoices)
        <span class="tab-count" id="tabBadgeInvoiceCount">0</span>
      </button>
      <button type="button" class="pay-tab-btn" data-tab="collections" id="tabBtnCollections">
        <i class="fa-solid fa-hand-holding-dollar" style="color: #ef4444;"></i>
        Collectable Payments
        <span class="tab-count tab-count-alert" id="tabBadgeCollectionsCount">0</span>
      </button>
      <button type="button" class="pay-tab-btn grn-tab" data-tab="grn">
        <i class="fa-solid fa-boxes-packing"></i>
        2. GRN Payments (Stock Items)
        <span class="tab-count" id="tabBadgeGrnCount">0</span>
      </button>
      <button type="button" class="pay-tab-btn exp-tab" data-tab="expenses" id="tabBtnExpenses">
        <i class="fa-solid fa-bolt-lightning" style="color: #f59e0b;"></i>
        3. Operating Expenses (Utility Bills)
        <span class="tab-count tab-count-alert" id="tabBadgeExpensesCount">0</span>
      </button>
      <button type="button" class="pay-tab-btn" data-tab="overview">
        <i class="fa-solid fa-scale-balanced"></i>
        Reconciliation &amp; Overview
      </button>
    </div>

    <!-- TAB PANE 1: INVOICE PAYMENTS -->
    @include('ui::layouts.pages.payments.tabs.invoice-payments')

    <!-- TAB PANE 1B: COLLECTABLE PAYMENTS (PENDING RECEIVABLES) -->
    @include('ui::layouts.pages.payments.tabs.collectable-payments')

    <!-- TAB PANE 2: GRN PAYMENTS -->
    @include('ui::layouts.pages.payments.tabs.grn-payments')

    <!-- TAB PANE 3: OPERATING EXPENSES (MONTHLY UTILITY BILLS) -->
    @include('ui::layouts.pages.payments.tabs.operating-expenses')

    <!-- TAB PANE 4: OVERVIEW -->
    @include('ui::layouts.pages.payments.tabs.reconciliation-overview')

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
    {{ module_vite('build-ui', 'resources/assets/js/payments.js') }}
@endpush
