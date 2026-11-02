/**
 * SanjeewaAdvertising - Invoice Payment Table Handler
 *
<<<<<<< HEAD
 * Extends BaseTableLoader core class to filter, paginate, and render
 * Invoice Job Payments.
 */

import { BaseTableLoader } from "../core/BaseTableLoader.js";
=======
 * Extends BaseTableLoader core class, utilizing InvoicePaymentRowBuilder
 * to render invoice payments data, handle filtering, and paginate records.
 */

import { BaseTableLoader } from "../core/BaseTableLoader.js";
import { InvoicePaymentRowBuilder, InvoicePayment } from "./InvoicePaymentRowBuilder.js";
>>>>>>> origin/Ardithya

export class InvoicePaymentTableHandler extends BaseTableLoader {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.renderStageBadge]
   * @param {Function} [options.renderMethodBadge]
   * @param {Function} [options.formatCurrency]
<<<<<<< HEAD
=======
   * @param {Function} [options.onPageChange]
   * @param {number} [options.pageSize=8]
>>>>>>> origin/Ardithya
   */
  constructor(options = {}) {
    super({
      tbodyId: "payInvoiceTableBody",
      paginationInfoId: "payInvoicePaginationInfo",
      paginationControlsId: "payInvoicePaginationControls",
<<<<<<< HEAD
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

=======
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
>>>>>>> origin/Ardithya
  getFilteredPayments(orderPayments = [], invoiceSearch = "", invoiceStatusFilter = "ALL", invoiceMethodFilter = "ALL") {
    const term = (invoiceSearch || "").toLowerCase().trim();

    return (orderPayments || []).filter(p => {
<<<<<<< HEAD
      const matchesSearch = !term ||
        (p.invoiceNo && p.invoiceNo.toLowerCase().includes(term)) ||
        (p.orderId && p.orderId.toLowerCase().includes(term)) ||
        (p.customerName && p.customerName.toLowerCase().includes(term)) ||
        (p.ref && p.ref.toLowerCase().includes(term)) ||
        (p.jobIds && Array.isArray(p.jobIds) && p.jobIds.some(j => j.toLowerCase().includes(term)));

      const matchesStatus = invoiceStatusFilter === "ALL" || p.stage === invoiceStatusFilter;
      const matchesMethod = invoiceMethodFilter === "ALL" || p.method === invoiceMethodFilter;
=======
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
>>>>>>> origin/Ardithya

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }

<<<<<<< HEAD
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
      const jobsCount = p.jobsCount || (p.jobs && p.jobs.length) || 1;
      const jobsCountBadge = jobsCount > 1
        ? `<span class="inv-job-badge" style="font-size: 10px; padding: 1px 6px; margin-left: 5px;">${jobsCount} Jobs</span>`
        : "";
      const primaryJobId = (p.jobIds && p.jobIds.length > 0) ? p.jobIds[0] : (p.orderId || "");

      return `
        <tr>
          <td>
            <strong style="color: var(--blue);">${p.invoiceNo || p.orderId}</strong>
            ${jobsCountBadge}
            <div style="font-size: 11px; color: var(--text-muted);">${p.date}</div>
          </td>
          <td>
            <strong>${p.customerName || "Customer"}</strong>
            <div style="font-size: 11px; color: var(--text-muted); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${p.orderId}">Ref: ${p.orderId}</div>
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
              <button type="button" class="pay-btn-sm primary-sm" data-open-pay-modal data-pay-type="invoice" data-pay-ref="${primaryJobId}" title="Record settlement installment">
                <i class="fa-solid fa-plus"></i> Pay
              </button>` : ''}
            </div>
          </td>
        </tr>`;
    }).join("");
  }
}

=======
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
>>>>>>> origin/Ardithya
