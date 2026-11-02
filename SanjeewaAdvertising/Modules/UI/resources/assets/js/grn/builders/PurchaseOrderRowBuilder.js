/**
 * SanjeewaAdvertising - Purchase Order Row Builder
 *
 * Implements Builder Pattern (GoF) extending the Core BaseTableRowBuilder:
 * - PurchaseOrderEntity: Entity model encapsulating PO data and rendering <tr> HTML elements.
 * - PurchaseOrderRowBuilder: Fluent builder class with setters, defaults, and .build() finalization.
 */

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";

/**
 * PurchaseOrderEntity - Entity model for a Purchase Order record
 */
export class PurchaseOrderEntity {
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
    tr.id = `poRow_${this.po_number || ""}`;

    // Items summary tags
    let itemsTags = "";
    if (this.items && this.items.length > 0) {
      itemsTags = this.items.map(item => `
        <span class="po-item-tag" title="${item.item_name || ""}">
          <strong>${item.qty_ordered || 0} ${item.unit || ""}</strong> ${(item.item_name || "").substring(0, 22)}${(item.item_name || "").length > 22 ? "..." : ""}
        </span>
      `).join("");
    }

    let statusBadgeClass = "pending";
    let statusIcon = "fa-clock";
    if (this.status === "Completed") {
      statusBadgeClass = "completed";
      statusIcon = "fa-circle-check";
    } else if (this.status === "Partial") {
      statusBadgeClass = "partial";
      statusIcon = "fa-hourglass-half";
    }

    const isCompleted = this.status === "Completed";

    tr.innerHTML = `
      <td>
        <span class="grn-code-badge" style="background: #e6f4ff; color: #1677ff; border-color: #91caff;">
          ${this.po_number || "—"}
        </span>
      </td>
      <td><span style="font-size: 12.5px; color: var(--text);">${this.order_date || "—"}</span></td>
      <td><span style="font-size: 12.5px; font-weight: 600; color: #fa8c16;">${this.expected_date || "N/A"}</span></td>
      <td>
        <span class="inv-supplier-pill"><i class="fa-solid fa-truck-field"></i> ${this.supplier_name || "—"}</span>
        <div style="font-size: 11px; color: var(--text-muted); font-family: ui-monospace; margin-top: 3px;">
          <i class="fa-solid fa-phone" style="font-size: 10px;"></i> ${this.supplier_contact || "-"}
        </div>
      </td>
      <td style="max-width: 320px;">
        ${itemsTags || "<span style='font-size: 11.5px; color: var(--text-muted);'>No items</span>"}
      </td>
      <td class="text-right" style="font-weight: 700; color: var(--text);">
        ${this.formatCurrency(this.total_amount)}
      </td>
      <td>
        <span class="grn-status-badge ${statusBadgeClass}">
          <i class="fa-solid ${statusIcon}"></i> ${this.status || "Pending"}
        </span>
      </td>
      <td class="text-center">
        <div class="inv-actions-group">
          <button type="button" class="ant-btn-action" title="View Purchase Order" onclick="window.grnManager?.viewPO('${this.po_number}')">
            <i class="fa-solid fa-eye"></i> View
          </button>
          ${!isCompleted ? `
            <button type="button" class="ant-btn-action" style="color: #52c41a; border-color: #b7eb8f; background: #f6ffed;" title="Create GRN for this PO" onclick="window.grnManager?.createGrnForPO('${this.po_number}')">
              <i class="fa-solid fa-truck-ramp-box"></i> Receive (GRN)
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
    return list.map(item => new PurchaseOrderRowBuilder(item).build());
  }
}

/**
 * PurchaseOrderRowBuilder - Fluent builder extending Core BaseTableRowBuilder
 */
export class PurchaseOrderRowBuilder extends BaseTableRowBuilder {
  constructor(initialData = null) {
    super(initialData);
  }

  reset() {
    super.reset();
    this._data = {
      po_number: "",
      order_date: new Date().toISOString().split("T")[0],
      expected_date: "",
      supplier_name: "",
      supplier_contact: "",
      status: "Pending",
      total_amount: 0.0,
      created_by: "Admin User",
      remarks: "",
      items: []
    };
    return this;
  }

  setPoNumber(val) {
    return this.set("po_number", val);
  }

  setOrderDate(val) {
    return this.set("order_date", val);
  }

  setExpectedDate(val) {
    return this.set("expected_date", val);
  }

  setSupplier(name, contact = "") {
    this.set("supplier_name", name);
    if (contact) this.set("supplier_contact", contact);
    return this;
  }

  setItems(items = []) {
    return this.set("items", Array.isArray(items) ? items : []);
  }

  setTotalAmount(val) {
    return this.set("total_amount", parseFloat(val) || 0.0);
  }

  setStatus(val) {
    return this.set("status", val);
  }

  setRemarks(val) {
    return this.set("remarks", val);
  }

  setCreatedBy(val) {
    return this.set("created_by", val);
  }

  build() {
    return new PurchaseOrderEntity(this._data);
  }
}

