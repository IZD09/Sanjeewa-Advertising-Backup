/**
 * SanjeewaAdvertising - Base Table Loader
 *
 * Universal foundation class for loading, filtering, paginating, and rendering data tables.
 * Used across modules (Orders, Payments, Inventory, GRN).
 */

export class BaseTableLoader {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.tbodyId=""] - DOM ID of <tbody> element
   * @param {string} [options.paginationInfoId="paginationInfo"] - DOM ID of pagination info container
   * @param {string} [options.paginationControlsId="paginationControls"] - DOM ID of pagination controls container
   * @param {number} [options.pageSize=8] - Default rows per page
   * @param {number} [options.colspan=10] - Default colspan for empty/loading rows
   * @param {string} [options.emptyIcon="fa-folder-open"] - FontAwesome icon class for empty state
   * @param {string} [options.emptyMessage="No records matching your criteria"]
   * @param {Function} [options.onPageChange] - Callback invoked when page is changed
   * @param {Function} [options.rowBuilder] - Subclass of BaseTableRowBuilder or row render function
   */
  constructor(options = {}) {
    this.tbodyId = options.tbodyId || "";
    this.paginationInfoId = options.paginationInfoId || "paginationInfo";
    this.paginationControlsId = options.paginationControlsId || "paginationControls";
    this.pageSize = options.pageSize || 8;
    this.colspan = options.colspan || 10;
    this.emptyIcon = options.emptyIcon || "fa-folder-open";
    this.emptyMessage = options.emptyMessage || "No records matching your criteria";
    this.onPageChange = options.onPageChange || (() => {});
    this.rowBuilder = options.rowBuilder || null;

    this.currentPage = 1;
    this.searchTerm = "";
    this.filters = {};
  }

  /**
   * Retrieve the table body element.
   * @returns {HTMLElement|null}
   */
  getTbody() {
    return typeof document !== "undefined" && this.tbodyId ? document.getElementById(this.tbodyId) : null;
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
   * Slice array for active page view.
   * @param {Array} items
   * @param {number} [page=this.currentPage]
   * @param {number} [size=this.pageSize]
   * @returns {{pageItems: Array, total: number, totalPages: number, activePage: number, pageSize: number}}
   */
  paginate(items = [], page = this.currentPage, size = this.pageSize) {
    const total = items.length;
    const totalPages = Math.ceil(total / size) || 1;
    const activePage = Math.max(1, Math.min(page, totalPages));
    const start = (activePage - 1) * size;
    const pageItems = items.slice(start, start + size);

    return {
      pageItems,
      total,
      totalPages,
      activePage,
      pageSize: size
    };
  }

  /**
   * Render pagination summary text and page buttons.
   * @param {number} totalCount
   * @param {number} totalPages
   * @param {number} currentPage
   * @param {number} pageSize
   */
  renderPagination(totalCount, totalPages, currentPage, pageSize) {
    const infoElem = document.getElementById(this.paginationInfoId);
    const controlsElem = document.getElementById(this.paginationControlsId);
    if (!infoElem || !controlsElem) return;

    if (totalCount === 0) {
      infoElem.textContent = "Showing 0 records";
      controlsElem.innerHTML = "";
      return;
    }

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalCount);
    infoElem.textContent = `Showing ${start}-${end} of ${totalCount} records`;
    controlsElem.innerHTML = "";

    // Previous Page Button
    const prevBtn = document.createElement("button");
    prevBtn.className = "page-btn";
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) this.onPageChange(currentPage - 1);
    });
    controlsElem.appendChild(prevBtn);

    // Numbered Buttons
    for (let p = 1; p <= totalPages; p++) {
      const pageBtn = document.createElement("button");
      pageBtn.className = `page-btn ${p === currentPage ? "active" : ""}`;
      pageBtn.textContent = String(p);
      pageBtn.addEventListener("click", () => {
        this.onPageChange(p);
      });
      controlsElem.appendChild(pageBtn);
    }

    // Next Page Button
    const nextBtn = document.createElement("button");
    nextBtn.className = "page-btn";
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) this.onPageChange(currentPage + 1);
    });
    controlsElem.appendChild(nextBtn);
  }

  /**
   * Load and render table items with pagination and row creation.
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

