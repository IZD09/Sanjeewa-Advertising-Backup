/**
 * SanjeewaAdvertising - Invoice Payment Row Builder
 *
 * Implements Builder Pattern (GoF) extending the Core BaseTableRowBuilder:
 * - InvoicePaymentEntity: Entity model encapsulating customer invoice payment data and rendering <tr> HTML elements.
 * - InvoicePaymentRowBuilder: Fluent builder class with setters, defaults, and .build() finalization.
 */

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";

/**
 * InvoicePaymentEntity - Entity model for an Invoice / Print Job Payment record
 */
export class InvoicePaymentEntity {
  constructor(data = {}) {
    this.id = data.id || data.paymentId || data.orderId || "";
    this.payment_id = data.payment_id || data.paymentId || this.id || "";
    this.order_id = data.order_id || data.orderId || this.id || "";
    this.invoice_no = data.invoice_no || data.invoiceNo || (this.id ? (String(this.id).startsWith("INV-") ? this.id : `INV-${String(this.id).replace("ORD-", "")}`) : "") || this.order_id;
    this.customer_name = data.customer_name || data.customerName || (data.customer && data.customer.name) || "Customer";
    this.customer_mobile = data.customer_mobile || data.customerMobile || (data.customer && data.customer.mobile) || "";
    this.product_name = data.product_name || data.productName || "Printing Job";
    this.date = data.date || data.orderDate || (data.invoice_at ? data.invoice_at.split("T")[0] : new Date().toISOString().split("T")[0]);

    this.total_bill = Number(data.total_amount !== undefined ? data.total_amount : (data.totalBill !== undefined ? data.totalBill : (data.totalAmount !== undefined ? data.totalAmount : 0)));
    this.paid_amount = Number(data.paid_amount !== undefined ? data.paid_amount : (data.amount !== undefined ? data.amount : (data.paidAmount !== undefined ? data.paidAmount : 0)));
    this.balance = Number(data.balance_amount !== undefined ? data.balance_amount : (data.balance !== undefined ? data.balance : (data.balanceAmount !== undefined ? data.balanceAmount : Math.max(0, this.total_bill - this.paid_amount))));

    // Normalize stage / payment_status
    if (data.stage) {
      this.stage = data.stage;
    } else if (data.payment_status === "Paid" || this.balance <= 0) {
      this.stage = "Complete Payment";
    } else if (data.payment_status === "Partial" || (this.paid_amount > 0 && this.balance > 0)) {
      this.stage = "Advance Payment";
    } else {
      this.stage = "Pending Payment";
    }

    this.payment_status = data.payment_status || (this.stage === "Complete Payment" ? "Paid" : (this.stage === "Advance Payment" ? "Partial" : "Pending"));
    this.order_status = data.order_status || data.status || "Completed";
    this.method = data.method || data.payment_method || "Cash";
    this.ref = data.ref || data.reference_no || (this.method === "Cash" ? `CASH-REC-${String(this.order_id).replace("ORD-", "")}` : `TXN-${String(this.order_id).replace("ORD-", "")}`);
    this.note = data.note || data.narration || (this.stage === "Complete Payment" ? "Full settlement paid upon delivery" : (this.stage === "Advance Payment" ? "Upfront advance payment" : "Pending settlement"));
    this.jobs_count = data.jobs_count || data.jobsCount || (data.jobs && data.jobs.length) || 1;
    this.job_ids = data.job_ids || data.jobIds || [this.order_id];

    // Field aliases for compatibility
    this.orderId = this.order_id;
    this.paymentId = this.payment_id;
    this.invoiceNo = this.invoice_no;
    this.customerName = this.customer_name;
    this.customerMobile = this.customer_mobile;
    this.productName = this.product_name;
    this.totalBill = this.total_bill;
    this.amount = this.paid_amount;
    this.paidAmount = this.paid_amount;
    this.balanceAmount = this.balance;
    this.paymentStatus = this.payment_status;
    this.orderStatus = this.order_status;
    this.jobsCount = this.jobs_count;
    this.jobIds = this.job_ids;
  }

