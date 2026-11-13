<!-- Customer Receivables: Graphical Charts View (Selectable Single Chart) -->
<div class="rep-view-section rep-chart-section" data-section-mode="chart">
    <div class="rep-chart-selector-bar">
        <div class="rep-chart-selector-left">
            <span class="rep-chart-selector-label"><i class="fa-solid fa-chart-simple"></i> Select Chart:</span>
            <div class="rep-chart-selector-pills">
                <button type="button" class="rep-chart-select-btn active" data-target-pane="pane_chartReceivablesAging" data-tab-group="receivablesCharts">
                    <i class="fa-solid fa-hourglass-half"></i> Receivables Aging
                </button>
                <button type="button" class="rep-chart-select-btn" data-target-pane="pane_chartCustomerBalances" data-tab-group="receivablesCharts">
                    <i class="fa-solid fa-user-check"></i> Top Customer Balances
                </button>
                <button type="button" class="rep-chart-select-btn" data-target-pane="pane_chartReceivablesStatus" data-tab-group="receivablesCharts">
                    <i class="fa-solid fa-chart-pie"></i> Collection vs Overdue Share
                </button>
            </div>
        </div>
        <select id="repReceivablesChartSelect" name="receivables_chart_select" class="rep-chart-select-dropdown" data-tab-group="receivablesCharts" aria-label="Select Receivables Chart">
            <option value="pane_chartReceivablesAging">Receivables Aging Analysis (Bar Chart)</option>
            <option value="pane_chartCustomerBalances">Top Customers: Invoiced vs Paid</option>
            <option value="pane_chartReceivablesStatus">Collection vs Overdue Share (Doughnut)</option>
        </select>
    </div>

    <!-- Chart 1: Receivables Aging -->
    <div class="rep-single-chart-pane active" id="pane_chartReceivablesAging" data-tab-group="receivablesCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-hourglass-half"></i> Receivables Aging Analysis</span>
                <span class="rep-badge badge-pending">Overdue Buckets</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartReceivablesAging"></canvas>
            </div>
        </div>
    </div>

    <!-- Chart 2: Top Customers Invoiced vs Paid -->
    <div class="rep-single-chart-pane" id="pane_chartCustomerBalances" data-tab-group="receivablesCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-user-check"></i> Top Customers: Invoiced vs Paid</span>
                <span class="rep-badge badge-info">Account Comparison</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartCustomerBalances"></canvas>
            </div>
        </div>
    </div>

    <!-- Chart 3: Collection vs Overdue Share -->
    <div class="rep-single-chart-pane" id="pane_chartReceivablesStatus" data-tab-group="receivablesCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-chart-pie"></i> Overall Collection vs Outstanding Receivable Ratio</span>
                <span class="rep-badge badge-paid">Recovery Health</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartReceivablesStatus"></canvas>
            </div>
        </div>
    </div>
</div>
