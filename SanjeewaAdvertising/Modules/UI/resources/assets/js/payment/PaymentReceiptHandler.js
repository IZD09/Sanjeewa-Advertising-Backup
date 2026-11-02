/**
 * SanjeewaAdvertising - Payment Receipt & Voucher Handler
 * Handles printable payment receipts, supplier payment vouchers,
 * print dialog invocation, modal toggles, and toast alerts.
 */

"use strict";

export class PaymentReceiptHandler {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.getOrderPayments]
   * @param {Function} [options.getGrnPayments]
   */
  constructor(options = {}) {
    this.getOrderPayments = options.getOrderPayments || (() => []);
    this.getGrnPayments = options.getGrnPayments || (() => []);

    this.bindEvents();
  }

  /**
   * Bind event listeners for receipt modal and printing.
   */
  bindEvents() {
    // Print Receipt Button inside modal
    const printBtn = document.getElementById("btnPrintReceipt");
    if (printBtn) {
      printBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.print();
      });
    }

    // Modal Close Buttons
    document.querySelectorAll(".pay-modal-close, [data-close-pay-modal]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.closeModals();
      });
    });
  }

  /**
   * Open Printable Receipt / Voucher Modal for an Invoice or GRN settlement.
   * @param {string} paymentId
   * @param {string} [type="invoice"]
   */
  openReceiptModal(paymentId, type = "invoice") {
    const modal = document.getElementById("printableReceiptModal");
    const container = document.getElementById("receiptPrintContainer");
    if (!modal || !container) return;

    let item = null;
    const isInvoice = type === "invoice";

    if (isInvoice) {
      const orderPayments = this.getOrderPayments();
      item = orderPayments.find((p) => p.paymentId === paymentId);
    } else {
      const grnPayments = this.getGrnPayments();
      item = grnPayments.find((p) => p.paymentId === paymentId);
    }

    if (!item) return;

    container.innerHTML = `
      <div class="receipt-printable-card">
        <div class="receipt-header">
          <h4>SANJEEWA ADVERTISING</h4>
          <p>Digital Large Format Printing & Advertising Solutions</p>
          <p style="font-size: 10px; color: #64748b;">No. 128 Main Street, Colombo | Tel: 011 234 5678 | Email: billing@sanjeewa.lk</p>
          <div style="margin-top: 8px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: ${isInvoice ? "#2563eb" : "#059669"};">
            ${isInvoice ? "INVOICE PAYMENT RECEIPT (JOB SETTLEMENT)" : "GRN SUPPLIER PAYMENT VOUCHER (STOCK PURCHASE)"}
          </div>
        </div>

        <div class="receipt-meta-grid">
          <div><strong>Voucher No:</strong> ${item.paymentId}</div>
          <div><strong>Date:</strong> ${item.date}</div>
          <div><strong>${isInvoice ? "Customer Name:" : "Supplier Name:"}</strong> ${isInvoice ? item.customerName : item.supplierName}</div>
          <div><strong>Reference:</strong> ${isInvoice ? item.invoiceNo || item.orderId : item.grnNumber}</div>
          <div><strong>Payment Stage:</strong> <span style="font-weight: 700;">${item.stage}</span></div>
          <div><strong>Payment Method:</strong> <span style="font-weight: 700;">${item.method} (${item.ref || "Direct"})</span></div>
        </div>

        <div class="receipt-totals">
          <div class="receipt-row">
            <span>Total Bill Value:</span>
            <span>Rs. ${(Number(item.totalBill) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="receipt-row grand-total">
            <span>Amount Paid This Transaction:</span>
            <span style="color: #059669;">Rs. ${(Number(item.amount) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="receipt-row">
            <span>Remaining Balance Due:</span>
            <span style="color: ${(Number(item.balance) || 0) > 0 ? "#ef4444" : "#64748b"};">
              Rs. ${(Number(item.balance) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        ${
          item.note
            ? `
        <div style="font-size: 11px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px;">
          <strong>Narration:</strong> ${item.note}
        </div>`
            : ""
        }

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px; text-align: center; font-size: 11px;">
          <div style="border-top: 1px solid #cbd5e1; padding-top: 4px;">
            Authorized Cashier / Officer
          </div>
          <div style="border-top: 1px solid #cbd5e1; padding-top: 4px;">
            ${isInvoice ? "Customer Signature" : "Supplier Acknowledgment"}
          </div>
        </div>
      </div>`;

    modal.classList.add("open");
  }

  /**
   * Close all payment modal dialogs.
   */
  closeModals() {
    document.querySelectorAll(".pay-modal-backdrop").forEach((m) => m.classList.remove("open"));
  }

  /**
   * Show stylish animated toast notification.
   * @param {string} message
   */
  showToast(message) {
    const toast = document.createElement("div");
    toast.className = "po-toast";
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: payToastIn 0.25s ease;
    `;
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 16px;"></i> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

