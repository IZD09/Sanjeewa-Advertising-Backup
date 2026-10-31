/**
 * Place Order & Multiple Payment Installments Module
 * Sanjeewa Advertising Printing Shop Management System
 *
 * Modular Architecture:
 * - PrintingOrder: Order Entity Model with Fluent Chaining & Render
 * - PlaceOrderDataLoad: Fetch Requests, CSRF Authentication, & Persistence
 * - PricingCalculator: Real-Time Pricing, Area, & Badge Calculations
 * - CustomerHandler: Autocomplete Search, Dropdown, & Quick Registration
 * - OrderTableHandler: Table Rendering, Filtering, Pagination, & KPIs
 * - OrderModalHandler: Confirmation, View, & Edit Modals
 * - PaymentHandler: Installments, History, Reversal, & Printable Receipts
 */

"use strict";

import {
  PrintingOrder,
  PlaceOrderDataLoad,
  PricingCalculator,
  CustomerHandler,
  OrderTableHandler,
  OrderModalHandler,
  PaymentHandler
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
    this.searchTerm = "";
    this.statusFilter = "ALL";
    this.paymentFilter = "ALL";

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

    this.orderModalHandler = new OrderModalHandler({
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

    this.init();
  }

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
    this.orderModalHandler.setProducts(this.products);

    // 2. Setup pickers and event listeners
    this.setupDatePickers();
    this.bindEvents();

    // 3. Render initial views
    this.updateCalculation();
    this.renderOrdersTable();
    this.updateKPIs();
  }

  /* ==========================================================================
     Date Pickers & Time Helpers
     ========================================================================== */
  setupDatePickers() {
    const todayStr = new Date().toISOString().split("T")[0];
    const orderDateInput = document.getElementById("poOrderDate");
    const requiredDateInput = document.getElementById("poRequiredDate");

    if (orderDateInput) {
      orderDateInput.value = todayStr;
    }
    if (requiredDateInput) {
      const deadline = new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0];
      requiredDateInput.value = deadline;
      requiredDateInput.min = todayStr;
    }

    const todayDateElem = document.getElementById("todayDate");
    if (todayDateElem) {
      todayDateElem.textContent = new Intl.DateTimeFormat("en-LK", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(new Date());
    }
  }

  /* ==========================================================================
     Event Binding & Controls
     ========================================================================== */
  bindEvents() {
    // Form input changes -> real-time recalculation
    const calcFields = ["poProductType", "poWidth", "poHeight", "poUnit", "poQty", "poUnitPrice", "poDesignStatus", "poPaidAmount"];
    calcFields.forEach(id => {
      const elem = document.getElementById(id);
      if (elem) {
        elem.addEventListener("input", () => this.updateCalculation());
        elem.addEventListener("change", () => this.updateCalculation());
      }
    });

    // Product select change -> set default unit & unit price
    const prodSelect = document.getElementById("poProductType");
    if (prodSelect) {
      prodSelect.addEventListener("change", () => {
        const prod = this.products[prodSelect.value];
        if (prod) {
          const unitElem = document.getElementById("poUnit");
          const priceElem = document.getElementById("poUnitPrice");
          if (unitElem) unitElem.value = prod.defaultUnit;
          if (priceElem) priceElem.value = prod.unitPrice.toFixed(2);
          this.updateCalculation();
        }
      });
    }

    // Reset Form button
    const resetBtn = document.getElementById("resetOrderFormBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetForm());
    }

    // Table Search & Filters
    const orderSearch = document.getElementById("orderSearchInput");
    if (orderSearch) {
      orderSearch.addEventListener("input", (e) => {
        this.searchTerm = e.target.value.toLowerCase().trim();
        this.currentPage = 1;
        this.renderOrdersTable();
      });
    }

    const statusFilter = document.getElementById("orderStatusFilter");
    if (statusFilter) {
      statusFilter.addEventListener("change", (e) => {
        this.statusFilter = e.target.value;
        this.currentPage = 1;
        this.renderOrdersTable();
      });
    }

    const paymentFilter = document.getElementById("orderPaymentFilter");
    if (paymentFilter) {
      paymentFilter.addEventListener("change", (e) => {
        this.paymentFilter = e.target.value;
        this.currentPage = 1;
        this.renderOrdersTable();
      });
    }

    // Modal Close buttons
    document.querySelectorAll("[data-close-modal]").forEach(btn => {
      btn.addEventListener("click", () => {
        const modalId = btn.getAttribute("data-close-modal");
        this.closeModal(modalId);
      });
    });

    // Close modal on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".po-modal-overlay.open").forEach(modal => {
          modal.classList.remove("open");
        });
      }
    });
  }

  updateCalculation() {
    return this.pricingCalculator.calculateMainForm();
  }

  resetForm() {
    this.customerHandler.clearSelectedCustomer();
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setVal("poWidth", "10");
    setVal("poHeight", "4");
    setVal("poQty", "1");
    setVal("poProductType", "flex_normal");
    setVal("poUnit", "feet");
    setVal("poUnitPrice", "95.00");
    setVal("poDesignStatus", "Customer Provides Design");
    setVal("poDeliveryMethod", "Pickup");
    setVal("poPaidAmount", "0.00");
    setVal("poNotes", "");

    this.setupDatePickers();
    this.updateCalculation();
  }

  /* ==========================================================================
     Facade Methods for Template Actions & Inlined Handlers
     ========================================================================== */
  openOrderConfirmation() {
    this.orderModalHandler.openOrderConfirmation();
  }

  saveNewOrder() {
    this.orderModalHandler.saveNewOrder(this.orders, this.payments);
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
    this.paymentHandler.openAddPaymentModal(orderId, this.orders, this.payments);
  }

  saveNewPayment() {
    this.paymentHandler.saveNewPayment(this.orders, this.payments);
  }

  openHistoryModal(orderId) {
    this.paymentHandler.openHistoryModal(orderId, this.orders, this.payments);
  }

  reversePayment(paymentId) {
    this.paymentHandler.reversePayment(paymentId, this.orders, this.payments);
  }

  printLatestReceipt(orderId) {
    this.paymentHandler.printLatestReceipt(orderId, this.orders, this.payments);
  }

  printSpecificReceipt(paymentId) {
    this.paymentHandler.printSpecificReceipt(paymentId, this.orders, this.payments);
  }

  openReceiptModal(payment, order) {
    this.paymentHandler.openReceiptModal(payment, order);
  }

  triggerPrintReceipt() {
    this.paymentHandler.triggerPrintReceipt();
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

  updateKPIs() {
    this.orderTableHandler.updateKPIs(this.orders);
  }

  /* ==========================================================================
     Modal & Toast Helpers
     ========================================================================== */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("open");
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("open");
  }

  showToast(message, type = "success") {
    const container = document.getElementById("poToastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `po-toast ${type}`;

    let icon = "fa-check-circle";
    if (type === "error") icon = "fa-triangle-exclamation";
    if (type === "warning") icon = "fa-circle-exclamation";

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = "opacity 0.25s ease, transform 0.25s ease";
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => toast.remove(), 260);
    }, 3500);
  }
}

// Global initialization
document.addEventListener("DOMContentLoaded", () => {
  window.PrintingOrder = PrintingOrder;
  window.PlaceOrderDataLoad = PlaceOrderDataLoad;
  window.placeOrderApp = new PlaceOrderManager();
});
