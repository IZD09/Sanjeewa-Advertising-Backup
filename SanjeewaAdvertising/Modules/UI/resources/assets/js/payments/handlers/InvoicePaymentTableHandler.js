/**
 * SanjeewaAdvertising - Invoice Payment Table Handler
 *
 * Extends BaseTableLoader core class, utilizing InvoicePaymentRowBuilder
 * to filter, format, and render Invoice Job Payments.
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
   */
  constructor(options = {}) {
    super({
      tbodyId: "payInvoiceTableBody",
      paginationInfoId: "payInvoicePaginationInfo",
      paginationControlsId: "payInvoicePaginationControls",
      pageSize: options.pageSize || 10,
      colspan: 9,
      emptyIcon: "fa-receipt",
      emptyMessage: "No Invoice Payments match your filter criteria.",
      onPageChange: options.onPageChange,
      rowBuilder: InvoicePaymentRowBuilder
    });

    this.renderStageBadge = options.renderStageBadge || (() => "");
    this.renderMethodBadge = options.renderMethodBadge || (() => "");
    this.formatCurrency = options.formatCurrency || ((amt) => `Rs. ${(parseFloat(amt) || 0).toFixed(2)}`);
  }

  getFilteredPayments(orderPayments = [], invoiceSearch = "", invoiceStatusFilter = "ALL", invoiceMethodFilter = "ALL") {
    const term = (invoiceSearch || "").toLowerCase().trim();

    return (orderPayments || []).filter(p => {
      const matchesSearch = !term ||
        (p.invoiceNo && p.invoiceNo.toLowerCase().includes(term)) ||
        (p.orderId && p.orderId.toLowerCase().includes(term)) ||
        (p.customerName && p.customerName.toLowerCase().includes(term)) ||
        (p.ref && p.ref.toLowerCase().includes(term)) ||
        (p.jobIds && Array.isArray(p.jobIds) && p.jobIds.some(j => j.toLowerCase().includes(term)));

      const matchesStatus = invoiceStatusFilter === "ALL" || p.stage === invoiceStatusFilter;
      const matchesMethod = invoiceMethodFilter === "ALL" || p.method === invoiceMethodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }

  render(orderPayments = [], invoiceSearch = "", invoiceStatusFilter = "ALL", invoiceMethodFilter = "ALL") {
    const tbody = this.getTbody();
    if (!tbody) return;

    const filtered = this.getFilteredPayments(orderPayments, invoiceSearch, invoiceStatusFilter, invoiceMethodFilter);

    if (filtered.length === 0) {
      this.renderEmptyState(
        "No Invoice Payments match your filter criteria.",
        "fa-receipt"
      );
      return;
    }

    tbody.innerHTML = "";

    filtered.forEach(item => {
      const entity = item instanceof InvoicePaymentEntity
        ? item
        : new InvoicePaymentRowBuilder(item).build();
      tbody.appendChild(entity.render());
    });
  }
}

export default InvoicePaymentTableHandler;

