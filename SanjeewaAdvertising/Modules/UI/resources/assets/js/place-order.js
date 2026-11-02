/**
 * Place Order & Multiple Payment Installments Module
 * Sanjeewa Advertising Printing Shop Management System
 *
 * Modular Architecture:
 * - PrintingOrderBuilder: Order Entity Model with Fluent Chaining & Render
 * - PlaceOrderDataLoad: Fetch Requests, CSRF Authentication, & Persistence
 * - PricingCalculator: Real-Time Pricing, Area, & Badge Calculations
 * - CustomerHandler: Autocomplete Search, Dropdown, & Quick Registration
 * - OrderTableHandler: Table Rendering, Filtering, Pagination, & KPIs
 * - OrderModalHandler: Confirmation, View, Edit, Payment, & Receipt Modals
 * - PaymentHandler: Installments, History, Reversal, & Printable Receipts
 * - Processes: Filter, Export, Metrics, and Order Placement Processes
 */

"use strict";

import {
  PrintingOrder,
  PrintingOrderBuilder,
  PlaceOrderDataLoad,
  PricingCalculator,
  CustomerHandler,
  OrderTableHandler,
  OrderModalHandler,
  OrderPlacementProcess,
  PaymentHandler,
  FilterProcess,
  ExportProcess,
  MetricsProcess
} from "./place-order/index.js";

class PlaceOrderManager {
  constructor() {
    // Data loader & services
    this.dataLoader = new PlaceOrderDataLoad();
    this.products = this.dataLoader.productsCatalog;
    this.employees = ["Admin User", "Kasun Perera", "Nuwan Silva", "Dilshan Fernando", "Chamara Bandara"];
    this.currentUser = "Admin User";

    // Application state
    this.customers = [];
    this.orders = [];
    this.payments = [];
    this.selectedCustomer = null;

    // Table pagination & filtering
    this.currentPage = 1;
    this.pageSize = 8;

    // Initialize process handler classes
    this.pricingCalculator = new PricingCalculator(this.products);

    this.customerHandler = new CustomerHandler({
      customers: this.customers,
      onCustomerSelected: (cust) => {
        this.selectedCustomer = cust;
      },
      onCustomerCreated: (newCust, updatedCustomers) => {
        this.customers = updatedCustomers;
        this.selectedCustomer = newCust;
      },
      showToast: (msg, type) => this.showToast(msg, type),
      openModal: (id) => this.openModal(id),
      closeModal: (id) => this.closeModal(id),
      saveCustomers: (custs) => this.dataLoader.saveCustomers(custs)
    });

    this.orderTableHandler = new OrderTableHandler({
      onRecalculateTotals: (orderId) => this.recalculateOrderTotals(orderId),
      onPageChange: (newPage) => {
        this.currentPage = newPage;
        this.renderOrdersTable();
      }
    });

    this.orderPlacementProcess = new OrderPlacementProcess({
      products: this.products,
      employees: this.employees,
      currentUser: this.currentUser,
      dataLoader: this.dataLoader,
      pricingCalculator: this.pricingCalculator,
      getOrders: () => this.orders,
      getPayments: () => this.payments,
      getSelectedCustomer: () => this.customerHandler.getSelectedCustomer(),
      clearSelectedCustomer: () => this.customerHandler.clearSelectedCustomer(),
      openModal: (id) => this.openModal(id),
      closeModal: (id) => this.closeModal(id),
      showToast: (msg, type) => this.showToast(msg, type),
      onOrderPlaced: (newOrder, orders, payments) => {
        this.orders = orders;
        this.payments = payments;
        this.renderOrdersTable();
        this.updateKPIs();
      },
      onFormReset: () => {
        this.selectedCustomer = null;
      }
    });

    this.orderModalHandler = new OrderModalHandler({
      products: this.products,
      employees: this.employees,
      currentUser: this.currentUser,
      dataLoader: this.dataLoader,
      pricingCalculator: this.pricingCalculator,
      orderPlacementProcess: this.orderPlacementProcess,
      getOrders: () => this.orders,
      getPayments: () => this.payments,
      getSelectedCustomer: () => this.customerHandler.getSelectedCustomer(),
      clearSelectedCustomer: () => this.customerHandler.clearSelectedCustomer(),
      openModal: (id) => this.openModal(id),
      closeModal: (id) => this.closeModal(id),
      showToast: (msg, type) => this.showToast(msg, type),
      calculateMainForm: () => this.pricingCalculator.calculateMainForm(),
      saveNewOrder: () => this.saveNewOrder(),
      onOrderCreated: (newOrder, orders, payments) => {
        this.orders = orders;
        this.payments = payments;
        this.renderOrdersTable();
        this.updateKPIs();
      },
      onOrderUpdated: (updatedOrder, orders) => {
        this.orders = orders;
        this.renderOrdersTable();
        this.updateKPIs();
      },
      onPaymentSaved: (newPayment, order, orders, payments) => {
        this.orders = orders;
        this.payments = payments;
        this.renderOrdersTable();
        this.updateKPIs();
      },
      onPaymentReversed: (payment, order, orders, payments) => {
        this.orders = orders;
        this.payments = payments;
        this.renderOrdersTable();
        this.updateKPIs();
      },
      onCustomerCreated: (newCust) => {
        this.selectedCustomer = newCust;
      },
      resetOrderForm: () => this.resetForm()
    });

    this.paymentHandler = new PaymentHandler({
      dataLoader: this.dataLoader,
      currentUser: this.currentUser,
      getOrders: () => this.orders,
      getPayments: () => this.payments,
      openModal: (id) => this.openModal(id),
      closeModal: (id) => this.closeModal(id),
      showToast: (msg, type) => this.showToast(msg, type),
      onPaymentSaved: (newPayment, order, orders, payments) => {
        this.orders = orders;
        this.payments = payments;
        this.renderOrdersTable();
        this.updateKPIs();
      },
      onPaymentReversed: (payment, orders, payments) => {
        this.orders = orders;
        this.payments = payments;
        this.renderOrdersTable();
        this.updateKPIs();
      }
    });

    // Processes (from place-order/processes/)
    this.filterProcess = new FilterProcess({
      renderTable: () => {
        this.currentPage = 1;
        this.renderOrdersTable();
      }
    });

    this.exportProcess = new ExportProcess({
      getOrders: () => this.orders,
      showToast: (msg, type) => this.showToast(msg, type)
    });

    this.metricsProcess = new MetricsProcess({
      getOrders: () => this.orders
    });

    this.init();
  }

