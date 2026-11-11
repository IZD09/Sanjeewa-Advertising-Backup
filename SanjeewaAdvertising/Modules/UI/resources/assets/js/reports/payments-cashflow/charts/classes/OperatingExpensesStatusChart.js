/**
 * SanjeewaAdvertising - Operating Expenses Settlement Status Doughnut Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class OperatingExpensesStatusChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartOperatingExpensesStatus",
      chartKey: options.chartKey || "operatingExpensesStatus",
      type: "doughnut",
      title: "Operating Expenses Settlement Status (Paid vs Pending)",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(operatingExpensesStatus = {}) {
    const { isDark, commonLegend, pieAnimation } = this.getThemeConfig();
    return {
      type: "doughnut",
      data: {
        labels: operatingExpensesStatus.labels || [],
        datasets: [
          {
            data: operatingExpensesStatus.values || [],
            backgroundColor: ["#10b981", "#f59e0b"],
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

export default OperatingExpensesStatusChart;
