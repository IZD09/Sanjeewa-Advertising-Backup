/**
 * SanjeewaAdvertising - 6-Month Profit Margin Trend Line Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class ProfitMarginTrendChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartProfitMarginTrend",
      chartKey: options.chartKey || "profitMarginTrend",
      type: "line",
      title: "6-Month Profit Margin Trend",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(profitMarginTrend = {}) {
    const { commonLegend, commonScaleOptions, lineAnimation } = this.getThemeConfig();
    return {
      type: "line",
      data: {
        labels: profitMarginTrend.labels || [],
        datasets: [
          {
            label: "Net Operating Profit (Rs.)",
            data: profitMarginTrend.netProfit || [],
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

export default ProfitMarginTrendChart;
