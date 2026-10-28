@extends('ui::layouts.master')

@section('title', 'Financial & Sales Reports')
@section('page_title', 'Financial & Sales Reports')
@section('breadcrumb')Workspace / Management / <span>Reports</span>@endsection

@push('styles')
    {{ module_vite('build-ui', 'resources/assets/css/core.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/modules.css') }}
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
             MODULE 6: REPORTS & FINANCIAL PERFORMANCE
             ================================================================== -->
        <div class="app-module" id="module-reports" data-module="reports">
          <div class="module-container">
            <div class="po-header-banner">
              <div class="po-banner-content">
                <h2><span class="badge-icon" style="background: var(--purple);"><i class="fa-solid fa-chart-pie"></i></span> Financial & Sales Reports</h2>
                <p>Audited cash flow, revenue breakdowns by product, and customer receivables.</p>
              </div>
              <div class="po-action-group">
                <button type="button" class="po-btn po-btn-secondary"><i class="fa-solid fa-file-csv"></i> Export CSV</button>
                <button type="button" class="po-btn po-btn-primary"><i class="fa-solid fa-file-pdf"></i> Download Audit PDF</button>
              </div>
            </div>

            <div class="reports-kpi-grid">
              <div class="report-summary-card">
                <h4>Gross Billings (YTD)</h4>
                <strong>Rs. 8,450,000</strong>
                <span class="positive"><i class="fa-solid fa-arrow-up"></i> +14.2% YoY</span>
              </div>
              <div class="report-summary-card">
                <h4>Raw Material Costs</h4>
                <strong style="color: var(--red);">Rs. 3,240,000</strong>
                <span style="font-size: 11px; color: var(--text-muted);">38.3% of revenue</span>
              </div>
              <div class="report-summary-card">
                <h4>Net Operating Profit</h4>
                <strong style="color: var(--green);">Rs. 3,770,000</strong>
                <span class="positive"><i class="fa-solid fa-check"></i> 44.6% Margin</span>
              </div>
              <div class="report-summary-card">
                <h4>Uncollected Receivables</h4>
                <strong style="color: var(--po-orange);">Rs. 182,500</strong>
                <span style="font-size: 11px; color: var(--text-muted);">Across 4 active orders</span>
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
@endpush

