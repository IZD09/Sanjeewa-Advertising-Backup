/**
 * SanjeewaAdvertising - Inventory Row Builder
 *
 * Implements Builder Pattern (GoF) extending the Core BaseTableRowBuilder:
 * - InventoryEntity: Entity model encapsulating material SKU stock data and rendering <tr> HTML elements.
 * - InventoryRowBuilder: Fluent builder class extending BaseTableRowBuilder.
 */

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";

/**
 * InventoryEntity - Entity model for an Inventory Material Stock record
 */
export class InventoryEntity {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  formatCurrency(amt) {
    const num = parseFloat(amt) || 0;
    return `Rs. ${num.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Render table row element (<tr>) with complete styling and action buttons.
   * @param {Object} [helpers={}]
   * @returns {HTMLTableRowElement}
   */
  render(helpers = {}) {
    const getItemAvailableQty = helpers.getItemAvailableQty || ((item) => {
      if (item.batches && Array.isArray(item.batches)) {
        return item.batches.reduce((sum, b) => sum + (b.availableQty || 0), 0);
      }
      return item.currentStock || item.qty || 0;
    });

    const getItemStatus = helpers.getItemStatus || ((item) => {
      const qty = getItemAvailableQty(item);
      const min = item.minThreshold || 10;
      if (qty <= 0) return { label: "Out of Stock", class: "ant-tag-red" };
      if (qty <= min) return { label: "Low Stock", class: "ant-tag-orange" };
      return { label: "In Stock", class: "ant-tag-green" };
    });

    const formatCurrency = helpers.formatCurrency || ((amt) => this.formatCurrency(amt));

    const availQty = getItemAvailableQty(this);
    const totalVal = this.totalValue || (availQty * (this.unitPrice || 0));
    const status = getItemStatus(this);

    // Format batches string if present
    let batchInfo = "";
    if (Array.isArray(this.batches) && this.batches.length > 0) {
      const batchNames = this.batches.map(b => b.batch_no || (b.batch_id ? `BAT-${b.batch_id}` : (b.id || "Batch"))).join(", ");
      batchInfo = `<div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;"><i class="fa-solid fa-boxes-stacked" style="color: #1677ff;"></i> ${batchNames}</div>`;
    }

    const tr = document.createElement("tr");
    tr.id = `invRow_${this.code || this.id || ""}`;
    tr.dataset.stockId = String(this.id || "");
    tr.dataset.itemCode = this.code || "";
    tr.innerHTML = `
      <td>
        <span class="inv-item-code" style="font-weight: 700; color: #1677ff;">${this.code}</span>
        ${this.id ? `<div style="font-size: 10.5px; color: var(--text-muted); font-family: monospace;">Stock #${this.id}</div>` : ""}
      </td>
      <td>
        <div class="inv-item-title" style="font-weight: 600;">${this.name}</div>
        ${batchInfo}
      </td>
      <td>
        <span class="inv-cat-pill"><i class="fa-solid fa-tag"></i> ${this.category}</span>
        ${this.subcategory && this.subcategory !== this.category ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${this.subcategory}</div>` : ""}
      </td>
      <td>
        <span class="inv-supplier-pill"><i class="fa-solid fa-truck-field"></i> ${this.supplier || "General Supplier"}</span>
        ${this.brand && this.brand !== "Generic" ? `<div style="margin-top: 2px;"><span class="ant-tag ant-tag-blue" style="font-size: 10.5px; padding: 1px 6px;">${this.brand}</span></div>` : ""}
      </td>
      <td class="text-right">${formatCurrency(this.unitPrice)}</td>
      <td class="text-right">
        <strong style="font-size: 13.5px; color: var(--text);">${availQty.toLocaleString()}</strong>
      </td>
      <td><span class="inv-unit-badge">${this.unit || "Units"}</span></td>
      <td class="text-right" style="font-weight: 700; color: var(--text);">
        ${formatCurrency(totalVal)}
      </td>
      <td>
        <span class="ant-tag ${status.class}">
          <span class="ant-tag-dot"></span>
          ${status.label}
        </span>
      </td>
      <td class="text-center">
        <div class="inv-actions-group">
          <button type="button" class="ant-btn-action" title="View Details" onclick="window.inventoryManager?.openViewModal('${this.code}')">
            <i class="fa-solid fa-eye"></i> View
          </button>
          <button type="button" class="ant-btn-action adjust-btn" title="Adjust Stock" onclick="window.inventoryManager?.openAdjustModal('${this.code}')">
            <i class="fa-solid fa-sliders"></i> Adjust
          </button>
        </div>
      </td>
    `;
    return tr;
  }

  renderTableRow(helpers = {}) {
    return this.render(helpers);
  }

  static fromArray(list) {
    if (!Array.isArray(list)) return [];
    return list.map(item => new InventoryRowBuilder(item).build());
  }
}

/**
 * InventoryRowBuilder - Fluent Builder Class extending BaseTableRowBuilder
 */
export class InventoryRowBuilder extends BaseTableRowBuilder {
  constructor(initialData = null) {
    super(initialData);
  }

  build() {
    return new InventoryEntity(this._data);
  }

  render(helpers = {}) {
    return this.build().render(helpers);
  }

  static from(data) {
    if (data instanceof InventoryRowBuilder) return data;
    return new InventoryRowBuilder(data);
  }

  static fromArray(list) {
    if (!Array.isArray(list)) return [];
    return list.map(item => new InventoryRowBuilder(item).build());
  }
}

export default InventoryRowBuilder;

