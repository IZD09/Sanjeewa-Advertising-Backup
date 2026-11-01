/**
 * FinancialPerformanceSlide
 * Extends DashboardBaseSlide.
 * Responsible for:
 * - Rendering executive financial performance, revenue, expenses, and operating margins.
 * - Managing monthly P&L comparison line chart (financeComparisonChart).
 * - Updating profitability and cash flow metrics in the DOM.
 */

import { DashboardBaseSlide } from '../DashboardBaseSlide.js';

export class FinancialPerformanceSlide extends DashboardBaseSlide {
  constructor(element, options = {}) {
    super(element, options);
    this.name = 'financial-performance';
  }

  /**
   * Render slide metrics in the DOM.
   * @param {Object} [data]
   */
  renderContent(data = {}) {
    const financeData = data?.finance || this.data?.finance || {};
    this.updateFinancialMetrics(financeData);
  }

  /**
   * Render charts when slide becomes active.
   * @param {Object} [data]
   */
  renderCharts(data = {}) {
    const financeData = data?.finance || this.data?.finance || {};

    // Monthly P&L Comparison Line Chart
    this.renderFinanceComparisonChart(financeData.comparison);
  }

  /**
   * Update DOM metrics for financial summaries and profit margin.
   * @param {Object} [financeData]
   */
  updateFinancialMetrics(financeData) {
    if (!financeData) return;

    if (financeData.totalRevenue !== undefined) {
      const el = this.findElement('.finance-list div:nth-child(1) strong');
      if (el) el.textContent = financeData.totalRevenue;
    }
    if (financeData.totalExpenses !== undefined) {
      const el = this.findElement('.finance-list div:nth-child(2) strong');
      if (el) el.textContent = financeData.totalExpenses;
    }
    if (financeData.netProfit !== undefined) {
      const el = this.findElement('.finance-list div:nth-child(3) strong');
      if (el) el.textContent = financeData.netProfit;
    }

    if (financeData.profitMargin !== undefined) {
      const marginEl = this.findElement('.profit-box strong');
      if (marginEl) marginEl.textContent = `${financeData.profitMargin}%`;

      const bar = this.findElement('.profit-box .progress-track span');
      if (bar) bar.style.width = `${financeData.profitMargin}%`;
    }

    if (financeData.supplierPayables !== undefined) {
      const spEl = this.findElement('.supplier-summary-compact strong');
      if (spEl) spEl.textContent = financeData.supplierPayables;
    }
  }

  /**
   * Render or update Gross Income vs Operating Expenses Line Chart.
   * @param {Object} [chartData]
   */
  renderFinanceComparisonChart(chartData) {
    const labels = chartData?.labels || [];
    const revenueValues = chartData?.revenue || [];
    const expenseValues = chartData?.expenses || [];

    this.createChart("financeComparisonChart", {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Revenue",
            data: revenueValues,
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.10)",
            fill: true,
            tension: 0,
            pointRadius: 3
          },
          {
            label: "Expenses",
            data: expenseValues,
            borderColor: "#ef4444",
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            fill: true,
            tension: 0,
            pointRadius: 3
          }
        ]
      }
    });
  }

  onSlideEnter() {
    super.onSlideEnter();
  }

  onSlideLeave() {
    super.onSlideLeave();
  }
}

