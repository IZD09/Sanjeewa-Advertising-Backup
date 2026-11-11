/**
 * SanjeewaAdvertising - Stock Valuation Horizontal Bar Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class StockValuationChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartStockValuation",
      chartKey: options.chartKey || "stockValuation",
      type: "bar",
      title: "Stock Valuation by Material",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(stockValuation = {}) {
    const { textColor, gridColor, barAnimation } = this.getThemeConfig();
    return {
      type: "bar",
      data: {
        labels: stockValuation.labels || [],
        datasets: [
          {
            label: "Stock Valuation (Rs.)",
            data: stockValuation.values || [],
            backgroundColor: "#1677ff",
            borderRadius: 6
          }
        ]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        animation: barAnimation,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: textColor,
              font: { size: 11.5 },
              callback: (val) => "Rs. " + (val / 1000).toFixed(0) + "k"
            },
            grid: { color: gridColor }
          },
          y: {
            ticks: { color: textColor, font: { size: 11.5, weight: "600" } },
            grid: { display: false }
          }
        }
      }
    };
  }
}

export default StockValuationChart;
