<!-- Payments, Cash Flow & Operating Expenses: Graphical Charts View (Selectable Single Chart) -->
<div class="rep-view-section rep-chart-section" data-section-mode="chart">
    <div class="rep-chart-selector-bar">
        <div class="rep-chart-selector-left">
            <span class="rep-chart-selector-label"><i class="fa-solid fa-chart-simple"></i> Select Chart:</span>
            <div class="rep-chart-selector-pills">
                <button type="button" class="rep-chart-select-btn active" data-target-pane="pane_chartCashFlowChannels" data-tab-group="paymentCharts">
                    <i class="fa-solid fa-chart-bar"></i> Inflow vs Expenses &amp; GRN
                </button>
                <button type="button" class="rep-chart-select-btn" data-target-pane="pane_chartOperatingExpenses" data-tab-group="paymentCharts">
                    <i class="fa-solid fa-receipt"></i> Operating Expenses Breakdown
                </button>
                <button type="button" class="rep-chart-select-btn" data-target-pane="pane_chartOperatingExpensesStatus" data-tab-group="paymentCharts">
                    <i class="fa-solid fa-file-circle-check"></i> Paid vs Pending Expenses
                </button>
                <button type="button" class="rep-chart-select-btn" data-target-pane="pane_chartPaymentMethods" data-tab-group="paymentCharts">
                    <i class="fa-solid fa-wallet"></i> Payment Methods
                </button>
                <button type="button" class="rep-chart-select-btn" data-target-pane="pane_chartNetCashFlowTrend" data-tab-group="paymentCharts">
                    <i class="fa-solid fa-chart-line"></i> Net Cash Surplus Trend
                </button>
                <button type="button" class="rep-chart-select-btn" data-target-pane="pane_chartChannelDistribution" data-tab-group="paymentCharts">
                    <i class="fa-solid fa-chart-pie"></i> 3-Channel Share
                </button>
            </div>
        </div>
        <select id="repCashFlowChartSelect" name="cashflow_chart_select" class="rep-chart-select-dropdown" data-tab-group="paymentCharts" aria-label="Select Cash Flow Chart">
            <option value="pane_chartCashFlowChannels">Cash Inflow vs Operating Expenses &amp; GRN Outflow</option>
            <option value="pane_chartOperatingExpenses">Operating Expenses by Utility / Overhead Category</option>
            <option value="pane_chartOperatingExpensesStatus">Operating Expenses Status (Paid vs Pending Bills)</option>
            <option value="pane_chartPaymentMethods">Collections by Payment Method</option>
            <option value="pane_chartNetCashFlowTrend">Weekly Net Cash Surplus Trend</option>
            <option value="pane_chartChannelDistribution">3-Channel Settlement Share (Inflow / GRN / Expenses)</option>
        </select>
    </div>

    <!-- Chart 1: Inflow vs Operating Expenses & GRN Outflow -->
    <div class="rep-single-chart-pane active" id="pane_chartCashFlowChannels" data-tab-group="paymentCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-chart-bar"></i> Cash Inflow vs Operating Expenses &amp; GRN Outflow Comparison</span>
                <span class="rep-badge badge-paid">Weekly 3-Channel Comparison</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartCashFlowChannels"></canvas>
            </div>
        </div>
    </div>

    <!-- Chart 2: Operating Expenses Breakdown by Category -->
    <div class="rep-single-chart-pane" id="pane_chartOperatingExpenses" data-tab-group="paymentCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-receipt"></i> Operating Expenses Breakdown by Category (Rs.)</span>
                <span class="rep-badge badge-overdue">Rent, Electricity, Water, Internet &amp; Maintenance</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartOperatingExpenses"></canvas>
            </div>
        </div>
    </div>

    <!-- Chart 3: Operating Expenses Paid vs Pending Status -->
    <div class="rep-single-chart-pane" id="pane_chartOperatingExpensesStatus" data-tab-group="paymentCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-file-circle-check"></i> Operating Expenses Settlement Status (Paid vs Pending Bills)</span>
                <span class="rep-badge badge-pending">Overhead Bill Status</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartOperatingExpensesStatus"></canvas>
            </div>
        </div>
    </div>

    <!-- Chart 4: Payment Methods -->
    <div class="rep-single-chart-pane" id="pane_chartPaymentMethods" data-tab-group="paymentCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-wallet"></i> Collections by Payment Method</span>
                <span class="rep-badge badge-info">Channel Share</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartPaymentMethods"></canvas>
            </div>
        </div>
    </div>

    <!-- Chart 5: Net Cash Flow Surplus Trend -->
    <div class="rep-single-chart-pane" id="pane_chartNetCashFlowTrend" data-tab-group="paymentCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-chart-line"></i> Weekly Net Cash Surplus Trend (Inflow - Outflow)</span>
                <span class="rep-badge badge-paid">Liquidity Trend</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartNetCashFlowTrend"></canvas>
            </div>
        </div>
    </div>

    <!-- Chart 6: 3-Channel Settlement Share -->
    <div class="rep-single-chart-pane" id="pane_chartChannelDistribution" data-tab-group="paymentCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-chart-pie"></i> 3-Channel Financial Volume Distribution</span>
                <span class="rep-badge badge-info">Invoices / GRN / Operating Expenses</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartChannelDistribution"></canvas>
            </div>
        </div>
    </div>
</div>
