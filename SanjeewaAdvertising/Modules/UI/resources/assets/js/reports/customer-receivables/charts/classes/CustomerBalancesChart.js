/**
 * SanjeewaAdvertising - Top Customers Invoiced vs Paid Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class CustomerBalancesChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartCustomerBalances",
      chartKey: options.chartKey || "topCustomers",
      type: "bar",
      title: "Top Customers Invoiced vs Paid Comparison",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(topCustomers = {}) {
    const { commonLegend, commonScaleOptions, barAnimation } = this.getThemeConfig();
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
}

export default CustomerBalancesChart;
