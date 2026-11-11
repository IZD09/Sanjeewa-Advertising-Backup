/**
 * SanjeewaAdvertising - Sales & Orders Chart Builder
 *
 * Builds Chart.js configurations for the 4 selectable charts in the Sales & Orders report:
 * 1. Monthly Sales Revenue Trend (`chartSalesTrend`)
 * 2. Revenue Breakdown by Print Category (`chartSalesByCategory`)
 * 3. Order Fulfillment Status Breakdown (`chartOrderStatus`)
 * 4. Monthly Order Volume Trend (`chartOrderVolumeTrend`)
 */

export class SalesOrdersChartBuilder {
  /**
   * @param {Object} themeConfig
   */
  constructor(themeConfig = {}) {
    this.theme = themeConfig;
  }

  buildSalesTrendConfig(salesTrend = {}) {
    const { commonLegend, commonScaleOptions, lineAnimation } = this.theme;
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

  buildSalesByCategoryConfig(salesCategories = {}) {
    const { isDark, commonLegend, pieAnimation } = this.theme;
    return {
      type: "doughnut",
      data: {
        labels: salesCategories.labels || [],
        datasets: [
          {
            data: salesCategories.values || [],
            backgroundColor: ["#1677ff", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"],
            borderWidth: 2,
            borderColor: isDark ? "#111a2e" : "#ffffff"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: pieAnimation,
        cutout: "62%",
        plugins: { legend: commonLegend }
      }
    };
  }

  buildOrderStatusConfig(orderStatus = {}) {
    const { isDark, commonLegend, pieAnimation } = this.theme;
    return {
      type: "doughnut",
      data: {
        labels: orderStatus.labels || [],
        datasets: [
          {
            label: "Orders Count",
            data: orderStatus.values || [],
            backgroundColor: ["#10b981", "#1677ff", "#f59e0b", "#8b5cf6"],
            borderWidth: 2,
            borderColor: isDark ? "#111a2e" : "#ffffff"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: pieAnimation,
        cutout: "58%",
        plugins: { legend: commonLegend }
      }
    };
  }

  buildOrderVolumeTrendConfig(salesTrend = {}) {
    const { textColor, gridColor, commonLegend, commonScaleOptions, lineAnimation } = this.theme;
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

export default SalesOrdersChartBuilder;
