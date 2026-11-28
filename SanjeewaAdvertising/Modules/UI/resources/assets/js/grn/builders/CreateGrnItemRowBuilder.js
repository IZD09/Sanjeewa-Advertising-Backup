/**
 * SanjeewaAdvertising - Create GRN Received Material Item Row Builder
 *
 * Implements Builder Pattern (GoF) extending Core BaseTableRowBuilder:
 * - CreateGrnItemEntity: Entity model encapsulating a received material item row in Create GRN Modal (#grnModalItemsTbody).
 * - CreateGrnItemRowBuilder: Fluent builder for received material rows, empty state, and removed item chips.
 */

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";

/**
 * CreateGrnItemEntity - Entity model for a Received Material Item row in Create GRN Modal
 */
export class CreateGrnItemEntity {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  /**
   * Escape HTML helper
   * @param {*} str
   * @returns {string}
   */
  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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
   * Render Received Material Item table row (<tr>).
   * @returns {HTMLTableRowElement}
   */
  render() {
    const tr = document.createElement("tr");
    const index = this.index ?? 0;
    const availableBrands = Array.isArray(this.availableBrands) ? this.availableBrands : [];
    const existingBatches = Array.isArray(this.existingBatches) ? this.existingBatches : [];
    const isFullyDelivered = this.qty_ordered > 0 && this.qty_received_prev >= this.qty_ordered;

    const brandOptionsHtml = availableBrands.length > 0
      ? availableBrands.map(b =>
          `<option value="${b.id}" ${Number(b.id) === Number(this.brands_id) ? "selected" : ""}>${this.escapeHtml(b.brand)}</option>`
        ).join("")
      : `<option value="${this.brands_id || 1}">Default Brand</option>`;

    const isExistingBatchMode = this.batch_mode === "EXISTING" && existingBatches.length > 0;

    const batchSelectHtml = isExistingBatchMode
      ? `<select class="grn-inline-input grn-modal-batch-id-select"
                 data-item-index="${index}"
                 aria-label="Select existing batch for ${this.escapeHtml(this.item_name)}"
                 style="height: 28px; font-size: 11.5px; padding: 0 6px; width: 100%; margin-top: 4px; border-color: #1677ff;">
           <option value="">-- Select Batch --</option>
           ${existingBatches.map(b =>
             `<option value="${b.id}" ${Number(b.id) === Number(this.batch_id) ? "selected" : ""}>${this.escapeHtml(b.batch_no || `BAT-${b.id}`)}</option>`
           ).join("")}
         </select>`
      : "";

    const unitCostNum = parseFloat(this.unit_cost) || 0;
    const totalNum = parseFloat(this.total) || 0;

    tr.innerHTML = `
      <td>
        <div style="font-weight: 600; color: var(--text); font-size: 12.5px;">${this.item_name}</div>
        <div style="font-size: 11px; color: var(--text-muted); font-family: ui-monospace;">SKU: ${this.item_code}</div>
      </td>
      <td>
        <span class="grn-status-badge info" style="font-size: 11px; font-family: ui-monospace; font-weight: 600; padding: 2px 6px;">
          ${this.po_number}
        </span>
      </td>
      <td>
        <select class="grn-inline-input grn-modal-brand-select"
                data-item-index="${index}"
                aria-label="Brand for ${this.escapeHtml(this.item_name)}"
                style="height: 30px; font-size: 12px; padding: 0 6px; width: 100%; min-width: 120px;">
          ${brandOptionsHtml}
        </select>
      </td>
      <td>
        <div style="display: flex; flex-direction: column;">
          <select class="grn-inline-input grn-modal-batch-mode-select"
                  data-item-index="${index}"
                  aria-label="Stock or Batch type for ${this.escapeHtml(this.item_name)}"
                  style="height: 30px; font-size: 12px; padding: 0 6px; width: 100%; min-width: 155px;">
            <option value="NEW" ${!isExistingBatchMode ? "selected" : ""}>New Stock (New Batch)</option>
            <option value="EXISTING" ${isExistingBatchMode ? "selected" : ""} ${existingBatches.length === 0 ? "disabled" : ""}>
              Existing Batch${existingBatches.length === 0 ? " (No Batches)" : ` (${existingBatches.length})`}
            </option>
          </select>
          ${batchSelectHtml}
        </div>
      </td>
      <td>
        <span class="grn-unit-badge" style="background: var(--surface-2); border: 1px solid var(--border); padding: 2px 6px; border-radius: 4px; font-size: 11px;">
          ${this.unit}
        </span>
      </td>
      <td class="text-right" style="font-weight: 600; color: var(--text-muted); font-size: 12px;">
        ${this.qty_ordered}
      </td>
      <td class="text-right" style="color: ${isFullyDelivered ? "#52c41a" : "#faad14"}; font-weight: 600; font-size: 12px;">
        ${this.qty_received_prev}
      </td>
      <td class="text-right">
        <input type="number"
               id="grnItemQty_${index}"
               name="grn_items[${index}][qty]"
               aria-label="Receiving quantity for ${this.item_name}"
               class="grn-inline-input text-right grn-modal-qty-input"
               data-item-index="${index}"
               min="0.001"
               step="any"
               value="${this.receiving_qty}"
               style="width: 90px; height: 30px; font-weight: 700; color: #1677ff; text-align: right; font-size: 12.5px;"
               required>
      </td>
      <td class="text-right">
        <input type="number"
               id="grnItemCost_${index}"
               name="grn_items[${index}][cost]"
               aria-label="Unit purchase cost for ${this.item_name}"
               class="grn-inline-input text-right grn-modal-cost-input"
               data-item-index="${index}"
               min="0"
               step="0.01"
               value="${unitCostNum.toFixed(2)}"
               style="width: 100px; height: 30px; font-weight: 600; text-align: right; font-size: 12px;"
               required>
      </td>
      <td class="text-right" style="font-weight: 700; color: var(--text); font-size: 12.5px;">
        <span class="grn-modal-row-total" id="grnModalRowTotal_${index}">
          ${this.formatCurrency(totalNum)}
        </span>
      </td>
      <td class="text-center" style="text-align: center; vertical-align: middle;">
        <button type="button"
                class="ant-btn-action text-danger grn-modal-remove-item-btn"
                data-item-index="${index}"
                title="Remove this item from GRN"
                style="display: inline-flex; align-items: center; justify-content: center; border-color: rgba(255, 77, 79, 0.35); color: #ff4d4f; background: rgba(255, 77, 79, 0.12); height: 26px; width: 26px; padding: 0; gap: 0; line-height: 1; border-radius: 4px; box-sizing: border-box; cursor: pointer; margin: 0 auto;">
          <i class="fa-solid fa-trash-can" style="font-size: 11px; line-height: 1; display: inline-flex; align-items: center; justify-content: center; margin: 0;"></i>
        </button>
      </td>
    `;

    return tr;
  }
}

