/**
 * SanjeewaAdvertising - GRN Payment Table Handler
 *
 * Extends BaseTableLoader core class to filter, paginate, and render
 * GRN Supplier Stock Payments.
 */

import { BaseTableLoader } from "../core/BaseTableLoader.js";

export class GRNPaymentTableHandler extends BaseTableLoader {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.renderStageBadge]
   * @param {Function} [options.renderMethodBadge]
   * @param {Function} [options.formatCurrency]
   */
  constructor(options = {}) {
    super({
      tbodyId: "payGrnTableBody",
      paginationInfoId: "payGrnPaginationInfo",
      paginationControlsId: "payGrnPaginationControls",
      pageSize: options.pageSize || 10,
      colspan: 9,
      emptyIcon: "fa-truck-ramp-box",
      emptyMessage: "No GRN Stock Payments match your filter criteria.",
      onPageChange: options.onPageChange
    });

    this.renderStageBadge = options.renderStageBadge || (() => "");
    this.renderMethodBadge = options.renderMethodBadge || (() => "");
    this.formatCurrency = options.formatCurrency || ((amt) => `Rs. ${(parseFloat(amt) || 0).toFixed(2)}`);
  }

  getFilteredPayments(grnPayments = [], grnSearch = "", grnStatusFilter = "ALL", grnMethodFilter = "ALL") {
    const term = (grnSearch || "").toLowerCase().trim();

    return (grnPayments || []).filter(p => {
      const matchesSearch = !term ||
        (p.grnNumber && p.grnNumber.toLowerCase().includes(term)) ||
        (p.poNumber && p.poNumber.toLowerCase().includes(term)) ||
        (p.supplierName && p.supplierName.toLowerCase().includes(term)) ||
        (p.ref && p.ref.toLowerCase().includes(term));

      const matchesStatus = grnStatusFilter === "ALL" || p.stage === grnStatusFilter;
      const matchesMethod = grnMethodFilter === "ALL" || p.method === grnMethodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }

  render(grnPayments = [], grnSearch = "", grnStatusFilter = "ALL", grnMethodFilter = "ALL") {
    const tbody = this.getTbody();
    if (!tbody) return;

    const filtered = this.getFilteredPayments(grnPayments, grnSearch, grnStatusFilter, grnMethodFilter);

    if (filtered.length === 0) {
      this.renderEmptyState(
        "No GRN Stock Payments match your filter criteria.",
        "fa-truck-ramp-box"
      );
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const stagePill = this.renderStageBadge(p.stage);
      const methodPill = this.renderMethodBadge(p.method, p.ref);

      return `
        <tr>
          <td>
            <strong style="color: #10b981;">${p.grnNumber}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">PO: ${p.poNumber || '-'}</div>
          </td>
          <td>
            <strong>${p.supplierName || "Supplier"}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">${p.stockCategory || "Stock Delivery"}</div>
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
              <button type="button" class="pay-btn-sm" data-view-receipt="${p.paymentId}" data-type="grn" title="View & Print Payment Voucher">
                <i class="fa-solid fa-receipt"></i> Voucher
              </button>
              ${p.balance > 0 ? `
              <button type="button" class="pay-btn-sm green-sm" data-open-pay-modal data-pay-type="grn" data-pay-ref="${p.grnId}" title="Pay supplier installment">
                <i class="fa-solid fa-money-bill-wave"></i> Pay
              </button>` : ''}
            </div>
          </td>
        </tr>`;
    }).join("");
  }
}

