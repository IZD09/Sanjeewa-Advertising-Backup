/**
 * SanjeewaAdvertising - Weekly Net Cash Flow Trend Line Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class NetCashFlowTrendChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartNetCashFlowTrend",
      chartKey: options.chartKey || "netCashFlowTrend",
      type: "line",
      title: "Weekly Net Cash Surplus Trend",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(cashFlow = {}) {
    const { commonLegend, commonScaleOptions, lineAnimation } = this.getThemeConfig();
    const netData = cashFlow.net || (cashFlow.inflow || []).map((inf, idx) => inf - ((cashFlow.outflow || [])[idx] || 0));
    return {
      type: "line",
      data: {
        labels: cashFlow.labels || [],
        datasets: [
          {
            label: "Net Cash Surplus (Rs.)",
            data: netData,
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.12)",
            borderWidth: 2.5,
            pointBackgroundColor: "#2563eb",
            pointRadius: 3.5,
            pointHoverRadius: 6,
            fill: true,
            tension: 0,
            borderJoinStyle: "round",
            borderCapStyle: "round"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: lineAnimation,
        plugins: { legend: commonLegend },
        scales: commonScaleOptions
      }
    };
  }
}

export default NetCashFlowTrendChart;
