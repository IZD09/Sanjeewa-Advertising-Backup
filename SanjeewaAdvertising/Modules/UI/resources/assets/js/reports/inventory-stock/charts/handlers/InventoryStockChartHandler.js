/**
 * SanjeewaAdvertising - Inventory & Stock Chart Handler
 *
 * Extends BaseReportChartHandler to coordinate all 3 individual Inventory & Stock charts.
 */

import { BaseReportChartHandler } from "../../../core/BaseReportChartHandler.js";
import {
  StockValuationChart,
  StockHealthChart,
  StockPriceComparisonChart
} from "../classes/index.js";

export class InventoryStockChartHandler extends BaseReportChartHandler {
  constructor(options = {}) {
    super({
      tabGroup: "inventoryCharts",
      chartRegistry: options.chartRegistry || {}
    });

    this.stockValuationChart = new StockValuationChart({ chartRegistry: this.charts });
    this.stockHealthChart = new StockHealthChart({ chartRegistry: this.charts });
    this.stockPriceComparisonChart = new StockPriceComparisonChart({ chartRegistry: this.charts });
  }

  renderCharts(payload = {}) {
    if (payload.stockValuation) {
      this.stockValuationChart.render(payload.stockValuation);
    }

    if (payload.stockHealth) {
      this.stockHealthChart.render(payload.stockHealth);
    }

    if (payload.stockPriceComparison) {
      this.stockPriceComparisonChart.render(payload.stockPriceComparison);
    }
  }
}

export default InventoryStockChartHandler;
