/**
 * SanjeewaAdvertising - Invoice Payment Row Builder Class
 * Fluent Builder and Entity Model for building and rendering
 * Invoice Payment table rows in the Payments UI hub.
 */

"use strict";

import { BaseTableRowBuilder } from "../core/BaseTableRowBuilder.js";

/**
 * InvoicePayment - Entity model representing a single customer invoice payment row
 */
export class InvoicePayment {
  constructor(data = {}) {
    const rawId = data.id ?? data.orderId ?? data.order_id ?? "";
    this.id = rawId;
    this.orderId = data.orderId ?? data.order_id ?? rawId;
    this.invoiceNo = data.invoiceNo ?? data.invoice_no ?? data.invoiceNumber ?? this.orderId;
    this.paymentId = data.paymentId ?? data.payment_id ?? (rawId ? `PAY-${rawId.replace("ORD-", "INV-")}` : `PAY-INV-${Date.now().toString().slice(-6)}`);
    this.customerName = data.customerName ?? data.customer_name ?? (data.customer ? (data.customer.name || data.customer.customer_name) : "Walk-in Client");
    this.customerMobile = data.customerMobile ?? data.customer_mobile ?? (data.customer ? data.customer.mobile : "");
    this.productName = data.productName ?? data.product_name ?? data.item ?? "Digital Print Order";
    this.date = data.date ?? data.payment_date ?? data.created_at ?? new Date().toISOString().split("T")[0];
    this.totalBill = Number(data.totalBill ?? data.total_bill ?? data.total_amount ?? data.totalAmount ?? data.total ?? 0);
    this.amount = Number(data.amount ?? data.paidAmount ?? data.paid_amount ?? 0);
    this.balance = Number(data.balance ?? data.balanceAmount ?? data.balance_amount ?? Math.max(0, this.totalBill - this.amount));
    this.stage = data.stage ?? data.payment_stage ?? data.payment_status ?? (this.balance <= 0 ? "Complete Payment" : (this.amount > 0 ? "Advance Payment" : "Pending Payment"));
    this.method = data.method ?? data.payment_method ?? "Cash";
    this.ref = data.ref ?? data.reference ?? data.reference_number ?? "";
    this.note = data.note ?? data.notes ?? data.narration ?? "-";
    this.jobIds = Array.isArray(data.jobIds) ? data.jobIds : (data.job_ids || [this.orderId]);
    this.jobsCount = Number(data.jobsCount ?? (this.jobIds ? this.jobIds.length : 1));
  }

  formatCurrency(amt) {
    return `Rs. ${(parseFloat(amt) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  renderStageBadge(stage) {
    if (stage === "Complete Payment") {
      return '<span class="pay-stage-badge stage-complete"><i class="fa-solid fa-circle-check"></i> Complete</span>';
    } else if (stage === "Advance Payment") {
      return '<span class="pay-stage-badge stage-advance"><i class="fa-solid fa-hourglass-half"></i> Advance</span>';
    }
    return '<span class="pay-stage-badge stage-pending"><i class="fa-solid fa-clock"></i> Pending</span>';
  }

  renderMethodBadge(method, ref = "") {
    let icon = "fa-money-bill-wave";
    let badgeClass = "badge-cash";
    if (method === "Card") {
      icon = "fa-credit-card";
      badgeClass = "badge-card";
    } else if (method === "Check" || method === "Cheque") {
      icon = "fa-money-check";
      badgeClass = "badge-check";
    } else if (method === "Bank Transfer") {
      icon = "fa-building-columns";
      badgeClass = "badge-transfer";
    }
    const refText = ref ? ` <small>(${ref})</small>` : "";
    return `<span class="pay-method-badge ${badgeClass}"><i class="fa-solid ${icon}"></i> ${method}${refText}</span>`;
  }

  render() {
    const stagePill = this.renderStageBadge(this.stage);
    const methodPill = this.renderMethodBadge(this.method, this.ref);
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

  setId(id) { return this.set("id", id); }
  setPaymentId(pid) { return this.set("paymentId", pid); }
  setOrderId(oid) { return this.set("orderId", oid); }
  setInvoiceNo(inv) { return this.set("invoiceNo", inv); }
  setCustomerName(name) { return this.set("customerName", name); }
  setCustomerMobile(mobile) { return this.set("customerMobile", mobile); }
  setDate(d) { return this.set("date", d); }
  setTotalBill(total) { return this.set("totalBill", total); }
  setAmount(amt) { return this.set("amount", amt); }
  setBalance(bal) { return this.set("balance", bal); }
  setStage(stage) { return this.set("stage", stage); }
  setMethod(method) { return this.set("method", method); }
  setRef(ref) { return this.set("ref", ref); }
  setNote(note) { return this.set("note", note); }

  build() {
    return new InvoicePayment(this._data);
  }

  static fromArray(list) {
    if (!Array.isArray(list)) return [];
    return list.map(item => new InvoicePaymentRowBuilder(item).build());
  }

  static from(data = {}) {
    return new InvoicePaymentRowBuilder(data);
  }
}

if (typeof window !== "undefined") {
  window.InvoicePayment = InvoicePayment;
  window.InvoicePaymentRowBuilder = InvoicePaymentRowBuilder;
}

export default InvoicePaymentRowBuilder;

