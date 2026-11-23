/**
 * SanjeewaAdvertising - Order Creation Process (Frontend OOP Orchestrator)
 *
 * Orchestrates multi-order creation under a single customer inside #createOrderModal:
 * - Reads & validates order item inputs via OrderFormFieldsHandler & OrderItemValidator
 * - Computes live per-item area & pricing via PricingCalculator
 * - Adds/updates/removes queued orders in OrderQueueTableHandler
 * - Clicking a queued order row loads its data back into the form and switches
 *   the "Add Order" button to "Update Order"
 * - Clears order inputs after adding/updating while keeping the selected customer intact
 * - Updates the Payment & Billing summary from the combined total of all queued orders
 */

import { OrderItemModel } from "./OrderItemModel.js";
import { OrderItemValidator } from "./OrderItemValidator.js";
import { OrderFormFieldsHandler } from "./OrderFormFieldsHandler.js";
import { OrderQueueTableHandler } from "./OrderQueueTableHandler.js";

export class OrderCreationProcess {
  /**
   * @param {Object} [options={}]
   * @param {import('../PricingCalculator.js').PricingCalculator} [options.pricingCalculator]
   * @param {Function} [options.getSelectedCustomer]
   * @param {Function} [options.showToast]
   * @param {Function} [options.getDefaultDeadline]
   */
  constructor(options = {}) {
    this.pricingCalculator = options.pricingCalculator || null;
    this.getSelectedCustomer = options.getSelectedCustomer || (() => null);
    this.showToast = options.showToast || (() => {});
    this.getDefaultDeadline = options.getDefaultDeadline || (() => {
      return new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0];
    });

    this.validator = new OrderItemValidator();
    this.fieldsHandler = new OrderFormFieldsHandler({
      getDefaultDeadline: this.getDefaultDeadline,
    });
    this.queueTable = new OrderQueueTableHandler({
      onRowClick: (uid) => this.handleRowClickToEdit(uid),
      onRemoveClick: (uid) => this.handleRemoveItem(uid),
    });

