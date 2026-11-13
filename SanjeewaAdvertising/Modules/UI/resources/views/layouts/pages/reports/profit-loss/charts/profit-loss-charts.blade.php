<!-- Profit & Loss Statement: Graphical Charts View (Selectable Single Chart) -->
<div class="rep-view-section rep-chart-section" data-section-mode="chart">
    <div class="rep-chart-selector-bar">
        <div class="rep-chart-selector-left">
            <span class="rep-chart-selector-label"><i class="fa-solid fa-chart-simple"></i> Select Chart:</span>
            <div class="rep-chart-selector-pills">
                <button type="button" class="rep-chart-select-btn active" data-target-pane="pane_chartProfitLossSummary" data-tab-group="plCharts">
                    <i class="fa-solid fa-scale-balanced"></i> P&amp;L Summary Breakdown
                </button>
                <button type="button" class="rep-chart-select-btn" data-target-pane="pane_chartExpenseBreakdown" data-tab-group="plCharts">
                    <i class="fa-solid fa-bolt"></i> Overhead Expenses Share
                </button>
                <button type="button" class="rep-chart-select-btn" data-target-pane="pane_chartProfitMarginTrend" data-tab-group="plCharts">
                    <i class="fa-solid fa-chart-line"></i> Monthly Net Profit Trend
                </button>
            </div>
        </div>
        <select id="repProfitLossChartSelect" name="pl_chart_select" class="rep-chart-select-dropdown" data-tab-group="plCharts" aria-label="Select Profit and Loss Chart">
            <option value="pane_chartProfitLossSummary">P&amp;L Financial Performance Breakdown</option>
            <option value="pane_chartExpenseBreakdown">Operating Overhead Expenses Breakdown</option>
            <option value="pane_chartProfitMarginTrend">6-Month Net Profit &amp; Margin Trend</option>
        </select>
    </div>

    <!-- Chart 1: P&L Summary -->
    <div class="rep-single-chart-pane active" id="pane_chartProfitLossSummary" data-tab-group="plCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-scale-balanced"></i> P&amp;L Financial Performance Breakdown</span>
                <span class="rep-badge badge-paid">Revenue vs Costs</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartProfitLossSummary"></canvas>
            </div>
        </div>
    </div>

    <!-- Chart 2: Overhead Expenses Breakdown -->
    <div class="rep-single-chart-pane" id="pane_chartExpenseBreakdown" data-tab-group="plCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-bolt"></i> Operating Overhead Expenses Breakdown</span>
                <span class="rep-badge badge-pending">Expense Share</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartExpenseBreakdown"></canvas>
            </div>
        </div>
    </div>

    <!-- Chart 3: Monthly Net Profit Trend -->
    <div class="rep-single-chart-pane" id="pane_chartProfitMarginTrend" data-tab-group="plCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-chart-line"></i> 6-Month Net Operating Profit Trend (Rs.)</span>
                <span class="rep-badge badge-info">Profitability Trajectory</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartProfitMarginTrend"></canvas>
            </div>
        </div>
    </div>
</div>
