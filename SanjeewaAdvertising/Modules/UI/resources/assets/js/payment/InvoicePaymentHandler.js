/**
 * SanjeewaAdvertising - Invoice Payments Handler
 * Handles customer job/invoice payment table rendering utilizing
 * the InvoicePaymentRowBuilder class, filtering, and search events.
 */

"use strict";

import { TableBuilder } from "./TableBuilder.js";
import { InvoicePaymentRowBuilder } from "./InvoicePaymentRowBuilder.js";

export class InvoicePaymentHandler {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.onFilterChange]
   * @param {Function} [options.getOrderPayments]
   */
  constructor(options = {}) {
    this.onFilterChange = options.onFilterChange || (() => {});
    this.getOrderPayments = options.getOrderPayments || (() => []);

    this.invoiceSearch = "";
    this.invoiceStatusFilter = "ALL";
    this.invoiceMethodFilter = "ALL";
    this._lastPayments = null;

    // TableBuilder instance for Invoice Payments
    this.tableBuilder = TableBuilder.forInvoicePayments([], {
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
   * Bind event listeners for invoice payment filters.
   */
  bindEvents() {
    const invSearch = document.getElementById("payInvoiceSearch");
    if (invSearch) {
      invSearch.addEventListener("input", (e) => {
        this.invoiceSearch = e.target.value.toLowerCase().trim();
        this.tableBuilder.setPage(1);
        this.render();
        this.onFilterChange();
      });
    }

    const invStatus = document.getElementById("payInvoiceStatusFilter");
    if (invStatus) {
      invStatus.addEventListener("change", (e) => {
        this.invoiceStatusFilter = e.target.value;
        this.tableBuilder.setPage(1);
        this.render();
        this.onFilterChange();
      });
    }

    const invMethod = document.getElementById("payInvoiceMethodFilter");
    if (invMethod) {
      invMethod.addEventListener("change", (e) => {
        this.invoiceMethodFilter = e.target.value;
        this.tableBuilder.setPage(1);
        this.render();
        this.onFilterChange();
      });
    }

    const invReset = document.getElementById("payInvoiceResetFilters");
    if (invReset) {
      invReset.addEventListener("click", () => {
        this.invoiceSearch = "";
        this.invoiceStatusFilter = "ALL";
        this.invoiceMethodFilter = "ALL";
        this.tableBuilder.setPage(1);
        if (invSearch) invSearch.value = "";
        if (invStatus) invStatus.value = "ALL";
        if (invMethod) invMethod.value = "ALL";
        this.render();
        this.onFilterChange();
      });
    }
  }

  /**
   * Filter payments list using normalized fields via InvoicePaymentRowBuilder.
   * @param {Array} payments
   * @returns {Array}
   */
  getFilteredPayments(payments = null) {
    const list = payments || this._lastPayments || this.getOrderPayments() || [];

    return list.filter((item) => {
      const p = item instanceof InvoicePaymentRowBuilder ? item : InvoicePaymentRowBuilder.from(item);

      // Search filter
      const matchesSearch =
        !this.invoiceSearch ||
        (p.invoiceNo && p.invoiceNo.toLowerCase().includes(this.invoiceSearch)) ||
        (p.orderId && p.orderId.toLowerCase().includes(this.invoiceSearch)) ||
        (p.id && p.id.toLowerCase().includes(this.invoiceSearch)) ||
        (p.customerName && p.customerName.toLowerCase().includes(this.invoiceSearch)) ||
        (p.customerMobile && p.customerMobile.includes(this.invoiceSearch)) ||
        (p.productName && p.productName.toLowerCase().includes(this.invoiceSearch)) ||
        (p.ref && p.ref.toLowerCase().includes(this.invoiceSearch));

      // Status filter (checks stage and paymentStatus)
      const matchesStatus =
        this.invoiceStatusFilter === "ALL" ||
        p.stage === this.invoiceStatusFilter ||
        p.paymentStatus === this.invoiceStatusFilter;

      // Method filter
      const matchesMethod =
        this.invoiceMethodFilter === "ALL" || p.method === this.invoiceMethodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }

  /**
   * Render invoice payments table body rows using TableBuilder and InvoicePaymentRowBuilder.
   * @param {Array} [payments]
   */
  render(payments = null) {
    if (payments) {
      this._lastPayments = payments;
    }
    const list = payments || this._lastPayments || this.getOrderPayments() || [];
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
    return new InvoicePaymentRowBuilder({ stage }).renderStageBadge();
  }

  /**
   * Helper delegate to render method badge.
   * @param {string} method
   * @param {string} [ref=""]
   * @returns {string}
   */
  renderMethodBadge(method, ref = "") {
    return new InvoicePaymentRowBuilder({ method, ref }).renderMethodBadge();
  }
}

export default InvoicePaymentHandler;
