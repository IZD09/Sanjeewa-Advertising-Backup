/**
 * SanjeewaAdvertising - GRN Payment Table Handler
 *
 * Extends BaseTableLoader core class, utilizing GrnPaymentRowBuilder
 * to render GRN supplier stock payments data, handle filtering, and paginate records.
 */

import { BaseTableLoader } from "../core/BaseTableLoader.js";
import { GrnPaymentRowBuilder, GrnPayment } from "./GrnPaymentRowBuilder.js";

export class GRNPaymentTableHandler extends BaseTableLoader {
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
      tbodyId: "payGrnTableBody",
      paginationInfoId: "payGrnPaginationInfo",
      paginationControlsId: "payGrnPaginationControls",
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
  getFilteredPayments(grnPayments = [], grnSearch = "", grnStatusFilter = "ALL", grnMethodFilter = "ALL") {
    const term = (grnSearch || "").toLowerCase().trim();

    return (grnPayments || []).filter(p => {
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

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }

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
