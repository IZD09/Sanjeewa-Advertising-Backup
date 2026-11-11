/**
 * SanjeewaAdvertising - Profit & Loss Statement Chart Handler
 *
 * Extends BaseReportChartHandler to coordinate all 3 individual Profit & Loss charts.
 */

import { BaseReportChartHandler } from "../../../core/BaseReportChartHandler.js";
import {
  ProfitLossSummaryChart,
  ExpenseBreakdownChart,
  ProfitMarginTrendChart
} from "../classes/index.js";

export class ProfitLossChartHandler extends BaseReportChartHandler {
  constructor(options = {}) {
    super({
      tabGroup: "plCharts",
      chartRegistry: options.chartRegistry || {}
    });

    this.profitLossSummaryChart = new ProfitLossSummaryChart({ chartRegistry: this.charts });
    this.expenseBreakdownChart = new ExpenseBreakdownChart({ chartRegistry: this.charts });
    this.profitMarginTrendChart = new ProfitMarginTrendChart({ chartRegistry: this.charts });
  }

  renderCharts(payload = {}) {
    if (payload.profitLoss) {
      this.profitLossSummaryChart.render(payload.profitLoss);
    }

    if (payload.expensesBreakdown) {
      this.expenseBreakdownChart.render(payload.expensesBreakdown);
    }

    if (payload.profitMarginTrend) {
      this.profitMarginTrendChart.render(payload.profitMarginTrend);
    }
  }
}

export default ProfitLossChartHandler;
