/**
 * SanjeewaAdvertising - Cash Flow Channels Multi-Bar Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class CashFlowChannelsChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartCashFlowChannels",
      chartKey: options.chartKey || "cashFlow",
      type: "bar",
      title: "Cash Inflow vs Operating Expenses & GRN Outflow",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(cashFlow = {}) {
    const { commonLegend, commonScaleOptions, barAnimation } = this.getThemeConfig();
    return {
      type: "bar",
      data: {
        labels: cashFlow.labels || [],
        datasets: [
          {
            label: "Customer Inflow (Rs.)",
            data: cashFlow.inflow || [],
            backgroundColor: "#10b981",
            borderRadius: 6
          },
          {
            label: "Operating Expenses (Rs.)",
            data: cashFlow.operatingExpenses || cashFlow.outflow || [],
            backgroundColor: "#ef4444",
            borderRadius: 6
          },
          {
            label: "GRN Supplier Outflow (Rs.)",
            data: cashFlow.grnOutflow || [],
            backgroundColor: "#f59e0b",
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: barAnimation,
        plugins: { legend: commonLegend },
        scales: commonScaleOptions
      }
    };
  }
}

export default CashFlowChannelsChart;
