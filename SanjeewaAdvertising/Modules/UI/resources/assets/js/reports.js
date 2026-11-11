/**
 * Reports & Financial Analytics Hub Module
 * Sanjeewa Advertising Printing Shop Management System
 *
 * Modular Architecture (Place-Order Style):
 * - ReportsDataLoader: Fetch Requests, CSRF Authentication, & Embedded Payload Extraction
 * - NavigationProcess, DatePresetProcess, ExportProcess, MetricsProcess
 * - 1. sales-orders/ (charts/ + tables/)
 * - 2. payments-cashflow/ (charts/ + tables/)
 * - 3. customer-receivables/ (charts/ + tables/)
 * - 4. inventory-stock/ (charts/ + tables/)
 * - 5. supplier-grn/ (charts/ + tables/)
 * - 6. profit-loss/ (charts/ + tables/)
 */

"use strict";

import {
  ReportsDataLoader,
  NavigationProcess,
  DatePresetProcess,
  ExportProcess,
  MetricsProcess,
  // 1. Sales & Orders
  SalesOrdersChartHandler,
  SalesOrdersChartProcess,
  SalesOrdersTableHandler,
  SalesOrdersTableProcess,
  // 2. Payments & Cash Flow (Incl. Operating Expenses)
  PaymentsCashFlowChartHandler,
  PaymentsCashFlowChartProcess,
  PaymentsCashFlowTableHandler,
  OperatingExpensesReportTableHandler,
  PaymentsCashFlowTableProcess,
  // 3. Customer Receivables
  CustomerReceivablesChartHandler,
  CustomerReceivablesChartProcess,
  CustomerReceivablesTableHandler,
  CustomerReceivablesTableProcess,
  // 4. Inventory & Stock
  InventoryStockChartHandler,
  InventoryStockChartProcess,
  InventoryStockTableHandler,
  InventoryStockTableProcess,
  // 5. Supplier & GRN
  SupplierGrnChartHandler,
  SupplierGrnChartProcess,
  SupplierGrnTableHandler,
  SupplierGrnTableProcess,
  // 6. Profit & Loss Statement
  ProfitLossChartHandler,
  ProfitLossChartProcess,
  ProfitLossTableHandler,
  ProfitLossTableProcess
} from "./reports/index.js";

