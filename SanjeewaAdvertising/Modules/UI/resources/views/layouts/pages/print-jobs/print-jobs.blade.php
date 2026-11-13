@extends('ui::layouts.master')

@section('title', 'Print Jobs Production Floor')
@section('page_title', 'Print Production Queue')
@section('breadcrumb')Workspace / Production / <span>Print Jobs</span>@endsection

@push('styles')
    {{ module_vite('build-ui', 'resources/assets/css/core.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/print-jobs.css') }}
@endpush

@section('content')
@php
    $printTypes = $printTypes ?? \Modules\Design\Models\PrintType::query()->orderBy('id')->get()->map(fn ($pt) => ['id' => (int) $pt->id, 'name' => $pt->print_type])->all();
    $statuses = $statuses ?? \Modules\PrintJob\Models\PrintJobStatus::query()->orderBy('id')->get()->map(fn ($st) => ['id' => (int) $st->id, 'name' => $st->print_job_states])->all();
    $availableStocks = $availableStocks ?? \Modules\Inventory\Models\Stock::query()
        ->with(['stockItem', 'brand'])
        ->where('qty', '>', 0)
        ->orderBy('id')
        ->get()
        ->map(fn ($s) => [
            'id' => (int) $s->id,
            'name' => $s->stockItem?->name ?? 'Stock #' . $s->id,
            'brand' => $s->brand?->brand ?? '',
            'qty' => (int) $s->qty,
            'price' => (float) $s->price,
        ])->all();
