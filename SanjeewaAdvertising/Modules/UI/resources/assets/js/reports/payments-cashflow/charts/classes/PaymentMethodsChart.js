/**
 * SanjeewaAdvertising - Payment Methods Doughnut Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class PaymentMethodsChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartPaymentMethods",
      chartKey: options.chartKey || "paymentMethods",
      type: "doughnut",
      title: "Collections by Payment Method",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(paymentMethods = {}) {
    const { isDark, commonLegend, pieAnimation } = this.getThemeConfig();
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
}

export default PaymentMethodsChart;
