/**
 * SanjeewaAdvertising - Supplier Purchases vs Paid vs Payable Multi-Bar Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class SupplierPayablesChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartSupplierPayables",
      chartKey: options.chartKey || "supplierPayables",
      type: "bar",
      title: "Supplier Purchases vs Paid vs Payable",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(suppliers = {}) {
    const { commonLegend, commonScaleOptions, barAnimation } = this.getThemeConfig();
    return {
      type: "bar",
      data: {
        labels: suppliers.labels || [],
        datasets: [
          {
            label: "GRN Purchases",
            data: suppliers.purchases || [],
            backgroundColor: "#1677ff",
            borderRadius: 5
          },
          {
            label: "Total Paid",
            data: suppliers.paid || [],
            backgroundColor: "#10b981",
            borderRadius: 5
          },
          {
            label: "Pending Payable",
            data: suppliers.payable || [],
            backgroundColor: "#ef4444",
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

export default SupplierPayablesChart;
