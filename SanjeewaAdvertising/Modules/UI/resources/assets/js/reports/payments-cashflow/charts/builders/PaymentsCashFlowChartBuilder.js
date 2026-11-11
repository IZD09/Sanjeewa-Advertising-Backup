/**
 * SanjeewaAdvertising - Payments & Cash Flow Chart Builder (Incl. Operating Expenses)
 *
 * Builds Chart.js configurations for the 6 selectable charts in the Payments & Cash Flow report:
 * 1. Cash Inflow vs Operating Expenses & GRN Outflow (`chartCashFlowChannels`)
 * 2. Operating Expenses Breakdown by Category (`chartOperatingExpenses`)
 * 3. Operating Expenses Settlement Status: Paid vs Pending (`chartOperatingExpensesStatus`)
 * 4. Collections by Payment Method (`chartPaymentMethods`)
 * 5. Weekly Net Cash Surplus Trend (`chartNetCashFlowTrend`)
 * 6. 3-Channel Financial Volume Distribution (`chartChannelDistribution`)
 */

export class PaymentsCashFlowChartBuilder {
  constructor(themeConfig = {}) {
    this.theme = themeConfig;
  }

  buildCashFlowChannelsConfig(cashFlow = {}) {
    const { commonLegend, commonScaleOptions, barAnimation } = this.theme;
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

  buildOperatingExpensesCategoryConfig(operatingExpensesByCategory = {}) {
    const { textColor, gridColor, barAnimation } = this.theme;
    return {
      type: "bar",
      data: {
        labels: operatingExpensesByCategory.labels || [],
        datasets: [
          {
            label: "Operating Expense Amount (Rs.)",
            data: operatingExpensesByCategory.values || [],
            backgroundColor: ["#ef4444", "#f59e0b", "#1677ff", "#8b5cf6", "#10b981"],
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
              callback: (val) => (val >= 1000 ? "Rs. " + (val / 1000).toFixed(0) + "k" : val)
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

  buildOperatingExpensesStatusConfig(operatingExpensesStatus = {}) {
    const { isDark, commonLegend, pieAnimation } = this.theme;
    return {
      type: "doughnut",
      data: {
        labels: operatingExpensesStatus.labels || [],
        datasets: [
          {
            data: operatingExpensesStatus.values || [],
            backgroundColor: ["#10b981", "#f59e0b"],
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

  buildPaymentMethodsConfig(paymentMethods = {}) {
    const { isDark, commonLegend, pieAnimation } = this.theme;
    return {
      type: "doughnut",
      data: {
        labels: paymentMethods.labels || [],
        datasets: [
          {
            data: paymentMethods.values || [],
            backgroundColor: ["#1677ff", "#10b981", "#f59e0b", "#8b5cf6"],
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

  buildNetCashFlowTrendConfig(cashFlow = {}) {
    const { commonLegend, commonScaleOptions, lineAnimation } = this.theme;
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

  buildChannelDistributionConfig(channelDistribution = {}) {
    const { isDark, commonLegend, pieAnimation } = this.theme;
    return {
      type: "doughnut",
      data: {
        labels: channelDistribution.labels || [],
        datasets: [
          {
            data: channelDistribution.values || [],
            backgroundColor: ["#1677ff", "#f59e0b", "#ef4444"],
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
}

export default PaymentsCashFlowChartBuilder;
