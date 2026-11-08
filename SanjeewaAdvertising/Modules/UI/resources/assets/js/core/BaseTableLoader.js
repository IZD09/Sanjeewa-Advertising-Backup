/**
 * SanjeewaAdvertising - Base Table Loader
 *
 * Universal foundation class for loading, filtering, paginating, and rendering data tables.
 * Extends BasePaginationHandler core class.
 * Used across modules (Orders, Payments, Inventory, GRN).
 */

import { BasePaginationHandler } from "./BasePaginationHandler.js";

export class BaseTableLoader extends BasePaginationHandler {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.tbodyId=""] - DOM ID of <tbody> element
   * @param {string} [options.paginationInfoId="paginationInfo"] - DOM ID of pagination info container
   * @param {string} [options.paginationControlsId="paginationControls"] - DOM ID of pagination controls container
   * @param {number} [options.pageSize=20] - Default rows per page (default: 20)
   * @param {number} [options.colspan=10] - Default colspan for empty/loading rows
   * @param {string} [options.emptyIcon="fa-folder-open"] - FontAwesome icon class for empty state
   * @param {string} [options.emptyMessage="No records matching your criteria"]
   * @param {string} [options.itemLabel="records"] - Noun for records in info display
   * @param {Function} [options.onPageChange] - Callback invoked when page is changed
   * @param {Function} [options.rowBuilder] - Subclass of BaseTableRowBuilder or row render function
   */
  constructor(options = {}) {
    super({
      paginationInfoId: options.paginationInfoId || "paginationInfo",
      paginationControlsId: options.paginationControlsId || "paginationControls",
      pageSize: options.pageSize || 20,
      itemLabel: options.itemLabel || "records",
      onPageChange: options.onPageChange || (() => {}),
    });

    this.tbodyId = options.tbodyId || "";
    this.colspan = options.colspan || 10;
    this.emptyIcon = options.emptyIcon || "fa-folder-open";
    this.emptyMessage = options.emptyMessage || "No records matching your criteria";
    this.rowBuilder = options.rowBuilder || null;

    this.searchTerm = "";
    this.filters = {};
  }

  /**
   * Retrieve the table body element.
   * @returns {HTMLElement|null}
   */
  getTbody() {
    return typeof document !== "undefined" && this.tbodyId
      ? document.getElementById(this.tbodyId)
      : null;
  }

  /**
   * Display loading spinner row inside table body.
   * @param {string} [message="Loading records..."]
   */
  showLoading(message = "Loading records...") {
    const tbody = this.getTbody();
    if (!tbody) return;
    tbody.innerHTML = `
      <tr>
        <td colspan="${this.colspan}">
          <div class="po-empty-state" style="padding: 32px 16px;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: var(--po-orange, #ff6b00);"></i>
            <p style="margin-top: 10px;">${message}</p>
          </div>
        </td>
      </tr>
    `;
  }

  /**
   * Display empty state row inside table body.
   * @param {string} [message]
   * @param {string} [icon]
   */
  renderEmptyState(message = null, icon = null) {
    const tbody = this.getTbody();
    if (!tbody) return;
    const msg = message || this.emptyMessage;
    const icn = icon || this.emptyIcon;
    tbody.innerHTML = `
      <tr>
        <td colspan="${this.colspan}">
          <div class="po-empty-state">
            <i class="fa-solid ${icn}"></i>
            <p>${msg}</p>
          </div>
        </td>
      </tr>
    `;
  }

  /**
   * Load and render table items with pagination and row creation.
   * Prevents browser reload on page navigation.
   *
   * @param {Array} items
   * @param {Function} [renderRow=null] - Optional custom row renderer function (item, index) => HTMLElement|string
   * @param {number} [page=this.currentPage]
   * @param {number} [size=this.pageSize]
   */
  loadTable(items = [], renderRow = null, page = this.currentPage, size = this.pageSize) {
    const tbody = this.getTbody();
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!items || items.length === 0) {
      this.renderEmptyState();
      this.renderPagination(0, 1, 1, size);
      return;
    }

    const { pageItems, total, totalPages, activePage } = this.paginate(items, page, size);

    pageItems.forEach((item, index) => {
      let tr = null;
      if (typeof renderRow === "function") {
        tr = renderRow(item, index);
      } else if (typeof item?.render === "function") {
        tr = item.render();
      } else if (this.rowBuilder) {
        tr = new this.rowBuilder(item).render();
      }

      if (tr instanceof HTMLElement) {
        tbody.appendChild(tr);
      } else if (typeof tr === "string") {
        tbody.insertAdjacentHTML("beforeend", tr);
      }
    });

    this.renderPagination(total, totalPages, activePage, size);
  }

  /**
   * Clear table contents.
   */
  clear() {
    const tbody = this.getTbody();
    if (tbody) tbody.innerHTML = "";
  }
}

export const TableLoader = BaseTableLoader;
export const BaseTableHandler = BaseTableLoader;
export default BaseTableLoader;
