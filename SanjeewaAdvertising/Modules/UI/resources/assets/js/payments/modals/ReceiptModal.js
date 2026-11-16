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

  escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  formatCurrency(val) {
    const num = Number(val) || 0;
    return `Rs. ${num.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  renderGrnPurchaseOrdersSection(rec) {
    const pos = Array.isArray(rec.pos) ? rec.pos : [];
    const grnItems = Array.isArray(rec.grn_items) ? rec.grn_items : [];

    if (pos.length > 0) {
      const poCards = pos.map((p) => {
        const items = Array.isArray(p.items) ? p.items : [];
        const poNum = this.escapeHtml(p.poNumber || p.id || "PO");
        const orderDate = p.orderDate ? this.escapeHtml(p.orderDate) : "—";
        const poStatus = this.escapeHtml(p.status || "Pending");
        const suppInv = p.supplierInvoice ? this.escapeHtml(p.supplierInvoice) : "";
        const poTotal = Number(p.total) || items.reduce((s, i) => s + (Number(i.line_total) || 0), 0);

        const itemsRows = items.length > 0
          ? items.map((item, idx) => `
              <tr>
                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; text-align: center;">${idx + 1}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9;">
                  <div style="font-weight: 600; color: #0f172a;">${this.escapeHtml(item.name || "Material Item")}</div>
                  ${item.code ? `<div style="font-size: 10px; color: #64748b;">Code: ${this.escapeHtml(item.code)}</div>` : ""}
                </td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; text-align: center; font-weight: 600;">
                  ${Number(item.qty_ordered) || 0}
                </td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; text-align: right;">
                  ${this.formatCurrency(item.unit_cost)}
                </td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #0f172a;">
                  ${this.formatCurrency(item.line_total ?? ((Number(item.qty_ordered) || 0) * (Number(item.unit_cost) || 0)))}
                </td>
              </tr>
            `).join("")
          : `
              <tr>
                <td colspan="5" style="padding: 8px; text-align: center; color: #64748b; font-size: 11px;">
                  ${this.escapeHtml(p.stockCategory || "Stock Delivery & Consignment")}
                </td>
              </tr>
            `;

        return `
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 10px; background: #ffffff;">
            <div style="background: linear-gradient(90deg, #ecfdf5 0%, #f8fafc 100%); padding: 8px 10px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="background: #059669; color: #ffffff; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 5px;">${poNum}</span>
                <span style="font-size: 11px; color: #475569;"><strong>Date:</strong> ${orderDate}</span>
                <span style="font-size: 10.5px; font-weight: 700; padding: 2px 7px; border-radius: 999px; background: #e0f2fe; color: #0369a1;">${poStatus}</span>
                ${suppInv ? `<span style="font-size: 11px; color: #475569;"><strong>Inv:</strong> ${suppInv}</span>` : ""}
              </div>
              <div style="font-size: 11.5px; font-weight: 800; color: #0f172a;">
                PO Total: ${this.formatCurrency(poTotal)}
              </div>
            </div>

            <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
              <thead>
                <tr style="background: #f8fafc; color: #64748b; text-transform: uppercase; font-size: 10px;">
                  <th style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; width: 32px;">#</th>
                  <th style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: left;">Material / Item</th>
                  <th style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; width: 55px;">Qty</th>
                  <th style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; width: 95px;">Unit Cost</th>
                  <th style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; width: 105px;">Line Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            ${p.notes ? `
              <div style="padding: 6px 10px; background: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 10.5px; color: #475569;">
                <strong>PO Note:</strong> ${this.escapeHtml(p.notes)}
              </div>` : ""}
          </div>
        `;
      }).join("");

      return `
        <div style="margin: 8px 0;">
          <div style="font-size: 11px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px;">
            Purchase Orders &amp; Itemized Details (${pos.length} ${pos.length === 1 ? "PO" : "POs"})
          </div>
          ${poCards}
        </div>`;
    }

    if (grnItems.length > 0) {
      return `
        <div style="margin: 8px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background: #ecfdf5; padding: 7px 10px; font-size: 11px; font-weight: 800; color: #059669; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">
            Received Stock Items (${grnItems.length})
          </div>
          <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8fafc; color: #64748b; font-size: 10px;">
                <th style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; width: 32px;">#</th>
                <th style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: left;">Material / Item</th>
                <th style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; width: 55px;">Qty</th>
                <th style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; width: 95px;">Unit Cost</th>
                <th style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; width: 105px;">Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${grnItems.map((item, idx) => `
                <tr>
                  <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; text-align: center; color: #64748b;">${idx + 1}</td>
                  <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-weight: 600;">${this.escapeHtml(item.name || "Stock Material")}</td>
                  <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; text-align: center;">${Number(item.qty_received || item.qty_ordered) || 0}</td>
                  <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; text-align: right;">${this.formatCurrency(item.unit_cost)}</td>
                  <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700;">${this.formatCurrency(item.line_total)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>`;
    }

    return "";
  }

  renderExpenseDetailsModal(exp) {
    const container = document.getElementById("receiptPrintContainer");
    if (!container) return;

    const isPaid = exp.status === "Paid";
    const isOverdue = !isPaid && exp.dueDate && (new Date(exp.dueDate) < new Date());
    const statusLabel = isPaid ? "Paid / Settled" : (isOverdue ? "Overdue" : "Pending");
    const statusColor = isPaid ? "#059669" : "#dc2626";
    const amount = Number(exp.amount) || 0;
    const paidAmount = isPaid ? (Number(exp.paidAmount ?? amount) || amount) : 0;
    const balanceDue = Math.max(0, amount - paidAmount);

    container.innerHTML = `
      <div class="receipt-printable-card">
        <div class="receipt-header">
          <h4>SANJEEWA ADVERTISING</h4>
          <p>Digital Large Format Printing &amp; Advertising Solutions</p>
          <p style="font-size: 10.5px; color: #64748b; margin-top: 2px;">No. 128 Main Street, Colombo | Tel: 011 234 5678 | Email: billing@sanjeewa.lk</p>
          <div style="margin-top: 8px; font-weight: 800; font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.5px; color: #d97706;">
            OPERATING EXPENSE / UTILITY BILL DETAILS
          </div>
        </div>

        <div class="receipt-meta-grid">
          <div><strong>Bill ID:</strong> ${this.escapeHtml(exp.id)}</div>
          <div><strong>Billing Month:</strong> ${this.escapeHtml(exp.month || "—")}</div>
          <div><strong>Bill Title:</strong> ${this.escapeHtml(exp.title || "Operating Bill")}</div>
          <div><strong>Category:</strong> ${this.escapeHtml(exp.category || "Other")}</div>
          <div><strong>Provider / Vendor:</strong> ${this.escapeHtml(exp.provider || "—")}</div>
          <div><strong>Account / Ref #:</strong> ${this.escapeHtml(exp.accountNo || exp.account_no || "—")}</div>
          <div><strong>Due Date:</strong> ${this.escapeHtml(exp.dueDate || exp.due_date || "—")}</div>
          <div><strong>Status:</strong> <span style="font-weight: 800; color: ${statusColor};">${statusLabel}</span></div>
          ${isPaid ? `
            <div><strong>Settled Date:</strong> ${this.escapeHtml(exp.paidDate || exp.paid_date || "—")}</div>
            <div><strong>Payment Method:</strong> ${this.escapeHtml(exp.paidMethod || exp.paid_method || "Direct Settlement")}</div>
            ${exp.paidRef || exp.paid_ref ? `<div style="grid-column: 1 / -1;"><strong>Settlement Ref #:</strong> ${this.escapeHtml(exp.paidRef || exp.paid_ref)}</div>` : ""}
          ` : ""}
        </div>

        <div class="receipt-totals">
          <div class="receipt-row">
            <span>Bill Amount:</span>
            <span>${this.formatCurrency(amount)}</span>
          </div>
          <div class="receipt-row grand-total">
            <span>Paid Amount:</span>
            <span style="color: #059669;">${this.formatCurrency(paidAmount)}</span>
          </div>
          <div class="receipt-row">
            <span>Remaining Balance Due:</span>
            <span style="color: ${balanceDue > 0 ? '#ef4444' : '#64748b'};">${this.formatCurrency(balanceDue)}</span>
          </div>
        </div>

        ${(exp.paidNote || exp.paid_note || exp.notes) ? `
          <div style="font-size: 11px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px;">
            <strong>Notes / Remarks:</strong> ${this.escapeHtml(exp.paidNote || exp.paid_note || exp.notes)}
          </div>` : ""}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px; text-align: center; font-size: 11px;">
          <div style="border-top: 1px solid #cbd5e1; padding-top: 4px;">
            Authorized Cashier / Officer
          </div>
          <div style="border-top: 1px solid #cbd5e1; padding-top: 4px;">
            Accounts Approval
          </div>
        </div>
      </div>`;

    this.openModal("printableReceiptModal");
  }

  openReceiptModal(paymentId, type = "invoice") {
    let rec = null;
    const paymentIdStr = (typeof paymentId === "object" && paymentId !== null)
      ? (paymentId.paymentId || paymentId.id)
      : paymentId;

    if (type === "expense") {
      const expenses = this.ctx.getExpenses ? this.ctx.getExpenses() : [];
      const exp = expenses.find(e => String(e.id) === String(paymentIdStr)) || (typeof paymentId === "object" ? paymentId : null);
      if (!exp) return;

      this.renderExpenseDetailsModal(exp);
      return;
    }

    if (type === "grn") {
      const grnPayments = this.ctx.getGrnPayments ? this.ctx.getGrnPayments() : [];
      rec = grnPayments.find(p =>
        String(p.paymentId) === String(paymentIdStr) ||
        String(p.id) === String(paymentIdStr) ||
        String(p.grn_number) === String(paymentIdStr)
      );
    } else {
      const orderPayments = this.ctx.getOrderPayments ? this.ctx.getOrderPayments() : [];
      rec = orderPayments.find(p => String(p.paymentId) === String(paymentIdStr) || String(p.id) === String(paymentIdStr));
    }

    if (!rec && typeof paymentId === "object" && paymentId !== null) {
      rec = paymentId;
    }

    if (!rec) return;

    const container = document.getElementById("receiptPrintContainer");
    if (!container) return;

    const isInvoice = (type === "invoice");
    const hasMultipleJobs = rec.jobs && Array.isArray(rec.jobs) && rec.jobs.length > 0;
    const hasMultiplePos = !isInvoice && rec.pos && Array.isArray(rec.pos) && rec.pos.length > 0;
    const supplierBank = !isInvoice ? (rec.supplierBankAccount || rec.supplier_bank_account || "") : "";

    container.innerHTML = `
      <div class="receipt-printable-card">
        <div class="receipt-header">
          <h4>SANJEEWA ADVERTISING</h4>
          <p>Digital Large Format Printing &amp; Advertising Solutions</p>
          <p style="font-size: 10.5px; color: #64748b; margin-top: 2px;">No. 128 Main Street, Colombo | Tel: 011 234 5678 | Email: billing@sanjeewa.lk</p>
          <div style="margin-top: 8px; font-weight: 800; font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.5px; color: ${isInvoice ? '#2563eb' : '#059669'};">
            ${isInvoice
              ? (hasMultipleJobs ? `INVOICE PAYMENT RECEIPT (${rec.jobs.length} PRINT JOBS)` : 'INVOICE PAYMENT RECEIPT (JOB SETTLEMENT)')
              : (hasMultiplePos ? `GRN SUPPLIER PAYMENT VOUCHER (${rec.pos.length} PURCHASE ORDERS)` : 'GRN SUPPLIER PAYMENT VOUCHER (STOCK PURCHASE)')}
          </div>
        </div>

        <div class="receipt-meta-grid">
          <div><strong>Voucher No:</strong> ${this.escapeHtml(rec.paymentId || rec.id)}</div>
          <div><strong>Date:</strong> ${this.escapeHtml(rec.date)}</div>
          <div><strong>${isInvoice ? 'Customer Name:' : 'Supplier Name:'}</strong> ${this.escapeHtml(isInvoice ? (rec.customerName || 'Customer') : (rec.supplierName || 'Supplier'))}</div>
          <div><strong>Reference:</strong> ${this.escapeHtml(isInvoice ? (rec.invoiceNo || rec.orderId) : (rec.grnNumber || rec.grnId))}</div>
          <div><strong>Payment Stage:</strong> <span style="font-weight: 700;">${this.escapeHtml(rec.stage)}</span></div>
          <div><strong>Payment Method:</strong> <span style="font-weight: 700;">${this.escapeHtml(rec.method)} (${this.escapeHtml(rec.ref || 'Direct')})</span></div>
          ${supplierBank ? `<div style="grid-column: 1 / -1;"><strong>Supplier Bank A/C:</strong> <span style="font-weight: 700; color: #059669;">${this.escapeHtml(supplierBank)}</span></div>` : ''}
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

        ${!isInvoice ? this.renderGrnPurchaseOrdersSection(rec) : ''}

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
