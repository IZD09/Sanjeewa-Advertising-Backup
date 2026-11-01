/**
 * Payments & Financial Settlements Hub
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Handles:
 *   1. Invoice Payment (Job Payments: Complete, Pending, Advance; Card, Cash, Check, Bank Transfer)
 *   2. GRN Payment (Stock Items & Suppliers: Complete, Pending, Advance; Card, Cash, Check, Bank Transfer)
 *
 * Orchestrated modular architecture delegating to payments/ sub-classes,
 * payments/modals/ dialog handlers, and payments/processes/ button actions.
 */

"use strict";

import {
  PaymentsDataLoader,
  InvoicePaymentTableHandler,
  GRNPaymentTableHandler,
  PaymentsOverviewHandler,
  PaymentModalHandler,
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

    // 1. Modal Handler Orchestrator (delegates to payments/modals/ classes)
    this.modalHandler = new PaymentModalHandler({
      getOrders: () => this.dataLoader.orders,
      getOrderPayments: () => this.dataLoader.orderPayments,
      getGrnRecords: () => this.dataLoader.grnRecords,
      getGrnPayments: () => this.dataLoader.grnPayments,
      saveOrderPayments: () => this.dataLoader.saveOrderPayments(),
      saveGrnPayments: () => this.dataLoader.saveGrnPayments(),
      saveOrders: (ords) => this.dataLoader.saveOrders(ords),
      render: () => this.render()
    });

    // Backward-compatible aliases
    this.recordProcess = this.modalHandler.recordPaymentModal;
    this.receiptHandler = this.modalHandler.receiptModal;

    // 2. Processes (from payments/processes/)
    this.navigationProcess = new NavigationProcess({
      render: () => this.render()
    });

    this.filterProcess = new FilterProcess({
      renderInvoiceTable: () => this.renderInvoiceTable(),
      renderGrnTable: () => this.renderGrnTable()
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

  get orders() { return this.dataLoader.orders; }
  set orders(val) { this.dataLoader.orders = val; }
  get orderPayments() { return this.dataLoader.orderPayments; }
  set orderPayments(val) { this.dataLoader.orderPayments = val; }
  get grnRecords() { return this.dataLoader.grnRecords; }
  set grnRecords(val) { this.dataLoader.grnRecords = val; }
  get grnPayments() { return this.dataLoader.grnPayments; }
  set grnPayments(val) { this.dataLoader.grnPayments = val; }

  get modalType() { return this.modalHandler.modalType; }
  set modalType(val) { this.modalHandler.modalType = val; }
  get selectedMethod() { return this.modalHandler.selectedMethod; }
  set selectedMethod(val) { this.modalHandler.selectedMethod = val; }

  init() {
    this.dataLoader.loadData();
    this.navigationProcess.bindEvents();
    this.filterProcess.bindEvents();
    this.render();
  }

  saveOrderPayments() { this.dataLoader.saveOrderPayments(); }
  saveGrnPayments() { this.dataLoader.saveGrnPayments(); }

  switchTab(tab) { this.navigationProcess.switchTab(tab); }

  render() {
    this.updateKPIs();
    this.renderInvoiceTable();
    this.renderGrnTable();
    this.renderOverviewTab();
  }

  updateKPIs() { this.metricsProcess.updateMetrics(); }
  renderInvoiceTable() { this.invoiceTableHandler.render(this.dataLoader.orderPayments, this.invoiceSearch, this.invoiceStatusFilter, this.invoiceMethodFilter); }
  renderGrnTable() { this.grnTableHandler.render(this.dataLoader.grnPayments, this.grnSearch, this.grnStatusFilter, this.grnMethodFilter); }
  renderOverviewTab() { this.overviewHandler.renderOverviewTab(this.dataLoader.orderPayments, this.dataLoader.grnPayments); }

  renderStageBadge(stage) { return this.overviewHandler.renderStageBadge(stage); }
  renderMethodBadge(method, ref = "") { return this.overviewHandler.renderMethodBadge(method, ref); }

  // Modal Delegations (Backward compatibility for HTML onclick & window calls)
  openRecordPaymentModal(prefillType = "invoice", prefillId = null) { this.modalHandler.openRecordPaymentModal(prefillType, prefillId); }
  updateModalReferenceDropdown(prefillId = null) { this.modalHandler.updateModalReferenceDropdown(prefillId); }
  onReferenceSelected() { this.modalHandler.onReferenceSelected(); }
  onAmountChanged() { this.modalHandler.onAmountChanged(); }
  updateMethodFields() { this.modalHandler.updateMethodFields(); }
  savePayment() { this.modalHandler.savePayment(); }

  openReceiptModal(paymentId, type = "invoice") { this.modalHandler.openReceiptModal(paymentId, type); }
  openModal(modalId) { return this.modalHandler.openModal(modalId); }
  closeModal(modalId) { return this.modalHandler.closeModal(modalId); }
  closeModals() { this.modalHandler.closeAll(); }
  showToast(message) { this.modalHandler.showToast(message); }
}

// Global initialization
if (typeof window !== "undefined") {
  window.PaymentsManager = PaymentsManager;
  document.addEventListener("DOMContentLoaded", () => {
    window.paymentsManager = new PaymentsManager();
    window.paymentsApp = window.paymentsManager;
  });
}
