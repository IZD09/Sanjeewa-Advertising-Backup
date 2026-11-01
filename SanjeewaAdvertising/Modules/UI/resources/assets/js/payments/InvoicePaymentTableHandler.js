/**
 * SanjeewaAdvertising - Invoice Payment Table Handler
 *
 * Extends BaseTableLoader core class to filter, paginate, and render
 * Invoice Job Payments.
 */

import { BaseTableLoader } from "../core/BaseTableLoader.js";

export class InvoicePaymentTableHandler extends BaseTableLoader {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.renderStageBadge]
   * @param {Function} [options.renderMethodBadge]
   * @param {Function} [options.formatCurrency]
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
      onPageChange: options.onPageChange
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
        (p.ref && p.ref.toLowerCase().includes(term));

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

    tbody.innerHTML = filtered.map(p => {
      const stagePill = this.renderStageBadge(p.stage);
      const methodPill = this.renderMethodBadge(p.method, p.ref);

      return `
        <tr>
          <td>
            <strong style="color: var(--blue);">${p.invoiceNo || p.orderId}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">${p.date}</div>
          </td>
          <td>
            <strong>${p.customerName || "Customer"}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">Ref: ${p.orderId}</div>
          </td>
          <td>${stagePill}</td>
          <td>${methodPill}</td>
          <td style="font-weight: 700;">Rs. ${(Number(p.totalBill) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
          <td style="font-weight: 800; color: #10b981;">Rs. ${(Number(p.amount) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
          <td style="font-weight: 700; color: ${(Number(p.balance) || 0) > 0 ? '#ef4444' : 'var(--text-muted)'};">
            Rs. ${(Number(p.balance) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
          </td>
          <td>
            <span style="font-size: 11.5px; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;" title="${p.note || ''}">
              ${p.note || '-'}
            </span>
          </td>
          <td>
            <div class="pay-table-actions">
              <button type="button" class="pay-btn-sm" data-view-receipt="${p.paymentId}" data-type="invoice" title="View & Print Payment Voucher">
                <i class="fa-solid fa-receipt"></i> Voucher
              </button>
              ${p.balance > 0 ? `
              <button type="button" class="pay-btn-sm primary-sm" data-open-pay-modal data-pay-type="invoice" data-pay-ref="${p.orderId}" title="Record settlement installment">
                <i class="fa-solid fa-plus"></i> Pay
              </button>` : ''}
            </div>
          </td>
        </tr>`;
    }).join("");
  }
}