  // Getters for state compatibility
  get searchTerm() { return this.filterProcess.searchTerm; }
  set searchTerm(val) { this.filterProcess.searchTerm = val; }
  get statusFilter() { return this.filterProcess.statusFilter; }
  set statusFilter(val) { this.filterProcess.statusFilter = val; }
  get paymentFilter() { return this.filterProcess.paymentFilter; }
  set paymentFilter(val) { this.filterProcess.paymentFilter = val; }

  async init() {
    // 1. Initial synchronous or async data load
    const data = await this.dataLoader.loadInitialData();
    this.customers = data.customers || [];
    this.orders = data.orders || [];
    this.payments = data.payments || [];
    this.products = data.products || this.dataLoader.productsCatalog;

    // Propagate state to handlers
    this.customerHandler.setCustomers(this.customers);
    this.pricingCalculator.setProducts(this.products);
    this.orderPlacementProcess.setProducts(this.products);
    if (this.orderModalHandler.setProducts) this.orderModalHandler.setProducts(this.products);

    // 2. Setup pickers and event listeners
    this.setupDatePickers();
    this.bindEvents();

    // 3. Render initial views
    this.updateCalculation();
    this.renderOrdersTable();
    this.updateKPIs();
  }

  setupDatePickers() {
    this.orderPlacementProcess.setupDatePickers();
  }

