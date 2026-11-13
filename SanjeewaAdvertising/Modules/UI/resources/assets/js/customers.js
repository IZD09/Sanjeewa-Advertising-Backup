/**
 * Customer Accounts Directory Module
 * Sanjeewa Advertising Management System
 *
 * Architecture:
 * - CustomerCardBuilder: Fluent builder constructing cards matching UI design
 * - CustomerCardHandler: Card rendering, pagination (20 cards/page), and filtering (extends BasePaginationHandler)
 * - CustomerDataLoader: Fetching customer records and API interaction
 * - RegisterCustomerProcess: Modal management and registration via Customer module API
 * - CustomerFilterProcess: Search input debouncing and filtering
 */

"use strict";

import {
  CustomerDataLoader,
  CustomerCardBuilder,
  CustomerCardHandler,
  RegisterCustomerProcess,
  CustomerFilterProcess,
} from "./customers/index.js";

export class CustomersManager {
  constructor() {
    this.dataLoader = new CustomerDataLoader();
    this.customers = [];
    this.currentPage = 1;
    this.pageSize = 20;
    this.searchTerm = "";

    // Card handler with 20 items per page pagination
    this.cardHandler = new CustomerCardHandler({
      gridId: "customersCardsGrid",
      paginationInfoId: "customerPaginationInfo",
      paginationControlsId: "customerPaginationControls",
      pageSize: 20,
      onPageChange: (newPage) => {
        this.currentPage = newPage;
        this.renderCards();
      },
    });

    // Register Customer Process
    this.registerProcess = new RegisterCustomerProcess({
      dataLoader: this.dataLoader,
      openModal: (id) => this.openModal(id),
      closeModal: (id) => this.closeModal(id),
      showToast: (msg, type) => this.showToast(msg, type),
      onCustomerRegistered: (newCust) => {
        this.customers.unshift(newCust);
        this.currentPage = 1;
        this.renderCards();
        this.updateKPIs();
      },
    });

    // Filter Process
    this.filterProcess = new CustomerFilterProcess({
      inputId: "customerListSearchInput",
      onFilterChange: (term) => {
        this.searchTerm = term;
        this.currentPage = 1;
        this.renderCards();
      },
    });

    this.bindGlobalEvents();
    this.init();
  }

  async init() {
    this.cardHandler.showLoading("Loading customer accounts from Customer Module...");
    const data = await this.dataLoader.fetchCustomersData();
    this.customers = data.customers || [];
    this.renderCards();
    this.updateKPIs(data.kpis);
  }

  renderCards() {
    this.cardHandler.render(this.customers, this.searchTerm, this.currentPage, this.pageSize);
  }

  updateKPIs(kpis = null) {
    const totalCount = kpis?.totalCustomers ?? this.customers.length;
    const totalOrders =
      kpis?.totalOrders ??
      this.customers.reduce(
        (sum, c) => sum + (c.print_jobs_count || c.total_orders || 0),
        0
      );

    const totalCustEl = document.getElementById("kpiTotalCustomers");
    if (totalCustEl) totalCustEl.textContent = String(totalCount);

    const totalOrdersEl = document.getElementById("kpiTotalCustomerOrders");
    if (totalOrdersEl) totalOrdersEl.textContent = `${totalOrders} Orders`;
  }

  bindGlobalEvents() {
    // Modal closer attributes [data-close-modal]
    document.querySelectorAll("[data-close-modal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const modalId = btn.getAttribute("data-close-modal");
        if (modalId) this.closeModal(modalId);
      });
    });

    // Close on backdrop click
    document.querySelectorAll(".po-modal-overlay").forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.classList.remove("active");
        }
      });
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active");
      const firstInput = modal.querySelector("input, select, textarea");
      if (firstInput) setTimeout(() => firstInput.focus(), 100);
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("active");
    }
  }

  showToast(message, type = "info") {
    let container = document.getElementById("poToastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "poToastContainer";
      container.className = "po-toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `po-toast ${type}`;
    const icon =
      type === "success"
        ? "fa-circle-check"
        : type === "error"
          ? "fa-circle-exclamation"
          : "fa-circle-info";
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "poFadeOut 0.3s forwards";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Auto-instantiate when DOM is ready
if (typeof document !== "undefined") {
  const bootCustomers = () => {
    if (document.getElementById("module-customers")) {
      window.customersApp = new CustomersManager();
    }
  };

  bootCustomers();
  document.addEventListener("DOMContentLoaded", bootCustomers);
  document.addEventListener("turbo:load", bootCustomers);
}

export default CustomersManager;

