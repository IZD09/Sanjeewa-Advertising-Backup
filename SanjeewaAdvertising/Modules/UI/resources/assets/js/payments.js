/**
 * Payments & Financial Settlements Hub
 * Sanjeewa Advertising Digital Printing Shop Management System
 *
 * Modular Architecture:
 * - PaymentsDataLoader / PaymentsDataService: Backend API Fetching via RequestHandler & Local Storage Cache
 * - InvoicePaymentTableHandler: Job / Invoice Payment Table extending BaseTableLoader
 * - GRNPaymentTableHandler: Stock / GRN Supplier Payment Table extending BaseTableLoader
 * - OperatingExpensesTableHandler: Monthly Operating Utility Bills extending BaseTableLoader
 * - PaymentsOverviewHandler: Financial KPIs, Payment Method Breakdowns & Net Operating Cash
 * - PaymentModalHandler: Record Payment Modal, Dynamic Inputs, & Live Calculation
 * - PaymentReceiptHandler: Printable Payment Vouchers, Print Dialog & Alerts
 * - NavigationProcess: Tab & Subroute Routing and Concept Filter Management
 */

"use strict";

import {
  PaymentsDataLoader,
  PaymentDataLoad,
  PaymentsDataService,
  InvoicePaymentRowBuilder,
  InvoicePayment,
  GrnPaymentRowBuilder,
  GrnPayment,
  OperatingExpenseRowBuilder,
  OperatingExpense,
  InvoicePaymentTableHandler,
  InvoicePaymentHandler,
  GRNPaymentTableHandler,
  GrnPaymentHandler,
  OperatingExpensesTableHandler,
  OperatingExpensesHandler,
  PaymentsOverviewHandler,
  PaymentOverviewHandler,
  PaymentReceiptHandler,
  PaymentModalHandler,
  NavigationProcess
} from "./payments/index.js";