  formatCurrency(val) {
    return `Rs. ${(Number(val) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
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
    const m = this.method || "Cash";
    if (m === "Card") {
      return `<span class="method-pill card"><i class="fa-solid fa-credit-card"></i> Card</span>`;
    } else if (m === "Cash") {
      return `<span class="method-pill cash"><i class="fa-solid fa-money-bill-wave"></i> Cash</span>`;
    } else if (m === "Check") {
      return `<span class="method-pill check"><i class="fa-solid fa-money-check"></i> Check</span>`;
    } else {
      return `<span class="method-pill transfer"><i class="fa-solid fa-building-columns"></i> Bank Transfer</span>`;
    }
  }

  render() {
    const tr = document.createElement("tr");
    tr.id = `payInvoiceRow_${this.payment_id || this.order_id}`;

    const stagePill = this.renderStageBadge();
    const methodPill = this.renderMethodBadge();
    const jobsBadge = (this.jobs_count > 1 || (this.job_ids && this.job_ids.length > 1))
      ? `<span class="inv-job-badge" style="font-size: 10px; padding: 1px 6px; margin-left: 5px;"><i class="fa-solid fa-layer-group" style="margin-right: 3px;"></i>${this.jobs_count || this.job_ids.length} Jobs</span>`
      : "";
    const primaryJobId = (this.job_ids && this.job_ids.length > 0) ? this.job_ids[0] : (this.order_id || this.id);
    const displayJobRef = (this.job_ids && this.job_ids.length > 1) ? this.job_ids.join(", ") : (this.order_id || "");
    const totalFormatted = this.formatCurrency(this.total_bill);
    const paidFormatted = this.formatCurrency(this.paid_amount);
    const balanceFormatted = this.formatCurrency(this.balance);
    const balanceColor = this.balance > 0 ? "#ef4444" : "var(--text-muted)";

    tr.innerHTML = `
      <td>
        <strong style="color: var(--blue);">${this.invoice_no || this.order_id}</strong>
        ${jobsBadge}
        <div style="font-size: 11px; color: var(--text-muted);">${this.date}</div>
      </td>
      <td>
        <strong>${this.customer_name}</strong>
        <div style="font-size: 11px; color: var(--text-muted); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${displayJobRef}">
          Ref: ${displayJobRef}${this.customer_mobile ? ` | ${this.customer_mobile}` : ""}
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
          <button type="button" class="pay-btn-sm" data-view-receipt="${this.payment_id || this.order_id}" data-type="invoice" title="View & Print Payment Voucher">
            <i class="fa-solid fa-receipt"></i> Voucher
          </button>
          ${this.balance > 0 ? `
          <button type="button" class="pay-btn-sm primary-sm" data-open-pay-modal data-pay-type="invoice" data-pay-ref="${primaryJobId}" title="Record settlement installment">
            <i class="fa-solid fa-plus"></i> Pay
          </button>` : ""}
        </div>
      </td>
    `;

    return tr;
  }
}

/**
 * InvoicePaymentRowBuilder - Fluent Builder Class extending BaseTableRowBuilder
 */
export class InvoicePaymentRowBuilder extends BaseTableRowBuilder {
  constructor(initialData = null) {
    super(initialData);
  }

  build() {
    return new InvoicePaymentEntity(this._data);
  }

  static from(data) {
    if (data instanceof InvoicePaymentRowBuilder) return data;
    return new InvoicePaymentRowBuilder(data);
  }

  static fromArray(list) {
    if (!Array.isArray(list)) return [];
    return list.map(item => new InvoicePaymentRowBuilder(item).build());
  }
}

export const InvoicePayment = InvoicePaymentEntity;
export default InvoicePaymentRowBuilder;

