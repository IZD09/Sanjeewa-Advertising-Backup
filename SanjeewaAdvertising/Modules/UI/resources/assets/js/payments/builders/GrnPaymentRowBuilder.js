/**
 * SanjeewaAdvertising - GRN Payment Row Builder
 *
 * Implements Builder Pattern (GoF) extending the Core BaseTableRowBuilder:
 * - GrnPaymentEntity: Entity model encapsulating GRN payment data and rendering <tr> HTML elements.
 * - GrnPaymentRowBuilder: Fluent builder class with setters, defaults, and .build() finalization.
 */

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";

/**
 * GrnPaymentEntity - Entity model for a GRN Stock Payment record
 */
export class GrnPaymentEntity {
  constructor(data = {}) {
    this.id = data.id || data.grn_id || data.grnId || "";
    this.grn_id = data.grn_id || data.grnId || this.id || "";
    this.grn_number = data.grn_number || data.grnNumber || (this.grn_id ? (String(this.grn_id).startsWith("GRN-") ? this.grn_id : `GRN-2610-${String(this.grn_id).padStart(3, "0")}`) : "GRN-2610-001");
    this.po_number = data.po_number || data.poNumber || data.purchase_order_no || "-";
    this.po_numbers = data.po_numbers || data.poNumbers || (data.po_number && data.po_number !== "-" ? String(data.po_number).split(", ") : []);
    this.po_count = data.po_count || data.poCount || (data.purchase_orders && data.purchase_orders.length) || (data.pos && data.pos.length) || (this.po_numbers.length > 0 ? this.po_numbers.length : 1);
    this.supplier_invoice = data.supplier_invoice || data.supplierInvoice || data.supplyer_invoice || data.supplier_invoice_no || "";
    this.pos = data.pos || [];
    this.supplier_id = data.supplier_id || data.supplierId || "";
    this.supplier_name = data.supplier_name || data.supplierName || "Supplier";
    this.stock_category = data.stock_category || data.stockCategory || "Stock Delivery";
    this.date = data.date || data.grnDate || data.received_date || (data.pay_date ? data.pay_date.split("T")[0] : new Date().toISOString().split("T")[0]);

    this.total_bill = Number(data.net_total !== undefined ? data.net_total : (data.totalBill !== undefined ? data.totalBill : (data.total_amount !== undefined ? data.total_amount : (data.totalAmount !== undefined ? data.totalAmount : 0))));
    this.paid_amount = Number(data.amount !== undefined ? data.amount : (data.paid_amount !== undefined ? data.paid_amount : (data.paidAmount !== undefined ? data.paidAmount : (data.payment !== undefined ? data.payment : (data.net_total ? data.net_total : 0)))));
    this.balance = Number(data.balance !== undefined ? data.balance : (data.balance_amount !== undefined ? data.balance_amount : (data.balanceAmount !== undefined ? data.balanceAmount : Math.max(0, this.total_bill - this.paid_amount))));

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
    this.method = data.method || data.payment_method || "Check";
    this.ref = data.ref || data.reference_no || (this.method === "Check" ? `CHQ-${this.grn_number}` : `TXN-${this.grn_number}`);
    this.note = data.note || data.narration || (this.stage === "Complete Payment" ? "Full payment voucher issued" : "Credit terms payment due");
    this.payment_id = data.payment_id || data.paymentId || (this.grn_id ? (String(this.grn_id).startsWith("PAY-") ? this.grn_id : `PAY-${this.grn_number}`) : `PAY-${this.grn_number}`);

    // Field aliases for compatibility
    this.grnId = this.grn_id;
    this.grnNumber = this.grn_number;
    this.poNumber = this.po_number;
    this.poNumbers = this.po_numbers;
    this.poCount = this.po_count;
    this.supplierInvoice = this.supplier_invoice;
    this.supplierName = this.supplier_name;
    this.stockCategory = this.stock_category;
    this.totalBill = this.total_bill;
    this.amount = this.paid_amount;
    this.paidAmount = this.paid_amount;
    this.balanceAmount = this.balance;
    this.paymentStatus = this.payment_status;
    this.paymentId = this.payment_id;
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
    const m = this.method || "Check";
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
    tr.id = `payGrnRow_${this.payment_id || this.grn_number}`;

    const stagePill = this.renderStageBadge();
    const methodPill = this.renderMethodBadge();
    const poCountBadge = (this.po_count > 1 || (this.po_numbers && this.po_numbers.length > 1))
      ? `<span class="grn-po-badge" style="font-size: 10px; padding: 1px 6px; margin-left: 5px;"><i class="fa-solid fa-layer-group" style="margin-right: 3px;"></i>${this.po_count || this.po_numbers.length} POs</span>`
      : "";

    const totalFormatted = this.formatCurrency(this.total_bill);
    const paidFormatted = this.formatCurrency(this.paid_amount);
    const balanceFormatted = this.formatCurrency(this.balance);
    const balanceColor = this.balance > 0 ? "#ef4444" : "var(--text-muted)";

    const displayPoList = (this.po_numbers && this.po_numbers.length > 0) ? this.po_numbers.join(", ") : (this.po_number || "-");

    tr.innerHTML = `
      <td>
        <strong style="color: #10b981;">${this.grn_number}</strong>
        ${poCountBadge}
        <div style="font-size: 11px; color: var(--text-muted);">
          <i class="fa-solid fa-cart-flatbed" style="margin-right: 3px;"></i>PO: ${displayPoList}
        </div>
        ${this.supplier_invoice ? `<div style="font-size: 11px; color: var(--text-muted);"><i class="fa-solid fa-file-invoice" style="margin-right: 3px;"></i>Inv: ${this.supplier_invoice}</div>` : ""}
        <div style="font-size: 11px; color: var(--text-muted);">${this.date}</div>
      </td>
      <td>
        <strong>${this.supplier_name}</strong>
        <div style="font-size: 11px; color: var(--text-muted);">${this.stock_category}</div>
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
          <button type="button" class="pay-btn-sm" data-view-receipt="${this.payment_id || this.grn_number}" data-type="grn" title="View & Print Payment Voucher">
            <i class="fa-solid fa-receipt"></i> Voucher
          </button>
          ${this.balance > 0 ? `
          <button type="button" class="pay-btn-sm green-sm" data-open-pay-modal data-pay-type="grn" data-pay-ref="${this.grn_id || this.grn_number}" title="Pay supplier installment">
            <i class="fa-solid fa-money-bill-wave"></i> Pay
          </button>` : ""}
        </div>
      </td>
    `;

    return tr;
  }
}

/**
 * GrnPaymentRowBuilder - Fluent Builder Class extending BaseTableRowBuilder
 */
export class GrnPaymentRowBuilder extends BaseTableRowBuilder {
  constructor(initialData = null) {
    super(initialData);
  }

  build() {
    return new GrnPaymentEntity(this._data);
  }

  static from(data) {
    if (data instanceof GrnPaymentRowBuilder) return data;
    return new GrnPaymentRowBuilder(data);
  }

  static fromArray(list) {
    if (!Array.isArray(list)) return [];
    return list.map(item => new GrnPaymentRowBuilder(item).build());
  }
}

export const GrnPayment = GrnPaymentEntity;
export default GrnPaymentRowBuilder;

