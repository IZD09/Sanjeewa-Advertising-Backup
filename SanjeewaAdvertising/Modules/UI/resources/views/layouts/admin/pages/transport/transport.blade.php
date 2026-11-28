@extends('ui::layouts.master')

@section('title', 'Transport Management')
@section('page_title', 'Transport Management')
@section('breadcrumb')Admin Workspace / Management / <span>Transport</span>@endsection

@push('styles')
    {{ module_vite('build-ui', 'resources/assets/css/core.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/admin-transport.css') }}
@endpush

@section('content')

    <div class="app-layout app" id="app">

        @include('ui::components.sidebar', ['role' => 'admin'])

        <!-- Sidebar Backdrop Overlay -->
        <div class="sidebar-overlay" id="sidebarOverlay"></div>

        <main class="main-area" id="mainArea">

            @include('ui::components.topbar')

            <!-- Dynamic Main Content Viewport -->
            <div class="main-content-viewport" id="mainContentViewport">

                <!-- ==================================================================
                     ADMIN MODULE: TRANSPORT & FLEET MANAGEMENT
                     ================================================================== -->
                <div class="app-module" id="module-transport" data-module="transport">
                    <div class="trp-container">

                        <!-- 1. Page Header & Quick Actions -->
                        <div class="trp-page-header">
                            <div class="trp-page-title-wrap">
                                <h2><i class="fa-solid fa-truck-fast"></i> Transport Management</h2>
                                <p class="trp-page-subtitle">Manage company vehicles, driver assignments, delivery dispatches, odometer mileage, and diesel consumption.</p>
                            </div>
                            <div class="trp-header-actions">
                                <button type="button" class="trp-diesel-rate-pill" id="btnOpenDieselModal" title="Click to update current diesel price per liter">
                                    <i class="fa-solid fa-gas-pump"></i>
                                    <span>Diesel: <strong id="trpHeaderDieselRate">Rs. {{ number_format((float) ($kpi['current_diesel_rate'] ?? 286), 2) }}</strong> / L</span>
                                    <i class="fa-solid fa-pen-to-square trp-pill-edit"></i>
                                </button>
                                <button type="button" class="ant-btn ant-btn-default" id="btnOpenAddDriverModal">
                                    <i class="fa-solid fa-id-card-clip" style="color: #0284c7;"></i> Add Driver
                                </button>
                                <button type="button" class="ant-btn ant-btn-secondary" id="btnOpenAddVehicleModal">
                                    <i class="fa-solid fa-truck-medical"></i> Add Vehicle
                                </button>
                                <button type="button" class="ant-btn ant-btn-primary" id="btnOpenStartDispatchModal">
                                    <i class="fa-solid fa-route"></i> Start Transport
                                </button>
                            </div>
                        </div>

                        <!-- 2. Summary KPI Cards (5 Cards Grid) -->
                        <div class="trp-summary-grid">
                            <!-- Card 1: Total Dispatches -->
                            <div class="trp-kpi-card">
                                <div>
                                    <span class="trp-kpi-label">Total Dispatches</span>
                                    <div class="trp-kpi-val" id="kpiTotalDispatches">{{ $kpi['total_dispatches'] ?? 0 }}</div>
                                    <span class="trp-kpi-desc">
                                        <i class="fa-solid fa-road" style="color: #1677ff;"></i>
                                        <span id="kpiTotalDistanceDesc">{{ number_format((int) ($kpi['total_distance_km'] ?? 0)) }} km logged</span>
                                    </span>
                                </div>
                                <div class="trp-kpi-icon blue">
                                    <i class="fa-solid fa-truck-fast"></i>
                                </div>
                            </div>

                            <!-- Card 2: In Transit -->
                            <div class="trp-kpi-card">
                                <div>
                                    <span class="trp-kpi-label">In Transit Now</span>
                                    <div class="trp-kpi-val" id="kpiInTransit">{{ $kpi['in_transit'] ?? 0 }}</div>
                                    <span class="trp-kpi-desc">
                                        <i class="fa-solid fa-location-arrow" style="color: #f59e0b;"></i> Active Trips on Road
                                    </span>
                                </div>
                                <div class="trp-kpi-icon amber">
                                    <i class="fa-solid fa-truck-arrow-right"></i>
                                </div>
                            </div>

                            <!-- Card 3: Completed Today -->
                            <div class="trp-kpi-card">
                                <div>
                                    <span class="trp-kpi-label">Completed Today</span>
                                    <div class="trp-kpi-val" id="kpiDeliveredToday">{{ $kpi['delivered_today'] ?? 0 }}</div>
                                    <span class="trp-kpi-desc">
                                        <i class="fa-solid fa-circle-check" style="color: #10b981;"></i>
                                        <span id="kpiTodayDieselDesc">{{ rtrim(rtrim(number_format((float) ($kpi['today_diesel_liters'] ?? 0), 3, '.', ','), '0'), '.') ?: '0' }} L today</span>
                                    </span>
                                </div>
                                <div class="trp-kpi-icon green">
                                    <i class="fa-solid fa-clipboard-check"></i>
                                </div>
                            </div>

                            <!-- Card 4: Active Vehicles -->
                            <div class="trp-kpi-card">
                                <div>
                                    <span class="trp-kpi-label">Active Vehicles</span>
                                    <div class="trp-kpi-val" id="kpiActiveVehicles">{{ $kpi['active_vehicles'] ?? 0 }}</div>
                                    <span class="trp-kpi-desc">
                                        <i class="fa-solid fa-van-shuttle" style="color: #7c3aed;"></i>
                                        <span id="kpiAvailableVehiclesDesc">{{ $kpi['available_vehicles'] ?? 0 }} Ready • {{ $kpi['drivers_count'] ?? 0 }} Drivers</span>
                                    </span>
                                </div>
                                <div class="trp-kpi-icon purple">
                                    <i class="fa-solid fa-van-shuttle"></i>
                                </div>
                            </div>

                            <!-- Card 5: Total Diesel Consumed -->
                            <div class="trp-kpi-card">
                                <div>
                                    <span class="trp-kpi-label">Total Diesel Expense</span>
                                    <div class="trp-kpi-val" id="kpiTotalDieselCost">Rs. {{ number_format((float) ($kpi['total_diesel_cost'] ?? 0), 2) }}</div>
                                    <span class="trp-kpi-desc">
                                        <i class="fa-solid fa-gas-pump" style="color: #06b6d4;"></i>
                                        <span id="kpiTotalDieselLitersDesc">{{ rtrim(rtrim(number_format((float) ($kpi['total_diesel_liters'] ?? 0), 3, '.', ','), '0'), '.') ?: '0' }} L Consumed</span>
                                    </span>
                                </div>
                                <div class="trp-kpi-icon cyan">
                                    <i class="fa-solid fa-gas-pump"></i>
                                </div>
                            </div>
                        </div>

                        <!-- 3. Main Tabbed Workspace Card -->
                        <div class="trp-main-card">
                            <div class="trp-tabs-nav">
                                <button type="button" class="trp-tab-btn active" data-trp-tab="paneTrpDispatches">
                                    <i class="fa-solid fa-route"></i> Transport Dispatches &amp; Diesel Log
                                    <span class="trp-tab-badge" id="badgeTrpDispatches">{{ count($initialTransportData['dispatches'] ?? []) }}</span>
                                </button>
                                <button type="button" class="trp-tab-btn" data-trp-tab="paneTrpVehicles">
                                    <i class="fa-solid fa-truck"></i> Vehicles &amp; Driver Assignment
                                    <span class="trp-tab-badge" id="badgeTrpVehicles">{{ count($initialTransportData['vehicles'] ?? []) }}</span>
                                </button>
                                <button type="button" class="trp-tab-btn" data-trp-tab="paneTrpDrivers">
                                    <i class="fa-solid fa-id-card"></i> Drivers Roster
                                    <span class="trp-tab-badge" id="badgeTrpDrivers">{{ count($initialTransportData['drivers'] ?? []) }}</span>
                                </button>
                                <button type="button" class="trp-tab-btn" data-trp-tab="paneTrpDiesel">
                                    <i class="fa-solid fa-gas-pump"></i> Diesel Price History
                                    <span class="trp-tab-badge" id="badgeTrpDiesel">{{ count($initialTransportData['diesel_prices'] ?? []) }}</span>
                                </button>
                            </div>

                            <!-- TAB 1: TRANSPORT DISPATCHES & DIESEL LOG -->
                            <div class="trp-tab-pane active" id="paneTrpDispatches">
                                <div class="trp-toolbar">
                                    <div class="trp-toolbar-left">
                                        <div class="trp-search-box">
                                            <i class="fa-solid fa-magnifying-glass"></i>
                                            <input type="text" id="trpSearchDispatches" placeholder="Search vehicle plate, driver, destination, or job #...">
                                        </div>
                                        <select class="trp-select" id="trpFilterTripStatus" aria-label="Filter by trip status">
                                            <option value="ALL">All Statuses</option>
                                            <option value="In Transit">In Transit (Active)</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                        <select class="trp-select" id="trpFilterTripVehicle" aria-label="Filter by vehicle">
                                            <option value="ALL">All Vehicles</option>
                                        </select>
                                        <input type="date" class="trp-input-date" id="trpFilterTripDate" aria-label="Filter by trip date">
                                        <button type="button" class="ant-btn ant-btn-default ant-btn-sm" id="btnResetTripFilters" style="height: 36px;">
                                            <i class="fa-solid fa-rotate-left"></i> Reset
                                        </button>
                                    </div>
                                    <div class="trp-toolbar-right">
                                        <button type="button" class="ant-btn ant-btn-primary" id="btnToolbarStartDispatch">
                                            <i class="fa-solid fa-plus"></i> Dispatch Vehicle
                                        </button>
                                    </div>
                                </div>

                                <div class="trp-table-wrap">
                                    <table class="trp-table">
                                        <thead>
                                            <tr>
                                                <th>Trip #</th>
                                                <th>Vehicle</th>
                                                <th>Assigned Driver</th>
                                                <th>Destination / Linked Job</th>
                                                <th>Departure &amp; Return</th>
                                                <th>Odometer &amp; Distance</th>
                                                <th>Diesel Consumed &amp; Cost</th>
                                                <th>Status</th>
                                                <th class="text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="trpDispatchesTbody">
                                            <!-- Rendered dynamically by TransportTableRenderer -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- TAB 2: VEHICLES FLEET & DRIVER ASSIGNMENT -->
                            <div class="trp-tab-pane" id="paneTrpVehicles" style="display: none;">
                                <div class="trp-toolbar">
                                    <div class="trp-toolbar-left">
                                        <div class="trp-search-box">
                                            <i class="fa-solid fa-magnifying-glass"></i>
                                            <input type="text" id="trpSearchVehicles" placeholder="Search plate number, model, or assigned driver...">
                                        </div>
                                        <select class="trp-select" id="trpFilterVehicleStatus" aria-label="Filter by vehicle status">
                                            <option value="ALL">All Fleet Statuses</option>
                                            <option value="Available">Available</option>
                                            <option value="On Trip">On Trip</option>
                                            <option value="Maintenance">Maintenance</option>
                                        </select>
                                    </div>
                                    <div class="trp-toolbar-right">
                                        <button type="button" class="ant-btn ant-btn-primary" id="btnToolbarAddVehicle">
                                            <i class="fa-solid fa-plus"></i> Add New Vehicle
                                        </button>
                                    </div>
                                </div>

                                <div class="trp-table-wrap">
                                    <table class="trp-table">
                                        <thead>
                                            <tr>
                                                <th>Registration Plate</th>
                                                <th>Vehicle Model</th>
                                                <th>Assigned Driver</th>
                                                <th>Current Odometer</th>
                                                <th>Avg. Efficiency</th>
                                                <th>Lifetime Trips &amp; Fuel</th>
                                                <th>Fleet Status</th>
                                                <th class="text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="trpVehiclesTbody">
                                            <!-- Rendered dynamically by TransportTableRenderer -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- TAB 3: DRIVERS ROSTER -->
                            <div class="trp-tab-pane" id="paneTrpDrivers" style="display: none;">
                                <div class="trp-toolbar">
                                    <div class="trp-toolbar-left">
                                        <div class="trp-search-box">
                                            <i class="fa-solid fa-magnifying-glass"></i>
                                            <input type="text" id="trpSearchDrivers" placeholder="Search driver name, NIC, or mobile...">
                                        </div>
                                    </div>
                                    <div class="trp-toolbar-right">
                                        <button type="button" class="ant-btn ant-btn-primary" id="btnToolbarAddDriver">
                                            <i class="fa-solid fa-user-plus"></i> Register Driver
                                        </button>
                                    </div>
                                </div>

                                <div class="trp-table-wrap">
                                    <table class="trp-table">
                                        <thead>
                                            <tr>
                                                <th>Driver Name &amp; Role</th>
                                                <th>NIC Number</th>
                                                <th>Mobile</th>
                                                <th>Assigned Vehicle(s)</th>
                                                <th>Current Duty Status</th>
                                                <th>Trips &amp; Mileage</th>
                                            </tr>
                                        </thead>
                                        <tbody id="trpDriversTbody">
                                            <!-- Rendered dynamically by TransportTableRenderer -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- TAB 4: DIESEL PRICE HISTORY -->
                            <div class="trp-tab-pane" id="paneTrpDiesel" style="display: none;">
                                <div class="trp-toolbar">
                                    <div class="trp-toolbar-left">
                                        <div class="trp-info-callout">
                                            <i class="fa-solid fa-circle-info"></i>
                                            <span>Diesel cost on completed trips is automatically calculated using the active diesel price per liter (<code>desial_price</code> table).</span>
                                        </div>
                                    </div>
                                    <div class="trp-toolbar-right">
                                        <button type="button" class="ant-btn ant-btn-primary" id="btnToolbarUpdateDiesel">
                                            <i class="fa-solid fa-gas-pump"></i> Add New Diesel Rate
                                        </button>
                                    </div>
                                </div>

                                <div class="trp-table-wrap">
                                    <table class="trp-table">
                                        <thead>
                                            <tr>
                                                <th>Rate ID</th>
                                                <th>Effective Date</th>
                                                <th>Price per Liter (LKR)</th>
                                                <th>Trips Logged at Rate</th>
                                                <th>Rate Status</th>
                                            </tr>
                                        </thead>
                                        <tbody id="trpDieselTbody">
                                            <!-- Rendered dynamically by TransportTableRenderer -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {{-- Transport Management Modals --}}
                @include('ui::layouts.admin.modals.transport.transport-modals')

                <!-- Toast Notification -->
                <div class="trp-toast" id="trpToast">
                    <i class="fa-solid fa-circle-check" id="trpToastIcon"></i>
                    <span id="trpToastMsg">Operation completed successfully.</span>
                </div>

            </div>
        </main>
    </div>

@endsection

@push('scripts')
    <script id="transport-initial-data" type="application/json">@json($initialTransportData ?? null)</script>
    <script>
        window.__INITIAL_TRANSPORT_DATA__ = JSON.parse(document.getElementById('transport-initial-data')?.textContent || 'null');
    </script>
    {{ module_vite('build-ui', 'resources/assets/js/core.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/sidebar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/topbar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/admin/transport/TransportManager.js') }}
@endpush