/**
 * CreateGrnItemRowBuilder - Fluent builder extending BaseTableRowBuilder
 */
export class CreateGrnItemRowBuilder extends BaseTableRowBuilder {
  constructor(initialData = null) {
    super(initialData);
  }

  reset() {
    super.reset();
    this._data = {
      index: 0,
      po_id: null,
      po_number: "",
      stock_items_id: null,
      item_id: null,
      item_code: "",
      item_name: "",
      unit: "Units",
      qty_ordered: 0,
      qty_received_prev: 0,
      receiving_qty: 1,
      unit_cost: 0,
      total: 0,
      brands_id: null,
      batch_mode: "NEW",
      batch_id: null,
      availableBrands: [],
      existingBatches: [],
      currencyFormatter: null
    };
    return this;
  }

  setIndex(index) {
    return this.set("index", index);
  }

  setAvailableBrands(brands = []) {
    return this.set("availableBrands", Array.isArray(brands) ? brands : []);
  }

  setExistingBatches(batches = []) {
    return this.set("existingBatches", Array.isArray(batches) ? batches : []);
  }

  setCurrencyFormatter(fn) {
    return this.set("currencyFormatter", fn);
  }

  build() {
    return new CreateGrnItemEntity(this._data);
  }

  /**
   * Build empty state HTML for Received Material Items table (#grnModalItemsTbody).
   * @param {number} [removedCount=0]
   * @returns {string}
   */
  static buildEmptyRowHtml(removedCount = 0) {
    const hasRemoved = removedCount > 0;
    const emptyTitle = hasRemoved ? "All Materials Removed from Receiving List" : "No Materials Loaded Yet";
    const emptySubtitle = hasRemoved
      ? `You have removed all ${removedCount} items from linked Purchase Orders. Use the 'Removed Items' panel above to re-add items, or link another Purchase Order.`
      : "Link one or more Purchase Orders above to automatically populate material line items and pending quantities.";

    return `
      <tr id="grnModalEmptyRow">
        <td colspan="11" style="text-align: center; padding: 32px 16px; background: rgba(0, 0, 0, 0.015); border-radius: 6px;">
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: ${hasRemoved ? "rgba(250, 173, 20, 0.12)" : "rgba(22, 119, 255, 0.08)"}; display: flex; align-items: center; justify-content: center; color: ${hasRemoved ? "#d46b08" : "#1677ff"}; font-size: 18px;">
              <i class="${hasRemoved ? "fa-solid fa-clock-rotate-left" : "fa-solid fa-boxes-stacked"}"></i>
            </div>
            <div style="font-size: 13px; font-weight: 700; color: var(--text);">
              ${emptyTitle}
            </div>
            <div style="font-size: 11.5px; color: var(--text-muted); max-width: 420px; line-height: 1.4;">
              ${emptySubtitle}
            </div>
          </div>
        </td>
      </tr>
    `;
  }

