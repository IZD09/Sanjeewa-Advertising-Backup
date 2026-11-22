/**
 * SanjeewaAdvertising - Create Purchase Order Item Row Builder
 *
 * Implements Builder Pattern (GoF) extending Core BaseTableRowBuilder:
 * - CreatePoItemEntity: Entity model encapsulating a Purchase Order line item row (#newPoItemsTbody).
 * - CreatePoItemRowBuilder: Fluent builder for PO line item rows, empty state, supplier dropdown, and catalog dropdown items.
 */

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";

/**
 * CreatePoItemEntity - Entity model for a line item row in Create Purchase Order Modal
 */
export class CreatePoItemEntity {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  /**
   * Format currency helper
   * @param {number|string} amt
   * @returns {string}
   */
  formatCurrency(amt) {
    if (typeof this.currencyFormatter === "function") {
      return this.currencyFormatter(amt || 0);
    }
    const num = parseFloat(amt) || 0;
    return `Rs. ${num.toFixed(2)}`;
  }

  /**
   * Render Purchase Order line item row (<tr>).
   * @returns {HTMLTableRowElement}
   */
  render() {
    const tr = document.createElement("tr");
    const index = this.index ?? 0;

    tr.innerHTML = `
      <td style="min-width: 250px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="inv-item-code" style="font-size: 11px; font-weight: 700; color: #1677ff;">${this.item_id}</span>
          <span style="font-weight: 600; font-size: 12.5px; color: var(--text);">${this.item_name}</span>
        </div>
      </td>
      <td style="width: 100px;">
        <span class="inv-unit-badge" style="font-size: 12px; font-weight: 600; color: var(--text);">${this.unit}</span>
      </td>
      <td style="width: 120px;">
        <input type="number"
               id="newPoItemQty_${index}"
               name="new_po_items[${index}][qty]"
               aria-label="Order quantity for ${this.item_name}"
               class="grn-inline-input text-right"
               min="1"
               step="1"
               value="${this.qty}"
               oninput="window.grnManager.onNewPoQtyChange(${index}, this.value)">
      </td>
      <td style="width: 140px;">
        <input type="number"
               id="newPoItemCost_${index}"
               name="new_po_items[${index}][cost]"
               aria-label="Unit cost for ${this.item_name}"
               class="grn-inline-input text-right"
               min="0"
               step="0.01"
               value="${this.unit_cost}"
               oninput="window.grnManager.onNewPoCostChange(${index}, this.value)">
      </td>
      <td class="text-right" style="width: 150px; font-weight: 700; color: #1677ff;">
        ${this.formatCurrency(this.total)}
      </td>
      <td class="text-center" style="width: 60px;">
        <button type="button" class="ant-btn-action" style="color: #ff4d4f; border-color: transparent;" title="Delete Row" onclick="window.grnManager.removeNewPoRow(${index})">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    `;

    return tr;
  }
}

/**
 * CreatePoItemRowBuilder - Fluent builder extending BaseTableRowBuilder
 */
export class CreatePoItemRowBuilder extends BaseTableRowBuilder {
  constructor(initialData = null) {
    super(initialData);
  }

  reset() {
    super.reset();
    this._data = {
      id: null,
      stock_items_id: null,
      index: 0,
      item_id: "",
      item_name: "",
      unit: "Units",
      qty: 1,
      unit_cost: 0,
      total: 0,
      currencyFormatter: null
    };
    return this;
  }

  setIndex(index) {
    return this.set("index", index);
  }

  setCurrencyFormatter(fn) {
    return this.set("currencyFormatter", fn);
  }

  build() {
    return new CreatePoItemEntity(this._data);
  }

