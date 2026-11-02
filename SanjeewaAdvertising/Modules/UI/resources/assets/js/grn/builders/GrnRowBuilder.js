/**
 * SanjeewaAdvertising - Goods Received Note (GRN) Row Builder
 *
 * Implements Builder Pattern (GoF) extending the Core BaseTableRowBuilder:
 * - GrnEntity: Entity model encapsulating GRN consignment data and rendering <tr> HTML elements.
 * - GrnRowBuilder: Fluent builder class with setters, defaults, and .build() finalization.
 */

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";

/**
 * GrnEntity - Entity model for a Goods Received Note record
 */
export class GrnEntity {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  /**
   * Format currency helper
   * @param {number|string} amt
   * @returns {string}
   */
  formatCurrency(amt) {
    const num = parseFloat(amt) || 0;
    return `Rs. ${num.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Render complete table row DOM element (<tr>).
   * @returns {HTMLTableRowElement}
   */
  render() {
    const tr = document.createElement("tr");
    tr.id = `grnRow_${this.grn_number || ""}`;

    const isCompleted = this.status === "Completed";
    const itemCount = this.items && Array.isArray(this.items) ? this.items.length : 0;

    tr.innerHTML = `
      <td><span class="grn-code-badge">${this.grn_number || "—"}</span></td>
      <td>
        <span class="inv-supplier-pill"><i class="fa-solid fa-truck-field"></i> ${this.supplier_name || "—"}</span>
      </td>
      <td>
        <span style="font-family: ui-monospace; font-weight: 600; color: var(--text);">
          <i class="fa-solid fa-phone" style="font-size: 11px; color: var(--primary, #1677ff); margin-right: 5px;"></i>${this.supplier_contact || this.supplier_invoice_no || "N/A"}
        </span>
      </td>
      <td><span style="font-size: 12.5px; color: var(--text);">${this.received_date || "—"}</span></td>
      <td>
        <span class="grn-code-badge" style="background: #f6ffed; color: #389e0d; border-color: #b7eb8f; display: inline-flex; align-items: center; gap: 4px;">
          <i class="fa-solid fa-file-invoice" style="font-size: 11px;"></i> ${this.purchase_order_no || "N/A"}
        </span>
        <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 2px;">
          ${itemCount} items
        </span>
      </td>
      <td class="text-right" style="font-weight: 700; color: var(--text);">
        ${this.formatCurrency(this.net_total)}
      </td>
      <td><span style="font-size: 12px; color: var(--text-muted);">${this.received_by || "Admin User"}</span></td>
      <td>
        <span class="grn-status-badge ${isCompleted ? "completed" : "draft"}">
          <i class="fa-solid ${isCompleted ? "fa-circle-check" : "fa-clock"}"></i>
          ${this.status || "Draft"}
        </span>
      </td>
      <td class="text-center">
        <div class="inv-actions-group">
          <button type="button" class="ant-btn-action" title="View GRN Document" onclick="window.grnManager?.viewGRN('${this.grn_number}')">
            <i class="fa-solid fa-eye"></i> View
          </button>
          ${!isCompleted ? `
            <button type="button" class="ant-btn-action" style="color: #52c41a; border-color: #b7eb8f;" title="Complete GRN & Update Stock" onclick="window.grnManager?.finalizeDraftGRN('${this.grn_number}')">
              <i class="fa-solid fa-check-double"></i> Complete
            </button>
          ` : ""}
        </div>
      </td>
    `;

    return tr;
  }

  renderTableRow() {
    return this.render();
  }

  static fromArray(list) {
    if (!Array.isArray(list)) return [];
    return list.map(item => new GrnRowBuilder(item).build());
  }
}

/**
 * GrnRowBuilder - Fluent builder extending Core BaseTableRowBuilder
 */
export class GrnRowBuilder extends BaseTableRowBuilder {
  constructor(initialData = null) {
    super(initialData);
  }

  reset() {
    super.reset();
    this._data = {
      grn_number: "",
      supplier_name: "",
      supplier_contact: "",
      supplier_invoice_no: "",
      received_date: new Date().toISOString().split("T")[0],
      purchase_order_no: "",
      sub_total: 0.0,
      discount: 0.0,
      net_total: 0.0,
      received_by: "Admin User",
      status: "Completed",
      remarks: "",
      items: []
    };
    return this;
  }

  setGrnNumber(val) {
    return this.set("grn_number", val);
  }

  setSupplier(name, contact = "", invoice = "") {
    this.set("supplier_name", name);
    if (contact) this.set("supplier_contact", contact);
    if (invoice) this.set("supplier_invoice_no", invoice);
    return this;
  }

  setReceivedDate(val) {
    return this.set("received_date", val);
  }

  setPurchaseOrder(po) {
    return this.set("purchase_order_no", po);
  }

  setTotals(subTotal, discount = 0, netTotal = null) {
    const sub = parseFloat(subTotal) || 0;
    const disc = parseFloat(discount) || 0;
    const net = netTotal !== null ? parseFloat(netTotal) : Math.max(0, sub - disc);
    this.set("sub_total", sub);
    this.set("discount", disc);
    this.set("net_total", net);
    return this;
  }

  setReceivedBy(val) {
    return this.set("received_by", val);
  }

  setStatus(val) {
    return this.set("status", val);
  }

  setRemarks(val) {
    return this.set("remarks", val);
  }

  setItems(items = []) {
    return this.set("items", Array.isArray(items) ? items : []);
  }

  build() {
    return new GrnEntity(this._data);
  }
}

