<!-- Supplier & GRN: Graphical Charts View (Selectable Single Chart) -->
<div class="rep-view-section rep-chart-section" data-section-mode="chart">
    <div class="rep-chart-selector-bar">
        <div class="rep-chart-selector-left">
            <span class="rep-chart-selector-label"><i class="fa-solid fa-chart-simple"></i> Select Chart:</span>
            <div class="rep-chart-selector-pills">
                <button type="button" class="rep-chart-select-btn active" data-target-pane="pane_chartSupplierPayables" data-tab-group="supplierCharts">
                    <i class="fa-solid fa-truck-ramp-box"></i> Purchases vs Payables
                </button>
                <button type="button" class="rep-chart-select-btn" data-target-pane="pane_chartSupplierShare" data-tab-group="supplierCharts">
                    <i class="fa-solid fa-chart-pie"></i> Supplier GRN Share
                </button>
                <button type="button" class="rep-chart-select-btn" data-target-pane="pane_chartSupplierSettlementRate" data-tab-group="supplierCharts">
                    <i class="fa-solid fa-percent"></i> Settlement Completion %
                </button>
            </div>
        </div>
        <select id="repSupplierChartSelect" name="supplier_chart_select" class="rep-chart-select-dropdown" data-tab-group="supplierCharts" aria-label="Select Supplier Chart">
            <option value="pane_chartSupplierPayables">Supplier Purchases vs Paid vs Payable</option>
            <option value="pane_chartSupplierShare">GRN Purchase Share by Supplier</option>
            <option value="pane_chartSupplierSettlementRate">Supplier Payment Settlement Rate (%)</option>
        </select>
    </div>

    <!-- Chart 1: Supplier Payables -->
    <div class="rep-single-chart-pane active" id="pane_chartSupplierPayables" data-tab-group="supplierCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-truck-ramp-box"></i> Supplier Purchases vs Paid vs Payable</span>
                <span class="rep-badge badge-info">Vendor Balances</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartSupplierPayables"></canvas>
            </div>
        </div>
    </div>

    <!-- Chart 2: Supplier Share -->
    <div class="rep-single-chart-pane" id="pane_chartSupplierShare" data-tab-group="supplierCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-chart-pie"></i> GRN Purchase Share by Supplier</span>
                <span class="rep-badge badge-paid">Procurement Split</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartSupplierShare"></canvas>
            </div>
        </div>
    </div>

    <!-- Chart 3: Supplier Settlement Rate -->
    <div class="rep-single-chart-pane" id="pane_chartSupplierSettlementRate" data-tab-group="supplierCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-percent"></i> Supplier Payment Settlement Completion Rate (%)</span>
                <span class="rep-badge badge-paid">Settlement Progress</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartSupplierSettlementRate"></canvas>
            </div>
        </div>
    </div>
</div>
