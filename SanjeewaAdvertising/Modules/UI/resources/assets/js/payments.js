/**
 * Payments & Financial Settlements Hub
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Handles:
 *   1. Invoice Payment (Job Payments: Complete, Pending, Advance; Card, Cash, Check, Bank Transfer)
 *   2. GRN Payment (Stock Items & Suppliers: Complete, Pending, Advance; Card, Cash, Check, Bank Transfer)
 *   3. Operating Expenses (Utility & Overhead Bills: Electricity, Water, Internet, Rent, AMC)
 *
 * Orchestrated modular architecture delegating to payments/ sub-classes,
 * payments/modals/ dialog handlers, and payments/processes/ button actions.
 */

"use strict";

import {
  PaymentsDataLoader,
  InvoicePaymentTableHandler,
  GRNPaymentTableHandler,
  OperatingExpenseTableHandler,
  OperatingExpensesHandler,
  PaymentsOverviewHandler,
  PaymentModalHandler,
  PaymentKpiCardBuilder,
  ExpenseCategoryCardBuilder,
  NavigationProcess,
  FilterProcess,
  MetricsProcess
} from "./payments/index.js";

export class PaymentsManager {
  constructor() {
    this.dataLoader = new PaymentsDataLoader();

    this.overviewHandler = new PaymentsOverviewHandler({
      formatCurrency: (amt) => this.dataLoader.formatCurrency(amt)
    });

    this.invoiceTableHandler = new InvoicePaymentTableHandler({
      renderStageBadge: (s) => this.overviewHandler.renderStageBadge(s),
      renderMethodBadge: (m, r) => this.overviewHandler.renderMethodBadge(m, r),
      formatCurrency: (amt) => this.dataLoader.formatCurrency(amt)
    });

    this.grnTableHandler = new GRNPaymentTableHandler({
      renderStageBadge: (s) => this.overviewHandler.renderStageBadge(s),
      renderMethodBadge: (m, r) => this.overviewHandler.renderMethodBadge(m, r),
      formatCurrency: (amt) => this.dataLoader.formatCurrency(amt)
    });

    this.expensesHandler = new OperatingExpensesHandler({
      formatCurrency: (amt) => this.dataLoader.formatCurrency(amt),
      onOpenAddModal: () => this.openAddExpenseModal(),
      onOpenMarkPaidModal: (id) => this.openMarkExpensePaidModal(id),
      onUndoPaid: (id) => this.undoExpensePaid(id)
    });

    // 1. Modal Handler Orchestrator (delegates to specialized modal classes)
    this.modalHandler = new PaymentModalHandler({
      getOrders: () => this.dataLoader.orders,
      getOrderPayments: () => this.dataLoader.orderPayments,
      getGrnRecords: () => this.dataLoader.grnRecords,
      getGrnPayments: () => this.dataLoader.grnPayments,
      getExpenses: () => this.dataLoader.expenses,
      saveOrderPayments: () => this.dataLoader.saveOrderPayments(),
      saveGrnPayments: () => this.dataLoader.saveGrnPayments(),
      saveOrders: (ords) => this.dataLoader.saveOrders(ords),
      saveExpenses: () => this.dataLoader.saveExpenses(),
      getCurrentMonth: () => this.expensesHandler.expenseMonthFilter,
      setCurrentMonth: (m) => this.expensesHandler.setMonthFilter(m),
      render: () => this.render()
    });

    // 2. Processes (Navigation, Filters, Metrics)
    this.navigationProcess = new NavigationProcess({
      loadAndRenderInvoice: () => this.loadAndRenderInvoice(),
      loadAndRenderGrn: () => this.loadAndRenderGrn(),
      loadAndRenderExpenses: () => this.loadAndRenderExpenses(),
      loadAndRenderOverview: () => this.loadAndRenderOverview(),
      render: () => this.render(),
      onConceptFilter: (target, type, val) => this.filterProcess.applyConceptFilter(target, type, val)
    });

    this.filterProcess = new FilterProcess({
      renderInvoiceTable: (resetPage = false) => this.renderInvoiceTable(resetPage),
      renderGrnTable: (resetPage = false) => this.renderGrnTable(resetPage),
      renderExpenses: (resetPage = false) => this.renderExpenses(resetPage),
      setExpenseMonth: (m) => this.expensesHandler.setMonthFilter(m),
      setExpenseSearch: (s) => this.expensesHandler.setSearchFilter(s),
      setExpenseCategory: (c) => this.expensesHandler.setCategoryFilter(c),
      setExpenseStatus: (st) => this.expensesHandler.setStatusFilter(st),
      showToast: (msg) => this.showToast(msg)
    });

    this.metricsProcess = new MetricsProcess({
      updateKPIs: (orders, grns) => this.overviewHandler.updateKPIs(orders, grns),
      renderOverviewTab: (orders, grns) => this.overviewHandler.renderOverviewTab(orders, grns),
      getOrderPayments: () => this.dataLoader.orderPayments,
      getGrnPayments: () => this.dataLoader.grnPayments
    });

    this.init();
  }

