/**
 * SanjeewaAdvertising - GRN Purchase Share by Supplier Doughnut Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class SupplierShareChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartSupplierShare",
      chartKey: options.chartKey || "supplierShare",
      type: "doughnut",
      title: "GRN Purchase Share by Supplier",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(suppliers = {}) {
    const { isDark, commonLegend, pieAnimation } = this.getThemeConfig();
    return {
      type: "doughnut",
      data: {
        labels: suppliers.labels || [],
        datasets: [
          {
            data: suppliers.purchases || [],
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
}

export default SupplierShareChart;
