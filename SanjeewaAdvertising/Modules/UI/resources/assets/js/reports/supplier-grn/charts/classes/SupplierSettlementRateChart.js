/**
 * SanjeewaAdvertising - Supplier Payment Settlement Completion Rate % Horizontal Bar Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class SupplierSettlementRateChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartSupplierSettlementRate",
      chartKey: options.chartKey || "supplierSettlementRate",
      type: "bar",
      title: "Supplier Payment Settlement Completion Rate %",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(suppliers = {}) {
    const { textColor, gridColor, barAnimation } = this.getThemeConfig();
    return {
      type: "bar",
      data: {
        labels: suppliers.labels || [],
        datasets: [
          {
            label: "Settlement Completion (%)",
            data: suppliers.settlementRate || [],
            backgroundColor: ["#1677ff", "#10b981", "#059669", "#f59e0b"],
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
            max: 100,
            ticks: { color: textColor, font: { size: 11.5 }, callback: (v) => v + "%" },
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

export default SupplierSettlementRateChart;
