/**
 * SanjeewaAdvertising - GRN Table Handler
 *
 * Extends BaseTableLoader core class, utilizing GrnRowBuilder
 * to filter, paginate (max 20 rows per page), and render Goods Received Notes records.
 */

import { BaseTableLoader } from "../../core/BaseTableLoader.js";
import { GrnRowBuilder, GrnEntity } from "../builders/GrnRowBuilder.js";

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
      pageSize: options.pageSize || 20,
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
   * Render table body rows and pagination for Goods Received Notes (max 20 rows per page).
   *
   * @param {Array} grnRecords
   * @param {string} searchTerm
   * @param {string} statusFilter
   * @param {string} supplierFilter
   * @param {Object|null} [serverPagination=null]
   */
  render(grnRecords = [], searchTerm = "", statusFilter = "ALL", supplierFilter = "ALL", serverPagination = null) {
    const tbody = this.getTbody();
    if (!tbody) return;

    const countEl = document.getElementById("grnTableCount");
    const filtered = this.getFilteredRecords(grnRecords, searchTerm, statusFilter, supplierFilter);

    const useServerMeta = serverPagination &&
      typeof serverPagination.total === "number" &&
      serverPagination.total > grnRecords.length;

    let pageItems = [];
    let total = 0;
    let totalPages = 1;
    let activePage = this.currentPage;
    const pageSize = this.pageSize || 20;

    if (useServerMeta) {
      pageItems = filtered.slice(0, pageSize);
      total = serverPagination.total;
      totalPages = Math.max(1, serverPagination.last_page || Math.ceil(total / pageSize));
      activePage = serverPagination.current_page || this.currentPage;
      this.currentPage = activePage;
    } else {
      const paginated = this.paginate(filtered, this.currentPage, pageSize);
      pageItems = paginated.pageItems;
      total = paginated.total;
      totalPages = paginated.totalPages;
      activePage = paginated.activePage;
      this.currentPage = activePage;
    }

    if (pageItems.length === 0) {
      this.renderEmptyState(
        "No Goods Received Notes found. Create your first GRN by clicking '+ Create New GRN'",
        "fa-file-invoice"
      );
      this.renderPagination(0, 1, 1, pageSize);
      if (countEl) countEl.textContent = "Showing 0 GRNs";
      return;
    }

    tbody.innerHTML = "";

    pageItems.forEach(item => {
      const entity = item instanceof GrnEntity
        ? item
        : new GrnRowBuilder(item).build();
      tbody.appendChild(entity.render());
    });

    this.renderPagination(total, totalPages, activePage, pageSize);

    if (countEl) {
      const start = (activePage - 1) * pageSize + 1;
      const end = Math.min(activePage * pageSize, total);
      countEl.textContent = `Showing ${start}-${end} of ${total} GRNs`;
    }
  }

  /**
   * Render pagination summary and controls, hiding the pagination bar when results <= 20.
   *
   * @param {number} totalCount
   * @param {number} totalPages
   * @param {number} currentPage
   * @param {number} pageSize
   */
  renderPagination(totalCount, totalPages, currentPage, pageSize) {
    const paginationBar = document.getElementById("grnPaginationBar") ||
      document.querySelector("#grnListView .grn-pagination-bar");

    if (totalCount <= 20) {
      if (paginationBar) paginationBar.style.display = "none";
      const infoElem = document.getElementById(this.paginationInfoId);
      const controlsElem = document.getElementById(this.paginationControlsId);
      if (infoElem) infoElem.textContent = "";
      if (controlsElem) controlsElem.innerHTML = "";
      return;
    }

    if (paginationBar) paginationBar.style.display = "flex";
    super.renderPagination(totalCount, totalPages, currentPage, pageSize, "GRNs");
  }
}

export default GRNTableHandler;
