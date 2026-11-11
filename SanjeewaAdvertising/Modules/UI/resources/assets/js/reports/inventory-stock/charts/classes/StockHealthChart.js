/**
 * SanjeewaAdvertising - Stock Health Doughnut Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class StockHealthChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartStockHealth",
      chartKey: options.chartKey || "stockHealth",
      type: "doughnut",
      title: "Inventory Reorder Health Ratio",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(stockHealth = {}) {
    const { isDark, commonLegend, pieAnimation } = this.getThemeConfig();
    return {
      type: "doughnut",
      data: {
        labels: stockHealth.labels || [],
        datasets: [
          {
            data: stockHealth.values || [],
            backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
            borderWidth: 2,
            borderColor: isDark ? "#111a2e" : "#ffffff"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: pieAnimation,
        cutout: "60%",
        plugins: { legend: commonLegend }
      }
    };
  }
}

export default StockHealthChart;