export class ReportsManager {
  constructor() {
    this.dataLoader = new ReportsDataLoader();
    this.payload = {};
    this.chartRegistry = {};

    const showToast = (msg, type) => this.showToast(msg, type);

    // -------------------------------------------------------------------------
    // 1. Sales & Orders Handlers & Processes
    // -------------------------------------------------------------------------
    this.salesOrdersChartHandler = new SalesOrdersChartHandler({ chartRegistry: this.chartRegistry });
    this.salesOrdersChartProcess = new SalesOrdersChartProcess({ chartHandler: this.salesOrdersChartHandler });
    this.salesOrdersTableHandler = new SalesOrdersTableHandler({ showToast });
    this.salesOrdersTableProcess = new SalesOrdersTableProcess({ tableHandler: this.salesOrdersTableHandler });

    // -------------------------------------------------------------------------
    // 2. Payments & Cash Flow (Incl. Operating Expenses) Handlers & Processes
    // -------------------------------------------------------------------------
    this.paymentsCashFlowChartHandler = new PaymentsCashFlowChartHandler({ chartRegistry: this.chartRegistry });
    this.paymentsCashFlowChartProcess = new PaymentsCashFlowChartProcess({ chartHandler: this.paymentsCashFlowChartHandler });
    this.cashFlowTableHandler = new PaymentsCashFlowTableHandler({ tableId: "cashFlowTable", showToast });
    this.operatingExpensesTableHandler = new OperatingExpensesReportTableHandler({ showToast });
    this.paymentsCashFlowTableProcess = new PaymentsCashFlowTableProcess({
      cashFlowTableHandler: this.cashFlowTableHandler,
      operatingExpensesTableHandler: this.operatingExpensesTableHandler
    });

    // -------------------------------------------------------------------------
    // 3. Customer Receivables Handlers & Processes
    // -------------------------------------------------------------------------
    this.customerReceivablesChartHandler = new CustomerReceivablesChartHandler({ chartRegistry: this.chartRegistry });
    this.customerReceivablesChartProcess = new CustomerReceivablesChartProcess({ chartHandler: this.customerReceivablesChartHandler });
    this.customerReceivablesTableHandler = new CustomerReceivablesTableHandler({ showToast });
    this.customerReceivablesTableProcess = new CustomerReceivablesTableProcess({ tableHandler: this.customerReceivablesTableHandler });

    // -------------------------------------------------------------------------
    // 4. Inventory & Stock Handlers & Processes
    // -------------------------------------------------------------------------
    this.inventoryStockChartHandler = new InventoryStockChartHandler({ chartRegistry: this.chartRegistry });
    this.inventoryStockChartProcess = new InventoryStockChartProcess({ chartHandler: this.inventoryStockChartHandler });
    this.inventoryStockTableHandler = new InventoryStockTableHandler({ showToast });
    this.inventoryStockTableProcess = new InventoryStockTableProcess({ tableHandler: this.inventoryStockTableHandler });

    // -------------------------------------------------------------------------
    // 5. Supplier & GRN Handlers & Processes
    // -------------------------------------------------------------------------
    this.supplierGrnChartHandler = new SupplierGrnChartHandler({ chartRegistry: this.chartRegistry });
    this.supplierGrnChartProcess = new SupplierGrnChartProcess({ chartHandler: this.supplierGrnChartHandler });
    this.supplierGrnTableHandler = new SupplierGrnTableHandler({ showToast });
    this.supplierGrnTableProcess = new SupplierGrnTableProcess({ tableHandler: this.supplierGrnTableHandler });

    // -------------------------------------------------------------------------
    // 6. Profit & Loss Statement Handlers & Processes
    // -------------------------------------------------------------------------
    this.profitLossChartHandler = new ProfitLossChartHandler({ chartRegistry: this.chartRegistry });
    this.profitLossChartProcess = new ProfitLossChartProcess({ chartHandler: this.profitLossChartHandler });
    this.profitLossTableHandler = new ProfitLossTableHandler({ showToast });
    this.profitLossTableProcess = new ProfitLossTableProcess({ tableHandler: this.profitLossTableHandler });

    // -------------------------------------------------------------------------
    // Shared Global Processes
    // -------------------------------------------------------------------------
    this.navigationProcess = new NavigationProcess({
      onTabChanged: () => this.reanimateActiveCharts(),
      onViewModeChanged: (mode) => {
        if (mode === "chart") this.reanimateActiveCharts();
      }
    });

    this.datePresetProcess = new DatePresetProcess({
      showToast,
      onDateRangeApplied: (range) => this.handleDateRangeApplied(range)
    });

    this.exportProcess = new ExportProcess({ showToast });
    this.metricsProcess = new MetricsProcess({ getPayload: () => this.payload });

    this.init();
  }

  init() {
    this.payload = this.dataLoader.loadEmbeddedPayload();
    this.setupServerSources();
    this.bindEvents();
    this.initChartsWithRetry();
    this.initServerTables();
    this.loadServerCharts();
  }

  /**
   * Asynchronously load live chart data directly from backend database on initialization.
   */
  async loadServerCharts() {
    try {
      const result = await this.dataLoader.fetchReportData({ preset: "this_month" });
      if (result && result.charts) {
        this.payload = result.charts;
        this.renderAllCharts();
        this.reanimateActiveCharts();
      }
    } catch (err) {
      console.warn("[ReportsManager] Live server charts fetch error:", err);
    }
  }

