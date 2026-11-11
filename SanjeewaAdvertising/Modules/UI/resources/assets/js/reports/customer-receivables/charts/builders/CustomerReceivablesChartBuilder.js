/**
 * SanjeewaAdvertising - Customer Receivables Chart Builder
 *
 * Builds Chart.js configurations for the 3 selectable charts in Customer Receivables:
 * 1. Receivables Aging Buckets (`chartReceivablesAging`)
 * 2. Top Customers Invoiced vs Paid (`chartCustomerBalances`)
 * 3. Overall Collection vs Outstanding Receivable Ratio (`chartReceivablesStatus`)
 */

export class CustomerReceivablesChartBuilder {
  constructor(themeConfig = {}) {
    this.theme = themeConfig;
  }

  buildAgingConfig(receivablesAging = {}) {
    const { commonScaleOptions, barAnimation } = this.theme;
    return {
      type: "bar",
      data: {
        labels: receivablesAging.labels || [],
        datasets: [
          {
            label: "Receivables by Age (Rs.)",
            data: receivablesAging.values || [],
            backgroundColor: ["#10b981", "#f59e0b", "#f97316", "#ef4444"],
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

  buildCustomerBalancesConfig(topCustomers = {}) {
    const { commonLegend, commonScaleOptions, barAnimation } = this.theme;
    return {
      type: "bar",
      data: {
        labels: topCustomers.labels || [],
        datasets: [
          {
            label: "Total Invoiced (Rs.)",
            data: topCustomers.invoiced || [],
            backgroundColor: "#1677ff",
            borderRadius: 5
          },
          {
            label: "Amount Paid (Rs.)",
            data: topCustomers.paid || [],
            backgroundColor: "#10b981",
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

  buildReceivablesStatusConfig(receivablesStatus = {}) {
    const { isDark, commonLegend, pieAnimation } = this.theme;
    return {
      type: "doughnut",
      data: {
        labels: receivablesStatus.labels || [],
        datasets: [
          {
            data: receivablesStatus.values || [],
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
}

export default CustomerReceivablesChartBuilder;
