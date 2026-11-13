@php
    $reportsService = app(\Modules\Reports\Services\ReportsService::class);
    $initialPayload = $initialPayload ?? $reportsService->getAllData();
    $kpis = $kpis ?? $initialPayload['kpis'];
    $chartPayload = $chartPayload ?? $initialPayload['charts'];
    $initialTables = $initialTables ?? $initialPayload['tables'];

    $financials = $initialPayload['financials'] ?? $reportsService->fetchAggregatedFinancials([]);
    $totalSales = $financials['totalSales'] ?? 0;
    $totalCollected = $financials['totalCollected'] ?? 0;
    $totalGrnPayments = $financials['totalGrnPayments'] ?? 0;
    $totalExpenses = $financials['totalExpenses'] ?? 0;
    $netProfit = $financials['netProfit'] ?? 0;
    $uncollected = $financials['uncollected'] ?? 0;
    $marginPercent = $financials['marginPercent'] ?? 0;

    $paidExpensesTotal = $chartPayload['operatingExpensesStatus']['values'][0] ?? 0;
    $pendingExpensesTotal = $chartPayload['operatingExpensesStatus']['values'][1] ?? 0;

    $orders = $orders ?? ($initialTables['sales']['data'] ?? []);
    $expensesList = $expensesList ?? ($initialTables['expenses']['data'] ?? []);
    $customers = $customers ?? ($initialTables['receivables']['data'] ?? []);
    $stockItems = $stockItems ?? ($initialTables['inventory']['data'] ?? []);
    $suppliers = $suppliers ?? ($initialTables['suppliers']['data'] ?? []);
    $stockValue = $stockValue ?? ($initialPayload['stockValue'] ?? 0);
    $profitLossData = $profitLossData ?? ($initialTables['profitLoss'] ?? []);
@endphp
@extends('ui::layouts.master')

@section('title', 'Reports & Financial Performance')
@section('page_title', 'Reports & Analytics Hub')
@section('breadcrumb')Workspace / Management / <span>Reports Hub</span>@endsection

