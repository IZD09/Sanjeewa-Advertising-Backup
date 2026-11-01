/**
 * SanjeewaAdvertising - Order Receipt Modal
 *
 * Handles printable payment receipt modal dialog (#receiptModal)
 * and triggering print vouchers for order installments.
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class ReceiptModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getOrders
   * @param {Function} context.getPayments
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
    const printBtn = document.getElementById("printReceiptBtn");
    if (printBtn) {
      printBtn.addEventListener("click", () => this.triggerPrintReceipt());
    }
  }

  openReceiptModal(paymentId) {
    const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
    const payments = this.ctx.getPayments ? this.ctx.getPayments() : [];
    const p = payments.find(item => item.paymentId === paymentId);
    if (!p) return;

    const order = orders.find(o => o.id === p.orderId);

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setTxt("rcptReceiptNo", p.paymentId);
    setTxt("rcptDate", p.date);
    setTxt("rcptOrderNo", p.orderId);
    setTxt("rcptCustomer", order ? `${order.customerName} (${order.customerMobile})` : "-");
    setTxt("rcptProduct", order ? `${order.productName} (${order.width} × ${order.height} ${order.unit})` : "-");
    setTxt("rcptTotalAmount", `Rs. ${Number(order ? order.totalAmount : 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("rcptPaidAmount", `Rs. ${Number(p.amount).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("rcptBalance", `Rs. ${Number(order ? order.balanceAmount : 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("rcptMethod", p.method || "Cash");
    setTxt("rcptReference", p.ref || "-");
    setTxt("rcptReceivedBy", p.receivedBy || "Admin User");

    this.openModal("receiptModal");
  }

  triggerPrintReceipt() {
    const printArea = document.getElementById("receiptPrintArea");
    if (!printArea) return;

    this.printDocument(
      printArea.innerHTML,
      "Payment Receipt - Sanjeewa Advertising",
      `
        .receipt-card { max-width: 520px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; }
        .receipt-brand-header { text-align: center; border-bottom: 2px dashed #bbb; padding-bottom: 15px; margin-bottom: 15px; }
        .receipt-brand-header h2 { margin: 0; font-size: 20px; }
        .receipt-table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px; }
        .receipt-table td { padding: 6px 4px; border-bottom: 1px solid #f0f0f0; }
        .receipt-total-row { font-size: 16px; font-weight: bold; }
      `
    );
  }
}

