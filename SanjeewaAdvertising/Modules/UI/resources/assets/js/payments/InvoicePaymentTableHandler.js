/**
 * SanjeewaAdvertising - Invoice Payment Table Handler
 *
 * Extends BaseTableLoader core class, utilizing InvoicePaymentRowBuilder
 * to render invoice payments data, handle filtering, and paginate records.
 */

import { BaseTableLoader } from "../core/BaseTableLoader.js";
import { InvoicePaymentRowBuilder, InvoicePayment } from "./InvoicePaymentRowBuilder.js";

export class InvoicePaymentTableHandler extends BaseTableLoader {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.renderStageBadge]
   * @param {Function} [options.renderMethodBadge]
   * @param {Function} [options.formatCurrency]
   * @param {Function} [options.onPageChange]
   * @param {number} [options.pageSize=8]
   */
  constructor(options = {}) {
    super({
      tbodyId: "payInvoiceTableBody",
      paginationInfoId: "payInvoicePaginationInfo",
      paginationControlsId: "payInvoicePaginationControls",
      pageSize: options.pageSize || 8,
      colspan: 9,
      emptyIcon: "fa-receipt",
      emptyMessage: "No Invoice Payments match your filter criteria.",
      onPageChange: options.onPageChange,
      rowBuilder: InvoicePaymentRowBuilder
    });

    this.renderStageBadge = options.renderStageBadge || null;
    this.renderMethodBadge = options.renderMethodBadge || null;
    this.formatCurrency = options.formatCurrency || null;
  }

  /**
   * Filter payments by search term, payment stage/status, and payment method.
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
      const invNo = String(p.invoiceNo || p.orderId || p.id || "").toLowerCase();
      const ordId = String(p.orderId || p.id || "").toLowerCase();
      const custName = String(p.customerName || "").toLowerCase();
      const custMobile = String(p.customerMobile || "");
      const prodName = String(p.productName || "").toLowerCase();
      const ref = String(p.ref || "").toLowerCase();
      const hasJobMatch = p.jobIds && Array.isArray(p.jobIds) && p.jobIds.some(j => String(j).toLowerCase().includes(term));

      const matchesSearch = !term ||
        invNo.includes(term) ||
        ordId.includes(term) ||
        custName.includes(term) ||
        custMobile.includes(term) ||
        prodName.includes(term) ||
        ref.includes(term) ||
        hasJobMatch;

      const stage = p.stage || (p.paymentStatus === "Paid" ? "Complete Payment" : (p.paymentStatus === "Partial" ? "Advance Payment" : "Pending Payment"));
      const matchesStatus = invoiceStatusFilter === "ALL" || stage === invoiceStatusFilter || p.paymentStatus === invoiceStatusFilter;
      const matchesMethod = invoiceMethodFilter === "ALL" || (p.method || "Cash") === invoiceMethodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }

  /**
   * Render table body rows and pagination controls using BaseTableLoader.
   *
   * @param {Array} orderPayments
   * @param {string} invoiceSearch
   * @param {string} invoiceStatusFilter
   * @param {string} invoiceMethodFilter
   * @param {number} [currentPage=this.currentPage]
   * @param {number} [pageSize=this.pageSize]
   */
  render(orderPayments = [], invoiceSearch = "", invoiceStatusFilter = "ALL", invoiceMethodFilter = "ALL", currentPage = this.currentPage, pageSize = this.pageSize) {
    this.currentPage = currentPage || 1;
    this.pageSize = pageSize || 8;

    const filtered = this.getFilteredPayments(orderPayments, invoiceSearch, invoiceStatusFilter, invoiceMethodFilter);

    // Delegate row rendering and pagination to BaseTableLoader
    this.loadTable(filtered, (item) => {
      const payment = item instanceof InvoicePayment
        ? item
        : new InvoicePaymentRowBuilder(item).build();
      return payment.render();
    }, this.currentPage, this.pageSize);
  }

  /**
   * Custom pagination summary text for invoices.
   */
  renderPagination(totalCount, totalPages, currentPage, pageSize) {
    super.renderPagination(totalCount, totalPages, currentPage, pageSize);
    const infoElem = document.getElementById(this.paginationInfoId);
    if (infoElem && totalCount > 0) {
      const start = (currentPage - 1) * pageSize + 1;
      const end = Math.min(currentPage * pageSize, totalCount);
      infoElem.textContent = `Showing ${start}-${end} of ${totalCount} invoices`;
    } else if (infoElem) {
      infoElem.textContent = "Showing 0 invoices";
    }
  }
}

export const InvoicePaymentTableBuilder = InvoicePaymentTableHandler;
export default InvoicePaymentTableHandler;
