/**
 * SanjeewaAdvertising - Order Status Breakdown Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class OrderStatusChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartOrderStatus",
      chartKey: options.chartKey || "orderStatus",
      type: "doughnut",
      title: "Order Fulfillment Status Breakdown",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(orderStatus = {}) {
    const { isDark, commonLegend, pieAnimation } = this.getThemeConfig();
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
}

export default OrderStatusChart;
