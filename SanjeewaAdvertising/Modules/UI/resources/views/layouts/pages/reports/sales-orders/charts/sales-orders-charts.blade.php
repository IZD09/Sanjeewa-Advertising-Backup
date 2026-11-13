<!-- Sales & Orders: Graphical Charts View (Selectable Single Chart) -->
<div class="rep-view-section rep-chart-section" data-section-mode="chart">
    <div class="rep-chart-selector-bar">
        <div class="rep-chart-selector-left">
            <span class="rep-chart-selector-label"><i class="fa-solid fa-chart-simple"></i> Select Chart:</span>
            <div class="rep-chart-selector-pills">
                <button type="button" class="rep-chart-select-btn active" data-target-pane="pane_chartSalesTrend" data-tab-group="salesCharts">
                    <i class="fa-solid fa-chart-line"></i> Monthly Revenue Trend
                </button>
                <button type="button" class="rep-chart-select-btn" data-target-pane="pane_chartSalesByCategory" data-tab-group="salesCharts">
                    <i class="fa-solid fa-chart-pie"></i> Print Category Share
                </button>
                <button type="button" class="rep-chart-select-btn" data-target-pane="pane_chartOrderStatus" data-tab-group="salesCharts">
                    <i class="fa-solid fa-list-check"></i> Order Status Breakdown
                </button>
                <button type="button" class="rep-chart-select-btn" data-target-pane="pane_chartOrderVolumeTrend" data-tab-group="salesCharts">
                    <i class="fa-solid fa-chart-line"></i> Order Volume Trend
                </button>
            </div>
        </div>
        <select id="repSalesChartSelect" name="sales_chart_select" class="rep-chart-select-dropdown" data-tab-group="salesCharts" aria-label="Select Sales Chart">
            <option value="pane_chartSalesTrend">Monthly Revenue Trend (Line Chart)</option>
            <option value="pane_chartSalesByCategory">Print Category Share (Doughnut Chart)</option>
            <option value="pane_chartOrderStatus">Order Status Breakdown (Status Chart)</option>
            <option value="pane_chartOrderVolumeTrend">Order Volume Trend (Line Chart)</option>
        </select>
    </div>

    <!-- Chart 1: Monthly Sales Revenue -->
    <div class="rep-single-chart-pane active" id="pane_chartSalesTrend" data-tab-group="salesCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-chart-line"></i> Monthly Sales Revenue Trend (Rs.)</span>
                <span class="rep-badge badge-info">6-Month Revenue</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartSalesTrend"></canvas>
            </div>
        </div>
    </div>

    <!-- Chart 2: Revenue Breakdown by Print Category -->
    <div class="rep-single-chart-pane" id="pane_chartSalesByCategory" data-tab-group="salesCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-chart-pie"></i> Revenue Breakdown by Print Category</span>
                <span class="rep-badge badge-paid">Product Share</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartSalesByCategory"></canvas>
            </div>
        </div>
    </div>

    <!-- Chart 3: Order Fulfillment Status Breakdown -->
    <div class="rep-single-chart-pane" id="pane_chartOrderStatus" data-tab-group="salesCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-list-check"></i> Sales &amp; Print Order Status Breakdown</span>
                <span class="rep-badge badge-pending">Fulfillment Status</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartOrderStatus"></canvas>
            </div>
        </div>
    </div>

    <!-- Chart 4: Monthly Order Volume Trend -->
    <div class="rep-single-chart-pane" id="pane_chartOrderVolumeTrend" data-tab-group="salesCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-chart-line"></i> Monthly Print Job Volume Trend (Orders Count)</span>
                <span class="rep-badge badge-info">Order Growth</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartOrderVolumeTrend"></canvas>
            </div>
        </div>
    </div>
</div>
