/**
 * Payments & Financial Settlements Hub
 * Sanjeewa Advertising Digital Printing Shop Management System
 *
 * Modular Architecture:
 * - PaymentDataLoad: Request Handling, CSRF Security, Remote Endpoints, Local Storage & Sample Seeding
 * - InvoicePaymentHandler: Job / Invoice Payment Table, Filtering & Status Badges
 * - GrnPaymentHandler: Stock / GRN Supplier Payment Table, Filtering & Status Badges
 * - PaymentOverviewHandler: Financial KPIs, Payment Method Breakdowns & Net Operating Cash
 * - PaymentModalHandler: Record Payment Modal, Dynamic Inputs, & Live Calculation
 * - PaymentReceiptHandler: Printable Payment Vouchers, Print Dialog & Alerts
 */

"use strict";

import {
<<<<<<< Updated upstream
  PaymentDataLoad,
  TableBuilder,
  InvoicePaymentRowBuilder,
  GrnPaymentRowBuilder,
  InvoicePaymentHandler,
  GrnPaymentHandler,
  PaymentOverviewHandler,
=======
  PaymentsDataLoader,
  InvoicePaymentTableHandler,
  GRNPaymentTableHandler,
  OperatingExpensesTableHandler,
  PaymentsOverviewHandler,
>>>>>>> Stashed changes
  PaymentModalHandler,
  PaymentReceiptHandler
} from "./payment/index.js";

