/**
 * SanjeewaAdvertising - Stock Item Row Builder
 *
 * Implements Builder Pattern (GoF) extending Core BaseTableRowBuilder:
 * - StockItemEntity: Encapsulates a Stock Item entity and renders a <tr> DOM element.
 * - StockItemRowBuilder: Fluent builder class for constructing and rendering Stock Item table rows.
 */

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";

export class StockItemEntity {
  constructor(data = {}) {
    this.id = data.id ?? "";
    this.rowNumber = data.rowNumber ?? data.index ?? null;
    this.name = data.name || "—";
    this.code = data.code || `SKU-${this.id}`;
    this.subcategoryId = data.subcategories_id ?? (data.subcategory && data.subcategory.id) ?? null;
    this.subcategoryName = (data.subcategory && data.subcategory.subcategory) || "—";
    this.categoryName = (data.subcategory && data.subcategory.category && data.subcategory.category.category) || "General";
    this.brands = Array.isArray(data.brands) ? data.brands : [];
    this.stocksCount = data.stocks_count ?? (Array.isArray(data.stocks) ? data.stocks.length : 0);
    this.lowStockQty = data.low_stock_qty ?? 10;
    this.reorderQty = data.reorder_qty ?? 20;
    this.raw = data;

    this.onEdit = typeof data.onEdit === "function" ? data.onEdit : null;
    this.onViewStock = typeof data.onViewStock === "function" ? data.onViewStock : null;
  }

  /**
   * Render table row element (<tr>) for the Stock Items table.
   * @returns {HTMLTableRowElement}
   */
  render() {
    const tr = document.createElement("tr");
    tr.id = `stockItemRow_${this.id}`;
    tr.dataset.itemId = String(this.id);
    tr.dataset.itemCode = this.code;

    const displayIndex = this.rowNumber !== null ? this.rowNumber : (this.id ? `#${this.id}` : "-");

    // Format brand badges
    let brandsHtml = "";
    if (this.brands.length > 0) {
      brandsHtml = this.brands
        .map((b) => `<span class="ant-tag ant-tag-blue" style="font-size: 11px; margin: 1px 2px;">${b.brand}</span>`)
        .join("");
    } else {
      brandsHtml = '<span style="color: var(--text-muted); font-size: 11.5px;">Generic / All</span>';
    }

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
        <div style="font-weight: 600; font-size: 13px; color: var(--text);">
          ${this.name}
        </div>
      </td>
      <td>
        <span class="inv-cat-pill" style="font-size: 11px; padding: 2px 7px;">
          <i class="fa-solid fa-folder" style="color: #1677ff;"></i> ${this.categoryName}
        </span>
        <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
          <i class="fa-solid fa-tag" style="font-size: 10px;"></i> ${this.subcategoryName}
        </div>
      </td>
      <td>
        <div style="display: flex; flex-wrap: wrap; gap: 3px;">
          ${brandsHtml}
        </div>
      </td>
      <td class="text-center">
        <span class="ant-tag ant-tag-green" style="font-weight: 600;">
          ${this.stocksCount} Batches
        </span>
      </td>
      <td class="text-center">
        <div style="display: inline-flex; gap: 6px; align-items: center;">
          <button type="button" class="ant-btn ant-btn-default ant-btn-sm btn-edit-stock-item" title="Edit Item Details" style="font-size: 11px; height: 26px; padding: 0 8px;">
            <i class="fa-solid fa-pen-to-square"></i> Edit
          </button>
        </div>
      </td>
    `;

    const editBtn = tr.querySelector(".btn-edit-stock-item");
    if (editBtn && this.onEdit) {
      editBtn.addEventListener("click", () => {
        this.onEdit(this.raw);
      });
    }

    return tr;
  }
}

export class StockItemRowBuilder extends BaseTableRowBuilder {
  setId(id) {
    return this.set("id", id);
  }

  setRowNumber(rowNumber) {
    return this.set("rowNumber", rowNumber);
  }

  setName(name) {
    return this.set("name", name);
  }

  setCode(code) {
    return this.set("code", code);
  }

  setSubcategoryId(subcategoryId) {
    return this.set("subcategories_id", subcategoryId);
  }

  setSubcategoryName(subcategoryName) {
    return this.set("subcategoryName", subcategoryName);
  }

  setCategoryName(categoryName) {
    return this.set("categoryName", categoryName);
  }

  setBrands(brands) {
    return this.set("brands", brands);
  }

  setLowStockQty(lowStockQty) {
    return this.set("low_stock_qty", lowStockQty);
  }

  setReorderQty(reorderQty) {
    return this.set("reorder_qty", reorderQty);
  }

  setOnEdit(callback) {
    return this.set("onEdit", callback);
  }

  buildEntity() {
    return new StockItemEntity(this._data);
  }

  build() {
    return this.buildEntity();
  }

  render() {
    return this.buildEntity().render();
  }

  /**
   * Static helper to construct and render a stock item row.
   * @param {Object} data
   * @param {Object} [options={}]
   * @returns {HTMLTableRowElement}
   */
  static renderRow(data = {}, options = {}) {
    const builder = new StockItemRowBuilder(data);
    if (options.rowNumber !== undefined) {
      builder.setRowNumber(options.rowNumber);
    }
    if (options.onEdit) {
      builder.setOnEdit(options.onEdit);
    }
    return builder.render();
  }
}

export const StockItemBuilder = StockItemRowBuilder;
export default StockItemRowBuilder;