  /**
   * Build a removed item chip element for #grnRemovedItemsChipsContainer.
   * @param {Object} item
   * @param {number} index
   * @param {Function} formatCurrencyFn
   * @param {Function} escapeHtmlFn
   * @returns {HTMLDivElement}
   */
  static buildRemovedItemChip(item, index, formatCurrencyFn, escapeHtmlFn = (s) => s) {
    const chip = document.createElement("div");
    chip.style.cssText =
      "display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1.5px dashed #ffd591; padding: 5px 10px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);";

    const costFmt = typeof formatCurrencyFn === "function"
      ? formatCurrencyFn(item.unit_cost)
      : `Rs. ${Number(item.unit_cost || 0).toFixed(2)}`;

    chip.innerHTML = `
      <span style="font-weight: 700; color: #1677ff; font-family: ui-monospace; font-size: 11px; background: rgba(22,119,255,0.08); padding: 1px 6px; border-radius: 4px;">
        ${escapeHtmlFn(item.po_number)}
      </span>
      <div style="display: flex; flex-direction: column; min-width: 0;">
        <span style="font-weight: 600; font-size: 12px; color: var(--text);">${escapeHtmlFn(item.item_name)}</span>
        <span style="font-size: 10.5px; color: var(--text-muted);">
          Ordered: ${item.qty_ordered} &bull; Rec: <strong>${item.receiving_qty} ${escapeHtmlFn(item.unit)}</strong> @ ${costFmt}
        </span>
      </div>
      <button type="button" class="ant-btn ant-btn-primary ant-btn-sm grn-readd-single-item-btn" data-removed-index="${index}" style="height: 24px; font-size: 11px; padding: 0 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;" title="Re-add this item to Received Materials">
        <i class="fa-solid fa-plus"></i> Re-add
      </button>
    `;

    return chip;
  }
}

export default CreateGrnItemRowBuilder;
