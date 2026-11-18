/**
 * SanjeewaAdvertising - Invoice Payment Row Builder
 *
 * Implements Builder Pattern (GoF) extending the Core BaseTableRowBuilder:
 * - InvoicePaymentEntity: Entity model encapsulating customer invoice payment data and rendering <tr> HTML elements.
 * - InvoicePaymentRowBuilder: Fluent builder class with setters, defaults, and .build() finalization.
 */

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";
import { StatusHelper } from "../../core/StatusHelper.js";

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
    } else if (data.payment_status === "Paid" || (this.balance <= 0.01 && (this.paid_amount > 0 || this.total_bill > 0))) {
      this.stage = "Complete Payment";
    } else if (data.payment_status === "Partial" || (this.paid_amount > 0 && this.balance > 0.01)) {
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

    // Multi-installment tracking
    this.installment_number = Number(data.installment_number || data.installmentNumber || 1);
    this.total_installments = Number(data.total_installments || data.totalInstallments || 1);
    this.is_multi_installment = Boolean(data.is_multi_installment || data.isMultiInstallment || (this.total_installments > 1));
    this.cumulative_paid = Number(data.cumulative_paid_amount ?? data.cumulativePaidAmount ?? this.paid_amount);

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
    this.cumulativePaidAmount = this.cumulative_paid;
    this.balanceAmount = this.balance;
    this.installmentNumber = this.installment_number;
    this.totalInstallments = this.total_installments;
    this.isMultiInstallment = this.is_multi_installment;
    this.paymentStatus = this.payment_status;
    this.orderStatus = this.order_status;
    this.jobsCount = this.jobs_count;
    this.jobIds = this.job_ids;
  }

  formatCurrency(val) {
    return `Rs. ${(Number(val) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
  }

  renderStageBadge() {
    if (this.stage === "Complete Payment" || this.stage === "Paid" || this.balance <= 0.01) {
      const label = this.is_multi_installment
        ? `Complete (${this.installment_number}/${this.total_installments})`
        : "Complete Payment";
      return `<span class="status-pill complete"><i class="fa-solid fa-circle-check"></i> ${label}</span>`;
    } else if (this.stage === "Advance Payment" || this.stage === "Partial" || this.cumulative_paid > 0) {
      const label = this.is_multi_installment
        ? `Part Paid (${this.installment_number}/${this.total_installments})`
        : "Advance Payment";
      return `<span class="status-pill advance"><i class="fa-solid fa-hourglass-half"></i> ${label}</span>`;
    } else {
      return `<span class="status-pill pending"><i class="fa-solid fa-clock"></i> Pending Payment</span>`;
    }
  }

  renderMethodBadge() {
    return StatusHelper.renderPaymentMethodBadge(this.method);
  }

  getStageRowClass() {
    const fromHelper = StatusHelper.getPaymentStageRowClass(this.stage);
    if (fromHelper) return fromHelper;

    const s = String(this.stage || "").toLowerCase().trim();
    if (s.includes("complete") || s === "paid" || this.balance <= 0.01) {
      return "row-stage-complete row-status-completed";
    }
    if (s.includes("advance") || s.includes("partial") || this.cumulative_paid > 0) {
      return "row-stage-advance row-status-approved";
    }
    return "row-stage-pending row-status-pending";
  }

  render() {
    const tr = document.createElement("tr");
    tr.id = `payInvoiceRow_${this.payment_id || this.order_id}`;

    const stageRowClass = this.getStageRowClass();
    if (stageRowClass) {
      tr.className = stageRowClass;
    }

    const stagePill = this.renderStageBadge();
    const methodPill = this.renderMethodBadge();
    const jobsBadge = (this.jobs_count > 1 || (this.job_ids && this.job_ids.length > 1))
      ? `<span class="inv-job-badge" style="font-size: 10px; padding: 1px 6px;"><i class="fa-solid fa-layer-group" style="margin-right: 3px;"></i>${this.jobs_count || this.job_ids.length} Jobs</span>`
      : "";

    const installmentBadge = this.is_multi_installment
      ? `<span class="installment-badge" title="Installment ${this.installment_number} of ${this.total_installments}">
           <i class="fa-solid fa-clock-rotate-left"></i> Part ${this.installment_number}/${this.total_installments}
         </span>`
      : "";

    const primaryJobId = (this.job_ids && this.job_ids.length > 0) ? this.job_ids[0] : (this.order_id || this.id);
    const displayJobRef = (this.job_ids && this.job_ids.length > 1) ? this.job_ids.join(", ") : (this.order_id || "");
    const totalFormatted = this.formatCurrency(this.total_bill);
    const paidFormatted = this.formatCurrency(this.paid_amount);
    const balanceFormatted = this.formatCurrency(this.balance);
    const balanceColor = this.balance > 0.01 ? "#ef4444" : "#16a34a";

    tr.innerHTML = `
      <td>
        <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">
          <strong style="color: var(--blue); font-size: 13px;">${this.invoice_no || this.order_id}</strong>
          ${jobsBadge}
          ${installmentBadge}
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
          <i class="fa-regular fa-calendar" style="margin-right: 3px;"></i>${this.date}
        </div>
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
      <td style="font-weight: 800; color: #10b981;">
        ${paidFormatted}
        ${this.is_multi_installment ? `
        <div style="font-size: 10px; color: var(--text-muted); font-weight: 500; margin-top: 2px;">
          Installment ${this.installment_number} of ${this.total_installments}
          <span style="display: block; color: #10b981;">Total Paid: ${this.formatCurrency(this.cumulative_paid)}</span>
        </div>` : ""}
      </td>
      <td style="font-weight: 700; color: ${balanceColor};">
        ${balanceFormatted}
        ${this.balance <= 0.01 ? `<div style="font-size: 10px; color: #10b981; font-weight: 600; margin-top: 2px;"><i class="fa-solid fa-check-double" style="margin-right: 3px;"></i>Fully Settled</div>` : ""}
      </td>
      <td>
        <div class="pay-table-actions">
          <button type="button" class="pay-btn-sm" data-view-receipt="${this.payment_id || this.order_id}" data-type="invoice" title="View & Print Payment Voucher">
            <i class="fa-solid fa-receipt"></i> Voucher
          </button>
          ${this.balance > 0.01 ? `
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

