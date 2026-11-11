/**
 * SanjeewaAdvertising - Profit & Loss Statement Chart Builder
 *
 * Builds Chart.js configurations for the 3 selectable charts in Profit & Loss:
 * 1. P&L Financial Performance Summary (`chartProfitLossSummary`)
 * 2. Operating Overhead Expenses Breakdown (`chartExpenseBreakdown`)
 * 3. 6-Month Net Profit Trend (`chartProfitMarginTrend`)
 */

export class ProfitLossChartBuilder {
  constructor(themeConfig = {}) {
    this.theme = themeConfig;
  }

  buildProfitLossSummaryConfig(profitLoss = {}) {
    const { commonScaleOptions, barAnimation } = this.theme;
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

  buildExpenseBreakdownConfig(expensesBreakdown = {}) {
    const { isDark, commonLegend, pieAnimation } = this.theme;
    return {
      type: "doughnut",
      data: {
        labels: expensesBreakdown.labels || [],
        datasets: [
          {
            data: expensesBreakdown.values || [],
            backgroundColor: ["#ef4444", "#f59e0b", "#1677ff", "#8b5cf6", "#10b981"],
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

  buildProfitMarginTrendConfig(profitMarginTrend = {}) {
    const { commonLegend, commonScaleOptions, lineAnimation } = this.theme;
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

export default ProfitLossChartBuilder;
