/**
 * SanjeewaAdvertising - Payment Table Builder
 *
 * Implements Builder Pattern (GoF) for Payment Tables:
 * - Dynamic pagination & sorting
 * - Empty state rendering
 * - Integration with InvoicePaymentRowBuilder and GrnPaymentRowBuilder
 */

"use strict";

import { InvoicePaymentRowBuilder } from "./InvoicePaymentRowBuilder.js";
import { GrnPaymentRowBuilder } from "./GrnPaymentRowBuilder.js";

export class PaymentTableBulder {
  /**
   * @param {Object} [config={}]
   * @param {string} [config.tbodyId="payInvoiceTableBody"]
   * @param {string} [config.paginationInfoId="payInvoicePaginationInfo"]
   * @param {string} [config.paginationControlsId="payInvoicePaginationControls"]
   * @param {Function} [config.rowBuilder=InvoicePaymentRowBuilder]
   * @param {Array} [config.data=[]]
   * @param {number} [config.pageSize=8]
   * @param {number} [config.currentPage=1]
   * @param {string} [config.itemLabel="invoices"]
   * @param {string} [config.emptyMessage="No items match your filter criteria."]
   * @param {string} [config.emptyIcon="fa-solid fa-receipt"]
   * @param {Function} [config.onPageChange=null]
   * @param {Function} [config.onRender=null]
   */
  constructor(config = {}) {
    this.tbodyId = config.tbodyId || "payInvoiceTableBody";
    this.paginationInfoId = config.paginationInfoId || "payInvoicePaginationInfo";
    this.paginationControlsId = config.paginationControlsId || "payInvoicePaginationControls";
    this.rowBuilder = config.rowBuilder || InvoicePaymentRowBuilder;
    this.data = Array.isArray(config.data) ? config.data : [];
    this.pageSize = config.pageSize || 8;
    this.currentPage = config.currentPage || 1;
    this.itemLabel = config.itemLabel || "items";
    this.emptyMessage = config.emptyMessage || "No items match your filter criteria.";
    this.emptyIcon = config.emptyIcon || "fa-solid fa-folder-open";
    this.filterFn = typeof config.filterFn === "function" ? config.filterFn : null;
    this.onPageChange = typeof config.onPageChange === "function" ? config.onPageChange : null;
    this.onRender = typeof config.onRender === "function" ? config.onRender : null;
  }

  /* ==========================================================================
     Fluent Setters (Chainable)
     ========================================================================== */

  /**
   * Set raw dataset or builder instances.
   * @param {Array} list
   * @returns {PaymentTableBulder}
   */
  setData(list = []) {
    this.data = Array.isArray(list) ? list : [];
    return this;
  }

  /**
   * Set target table body DOM ID.
   * @param {string} id
   * @returns {PaymentTableBulder}
   */
  setTbodyId(id) {
    this.tbodyId = id;
    return this;
  }

  /**
   * Set pagination element IDs.
   * @param {string} infoId
   * @param {string} controlsId
   * @returns {PaymentTableBulder}
   */
  setPaginationElements(infoId, controlsId) {
    this.paginationInfoId = infoId;
    this.paginationControlsId = controlsId;
    return this;
  }

  /**
   * Set RowBuilder class (InvoicePaymentRowBuilder or GrnPaymentRowBuilder).
   * @param {Function} builderClass
   * @returns {PaymentTableBulder}
   */
  setRowBuilder(builderClass) {
    this.rowBuilder = builderClass;
    return this;
  }

  /**
   * Set page size (rows per page).
   * @param {number} size
   * @returns {PaymentTableBulder}
   */
  setPageSize(size) {
    const s = parseInt(size, 10);
    this.pageSize = isNaN(s) || s < 1 ? 8 : s;
    return this;
  }

  /**
   * Set active page number.
   * @param {number} page
   * @returns {PaymentTableBulder}
   */
  setPage(page) {
    const p = parseInt(page, 10);
    this.currentPage = isNaN(p) || p < 1 ? 1 : p;
    return this;
  }

  /**
   * Set filter callback function.
   * @param {Function} fn
   * @returns {PaymentTableBulder}
   */
  setFilter(fn) {
    this.filterFn = typeof fn === "function" ? fn : null;
    return this;
  }

  /**
   * Set descriptive item label for pagination info (e.g. "invoices", "stock GRNs").
   * @param {string} label
   * @returns {PaymentTableBulder}
   */
  setItemLabel(label) {
    this.itemLabel = label || "items";
    return this;
  }

