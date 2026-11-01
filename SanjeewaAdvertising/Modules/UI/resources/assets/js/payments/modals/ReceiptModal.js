/**
 * SanjeewaAdvertising - Payment Receipt Modal
 *
 * Handles printable payment receipt modal dialog (#printableReceiptModal),
 * voucher formatting, and printing.
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class ReceiptModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getOrderPayments
   * @param {Function} context.getGrnPayments
   */
  constructor(context) {
    super({
      activeModalClass: "open",
      overlaySelector: ".pay-modal-backdrop",
      toastContainerId: "poToastContainer",
      closeSelectors: [".pay-modal-close", "[data-close-pay-modal]"],
      autoBind: true
    });

    this.ctx = context;

    this.bindEvents();
  }

  bindEvents() {
    document.addEventListener("click", (e) => {
      // View Receipt from table
      const receiptBtn = e.target.closest("[data-view-receipt]");
      if (receiptBtn) {
        e.preventDefault();
        const payId = receiptBtn.getAttribute("data-view-receipt");
        const type = receiptBtn.getAttribute("data-type") || "invoice";
        this.openReceiptModal(payId, type);
      }

      // Print Receipt Button inside modal
      const printBtn = e.target.closest("#btnPrintReceipt");
      if (printBtn) {
        e.preventDefault();
        window.print();
      }
    });
  }

  openReceiptModal(paymentId, type = "invoice") {
    let rec = null;
    if (type === "grn") {
      const grnPayments = this.ctx.getGrnPayments ? this.ctx.getGrnPayments() : [];
      rec = grnPayments.find(p => p.paymentId === paymentId);
    } else {
      const orderPayments = this.ctx.getOrderPayments ? this.ctx.getOrderPayments() : [];
      rec = orderPayments.find(p => p.paymentId === paymentId);
    }

    if (!rec) return;

    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setText("receiptPayId", rec.paymentId);
    setText("receiptDate", rec.date);
    setText("receiptPartyLabel", (type === "grn") ? "Supplier Name" : "Customer Name");
    setText("receiptPartyName", rec.supplierName || rec.customerName || "Walk-in");
    setText("receiptRefLabel", (type === "grn") ? "GRN Document Ref" : "Customer Order Ref");
    setText("receiptRefNo", rec.grnId || rec.orderId || "N/A");
    setText("receiptTotalBill", `Rs. ${(Number(rec.totalBill) || 0).toLocaleString()}`);
    setText("receiptPaidAmount", `Rs. ${(Number(rec.amount) || 0).toLocaleString()}`);
    setText("receiptRemainingBal", `Rs. ${(Number(rec.balance) || 0).toLocaleString()}`);
    setText("receiptMethod", rec.method || "Cash");
    setText("receiptMethodRef", rec.ref || "-");
    setText("receiptStatus", rec.status || "Complete");

    this.openModal("printableReceiptModal");
  }
}

