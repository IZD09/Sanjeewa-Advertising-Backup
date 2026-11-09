/**
 * SanjeewaAdvertising - Stock Item Aggregated Row Builder
 *
 * Implements Builder Pattern (GoF) extending Core BaseTableRowBuilder:
 * - StockItemAggregatedEntity: Encapsulates catalog Stock Item with consolidated
 *   batch totals (Total Qty, Total Valuation, Batches count, Status, Brands).
 * - StockItemAggregatedRowBuilder: Fluent builder class for constructing and rendering
 *   consolidated Material Stock table rows.
 */

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";

export class StockItemAggregatedEntity {
  constructor(data = {}) {
    this.id = data.id ?? data.stock_items_id ?? "";
    this.rowNumber = data.rowNumber ?? data.index ?? null;
    this.code = data.code || `SKU-${this.id}`;
    this.name = data.name || "—";
    this.category = data.category || "General";
    this.subcategory = data.subcategory || "General";
    this.brands = Array.isArray(data.brands) ? data.brands : [];
    this.batchesCount = data.batches_count ?? data.batchesCount ?? 0;
    this.totalQty = parseInt(data.total_qty ?? data.currentStock ?? data.qty ?? 0, 10);
    this.unit = data.unit || "Units";
    this.unitPrice = parseFloat(data.unitPrice ?? 0);
    this.totalVal = parseFloat(data.total_val ?? data.totalValue ?? (this.totalQty * this.unitPrice));
    this.lowStockQty = parseInt(data.low_stock_qty ?? data.minThreshold ?? 10, 10);
    this.reorderQty = parseInt(data.reorder_qty ?? 20, 10);
    this.status = data.status || this.calculateStatus();
    this.raw = data;
  }

  calculateStatus() {
    if (this.totalQty <= 0) {
      return { label: "Out of Stock", class: "ant-tag-red" };
    }
    if (this.totalQty <= this.lowStockQty) {
      return { label: "Low Stock", class: "ant-tag-orange" };
    }
    return { label: "In Stock", class: "ant-tag-green" };
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
    const formatCurrency = helpers.formatCurrency || ((amt) => this.formatCurrency(amt));

    const tr = document.createElement("tr");
    tr.id = `invAggRow_${this.code}`;
    tr.dataset.itemId = String(this.id);
    tr.dataset.itemCode = this.code;

    const displayIndex = this.rowNumber !== null ? this.rowNumber : (this.id ? `#${this.id}` : "-");

    // Format brand badges
    let brandsHtml = "";
    if (this.brands.length > 0) {
      brandsHtml = this.brands
        .map((b) => {
          const brandName = typeof b === "object" ? (b.brand || b.name) : b;
          return `<span class="ant-tag ant-tag-blue" style="font-size: 11px; margin: 1px 2px;">${brandName}</span>`;
        })
        .join("");
    } else {
      brandsHtml = '<span style="color: var(--text-muted); font-size: 11.5px;">Generic / All</span>';
    }

    const batchesBadge = this.batchesCount > 0
      ? `<span class="ant-tag ant-tag-blue" style="font-weight: 600; font-size: 11px; cursor: pointer;" title="Click to view detailed batches" onclick="window.inventoryManager?.viewItemBatches('${this.code}')"><i class="fa-solid fa-boxes-stacked"></i> ${this.batchesCount} ${this.batchesCount === 1 ? "Batch" : "Batches"}</span>`
      : `<span class="ant-tag" style="background: #f5f5f5; color: #8c8c8c; font-size: 11px;">0 Batches</span>`;

    tr.innerHTML = `
      <td style="font-family: monospace; font-size: 11.5px; color: var(--text-muted); font-weight: 600;">
        ${displayIndex}
      </td>
      <td>
        <span class="inv-item-code" style="font-size: 12px; font-weight: 700; color: #1677ff;">
          ${this.code}
        </span>
      </td>
      <td>
        <div class="inv-item-title" style="font-weight: 600; font-size: 13px; color: var(--text);">
          ${this.name}
        </div>
      </td>
      <td>
        <span class="inv-cat-pill" style="font-size: 11px; padding: 2px 7px;">
          <i class="fa-solid fa-folder" style="color: #1677ff;"></i> ${this.category}
        </span>
        <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
          <i class="fa-solid fa-tag" style="font-size: 10px;"></i> ${this.subcategory}
        </div>
      </td>
      <td>
        <div style="display: flex; flex-wrap: wrap; gap: 3px; max-width: 170px;">
          ${brandsHtml}
        </div>
      </td>
      <td class="text-center">
        ${batchesBadge}
      </td>
      <td class="text-right">
        <strong style="font-size: 13.5px; color: var(--text);">${this.totalQty.toLocaleString()}</strong>
        <span class="inv-unit-badge" style="margin-left: 3px;">${this.unit}</span>
      </td>
      <td class="text-right" style="font-weight: 700; color: var(--text);">
        ${formatCurrency(this.totalVal)}
      </td>
      <td>
        <span class="ant-tag ${this.status.class}">
          <span class="ant-tag-dot"></span>
          ${this.status.label}
        </span>
      </td>
      <td class="text-center">
        <div class="inv-actions-group" style="display: inline-flex; gap: 4px; justify-content: center;">
          <button type="button" class="ant-btn-action" title="Receive / Add Stock" onclick="window.inventoryManager?.openAddStockModal({ item_id: '${this.id}', item_code: '${this.code}' })" style="padding: 3px 8px; font-size: 11.5px;">
            <i class="fa-solid fa-plus"></i> Add Stock
          </button>
          <button type="button" class="ant-btn-action" title="View Detailed Batches" onclick="window.inventoryManager?.viewItemBatches('${this.code}')" style="padding: 3px 8px; font-size: 11.5px;">
            <i class="fa-solid fa-boxes-stacked"></i> Batches
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
    return list.map((item, idx) => new StockItemAggregatedRowBuilder({ ...item, rowNumber: idx + 1 }).build());
  }
}

export class StockItemAggregatedRowBuilder extends BaseTableRowBuilder {
  constructor(item = {}) {
    super();
    this.entity = new StockItemAggregatedEntity(item);
  }

  build() {
    return this.entity;
  }
}

export default StockItemAggregatedRowBuilder;
