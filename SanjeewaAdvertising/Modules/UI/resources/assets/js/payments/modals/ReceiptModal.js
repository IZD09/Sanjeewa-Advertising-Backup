/**
 * SanjeewaAdvertising - Payment Receipt Modal
 *
 * Handles printable payment receipt modal dialog (#printableReceiptModal),
 * voucher formatting, multi-job itemized breakdown, and printing.
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

    const container = document.getElementById("receiptPrintContainer");
    if (!container) return;

    const isInvoice = (type === "invoice");
    const hasMultipleJobs = rec.jobs && Array.isArray(rec.jobs) && rec.jobs.length > 0;

    container.innerHTML = `
      <div class="receipt-printable-card">
        <div class="receipt-header">
          <h4>SANJEEWA ADVERTISING</h4>
          <p>Digital Large Format Printing &amp; Advertising Solutions</p>
          <p style="font-size: 10.5px; color: #64748b; margin-top: 2px;">No. 128 Main Street, Colombo | Tel: 011 234 5678 | Email: billing@sanjeewa.lk</p>
          <div style="margin-top: 8px; font-weight: 800; font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.5px; color: ${isInvoice ? '#2563eb' : '#059669'};">
            ${isInvoice
              ? (hasMultipleJobs ? `INVOICE PAYMENT RECEIPT (${rec.jobs.length} PRINT JOBS)` : 'INVOICE PAYMENT RECEIPT (JOB SETTLEMENT)')
              : 'GRN SUPPLIER PAYMENT VOUCHER (STOCK PURCHASE)'}
          </div>
        </div>

        <div class="receipt-meta-grid">
          <div><strong>Voucher No:</strong> ${rec.paymentId}</div>
          <div><strong>Date:</strong> ${rec.date}</div>
          <div><strong>${isInvoice ? 'Customer Name:' : 'Supplier Name:'}</strong> ${isInvoice ? (rec.customerName || 'Customer') : (rec.supplierName || 'Supplier')}</div>
          <div><strong>Reference:</strong> ${isInvoice ? (rec.invoiceNo || rec.orderId) : (rec.grnNumber || rec.grnId)}</div>
          <div><strong>Payment Stage:</strong> <span style="font-weight: 700;">${rec.stage}</span></div>
          <div><strong>Payment Method:</strong> <span style="font-weight: 700;">${rec.method} (${rec.ref || 'Direct'})</span></div>
        </div>

        ${hasMultipleJobs ? `
        <div style="margin: 4px 0; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
          <div style="background: #f8fafc; padding: 6px 10px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">
            Itemized Print Jobs on this Invoice (${rec.jobs.length} Jobs):
          </div>
          <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
            <thead>
              <tr style="background: #f1f5f9; text-align: left; color: #64748b;">
                <th style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0;">Job # / Details</th>
                <th style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">Total Bill</th>
                <th style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">Paid Now</th>
                <th style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">Balance</th>
              </tr>
            </thead>
            <tbody>
              ${rec.jobs.map(j => `
                <tr>
                  <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9;">
                    <strong style="color: #2563eb;">${j.id}</strong> - ${j.productName || 'Print Job'}
                  </td>
                  <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; text-align: right;">
                    Rs. ${(Number(j.total) || 0).toLocaleString()}
                  </td>
                  <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #059669; font-weight: 700;">
                    Rs. ${(Number(j.allocatedNow) || 0).toLocaleString()}
                  </td>
                  <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; text-align: right; color: ${(Number(j.balanceRemaining) || 0) > 0 ? '#ef4444' : '#64748b'};">
                    Rs. ${(Number(j.balanceRemaining) || 0).toLocaleString()}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>` : ''}

        <div class="receipt-totals">
          <div class="receipt-row">
            <span>Total Bill Value:</span>
            <span>Rs. ${(Number(rec.totalBill) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="receipt-row grand-total">
            <span>Amount Paid This Transaction:</span>
            <span style="color: #059669;">Rs. ${(Number(rec.amount) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="receipt-row">
            <span>Remaining Balance Due:</span>
            <span style="color: ${(Number(rec.balance) || 0) > 0 ? '#ef4444' : '#64748b'};">
              Rs. ${(Number(rec.balance) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        ${rec.note ? `
        <div style="font-size: 11px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px;">
          <strong>Narration:</strong> ${rec.note}
        </div>` : ''}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px; text-align: center; font-size: 11px;">
          <div style="border-top: 1px solid #cbd5e1; padding-top: 4px;">
            Authorized Cashier / Officer
          </div>
          <div style="border-top: 1px solid #cbd5e1; padding-top: 4px;">
            ${isInvoice ? 'Customer Signature' : 'Supplier Acknowledgment'}
          </div>
        </div>
      </div>`;

    this.openModal("printableReceiptModal");
  }
}
