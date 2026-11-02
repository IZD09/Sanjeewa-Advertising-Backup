/**
 * SanjeewaAdvertising - Invoice Payment Row Builder
 *
 * Implements Builder Pattern (GoF) extending Core BaseTableRowBuilder:
 * - InvoicePayment: Entity model providing table row HTML rendering.
 * - InvoicePaymentRowBuilder: Fluent builder class for invoice payment table rows.
 */

"use strict";

import { BaseTableRowBuilder } from "../core/BaseTableRowBuilder.js";

/**
 * InvoicePayment - Constructed Invoice Payment Entity Model
 */
export class InvoicePayment {
  constructor(data = {}) {
    // Normalization to support multiple shapes (user demo data vs payments data)
    this.id = data.id || data.paymentId || data.orderId || "";
    this.paymentId = data.paymentId || data.id || "";
    this.orderId = data.orderId || data.id || "";
    this.invoiceNo = data.invoiceNo || (this.id ? (String(this.id).startsWith("INV-") ? this.id : `INV-${String(this.id).replace("ORD-", "")}`) : "") || this.orderId;
    this.customerName = data.customerName || "Customer";
    this.customerMobile = data.customerMobile || "";
    this.productName = data.productName || "";
    this.date = data.date || data.orderDate || new Date().toISOString().split("T")[0];

    this.totalBill = Number(data.totalBill !== undefined ? data.totalBill : (data.totalAmount !== undefined ? data.totalAmount : 0));
    this.amount = Number(data.amount !== undefined ? data.amount : (data.paidAmount !== undefined ? data.paidAmount : 0));
    this.balance = Number(data.balance !== undefined ? data.balance : (data.balanceAmount !== undefined ? data.balanceAmount : Math.max(0, this.totalBill - this.amount)));

    // Normalize stage / paymentStatus
    if (data.stage) {
      this.stage = data.stage;
    } else if (data.paymentStatus === "Paid" || this.balance <= 0) {
      this.stage = "Complete Payment";
    } else if (data.paymentStatus === "Partial" || (this.amount > 0 && this.balance > 0)) {
      this.stage = "Advance Payment";
    } else {
      this.stage = "Pending Payment";
    }

    this.paymentStatus = data.paymentStatus || (this.stage === "Complete Payment" ? "Paid" : (this.stage === "Advance Payment" ? "Partial" : "Pending"));
    this.orderStatus = data.orderStatus || "Pending";
    this.method = data.method || "Cash";
    this.ref = data.ref || (this.method === "Cash" ? `CASH-REC-${String(this.orderId).replace("ORD-", "")}` : `TXN-${String(this.orderId).replace("ORD-", "")}`);
    this.note = data.note || (this.stage === "Complete Payment" ? "Full settlement paid upon delivery" : (this.stage === "Advance Payment" ? "Upfront advance payment" : "Pending settlement"));
    this.jobsCount = data.jobsCount || (data.jobs && data.jobs.length) || 1;
    this.jobIds = data.jobIds || [this.orderId];
  }

  renderStageBadge() {
    if (this.stage === "Complete Payment" || this.stage === "Paid") {
      return `<span class="status-pill complete"><i class="fa-solid fa-circle-check"></i> Complete Payment</span>`;
    } else if (this.stage === "Advance Payment" || this.stage === "Partial") {
      return `<span class="status-pill advance"><i class="fa-solid fa-hourglass-half"></i> Advance Payment</span>`;
    } else {
      return `<span class="status-pill pending"><i class="fa-solid fa-clock"></i> Pending Payment</span>`;
    }
  }

  renderMethodBadge() {
    if (this.method === "Card") {
      return `<span class="method-pill card"><i class="fa-solid fa-credit-card"></i> Card</span>`;
    } else if (this.method === "Cash") {
      return `<span class="method-pill cash"><i class="fa-solid fa-money-bill-wave"></i> Cash</span>`;
    } else if (this.method === "Check") {
      return `<span class="method-pill check"><i class="fa-solid fa-money-check"></i> Check</span>`;
    } else {
      return `<span class="method-pill transfer"><i class="fa-solid fa-building-columns"></i> Bank Transfer</span>`;
    }
  }

