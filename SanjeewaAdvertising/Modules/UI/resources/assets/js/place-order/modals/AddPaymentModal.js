/**
 * SanjeewaAdvertising - Add Payment Installment Modal
 *
 * Handles recording payment installments for orders (#addPaymentModal),
 * remaining balance verification, and saving payment records.
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class AddPaymentModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getOrders
   * @param {Function} context.getPayments
   * @param {string} [context.currentUser]
   * @param {Object} [context.dataLoader]
   * @param {Function} [context.onPaymentSaved]
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

    this.bindEvents();
  }

  bindEvents() {
    const submitBtn = document.getElementById("submitAddPaymentBtn");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => this.saveNewPayment());
    }
  }

  openAddPaymentModal(orderId) {
    const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
    const payments = this.ctx.getPayments ? this.ctx.getPayments() : [];
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    this.currentContextOrder = order;

    if (order.balanceAmount <= 0) {
      this.showToast(`Order ${orderId} is already fully paid!`, "warning");
      return;
    }

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setTxt("pmOrderId", order.id);
    setTxt("pmCustomer", `${order.customerName} (${order.customerMobile})`);
    setTxt("pmTotal", `Rs. ${Number(order.totalAmount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("pmPaid", `Rs. ${Number(order.paidAmount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("pmBalance", `Rs. ${Number(order.balanceAmount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);

    const orderPayments = (payments || []).filter(p => p.orderId === orderId);
    setVal("pmInstallmentNo", orderPayments.length + 1);
    setVal("pmAmount", order.balanceAmount);
    setVal("pmDate", new Date().toISOString().split("T")[0]);
    setVal("pmMethod", "Cash");
    setVal("pmReference", "");
    setVal("pmNote", "");

    this.openModal("addPaymentModal");
  }

  saveNewPayment() {
    if (!this.currentContextOrder) return;

    const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
    const payments = this.ctx.getPayments ? this.ctx.getPayments() : [];

    const amount = parseFloat(document.getElementById("pmAmount")?.value);
    const date = document.getElementById("pmDate")?.value;
    const method = document.getElementById("pmMethod")?.value || "Cash";
    const ref = document.getElementById("pmReference")?.value?.trim() || "COUNTER-PAY";
    const note = document.getElementById("pmNote")?.value?.trim() || "";
    const instNo = parseInt(document.getElementById("pmInstallmentNo")?.value, 10) || 1;

    if (isNaN(amount) || amount <= 0) {
      this.showToast("Please enter a valid payment amount greater than zero", "error");
      return;
    }

    if (amount > this.currentContextOrder.balanceAmount + 0.01) {
      this.showToast(`Amount (Rs. ${amount.toFixed(2)}) cannot exceed remaining balance (Rs. ${this.currentContextOrder.balanceAmount.toFixed(2)})`, "error");
      return;
    }

    if (!date) {
      this.showToast("Please select payment date", "error");
      return;
    }

    const paymentId = `PAY-2026-${String(payments.length + 1).padStart(4, "0")}`;
    const newPayment = {
      paymentId,
      orderId: this.currentContextOrder.id,
      installmentNo: instNo,
      date,
      amount: Math.round(amount * 100) / 100,
      method,
      ref,
      receivedBy: this.ctx.currentUser || "Admin User",
      status: "Successful",
      note
    };

    payments.unshift(newPayment);
    if (this.ctx.dataLoader) {
      this.ctx.dataLoader.savePayments(payments);
    }

    // Recalculate order totals
    const orderPayments = payments.filter(p => p.orderId === this.currentContextOrder.id && p.status === "Successful");
    const totalPaid = orderPayments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
    this.currentContextOrder.paidAmount = Math.round(totalPaid * 100) / 100;
    this.currentContextOrder.balanceAmount = Math.max(0, Math.round((this.currentContextOrder.totalAmount - this.currentContextOrder.paidAmount) * 100) / 100);
    if (this.currentContextOrder.paidAmount >= this.currentContextOrder.totalAmount && this.currentContextOrder.totalAmount > 0) {
      this.currentContextOrder.paymentStatus = "Paid";
    } else if (this.currentContextOrder.paidAmount > 0 && this.currentContextOrder.balanceAmount > 0) {
      this.currentContextOrder.paymentStatus = "Partially Paid";
    } else {
      this.currentContextOrder.paymentStatus = "Unpaid";
    }

    if (this.ctx.dataLoader) {
      this.ctx.dataLoader.saveOrders(orders);
      this.ctx.dataLoader.logAudit("ADD_PAYMENT", this.currentContextOrder.id, `Recorded installment #${instNo} of Rs. ${amount} via ${method} (Ref: ${ref})`);
    }

    this.closeModal("addPaymentModal");
    this.showToast(`Payment ${paymentId} (Rs. ${amount.toFixed(2)}) recorded successfully!`, "success");

    if (this.ctx.onPaymentSaved) {
      this.ctx.onPaymentSaved(newPayment, this.currentContextOrder, orders, payments);
    }
  }
}