@endphp

    <div class="app-layout app" id="app">

        @include('ui::components.sidebar')

        <!-- Sidebar Backdrop Overlay -->
        <div class="sidebar-overlay" id="sidebarOverlay"></div>

        <main class="main-area" id="mainArea">

            @include('ui::components.topbar')

            <!-- Dynamic Main Content Viewport -->
            <div class="main-content-viewport" id="mainContentViewport">

                <!-- ==================================================================
                     MODULE 4: PRINT JOBS PRODUCTION FLOOR (5 Light-Color Tabs)
                     ================================================================== -->
                <div class="app-module" id="module-print-jobs" data-module="print-jobs">
                    <div class="pj-container">

                        <!-- 1. Page Header Banner -->
                        <div class="pj-header-banner">
                            <div class="pj-banner-content">
                                <h2>
                                    <span class="badge-icon"><i class="fa-solid fa-print"></i></span>
                                    Print Jobs Production Floor
                                </h2>
                                <p>Real-time stage progression across prepress RIP, high-resolution printing machines, and finishing tables.</p>
                            </div>
                            <div class="pj-header-actions">
                                <button type="button" class="ant-btn ant-btn-default" id="btnExportJobs">
                                    <i class="fa-solid fa-file-export"></i> Export CSV
                                </button>
                                <button type="button" class="ant-btn ant-btn-default" id="btnRefreshJobs">
                                    <i class="fa-solid fa-rotate"></i> Refresh
                                </button>
                                <a href="{{ route('ui.place-order') }}" class="ant-btn ant-btn-primary">
                                    <i class="fa-solid fa-plus"></i> Place Order
                                </a>
                            </div>
                        </div>

                        <!-- 2. KPI Summary Cards Grid (5 Cards) -->
                        <div class="pj-kpi-grid">
                            <!-- Card 1: Total Jobs -->
                            <div class="pj-kpi-card">
                                <div class="pj-kpi-meta">
                                    <span class="pj-kpi-label">Active Queue</span>
                                    <div class="pj-kpi-val" id="kpiTotalJobs">{{ $kpis['total'] ?? 0 }}</div>
                                    <span class="pj-kpi-desc"><i class="fa-solid fa-layer-group" style="color: #1677ff;"></i> Total In-Flight Jobs</span>
                                </div>
                                <div class="pj-kpi-icon blue">
                                    <i class="fa-solid fa-boxes-stacked"></i>
                                </div>
                            </div>

                            <!-- Card 2: Prepress / Design -->
                            <div class="pj-kpi-card">
                                <div class="pj-kpi-meta">
                                    <span class="pj-kpi-label">Prepress & RIP</span>
                                    <div class="pj-kpi-val" id="kpiPrepressJobs">{{ $kpis['prepress'] ?? 0 }}</div>
                                    <span class="pj-kpi-desc"><i class="fa-solid fa-pen-ruler" style="color: #722ed1;"></i> Proofing & RIP Queue</span>
                                </div>
                                <div class="pj-kpi-icon purple">
                                    <i class="fa-solid fa-pen-ruler"></i>
                                </div>
                            </div>

                            <!-- Card 3: Printing Machine -->
                            <div class="pj-kpi-card">
                                <div class="pj-kpi-meta">
                                    <span class="pj-kpi-label">On Machine</span>
                                    <div class="pj-kpi-val" id="kpiPrintingJobs" style="color: #fa8c16;">{{ $kpis['printing'] ?? 0 }}</div>
                                    <span class="pj-kpi-desc"><i class="fa-solid fa-print" style="color: #fa8c16;"></i> Currently Printing</span>
                                </div>
                                <div class="pj-kpi-icon orange">
                                    <i class="fa-solid fa-print"></i>
                                </div>
                            </div>

                            <!-- Card 4: Finishing & QC -->
                            <div class="pj-kpi-card">
                                <div class="pj-kpi-meta">
                                    <span class="pj-kpi-label">Finishing & QC</span>
                                    <div class="pj-kpi-val" id="kpiFinishingJobs" style="color: #faad14;">{{ $kpis['finishing'] ?? 0 }}</div>
                                    <span class="pj-kpi-desc"><i class="fa-solid fa-scissors" style="color: #faad14;"></i> Lamination & Eyelets</span>
                                </div>
                                <div class="pj-kpi-icon yellow">
                                    <i class="fa-solid fa-scissors"></i>
                                </div>
                            </div>

                            <!-- Card 5: Ready / Delivered -->
                            <div class="pj-kpi-card">
                                <div class="pj-kpi-meta">
                                    <span class="pj-kpi-label">Ready / Delivered</span>
                                    <div class="pj-kpi-val" id="kpiReadyJobs" style="color: #52c41a;">{{ $kpis['ready_completed'] ?? 0 }}</div>
                                    <span class="pj-kpi-desc"><i class="fa-solid fa-circle-check" style="color: #52c41a;"></i> Ready for Customer</span>
                                </div>
                                <div class="pj-kpi-icon green">
                                    <i class="fa-solid fa-circle-check"></i>
                                </div>
                            </div>
                        </div>

                        <!-- 3. Toolbar: Search, Filters & View Switcher -->
                        <div class="pj-toolbar">
                            <div class="pj-toolbar-left">
                                <div class="pj-search-box">
                                    <i class="fa-solid fa-magnifying-glass"></i>
                                    <input type="text" id="jobSearchInput" placeholder="Search by Job #, Customer, or Category..." />
                                </div>
                                <select class="pj-select" id="filterPrintType">
                                    <option value="">All Categories</option>
                                    @foreach($printTypes ?? [] as $pt)
                                        <option value="{{ $pt['id'] }}">{{ $pt['name'] }}</option>
                                    @endforeach
                                </select>
                                <select class="pj-select" id="filterStatus">
                                    <option value="">All Statuses</option>
                                    @foreach($statuses ?? [] as $st)
                                        <option value="{{ $st['id'] }}">{{ $st['name'] }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="pj-toolbar-right">
                                <div class="pj-view-switcher">
                                    <button type="button" class="pj-view-btn active" id="btnViewCards">
                                        <i class="fa-solid fa-layer-group"></i> Stage Tabs View
                                    </button>
                                    <button type="button" class="pj-view-btn" id="btnViewTable">
                                        <i class="fa-solid fa-list-check"></i> Data Table
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- 4. VIEW 1: 5 LIGHT COLOR TABS & CARDS CONTAINER -->
                        <div id="stageTabsContainer">
                            <!-- 5 Light-Colored Stage Navigation Tabs -->
                            <div class="pj-stage-tabs" id="pjStageTabs">
                                <button type="button" class="pj-stage-tab tab-purple active" data-stage="prepress">
                                    <i class="fa-solid fa-pen-ruler"></i> Design & Prepress
                                    <span class="pj-tab-count" id="tabBadge-prepress">{{ count($kanban['prepress'] ?? []) }}</span>
                                </button>
                                <button type="button" class="pj-stage-tab tab-blue" data-stage="printing">
                                    <i class="fa-solid fa-print"></i> Printing on Machine
                                    <span class="pj-tab-count" id="tabBadge-printing">{{ count($kanban['printing'] ?? []) }}</span>
                                </button>
                                <button type="button" class="pj-stage-tab tab-amber" data-stage="finishing">
                                    <i class="fa-solid fa-scissors"></i> Finishing & Eyelets
                                    <span class="pj-tab-count" id="tabBadge-finishing">{{ count($kanban['finishing'] ?? []) }}</span>
                                </button>
                                <button type="button" class="pj-stage-tab tab-mint" data-stage="ready">
                                    <i class="fa-solid fa-box-archive"></i> Ready for Pickup
                                    <span class="pj-tab-count" id="tabBadge-ready">{{ count($kanban['ready'] ?? []) }}</span>
                                </button>
                                <button type="button" class="pj-stage-tab tab-slate" data-stage="completed">
                                    <i class="fa-solid fa-circle-check"></i> Completed / Dispatched
                                    <span class="pj-tab-count" id="tabBadge-completed">{{ count($kanban['completed'] ?? []) }}</span>
                                </button>
                            </div>

                            <!-- Stage 1 Tab Pane: Prepress & RIP (Light Purple) -->
                            <div class="pj-tab-pane active" id="tabPane-prepress" style="margin-top: 16px;">
                                <div class="pj-cards-grid" id="tabCards-prepress"></div>
                            </div>

                            <!-- Stage 2 Tab Pane: Printing on Machine (Light Blue) -->
                            <div class="pj-tab-pane" id="tabPane-printing" style="margin-top: 16px; display: none;">
                                <div class="pj-cards-grid" id="tabCards-printing"></div>
                            </div>

                            <!-- Stage 3 Tab Pane: Finishing & QC (Light Amber) -->
                            <div class="pj-tab-pane" id="tabPane-finishing" style="margin-top: 16px; display: none;">
                                <div class="pj-cards-grid" id="tabCards-finishing"></div>
                            </div>

                            <!-- Stage 4 Tab Pane: Ready for Collection (Light Mint) -->
                            <div class="pj-tab-pane" id="tabPane-ready" style="margin-top: 16px; display: none;">
                                <div class="pj-cards-grid" id="tabCards-ready"></div>
                            </div>

                            <!-- Stage 5 Tab Pane: Completed / Dispatched (Light Slate) -->
                            <div class="pj-tab-pane" id="tabPane-completed" style="margin-top: 16px; display: none;">
                                <div class="pj-cards-grid" id="tabCards-completed"></div>
                            </div>
                        </div>

                        <!-- 5. VIEW 2: PRODUCTION DATA TABLE -->
                        <div class="pj-table-card" id="tableViewContainer" style="display: none;">
                            <div class="pj-table-responsive">
                                <table class="pj-table">
                                    <thead>
                                        <tr>
                                            <th>Job / Order</th>
                                            <th>Customer Details</th>
                                            <th>Print Category</th>
                                            <th>Quantity</th>
                                            <th>Allocated Materials</th>
                                            <th>Production Status</th>
                                            <th>Amount / Billing</th>
                                            <th style="text-align: right;">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="pjTableBody">
                                        <!-- Rendered by PrintJobTableHandler -->
                                    </tbody>
                                </table>
                            </div>
                            <div class="pj-table-footer">
                                <div id="pjPaginationInfo" style="font-size: 12.5px; color: #64748b;">
                                    Showing 0 to 0 of 0 jobs
                                </div>
                                <div class="pj-pagination">
                                    <button type="button" class="pj-page-btn" id="pjBtnPrevPage" disabled>
                                        <i class="fa-solid fa-chevron-left"></i> Previous
                                    </button>
                                    <button type="button" class="pj-page-btn" id="pjBtnNextPage" disabled>
                                        Next <i class="fa-solid fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

        </main>

    </div>

    <!-- ==================================================================
         MODAL 1: JOB DETAILS & STATUS HISTORY MODAL
         ================================================================== -->
    <div class="pj-modal-overlay" id="modalJobDetails">
        <div class="pj-modal">
            <div class="pj-modal-header">
                <h3><i class="fa-solid fa-circle-info" style="color: #1677ff;"></i> Job Details & History</h3>
                <button type="button" class="pj-modal-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="pj-modal-body">
                <div style="background: #f8fafc; border-radius: 8px; padding: 12px; border: 1px solid #e2e8f0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <div>
                        <div style="font-size: 11px; color: #64748b;">Job Code</div>
                        <div style="font-size: 14px; font-weight: 700;" id="detailsJobCode">—</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: #64748b;">Order Date</div>
                        <div style="font-size: 13px; font-weight: 600;" id="detailsDate">—</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: #64748b;">Customer</div>
                        <div style="font-size: 13px; font-weight: 600;" id="detailsCustomerName">—</div>
                        <div style="font-size: 11px; color: #64748b;" id="detailsCustomerContact">—</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: #64748b;">Specification</div>
                        <div style="font-size: 13px; font-weight: 600;" id="detailsPrintType">—</div>
                        <div style="font-size: 11px; color: #0369a1; font-weight: 600;" id="detailsQuantity">—</div>
                    </div>
                </div>

                <!-- Financial Snapshot -->
                <div>
                    <h4 style="font-size: 13px; font-weight: 700; margin: 0 0 6px 0; color: #1e293b;">
                        <i class="fa-solid fa-file-invoice-dollar" style="color: #52c41a;"></i> Financial Summary
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; background: #fafafa; border: 1px solid #f0f0f0; border-radius: 8px; padding: 10px; text-align: center;">
                        <div>
                            <div style="font-size: 10.5px; color: #8c8c8c;">Total Amount</div>
                            <div style="font-size: 13px; font-weight: 700;" id="detailsTotalAmount">Rs. 0.00</div>
                        </div>
                        <div>
                            <div style="font-size: 10.5px; color: #8c8c8c;">Paid</div>
                            <div style="font-size: 13px; font-weight: 700; color: #52c41a;" id="detailsPaidAmount">Rs. 0.00</div>
                        </div>
                        <div>
                            <div style="font-size: 10.5px; color: #8c8c8c;">Balance</div>
                            <div style="font-size: 13px; font-weight: 700; color: #cf1322;" id="detailsBalanceAmount">Rs. 0.00</div>
                        </div>
                        <div>
                            <div style="font-size: 10.5px; color: #8c8c8c;">Status</div>
                            <div style="margin-top: 2px;"><span id="detailsPaymentBadge" class="pj-pay-badge unpaid">Unpaid</span></div>
                        </div>
                    </div>
                </div>

                <!-- Allocated Materials -->
                <div>
                    <h4 style="font-size: 13px; font-weight: 700; margin: 0 0 6px 0; color: #1e293b;">
                        <i class="fa-solid fa-boxes-stacked" style="color: #fa8c16;"></i> Allocated Materials & Raw Stock
                    </h4>
                    <div id="detailsMaterialsList">
                        <!-- Populated by JS -->
                    </div>
                </div>

                <!-- Status History Timeline -->
                <div>
                    <h4 style="font-size: 13px; font-weight: 700; margin: 0 0 8px 0; color: #1e293b;">
                        <i class="fa-solid fa-clock-rotate-left" style="color: #722ed1;"></i> Status History Timeline
                    </h4>
                    <div id="detailsTimelineContainer">
                        <!-- Populated by JS -->
                    </div>
                </div>
            </div>
            <div class="pj-modal-footer">
                <div style="font-size: 11px; color: #64748b; margin-right: auto;">
                    Registered by: <strong id="detailsOperator">—</strong>
                </div>
                <button type="button" class="ant-btn ant-btn-default pj-modal-close">Close</button>
            </div>
        </div>
    </div>

    <!-- ==================================================================
         MODAL 2: CHANGE PRODUCTION STATUS MODAL
         ================================================================== -->
    <div class="pj-modal-overlay" id="modalChangeStatus">
        <div class="pj-modal" style="max-width: 480px;">
            <div class="pj-modal-header">
                <h3><i class="fa-solid fa-arrow-right" style="color: #1677ff;"></i> Update Production Status</h3>
                <button type="button" class="pj-modal-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="pj-modal-body">
                <div style="font-size: 13px; font-weight: 600; color: #1e293b; margin-bottom: 8px;" id="statusJobHeader">
                    —
                </div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
                    <span style="font-size: 12px; color: #64748b;">Current Stage:</span>
                    <span id="statusCurrentBadge" class="pj-badge pending">—</span>
                </div>

                <div class="pj-form-group">
                    <label for="selectNewStatus">Select New Production Stage <span style="color: #ff4d4f;">*</span></label>
                    <select class="pj-select" id="selectNewStatus" style="width: 100%;">
                        <option value="">-- Choose New Status --</option>
                        @foreach($statuses as $st)
                            <option value="{{ $st['id'] }}">{{ $st['name'] }}</option>
                        @endforeach
                    </select>
                </div>
            </div>
            <div class="pj-modal-footer">
                <button type="button" class="ant-btn ant-btn-default pj-modal-close">Cancel</button>
                <button type="button" class="ant-btn ant-btn-primary" id="btnSubmitStatusChange">
                    <i class="fa-solid fa-check"></i> Update Status
                </button>
            </div>
        </div>
    </div>

    <!-- ==================================================================
         MODAL 3: ALLOCATE MATERIAL & RAW STOCK MODAL
         ================================================================== -->
    <div class="pj-modal-overlay" id="modalAllocateMaterial">
        <div class="pj-modal">
            <div class="pj-modal-header">
                <h3><i class="fa-solid fa-boxes-stacked" style="color: #fa8c16;"></i> Material & Raw Stock Allocation</h3>
                <button type="button" class="pj-modal-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="pj-modal-body">
                <div style="font-size: 13px; font-weight: 600; color: #1e293b;" id="allocJobHeader">—</div>

                <!-- Form to Add Material -->
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
                    <div style="font-size: 12px; font-weight: 700; margin-bottom: 8px; color: #334155;">Assign Material from Warehouse Stock</div>
                    <div class="pj-alloc-form">
                        <div class="pj-form-group">
                            <label for="selectAllocateStock">Warehouse Stock Item</label>
                            <select class="pj-select" id="selectAllocateStock" style="width: 100%;">
                                <option value="">-- Choose Raw Material / Stock Item --</option>
                                @foreach($availableStocks as $stk)
                                    <option value="{{ $stk['id'] }}">
                                        {{ $stk['name'] }} {{ $stk['brand'] ? "[{$stk['brand']}]" : '' }} - (Available: {{ $stk['qty'] }} in stock)
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="pj-form-group">
                            <label for="inputMaterialQty">Qty Required</label>
                            <input type="number" class="pj-input" id="inputMaterialQty" value="1" min="1" />
                        </div>
                        <div>
                            <button type="button" class="ant-btn ant-btn-primary" id="btnSubmitAssignMaterial" style="height: 35px;">
                                <i class="fa-solid fa-plus"></i> Assign
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Currently Allocated Materials Table -->
                <div>
                    <div style="font-size: 12.5px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">Currently Linked Raw Materials</div>
                    <div id="allocatedMaterialsList">
                        <!-- Populated by JS -->
                    </div>
                </div>
            </div>
            <div class="pj-modal-footer">
                <button type="button" class="ant-btn ant-btn-default pj-modal-close">Close</button>
            </div>
        </div>
    </div>

    {{-- Shared Modals Container --}}
    @include('ui::layouts.modals.modals')

    <!-- Toast Notification Container -->
    <div class="po-toast-container" id="poToastContainer"></div>

@endsection

@push('scripts')
    @php
        $initialPrintJobsData = $initialPrintJobsData ?? app(\Modules\PrintJob\Services\PrintJobService::class)->getPrintJobFloorData();
    @endphp
    <script>
        window.__INITIAL_PRINT_JOBS_DATA__ = @json($initialPrintJobsData);
    </script>
    {{ module_vite('build-ui', 'resources/assets/js/core.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/sidebar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/topbar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/print-jobs.js') }}
@endpush