  /**
   * Set empty state text and font-awesome icon class.
   * @param {string} message
   * @param {string} [iconClass]
   * @returns {PaymentTableBulder}
   */
  setEmptyState(message, iconClass = null) {
    this.emptyMessage = message;
    if (iconClass) this.emptyIcon = iconClass;
    return this;
  }

  /**
   * Set callback triggered whenever the page changes.
   * @param {Function} cb
   * @returns {PaymentTableBulder}
   */
  setOnPageChange(cb) {
    this.onPageChange = typeof cb === "function" ? cb : null;
    return this;
  }

  /* ==========================================================================
     Data Queries & Slicing
     ========================================================================== */

  /**
   * Get all items after applying optional filter predicate.
   * @returns {Array}
   */
  getFilteredData() {
    if (!this.filterFn) {
      return this.data;
    }
    return this.data.filter(this.filterFn);
  }

  /**
   * Get total count of filtered records.
   * @returns {number}
   */
  getTotalCount() {
    return this.getFilteredData().length;
  }

  /**
   * Get total calculated pages.
   * @returns {number}
   */
  getTotalPages() {
    const total = this.getTotalCount();
    return Math.ceil(total / this.pageSize) || 1;
  }

  /**
   * Get slice of records corresponding to the current page.
   * @returns {Array}
   */
  getCurrentPageItems() {
    const filtered = this.getFilteredData();
    const totalPages = this.getTotalPages();
    if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  /* ==========================================================================
     Table & Pagination Rendering
     ========================================================================== */

  /**
   * Build and render the table body and pagination controls.
   * @returns {PaymentTableBulder}
   */
  render() {
    const tbody = document.getElementById(this.tbodyId);
    if (!tbody) {
      console.warn(`[PaymentTableBulder] Target <tbody> element with id "${this.tbodyId}" not found.`);
      return this;
    }

    const filtered = this.getFilteredData();
    const total = filtered.length;
    const totalPages = Math.ceil(total / this.pageSize) || 1;

    if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }

    const pageItems = this.getCurrentPageItems();

    // 1. Render empty state if no records exist
    if (pageItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9">
            <div class="po-empty-state">
              <i class="${this.emptyIcon}"></i>
              <p>${this.emptyMessage}</p>
            </div>
          </td>
        </tr>`;
      this.renderPagination(0, 1);
      return this;
    }

    // 2. Build rows using the configured RowBuilder class
    const rowBuilders = pageItems.map((item) => {
      if (item && typeof item.build === "function") {
        return item;
      }
      return this.rowBuilder.from ? this.rowBuilder.from(item) : new this.rowBuilder(item);
    });

    tbody.innerHTML = "";
    rowBuilders.forEach((builder) => {
      const entity = typeof builder.build === "function" ? builder.build() : builder;
      if (entity && typeof entity.render === "function") {
        const rendered = entity.render();
        if (rendered instanceof Node) {
          tbody.appendChild(rendered);
        } else {
          tbody.insertAdjacentHTML("beforeend", rendered);
        }
      } else if (typeof entity === "string") {
        tbody.insertAdjacentHTML("beforeend", entity);
      }
    });

    // 3. Render pagination controls matching the Place Order design
    this.renderPagination(total, totalPages);

    if (this.onRender) {
      this.onRender(this);
    }

    return this;
  }

  /**
   * Alias for render().
   * @returns {PaymentTableBulder}
   */
  build() {
    return this.render();
  }

  /**
   * Render Place Order style pagination controls.
   * @param {number} totalCount
   * @param {number} totalPages
   */
  renderPagination(totalCount, totalPages) {
    const infoElem = document.getElementById(this.paginationInfoId);
    const controlsElem = document.getElementById(this.paginationControlsId);

    if (infoElem) {
      if (totalCount === 0) {
        infoElem.textContent = `Showing 0 ${this.itemLabel}`;
      } else {
        const start = (this.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(this.currentPage * this.pageSize, totalCount);
        infoElem.textContent = `Showing ${start}-${end} of ${totalCount} ${this.itemLabel}`;
      }
    }

    if (!controlsElem) return;

    controlsElem.innerHTML = "";
    if (totalCount === 0) return;

    // Previous Button (<)
    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "page-btn";
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prevBtn.disabled = this.currentPage === 1;
    prevBtn.title = "Previous Page";
    prevBtn.addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.render();
        if (this.onPageChange) this.onPageChange(this.currentPage);
      }
    });
    controlsElem.appendChild(prevBtn);

    // Page Number Buttons with Smart Ellipsis Windowing
    const maxButtons = 7;
    let pageNumbers = [];

    if (totalPages <= maxButtons) {
      for (let p = 1; p <= totalPages; p++) {
        pageNumbers.push(p);
      }
    } else {
      const pageSet = new Set([
        1,
        totalPages,
        this.currentPage,
        this.currentPage - 1,
        this.currentPage + 1
      ]);
      pageNumbers = Array.from(pageSet).filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
    }

    let prevNum = 0;
    pageNumbers.forEach((p) => {
      if (prevNum && p - prevNum > 1) {
        const dots = document.createElement("span");
        dots.style.cssText = "padding: 0 4px; font-size: 11px; color: var(--text-muted); user-select: none;";
        dots.textContent = "...";
        controlsElem.appendChild(dots);
      }

      const pBtn = document.createElement("button");
      pBtn.type = "button";
      pBtn.className = `page-btn ${p === this.currentPage ? "active" : ""}`;
      pBtn.textContent = p;
      pBtn.addEventListener("click", () => {
        this.currentPage = p;
        this.render();
        if (this.onPageChange) this.onPageChange(this.currentPage);
      });
      controlsElem.appendChild(pBtn);
      prevNum = p;
    });

    // Next Button (>)
    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "page-btn";
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    nextBtn.disabled = this.currentPage === totalPages;
    nextBtn.title = "Next Page";
    nextBtn.addEventListener("click", () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.render();
        if (this.onPageChange) this.onPageChange(this.currentPage);
      }
    });
    controlsElem.appendChild(nextBtn);
  }

  /* ==========================================================================
     Static Factory Methods
     ========================================================================== */

  /**
   * Instantiate a PaymentTableBulder pre-configured for Invoice Payments.
   * @param {Array} [data=[]]
   * @param {Object} [options={}]
   * @returns {PaymentTableBulder}
   */
  static forInvoicePayments(data = [], options = {}) {
    return new PaymentTableBulder({
      tbodyId: "payInvoiceTableBody",
      paginationInfoId: "payInvoicePaginationInfo",
      paginationControlsId: "payInvoicePaginationControls",
      rowBuilder: InvoicePaymentRowBuilder,
      data,
      pageSize: 8,
      itemLabel: "invoices",
      emptyMessage: "No Invoice Payments match your filter criteria.",
      emptyIcon: "fa-solid fa-receipt",
      ...options
    });
  }

  /**
   * Instantiate a PaymentTableBulder pre-configured for Supplier Stock / GRN Payments.
   * @param {Array} [data=[]]
   * @param {Object} [options={}]
   * @returns {PaymentTableBulder}
   */
  static forGrnPayments(data = [], options = {}) {
    return new PaymentTableBulder({
      tbodyId: "payGrnTableBody",
      paginationInfoId: "payGrnPaginationInfo",
      paginationControlsId: "payGrnPaginationControls",
      rowBuilder: GrnPaymentRowBuilder,
      data,
      pageSize: 8,
      itemLabel: "stock GRNs",
      emptyMessage: "No GRN Stock Payments match your filter criteria.",
      emptyIcon: "fa-solid fa-truck-ramp-box",
      ...options
    });
  }

  /**
   * Build and immediately render Invoice Payment table with data.
   * @param {Array} [data=[]]
   * @param {Object} [options={}]
   * @returns {PaymentTableBulder}
   */
  static renderInvoiceTable(data = [], options = {}) {
    const builder = PaymentTableBulder.forInvoicePayments(data, options);
    return builder.render();
  }

  /**
   * Build and immediately render GRN Payment table with data.
   * @param {Array} [data=[]]
   * @param {Object} [options={}]
   * @returns {PaymentTableBulder}
   */
  static renderGrnTable(data = [], options = {}) {
    const builder = PaymentTableBulder.forGrnPayments(data, options);
    return builder.render();
  }
}

export const PaymentTableBuilder = PaymentTableBulder;
export const TableBuilder = PaymentTableBulder;

// Global browser attachment
if (typeof window !== "undefined") {
  window.PaymentTableBulder = PaymentTableBulder;
  window.PaymentTableBuilder = PaymentTableBulder;
  window.TableBuilder = PaymentTableBulder;
}

export default PaymentTableBulder;