  // Getters & setters for state compatibility
  get activeTab() { return this.navigationProcess.activeTab; }
  set activeTab(val) { this.navigationProcess.activeTab = val; }

  get invoiceSearch() { return this.filterProcess.invoiceSearch; }
  set invoiceSearch(val) { this.filterProcess.invoiceSearch = val; }
  get invoiceStatusFilter() { return this.filterProcess.invoiceStatusFilter; }
  set invoiceStatusFilter(val) { this.filterProcess.invoiceStatusFilter = val; }
  get invoiceMethodFilter() { return this.filterProcess.invoiceMethodFilter; }
  set invoiceMethodFilter(val) { this.filterProcess.invoiceMethodFilter = val; }

  get grnSearch() { return this.filterProcess.grnSearch; }
  set grnSearch(val) { this.filterProcess.grnSearch = val; }
  get grnStatusFilter() { return this.filterProcess.grnStatusFilter; }
  set grnStatusFilter(val) { this.filterProcess.grnStatusFilter = val; }
  get grnMethodFilter() { return this.filterProcess.grnMethodFilter; }
  set grnMethodFilter(val) { this.filterProcess.grnMethodFilter = val; }

  get expenseMonthFilter() { return this.expensesHandler.expenseMonthFilter; }
  set expenseMonthFilter(val) { this.expensesHandler.setMonthFilter(val); }
  get expenseSearch() { return this.expensesHandler.expenseSearch; }
  set expenseSearch(val) { this.expensesHandler.setSearchFilter(val); }
  get expenseCategoryFilter() { return this.expensesHandler.expenseCategoryFilter; }
  set expenseCategoryFilter(val) { this.expensesHandler.setCategoryFilter(val); }
  get expenseStatusFilter() { return this.expensesHandler.expenseStatusFilter; }
  set expenseStatusFilter(val) { this.expensesHandler.setStatusFilter(val); }

  get orders() { return this.dataLoader.orders; }
  set orders(val) { this.dataLoader.orders = val; }
  get orderPayments() { return this.dataLoader.orderPayments; }
  set orderPayments(val) { this.dataLoader.orderPayments = val; }
  get grnRecords() { return this.dataLoader.grnRecords; }
  set grnRecords(val) { this.dataLoader.grnRecords = val; }
  get grnPayments() { return this.dataLoader.grnPayments; }
  set grnPayments(val) { this.dataLoader.grnPayments = val; }
  get expenses() { return this.dataLoader.expenses; }
  set expenses(val) { this.dataLoader.expenses = val; }

  async init() {
    this.dataLoader.loadData();
    this.navigationProcess.bindEvents();
    this.filterProcess.bindEvents();
    this.bindGlobalActionButtons();

    // Check initial active view from URL query param
    const initialTab = this.navigationProcess.activeTab;
    this.navigationProcess.switchTab(initialTab);

    // Initial render from local cache
    this.render();

    // On-demand server fetch based on active tab
    if (initialTab === "grn") {
      await this.loadAndRenderGrn();
    } else if (initialTab === "expenses") {
      await this.loadAndRenderExpenses();
    } else if (initialTab === "overview") {
      await this.loadAndRenderOverview();
    } else {
      await this.loadAndRenderInvoice();
    }
  }

  /**
   * On-demand data loading & rendering for Customer Invoice Payments tab.
   * Loads data from backend Invoice module via RequestHandler.
   *
   * @param {boolean} [forceRefresh=false]
   */
  async loadAndRenderInvoice(forceRefresh = false) {
    await this.dataLoader.fetchInvoicePayments({}, forceRefresh);
    this.renderInvoiceTable();
    this.updateKPIs();
  }

  /**
   * On-demand data loading & rendering for Supplier GRN Payments tab.
   * Loads data from backend Transaction module via RequestHandler.
   *
   * @param {boolean} [forceRefresh=false]
   */
  async loadAndRenderGrn(forceRefresh = false) {
    await this.dataLoader.fetchGrnPayments({}, forceRefresh);
    this.renderGrnTable();
    this.updateKPIs();
  }

  /**
   * On-demand data loading & rendering for Operating Expenses tab.
   * Loads data from backend Transaction module via RequestHandler.
   *
   * @param {boolean} [forceRefresh=false]
   */
  async loadAndRenderExpenses(forceRefresh = false) {
    await this.dataLoader.fetchOperatingExpenses({}, forceRefresh);
    this.renderExpenses();
    this.updateKPIs();
  }

