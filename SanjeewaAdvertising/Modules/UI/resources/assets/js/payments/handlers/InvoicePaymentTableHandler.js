/**
 * SanjeewaAdvertising - Invoice Payment Table Handler
 *
 * Extends BaseTableLoader core class (which extends BasePaginationHandler),
 * utilizing InvoicePaymentRowBuilder to filter, paginate (20 rows per page),
 * and render Invoice Job Payments without page reloads.
 */

import { BaseTableLoader } from "../../core/BaseTableLoader.js";
import { InvoicePaymentRowBuilder, InvoicePaymentEntity } from "../builders/InvoicePaymentRowBuilder.js";

export class InvoicePaymentTableHandler extends BaseTableLoader {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.renderStageBadge]
   * @param {Function} [options.renderMethodBadge]
   * @param {Function} [options.formatCurrency]
   * @param {Function} [options.onPageChange]
   * @param {number} [options.pageSize=20]
   */
  constructor(options = {}) {
    super({
      tbodyId: "payInvoiceTableBody",
      paginationInfoId: "payInvoicePaginationInfo",
      paginationControlsId: "payInvoicePaginationControls",
      pageSize: options.pageSize || 20,
      colspan: 9,
      emptyIcon: "fa-receipt",
      emptyMessage: "No Invoice Payments match your filter criteria.",
      itemLabel: "invoices",
      onPageChange: (page) => {
        this.currentPage = page;
        this.renderCurrent();
        if (options.onPageChange) options.onPageChange(page);
      },
      rowBuilder: InvoicePaymentRowBuilder
    });

    this.renderStageBadge = options.renderStageBadge || (() => "");
    this.renderMethodBadge = options.renderMethodBadge || (() => "");
    this.formatCurrency = options.formatCurrency || ((amt) => `Rs. ${(parseFloat(amt) || 0).toFixed(2)}`);

    this.lastDataset = [];
    this.lastSearch = "";
    this.lastStatus = "ALL";
    this.lastMethod = "ALL";
  }

  /**
   * Filter payments by search term, stage/status, and payment method.
   *
   * @param {Array} orderPayments
   * @param {string} invoiceSearch
   * @param {string} invoiceStatusFilter
   * @param {string} invoiceMethodFilter
   * @returns {Array}
   */
  getFilteredPayments(orderPayments = [], invoiceSearch = "", invoiceStatusFilter = "ALL", invoiceMethodFilter = "ALL") {
    const term = (invoiceSearch || "").toLowerCase().trim();

    return (orderPayments || []).filter(p => {
      const invoiceNo = String(p.invoiceNo || p.invoice_no || "").toLowerCase();
      const orderId = String(p.orderId || p.order_id || p.id || "").toLowerCase();
      const customerName = String(p.customerName || p.customer_name || "").toLowerCase();
      const customerMobile = String(p.customerMobile || p.customer_mobile || "").toLowerCase();
      const ref = String(p.ref || p.reference_no || "").toLowerCase();
      const note = String(p.note || p.narration || "").toLowerCase();

      const matchesSearch = !term ||
        invoiceNo.includes(term) ||
        orderId.includes(term) ||
        customerName.includes(term) ||
        customerMobile.includes(term) ||
        ref.includes(term) ||
        note.includes(term) ||
        (Array.isArray(p.jobIds) && p.jobIds.some(j => String(j).toLowerCase().includes(term))) ||
        (Array.isArray(p.job_ids) && p.job_ids.some(j => String(j).toLowerCase().includes(term)));

      const stage = p.stage || (p.payment_status === "Paid" ? "Complete Payment" : "Pending Payment");
      const matchesStatus = invoiceStatusFilter === "ALL" || stage === invoiceStatusFilter;
      const matchesMethod = invoiceMethodFilter === "ALL" || p.method === invoiceMethodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }

  /**
   * Filter, paginate (20 per page), and render table rows.
   *
   * @param {Array} orderPayments
   * @param {string} invoiceSearch
   * @param {string} invoiceStatusFilter
   * @param {string} invoiceMethodFilter
   * @param {boolean} [resetPage=false]
   */
  render(orderPayments = [], invoiceSearch = "", invoiceStatusFilter = "ALL", invoiceMethodFilter = "ALL", resetPage = false) {
    if (resetPage || invoiceSearch !== this.lastSearch || invoiceStatusFilter !== this.lastStatus || invoiceMethodFilter !== this.lastMethod) {
      this.currentPage = 1;
    }

    this.lastDataset = orderPayments || [];
    this.lastSearch = invoiceSearch || "";
    this.lastStatus = invoiceStatusFilter || "ALL";
    this.lastMethod = invoiceMethodFilter || "ALL";

    this.renderCurrent();
  }

  /**
   * Render using stored criteria and active page.
   */
  renderCurrent() {
    const tbody = this.getTbody();
    if (!tbody) return;

    const filtered = this.getFilteredPayments(
      this.lastDataset,
      this.lastSearch,
      this.lastStatus,
      this.lastMethod
    );

    if (filtered.length === 0) {
      this.renderEmptyState(
        "No Invoice Payments match your filter criteria.",
        "fa-receipt"
      );
      this.renderPagination(0, 1, 1, this.pageSize, "invoices");
      return;
    }

    // Paginate: max 20 rows per page
    const paginated = this.paginate(filtered, this.currentPage, this.pageSize);

    tbody.innerHTML = "";

    paginated.pageItems.forEach(item => {
      const entity = item instanceof InvoicePaymentEntity
        ? item
        : new InvoicePaymentRowBuilder(item).build();
      tbody.appendChild(entity.render());
    });

    // Render standard pagination bar & navigation controls without reload
    this.renderPagination(
      paginated.total,
      paginated.totalPages,
      paginated.activePage,
      this.pageSize,
      "invoices"
    );
  }
}

export default InvoicePaymentTableHandler;
