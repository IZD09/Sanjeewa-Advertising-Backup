/**
 * SanjeewaAdvertising - Add Customer Modal
 *
 * Handles quick customer registration modal dialog (#addCustomerModal),
 * validation, and selection of newly created customers.
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class AddCustomerModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Array} context.customers
   * @param {Function} [context.saveCustomers]
   * @param {Function} [context.onCustomerCreated]
   */
  constructor(context) {
    super({
      activeModalClass: "open",
      overlaySelector: ".po-modal-overlay",
      toastContainerId: "poToastContainer",
      closeSelectors: ["[data-close-modal]", ".po-modal-close"],
      autoBind: true
    });

    this.ctx = context;

    this.bindEvents();
  }

  bindEvents() {
    const openAddCustBtn = document.getElementById("openAddCustBtn");
    if (openAddCustBtn) {
      openAddCustBtn.addEventListener("click", () => this.openAddCustomerModal());
    }

    const saveNewCustBtn = document.getElementById("saveNewCustomerBtn");
    if (saveNewCustBtn) {
      saveNewCustBtn.addEventListener("click", () => this.saveNewCustomer());
    }
  }

  openAddCustomerModal() {
    const nameInput = document.getElementById("newCustName");
    const mobileInput = document.getElementById("newCustMobile");
    const emailInput = document.getElementById("newCustEmail");
    const addressInput = document.getElementById("newCustAddress");

    if (nameInput) nameInput.value = "";
    if (mobileInput) mobileInput.value = "";
    if (emailInput) emailInput.value = "";
    if (addressInput) addressInput.value = "";

    this.openModal("addCustomerModal");
  }

  saveNewCustomer() {
    const nameInput = document.getElementById("newCustName");
    const mobileInput = document.getElementById("newCustMobile");
    const emailInput = document.getElementById("newCustEmail");
    const addressInput = document.getElementById("newCustAddress");

    const name = (nameInput?.value || "").trim();
    const mobile = (mobileInput?.value || "").trim();
    const email = (emailInput?.value || "").trim();
    const address = (addressInput?.value || "").trim();

    if (!name) {
      this.showToast("Please enter customer name", "error");
      if (nameInput) nameInput.focus();
      return;
    }

    if (!mobile || !/^[0-9+ ]{9,13}$/.test(mobile.replace(/[\s-]/g, ""))) {
      this.showToast("Please enter a valid 10-digit mobile number", "error");
      if (mobileInput) mobileInput.focus();
      return;
    }

    const customers = this.ctx.customers || [];
    const exists = customers.some(c => c.mobile.replace(/[\s-]/g, "") === mobile.replace(/[\s-]/g, ""));
    if (exists) {
      this.showToast("A customer with this mobile number already exists", "error");
      return;
    }

    const nextId = `CUST-${String(customers.length + 1).padStart(3, "0")}`;
    const newCustomer = {
      id: nextId,
      name,
      mobile,
      email: email || `${name.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
      address: address || "Kandy, Sri Lanka",
      ordersCount: 0
    };

    customers.unshift(newCustomer);
    if (this.ctx.saveCustomers) {
      this.ctx.saveCustomers(customers);
    }

    this.closeModal("addCustomerModal");
    this.showToast(`Customer "${name}" created successfully!`, "success");

    if (this.ctx.onCustomerCreated) {
      this.ctx.onCustomerCreated(newCustomer);
    }
  }
}

