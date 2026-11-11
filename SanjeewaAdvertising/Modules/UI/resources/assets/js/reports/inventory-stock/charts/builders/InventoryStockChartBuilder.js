/**
 * SanjeewaAdvertising - Inventory & Stock Chart Builder
 *
 * Builds Chart.js configurations for the 3 selectable charts in Inventory & Stock:
 * 1. Stock Valuation by Material (`chartStockValuation`)
 * 2. Inventory Reorder Health (`chartStockHealth`)
 * 3. Material Unit Buy Cost vs Selling Price Comparison (`chartStockPriceComparison`)
 */

export class InventoryStockChartBuilder {
  constructor(themeConfig = {}) {
    this.theme = themeConfig;
  }

  buildStockValuationConfig(stockValuation = {}) {
    const { textColor, gridColor, barAnimation } = this.theme;
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

  buildStockHealthConfig(stockHealth = {}) {
    const { isDark, commonLegend, pieAnimation } = this.theme;
    return {
      type: "doughnut",
      data: {
        labels: stockHealth.labels || [],
        datasets: [
          {
            data: stockHealth.values || [],
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

  buildStockPriceComparisonConfig(stockPriceComparison = {}) {
    const { commonLegend, commonScaleOptions, barAnimation } = this.theme;
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

export default InventoryStockChartBuilder;
