/**
 * DashboardOverviewSlide
 * Extends DashboardBaseSlide.
 * Responsible for:
 * - Rendering dashboard overview metrics (total sales, active jobs, customers, pending invoices).
 * - Managing overview-specific charts: revenueTrendChart (line) and ordersDoughnutChart (doughnut).
 * - Updating order status legend breakdown.
 */

import { DashboardBaseSlide } from '../DashboardBaseSlide.js';

export class DashboardOverviewSlide extends DashboardBaseSlide {
  constructor(element, options = {}) {
    super(element, options);
    this.name = 'overview';
  }

  /**
   * Render slide metrics.
   * @param {Object} [data]
   */
  render(data = {}) {
    super.render(data);

    const overviewData = data.overview || {};

    // Update Stat Card DOM Metrics if data is provided
    this.updateMetrics(overviewData);
  }

  /**
   * Render charts when slide becomes active.
   * @param {Object} [data]
   */
  renderCharts(data = {}) {
    const overviewData = data?.overview || this.data?.overview || {};

    // 1. Monthly Revenue Trend Line Chart
    this.renderRevenueTrendChart(overviewData.revenueTrend);

    // 2. Active Orders Doughnut Chart
    this.renderOrdersDoughnutChart(overviewData.ordersBreakdown);
  }

  /**
   * Update overview metrics in the DOM.
   * @param {Object} data
   */
  updateMetrics(data) {
    if (data.totalSales !== undefined) {
      const el = this.findElement('.stats-grid article:nth-child(1) h3');
      if (el) el.textContent = data.totalSales;
    }
    if (data.activeJobs !== undefined) {
      const el = this.findElement('.stats-grid article:nth-child(2) h3');
      if (el) el.textContent = String(data.activeJobs);
    }
    if (data.newCustomers !== undefined) {
      const el = this.findElement('.stats-grid article:nth-child(3) h3');
      if (el) el.textContent = String(data.newCustomers);
    }
    if (data.pendingInvoices !== undefined) {
      const el = this.findElement('.stats-grid article:nth-child(4) h3');
      if (el) el.textContent = data.pendingInvoices;
    }

    if (data.ordersBreakdown) {
      const b = data.ordersBreakdown;
      const compEl = this.findElement('.legend .dot.completed + span + strong');
      if (compEl && b.completed !== undefined) compEl.textContent = String(b.completed);

      const printEl = this.findElement('.legend .dot.printing + span + strong');
      if (printEl && b.printing !== undefined) printEl.textContent = String(b.printing);

      const desEl = this.findElement('.legend .dot.designing + span + strong');
      if (desEl && b.designing !== undefined) desEl.textContent = String(b.designing);

      const pendEl = this.findElement('.legend .dot.pending + span + strong');
      if (pendEl && b.pending !== undefined) pendEl.textContent = String(b.pending);
    }
  }

  /**
   * Render or update Monthly Revenue Trend Line Chart.
   * @param {Object} [chartData]
   */
  renderRevenueTrendChart(chartData) {
    const labels = chartData?.labels || ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
    const values = chartData?.values || [420, 510, 480, 650, 590, 720, 680, 790, 740, 845];

    this.createChart("revenueTrendChart", {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: "Revenue (Rs. thousands)",
          data: values,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.12)",
          fill: true,
          tension: 0.38,
          pointRadius: 3.5,
          pointBackgroundColor: "#2563eb"
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  /**
   * Render or update Active Orders Doughnut Chart.
   * @param {Object} [breakdown]
   */
  renderOrdersDoughnutChart(breakdown) {
    const values = breakdown?.values || [
      breakdown?.completed ?? 14,
      breakdown?.printing ?? 8,
      breakdown?.designing ?? 6,
      breakdown?.pending ?? 4
    ];

    this.createChart("ordersDoughnutChart", {
      type: "doughnut",
      data: {
        labels: ["Completed", "Printing", "Designing", "Pending"],
        datasets: [{
          data: values,
          backgroundColor: ["#10b981", "#2563eb", "#8b5cf6", "#f59e0b"],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        cutout: "68%",
        plugins: { legend: { display: false } }
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

