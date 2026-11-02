/**
 * SanjeewaAdvertising - GRN Table Handler
 *
 * Extends BaseTableLoader core class, utilizing GrnRowBuilder
 * to filter, format, and render Goods Received Notes records.
 */

import { BaseTableLoader } from "../core/BaseTableLoader.js";
import { GrnRowBuilder, GrnEntity } from "./builders/GrnRowBuilder.js";

export class GRNTableHandler extends BaseTableLoader {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.formatCurrency]
   * @param {Function} [options.viewGRN]
   * @param {Function} [options.finalizeDraftGRN]
   * @param {Function} [options.onPageChange]
   */
  constructor(options = {}) {
    super({
      tbodyId: "grnTableBody",
      paginationInfoId: "grnPaginationInfo",
      paginationControlsId: "grnPaginationControls",
      pageSize: options.pageSize || 10,
      colspan: 9,
      emptyIcon: "fa-file-invoice",
      emptyMessage: "No Goods Received Notes found",
      onPageChange: options.onPageChange,
      rowBuilder: GrnRowBuilder
    });

    this.formatCurrency = options.formatCurrency || ((amt) => `Rs. ${(parseFloat(amt) || 0).toFixed(2)}`);
    this.viewGRN = options.viewGRN || (() => {});
    this.finalizeDraftGRN = options.finalizeDraftGRN || (() => {});
  }

  /**
   * Filter GRN records array by search, status, and supplier.
   *
   * @param {Array} records
   * @param {string} searchTerm
   * @param {string} statusFilter
   * @param {string} supplierFilter
   * @returns {Array}
   */
  getFilteredRecords(records = [], searchTerm = "", statusFilter = "ALL", supplierFilter = "ALL") {
    const term = (searchTerm || "").toLowerCase().trim();

    return (records || []).filter(rec => {
      const matchesSearch = !term ||
        (rec.grn_number && rec.grn_number.toLowerCase().includes(term)) ||
        (rec.purchase_order_no && rec.purchase_order_no.toLowerCase().includes(term)) ||
        (rec.supplier_name && rec.supplier_name.toLowerCase().includes(term)) ||
        (rec.supplier_contact && rec.supplier_contact.toLowerCase().includes(term));

      const matchesStatus = statusFilter === "ALL" || rec.status === statusFilter;
      const matchesSupplier = supplierFilter === "ALL" || rec.supplier_name === supplierFilter;

      return matchesSearch && matchesStatus && matchesSupplier;
    });
  }

  /**
   * Render table body rows for Goods Received Notes using GrnRowBuilder.
   *
   * @param {Array} grnRecords
   * @param {string} searchTerm
   * @param {string} statusFilter
   * @param {string} supplierFilter
   */
  render(grnRecords = [], searchTerm = "", statusFilter = "ALL", supplierFilter = "ALL") {
    const tbody = this.getTbody();
    if (!tbody) return;

    const filtered = this.getFilteredRecords(grnRecords, searchTerm, statusFilter, supplierFilter);

    if (filtered.length === 0) {
      this.renderEmptyState(
        "No Goods Received Notes found. Create your first GRN by clicking '+ Create New GRN'",
        "fa-file-invoice"
      );
      return;
    }

    tbody.innerHTML = "";

    filtered.forEach(item => {
      const entity = item instanceof GrnEntity
        ? item
        : new GrnRowBuilder(item).build();
      tbody.appendChild(entity.render());
    });
  }
}
