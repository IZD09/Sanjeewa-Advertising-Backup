/**
 * SanjeewaAdvertising - Create GRN Linked Purchase Order Row Builder
 *
 * Implements Builder Pattern (GoF) extending Core BaseTableRowBuilder:
 * - CreateGrnLinkedPoEntity: Entity model encapsulating linked PO row in Create GRN Modal (#grnModalPoTableBody).
 * - CreateGrnPoRowBuilder: Fluent builder for linked PO rows, empty state, supplier dropdown items, and PO chips.
 */

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";

/**
 * CreateGrnLinkedPoEntity - Entity model for a Linked Purchase Order row in Create GRN Modal
 */
export class CreateGrnLinkedPoEntity {
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
   * Render linked Purchase Order table row (<tr>).
   * @returns {HTMLTableRowElement}
   */
  render() {
    const tr = document.createElement("tr");
    const index = this.index ?? 0;
    const poNumber = this.po_number || "";
    const poTotalFormatted = this.formatCurrency(this.total_amount || 0);

    const statusBadge =
      this.status === "Partial"
        ? `<span class="grn-status-badge partial" style="font-size: 10px; padding: 2px 6px;">Partial</span>`
        : `<span class="grn-status-badge pending" style="font-size: 10px; padding: 2px 6px;">Pending</span>`;

    tr.innerHTML = `
      <td>
        <strong style="color: #1677ff; font-family: ui-monospace; font-size: 12.5px;">${poNumber}</strong>
      </td>
      <td>
        <div style="font-weight: 600; font-size: 12.5px; color: var(--text);">${this.supplier_name || "Supplier"}</div>
        <div style="font-size: 11px; color: var(--text-muted);">${this.supplier_contact || "No Contact"}</div>
      </td>
      <td style="font-size: 12px; color: var(--text-muted);">${this.order_date || "-"}</td>
      <td class="text-right" style="font-weight: 600; font-size: 12.5px;">${poTotalFormatted}</td>
      <td>${statusBadge}</td>
      <td>
        <input type="text"
               id="grnPoInvoice_${index}"
               name="po_invoice[${this.id || index}]"
               aria-label="Supplier invoice number for Purchase Order ${poNumber}"
               class="grn-inline-input grn-po-invoice-input"
               data-po-index="${index}"
               value="${this.supplier_invoice || ""}"
               placeholder="E.g. INV-${poNumber.replace(/\D+/g, "")}"
               style="height: 30px; font-size: 12px; padding: 0 8px; width: 100%;">
      </td>
      <td class="text-center" style="text-align: center; vertical-align: middle;">
        <button type="button"
                class="ant-btn-action text-danger grn-remove-po-btn"
                data-po-number="${poNumber}"
                title="Remove this Purchase Order and its items from GRN"
                style="display: inline-flex; align-items: center; justify-content: center; border-color: rgba(255, 77, 79, 0.35); color: #ff4d4f; background: rgba(255, 77, 79, 0.12); height: 28px; width: 28px; padding: 0; gap: 0; line-height: 1; border-radius: 4px; box-sizing: border-box; cursor: pointer; margin: 0 auto;">
          <i class="fa-solid fa-trash-can" style="font-size: 12px; line-height: 1; display: inline-flex; align-items: center; justify-content: center; margin: 0;"></i>
        </button>
      </td>
    `;

    return tr;
  }
}

/**
 * CreateGrnPoRowBuilder - Fluent builder extending BaseTableRowBuilder
 */
export class CreateGrnPoRowBuilder extends BaseTableRowBuilder {
  constructor(initialData = null) {
    super(initialData);
  }