export class PaymentManager {
  constructor() {
    // 1. Data Loader & Remote Request Handler
    this.dataLoader = new PaymentsDataLoader();

    // 2. Receipt and Notification Handler
    this.receiptHandler = new PaymentReceiptHandler({
      getOrderPayments: () => this.dataLoader.orderPayments,
      getGrnPayments: () => this.dataLoader.grnPayments
    });

    // 3. Overview & Reconciliation Handler
    this.overviewHandler = new PaymentsOverviewHandler({
      getOrderPayments: () => this.dataLoader.orderPayments,
      getGrnPayments: () => this.dataLoader.grnPayments
    });

    // 4. Invoice Payment Table Loader (BaseTableLoader)
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

    // 5. GRN Payment Table Loader (BaseTableLoader)
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

    // 6. Operating Expenses Table Loader (BaseTableLoader)
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
    });

    // 7. Modal Dialog Handler
    this.modalHandler = new PaymentModalHandler({
      dataLoader: this.dataLoader,
      getOrders: () => this.dataLoader.orders,
      getOrderPayments: () => this.dataLoader.orderPayments,
      getGrnRecords: () => this.dataLoader.grnRecords,
      getGrnPayments: () => this.dataLoader.grnPayments,
      showToast: (msg) => this.receiptHandler.showToast(msg),
      openReceiptModal: (id, type) => this.receiptHandler.openReceiptModal(id, type),
      closeModals: () => this.receiptHandler.closeModals(),
      onPaymentSaved: (newPayment, type) => {
        this.render();
      }
    });

    // 8. Navigation Process
    this.navigationProcess = new NavigationProcess({
      render: () => this.render(),
      onTabSwitched: (tab) => this.onTabSwitched(tab),
      onConceptFilter: (target, type, val) => this.applyConceptFilter(target, type, val)
    });

    // Filter states
    this.invoiceSearch = "";
    this.invoiceStatusFilter = "ALL";
    this.invoiceMethodFilter = "ALL";

    this.grnSearch = "";
    this.grnStatusFilter = "ALL";
    this.grnMethodFilter = "ALL";

    this.init();
  }

  // Getters & setters for backward compatibility
  get activeTab() { return this.navigationProcess.activeTab; }
  set activeTab(val) { this.navigationProcess.activeTab = val; }

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
    this.bindFilterEvents();
    this.bindGlobalActionButtons();
    this.navigationProcess.switchTab(this.navigationProcess.activeTab);
    this.onTabSwitched(this.navigationProcess.activeTab);
  }

  /**
   * Universal onTabSwitched trigger: calls backend endpoint via RequestHandler when user opens a tab.
   * @param {string} tab
   */
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
        this.dataLoader.loadGrnPayments(),
        this.dataLoader.loadOperatingExpenses()
      ]);
      this.renderOverviewTab();
      this.updateKPIs();
    }
  }

  /**
   * Re-render all view panes and metrics.
   */
  render() {
    this.updateKPIs();
    this.renderInvoiceTable();
    this.renderGrnTable();
    this.renderExpenses();
    this.renderOverviewTab();
  }

  updateKPIs() {
    this.overviewHandler.updateKPIs(this.dataLoader.orderPayments, this.dataLoader.grnPayments);

    // Update navigation badge counters
    const invCount = document.getElementById("tabBadgeInvoiceCount");
    const grnCount = document.getElementById("tabBadgeGrnCount");
    const expCount = document.getElementById("tabBadgeExpensesCount");

    if (invCount) invCount.textContent = (this.dataLoader.orderPayments || []).length;
    if (grnCount) grnCount.textContent = (this.dataLoader.grnPayments || []).length;
    if (expCount) expCount.textContent = (this.dataLoader.expenses || []).length;
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
      this.expensesHandler.expenseSearch,
      this.expensesHandler.expenseCategoryFilter,
      this.expensesHandler.expenseStatusFilter,
      this.expensesHandler.expenseMonthFilter,
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

  applyConceptFilter(target, type, val) {
    if (target === "invoice") {
      if (type === "stage") {
        this.invoiceStatusFilter = val;
        const sel = document.getElementById("payInvoiceStatusFilter");
        if (sel) sel.value = val;
      } else if (type === "method") {
        this.invoiceMethodFilter = val;
        const sel = document.getElementById("payInvoiceMethodFilter");
        if (sel) sel.value = val;
      }
      this.invoiceTableHandler.currentPage = 1;
      this.renderInvoiceTable();
    } else if (target === "grn") {
      if (type === "stage") {
        this.grnStatusFilter = val;
        const sel = document.getElementById("payGrnStatusFilter");
        if (sel) sel.value = val;
      } else if (type === "method") {
        this.grnMethodFilter = val;
        const sel = document.getElementById("payGrnMethodFilter");
        if (sel) sel.value = val;
      }
      this.grnTableHandler.currentPage = 1;
      this.renderGrnTable();
    }
  }

  bindFilterEvents() {
    // 1. Invoice Table Filters
    const invSearch = document.getElementById("payInvoiceSearch");
    if (invSearch) {
      invSearch.addEventListener("input", (e) => {
        this.invoiceSearch = e.target.value.toLowerCase().trim();
        this.invoiceTableHandler.currentPage = 1;
        this.renderInvoiceTable();
      });
    }

    const invStage = document.getElementById("payInvoiceStatusFilter");
    if (invStage) {
      invStage.addEventListener("change", (e) => {
        this.invoiceStatusFilter = e.target.value;
        this.invoiceTableHandler.currentPage = 1;
        this.renderInvoiceTable();
      });
    }

    const invMethod = document.getElementById("payInvoiceMethodFilter");
    if (invMethod) {
      invMethod.addEventListener("change", (e) => {
        this.invoiceMethodFilter = e.target.value;
        this.invoiceTableHandler.currentPage = 1;
        this.renderInvoiceTable();
      });
    }

    const invReset = document.getElementById("payInvoiceResetFilters");
    if (invReset) {
      invReset.addEventListener("click", () => {
        if (invSearch) invSearch.value = "";
        if (invStage) invStage.value = "ALL";
        if (invMethod) invMethod.value = "ALL";
        this.invoiceSearch = "";
        this.invoiceStatusFilter = "ALL";
        this.invoiceMethodFilter = "ALL";
        this.invoiceTableHandler.currentPage = 1;
        this.renderInvoiceTable();
      });
    }

    // 2. GRN Table Filters
    const grnSearch = document.getElementById("payGrnSearch");
    if (grnSearch) {
      grnSearch.addEventListener("input", (e) => {
        this.grnSearch = e.target.value.toLowerCase().trim();
        this.grnTableHandler.currentPage = 1;
        this.renderGrnTable();
      });
    }

    const grnStage = document.getElementById("payGrnStatusFilter");
    if (grnStage) {
      grnStage.addEventListener("change", (e) => {
        this.grnStatusFilter = e.target.value;
        this.grnTableHandler.currentPage = 1;
        this.renderGrnTable();
      });
    }

    const grnMethod = document.getElementById("payGrnMethodFilter");
    if (grnMethod) {
      grnMethod.addEventListener("change", (e) => {
        this.grnMethodFilter = e.target.value;
        this.grnTableHandler.currentPage = 1;
        this.renderGrnTable();
      });
    }

    const grnReset = document.getElementById("payGrnResetFilters");
    if (grnReset) {
      grnReset.addEventListener("click", () => {
        if (grnSearch) grnSearch.value = "";
        if (grnStage) grnStage.value = "ALL";
        if (grnMethod) grnMethod.value = "ALL";
        this.grnSearch = "";
        this.grnStatusFilter = "ALL";
        this.grnMethodFilter = "ALL";
        this.grnTableHandler.currentPage = 1;
        this.renderGrnTable();
      });
    }

    // 3. Operating Expenses Filters
    const expMonth = document.getElementById("expMonthSelect");
    if (expMonth) {
      expMonth.addEventListener("change", (e) => {
        this.expensesHandler.setMonthFilter(e.target.value);
        this.expensesHandler.currentPage = 1;
        this.renderExpenses();
      });
    }

    const expThisMonth = document.getElementById("btnExpThisMonth");
    if (expThisMonth) {
      expThisMonth.addEventListener("click", () => {
        const currentMonth = "2026-10";
        if (expMonth) expMonth.value = currentMonth;
        this.expensesHandler.setMonthFilter(currentMonth);
        this.expensesHandler.currentPage = 1;
        this.renderExpenses();
      });
    }

    const expSearch = document.getElementById("payExpenseSearch");
    if (expSearch) {
      expSearch.addEventListener("input", (e) => {
        this.expensesHandler.setSearchFilter(e.target.value);
        this.expensesHandler.currentPage = 1;
        this.renderExpenses();
      });
    }

    const expCat = document.getElementById("payExpenseCategoryFilter");
    if (expCat) {
      expCat.addEventListener("change", (e) => {
        this.expensesHandler.setCategoryFilter(e.target.value);
        this.expensesHandler.currentPage = 1;
        this.renderExpenses();
      });
    }

    const expStatus = document.getElementById("payExpenseStatusFilter");
    if (expStatus) {
      expStatus.addEventListener("change", (e) => {
        this.expensesHandler.setStatusFilter(e.target.value);
        this.expensesHandler.currentPage = 1;
        this.renderExpenses();
      });
    }

    const expReset = document.getElementById("payExpenseResetFilters");
    if (expReset) {
      expReset.addEventListener("click", () => {
        if (expSearch) expSearch.value = "";
        if (expCat) expCat.value = "ALL";
        if (expStatus) expStatus.value = "ALL";
        this.expensesHandler.setSearchFilter("");
        this.expensesHandler.setCategoryFilter("ALL");
        this.expensesHandler.setStatusFilter("ALL");
        this.expensesHandler.currentPage = 1;
        this.renderExpenses();
      });
    }
  }

  bindGlobalActionButtons() {
    document.addEventListener("click", (e) => {
      // 1. Record Payment Modal Opener
      const openModalBtn = e.target.closest("#btnOpenRecordPayment, [data-open-pay-modal]");
      if (openModalBtn) {
        e.preventDefault();
        const prefillType = openModalBtn.getAttribute("data-pay-type") || this.activeTab;
        const prefillId = openModalBtn.getAttribute("data-pay-ref");
        this.modalHandler.openRecordPaymentModal(prefillType, prefillId);
        return;
      }

      // 2. Close Modal Buttons
      const closeBtn = e.target.closest(".pay-modal-close, [data-close-pay-modal]");
      if (closeBtn) {
        e.preventDefault();
        this.receiptHandler.closeModals();
        return;
      }

      // 3. Method selector inside modal
      const methodChoice = e.target.closest(".method-choice");
      if (methodChoice) {
        e.preventDefault();
        document.querySelectorAll(".method-choice").forEach((c) => c.classList.remove("selected"));
        methodChoice.classList.add("selected");
        const method = methodChoice.getAttribute("data-method");
        this.modalHandler.setMethod(method);
        return;
      }

      // 4. View Receipt / Voucher from table
      const receiptBtn = e.target.closest("[data-view-receipt]");
      if (receiptBtn) {
        e.preventDefault();
        const payId = receiptBtn.getAttribute("data-view-receipt");
        const type = receiptBtn.getAttribute("data-type") || "invoice";
        this.receiptHandler.openReceiptModal(payId, type);
        return;
      }

      // 5. Operating Expenses Actions (Mark as Paid / Revert)
      const markPaidBtn = e.target.closest("[data-mark-paid-id]");
      if (markPaidBtn) {
        e.preventDefault();
        const expId = markPaidBtn.getAttribute("data-mark-paid-id");
        this.markExpensePaid(expId);
        return;
      }

      const undoPaidBtn = e.target.closest("[data-undo-paid-id]");
      if (undoPaidBtn) {
        e.preventDefault();
        const expId = undoPaidBtn.getAttribute("data-undo-paid-id");
        this.undoExpensePaid(expId);
        return;
      }
    });
  }

  markExpensePaid(expenseId) {
    const expense = (this.dataLoader.expenses || []).find((x) => x.id === expenseId);
    if (!expense) return;

    expense.status = "Paid";
    expense.paidDate = new Date().toISOString().split("T")[0];
    expense.paidAmount = expense.amount;
    expense.paidMethod = "Bank Transfer";
    expense.paidRef = `TXN-${Date.now().toString().slice(-6)}`;

    this.dataLoader.saveExpenses();
    this.renderExpenses();
    this.showToast(`Operating Bill ${expense.title} marked as Paid!`);
  }

  undoExpensePaid(expenseId) {
    const expense = (this.dataLoader.expenses || []).find((x) => x.id === expenseId);
    if (!expense) return;

    expense.status = "Pending";
    expense.paidDate = "";
    expense.paidAmount = 0;
    expense.paidMethod = "";
    expense.paidRef = "";

    this.dataLoader.saveExpenses();
    this.renderExpenses();
    this.showToast(`Operating Bill ${expense.title} reverted to Pending.`);
  }

  showToast(message) {
    this.receiptHandler.showToast(message);
  }

  switchTab(tab) {
    this.navigationProcess.switchTab(tab);
  }
}

// Backward Compatibility Aliases & Global Attachments
export const PaymentsManager = PaymentManager;
export {
  PaymentsDataLoader,
  PaymentDataLoad,
  PaymentsDataService,
  InvoicePaymentRowBuilder,
  InvoicePayment,
  GrnPaymentRowBuilder,
  GrnPayment,
  OperatingExpenseRowBuilder,
  OperatingExpense,
  InvoicePaymentTableHandler,
  GRNPaymentTableHandler,
  OperatingExpensesTableHandler
};

if (typeof window !== "undefined") {
  window.PaymentDataLoad = PaymentDataLoad;
  window.PaymentsDataLoader = PaymentsDataLoader;
  window.PaymentsDataService = PaymentsDataService;
  window.InvoicePaymentRowBuilder = InvoicePaymentRowBuilder;
  window.GrnPaymentRowBuilder = GrnPaymentRowBuilder;
  window.OperatingExpenseRowBuilder = OperatingExpenseRowBuilder;
  window.InvoicePaymentTableHandler = InvoicePaymentTableHandler;
  window.GRNPaymentTableHandler = GRNPaymentTableHandler;
  window.OperatingExpensesTableHandler = OperatingExpensesTableHandler;
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