export class PaymentManager {
  constructor() {
    // 1. Data Loader & Remote Request Handler
    this.dataLoader = new PaymentDataLoad();

    // 2. Application State
    this.orders = [];
    this.orderPayments = [];
    this.grnRecords = [];
    this.grnPayments = [];

    this.activeTab = "invoice"; // "invoice", "grn", or "overview"

    // 3. Initialize Process Handlers
    this.receiptHandler = new PaymentReceiptHandler({
      getOrderPayments: () => this.orderPayments,
      getGrnPayments: () => this.grnPayments
    });

<<<<<<< Updated upstream
    this.invoiceHandler = new InvoicePaymentHandler({
      getOrderPayments: () => this.orderPayments,
      onFilterChange: () => this.overviewHandler.updateKPIs(this.orderPayments, this.grnPayments)
    });

    this.grnHandler = new GrnPaymentHandler({
      getGrnPayments: () => this.grnPayments,
      onFilterChange: () => this.overviewHandler.updateKPIs(this.orderPayments, this.grnPayments)
    });

    this.overviewHandler = new PaymentOverviewHandler({
      getOrderPayments: () => this.orderPayments,
      getGrnPayments: () => this.grnPayments
=======
    this.invoiceTableHandler = new InvoicePaymentTableHandler({
      renderStageBadge: (s) => this.overviewHandler.renderStageBadge(s),
      renderMethodBadge: (m, r) => this.overviewHandler.renderMethodBadge(m, r),
      formatCurrency: (amt) => this.dataLoader.formatCurrency(amt),
      pageSize: 8,
      onPageChange: (newPage) => {
        this.invoiceTableHandler.currentPage = newPage;
        this.renderInvoiceTable();
      }
    });

    this.grnTableHandler = new GRNPaymentTableHandler({
      renderStageBadge: (s) => this.overviewHandler.renderStageBadge(s),
      renderMethodBadge: (m, r) => this.overviewHandler.renderMethodBadge(m, r),
      formatCurrency: (amt) => this.dataLoader.formatCurrency(amt),
      pageSize: 8,
      onPageChange: (newPage) => {
        this.grnTableHandler.currentPage = newPage;
        this.renderGrnTable();
      }
    });

    this.expensesHandler = new OperatingExpensesTableHandler({
      formatCurrency: (amt) => this.dataLoader.formatCurrency(amt),
      pageSize: 8,
      onOpenAddModal: () => this.openAddExpenseModal(),
      onOpenMarkPaidModal: (id) => this.openMarkExpensePaidModal(id),
      onUndoPaid: (id) => this.undoExpensePaid(id),
      onPageChange: (newPage) => {
        this.expensesHandler.currentPage = newPage;
        this.renderExpenses();
      }
>>>>>>> Stashed changes
    });

    this.modalHandler = new PaymentModalHandler({
<<<<<<< Updated upstream
      dataLoader: this.dataLoader,
      getOrders: () => this.orders,
      getOrderPayments: () => this.orderPayments,
      getGrnRecords: () => this.grnRecords,
      getGrnPayments: () => this.grnPayments,
      showToast: (msg) => this.receiptHandler.showToast(msg),
      openReceiptModal: (id, type) => this.receiptHandler.openReceiptModal(id, type),
      closeModals: () => this.receiptHandler.closeModals(),
      onPaymentSaved: (newPayment, type) => {
        this.render();
      }
=======
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
      render: () => this.render(),
      onTabSwitched: (tab) => this.onTabSwitched(tab),
      onConceptFilter: (target, type, val) => this.filterProcess.applyConceptFilter(target, type, val)
    });

    this.filterProcess = new FilterProcess({
      renderInvoiceTable: () => {
        this.invoiceTableHandler.currentPage = 1;
        this.renderInvoiceTable();
      },
      renderGrnTable: () => {
        this.grnTableHandler.currentPage = 1;
        this.renderGrnTable();
      },
      renderExpenses: () => {
        this.expensesHandler.currentPage = 1;
        this.renderExpenses();
      },
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
>>>>>>> Stashed changes
    });

    this.init();
  }

<<<<<<< Updated upstream
  /**
   * Initialize datasets, event bindings, and initial views.
   */
  async init() {
    await this.loadData();
    this.bindEvents();
    this.render();
=======
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

  init() {
    this.dataLoader.loadData();
    this.navigationProcess.bindEvents();
    this.filterProcess.bindEvents();
    this.bindGlobalActionButtons();
    this.navigationProcess.switchTab(this.navigationProcess.activeTab);
    this.onTabSwitched(this.navigationProcess.activeTab);
  }

  async onTabSwitched(tab) {
    if (tab === "invoice") {
      this.renderInvoiceTable();
      await this.dataLoader.loadInvoicePayments();
      this.renderInvoiceTable();
      this.updateKPIs();
    } else if (tab === "grn") {
      this.renderGrnTable();
      await this.dataLoader.loadGrnPayments();
      this.renderGrnTable();
      this.updateKPIs();
    } else if (tab === "expenses") {
      this.renderExpenses();
      await this.dataLoader.loadOperatingExpenses();
      this.renderExpenses();
    } else if (tab === "overview") {
      this.renderOverviewTab();
      await Promise.allSettled([
        this.dataLoader.loadInvoicePayments(),
        this.dataLoader.loadGrnPayments()
      ]);
      this.renderOverviewTab();
      this.updateKPIs();
    }
>>>>>>> Stashed changes
  }

  /**
   * Load datasets via PaymentDataLoad service directly into the UI state.
   */
  async loadData() {
    await this.dataLoader.loadIntoUI(this);
  }

  /**
   * Refresh all data from server/storage and re-render the UI.
   */
  async reload() {
    return this.dataLoader.loadIntoUI(this);
  }

  /**
   * Bind page-level event delegation (tabs, modals, receipt buttons).
   */
  bindEvents() {
    document.addEventListener("click", (e) => {
      // 1. Tab Switching
      const tabBtn = e.target.closest(".pay-tab-btn");
      if (tabBtn) {
        e.preventDefault();
        const tab = tabBtn.getAttribute("data-tab");
        this.switchTab(tab);
        return;
      }

      // 2. Open Record Payment Modal Button
      const openModalBtn = e.target.closest("#btnOpenRecordPayment, [data-open-pay-modal]");
      if (openModalBtn) {
        e.preventDefault();
        const prefillType = openModalBtn.getAttribute("data-pay-type") || this.activeTab;
        const prefillId = openModalBtn.getAttribute("data-pay-ref");
        this.modalHandler.openRecordPaymentModal(prefillType, prefillId);
        return;
      }

      // 3. Close Modal Buttons
      const closeBtn = e.target.closest(".pay-modal-close, [data-close-pay-modal]");
      if (closeBtn) {
        e.preventDefault();
        this.receiptHandler.closeModals();
        return;
      }

      // 4. Method selector inside modal
      const methodChoice = e.target.closest(".method-choice");
      if (methodChoice) {
        e.preventDefault();
        document.querySelectorAll(".method-choice").forEach((c) => c.classList.remove("selected"));
        methodChoice.classList.add("selected");
        const method = methodChoice.getAttribute("data-method");
        this.modalHandler.setMethod(method);
        return;
      }

      // 5. View Receipt / Voucher from table
      const receiptBtn = e.target.closest("[data-view-receipt]");
      if (receiptBtn) {
        e.preventDefault();
        const payId = receiptBtn.getAttribute("data-view-receipt");
        const type = receiptBtn.getAttribute("data-type") || "invoice";
        this.receiptHandler.openReceiptModal(payId, type);
        return;
      }
    });
  }

  /**
   * Switch between Invoice Payments, GRN Stock Payments, and Overview tabs.
   * @param {string} tab
   */
  switchTab(tab) {
    this.activeTab =
      tab === "grn" || tab === "grn-payment"
        ? "grn"
        : tab === "overview"
        ? "overview"
        : "invoice";

    // Update Tab Buttons
    document.querySelectorAll(".pay-tab-btn").forEach((btn) => {
      const btnTab = btn.getAttribute("data-tab");
      btn.classList.toggle("active", btnTab === this.activeTab);
    });

    // Update Tab View Panes
    const invPane = document.getElementById("payTabPaneInvoice");
    const grnPane = document.getElementById("payTabPaneGrn");
    const ovPane = document.getElementById("payTabPaneOverview");

    if (invPane) invPane.style.display = this.activeTab === "invoice" ? "block" : "none";
    if (grnPane) grnPane.style.display = this.activeTab === "grn" ? "block" : "none";
    if (ovPane) ovPane.style.display = this.activeTab === "overview" ? "block" : "none";

    // Sync sidebar active sublink if present
    if (window.sidebarComponent) {
      window.sidebarComponent.setActiveRoute(
        "payments",
        this.activeTab === "invoice"
          ? "invoice-payment"
          : this.activeTab === "grn"
          ? "grn-payment"
          : null
      );
    }

    this.render();
  }

  /**
   * Render all sub-views and recalculate KPIs.
   */
  render() {
<<<<<<< Updated upstream
    this.overviewHandler.updateKPIs(this.orderPayments, this.grnPayments);
    this.invoiceHandler.render(this.orderPayments);
    this.grnHandler.render(this.grnPayments);
    this.overviewHandler.renderOverviewTab(this.orderPayments, this.grnPayments);
=======
    this.updateKPIs();
    this.renderInvoiceTable();
    this.renderGrnTable();
    this.renderExpenses();
    this.renderOverviewTab();
  }

  updateKPIs() {
    this.metricsProcess.updateMetrics();
  }

  renderInvoiceTable() {
    this.invoiceTableHandler.render(
      this.dataLoader.orderPayments,
      this.invoiceSearch,
      this.invoiceStatusFilter,
      this.invoiceMethodFilter,
      this.invoiceTableHandler.currentPage,
      this.invoiceTableHandler.pageSize
    );
  }

  renderGrnTable() {
    this.grnTableHandler.render(
      this.dataLoader.grnPayments,
      this.grnSearch,
      this.grnStatusFilter,
      this.grnMethodFilter,
      this.grnTableHandler.currentPage,
      this.grnTableHandler.pageSize
    );
  }

  renderExpenses() {
    this.expensesHandler.render(
      this.dataLoader.expenses,
      this.expenseSearch,
      this.expenseCategoryFilter,
      this.expenseStatusFilter,
      this.expenseMonthFilter,
      this.expensesHandler.currentPage,
      this.expensesHandler.pageSize
    );
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
>>>>>>> Stashed changes
  }
}

// Backward Compatibility Aliases & Global Attachments
export const PaymentsManager = PaymentManager;
export { TableBuilder, InvoicePaymentRowBuilder, GrnPaymentRowBuilder };

if (typeof window !== "undefined") {
  window.PaymentDataLoad = PaymentDataLoad;
  window.TableBuilder = TableBuilder;
  window.InvoicePaymentRowBuilder = InvoicePaymentRowBuilder;
  window.GrnPaymentRowBuilder = GrnPaymentRowBuilder;
  window.PaymentManager = PaymentManager;
  window.PaymentsManager = PaymentManager;

  const initPaymentManager = () => {
    if (!window.paymentManager) {
      window.paymentManager = new PaymentManager();
      window.paymentsManager = window.paymentManager;
      window.paymentDataLoader = window.paymentManager.dataLoader;
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPaymentManager);
  } else {
    initPaymentManager();
  }
}
