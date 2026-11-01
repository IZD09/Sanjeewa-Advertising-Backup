/**
 * SanjeewaAdvertising - Edit Order Modal
 *
 * Handles order editing modal dialog (#editOrderModal),
 * live recalculation on dimensions/materials changes, and saving changes.
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class EditOrderModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getOrders
   * @param {Object} context.products
   * @param {Array} context.employees
   * @param {Object} context.pricingCalculator
   * @param {Object} context.dataLoader
   * @param {Function} [context.onOrderUpdated]
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
    this.currentContextOrder = null;
    this._liveCalcBound = false;

    this.bindEvents();
  }

  bindEvents() {
    const saveEditBtn = document.getElementById("saveEditOrderBtn");
    if (saveEditBtn) {
      saveEditBtn.addEventListener("click", () => this.saveOrderEdit());
    }
  }

  openEditModal(orderOrId) {
    let order = orderOrId;
    if (typeof orderOrId === "string") {
      const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
      order = orders.find(o => o.id === orderOrId);
    }
    if (!order) return;
    this.currentContextOrder = order;

    const setTxt = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val !== undefined && val !== null ? val : "";
    };

    const modalTitle = document.getElementById("editModalTitle");
    if (modalTitle) {
      modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Order — ${order.id}`;
    }

    setTxt("eoId", order.id);
    setTxt("eoDate", order.orderDate);

    setVal("eoCustNameInput", order.customerName || "");
    setVal("eoCustMobileInput", order.customerMobile || "");
    setVal("eoProductSelect", order.productKey || "flex_normal");
    setVal("eoWidthInput", order.width !== undefined ? order.width : 10);
    setVal("eoHeightInput", order.height !== undefined ? order.height : 4);
    setVal("eoUnitSelect", order.unit || "feet");
    setVal("eoQuantityInput", order.quantity || 1);
    setVal("eoUnitPriceInput", order.unitPrice !== undefined ? order.unitPrice : 95);
    setVal("eoDesignStatusSelect", order.designStatus || "Customer Provides Design");
    setVal("eoDeliverySelect", order.deliveryMethod || "Pickup");
    setVal("eoDeadlineInput", order.requiredDate || "");
    setVal("eoStatusSelect", order.orderStatus || "Pending");
    const defaultEmp = (this.ctx.employees && this.ctx.employees[0]) || "Admin User";
    setVal("eoEmployeeSelect", order.assignedEmployee || defaultEmp);
    setVal("eoNotesInput", order.notes || "");

    this.bindEditModalLiveCalc();
    if (this.ctx.pricingCalculator) {
      this.ctx.pricingCalculator.calculateEditModal(this.currentContextOrder);
    }

    this.openModal("editOrderModal");
  }

  bindEditModalLiveCalc() {
    if (this._liveCalcBound) return;
    this._liveCalcBound = true;

    const calcFieldIds = [
      "eoProductSelect", "eoWidthInput", "eoHeightInput", "eoUnitSelect",
      "eoQuantityInput", "eoUnitPriceInput", "eoDesignStatusSelect", "eoDeliverySelect"
    ];

    calcFieldIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const recalc = () => {
          if (this.ctx.pricingCalculator) {
            this.ctx.pricingCalculator.calculateEditModal(this.currentContextOrder);
          }
        };
        el.addEventListener("input", recalc);
        el.addEventListener("change", () => {
          if (id === "eoProductSelect" && this.ctx.products) {
            const prod = this.ctx.products[el.value];
            if (prod) {
              const priceInput = document.getElementById("eoUnitPriceInput");
              if (priceInput) priceInput.value = prod.unitPrice;
              const unitSelect = document.getElementById("eoUnitSelect");
              if (unitSelect && prod.defaultUnit) unitSelect.value = prod.defaultUnit;
            }
          }
          recalc();
        });
      }
    });
  }

  saveOrderEdit() {
    if (!this.currentContextOrder) return;
    const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];

    const custName = document.getElementById("eoCustNameInput")?.value?.trim();
    const custMobile = document.getElementById("eoCustMobileInput")?.value?.trim();
    const productKey = document.getElementById("eoProductSelect")?.value;
    const width = parseFloat(document.getElementById("eoWidthInput")?.value) || 0;
    const height = parseFloat(document.getElementById("eoHeightInput")?.value) || 0;
    const unit = document.getElementById("eoUnitSelect")?.value || "feet";
    const quantity = parseInt(document.getElementById("eoQuantityInput")?.value, 10) || 1;
    const unitPrice = parseFloat(document.getElementById("eoUnitPriceInput")?.value) || 0;
    const designStatus = document.getElementById("eoDesignStatusSelect")?.value;
    const deliveryMethod = document.getElementById("eoDeliverySelect")?.value;
    const requiredDate = document.getElementById("eoDeadlineInput")?.value;
    const orderStatus = document.getElementById("eoStatusSelect")?.value;
    const assignedEmployee = document.getElementById("eoEmployeeSelect")?.value;
    const notes = document.getElementById("eoNotesInput")?.value?.trim() || "";

    if (!custName) {
      this.showToast("Please enter customer name", "error");
      return;
    }
    if (!custMobile) {
      this.showToast("Please enter customer mobile number", "error");
      return;
    }
    if (!requiredDate) {
      this.showToast("Please provide a valid deadline date", "error");
      return;
    }

    const calc = this.ctx.pricingCalculator ? this.ctx.pricingCalculator.calculateEditModal(this.currentContextOrder) : null;
    const prodInfo = (this.ctx.products && this.ctx.products[productKey]) || { name: "Custom Print" };

    this.currentContextOrder.customerName = custName;
    this.currentContextOrder.customerMobile = custMobile;
    this.currentContextOrder.productKey = productKey;
    this.currentContextOrder.productName = prodInfo.name;
    this.currentContextOrder.width = width;
    this.currentContextOrder.height = height;
    this.currentContextOrder.unit = unit;
    this.currentContextOrder.quantity = quantity;
    this.currentContextOrder.unitPrice = unitPrice;
    this.currentContextOrder.areaSqFt = calc ? calc.areaSqFt : this.currentContextOrder.areaSqFt;
    this.currentContextOrder.designStatus = designStatus;
    this.currentContextOrder.deliveryMethod = deliveryMethod;
    this.currentContextOrder.requiredDate = requiredDate;
    this.currentContextOrder.orderStatus = orderStatus;
    this.currentContextOrder.assignedEmployee = assignedEmployee;
    this.currentContextOrder.notes = notes;
    this.currentContextOrder.totalAmount = calc ? calc.totalAmount : this.currentContextOrder.totalAmount;
    this.currentContextOrder.balanceAmount = calc ? calc.balanceAmount : this.currentContextOrder.balanceAmount;
    this.currentContextOrder.paymentStatus = calc ? calc.paymentStatus : this.currentContextOrder.paymentStatus;

    if (this.ctx.dataLoader) {
      this.ctx.dataLoader.saveOrders(orders);
      this.ctx.dataLoader.logAudit("EDIT_ORDER", this.currentContextOrder.id, `Updated details, Total: Rs. ${this.currentContextOrder.totalAmount}, Status: ${orderStatus}`);
    }

    this.closeModal("editOrderModal");
    this.showToast(`Order ${this.currentContextOrder.id} updated successfully!`, "success");

    if (this.ctx.onOrderUpdated) {
      this.ctx.onOrderUpdated(this.currentContextOrder, orders);
    }
  }
}

