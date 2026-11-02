/**
 * SanjeewaAdvertising - GRN Payment Row Builder Class
 * Fluent Builder and Entity Model for building and rendering
 * Supplier Stock / GRN Payment table rows in the Payments UI hub.
 */

"use strict";

import { BaseTableRowBuilder } from "../core/BaseTableRowBuilder.js";

/**
 * GrnPayment - Entity model representing a single supplier GRN stock payment row
 */
export class GrnPayment {
  constructor(data = {}) {
    const rawGrnId = data.grn_id ?? data.grnId ?? data.id ?? "";
    this.grnId = rawGrnId;
    this.grnNumber = data.grn_number ?? data.grnNumber ?? rawGrnId ?? "";
    this.poNumber = data.po_number ?? data.poNumber ?? data.purchase_order_no ?? (rawGrnId ? `PO-${rawGrnId.replace("GRN-", "")}` : "-");
    this.supplierId = data.supplier_id ?? data.supplierId ?? "";
    this.supplierName = data.supplier_name ?? data.supplierName ?? (data.supplier ? (data.supplier.company_name || data.supplier.name) : "Inventory Supplier");
    this.stockCategory = data.stock_category ?? data.stockCategory ?? data.category ?? "Printing Stock";
    this.date = data.date ?? data.payment_date ?? data.received_date ?? data.created_at ?? new Date().toISOString().split("T")[0];
    this.paymentId = data.payment_id ?? data.paymentId ?? (rawGrnId ? `PAY-${rawGrnId}` : `PAY-GRN-${Date.now().toString().slice(-6)}`);
    this.totalBill = Number(data.total_bill ?? data.totalBill ?? data.total_amount ?? data.totalAmount ?? data.total ?? 0);
    this.amount = Number(data.amount ?? data.paid_amount ?? data.paidAmount ?? 0);
    this.balance = Number(data.balance ?? data.balance_due ?? data.balanceDue ?? data.balanceAmount ?? Math.max(0, this.totalBill - this.amount));
    this.stage = data.stage ?? data.payment_stage ?? data.payment_status ?? (this.balance <= 0 ? "Complete Payment" : (this.amount > 0 ? "Advance Payment" : "Pending Payment"));
    this.method = data.method ?? data.payment_method ?? "Check";
    this.ref = data.ref ?? data.reference ?? data.reference_number ?? "";
    this.note = data.note ?? data.notes ?? data.narration ?? "-";
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
    let icon = "fa-money-check";
    let badgeClass = "badge-check";
    if (method === "Card") {
      icon = "fa-credit-card";
      badgeClass = "badge-card";
    } else if (method === "Cash") {
      icon = "fa-money-bill-wave";
      badgeClass = "badge-cash";
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
    const totalFormatted = this.formatCurrency(this.totalBill);
    const paidFormatted = this.formatCurrency(this.amount);
    const balanceFormatted = this.formatCurrency(this.balance);
    const balanceColor = this.balance > 0 ? "#ef4444" : "var(--text-muted)";

    const html = `
      <td>
        <strong style="color: #10b981;">${this.grnNumber}</strong>
        <div style="font-size: 11px; color: var(--text-muted);">PO: ${this.poNumber || "-"}</div>
        <div style="font-size: 11px; color: var(--text-muted);">${this.date}</div>
      </td>
      <td>
        <strong>${this.supplierName}</strong>
        <div style="font-size: 11px; color: var(--text-muted);">${this.stockCategory}</div>
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
          <button type="button" class="pay-btn-sm" data-view-receipt="${this.paymentId || this.grnNumber}" data-type="grn" title="View & Print Payment Voucher">
            <i class="fa-solid fa-receipt"></i> Voucher
          </button>
          ${this.balance > 0 ? `
          <button type="button" class="pay-btn-sm green-sm" data-open-pay-modal data-pay-type="grn" data-pay-ref="${this.grnId || this.grnNumber}" title="Pay supplier installment">
            <i class="fa-solid fa-money-bill-wave"></i> Pay
          </button>` : ""}
        </div>
      </td>
    `;

    if (typeof document !== "undefined" && typeof document.createElement === "function") {
      const tr = document.createElement("tr");
      tr.id = `payGrnRow_${this.paymentId || this.grnNumber}`;
      tr.innerHTML = html;
      return tr;
    }

    return `<tr id="payGrnRow_${this.paymentId || this.grnNumber}">${html}</tr>`;
  }

  renderTableRow() {
    return this.render();
  }
}

/**
 * GrnPaymentRowBuilder - Fluent Builder Class extending Core BaseTableRowBuilder
 */
export class GrnPaymentRowBuilder extends BaseTableRowBuilder {
  constructor(initialData = null) {
    super(initialData);
  }

  setGrnId(id) { return this.set("grnId", id); }
  setGrnNumber(num) { return this.set("grnNumber", num); }
  setPoNumber(po) { return this.set("poNumber", po); }
  setSupplierId(id) { return this.set("supplierId", id); }
  setSupplierName(name) { return this.set("supplierName", name); }
  setStockCategory(cat) { return this.set("stockCategory", cat); }
  setDate(d) { return this.set("date", d); }
  setPaymentId(pid) { return this.set("paymentId", pid); }
  setTotalBill(total) { return this.set("totalBill", total); }
  setAmount(amt) { return this.set("amount", amt); }
  setBalance(bal) { return this.set("balance", bal); }
  setStage(stage) { return this.set("stage", stage); }
  setMethod(method) { return this.set("method", method); }
  setRef(ref) { return this.set("ref", ref); }
  setNote(note) { return this.set("note", note); }

  build() {
    return new GrnPayment(this._data);
  }

  static fromArray(list) {
    if (!Array.isArray(list)) return [];
    return list.map(item => new GrnPaymentRowBuilder(item).build());
  }

  static from(data = {}) {
    return new GrnPaymentRowBuilder(data);
  }
}

if (typeof window !== "undefined") {
  window.GrnPayment = GrnPayment;
  window.GrnPaymentRowBuilder = GrnPaymentRowBuilder;
}

export default GrnPaymentRowBuilder;