  /**
   * Configure server-side asynchronous data source for all report tables.
   */
  setupServerSources() {
    this.salesOrdersTableHandler.setServerSource(this.dataLoader, "sales");
    this.cashFlowTableHandler.setServerSource(this.dataLoader, "payments");
    this.operatingExpensesTableHandler.setServerSource(this.dataLoader, "expenses");
    this.customerReceivablesTableHandler.setServerSource(this.dataLoader, "receivables");
    this.inventoryStockTableHandler.setServerSource(this.dataLoader, "inventory");
    this.supplierGrnTableHandler.setServerSource(this.dataLoader, "suppliers");
  }

  /**
   * Initialize server-side pagination and load fresh records from database.
   */
  initServerTables() {
    // Initial fetch to load records with pagination from Reports module
    this.salesOrdersTableHandler.fetchData({ page: 1 });
    this.cashFlowTableHandler.fetchData({ page: 1 });
    this.operatingExpensesTableHandler.fetchData({ page: 1 });
    this.customerReceivablesTableHandler.fetchData({ page: 1 });
    this.inventoryStockTableHandler.fetchData({ page: 1 });
    this.supplierGrnTableHandler.fetchData({ page: 1 });
  }

  /**
   * Handle date preset or custom range application without full-page reloads.
   * Updates executive KPI cards, charts, and table records asynchronously.
   *
   * @param {Object} range
   */
  async handleDateRangeApplied(range = {}) {
    const filters = {
      preset: range.preset || "this_month",
      date_from: range.from || null,
      date_to: range.to || null
    };

    try {
      this.showToast("Fetching updated report data...", "info");
      const result = await this.dataLoader.fetchReportData(filters);

      if (result && result.success) {
        // 1. Update Executive KPI summary cards via MetricsProcess & ExecutiveKpiCardBuilder
        if (result.kpis) {
          this.metricsProcess.renderKpis(result.kpis);
        }

        // 2. Update dynamic charts payload and redraw
        if (result.charts) {
          this.payload = result.charts;
          this.renderAllCharts();
          this.reanimateActiveCharts();
        }

        // 3. Update table data without refreshing the page
        this.salesOrdersTableHandler.fetchData({ ...filters, page: 1 });
        this.cashFlowTableHandler.fetchData({ ...filters, page: 1 });
        this.operatingExpensesTableHandler.fetchData({ ...filters, page: 1 });
        this.customerReceivablesTableHandler.fetchData({ ...filters, page: 1 });
        this.inventoryStockTableHandler.fetchData({ ...filters, page: 1 });
        this.supplierGrnTableHandler.fetchData({ ...filters, page: 1 });

        // 4. Update Profit & Loss statement
        if (result.tables?.profitLoss) {
          this.updateProfitLossStatement(result.tables.profitLoss);
        }

        this.showToast(`Reports & Charts updated for period: ${range.from} to ${range.to}`);
      }
    } catch (err) {
      console.error("[ReportsManager] Error updating report data:", err);
      this.showToast("Failed to refresh report data. Please retry.", "warning");
    }
  }

