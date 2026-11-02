/**
 * SanjeewaAdvertising - GRN Payment Row Builder
 *
 * Implements Builder Pattern (GoF) extending Core BaseTableRowBuilder:
 * - GrnPayment: Entity model providing table row HTML rendering.
 * - GrnPaymentRowBuilder: Fluent builder class for GRN supplier stock payment table rows.
 */

"use strict";

import { BaseTableRowBuilder } from "../core/BaseTableRowBuilder.js";

/**
 * GrnPayment - Constructed GRN Payment Entity Model
 */
export class GrnPayment {
  constructor(data = {}) {
    // Normalization to support snake_case and camelCase
    this.grnId = data.grn_id || data.grnId || data.id || "";
    this.grnNumber = data.grn_number || data.grnNumber || this.grnId || "GRN-2610-001";
    this.poNumber = data.po_number || data.poNumber || data.purchase_order_no || "-";
    this.supplierId = data.supplier_id || data.supplierId || "";
    this.supplierName = data.supplier_name || data.supplierName || "Supplier";
    this.stockCategory = data.stock_category || data.stockCategory || "Stock Delivery";
    this.date = data.date || data.grnDate || data.received_date || new Date().toISOString().split("T")[0];

    this.totalBill = Number(data.net_total !== undefined ? data.net_total : (data.totalBill !== undefined ? data.totalBill : (data.totalAmount !== undefined ? data.totalAmount : 0)));
    this.amount = Number(data.amount !== undefined ? data.amount : (data.paidAmount !== undefined ? data.paidAmount : (data.net_total !== undefined ? data.net_total : 0)));
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
    this.method = data.method || "Check";
    this.ref = data.ref || (this.method === "Check" ? `CHQ-${this.grnNumber}` : `TXN-${this.grnNumber}`);
    this.note = data.note || (this.stage === "Complete Payment" ? "Full payment voucher issued" : "Credit terms payment due");
    this.paymentId = data.paymentId || (this.grnId ? (String(this.grnId).startsWith("PAY-") ? this.grnId : `PAY-${this.grnNumber}`) : `PAY-${this.grnNumber}`);
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
   * Render table row element (<tr>) for GRN Stock Payments Table
   * @returns {HTMLTableRowElement|string}
   */
  render() {
    const stagePill = this.renderStageBadge();
    const methodPill = this.renderMethodBadge();
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

  build() {
    return new GrnPayment(this._data);
  }

  static from(data) {
    if (data instanceof GrnPaymentRowBuilder) {
      return data;
    }
    return new GrnPaymentRowBuilder(data);
  }

  static fromArray(list) {
    if (!Array.isArray(list)) return [];
    return list.map(item => new GrnPaymentRowBuilder(item).build());
  }
}

if (typeof window !== "undefined") {
  window.GrnPayment = GrnPayment;
  window.GrnPaymentRowBuilder = GrnPaymentRowBuilder;
}

export default GrnPaymentRowBuilder;
