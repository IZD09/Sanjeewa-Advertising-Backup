/**
 * SanjeewaAdvertising - Operating Expenses by Category Horizontal Bar Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class OperatingExpensesChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartOperatingExpenses",
      chartKey: options.chartKey || "operatingExpensesByCategory",
      type: "bar",
      title: "Operating Expenses Breakdown by Category",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(operatingExpensesByCategory = {}) {
    const { textColor, gridColor, barAnimation } = this.getThemeConfig();
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
}

export default OperatingExpensesChart;