    this.bindEvents();
    this.queueTable.render();
    this.recalculateAll();
  }

  /**
   * Bind DOM listeners for the multi-order creation workflow.
   */
  bindEvents() {
    const addBtn = document.getElementById("addOrderItemBtn");
    if (addBtn && !addBtn.dataset.boundOrderCreationAdd) {
      addBtn.dataset.boundOrderCreationAdd = "true";
      addBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleAddOrUpdateItem();
      });
    }

    const cancelEditBtn = document.getElementById("cancelEditOrderItemBtn");
    if (cancelEditBtn && !cancelEditBtn.dataset.boundOrderCreationCancelEdit) {
      cancelEditBtn.dataset.boundOrderCreationCancelEdit = "true";
      cancelEditBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.cancelEditMode();
      });
    }

    // Live per-item calculation fields
    const itemCalcFields = [
      "poWidth",
      "poHeight",
      "poUnit",
      "poQty",
      "poUnitPrice",
      "poDiscount",
      "poDesignStatus",
      "poPrintingType",
    ];

    itemCalcFields.forEach((id) => {
      const el = document.getElementById(id);
      if (el && !el.dataset.boundOrderItemCalc) {
        el.dataset.boundOrderItemCalc = "true";
        el.addEventListener("input", () => this.recalculateCurrentItem());
        el.addEventListener("change", () => this.recalculateCurrentItem());
      }
    });

    // Billing / payment fields
    const billingFields = ["poPaidAmount", "poPaymentMethod"];
    billingFields.forEach((id) => {
      const el = document.getElementById(id);
      if (el && !el.dataset.boundOrderBillingCalc) {
        el.dataset.boundOrderBillingCalc = "true";
        el.addEventListener("input", () => this.recalculateBillingSummary());
        el.addEventListener("change", () => this.recalculateBillingSummary());
      }
    });
  }

  /**
   * Calculate area & total for the currently entered order item in Section 2.
   *
   * @returns {Object}
   */
  recalculateCurrentItem() {
    const fields = this.fieldsHandler.readFields();
    const calc = this.pricingCalculator
      ? this.pricingCalculator.calculateItemPricing({
          width: fields.width,
          height: fields.height,
          unitVal: fields.unitId,
          unitSymbol: fields.unitSymbol,
          qty: fields.qty,
          unitPrice: fields.unitPrice,
          discount: fields.discount,
          designStatus: fields.designStatus,
        })
      : {
          areaSqFt: 0,
          designFee: 0,
          subtotal: 0,
          totalAmount: 0,
          qty: fields.qty || 1,
          isPieceUnit: false,
        };

    this.fieldsHandler.updateLiveItemPreview(calc);
    return calc;
  }

  /**
   * Recalculate Section 4 (Payment & Billing Details) from the sum of all queued orders.
   *
   * @returns {Object}
   */
  recalculateBillingSummary() {
    const grandTotal = this.queueTable.getGrandTotal();
    const paidInput = document.getElementById("poPaidAmount");
    const paidAmount = parseFloat(paidInput?.value) || 0;

    if (this.pricingCalculator && typeof this.pricingCalculator.calculateBillingSummary === "function") {
      return this.pricingCalculator.calculateBillingSummary(grandTotal, paidAmount);
    }

    const balanceAmount = Math.max(0, Math.round((grandTotal - paidAmount) * 100) / 100);
    return {
      totalAmount: grandTotal,
      paidAmount,
      balanceAmount,
      paymentStatus: "Unpaid",
      paymentStatusId: 1,
    };
  }

  /**
   * Recalculate both current item preview and overall billing summary.
   *
   * @returns {Object}
   */
  recalculateAll() {
    this.recalculateCurrentItem();
    return this.recalculateBillingSummary();
  }

  /**
   * Add a new order item to the table or update the currently selected row.
   */
  handleAddOrUpdateItem() {
    const fields = this.fieldsHandler.readFields();
    const validation = this.validator.validateItem(fields);

    if (!validation.isValid) {
      this.showToast(validation.error, "error");
      this.fieldsHandler.focusField(validation.targetId);
      return;
    }

    const calc = this.recalculateCurrentItem();
    const editingUid = this.queueTable.getEditingUid();

    const model = new OrderItemModel({
      uid: editingUid || undefined,
      printingTypeId: fields.printingTypeId,
      printingTypeName: fields.printingTypeName,
      userId: fields.userId,
      userName: fields.userName,
      designStatus: fields.designStatus,
      notes: fields.notes,
      width: fields.width,
      height: fields.height,
      unitId: fields.unitId,
      unitSymbol: fields.unitSymbol,
      unitName: fields.unitName,
      qty: fields.qty,
      unitPrice: fields.unitPrice,
      discount: fields.discount,
      deliveryMethodId: fields.deliveryMethodId,
      deliveryMethodName: fields.deliveryMethodName,
      requiredDate: fields.requiredDate,
      areaSqFt: calc.areaSqFt,
      designFee: calc.designFee,
      subtotal: calc.subtotal,
      totalAmount: calc.totalAmount,
    });

    if (editingUid) {
      const rowNum = this.queueTable.getRowNumber(editingUid);
      this.queueTable.updateItem(editingUid, model);
      this.queueTable.setEditingUid(null);
      this.fieldsHandler.setEditMode(false);
      this.showToast(`Order #${rowNum} updated in the list.`, "success");
    } else {
      this.queueTable.addItem(model);
      this.showToast(`Order "${model.printingTypeName}" added to the list.`, "success");
    }

    // Clear order fields so the user can immediately enter the next order
    this.fieldsHandler.clearFields();
    this.recalculateAll();
  }

  /**
   * Load a clicked table row's details into the form inputs and enter edit mode.
   *
   * @param {string} uid
   */
  handleRowClickToEdit(uid) {
    const item = this.queueTable.getItemByUid(uid);
    if (!item) return;

    const rowNumber = this.queueTable.getRowNumber(uid);
    this.queueTable.setEditingUid(uid);
    this.fieldsHandler.populateFields(item);
    this.fieldsHandler.setEditMode(true, rowNumber);
    this.recalculateCurrentItem();

    // Smoothly bring the order input section into view inside the modal
    const printTypeEl = document.getElementById("poPrintingType");
    if (printTypeEl) {
      printTypeEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  /**
   * Exit edit mode without modifying the queued order and clear order fields.
   */
  cancelEditMode() {
    this.queueTable.setEditingUid(null);
    this.fieldsHandler.setEditMode(false);
    this.fieldsHandler.clearFields();
    this.recalculateCurrentItem();
  }

  /**
   * Remove a queued order from the table.
   *
   * @param {string} uid
   */
  handleRemoveItem(uid) {
    const wasEditing = this.queueTable.getEditingUid() === uid;
    const removed = this.queueTable.removeItem(uid);
    if (!removed) return;

    if (wasEditing) {
      this.fieldsHandler.setEditMode(false);
      this.fieldsHandler.clearFields();
    } else if (this.queueTable.getEditingUid()) {
      // Refresh row number badge in case an earlier row was deleted
      const newRowNum = this.queueTable.getRowNumber(this.queueTable.getEditingUid());
      this.fieldsHandler.setEditMode(true, newRowNum);
    }

    this.recalculateAll();
    this.showToast(`Order "${removed.printingTypeName}" removed from the list.`, "info");
  }

  /**
   * Get all queued orders.
   *
   * @returns {Array<OrderItemModel>}
   */
  getQueuedItems() {
    return this.queueTable.getAllItems();
  }

  /**
   * Get combined grand total of queued orders.
   *
   * @returns {number}
   */
  getGrandTotal() {
    return this.queueTable.getGrandTotal();
  }

  /**
   * Validate overall form before opening confirmation modal.
   *
   * @param {Object|null} customer
   * @returns {{ isValid: boolean, error?: string, targetId?: string }}
   */
  validateForReview(customer) {
    const paidAmount = parseFloat(document.getElementById("poPaidAmount")?.value) || 0;
    const paymentMethodId = document.getElementById("poPaymentMethod")?.value || "";

    return this.validator.validateSubmission({
      customer,
      items: this.queueTable.getAllItems(),
      paidAmount,
      paymentMethodId,
    });
  }

  /**
   * Reset queued orders, edit mode, and order input fields.
   */
  resetAll() {
    this.queueTable.clear();
    this.fieldsHandler.setEditMode(false);
    this.fieldsHandler.clearFields();
    this.recalculateAll();
  }
}

export default OrderCreationProcess;
