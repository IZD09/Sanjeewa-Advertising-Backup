/**
 * SanjeewaAdvertising - Order Confirmation Modal
 *
 * Handles order summary confirmation modal dialog (#orderConfirmationModal)
 * and order creation confirmation action.
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class OrderConfirmationModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getSelectedCustomer
   * @param {Function} context.calculateMainForm
   * @param {Object} context.products
   * @param {Function} [context.saveNewOrder]
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
    const confirmBtn = document.getElementById("confirmPlaceOrderBtn");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => {
        if (this.ctx.saveNewOrder) this.ctx.saveNewOrder();
      });
    }
  }

  openOrderConfirmation() {
    const selectedCustomer = this.ctx.getSelectedCustomer ? this.ctx.getSelectedCustomer() : null;
    if (!selectedCustomer) {
      this.showToast("Please search and select a customer first", "error");
      const searchInput = document.getElementById("customerSearchInput");
      if (searchInput) searchInput.focus();
      return;
    }

    const width = parseFloat(document.getElementById("poWidth")?.value);
    const height = parseFloat(document.getElementById("poHeight")?.value);
    const qty = parseInt(document.getElementById("poQty")?.value, 10);
    const unitPrice = parseFloat(document.getElementById("poUnitPrice")?.value);
    const requiredDate = document.getElementById("poRequiredDate")?.value;

    if (width <= 0 || height <= 0 || isNaN(width) || isNaN(height)) {
      this.showToast("Width and Height must be greater than zero", "error");
      return;
    }
    if (qty <= 0 || isNaN(qty)) {
      this.showToast("Quantity must be at least 1", "error");
      return;
    }
    if (unitPrice < 0 || isNaN(unitPrice)) {
      this.showToast("Unit price cannot be negative", "error");
      return;
    }
    if (!requiredDate) {
      this.showToast("Please select a required deadline date", "error");
      return;
    }

    const calc = this.ctx.calculateMainForm ? this.ctx.calculateMainForm() : { totalAmount: 0, paidAmount: 0, balanceAmount: 0, paymentStatus: "Unpaid" };
    const prodKey = document.getElementById("poProductType")?.value || "flex_normal";
    const prod = (this.ctx.products && this.ctx.products[prodKey]) || { name: "Flex Banner" };

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setTxt("confCustName", selectedCustomer.name);
    setTxt("confCustMobile", selectedCustomer.mobile);
    setTxt("confProduct", prod.name);
    setTxt("confSpecs", `${width} × ${height} ${document.getElementById("poUnit")?.value || "feet"} (Qty: ${qty})`);
    setTxt("confTotal", `Rs. ${calc.totalAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("confPaid", `Rs. ${calc.paidAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("confBalance", `Rs. ${calc.balanceAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("confStatus", calc.paymentStatus);
    setTxt("confDeadline", requiredDate);

    this.openModal("orderConfirmationModal");
  }
}

