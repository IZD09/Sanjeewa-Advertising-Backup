/**
 * SanjeewaAdvertising - Operating Expense Breakdown Doughnut Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class ExpenseBreakdownChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartExpenseBreakdown",
      chartKey: options.chartKey || "expensesBreakdown",
      type: "doughnut",
      title: "Operating Overhead Expenses Breakdown",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(expensesBreakdown = {}) {
    const { isDark, commonLegend, pieAnimation } = this.getThemeConfig();
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
}

export default ExpenseBreakdownChart;
