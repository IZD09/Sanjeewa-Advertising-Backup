/**
 * SanjeewaAdvertising - Stock Buy Cost vs Selling Price Comparison Bar Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class StockPriceComparisonChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartStockPriceComparison",
      chartKey: options.chartKey || "stockPriceComparison",
      type: "bar",
      title: "Material Unit Buy Cost vs Selling Price Comparison",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(stockPriceComparison = {}) {
    const { commonLegend, commonScaleOptions, barAnimation } = this.getThemeConfig();
    return {
      type: "bar",
      data: {
        labels: stockPriceComparison.labels || [],
        datasets: [
          {
            label: "Unit Buy Cost (Rs.)",
            data: stockPriceComparison.buyPrices || [],
            backgroundColor: "#f59e0b",
            borderRadius: 5
          },
          {
            label: "Selling Price (Rs.)",
            data: stockPriceComparison.sellPrices || [],
            backgroundColor: "#1677ff",
            borderRadius: 5
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

export default StockPriceComparisonChart;