  /**
   * Update audited Profit & Loss statement table in DOM without full reload.
   *
   * @param {Object} plData
   */
  updateProfitLossStatement(plData) {
    if (!plData) return;
    const table = document.getElementById("profitLossTable");
    if (!table) return;

    const formatRs = (val) => `Rs. ${Number(val || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    const formatNegativeRs = (val) => `(Rs. ${Number(val || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })})`;

    // 1. Operating Revenue & Discounts
    const grossRevEl = table.querySelector('[data-pl-field="grossRevenue"] .num-col');
    if (grossRevEl && plData.grossRevenue !== undefined) {
      grossRevEl.textContent = formatRs(plData.grossRevenue);
    }
    const discountsEl = table.querySelector('[data-pl-field="tradeDiscounts"] .num-col');
    if (discountsEl && plData.tradeDiscounts !== undefined) {
      discountsEl.textContent = formatNegativeRs(plData.tradeDiscounts);
    }
    const netRevEl = table.querySelector('[data-pl-field="netRevenue"] .num-col');
    if (netRevEl && (plData.netRevenue !== undefined || plData.grossRevenue !== undefined)) {
      netRevEl.textContent = formatRs(plData.netRevenue ?? plData.grossRevenue);
    }

    // 2. Cost of Goods Sold (COGS)
    const rawMatEl = table.querySelector('[data-pl-field="rawMaterialsCost"] .num-col');
    if (rawMatEl && plData.rawMaterialsCost !== undefined) {
      rawMatEl.textContent = formatRs(plData.rawMaterialsCost);
    }
    const inksEl = table.querySelector('[data-pl-field="inksConsumablesCost"] .num-col');
    if (inksEl && plData.inksConsumablesCost !== undefined) {
      inksEl.textContent = formatRs(plData.inksConsumablesCost);
    }
    const totalCogsEl = table.querySelector('[data-pl-field="cogs"] .num-col');
    if (totalCogsEl && plData.cogs !== undefined) {
      totalCogsEl.textContent = formatNegativeRs(plData.cogs);
    }

    // 3. Gross Operating Profit
    const gpEl = table.querySelector('[data-pl-field="grossProfit"] .num-col');
    if (gpEl && plData.grossProfit !== undefined) {
      gpEl.textContent = formatRs(plData.grossProfit);
    }

    // 4. Operating Overhead Expenses Categories
    const catList = document.getElementById("plExpenseCategoriesList");
    if (catList && Array.isArray(plData.expenseCategories)) {
      if (plData.expenseCategories.length > 0) {
        catList.innerHTML = plData.expenseCategories.map(cat => `
          <tr class="pl-sub-row pl-exp-cat-row">
            <td>${cat.category}</td>
            <td class="num-col">${formatRs(cat.amount)}</td>
          </tr>
        `).join("");
      } else {
        catList.innerHTML = `
          <tr class="pl-sub-row pl-exp-cat-row">
            <td style="color: #64748b; font-style: italic;">No specific overhead expense items recorded</td>
            <td class="num-col">Rs. 0.00</td>
          </tr>
        `;
      }
    }
    const expTotalEl = table.querySelector('[data-pl-field="totalExpenses"] .num-col');
    if (expTotalEl && plData.totalExpenses !== undefined) {
      expTotalEl.textContent = formatNegativeRs(plData.totalExpenses);
    }

    // 5. Net Operating Profit & Margin
    const netProfitEl = table.querySelector('[data-pl-field="netProfit"] .num-col');
    if (netProfitEl && plData.netProfit !== undefined) {
      netProfitEl.textContent = formatRs(plData.netProfit);
    }
    const marginEl = table.querySelector('[data-pl-field="marginPercent"] .num-col');
    if (marginEl && plData.marginPercent !== undefined) {
      marginEl.textContent = `${plData.marginPercent}%`;
    }
  }

  bindEvents() {
    // Global navigation, date filters & export actions
    this.navigationProcess.bindEvents();
    this.datePresetProcess.bindEvents();
    this.exportProcess.bindEvents();

    // 1. Sales & Orders (Chart Selector + Table Sorting/Filtering)
    this.salesOrdersChartProcess.bindEvents();
    this.salesOrdersTableProcess.bindEvents();

    // 2. Payments & Cash Flow + Operating Expenses (Chart Selector + Tables Sorting/Filtering)
    this.paymentsCashFlowChartProcess.bindEvents();
    this.paymentsCashFlowTableProcess.bindEvents();

    // 3. Customer Receivables (Chart Selector + Table Sorting/Filtering)
    this.customerReceivablesChartProcess.bindEvents();
    this.customerReceivablesTableProcess.bindEvents();

    // 4. Inventory & Stock (Chart Selector + Table Sorting/Filtering)
    this.inventoryStockChartProcess.bindEvents();
    this.inventoryStockTableProcess.bindEvents();

    // 5. Supplier & GRN (Chart Selector + Table Sorting/Filtering)
    this.supplierGrnChartProcess.bindEvents();
    this.supplierGrnTableProcess.bindEvents();

    // 6. Profit & Loss Statement (Chart Selector + Statement Table)
    this.profitLossChartProcess.bindEvents();
    this.profitLossTableProcess.bindEvents();
  }

  initChartsWithRetry() {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      if (typeof window.Chart !== "undefined") {
        clearInterval(timer);
        this.renderAllCharts();
        this.reanimateActiveCharts();
      } else if (attempts > 30) {
        clearInterval(timer);
      }
    }, 120);
  }

  renderAllCharts() {
    this.salesOrdersChartHandler.renderCharts(this.payload);
    this.paymentsCashFlowChartHandler.renderCharts(this.payload);
    this.customerReceivablesChartHandler.renderCharts(this.payload);
    this.inventoryStockChartHandler.renderCharts(this.payload);
    this.supplierGrnChartHandler.renderCharts(this.payload);
    this.profitLossChartHandler.renderCharts(this.payload);
  }

  /**
   * Replays dashboard-style entrance animation on all currently visible charts
   * in the active report tab and single-chart pane.
   * For pie/doughnut charts: destroys and re-mounts clean instance without reset()
   * to guarantee zero zoom effect (smooth circular loading matching Dashboard).
   */
  reanimateActiveCharts() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const activeTab = document.querySelector(".rep-tab-pane.active");
        if (!activeTab) return;

        const canvases = activeTab.querySelectorAll(
          ".rep-single-chart-pane.active canvas, canvas:not(.rep-single-chart-pane canvas)"
        );

        canvases.forEach((canvas) => {
          if (canvas && window.Chart) {
            const chartInstance = window.Chart.getChart(canvas);
            const wrap = canvas.parentElement;
            if (wrap && wrap.clientWidth > 0) {
              const w = wrap.clientWidth;
              const h = wrap.clientHeight || 360;
              canvas.width = w;
              canvas.height = h;
              canvas.style.width = w + "px";
              canvas.style.height = h + "px";
            }

            if (chartInstance) {
              if (chartInstance.config.type === "doughnut" || chartInstance.config.type === "pie") {
                const config = chartInstance.config;
                const chartKey = Object.keys(this.chartRegistry).find((k) => this.chartRegistry[k] === chartInstance) || canvas.id;
                chartInstance.destroy();
                const freshChart = new window.Chart(canvas, config);
                this.chartRegistry[chartKey] = freshChart;
              } else {
                chartInstance.resize();
                chartInstance.reset();
                chartInstance.update();
              }
            }
          }
        });
      });
    });
  }

  refreshAllCharts() {
    this.reanimateActiveCharts();
  }

  showToast(message, type = "success") {
    let toast = document.getElementById("repToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "repToast";
      toast.style.position = "fixed";
      toast.style.bottom = "24px";
      toast.style.right = "24px";
      toast.style.background = "#1e293b";
      toast.style.color = "#ffffff";
      toast.style.padding = "12px 20px";
      toast.style.borderRadius = "8px";
      toast.style.boxShadow = "0 10px 25px rgba(0,0,0,0.2)";
      toast.style.zIndex = "9999";
      toast.style.fontSize = "13px";
      toast.style.fontWeight = "600";
      toast.style.display = "flex";
      toast.style.alignItems = "center";
      toast.style.gap = "8px";
      toast.style.transition = "opacity 0.25s, transform 0.25s";
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      document.body.appendChild(toast);
    }

    const iconColor = type === "warning" ? "#f59e0b" : "#52c41a";
    const iconClass = type === "warning" ? "fa-triangle-exclamation" : "fa-circle-check";
    toast.innerHTML = `<i class="fa-solid ${iconClass}" style="color: ${iconColor};"></i> ${message}`;
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
    }, 3200);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.ReportsDataLoader = ReportsDataLoader;
  window.reportsApp = new ReportsManager();
});
