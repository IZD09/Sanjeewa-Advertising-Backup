/**
 * SanjeewaAdvertising - Category Builder
 *
 * Implements Builder Pattern (GoF) extending Core BaseTableRowBuilder:
 * - CategoryEntity: Encapsulates a Material Category record and renders a .cat-list-item DOM element.
 * - CategoryBuilder: Fluent builder class for constructing and rendering category items in the UI.
 */

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";

/**
 * CategoryEntity - Entity model representing a Material Category item in the UI list.
 */
export class CategoryEntity {
  constructor(data = {}) {
    this.id = data.id ?? "ALL";
    this.category = data.category || data.name || "Category";
    this.subcategoriesCount =
      data.subcategories_count ??
      data.subcategoriesCount ??
      (Array.isArray(data.subcategories) ? data.subcategories.length : 0);
    this.isActive = Boolean(data.isActive);
    this.icon = data.icon || (this.id === "ALL" ? "fa-layer-group" : "fa-folder");
    this.onSelect = typeof data.onSelect === "function" ? data.onSelect : null;
  }

  /**
   * Render category list item DOM element (<div class="cat-list-item">).
   * @returns {HTMLDivElement}
   */
  render() {
    const el = document.createElement("div");
    el.className = `cat-list-item${this.isActive ? " active" : ""}`;
    el.dataset.categoryId = String(this.id);
    el.dataset.categoryName = this.category;

    el.innerHTML = `
      <div class="cat-list-item-left">
        <i class="fa-solid ${this.icon}"></i>
        <span class="cat-list-name">${this.category}</span>
      </div>
      <span class="cat-list-count">${this.subcategoriesCount} Subcats</span>
    `;

    if (this.onSelect) {
      el.addEventListener("click", () => {
        this.onSelect(this.id, this.category);
      });
    }

    return el;
  }
}

/**
 * CategoryBuilder - Fluent builder class for Category UI items.
 */
export class CategoryBuilder extends BaseTableRowBuilder {
  setId(id) {
    return this.set("id", id);
  }

  setCategory(category) {
    return this.set("category", category);
  }

  setSubcategoriesCount(count) {
    return this.set("subcategories_count", count);
  }

  setIsActive(isActive) {
    return this.set("isActive", Boolean(isActive));
  }

  setIcon(icon) {
    return this.set("icon", icon);
  }

  setOnSelect(callback) {
    return this.set("onSelect", callback);
  }

  buildEntity() {
    return new CategoryEntity(this._data);
  }

  build() {
    return this.buildEntity().render();
  }

  /**
   * Static helper to construct and render a category list item.
   * @param {Object} data
   * @param {Object} [options={}]
   * @returns {HTMLDivElement}
   */
  static renderItem(data = {}, options = {}) {
    const builder = new CategoryBuilder(data);
    if (options.isActive !== undefined) {
      builder.setIsActive(options.isActive);
    }
    if (options.icon) {
      builder.setIcon(options.icon);
    }
    if (options.onSelect) {
      builder.setOnSelect(options.onSelect);
    }
    return builder.build();
  }
}

export default CategoryBuilder;
