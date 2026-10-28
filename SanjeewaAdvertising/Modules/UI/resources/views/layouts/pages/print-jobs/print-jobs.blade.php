@extends('ui::layouts.master')

@section('title', 'Print Jobs Production Floor')
@section('page_title', 'Print Production Queue')
@section('breadcrumb')Workspace / Production / <span>Print Jobs</span>@endsection

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
             MODULE 4: PRINT JOBS / PRODUCTION QUEUE
             ================================================================== -->
        <div class="app-module" id="module-print-jobs" data-module="print-jobs">
          <div class="module-container">
            <div class="po-header-banner">
              <div class="po-banner-content">
                <h2><span class="badge-icon" style="background: var(--red);"><i class="fa-solid fa-print"></i></span> Print Jobs Production Floor</h2>
                <p>Live Kanban tracking across RIP station, large-format printers, and finishing tables.</p>
              </div>
              <div class="po-kpi-row">
                <div class="po-kpi-pill"><span class="kpi-num">4 Active Machines</span></div>
                <div class="po-kpi-pill orange-pill"><span class="kpi-num">18 Jobs in Queue</span></div>
              </div>
            </div>

            <div class="prod-kanban-board">
              <!-- Column 1: Prepress & RIP -->
              <div class="kanban-col">
                <div class="kanban-col-header">
                  <span><i class="fa-solid fa-file-pen"></i> Design & RIP</span>
                  <span class="kanban-badge">4 Jobs</span>
                </div>
                <div class="kanban-cards-wrap">
                  <div class="kanban-job-card">
                    <div class="job-card-top"><strong>ORD-2026-1050</strong><span>Spot UV Cards</span></div>
                    <div style="font-size: 11px; color: var(--text);">Sajith Warnakula (500 pcs)</div>
                    <div class="job-progress-bar"><span style="width: 25%;"></span></div>
                    <span class="status-badge pending">Pre-flight Proof</span>
                  </div>
                  <div class="kanban-job-card">
                    <div class="job-card-top"><strong>ORD-2026-1052</strong><span>Backlit Sign</span></div>
                    <div style="font-size: 11px; color: var(--text);">City Cineplex (6 × 3 ft)</div>
                    <div class="job-progress-bar"><span style="width: 40%;"></span></div>
                    <span class="status-badge pending">RIP Processing</span>
                  </div>
                </div>
              </div>

              <!-- Column 2: Printing in Progress -->
              <div class="kanban-col">
                <div class="kanban-col-header">
                  <span><i class="fa-solid fa-print"></i> Printing on Machine</span>
                  <span class="kanban-badge">6 Jobs</span>
                </div>
                <div class="kanban-cards-wrap">
                  <div class="kanban-job-card">
                    <div class="job-card-top"><strong>ORD-2026-1049</strong><span>Flora 3.2m Flex</span></div>
                    <div style="font-size: 11px; color: var(--text);">Dilhani Senaratne (54 sq.ft)</div>
                    <div class="job-progress-bar"><span style="width: 65%;"></span></div>
                    <span class="status-badge in-progress">Printing Pass 3/4</span>
                  </div>
                  <div class="kanban-job-card">
                    <div class="job-card-top"><strong>ORD-2026-1051</strong><span>Roland TrueVIS</span></div>
                    <div style="font-size: 11px; color: var(--text);">Nuwan Weerasinghe (Rollup)</div>
                    <div class="job-progress-bar"><span style="width: 50%;"></span></div>
                    <span class="status-badge in-progress">Printing High Res</span>
                  </div>
                </div>
              </div>

              <!-- Column 3: Finishing & QC -->
              <div class="kanban-col">
                <div class="kanban-col-header">
                  <span><i class="fa-solid fa-scissors"></i> Finishing & Eyelets</span>
                  <span class="kanban-badge">5 Jobs</span>
                </div>
                <div class="kanban-cards-wrap">
                  <div class="kanban-job-card">
                    <div class="job-card-top"><strong>ORD-2026-1047</strong><span>Sticker Die-Cut</span></div>
                    <div style="font-size: 11px; color: var(--text);">Apex Brands (1,200 pcs)</div>
                    <div class="job-progress-bar"><span style="width: 85%;"></span></div>
                    <span class="status-badge in-progress">Graphtec Plotter</span>
                  </div>
                </div>
              </div>

              <!-- Column 4: Ready for Collection -->
              <div class="kanban-col">
                <div class="kanban-col-header">
                  <span><i class="fa-solid fa-box-archive"></i> Ready / Dispatch</span>
                  <span class="kanban-badge">3 Jobs</span>
                </div>
                <div class="kanban-cards-wrap">
                  <div class="kanban-job-card">
                    <div class="job-card-top"><strong>ORD-2026-1048</strong><span>Frontlit Banner</span></div>
                    <div style="font-size: 11px; color: var(--text);">Kasun Jayasundara (80 sq.ft)</div>
                    <div class="job-progress-bar"><span style="width: 100%;"></span></div>
                    <span class="status-badge completed">Ready on Shelf #A4</span>
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
    {{ module_vite('build-ui', 'resources/assets/js/place-order.js') }}
@endpush

