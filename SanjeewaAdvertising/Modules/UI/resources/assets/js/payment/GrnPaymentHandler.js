/**
 * SanjeewaAdvertising - GRN Payments Handler
 * Handles supplier stock acquisition / GRN payment table rendering
 * utilizing the GrnPaymentRowBuilder class, filtering, and search events.
 */

"use strict";

import { TableBuilder } from "./TableBuilder.js";
import { GrnPaymentRowBuilder } from "./GrnPaymentRowBuilder.js";

export class GrnPaymentHandler {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.onFilterChange]
   * @param {Function} [options.getGrnPayments]
   */
  constructor(options = {}) {
    this.onFilterChange = options.onFilterChange || (() => {});
    this.getGrnPayments = options.getGrnPayments || (() => []);

    this.grnSearch = "";
    this.grnStatusFilter = "ALL";
    this.grnMethodFilter = "ALL";
    this._lastPayments = null;

    // TableBuilder instance configured for Supplier Stock / GRN Payments
    this.tableBuilder = TableBuilder.forGrnPayments([], {
      pageSize: options.pageSize || 8,
      onPageChange: () => this.onFilterChange()
    });

    this.bindEvents();
  }

  get currentPage() {
    return this.tableBuilder.currentPage;
  }

  set currentPage(page) {
    this.tableBuilder.setPage(page);
  }

  get pageSize() {
    return this.tableBuilder.pageSize;
  }

  set pageSize(size) {
    this.tableBuilder.setPageSize(size);
  }

  /**
   * Bind event listeners for GRN payment filters.
   */
  bindEvents() {
    const grnSearch = document.getElementById("payGrnSearch");
    if (grnSearch) {
      grnSearch.addEventListener("input", (e) => {
        this.grnSearch = e.target.value.toLowerCase().trim();
        this.tableBuilder.setPage(1);
        this.render();
        this.onFilterChange();
      });
    }

    const grnStatus = document.getElementById("payGrnStatusFilter");
    if (grnStatus) {
      grnStatus.addEventListener("change", (e) => {
        this.grnStatusFilter = e.target.value;
        this.tableBuilder.setPage(1);
        this.render();
        this.onFilterChange();
      });
    }

    const grnMethod = document.getElementById("payGrnMethodFilter");
    if (grnMethod) {
      grnMethod.addEventListener("change", (e) => {
        this.grnMethodFilter = e.target.value;
        this.tableBuilder.setPage(1);
        this.render();
        this.onFilterChange();
      });
    }

    const grnReset = document.getElementById("payGrnResetFilters");
    if (grnReset) {
      grnReset.addEventListener("click", () => {
        this.grnSearch = "";
        this.grnStatusFilter = "ALL";
        this.grnMethodFilter = "ALL";
        this.tableBuilder.setPage(1);
        if (grnSearch) grnSearch.value = "";
        if (grnStatus) grnStatus.value = "ALL";
        if (grnMethod) grnMethod.value = "ALL";
        this.render();
        this.onFilterChange();
      });
    }
  }

  /**
   * Filter GRN payments by search text and dropdown selections.
   * @param {Array} payments
   * @returns {Array}
   */
  getFilteredPayments(payments = null) {
    const list = payments || this._lastPayments || this.getGrnPayments() || [];

    return list.filter((item) => {
      const p = item instanceof GrnPaymentRowBuilder ? item : GrnPaymentRowBuilder.from(item);

      // Search filter
      const matchesSearch =
        !this.grnSearch ||
        (p.grnNumber && p.grnNumber.toLowerCase().includes(this.grnSearch)) ||
        (p.poNumber && p.poNumber.toLowerCase().includes(this.grnSearch)) ||
        (p.supplierName && p.supplierName.toLowerCase().includes(this.grnSearch)) ||
        (p.stockCategory && p.stockCategory.toLowerCase().includes(this.grnSearch)) ||
        (p.ref && p.ref.toLowerCase().includes(this.grnSearch));

      // Status filter
      const matchesStatus =
        this.grnStatusFilter === "ALL" || p.stage === this.grnStatusFilter;

      // Method filter
      const matchesMethod =
        this.grnMethodFilter === "ALL" || p.method === this.grnMethodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }

  /**
   * Render GRN payments table body rows using TableBuilder and GrnPaymentRowBuilder.
   * @param {Array} [payments]
   */
  render(payments = null) {
    if (payments) {
      this._lastPayments = payments;
    }
    const list = payments || this._lastPayments || this.getGrnPayments() || [];
    const filtered = this.getFilteredPayments(list);
    this.tableBuilder.setData(filtered).render();
  }

  /**
   * Delegate pagination rendering to TableBuilder.
   * @param {number} totalCount
   * @param {number} totalPages
   */
  renderPagination(totalCount, totalPages) {
    this.tableBuilder.renderPagination(totalCount, totalPages);
  }

  /**
   * Helper delegate to render stage badge.
   * @param {string} stage
   * @returns {string}
   */
  renderStageBadge(stage) {
    return new GrnPaymentRowBuilder({ stage }).renderStageBadge();
  }

  /**
   * Helper delegate to render method badge.
   * @param {string} method
   * @param {string} [ref=""]
   * @returns {string}
   */
  renderMethodBadge(method, ref = "") {
    return new GrnPaymentRowBuilder({ method, ref }).renderMethodBadge();
  }
}

export default GrnPaymentHandler;