  formatCurrency(val) {
    return `Rs. ${(Number(val) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
  }

  /**
   * Render table row element (<tr>) for Invoice Payments Table
   * @returns {HTMLTableRowElement|string}
   */
  render() {
    const stagePill = this.renderStageBadge();
    const methodPill = this.renderMethodBadge();
    const jobsBadge = this.jobsCount > 1
      ? `<span class="inv-job-badge" style="font-size: 10px; padding: 1px 6px; margin-left: 5px;">${this.jobsCount} Jobs</span>`
      : "";
    const primaryJobId = (this.jobIds && this.jobIds.length > 0) ? this.jobIds[0] : (this.orderId || this.id);
    const totalFormatted = this.formatCurrency(this.totalBill);
    const paidFormatted = this.formatCurrency(this.amount);
    const balanceFormatted = this.formatCurrency(this.balance);
    const balanceColor = this.balance > 0 ? "#ef4444" : "var(--text-muted)";

    const html = `
      <td>
        <strong style="color: var(--blue);">${this.invoiceNo || this.orderId}</strong>
        ${jobsBadge}
        <div style="font-size: 11px; color: var(--text-muted);">${this.date}</div>
      </td>
      <td>
        <strong>${this.customerName}</strong>
        <div style="font-size: 11px; color: var(--text-muted); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${this.orderId}">
          Ref: ${this.orderId}${this.customerMobile ? ` | ${this.customerMobile}` : ""}
        </div>
      </td>
      <td>${stagePill}</td>
      <td>${methodPill}</td>
      <td style="font-weight: 700;">${totalFormatted}</td>
      <td style="font-weight: 800; color: #10b981;">${paidFormatted}</td>
      <td style="font-weight: 700; color: ${balanceColor};">${balanceFormatted}</td>
      <td>
        <span style="font-size: 11.5px; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;" title="${this.note || ""}">
          ${this.note || "-"}
        </span>
      </td>
      <td>
        <div class="pay-table-actions">
          <button type="button" class="pay-btn-sm" data-view-receipt="${this.paymentId || this.orderId}" data-type="invoice" title="View & Print Payment Voucher">
            <i class="fa-solid fa-receipt"></i> Voucher
          </button>
          ${this.balance > 0 ? `
          <button type="button" class="pay-btn-sm primary-sm" data-open-pay-modal data-pay-type="invoice" data-pay-ref="${primaryJobId}" title="Record settlement installment">
            <i class="fa-solid fa-plus"></i> Pay
          </button>` : ""}
        </div>
      </td>
    `;

    if (typeof document !== "undefined" && typeof document.createElement === "function") {
      const tr = document.createElement("tr");
      tr.id = `payInvoiceRow_${this.paymentId || this.orderId}`;
      tr.innerHTML = html;
      return tr;
    }

    return `<tr id="payInvoiceRow_${this.paymentId || this.orderId}">${html}</tr>`;
  }

  renderTableRow() {
    return this.render();
  }
}

/**
 * InvoicePaymentRowBuilder - Fluent Builder Class extending Core BaseTableRowBuilder
 */
export class InvoicePaymentRowBuilder extends BaseTableRowBuilder {
  constructor(initialData = null) {
    super(initialData);
  }

  build() {
    return new InvoicePayment(this._data);
  }

  static from(data) {
    if (data instanceof InvoicePaymentRowBuilder) {
      return data;
    }
    return new InvoicePaymentRowBuilder(data);
  }

  static fromArray(list) {
    if (!Array.isArray(list)) return [];
    return list.map(item => new InvoicePaymentRowBuilder(item).build());
  }
}

if (typeof window !== "undefined") {
  window.InvoicePayment = InvoicePayment;
  window.InvoicePaymentRowBuilder = InvoicePaymentRowBuilder;
}

export default InvoicePaymentRowBuilder;
