/**
 * SanjeewaAdvertising - Payment History Modal
 *
 * Handles installment payment history timeline & table modal (#paymentHistoryModal),
 * receipt viewing triggers, and payment reversal actions.
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class PaymentHistoryModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getOrders
   * @param {Function} context.getPayments
   * @param {Object} [context.dataLoader]
   * @param {Function} [context.onPaymentReversed]
   * @param {Function} [context.openReceiptModal]
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
  }

  openPaymentHistoryModal(orderId) {
    const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
    const payments = this.ctx.getPayments ? this.ctx.getPayments() : [];
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    this.currentContextOrder = order;

    const titleElem = document.getElementById("histModalTitle");
    if (titleElem) {
      titleElem.innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i> Payment History — ${order.id}`;
    }

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setTxt("phCustName", order.customerName);
    setTxt("phCustMobile", order.customerMobile);
    setTxt("phTotal", `Rs. ${Number(order.totalAmount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("phPaid", `Rs. ${Number(order.paidAmount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("phBalance", `Rs. ${Number(order.balanceAmount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("phStatus", order.paymentStatus);

    const tbody = document.getElementById("phTbody");
    if (tbody) {
      tbody.innerHTML = "";
      const orderPayments = (payments || []).filter(p => p.orderId === orderId);

      if (orderPayments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 18px;">No payments recorded for this order yet.</td></tr>`;
      } else {
        orderPayments.forEach(p => {
          const isReversed = p.status === "Reversed";
          const tr = document.createElement("tr");
          tr.style.opacity = isReversed ? "0.6" : "1";
          tr.innerHTML = `
            <td>#${p.installmentNo || 1}</td>
            <td><strong>${p.paymentId}</strong></td>
            <td>${p.date}</td>
            <td><strong>Rs. ${Number(p.amount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</strong></td>
            <td><span class="pay-method-pill ${String(p.method).toLowerCase()}">${p.method}</span> <span style="font-size: 11px; color: var(--text-muted);">${p.ref || ""}</span></td>
            <td><span class="pay-status-pill ${String(p.status).toLowerCase()}">${p.status}</span></td>
            <td>
              <button type="button" class="ant-btn-action" title="Print Receipt" onclick="window.placeOrderApp.openReceiptModal('${p.paymentId}')">
                <i class="fa-solid fa-print"></i>
              </button>
              ${!isReversed ? `
                <button type="button" class="ant-btn-action" style="color: #ff4d4f;" title="Reverse / Cancel Payment" onclick="window.placeOrderApp.reversePayment('${p.paymentId}')">
                  <i class="fa-solid fa-rotate-left"></i>
                </button>
              ` : ""}
            </td>
          `;
          tbody.appendChild(tr);
        });
      }
    }

    this.openModal("paymentHistoryModal");
  }

  reversePayment(paymentId) {
    const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
    const payments = this.ctx.getPayments ? this.ctx.getPayments() : [];
    const p = payments.find(item => item.paymentId === paymentId);
    if (!p) return;

    if (p.status === "Reversed") {
      this.showToast("This payment has already been reversed", "warning");
      return;
    }

    const confirmed = confirm(`Are you sure you want to reverse payment ${p.paymentId} of Rs. ${p.amount}?`);
    if (!confirmed) return;

    p.status = "Reversed";
    p.reversedAt = new Date().toISOString();

    if (this.ctx.dataLoader) {
      this.ctx.dataLoader.savePayments(payments);
    }

    // Recalculate order totals
    const order = orders.find(o => o.id === p.orderId);
    if (order) {
      const orderPayments = payments.filter(pay => pay.orderId === order.id && pay.status === "Successful");
      const totalPaid = orderPayments.reduce((acc, pay) => acc + (parseFloat(pay.amount) || 0), 0);
      order.paidAmount = Math.round(totalPaid * 100) / 100;
      order.balanceAmount = Math.max(0, Math.round((order.totalAmount - order.paidAmount) * 100) / 100);
      if (order.paidAmount >= order.totalAmount && order.totalAmount > 0) {
        order.paymentStatus = "Paid";
      } else if (order.paidAmount > 0 && order.balanceAmount > 0) {
        order.paymentStatus = "Partially Paid";
      } else {
        order.paymentStatus = "Unpaid";
      }

      if (this.ctx.dataLoader) {
        this.ctx.dataLoader.saveOrders(orders);
        this.ctx.dataLoader.logAudit("REVERSE_PAYMENT", order.id, `Reversed payment ${p.paymentId} of Rs. ${p.amount}`);
      }
    }

    this.showToast(`Payment ${paymentId} reversed successfully.`, "info");

    if (this.currentContextOrder && this.currentContextOrder.id === p.orderId) {
      this.openPaymentHistoryModal(p.orderId);
    }

    if (this.ctx.onPaymentReversed) {
      this.ctx.onPaymentReversed(p, order, orders, payments);
    }
  }
}