@push('styles')
    {{ module_vite('build-ui', 'resources/assets/css/core.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/reports.css') }}
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

                <div class="app-module" id="module-reports" data-module="reports">
                    <!-- Embedded Chart JSON Data -->
                    <script id="reports-chart-data" type="application/json">{!! json_encode($chartPayload) !!}</script>

                    <div class="rep-container">

                        <!-- Page Header Banner -->
                        <div class="rep-header-banner">
                            <div class="rep-title-wrap">
                                <h2>
                                    <i class="fa-solid fa-chart-line"></i>
                                    Reports &amp; Financial Analytics Hub
                                </h2>
                                <p class="rep-subtitle">
                                    Audited financial statements, interactive graphical charts, sales revenue breakdowns, 3-channel cash flow settlements, and inventory valuations.
                                </p>
                            </div>
                            <div class="rep-header-actions">
                                <button type="button" class="rep-btn rep-btn-secondary" id="btnExportReportCSV">
                                    <i class="fa-solid fa-file-csv"></i> Export CSV
                                </button>
                                <button type="button" class="rep-btn rep-btn-primary" id="btnPrintReportPDF">
                                    <i class="fa-solid fa-print"></i> Print / PDF Report
                                </button>
                            </div>
                        </div>

                        <!-- Date Range & Preset Filtering Bar -->
                        <div class="rep-filter-bar">
                            <div class="rep-presets-group">
                                <span class="rep-preset-label"><i class="fa-regular fa-calendar"></i> Period:</span>
                                <button type="button" class="rep-preset-btn" data-preset="today">Today</button>
                                <button type="button" class="rep-preset-btn" data-preset="this_week">This Week</button>
                                <button type="button" class="rep-preset-btn active" data-preset="this_month">This Month</button>
                                <button type="button" class="rep-preset-btn" data-preset="this_quarter">This Quarter</button>
                                <button type="button" class="rep-preset-btn" data-preset="this_year">This Year</button>
                            </div>

                            <div class="rep-custom-date-group">
                                <div class="rep-date-input-wrap">
                                    <label for="repDateFrom">From:</label>
                                    <input type="date" id="repDateFrom" name="repDateFrom" class="rep-date-input" value="{{ date('Y-m-01') }}">
                                </div>
                                <div class="rep-date-input-wrap">
                                    <label for="repDateTo">To:</label>
                                    <input type="date" id="repDateTo" name="repDateTo" class="rep-date-input" value="{{ date('Y-m-d') }}">
                                </div>
                                <button type="button" class="rep-btn rep-btn-primary rep-btn-sm" id="btnApplyDateFilter">
                                    <i class="fa-solid fa-filter"></i> Apply Filter
                                </button>
                            </div>
                        </div>

                        <!-- Executive KPI Summary Cards -->
                        <div class="rep-kpi-grid">
                            <div class="rep-kpi-card kpi-blue" data-kpi-card="grossBillings">
                                <div class="rep-kpi-header">
                                    <span class="rep-kpi-title">{{ $kpis['grossBillings']['title'] ?? 'Gross Billings' }}</span>
                                    <span class="rep-kpi-icon"><i class="{{ $kpis['grossBillings']['icon'] ?? 'fa-solid fa-file-invoice-dollar' }}"></i></span>
                                </div>
                                <div class="rep-kpi-value">{{ $kpis['grossBillings']['value'] ?? ('Rs. '.number_format($totalSales, 2)) }}</div>
                                <div class="rep-kpi-meta">
                                    {!! $kpis['grossBillings']['trend'] ?? '<span class="rep-trend-up"><i class="fa-solid fa-arrow-trend-up"></i> Stable</span>' !!} {{ $kpis['grossBillings']['meta'] ?? 'vs previous period' }}
                                </div>
                            </div>

                            <div class="rep-kpi-card kpi-orange" data-kpi-card="grnPurchases">
                                <div class="rep-kpi-header">
                                    <span class="rep-kpi-title">{{ $kpis['grnPurchases']['title'] ?? 'Stock & GRN Purchases' }}</span>
                                    <span class="rep-kpi-icon"><i class="{{ $kpis['grnPurchases']['icon'] ?? 'fa-solid fa-boxes-packing' }}"></i></span>
                                </div>
                                <div class="rep-kpi-value">{{ $kpis['grnPurchases']['value'] ?? ('Rs. '.number_format($totalGrnPayments, 2)) }}</div>
                                <div class="rep-kpi-meta">
                                    <span>{{ $kpis['grnPurchases']['meta'] ?? ('Material Cost: '.($totalSales > 0 ? round(($totalGrnPayments / $totalSales) * 100, 1) : 0).'%') }}</span>
                                </div>
                            </div>

                            <div class="rep-kpi-card kpi-red" data-kpi-card="operatingExpenses">
                                <div class="rep-kpi-header">
                                    <span class="rep-kpi-title">{{ $kpis['operatingExpenses']['title'] ?? 'Operating Expenses' }}</span>
                                    <span class="rep-kpi-icon"><i class="{{ $kpis['operatingExpenses']['icon'] ?? 'fa-solid fa-receipt' }}"></i></span>
                                </div>
                                <div class="rep-kpi-value">{{ $kpis['operatingExpenses']['value'] ?? ('Rs. '.number_format($totalExpenses, 2)) }}</div>
                                <div class="rep-kpi-meta">
                                    <span>{{ $kpis['operatingExpenses']['meta'] ?? 'Active Utility & Overhead bills' }}</span>
                                </div>
                            </div>

                            <div class="rep-kpi-card kpi-green" data-kpi-card="netProfit">
                                <div class="rep-kpi-header">
                                    <span class="rep-kpi-title">{{ $kpis['netProfit']['title'] ?? 'Net Operating Profit' }}</span>
                                    <span class="rep-kpi-icon"><i class="{{ $kpis['netProfit']['icon'] ?? 'fa-solid fa-sack-dollar' }}"></i></span>
                                </div>
                                <div class="rep-kpi-value">{{ $kpis['netProfit']['value'] ?? ('Rs. '.number_format($netProfit, 2)) }}</div>
                                <div class="rep-kpi-meta">
                                    {!! $kpis['netProfit']['trend'] ?? ('<span class="rep-trend-up"><i class="fa-solid fa-check"></i> '.$marginPercent.'% Margin</span>') !!}
                                </div>
                            </div>

                            <div class="rep-kpi-card kpi-purple" data-kpi-card="uncollected">
                                <div class="rep-kpi-header">
                                    <span class="rep-kpi-title">{{ $kpis['uncollected']['title'] ?? 'Uncollected Receivables' }}</span>
                                    <span class="rep-kpi-icon"><i class="{{ $kpis['uncollected']['icon'] ?? 'fa-solid fa-hand-holding-dollar' }}"></i></span>
                                </div>
                                <div class="rep-kpi-value">{{ $kpis['uncollected']['value'] ?? ('Rs. '.number_format($uncollected, 2)) }}</div>
                                <div class="rep-kpi-meta">
                                    <span>{{ $kpis['uncollected']['meta'] ?? 'Pending across customers' }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Reports Navigation Tabs & Panes -->
                        <div class="rep-tabs-wrap">
                            <div class="rep-tabs-header">
                                <div class="rep-tabs-nav-list">
                                    <button type="button" class="rep-tab-btn active" data-tab="tabSales">
                                        <i class="fa-solid fa-basket-shopping"></i> Sales &amp; Orders
                                    </button>
                                    <button type="button" class="rep-tab-btn" data-tab="tabPayments">
                                        <i class="fa-solid fa-money-bill-transfer"></i> Payments &amp; Cash Flow
                                    </button>
                                    <button type="button" class="rep-tab-btn" data-tab="tabReceivables">
                                        <i class="fa-solid fa-users"></i> Customer Receivables
                                    </button>
                                    <button type="button" class="rep-tab-btn" data-tab="tabInventory">
                                        <i class="fa-solid fa-warehouse"></i> Inventory &amp; Stock
                                    </button>
                                    <button type="button" class="rep-tab-btn" data-tab="tabSuppliers">
                                        <i class="fa-solid fa-truck-field"></i> Supplier &amp; GRN
                                    </button>
                                    <button type="button" class="rep-tab-btn" data-tab="tabProfitLoss">
                                        <i class="fa-solid fa-scale-balanced"></i> Profit &amp; Loss Statement
                                    </button>
                                </div>

                                <!-- View Mode Switcher (Table View vs Chart View) -->
                                <div class="rep-view-toggle-group" role="group" aria-label="Select Report Display Mode">
                                    <button type="button" class="rep-view-toggle-btn active" id="btnToggleTableView" data-view-mode="table">
                                        <i class="fa-solid fa-table-list"></i> Table View
                                    </button>
                                    <button type="button" class="rep-view-toggle-btn" id="btnToggleChartView" data-view-mode="chart">
                                        <i class="fa-solid fa-chart-pie"></i> Chart View
                                    </button>
                                </div>
                            </div>

                            <div class="rep-tab-body">

                                <!-- TAB 1: Sales & Orders Report -->
                                <div class="rep-tab-pane active" id="tabSales">
                                    @include('ui::layouts.pages.reports.sales-orders.charts.sales-orders-charts')
                                    @include('ui::layouts.pages.reports.sales-orders.tables.sales-orders-table')
                                </div>

                                <!-- TAB 2: Payments & Cash Flow Report -->
                                <div class="rep-tab-pane" id="tabPayments">
                                    @include('ui::layouts.pages.reports.payments-cashflow.charts.payments-cashflow-charts')
                                    @include('ui::layouts.pages.reports.payments-cashflow.tables.payments-cashflow-table')
                                </div>

                                <!-- TAB 3: Customer Receivables Report -->
                                <div class="rep-tab-pane" id="tabReceivables">
                                    @include('ui::layouts.pages.reports.customer-receivables.charts.customer-receivables-charts')
                                    @include('ui::layouts.pages.reports.customer-receivables.tables.customer-receivables-table')
                                </div>

                                <!-- TAB 4: Inventory & Stock Valuation Report -->
                                <div class="rep-tab-pane" id="tabInventory">
                                    @include('ui::layouts.pages.reports.inventory-stock.charts.inventory-stock-charts')
                                    @include('ui::layouts.pages.reports.inventory-stock.tables.inventory-stock-table')
                                </div>

                                <!-- TAB 5: Supplier & GRN Report -->
                                <div class="rep-tab-pane" id="tabSuppliers">
                                    @include('ui::layouts.pages.reports.supplier-grn.charts.supplier-grn-charts')
                                    @include('ui::layouts.pages.reports.supplier-grn.tables.supplier-grn-table')
                                </div>

                                <!-- TAB 6: Profit & Loss Statement -->
                                <div class="rep-tab-pane" id="tabProfitLoss">
                                    @include('ui::layouts.pages.reports.profit-loss.charts.profit-loss-charts')
                                    @include('ui::layouts.pages.reports.profit-loss.tables.profit-loss-table')
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </main>
    </div>

@endsection

@push('scripts')
    {{ module_vite('build-ui', 'resources/assets/js/core.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/sidebar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/topbar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/reports.js') }}
@endpush
