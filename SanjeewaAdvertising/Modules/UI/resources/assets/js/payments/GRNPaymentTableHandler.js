/**
 * SanjeewaAdvertising - GRN Payment Table Handler
 *
<<<<<<< HEAD
 * Extends BaseTableLoader core class to filter, paginate, and render
 * GRN Supplier Stock Payments.
 */

import { BaseTableLoader } from "../core/BaseTableLoader.js";
=======
 * Extends BaseTableLoader core class, utilizing GrnPaymentRowBuilder
 * to render GRN supplier stock payments data, handle filtering, and paginate records.
 */

import { BaseTableLoader } from "../core/BaseTableLoader.js";
import { GrnPaymentRowBuilder, GrnPayment } from "./GrnPaymentRowBuilder.js";
>>>>>>> origin/Ardithya

export class GRNPaymentTableHandler extends BaseTableLoader {
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
      tbodyId: "payGrnTableBody",
      paginationInfoId: "payGrnPaginationInfo",
      paginationControlsId: "payGrnPaginationControls",
<<<<<<< HEAD
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

=======
      pageSize: options.pageSize || 8,
      colspan: 9,
      emptyIcon: "fa-truck-ramp-box",
      emptyMessage: "No GRN Stock Payments match your filter criteria.",
      onPageChange: options.onPageChange,
      rowBuilder: GrnPaymentRowBuilder
    });

    this.renderStageBadge = options.renderStageBadge || null;
    this.renderMethodBadge = options.renderMethodBadge || null;
    this.formatCurrency = options.formatCurrency || null;
  }

  /**
   * Filter GRN payments by search term, payment stage/status, and payment method.
   *
   * @param {Array} grnPayments
   * @param {string} grnSearch
   * @param {string} grnStatusFilter
   * @param {string} grnMethodFilter
   * @returns {Array}
   */
>>>>>>> origin/Ardithya
  getFilteredPayments(grnPayments = [], grnSearch = "", grnStatusFilter = "ALL", grnMethodFilter = "ALL") {
    const term = (grnSearch || "").toLowerCase().trim();

    return (grnPayments || []).filter(p => {
<<<<<<< HEAD
      const matchesSearch = !term ||
        (p.grnNumber && p.grnNumber.toLowerCase().includes(term)) ||
        (p.poNumber && p.poNumber.toLowerCase().includes(term)) ||
        (p.supplierName && p.supplierName.toLowerCase().includes(term)) ||
        (p.ref && p.ref.toLowerCase().includes(term));

      const matchesStatus = grnStatusFilter === "ALL" || p.stage === grnStatusFilter;
      const matchesMethod = grnMethodFilter === "ALL" || p.method === grnMethodFilter;
=======
      const grnNum = String(p.grnNumber || p.grn_number || p.grnId || p.grn_id || "").toLowerCase();
      const poNum = String(p.poNumber || p.po_number || "").toLowerCase();
      const supName = String(p.supplierName || p.supplier_name || "").toLowerCase();
      const cat = String(p.stockCategory || p.stock_category || "").toLowerCase();
      const ref = String(p.ref || "").toLowerCase();

      const matchesSearch = !term ||
        grnNum.includes(term) ||
        poNum.includes(term) ||
        supName.includes(term) ||
        cat.includes(term) ||
        ref.includes(term);

      const stage = p.stage || (p.paymentStatus === "Paid" ? "Complete Payment" : (p.paymentStatus === "Partial" ? "Advance Payment" : "Pending Payment"));
      const matchesStatus = grnStatusFilter === "ALL" || stage === grnStatusFilter || p.paymentStatus === grnStatusFilter;
      const matchesMethod = grnMethodFilter === "ALL" || (p.method || "Check") === grnMethodFilter;
>>>>>>> origin/Ardithya

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }

<<<<<<< HEAD
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

=======
  /**
   * Render table body rows and pagination controls using BaseTableLoader.
   *
   * @param {Array} grnPayments
   * @param {string} grnSearch
   * @param {string} grnStatusFilter
   * @param {string} grnMethodFilter
   * @param {number} [currentPage=this.currentPage]
   * @param {number} [pageSize=this.pageSize]
   */
  render(grnPayments = [], grnSearch = "", grnStatusFilter = "ALL", grnMethodFilter = "ALL", currentPage = this.currentPage, pageSize = this.pageSize) {
    this.currentPage = currentPage || 1;
    this.pageSize = pageSize || 8;

    const filtered = this.getFilteredPayments(grnPayments, grnSearch, grnStatusFilter, grnMethodFilter);

    // Delegate row rendering and pagination to BaseTableLoader
    this.loadTable(filtered, (item) => {
      const payment = item instanceof GrnPayment
        ? item
        : new GrnPaymentRowBuilder(item).build();
      return payment.render();
    }, this.currentPage, this.pageSize);
  }

  /**
   * Custom pagination summary text for stock GRNs.
   */
  renderPagination(totalCount, totalPages, currentPage, pageSize) {
    super.renderPagination(totalCount, totalPages, currentPage, pageSize);
    const infoElem = document.getElementById(this.paginationInfoId);
    if (infoElem && totalCount > 0) {
      const start = (currentPage - 1) * pageSize + 1;
      const end = Math.min(currentPage * pageSize, totalCount);
      infoElem.textContent = `Showing ${start}-${end} of ${totalCount} stock GRNs`;
    } else if (infoElem) {
      infoElem.textContent = "Showing 0 stock GRNs";
    }
  }
}

export const GRNPaymentTableBuilder = GRNPaymentTableHandler;
export default GRNPaymentTableHandler;
>>>>>>> origin/Ardithya