  /**
   * On-demand data loading & rendering for Financial Reconciliation & Overview tab.
   *
   * @param {boolean} [forceRefresh=false]
   */
  async loadAndRenderOverview(forceRefresh = false) {
    await this.dataLoader.fetchAll(forceRefresh);
    this.render();
  }

  bindGlobalActionButtons() {
    document.addEventListener("click", (e) => {
      // Table Voucher view
      const viewReceiptBtn = e.target.closest("[data-view-receipt]");
      if (viewReceiptBtn) {
        e.preventDefault();
        const payId = viewReceiptBtn.getAttribute("data-view-receipt");
        const type = viewReceiptBtn.getAttribute("data-type") || "invoice";
        this.openReceiptModal(payId, type);
        return;
      }

      // Table row Pay button
      const openPayBtn = e.target.closest("[data-open-pay-modal]");
      if (openPayBtn) {
        e.preventDefault();
        const payType = openPayBtn.getAttribute("data-pay-type");
        const payRef = openPayBtn.getAttribute("data-pay-ref");
        if (payType === "invoice") {
          this.openRecordInvoicePayment(payRef);
        } else if (payType === "grn") {
          this.openRecordGrnPayment(payRef);
        } else {
          this.openRecordPaymentModal(payType, payRef);
        }
      }
    });
  }

  switchTab(tab) {
    this.navigationProcess.switchTab(tab);
  }

  render() {
    this.updateKPIs();
    this.renderInvoiceTable();
    this.renderGrnTable();
    this.renderExpenses();
    this.renderOverviewTab();
  }

  updateKPIs() {
    this.metricsProcess.updateMetrics();
    PaymentKpiCardBuilder.buildInvoiceMetrics(this.dataLoader.orderPayments);
    PaymentKpiCardBuilder.buildGrnMetrics(this.dataLoader.grnPayments);
    PaymentKpiCardBuilder.buildExpenseMetrics(this.dataLoader.expenses, this.expensesHandler.expenseMonthFilter);
    PaymentKpiCardBuilder.buildOverviewMetrics(this.dataLoader.orderPayments, this.dataLoader.grnPayments);
  }

  renderInvoiceTable(resetPage = false) {
    this.invoiceTableHandler.render(
      this.dataLoader.orderPayments,
      this.invoiceSearch,
      this.invoiceStatusFilter,
      this.invoiceMethodFilter,
      resetPage
    );
  }

  renderGrnTable(resetPage = false) {
    this.grnTableHandler.render(
      this.dataLoader.grnPayments,
      this.grnSearch,
      this.grnStatusFilter,
      this.grnMethodFilter,
      resetPage
    );
  }

  renderExpenses(resetPage = false) {
    this.expensesHandler.render(this.dataLoader.expenses, resetPage);
  }

  renderOverviewTab() {
    this.overviewHandler.renderOverviewTab(
      this.dataLoader.orderPayments,
      this.dataLoader.grnPayments
    );
  }

  renderStageBadge(stage) {
    return this.overviewHandler.renderStageBadge(stage);
  }

  renderMethodBadge(method, ref = "") {
    return this.overviewHandler.renderMethodBadge(method, ref);
  }

  // Modal Delegations
  openRecordInvoicePayment(prefillOrderId = null) {
    this.modalHandler.openRecordInvoicePaymentModal(prefillOrderId);
  }

  openRecordGrnPayment(prefillGrnId = null) {
    this.modalHandler.openRecordGrnPaymentModal(prefillGrnId);
  }

  openRecordBillPayment(prefillBillId = null) {
    this.modalHandler.openRecordBillPaymentModal(prefillBillId);
  }

  openAddExpenseModal() {
    this.modalHandler.openAddExpenseBillModal();
  }

  openMarkExpensePaidModal(billId) {
    this.modalHandler.openMarkExpensePaidModal(billId);
  }

  undoExpensePaid(billId) {
    this.modalHandler.undoExpensePaid(billId);
  }

  openRecordPaymentModal(prefillType = "invoice", prefillId = null) {
    this.modalHandler.openRecordPaymentModal(prefillType, prefillId);
  }

  openReceiptModal(paymentId, type = "invoice") {
    this.modalHandler.openReceiptModal(paymentId, type);
  }

  openModal(modalId) {
    return this.modalHandler.openModal(modalId);
  }

  closeModal(modalId) {
    return this.modalHandler.closeModal(modalId);
  }

  closeModals() {
    this.modalHandler.closeAll();
  }

  showToast(message) {
    this.modalHandler.showToast(message);
  }
}

// Global initialization
if (typeof window !== "undefined") {
  window.PaymentsManager = PaymentsManager;
  document.addEventListener("DOMContentLoaded", () => {
    window.paymentsManager = new PaymentsManager();
    window.paymentsApp = window.paymentsManager;
  });
}
