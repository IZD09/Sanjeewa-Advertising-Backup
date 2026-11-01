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
  PaymentDataLoad,
  TableBuilder,
  InvoicePaymentRowBuilder,
  GrnPaymentRowBuilder,
  InvoicePaymentHandler,
  GrnPaymentHandler,
  PaymentOverviewHandler,
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
    });

    this.modalHandler = new PaymentModalHandler({
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
    });

    this.init();
  }

  /**
   * Initialize datasets, event bindings, and initial views.
   */
  async init() {
    await this.loadData();
    this.bindEvents();
    this.render();
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
    this.overviewHandler.updateKPIs(this.orderPayments, this.grnPayments);
    this.invoiceHandler.render(this.orderPayments);
    this.grnHandler.render(this.grnPayments);
    this.overviewHandler.renderOverviewTab(this.orderPayments, this.grnPayments);
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
