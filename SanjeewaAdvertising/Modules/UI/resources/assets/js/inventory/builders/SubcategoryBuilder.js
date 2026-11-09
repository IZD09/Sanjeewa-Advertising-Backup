/**
 * SanjeewaAdvertising - Subcategory Row Builder
 *
 * Implements Builder Pattern (GoF) extending Core BaseTableRowBuilder:
 * - SubcategoryEntity: Encapsulates a Subcategory record and renders a <tr> DOM element.
 * - SubcategoryBuilder: Fluent builder class for constructing and rendering subcategory rows in the UI.
 */

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";

/**
 * SubcategoryEntity - Entity model representing a Subcategory table row.
 */
export class SubcategoryEntity {
  constructor(data = {}) {
    this.id = data.id ?? "";
    this.rowNumber = data.rowNumber ?? data.index ?? null;
    this.subcategory = data.subcategory || data.name || "—";
    this.categoriesId = data.categories_id ?? data.categoryId ?? null;
    this.categoryName =
      data.categoryName ||
      (data.category && data.category.category) ||
      "General";
    this.stockItemsCount =
      data.stock_items_count ??
      data.stockItemsCount ??
      0;
    this.onFilterStock = typeof data.onFilterStock === "function" ? data.onFilterStock : null;
  }

  /**
   * Render table row element (<tr>) for the subcategories table.
   * @returns {HTMLTableRowElement}
   */
  render() {
    const tr = document.createElement("tr");
    tr.id = `subcatRow_${this.id}`;
    tr.dataset.subcategoryId = String(this.id);
    tr.dataset.categoryId = String(this.categoriesId || "");

    const displayIndex = this.rowNumber !== null ? this.rowNumber : (this.id ? `#${this.id}` : "-");

    tr.innerHTML = `
      <td style="font-family: monospace; font-size: 11.5px; color: var(--text-muted); font-weight: 600;">
        ${displayIndex}
      </td>
      <td>
        <div style="font-weight: 600; font-size: 13px; color: var(--text);">
          ${this.subcategory}
        </div>
      </td>
      <td>
        <span class="inv-cat-pill" style="font-size: 11.5px; padding: 3px 8px;">
          <i class="fa-solid fa-folder" style="color: #1677ff;"></i> ${this.categoryName}
        </span>
      </td>
      <td class="text-center">
        <span class="ant-tag ant-tag-blue" style="font-weight: 600;">
          ${this.stockItemsCount} SKUs
        </span>
      </td>
      <td class="text-center">
        <button type="button" class="ant-btn ant-btn-default ant-btn-sm btn-filter-stock" title="View Stock for this category" style="font-size: 11px;">
          <i class="fa-solid fa-boxes-stacked"></i> View Stock
        </button>
      </td>
    `;

    const filterBtn = tr.querySelector(".btn-filter-stock");
    if (filterBtn && this.onFilterStock) {
      filterBtn.addEventListener("click", () => {
        this.onFilterStock(this.categoryName);
      });
    }

    return tr;
  }
}

/**
 * SubcategoryBuilder - Fluent builder class for Subcategory table rows.
 */
export class SubcategoryBuilder extends BaseTableRowBuilder {
  setId(id) {
    return this.set("id", id);
  }

  setRowNumber(rowNumber) {
    return this.set("rowNumber", rowNumber);
  }

  setSubcategory(subcategory) {
    return this.set("subcategory", subcategory);
  }

  setCategoriesId(categoriesId) {
    return this.set("categories_id", categoriesId);
  }

  setCategoryName(categoryName) {
    return this.set("categoryName", categoryName);
  }

  setStockItemsCount(count) {
    return this.set("stock_items_count", count);
  }

  setOnFilterStock(callback) {
    return this.set("onFilterStock", callback);
  }

  buildEntity() {
    return new SubcategoryEntity(this._data);
  }

  build() {
    return this.buildEntity().render();
  }

  /**
   * Static helper to construct and render a subcategory row.
   * @param {Object} data
   * @param {Object} [options={}]
   * @returns {HTMLTableRowElement}
   */
  static renderRow(data = {}, options = {}) {
    const builder = new SubcategoryBuilder(data);
    if (options.rowNumber !== undefined) {
      builder.setRowNumber(options.rowNumber);
    }
    if (options.onFilterStock) {
      builder.setOnFilterStock(options.onFilterStock);
    }
    return builder.build();
  }
}

export default SubcategoryBuilder;
