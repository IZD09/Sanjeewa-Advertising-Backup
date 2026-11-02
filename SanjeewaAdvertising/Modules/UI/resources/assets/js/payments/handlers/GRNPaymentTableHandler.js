/**
 * SanjeewaAdvertising - GRN Payment Table Handler
 *
 * Extends BaseTableLoader core class, utilizing GrnPaymentRowBuilder
 * to filter, format, and render GRN Supplier Stock Payments.
 */

import { BaseTableLoader } from "../../core/BaseTableLoader.js";
import { GrnPaymentRowBuilder, GrnPaymentEntity } from "../builders/GrnPaymentRowBuilder.js";

export class GRNPaymentTableHandler extends BaseTableLoader {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.renderStageBadge]
   * @param {Function} [options.renderMethodBadge]
   * @param {Function} [options.formatCurrency]
   * @param {Function} [options.onPageChange]
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
      onPageChange: options.onPageChange,
      rowBuilder: GrnPaymentRowBuilder
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
        (p.grn_number && p.grn_number.toLowerCase().includes(term)) ||
        (p.poNumber && p.poNumber.toLowerCase().includes(term)) ||
        (p.po_number && p.po_number.toLowerCase().includes(term)) ||
        (p.supplierName && p.supplierName.toLowerCase().includes(term)) ||
        (p.supplier_name && p.supplier_name.toLowerCase().includes(term)) ||
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

    tbody.innerHTML = "";

    filtered.forEach(item => {
      const entity = item instanceof GrnPaymentEntity
        ? item
        : new GrnPaymentRowBuilder(item).build();
      tbody.appendChild(entity.render());
    });
  }
}

export default GRNPaymentTableHandler;

