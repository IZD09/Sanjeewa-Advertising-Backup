/**
 * SanjeewaAdvertising - Receivables Aging Buckets Bar Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class ReceivablesAgingChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartReceivablesAging",
      chartKey: options.chartKey || "receivablesAging",
      type: "bar",
      title: "Receivables Aging Buckets",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(receivablesAging = {}) {
    const { commonScaleOptions, barAnimation } = this.getThemeConfig();
    return {
      type: "bar",
      data: {
        labels: receivablesAging.labels || [],
        datasets: [
          {
            label: "Receivables by Age (Rs.)",
            data: receivablesAging.values || [],
            backgroundColor: ["#10b981", "#f59e0b", "#f97316", "#ef4444"],
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: barAnimation,
        plugins: { legend: { display: false } },
        scales: commonScaleOptions
      }
    };
  }
}

export default ReceivablesAgingChart;
