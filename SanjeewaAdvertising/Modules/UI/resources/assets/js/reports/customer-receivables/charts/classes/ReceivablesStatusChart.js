/**
 * SanjeewaAdvertising - Receivables Status Doughnut Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class ReceivablesStatusChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartReceivablesStatus",
      chartKey: options.chartKey || "receivablesStatus",
      type: "doughnut",
      title: "Overall Collection vs Outstanding Receivables Ratio",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(receivablesStatus = {}) {
    const { isDark, commonLegend, pieAnimation } = this.getThemeConfig();
    return {
      type: "doughnut",
      data: {
        labels: receivablesStatus.labels || [],
        datasets: [
          {
            data: receivablesStatus.values || [],
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

export default ReceivablesStatusChart;
