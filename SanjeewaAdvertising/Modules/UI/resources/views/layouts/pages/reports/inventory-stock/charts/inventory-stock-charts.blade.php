<!-- Inventory & Stock: Graphical Charts View (Selectable Single Chart) -->
<div class="rep-view-section rep-chart-section" data-section-mode="chart">
    <div class="rep-chart-selector-bar">
        <div class="rep-chart-selector-left">
            <span class="rep-chart-selector-label"><i class="fa-solid fa-chart-simple"></i> Select Chart:</span>
            <div class="rep-chart-selector-pills">
                <button type="button" class="rep-chart-select-btn active" data-target-pane="pane_chartStockValuation" data-tab-group="inventoryCharts">
                    <i class="fa-solid fa-boxes-stacked"></i> Stock Valuation
                </button>
                <button type="button" class="rep-chart-select-btn" data-target-pane="pane_chartStockHealth" data-tab-group="inventoryCharts">
                    <i class="fa-solid fa-shield-heart"></i> Reorder Health Status
                </button>
                <button type="button" class="rep-chart-select-btn" data-target-pane="pane_chartStockPriceComparison" data-tab-group="inventoryCharts">
                    <i class="fa-solid fa-scale-unbalanced"></i> Buy vs Selling Price
                </button>
            </div>
        </div>
        <select id="repInventoryChartSelect" name="inventory_chart_select" class="rep-chart-select-dropdown" data-tab-group="inventoryCharts" aria-label="Select Inventory Chart">
            <option value="pane_chartStockValuation">Stock Valuation by Material (Rs.)</option>
            <option value="pane_chartStockHealth">Inventory Reorder Health Status</option>
            <option value="pane_chartStockPriceComparison">Unit Buy Cost vs Selling Price Comparison</option>
        </select>
    </div>

    <!-- Chart 1: Stock Valuation -->
    <div class="rep-single-chart-pane active" id="pane_chartStockValuation" data-tab-group="inventoryCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-boxes-stacked"></i> Stock Valuation by Material (Rs.)</span>
                <span class="rep-badge badge-info">Asset Value</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartStockValuation"></canvas>
            </div>
        </div>
    </div>

    <!-- Chart 2: Stock Reorder Health -->
    <div class="rep-single-chart-pane" id="pane_chartStockHealth" data-tab-group="inventoryCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-shield-heart"></i> Inventory Reorder Health</span>
                <span class="rep-badge badge-paid">Stock Status</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartStockHealth"></canvas>
            </div>
        </div>
    </div>

    <!-- Chart 3: Unit Buy Cost vs Selling Price Comparison -->
    <div class="rep-single-chart-pane" id="pane_chartStockPriceComparison" data-tab-group="inventoryCharts">
        <div class="rep-chart-card">
            <div class="rep-chart-header">
                <span class="rep-chart-title"><i class="fa-solid fa-scale-unbalanced"></i> Material Unit Buy Cost vs Selling Price Comparison (Rs.)</span>
                <span class="rep-badge badge-info">Unit Margin</span>
            </div>
            <div class="rep-chart-canvas-wrap">
                <canvas id="chartStockPriceComparison"></canvas>
            </div>
        </div>
    </div>
</div>
