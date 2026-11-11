/**
 * SanjeewaAdvertising - Sales By Category Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class SalesByCategoryChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartSalesByCategory",
      chartKey: options.chartKey || "salesByCategory",
      type: "doughnut",
      title: "Revenue Breakdown by Print Category",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(salesCategories = {}) {
    const { isDark, commonLegend, pieAnimation } = this.getThemeConfig();
    return {
      type: "doughnut",
      data: {
        labels: salesCategories.labels || [],
        datasets: [
          {
            data: salesCategories.values || [],
            backgroundColor: ["#1677ff", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"],
            borderWidth: 2,
            borderColor: isDark ? "#111a2e" : "#ffffff"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: pieAnimation,
        cutout: "62%",
        plugins: { legend: commonLegend }
      }
    };
  }
}

export default SalesByCategoryChart;
