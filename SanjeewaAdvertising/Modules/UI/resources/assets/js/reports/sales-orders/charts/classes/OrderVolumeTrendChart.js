/**
 * SanjeewaAdvertising - Order Volume Trend Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class OrderVolumeTrendChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartOrderVolumeTrend",
      chartKey: options.chartKey || "orderVolumeTrend",
      type: "line",
      title: "Monthly Order Volume Trend",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(salesTrend = {}) {
    const { textColor, gridColor, commonLegend, commonScaleOptions, lineAnimation } = this.getThemeConfig();
    return {
      type: "line",
      data: {
        labels: salesTrend.labels || [],
        datasets: [
          {
            label: "Completed Print Jobs (Count)",
            data: salesTrend.orders || [],
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
        scales: {
          x: commonScaleOptions?.x || {},
          y: {
            beginAtZero: true,
            ticks: { color: textColor, font: { size: 11.5 }, callback: (v) => v + " jobs" },
            grid: { color: gridColor }
          }
        }
      }
    };
  }
}

export default OrderVolumeTrendChart;
