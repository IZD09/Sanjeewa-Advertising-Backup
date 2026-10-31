/**
 * DashboardOverviewSlide
 * Extends DashboardBaseSlide.
 * Responsible for:
 * - Rendering dashboard overview metrics (total sales, active jobs, customers, pending invoices).
 * - Managing overview-specific charts: revenueTrendChart (line) and ordersDoughnutChart (doughnut).
 * - Updating order status legend breakdown.
 */

import { DashboardBaseSlide } from '../DashboardBaseSlide.js';
import { StatCardRenderer } from './StatCardRenderer.js';

export class DashboardOverviewSlide extends DashboardBaseSlide {
  constructor(element, options = {}) {
    super(element, options);
    this.name = 'overview';

    this.articles = {
      article1: null,
      article2: null,
      article3: null,
      article4: null,
      sales: null,
      jobs: null,
      customers: null,
      invoices: null,
    };

    this.chartTitle = null;

    this.jobStatas = {
      completed: 0,
      printing: 0,
      designing: 0,
      pending: 0
    };

    this.init();
  }

  init() {
    const root = this.element || document;

    this.articles.article1 = this.articles.sales = root.querySelector('[data-slide="totalSales"]');
    this.articles.article2 = this.articles.jobs = root.querySelector('[data-slide="activeJobs"]');
    this.articles.article3 = this.articles.customers = root.querySelector('[data-slide="newCustomers"]');
    this.articles.article4 = this.articles.invoices = root.querySelector('[data-slide="pendingInvoices"]');

    this.chartTitle = root.querySelector('[data-field="overviewChartTitle"]');

    this.jobStatas.completed = root.querySelector('[data-field="overviewCompleted"]');
    this.jobStatas.printing = root.querySelector('[data-field="overviewPrinting"]');
    this.jobStatas.designing = root.querySelector('[data-field="overviewDesigning"]');
    this.jobStatas.pending = root.querySelector('[data-field="overviewPending"]');
  }

  /**
   * Helper function to render a stat card article.
   * Delegates rendering to the dedicated StatCardRenderer component class.
   * @param {HTMLElement|null} articleEl
   * @param {Object} options
   */
  renderStatCard(articleEl, options = {}) {
    return new StatCardRenderer(articleEl)
      .setOptions(options)
      .render();
  }

  /**
   * Render slide metrics.
   * @param {Object} [data]
   */
  render(data = {}) {
    super.render(data);

    if (!this.articles.article1 && !this.articles.sales) {
      this.init();
    }

    const overview = data.overview || {};
    const breakdown = overview.ordersBreakdown || {};

    // Extract states / articles structure from DashboardDataService
    const rawStats = overview.states || overview.stats || {};
    const articles = rawStats.articles || rawStats;
    const jobStats = rawStats.jobStatas || overview.jobStatas || breakdown;

    const salesArt = articles.article1 || {};
    const jobsArt = articles.article2 || {};
    const customersArt = articles.article3 || {};
    const invoicesArt = articles.article4 || {};

    const formatCurrency = (val, fallback) => {
      if (val === undefined || val === null) return fallback;
      if (typeof val === 'number') return `Rs. ${val.toLocaleString()}`;
      return String(val);
    };

    const formatNumber = (val, fallback) => {
      if (val === undefined || val === null) return fallback;
      return String(val);
    };

    const formatPercent = (val, fallback) => {
      if (val === undefined || val === null) return fallback;
      const s = String(val).trim();
      return s.endsWith('%') ? s : `${s}%`;
    };

    // 1. Article 1: Total Sales
    new StatCardRenderer(this.articles.sales || this.articles.article1)
      .setTitle('Total Sales')
      .setIcon('fa-solid fa-chart-line')
      .setColor('blue')
      .setValue(formatCurrency(salesArt.value, overview.totalSales ?? 'Rs. 845,000'))
      .setTrend(
        salesArt.trendState || 'positive',
        formatPercent(salesArt.trend, '12.8%'),
        salesArt.trendLabel || 'vs last month'
      )
      .setBars(salesArt.bars || [30, 45, 35, 62, 50, 78, 95])
      .render();

    // 2. Article 2: Active Print Jobs
    new StatCardRenderer(this.articles.jobs || this.articles.article2)
      .setTitle('Active Print Jobs')
      .setIcon('fa-solid fa-print')
      .setColor('red')
      .setValue(
        formatNumber(
          jobsArt.value,
          overview.activeJobs !== undefined ? String(overview.activeJobs) : '28'
        )
      )
      .setTrend(
        jobsArt.trendState || 'positive',
        formatPercent(jobsArt.trend, '8.4%'),
        jobsArt.trendLabel || 'vs last month'
      )
      .setBars(jobsArt.bars || [35, 50, 40, 68, 55, 80, 95], 'red-bars')
      .render();

    // 3. Article 3: New Customers
    new StatCardRenderer(this.articles.customers || this.articles.article3)
      .setTitle('New Customers')
      .setIcon('fa-solid fa-user-plus')
      .setColor('green')
      .setValue(
        formatNumber(
          customersArt.value,
          overview.newCustomers !== undefined ? String(overview.newCustomers) : '14'
        )
      )
      .setTrend(
        customersArt.trendState || 'positive',
        formatPercent(customersArt.trend, '4.2%'),
        customersArt.trendLabel || 'vs last month'
      )
      .setBars(customersArt.bars || [25, 40, 30, 55, 45, 70, 88], 'green-bars')
      .render();

    // 4. Article 4: Pending Invoices
    new StatCardRenderer(this.articles.invoices || this.articles.article4)
      .setTitle('Pending Invoices')
      .setIcon('fa-solid fa-clock')
      .setColor('orange')
      .setValue(formatCurrency(invoicesArt.value, overview.pendingInvoices ?? 'Rs. 182,500'))
      .setTrend(
        invoicesArt.trendState || 'negative',
        formatPercent(invoicesArt.trend, '3.1%'),
        invoicesArt.trendLabel || 'vs last month'
      )
      .setBars(invoicesArt.bars || [40, 55, 48, 70, 60, 82, 90], 'orange-bars')
      .render();

    // 5. Chart Title
    if (this.chartTitle) {
      const year = rawStats.chartTitle || overview.chartTitle;
      this.chartTitle.textContent = year
        ? `${year} Monthly Trend`
        : '2026 Monthly Trend';
    }

    // 6. Job Status Breakdown
    if (this.jobStatas.completed) {
      this.jobStatas.completed.textContent = String(jobStats.completed ?? 14);
    }
    if (this.jobStatas.printing) {
      this.jobStatas.printing.textContent = String(jobStats.printing ?? 8);
    }
    if (this.jobStatas.designing) {
      this.jobStatas.designing.textContent = String(jobStats.designing ?? 6);
    }
    if (this.jobStatas.pending) {
      this.jobStatas.pending.textContent = String(jobStats.pending ?? 4);
    }

    // When slide is active, update the charts as well
    if (this.isActive) {
      this.renderCharts(data);
    }
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
        cutout: "0%",
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

