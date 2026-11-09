/**
 * SanjeewaAdvertising - Brand Card Builder
 *
 * Implements Builder Pattern (GoF) extending Core BaseTableRowBuilder:
 * - BrandEntity: Encapsulates Brand item and renders a .brand-card-box DOM element.
 * - BrandCardBuilder: Fluent builder class for constructing and rendering Brand cards.
 */

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";

export class BrandEntity {
  constructor(data = {}) {
    this.id = data.id ?? "";
    this.rowNumber = data.rowNumber ?? null;
    this.brand = data.brand || "—";
    this.stockItemsCount = data.stock_items_count ?? (Array.isArray(data.stock_items) ? data.stock_items.length : 0);
    this.stocksCount = data.stocks_count ?? (Array.isArray(data.stocks) ? data.stocks.length : 0);
    this.raw = data;

    this.onEdit = typeof data.onEdit === "function" ? data.onEdit : null;
    this.onFilter = typeof data.onFilter === "function" ? data.onFilter : null;
  }

  /**
   * Render Brand card element.
   * @returns {HTMLDivElement}
   */
  render() {
    const card = document.createElement("div");
    card.className = "brand-card-item";
    card.dataset.brandId = String(this.id);
    card.dataset.brandName = this.brand;

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(22, 119, 255, 0.08); color: #1677ff; display: grid; place-items: center; font-weight: 800; font-size: 14px;">
            <i class="fa-solid fa-copyright"></i>
          </div>
          <div>
            <div class="brand-title" style="font-size: 13.5px; font-weight: 700; color: var(--text); line-height: 1.2;">
              ${this.brand}
            </div>
            <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
              ${this.stockItemsCount} Catalog Items &bull; ${this.stocksCount} Batches
            </div>
          </div>
        </div>
        <button type="button" class="ant-btn ant-btn-default ant-btn-sm btn-edit-brand" title="Edit Brand Name" style="height: 26px; padding: 0 8px; font-size: 11px;">
          <i class="fa-solid fa-pen"></i> Edit
        </button>
      </div>
    `;

    const editBtn = card.querySelector(".btn-edit-brand");
    if (editBtn && this.onEdit) {
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.onEdit(this.raw);
      });
    }

    if (this.onFilter) {
      card.addEventListener("click", () => {
        this.onFilter(this.id, this.brand);
      });
    }

    return card;
  }
}

export class BrandCardBuilder extends BaseTableRowBuilder {
  setId(id) {
    return this.set("id", id);
  }

  setBrand(brand) {
    return this.set("brand", brand);
  }

  setStockItemsCount(count) {
    return this.set("stock_items_count", count);
  }

  setStocksCount(count) {
    return this.set("stocks_count", count);
  }

  setOnEdit(callback) {
    return this.set("onEdit", callback);
  }

  setOnFilter(callback) {
    return this.set("onFilter", callback);
  }

  buildEntity() {
    return new BrandEntity(this._data);
  }

  build() {
    return this.buildEntity().render();
  }

  /**
   * Static helper to construct and render a brand card.
   * @param {Object} data
   * @param {Object} [options={}]
   * @returns {HTMLDivElement}
   */
  static renderCard(data = {}, options = {}) {
    const builder = new BrandCardBuilder(data);
    if (options.onEdit) {
      builder.setOnEdit(options.onEdit);
    }
    if (options.onFilter) {
      builder.setOnFilter(options.onFilter);
    }
    return builder.build();
  }
}

export default BrandCardBuilder;
