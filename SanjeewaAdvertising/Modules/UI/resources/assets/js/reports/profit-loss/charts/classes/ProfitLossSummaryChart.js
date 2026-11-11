/**
 * SanjeewaAdvertising - Profit & Loss Financial Summary Bar Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class ProfitLossSummaryChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartProfitLossSummary",
      chartKey: options.chartKey || "profitLoss",
      type: "bar",
      title: "P&L Financial Performance Summary",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(profitLoss = {}) {
    const { commonScaleOptions, barAnimation } = this.getThemeConfig();
    return {
      type: "bar",
      data: {
        labels: profitLoss.labels || [],
        datasets: [
          {
            label: "Amount (Rs.)",
            data: profitLoss.values || [],
            backgroundColor: ["#1677ff", "#f59e0b", "#10b981", "#ef4444", "#0958d9"],
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

export default ProfitLossSummaryChart;
