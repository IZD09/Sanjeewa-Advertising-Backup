/**
 * SanjeewaAdvertising - Sales Trend Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class SalesTrendChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartSalesTrend",
      chartKey: options.chartKey || "salesTrend",
      type: "line",
      title: "Monthly Sales Revenue Trend",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(salesTrend = {}) {
    const { commonLegend, commonScaleOptions, lineAnimation } = this.getThemeConfig();
    return {
      type: "line",
      data: {
        labels: salesTrend.labels || [],
        datasets: [
          {
            label: "Monthly Sales Revenue (Rs.)",
            data: salesTrend.revenue || [],
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.12)",
            fill: true,
            tension: 0,
            borderWidth: 2.5,
            pointRadius: 3.5,
            pointHoverRadius: 6,
            pointBackgroundColor: "#2563eb",
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

export default SalesTrendChart;