  reset() {
    super.reset();
    this._data = {
      id: null,
      index: 0,
      po_number: "",
      supplier_name: "Supplier",
      supplier_contact: "",
      order_date: "",
      total_amount: 0,
      status: "Pending",
      supplier_invoice: "",
      items: [],
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
    return new CreateGrnLinkedPoEntity(this._data);
  }

  /**
   * Build empty state HTML for Linked Purchase Orders table (#grnModalPoTableBody).
   * @returns {string}
   */
  static buildEmptyRowHtml() {
    return `
      <tr id="grnModalPoEmptyRow">
        <td colspan="7" style="text-align: center; padding: 26px 16px; background: rgba(0, 0, 0, 0.015); border-radius: 6px;">
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(22, 119, 255, 0.08); display: flex; align-items: center; justify-content: center; color: #1677ff; font-size: 17px;">
              <i class="fa-solid fa-clipboard-list"></i>
            </div>
            <div style="font-size: 13px; font-weight: 700; color: var(--text);">
              No Purchase Orders Linked Yet
            </div>
            <div style="font-size: 11.5px; color: var(--text-muted); max-width: 380px; line-height: 1.4;">
              Use the search selector above to search and select one or more active Purchase Orders.
            </div>
          </div>
        </td>
      </tr>
    `;
  }

  /**
   * Build Supplier dropdown HTML for Create GRN Modal (#grnCreateSuppDropdown).
   * @param {Array} matches
   * @param {string} query
   * @param {Function} getApprovedCountFn
   * @param {Function} escapeHtmlFn
   * @returns {string}
   */
  static buildSupplierDropdownHtml(matches = [], query = "", getApprovedCountFn = () => 0, escapeHtmlFn = (s) => s) {
    const cleanQuery = String(query || "").trim();
    if (matches.length === 0) {
      return `
        <div style="padding: 12px 14px; text-align: center; color: var(--text-muted); font-size: 12px;">
          <i class="fa-solid fa-truck-field" style="margin-right: 6px; opacity: 0.6;"></i>
          ${cleanQuery
            ? `No suppliers with Approved POs found matching "<strong>${escapeHtmlFn(query)}</strong>"`
            : "No suppliers with Approved Purchase Orders available"}
        </div>`;
    }

    return matches.slice(0, 35).map(s => {
      const approvedCount = getApprovedCountFn(s);
      const phone = s.mobile || s.phone || "No Phone";
      const code = s.code || (s.id ? `SUP-${String(s.id).padStart(3, "0")}` : "SUP");
      return `
        <div class="grn-create-supp-item" data-supplier-id="${s.id || ""}" data-supplier-name="${escapeHtmlFn(s.name)}" style="padding: 9px 12px; border-bottom: 1px solid var(--border-subtle, rgba(0,0,0,0.06)); cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.15s ease;">
          <div style="min-width: 0;">
            <strong style="color: var(--text); font-size: 13px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtmlFn(s.name)}</strong>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 1px;">${escapeHtmlFn(phone)} • ${escapeHtmlFn(code)}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
            ${approvedCount > 0
              ? `<span style="font-size: 10px; background: rgba(22,119,255,0.1); color: #1677ff; padding: 2px 8px; border-radius: 10px; font-weight: 700;">${approvedCount} Approved PO${approvedCount === 1 ? "" : "s"}</span>`
              : `<span style="font-size: 10px; color: var(--text-muted);">0 Approved</span>`}
            <span style="font-size: 11px; font-weight: 700; color: #1677ff;">Select &rarr;</span>
          </div>
        </div>`;
    }).join("");
  }

  /**
   * Build quick-add Approved PO chips HTML (#grnCreateApprovedPoChips).
   * @param {Array} availablePOs
   * @param {Function} escapeHtmlFn
   * @returns {string}
   */
  static buildApprovedPoChipsHtml(availablePOs = [], escapeHtmlFn = (s) => s) {
    return availablePOs.map(po => {
      const itemCount = po.items ? po.items.length : 0;
      return `
        <button type="button" class="ant-btn ant-btn-default ant-btn-sm grn-create-po-chip" data-po-number="${escapeHtmlFn(po.po_number)}" style="height: 28px; font-size: 11.5px; padding: 0 10px; border-radius: 16px; border: 1px dashed rgba(22,119,255,0.45); background: rgba(22,119,255,0.06); color: var(--text); display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
          <i class="fa-solid fa-plus" style="color: #1677ff; font-size: 10px;"></i>
          <strong>${escapeHtmlFn(po.po_number)}</strong>
          <span style="color: var(--text-muted);">(${itemCount} items)</span>
        </button>`;
    }).join("");
  }

  /**
   * Build active PO search dropdown row element (#grnModalPoSearchDropdown).
   * @param {Object} po
   * @param {Function} formatCurrencyFn
   * @param {Function} onSelect
   * @returns {HTMLDivElement}
   */
  static buildActivePoDropdownRow(po, formatCurrencyFn, onSelect) {
    const row = document.createElement("div");
    row.style.cssText =
      "padding: 9px 12px; cursor: pointer; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; transition: all 0.15s ease;";
    row.onmouseenter = () => (row.style.background = "rgba(22, 119, 255, 0.08)");
    row.onmouseleave = () => (row.style.background = "transparent");

    const poTotalFormatted = typeof formatCurrencyFn === "function"
      ? formatCurrencyFn(po.total_amount || 0)
      : `Rs. ${Number(po.total_amount || 0).toFixed(2)}`;

    const statusBadge =
      po.status === "Partial"
        ? `<span class="grn-status-badge partial" style="font-size: 10px; padding: 1px 6px;">Partial</span>`
        : `<span class="grn-status-badge pending" style="font-size: 10px; padding: 1px 6px;">Pending</span>`;

    const itemCount = Array.isArray(po.items) ? po.items.length : 0;

    row.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        <span style="font-size: 12.5px; font-weight: 700; color: #1677ff; font-family: ui-monospace;">${po.po_number}</span>
        <span style="font-weight: 600; font-size: 13px; color: var(--text);">${po.supplier_name || "Supplier"}</span>
        <span style="font-size: 11px; color: var(--text-muted);">(${itemCount} items &bull; ${po.order_date || ""})</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
        <span style="font-size: 12px; font-weight: 700; color: var(--text);">${poTotalFormatted}</span>
        ${statusBadge}
        <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" style="font-size: 11px; height: 24px; padding: 0 8px; pointer-events: none;">
          <i class="fa-solid fa-plus"></i> Load Items
        </button>
      </div>
    `;

    if (typeof onSelect === "function") {
      row.addEventListener("click", () => onSelect(po));
    }

    return row;
  }
}

export default CreateGrnPoRowBuilder;