  /**
   * Build empty state row element for Create Purchase Order items table (#newPoItemsTbody).
   * @returns {HTMLTableRowElement}
   */
  static buildEmptyRow() {
    const emptyRow = document.createElement("tr");
    emptyRow.id = "newPoEmptyStateRow";
    emptyRow.innerHTML = `
      <td colspan="6" style="text-align: center; padding: 36px 20px; background: rgba(0, 0, 0, 0.015); border-radius: 8px;">
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(22, 119, 255, 0.08); display: flex; align-items: center; justify-content: center; color: #1677ff; font-size: 22px;">
            <i class="fa-solid fa-boxes-stacked"></i>
          </div>
          <div>
            <div style="font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 4px;">
              No Materials Added Yet
            </div>
            <div style="font-size: 12px; color: var(--text-muted); max-width: 380px; line-height: 1.5;">
              Use the <strong>Search &amp; Add Material Item</strong> selector above to search from database items and add them to this Purchase Order.
            </div>
          </div>
          <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" style="margin-top: 4px;" onclick="window.grnManager.addNewPoRow()">
            <i class="fa-solid fa-magnifying-glass"></i> Search &amp; Add Item
          </button>
        </div>
      </td>
    `;
    return emptyRow;
  }

  /**
   * Build supplier search dropdown HTML (#newPoSuppDropdown).
   * @param {Array} matches
   * @param {string} query
   * @param {Function} escapeHtmlFn
   * @returns {string}
   */
  static buildSupplierDropdownHtml(matches = [], query = "", escapeHtmlFn = (s) => s) {
    if (matches.length === 0) {
      return `
        <div style="padding: 12px 14px; text-align: center; color: var(--text-muted); font-size: 12px;">
          <i class="fa-solid fa-truck-field" style="margin-right: 6px; opacity: 0.6;"></i>
          No active suppliers found matching "<strong>${escapeHtmlFn(query)}</strong>"
        </div>`;
    }

    return matches.slice(0, 35).map(s => {
      const phone = s.mobile || s.phone || "No Phone";
      const code = s.code || (s.id ? `SUP-${String(s.id).padStart(3, "0")}` : "SUP");
      return `
        <div class="newpo-supp-item" data-supplier-id="${s.id || ""}" data-supplier-name="${escapeHtmlFn(s.name)}" style="padding: 9px 12px; border-bottom: 1px solid var(--border-subtle, rgba(0,0,0,0.06)); cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.15s ease;">
          <div style="min-width: 0;">
            <strong style="color: var(--text); font-size: 13px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtmlFn(s.name)}</strong>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 1px;">${escapeHtmlFn(phone)} • ${escapeHtmlFn(code)}</div>
          </div>
          <span style="font-size: 11px; font-weight: 700; color: #1677ff; flex-shrink: 0;">Select &rarr;</span>
        </div>`;
    }).join("");
  }

  /**
   * Build catalog item dropdown row element (#newPoItemSearchDropdown).
   * @param {Object} item
   * @param {Function} escapeHtmlFn
   * @param {Function} onSelect
   * @returns {HTMLDivElement}
   */
  static buildCatalogDropdownRow(item, escapeHtmlFn = (s) => s, onSelect = null) {
    const row = document.createElement("div");
    row.style.cssText =
      "padding: 9px 12px; cursor: pointer; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; transition: all 0.15s ease;";

    const costBadge = item.unitPrice > 0
      ? `<span style="font-size: 11.5px; font-weight: 700; color: #52c41a;">Rs. ${Number(item.unitPrice).toFixed(2)}</span>`
      : `<span style="font-size: 11px; color: var(--text-muted);">Est. Rs. 0.00</span>`;

    row.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        <span class="inv-item-code" style="font-size: 11px; font-weight: 700; color: #1677ff;">${item.code}</span>
        <span style="font-weight: 600; font-size: 12.5px; color: var(--text);">${item.name}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
        ${costBadge}
        <span class="inv-cat-pill" style="font-size: 10px; padding: 2px 7px;">${escapeHtmlFn(item.category)}${item.subcategory ? ` / ${escapeHtmlFn(item.subcategory)}` : ""}</span>
        <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" style="font-size: 11px; height: 24px; padding: 0 8px; pointer-events: none;">
          <i class="fa-solid fa-plus"></i> Add
        </button>
      </div>
    `;

    row.addEventListener("mouseenter", () => (row.style.background = "rgba(22, 119, 255, 0.08)"));
    row.addEventListener("mouseleave", () => (row.style.background = "transparent"));
    if (typeof onSelect === "function") {
      row.addEventListener("click", () => onSelect(item));
    }

    return row;
  }
}

export default CreatePoItemRowBuilder;
