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
import { LiveSyncManager } from "./core/LiveSyncManager.js";

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
        this.customers.push(newCust);
        this.customers = this.sortCustomers(this.customers);
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
    const data = await this.dataLoader.fetchCustomersData({
      sort_by: "id",
      sort_order: "asc",
    });
    this.customers = this.sortCustomers(data.customers || []);
    this.renderCards();
    this.updateKPIs(data.kpis);

    // Subscribe to live updates across all users & tabs
    LiveSyncManager.subscribe(
      ["customers", "orders"],
      async () => {
        const fresh = await this.dataLoader.fetchCustomersData({
          sort_by: "id",
          sort_order: "asc",
        });
        this.customers = this.sortCustomers(fresh.customers || []);
        this.renderCards();
        this.updateKPIs(fresh.kpis);
      },
      { key: "customers-live-sync" }
    );
  }

  /**
   * Sort customers by highest pending balance first, then alphabetically by name (A-Z).
   *
   * @param {Array} list
   * @returns {Array}
   */
  sortCustomers(list = []) {
    return (list || []).slice().sort((a, b) => {
      const balA = Number(a?.pending_balance ?? a?.pendingBalance ?? 0);
      const balB = Number(b?.pending_balance ?? b?.pendingBalance ?? 0);
      if (Math.abs(balB - balA) > 0.009) {
        return balB - balA;
      }
      const nameA = String(a?.name || "").trim().toLowerCase();
      const nameB = String(b?.name || "").trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });
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
        if (e.target === overlay && overlay.id) {
          this.closeModal(overlay.id);
        }
      });
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".po-modal-overlay.open").forEach((modal) => {
          if (modal.id) this.closeModal(modal.id);
        });
      }
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      const firstInput = modal.querySelector("input, select, textarea");
      if (firstInput) setTimeout(() => firstInput.focus(), 100);
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      if (document.activeElement && modal.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
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
  window.CustomersManager = CustomersManager;

  const bootCustomers = () => {
    const moduleEl = document.getElementById("module-customers");
    if (moduleEl && !moduleEl.dataset.customersBooted) {
      moduleEl.dataset.customersBooted = "1";
      window.customersApp = new CustomersManager();
    }
  };

  bootCustomers();
  document.addEventListener("DOMContentLoaded", bootCustomers);
  document.addEventListener("turbo:load", bootCustomers);
}

export default CustomersManager;