  bindEvents() {
    this.filterProcess.bindEvents();
    this.exportProcess.bindEvents();
  }

  updateCalculation() {
    return this.orderPlacementProcess.updateCalculation();
  }

  resetForm() {
    this.orderPlacementProcess.resetForm();
  }

  // Facade Methods for Template Actions & Inlined Handlers
  openCreateOrderModal() {
    this.openModal("createOrderModal");
  }

  closeCreateOrderModal() {
    this.closeModal("createOrderModal");
  }

  openOrderConfirmation() {
    this.orderPlacementProcess.openConfirmation();
  }

  saveNewOrder() {
    this.orderPlacementProcess.confirmAndPlaceOrder();
  }

  openViewModal(orderId) {
    this.orderModalHandler.openViewModal(orderId);
  }

  openEditModal(orderId) {
    this.orderModalHandler.openEditModal(orderId);
  }

  saveOrderEdit() {
    this.orderModalHandler.saveOrderEdit(this.orders);
  }

  recalculateOrderTotals(orderId) {
    this.paymentHandler.recalculateOrderTotals(orderId, this.orders, this.payments);
  }

  openAddPaymentModal(orderId) {
    this.orderModalHandler.openAddPaymentModal(orderId);
  }

  saveNewPayment() {
    this.orderModalHandler.saveNewPayment();
  }

  openHistoryModal(orderId) {
    this.orderModalHandler.openPaymentHistoryModal(orderId);
  }

  reversePayment(paymentId) {
    this.orderModalHandler.reversePayment(paymentId);
  }

  printLatestReceipt(orderId) {
    this.paymentHandler.printLatestReceipt(orderId, this.orders, this.payments);
  }

  printSpecificReceipt(paymentId) {
    this.paymentHandler.printSpecificReceipt(paymentId, this.orders, this.payments);
  }

  openReceiptModal(payment, order) {
    if (typeof payment === "string") {
      this.orderModalHandler.openReceiptModal(payment);
    } else {
      this.paymentHandler.openReceiptModal(payment, order);
    }
  }

  triggerPrintReceipt() {
    this.orderModalHandler.triggerPrintReceipt();
  }

  renderOrdersTable() {
    this.orderTableHandler.render(
      this.orders,
      this.searchTerm,
      this.statusFilter,
      this.paymentFilter,
      this.currentPage,
      this.pageSize
    );
  }

  async reloadOrdersFromPrintJobService() {
    const data = await this.dataLoader.fetchPrintJobOrders();
    if (data.orders && data.orders.length > 0) {
      this.orders = data.orders;
      if (data.payments && data.payments.length > 0) {
        this.payments = data.payments;
      }
      this.renderOrdersTable();
      this.updateKPIs();
    }
    return data;
  }

  updateKPIs() {
    this.orderTableHandler.updateKPIs(this.orders);
    this.metricsProcess.updateMetrics();
  }

  exportCSV() {
    this.exportProcess.exportCSV();
  }

  // Modal & Toast Helpers
  openModal(modalId) {
    return this.orderModalHandler ? this.orderModalHandler.openModal(modalId) : document.getElementById(modalId)?.classList.add("open");
  }

  closeModal(modalId) {
    return this.orderModalHandler ? this.orderModalHandler.closeModal(modalId) : document.getElementById(modalId)?.classList.remove("open");
  }

  closeAllModals() {
    if (this.orderModalHandler) this.orderModalHandler.closeAllModals();
  }

  showToast(message, type = "success") {
    if (this.orderModalHandler) {
      return this.orderModalHandler.showToast(message, type);
    }
  }
}

// Global initialization
document.addEventListener("DOMContentLoaded", () => {
  window.PrintingOrder = PrintingOrder;
  window.PrintingOrderBuilder = PrintingOrderBuilder;
  window.PlaceOrderDataLoad = PlaceOrderDataLoad;
  window.OrderPlacementProcess = OrderPlacementProcess;
  window.placeOrderApp = new PlaceOrderManager();
});
