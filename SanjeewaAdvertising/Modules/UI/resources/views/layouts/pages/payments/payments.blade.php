@extends('ui::layouts.master')

@section('title', 'Payments Management Hub')
@section('page_title', 'Payments & Settlements Hub')
@section('breadcrumb')Workspace / Finance / <span>Payments</span>@endsection

@push('styles')
    {{ module_vite('build-ui', 'resources/assets/css/core.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/modules.css') }}
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
    <div id="payTabPaneInvoice" class="pay-tab-pane">
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="pay-metric-grid">
          <div class="pay-metric-card metric-blue">
            <div class="pay-metric-label">
              <span>Total Jobs Invoiced</span>
              <i class="fa-solid fa-file-invoice" style="color: var(--blue);"></i>
            </div>
            <div class="pay-metric-value" id="kpiInvTotalBilled">Rs. 0.00</div>
            <div class="pay-metric-sub">Gross billed job revenue</div>
          </div>

          <div class="pay-metric-card metric-green">
            <div class="pay-metric-label">
              <span>Total Collected Revenue</span>
              <i class="fa-solid fa-circle-check" style="color: #10b981;"></i>
            </div>
            <div class="pay-metric-value" id="kpiInvTotalCollected" style="color: #10b981;">Rs. 0.00</div>
            <div class="pay-metric-sub">Settled &amp; realized customer funds</div>
          </div>

          <div class="pay-metric-card metric-amber">
            <div class="pay-metric-label">
              <span>Pending Receivables</span>
              <i class="fa-solid fa-clock-rotate-left" style="color: #f59e0b;"></i>
            </div>
            <div class="pay-metric-value" id="kpiInvTotalPending" style="color: #ef4444;">Rs. 0.00</div>
            <div class="pay-metric-sub">Balance due from clients on collection</div>
          </div>

          <div class="pay-metric-card metric-purple">
            <div class="pay-metric-label">
              <span>Payment Stages Breakdown</span>
              <i class="fa-solid fa-chart-pie" style="color: #8b5cf6;"></i>
            </div>
            <div class="pay-metric-sub" id="kpiInvStageCounts" style="font-size: 13px; color: var(--text); margin-top: 6px;">
              <strong>0</strong> Complete | <strong>0</strong> Advance | <strong>0</strong> Pending
            </div>
            <div class="pay-metric-sub" style="font-size: 10.5px; margin-top: auto;">Complete / Advance / Pending</div>
          </div>
        </div>

        <div class="methods-bar-card">
          <div class="methods-bar-top">
            <span><i class="fa-solid fa-wallet" style="margin-right: 6px; color: var(--blue);"></i> Realized Collections by Payment Method</span>
            <span style="font-size: 11px; color: var(--text-muted);">Card • Cash • Check • Bank Transfer</span>
          </div>
          <div class="methods-badges-row">
            <div class="method-stat-box card-box">
              <i class="fa-solid fa-credit-card"></i>
              <div class="method-stat-meta">
                <span>Card Collections</span>
                <strong id="invMethodCardTotal">Rs. 0</strong>
              </div>
            </div>
            <div class="method-stat-box cash-box">
              <i class="fa-solid fa-money-bill-wave"></i>
              <div class="method-stat-meta">
                <span>Cash Payments</span>
                <strong id="invMethodCashTotal">Rs. 0</strong>
              </div>
            </div>
            <div class="method-stat-box check-box">
              <i class="fa-solid fa-money-check"></i>
              <div class="method-stat-meta">
                <span>Cheque Deposits</span>
                <strong id="invMethodCheckTotal">Rs. 0</strong>
              </div>
            </div>
            <div class="method-stat-box transfer-box">
              <i class="fa-solid fa-building-columns"></i>
              <div class="method-stat-meta">
                <span>Bank Transfers</span>
                <strong id="invMethodTransferTotal">Rs. 0</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="pay-filter-bar">
          <div class="pay-search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="payInvoiceSearch" class="pay-search-input" placeholder="Search by Job #, Invoice #, Customer or Ref...">
          </div>
          <div class="pay-filter-group">
            <select id="payInvoiceStatusFilter" class="pay-select" aria-label="Filter by Stage">
              <option value="ALL">All Stages</option>
              <option value="Complete Payment">Complete Payment</option>
              <option value="Pending Payment">Pending Payment</option>
              <option value="Advance Payment">Advance Payment</option>
            </select>
            <select id="payInvoiceMethodFilter" class="pay-select" aria-label="Filter by Method">
              <option value="ALL">All Methods</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="Check">Check</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
            <button type="button" class="pay-btn-reset" id="payInvoiceResetFilters">
              <i class="fa-solid fa-rotate-left"></i> Reset
            </button>
          </div>
        </div>

        <div class="pay-table-card">
          <div class="pay-table-wrapper">
            <table class="pay-table">
              <thead>
                <tr>
                  <th>Invoice / Date</th>
                  <th>Customer / Ref</th>
                  <th>Payment Stage</th>
                  <th>Method</th>
                  <th>Total Bill</th>
                  <th>Paid Amount</th>
                  <th>Balance Due</th>
                  <th>Narration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="payInvoiceTableBody">
              </tbody>
            </table>
          </div>

          <!-- Invoice Payments Pagination -->
          <div class="po-pagination" id="payInvoicePaginationBar">
            <div class="pagination-info" id="payInvoicePaginationInfo">Showing 0 invoices</div>
            <div class="pagination-controls" id="payInvoicePaginationControls"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB PANE 2: GRN PAYMENTS -->
    <div id="payTabPaneGrn" class="pay-tab-pane" style="display: none;">
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="pay-metric-grid">
          <div class="pay-metric-card metric-green">
            <div class="pay-metric-label">
              <span>Total GRN Stock Billed</span>
              <i class="fa-solid fa-boxes-packing" style="color: #10b981;"></i>
            </div>
            <div class="pay-metric-value" id="kpiGrnTotalBilled">Rs. 0.00</div>
            <div class="pay-metric-sub">Total inventory consignments received</div>
          </div>

          <div class="pay-metric-card metric-blue">
            <div class="pay-metric-label">
              <span>Paid to Suppliers</span>
              <i class="fa-solid fa-circle-check" style="color: var(--blue);"></i>
            </div>
            <div class="pay-metric-value" id="kpiGrnTotalPaid" style="color: var(--blue);">Rs. 0.00</div>
            <div class="pay-metric-sub">Company disbursements cleared</div>
          </div>

          <div class="pay-metric-card metric-amber">
            <div class="pay-metric-label">
              <span>Outstanding Payables</span>
              <i class="fa-solid fa-hand-holding-dollar" style="color: #f59e0b;"></i>
            </div>
            <div class="pay-metric-value" id="kpiGrnTotalDue" style="color: #ef4444;">Rs. 0.00</div>
            <div class="pay-metric-sub">Credit terms due to suppliers</div>
          </div>

          <div class="pay-metric-card metric-purple">
            <div class="pay-metric-label">
              <span>Payment Stages Breakdown</span>
              <i class="fa-solid fa-chart-pie" style="color: #8b5cf6;"></i>
            </div>
            <div class="pay-metric-sub" id="kpiGrnStageCounts" style="font-size: 13px; color: var(--text); margin-top: 6px;">
              <strong>0</strong> Complete | <strong>0</strong> Advance | <strong>0</strong> Pending
            </div>
            <div class="pay-metric-sub" style="font-size: 10.5px; margin-top: auto;">Complete / Advance / Pending</div>
          </div>
        </div>

        <div class="methods-bar-card">
          <div class="methods-bar-top">
            <span><i class="fa-solid fa-wallet" style="margin-right: 6px; color: #10b981;"></i> Supplier Disbursements by Payment Method</span>
            <span style="font-size: 11px; color: var(--text-muted);">Card • Cash • Check • Bank Transfer</span>
          </div>
          <div class="methods-badges-row">
            <div class="method-stat-box card-box">
              <i class="fa-solid fa-credit-card"></i>
              <div class="method-stat-meta">
                <span>Corporate Card</span>
                <strong id="grnMethodCardTotal">Rs. 0</strong>
              </div>
            </div>
            <div class="method-stat-box cash-box">
              <i class="fa-solid fa-money-bill-wave"></i>
              <div class="method-stat-meta">
                <span>Petty Cash / COD</span>
                <strong id="grnMethodCashTotal">Rs. 0</strong>
              </div>
            </div>
            <div class="method-stat-box check-box">
              <i class="fa-solid fa-money-check"></i>
              <div class="method-stat-meta">
                <span>Company Cheques</span>
                <strong id="grnMethodCheckTotal">Rs. 0</strong>
              </div>
            </div>
            <div class="method-stat-box transfer-box">
              <i class="fa-solid fa-building-columns"></i>
              <div class="method-stat-meta">
                <span>Bank Transfers</span>
                <strong id="grnMethodTransferTotal">Rs. 0</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="pay-filter-bar">
          <div class="pay-search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="payGrnSearch" class="pay-search-input" placeholder="Search by GRN #, PO #, Supplier, Ref or Stock item...">
          </div>
          <div class="pay-filter-group">
            <select id="payGrnStatusFilter" class="pay-select" aria-label="Filter by Stage">
              <option value="ALL">All Stages</option>
              <option value="Complete Payment">Complete Payment</option>
              <option value="Pending Payment">Pending Payment</option>
              <option value="Advance Payment">Advance Payment</option>
            </select>
            <select id="payGrnMethodFilter" class="pay-select" aria-label="Filter by Method">
              <option value="ALL">All Methods</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="Check">Check</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
            <button type="button" class="pay-btn-reset" id="payGrnResetFilters">
              <i class="fa-solid fa-rotate-left"></i> Reset
            </button>
          </div>
        </div>

        <div class="pay-table-card">
          <div class="pay-table-wrapper">
            <table class="pay-table">
              <thead>
                <tr>
                  <th>GRN # / Date</th>
                  <th>Supplier / Category</th>
                  <th>Payment Stage</th>
                  <th>Method</th>
                  <th>Bill Total</th>
                  <th>Paid Amount</th>
                  <th>Balance Due</th>
                  <th>Narration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="payGrnTableBody">
              </tbody>
            </table>
          </div>

          <!-- GRN Payments Pagination -->
          <div class="po-pagination" id="payGrnPaginationBar">
            <div class="pagination-info" id="payGrnPaginationInfo">Showing 0 disbursements</div>
            <div class="pagination-controls" id="payGrnPaginationControls"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ====================================================================
         TAB PANE 3: OPERATING EXPENSES (MONTHLY UTILITY BILLS)
         ==================================================================== -->
    <div id="payTabPaneExpenses" class="pay-tab-pane" style="display: none;">
      <div style="display: flex; flex-direction: column; gap: 20px;">

        <!-- Month Navigation & Quick Actions Bar -->
        <div class="expense-month-bar">
          <div class="month-selector-wrap">
            <div class="month-selector-label">
              <i class="fa-regular fa-calendar-check" style="color: #f59e0b; font-size: 18px;"></i>
              <div>
                <strong>Monthly Operating Bills</strong>
                <span id="expCurrentMonthLabel">Billing Month: October 2026</span>
              </div>
            </div>
            <div class="month-controls">
              <select id="expMonthSelect" class="pay-select" style="min-width: 170px; font-weight: 700;">
                <option value="2026-10" selected>October 2026 (Current)</option>
                <option value="2026-09">September 2026</option>
                <option value="2026-08">August 2026</option>
                <option value="2026-11">November 2026</option>
                <option value="ALL">All Months</option>
              </select>
              <button type="button" class="po-btn po-btn-secondary" id="btnExpThisMonth" style="height: 38px; padding: 0 12px; font-size: 12px; border-radius: 8px;">
                <i class="fa-solid fa-calendar-day"></i> This Month
              </button>
            </div>
          </div>
          <div class="expense-bar-actions" style="display: flex; align-items: center; gap: 8px;">
            <button type="button" class="po-btn pay-action-btn pay-btn-bill" id="btnOpenRecordBillPaymentTab" title="Record Bill Payment">
              <i class="fa-solid fa-bolt-lightning"></i> Record bill payment
            </button>
            <button type="button" class="po-btn po-btn-secondary" id="btnOpenAddExpenseModal" style="height: 40px; font-weight: 700; border-radius: 9px;">
              <i class="fa-solid fa-circle-plus"></i> Add New Bill
            </button>
          </div>
        </div>

        <!-- KPI Cards Grid for Monthly Bills -->
        <div class="pay-metric-grid">
          <div class="pay-metric-card metric-purple">
            <div class="pay-metric-label">
              <span>Total Monthly Bills</span>
              <i class="fa-solid fa-file-invoice-dollar" style="color: #8b5cf6;"></i>
            </div>
            <div class="pay-metric-value" id="kpiExpTotalBilled">Rs. 0.00</div>
            <div class="pay-metric-sub" id="kpiExpTotalSub">Total overhead bills for this month</div>
          </div>

          <div class="pay-metric-card metric-green">
            <div class="pay-metric-label">
              <span>Paid Bills</span>
              <i class="fa-solid fa-circle-check" style="color: #10b981;"></i>
            </div>
            <div class="pay-metric-value" id="kpiExpTotalPaid" style="color: #10b981;">Rs. 0.00</div>
            <div class="pay-metric-sub" id="kpiExpPaidCount">0 bills settled</div>
          </div>

          <div class="pay-metric-card metric-amber" style="border-left: 4px solid #ef4444;">
            <div class="pay-metric-label">
              <span>Due at Month-End</span>
              <i class="fa-solid fa-hourglass-start" style="color: #ef4444;"></i>
            </div>
            <div class="pay-metric-value" id="kpiExpTotalPending" style="color: #ef4444;">Rs. 0.00</div>
            <div class="pay-metric-sub" id="kpiExpPendingCount" style="color: #ef4444; font-weight: 700;">0 bills pending settlement</div>
          </div>

          <div class="pay-metric-card metric-blue">
            <div class="pay-metric-label">
              <span>Settlement Progress</span>
              <i class="fa-solid fa-chart-pie" style="color: var(--blue);"></i>
            </div>
            <div class="pay-metric-value" id="kpiExpProgressPercent" style="color: var(--blue);">0%</div>
            <div class="pay-metric-sub">
              <div class="exp-progress-bar-wrap">
                <div class="exp-progress-bar-fill" id="kpiExpProgressBar" style="width: 0%;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Categories Summary Cards -->
        <div class="methods-bar-card" style="background: var(--surface);">
          <div class="methods-bar-top">
            <span><i class="fa-solid fa-layer-group" style="margin-right: 6px; color: #f59e0b;"></i> Overhead Bills by Category</span>
            <span style="font-size: 11px; color: var(--text-muted);">Electricity • Water • Internet • Rent • Maintenance</span>
          </div>
          <div class="methods-badges-row">
            <div class="method-stat-box" style="border-left: 3px solid #f59e0b;">
              <i class="fa-solid fa-bolt-lightning" style="color: #f59e0b;"></i>
              <div class="method-stat-meta">
                <span>Electricity (CEB/LECO)</span>
                <strong id="catTotalElectricity">Rs. 0</strong>
              </div>
            </div>
            <div class="method-stat-box" style="border-left: 3px solid #0284c7;">
              <i class="fa-solid fa-droplet" style="color: #0284c7;"></i>
              <div class="method-stat-meta">
                <span>Water Board (NWSDB)</span>
                <strong id="catTotalWater">Rs. 0</strong>
              </div>
            </div>
            <div class="method-stat-box" style="border-left: 3px solid #8b5cf6;">
              <i class="fa-solid fa-wifi" style="color: #8b5cf6;"></i>
              <div class="method-stat-meta">
                <span>Internet / Fiber</span>
                <strong id="catTotalInternet">Rs. 0</strong>
              </div>
            </div>
            <div class="method-stat-box" style="border-left: 3px solid #ec4899;">
              <i class="fa-solid fa-building" style="color: #ec4899;"></i>
              <div class="method-stat-meta">
                <span>Shop / Office Rent</span>
                <strong id="catTotalRent">Rs. 0</strong>
              </div>
            </div>
            <div class="method-stat-box" style="border-left: 3px solid #64748b;">
              <i class="fa-solid fa-wrench" style="color: #64748b;"></i>
              <div class="method-stat-meta">
                <span>Maintenance / Other</span>
                <strong id="catTotalOther">Rs. 0</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters Bar -->
        <div class="pay-filter-bar">
          <div class="pay-search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="payExpenseSearch" class="pay-search-input" placeholder="Search by Bill name, Provider, Account #, or Reference...">
          </div>
          <div class="pay-filter-group">
            <select id="payExpenseCategoryFilter" class="pay-select" aria-label="Filter by Category">
              <option value="ALL">All Categories</option>
              <option value="Electricity">Electricity</option>
              <option value="Water Board">Water Board</option>
              <option value="Internet & Fiber">Internet &amp; Fiber</option>
              <option value="Shop Rent">Shop Rent</option>
              <option value="Mobile & Telephone">Mobile &amp; Telephone</option>
              <option value="Maintenance & Other">Maintenance &amp; Other</option>
            </select>
            <select id="payExpenseStatusFilter" class="pay-select" aria-label="Filter by Status">
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending Only</option>
              <option value="Paid">Paid Only</option>
              <option value="Overdue">Overdue</option>
            </select>
            <button type="button" class="pay-btn-reset" id="payExpenseResetFilters">
              <i class="fa-solid fa-rotate-left"></i> Reset
            </button>
          </div>
        </div>

        <!-- Operating Expenses Table -->
        <div class="pay-table-card">
          <div class="pay-table-wrapper">
            <table class="pay-table">
              <thead>
                <tr>
                  <th>Bill Details &amp; Category</th>
                  <th>Account / Ref #</th>
                  <th>Month</th>
                  <th>Due Date</th>
                  <th>Bill Amount (Rs.)</th>
                  <th>Status</th>
                  <th>Settlement Info</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody id="payExpenseTableBody">
              </tbody>
            </table>
          </div>

          <!-- Operating Expenses Pagination -->
          <div class="po-pagination" id="payExpensePaginationBar">
            <div class="pagination-info" id="payExpensePaginationInfo">Showing 0 bills</div>
            <div class="pagination-controls" id="payExpensePaginationControls"></div>
          </div>
        </div>

      </div>
    </div>

    <!-- TAB PANE 4: OVERVIEW -->
    <div id="payTabPaneOverview" class="pay-tab-pane" style="display: none;">
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="pay-metric-grid">
          <div class="pay-metric-card" style="border-bottom: 3px solid #2563eb;">
            <div class="pay-metric-label">
              <span>Job Cash Inflow (Invoice Payments)</span>
              <i class="fa-solid fa-arrow-down-left" style="color: #2563eb;"></i>
            </div>
            <div class="pay-metric-value" id="ovJobCashInflow" style="color: #2563eb;">Rs. 0.00</div>
            <div class="pay-metric-sub">Money collected from printing jobs</div>
          </div>

          <div class="pay-metric-card" style="border-bottom: 3px solid #ef4444;">
            <div class="pay-metric-label">
              <span>Stock Cash Outflow (GRN Payments)</span>
              <i class="fa-solid fa-arrow-up-right" style="color: #ef4444;"></i>
            </div>
            <div class="pay-metric-value" id="ovGrnCashOutflow" style="color: #ef4444;">Rs. 0.00</div>
            <div class="pay-metric-sub">Money paid for stock materials &amp; supplies</div>
          </div>

          <div class="pay-metric-card" style="border-bottom: 3px solid #10b981;">
            <div class="pay-metric-label">
              <span>Net Operating Cash Position</span>
              <i class="fa-solid fa-vault" style="color: #10b981;"></i>
            </div>
            <div class="pay-metric-value" id="ovNetOperatingCash" style="color: #10b981;">Rs. 0.00</div>
            <div class="pay-metric-sub">Inflow minus Outflow surplus</div>
          </div>

          <div class="pay-metric-card" style="border-bottom: 3px solid #8b5cf6;">
            <div class="pay-metric-label">
              <span>Pending Receivables vs Payables</span>
              <i class="fa-solid fa-scale-balanced" style="color: #8b5cf6;"></i>
            </div>
            <div class="pay-metric-sub" style="font-size: 12px; margin-top: 6px;">
              Receivable: <strong id="ovReceivablesTotal">Rs. 0</strong><br>
              Payable: <strong id="ovPayablesTotal" style="color: #ef4444;">Rs. 0</strong>
            </div>
          </div>
        </div>

    <!-- Explanatory Cards (Tri-Channel Financial Architecture Guide) -->
    <div class="payments-concept-banner">
      <!-- Part 1: Invoice Payment -->
      <div class="concept-card invoice-concept">
        <div class="concept-top">
          <div class="concept-icon-title">
            <div class="concept-icon">
              <i class="fa-solid fa-file-invoice-dollar"></i>
            </div>
            <div class="concept-heading">
              <h3>1. Invoice Payment</h3>
              <p>Job / Customer Print Order Payments</p>
            </div>
          </div>
          <span class="concept-part-badge">Part 1</span>
        </div>
        <div class="concept-desc-box">
          <i class="fa-solid fa-circle-info" style="color: var(--blue); margin-right: 4px;"></i>
          <strong>Invoice payments refer to settlements received for customer print jobs.</strong>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">
            Customer print orders (flex banners, vinyl stickers, lightboxes, leaflets) payments collected from clients.
          </div>
        </div>
        <div class="concept-breakdown-row">
          <div>
            <div class="concept-group-title"><i class="fa-solid fa-flag-checkered"></i> Payment Stages — Click to Filter</div>
            <div class="concept-chips">
              <span class="concept-chip stage-complete" data-filter-type="stage" data-filter-val="Complete Payment" data-target="invoice" title="Filter by Complete Payment">
                <i class="fa-solid fa-circle-check"></i> Complete Payment
              </span>
              <span class="concept-chip stage-pending" data-filter-type="stage" data-filter-val="Pending Payment" data-target="invoice" title="Filter by Pending Payment">
                <i class="fa-solid fa-clock"></i> Pending Payment
              </span>
              <span class="concept-chip stage-advance" data-filter-type="stage" data-filter-val="Advance Payment" data-target="invoice" title="Filter by Advance Payment">
                <i class="fa-solid fa-hourglass-half"></i> Advance Payment
              </span>
            </div>
          </div>
          <div>
            <div class="concept-group-title"><i class="fa-solid fa-wallet"></i> Payment Methods — Click to Filter</div>
            <div class="concept-chips">
              <span class="concept-chip method-card" data-filter-type="method" data-filter-val="Card" data-target="invoice" title="Filter by Card">
                <i class="fa-solid fa-credit-card"></i> Card
              </span>
              <span class="concept-chip method-cash" data-filter-type="method" data-filter-val="Cash" data-target="invoice" title="Filter by Cash">
                <i class="fa-solid fa-money-bill-wave"></i> Cash
              </span>
              <span class="concept-chip method-check" data-filter-type="method" data-filter-val="Check" data-target="invoice" title="Filter by Cheque">
                <i class="fa-solid fa-money-check"></i> Check
              </span>
              <span class="concept-chip method-transfer" data-filter-type="method" data-filter-val="Bank Transfer" data-target="invoice" title="Filter by Bank Transfer">
                <i class="fa-solid fa-building-columns"></i> Bank Transfer
              </span>
            </div>
          </div>
        </div>
        <div style="margin-top: 4px; display: flex; justify-content: flex-end;">
          <button type="button" class="po-btn pay-action-btn pay-btn-invoice" style="height: 34px; font-size: 12px;" data-action="record-invoice">
            <i class="fa-solid fa-file-invoice-dollar"></i> Record invoice payment
          </button>
        </div>
      </div>

      <!-- Part 2: GRN Payment -->
      <div class="concept-card grn-concept">
        <div class="concept-top">
          <div class="concept-icon-title">
            <div class="concept-icon">
              <i class="fa-solid fa-boxes-packing"></i>
            </div>
            <div class="concept-heading">
              <h3>2. GRN Payment</h3>
              <p>Stock Item Purchases &amp; Supplier Payments</p>
            </div>
          </div>
          <span class="concept-part-badge">Part 2</span>
        </div>
        <div class="concept-desc-box">
          <i class="fa-solid fa-circle-info" style="color: #10b981; margin-right: 4px;"></i>
          <strong>GRN payments refer to disbursements made by the business for purchasing stock items and raw materials.</strong>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">
            Commercial procurement settlements made by the business for procuring inks, paper boards, vinyl rolls, and display hardware.
          </div>
        </div>
        <div class="concept-breakdown-row">
          <div>
            <div class="concept-group-title"><i class="fa-solid fa-flag-checkered"></i> Payment Stages — Click to Filter</div>
            <div class="concept-chips">
              <span class="concept-chip stage-complete" data-filter-type="stage" data-filter-val="Complete Payment" data-target="grn" title="Filter by Complete Payment">
                <i class="fa-solid fa-circle-check"></i> Complete Payment
              </span>
              <span class="concept-chip stage-pending" data-filter-type="stage" data-filter-val="Pending Payment" data-target="grn" title="Filter by Pending Payment">
                <i class="fa-solid fa-clock"></i> Pending Payment
              </span>
              <span class="concept-chip stage-advance" data-filter-type="stage" data-filter-val="Advance Payment" data-target="grn" title="Filter by Advance Payment">
                <i class="fa-solid fa-hourglass-half"></i> Advance Payment
              </span>
            </div>
          </div>
          <div>
            <div class="concept-group-title"><i class="fa-solid fa-wallet"></i> Payment Methods — Click to Filter</div>
            <div class="concept-chips">
              <span class="concept-chip method-card" data-filter-type="method" data-filter-val="Card" data-target="grn" title="Filter by Card">
                <i class="fa-solid fa-credit-card"></i> Card
              </span>
              <span class="concept-chip method-cash" data-filter-type="method" data-filter-val="Cash" data-target="grn" title="Filter by Cash">
                <i class="fa-solid fa-money-bill-wave"></i> Cash
              </span>
              <span class="concept-chip method-check" data-filter-type="method" data-filter-val="Check" data-target="grn" title="Filter by Cheque">
                <i class="fa-solid fa-money-check"></i> Check
              </span>
              <span class="concept-chip method-transfer" data-filter-type="method" data-filter-val="Bank Transfer" data-target="grn" title="Filter by Bank Transfer">
                <i class="fa-solid fa-building-columns"></i> Bank Transfer
              </span>
            </div>
          </div>
        </div>
        <div style="margin-top: 4px; display: flex; justify-content: flex-end;">
          <button type="button" class="po-btn pay-action-btn pay-btn-grn" style="height: 34px; font-size: 12px;" data-action="record-grn">
            <i class="fa-solid fa-boxes-packing"></i> Record grn payment
          </button>
        </div>
      </div>

      <!-- Part 3: Operating Expenses -->
      <div class="concept-card expense-concept">
        <div class="concept-top">
          <div class="concept-icon-title">
            <div class="concept-icon" style="background: rgba(245, 158, 11, 0.12); color: #f59e0b;">
              <i class="fa-solid fa-bolt-lightning"></i>
            </div>
            <div class="concept-heading">
              <h3>3. Operating Expenses</h3>
              <p>Utility &amp; Monthly Overhead Bills (Electricity, Water, Internet, Rent)</p>
            </div>
          </div>
          <span class="concept-part-badge" style="background: rgba(245, 158, 11, 0.12); color: #d97706; border-color: rgba(245, 158, 11, 0.3);">Part 3</span>
        </div>
        <div class="concept-desc-box">
          <i class="fa-solid fa-circle-info" style="color: #f59e0b; margin-right: 4px;"></i>
          <strong>Operating expenses represent monthly operational overhead bills due at month-end.</strong>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">
            Review all utility bills payable at month-end (Electricity, Water, Internet/Fiber, Rent) and mark status as <strong>Paid</strong> once settled.
          </div>
        </div>
        <div class="concept-breakdown-row">
          <div>
            <div class="concept-group-title"><i class="fa-solid fa-tags"></i> Bill Categories — Click to Filter</div>
            <div class="concept-chips">
              <span class="concept-chip" data-filter-type="expense-category" data-filter-val="Electricity" data-target="expenses" title="Filter by Electricity Bills">
                <i class="fa-solid fa-bolt-lightning" style="color: #f59e0b;"></i> Electricity
              </span>
              <span class="concept-chip" data-filter-type="expense-category" data-filter-val="Water Board" data-target="expenses" title="Filter by Water Board Bills">
                <i class="fa-solid fa-droplet" style="color: #0284c7;"></i> Water Board
              </span>
              <span class="concept-chip" data-filter-type="expense-category" data-filter-val="Internet & Fiber" data-target="expenses" title="Filter by Internet & Fiber Bills">
                <i class="fa-solid fa-wifi" style="color: #8b5cf6;"></i> Internet / SLT
              </span>
              <span class="concept-chip" data-filter-type="expense-category" data-filter-val="Shop Rent" data-target="expenses" title="Filter by Shop Rent">
                <i class="fa-solid fa-building" style="color: #ec4899;"></i> Shop Rent
              </span>
            </div>
          </div>
          <div>
            <div class="concept-group-title"><i class="fa-solid fa-clock-rotate-left"></i> Payment Status — Click to Filter</div>
            <div class="concept-chips">
              <span class="concept-chip stage-pending" data-filter-type="expense-status" data-filter-val="Pending" data-target="expenses" title="Filter by Pending Bills due at Month-End">
                <i class="fa-solid fa-hourglass-start"></i> Pending
              </span>
              <span class="concept-chip stage-complete" data-filter-type="expense-status" data-filter-val="Paid" data-target="expenses" title="Filter by Paid Bills">
                <i class="fa-solid fa-circle-check"></i> Paid
              </span>
            </div>
          </div>
        </div>
        <div style="margin-top: 4px; display: flex; justify-content: flex-end;">
          <button type="button" class="po-btn pay-action-btn pay-btn-bill" style="height: 34px; font-size: 12px;" data-action="record-bill">
            <i class="fa-solid fa-bolt-lightning"></i> Record bill payment
          </button>
        </div>
      </div>
    </div>


        <div class="pay-table-card" style="padding: 24px;">
          <h3 style="margin: 0 0 14px; font-size: 16px; font-weight: 800; color: var(--text);">
            <i class="fa-solid fa-file-contract" style="color: var(--blue); margin-right: 8px;"></i>
            Financial Settlement Policy &amp; Tri-Channel Architecture Summary
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; font-size: 13px; line-height: 1.6; color: var(--text);">
            <div style="background: var(--surface-2); padding: 16px; border-radius: 10px; border: 1px solid var(--border);">
              <h4 style="margin: 0 0 8px; color: var(--blue); font-size: 14px;"><i class="fa-solid fa-circle-dot"></i> Channel 1: Invoice Payments (Customer Jobs)</h4>
              <ul style="margin: 0; padding-left: 20px; color: var(--text-muted);">
                <li><strong>Complete Payment:</strong> Customers who have fully cleared the bill on collection.</li>
                <li><strong>Pending Payment:</strong> Corporate accounts on 30-day invoice terms or orders waiting for collection.</li>
                <li><strong>Advance Payment:</strong> Upfront token deposit (typically 50%) before initiating printing and finishing.</li>
                <li><strong>Supported Channels:</strong> Card (POS), Cash on counter, Cross cheques, and BOC bank transfer.</li>
              </ul>
            </div>
            <div style="background: var(--surface-2); padding: 16px; border-radius: 10px; border: 1px solid var(--border);">
              <h4 style="margin: 0 0 8px; color: #10b981; font-size: 14px;"><i class="fa-solid fa-circle-dot"></i> Channel 2: GRN Payments (Stock Items &amp; Suppliers)</h4>
              <ul style="margin: 0; padding-left: 20px; color: var(--text-muted);">
                <li><strong>Complete Payment:</strong> Consignment bills fully paid upon receiving inspected materials.</li>
                <li><strong>Pending Payment:</strong> Raw materials received under 14 to 45 days credit credit facilities.</li>
                <li><strong>Advance Payment:</strong> Advance purchase order deposits paid to overseas or local importers.</li>
                <li><strong>Supported Channels:</strong> Commercial cheques, corporate online transfers, petty cash, or corporate card.</li>
              </ul>
            </div>
            <div style="background: var(--surface-2); padding: 16px; border-radius: 10px; border: 1px solid var(--border);">
              <h4 style="margin: 0 0 8px; color: #f59e0b; font-size: 14px;"><i class="fa-solid fa-circle-dot"></i> Channel 3: Operating Expenses (Monthly Overhead Bills)</h4>
              <ul style="margin: 0; padding-left: 20px; color: var(--text-muted);">
                <li><strong>Pending Bills:</strong> Monthly operational overheads due at month-end (Electricity, Water, Internet, Rent).</li>
                <li><strong>Paid / Settled:</strong> Utility bills settled and marked Paid with reference number and receipt date.</li>
                <li><strong>Billing Cycle:</strong> Organized on a monthly basis with real-time settlement progress tracking.</li>
                <li><strong>Supported Providers:</strong> CEB / LECO, NWSDB, SLT Fibre, Dialog, and commercial property rent.</li>
              </ul>
            </div>
          </div>
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
    {{ module_vite('build-ui', 'resources/assets/js/payments.js') }}
@endpush
