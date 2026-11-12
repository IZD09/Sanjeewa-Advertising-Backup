/**
 * SanjeewaAdvertising - PO Table Handler
 *
 * Extends BaseTableLoader core class, utilizing PurchaseOrderRowBuilder
 * to filter, paginate (max 20 rows per page), and render Purchase Orders (PO) records.
 */

import { BaseTableLoader } from "../../core/BaseTableLoader.js";
import { PurchaseOrderRowBuilder, PurchaseOrderEntity } from "../builders/PurchaseOrderRowBuilder.js";

export class POTableHandler extends BaseTableLoader {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.formatCurrency]
   * @param {Function} [options.viewPO]
   * @param {Function} [options.createGrnForPO]
   * @param {Function} [options.onPageChange]
   */
  constructor(options = {}) {
    super({
      tbodyId: "poTableBody",
      paginationInfoId: "poPaginationInfo",
      paginationControlsId: "poPaginationControls",
      pageSize: options.pageSize || 20,
      colspan: 8,
      emptyIcon: "fa-clipboard-list",
      emptyMessage: "No Purchase Orders found",
      onPageChange: options.onPageChange,
      rowBuilder: PurchaseOrderRowBuilder
    });

    this.formatCurrency = options.formatCurrency || ((amt) => `Rs. ${(parseFloat(amt) || 0).toFixed(2)}`);
    this.viewPO = options.viewPO || (() => {});
    this.createGrnForPO = options.createGrnForPO || (() => {});
  }

  /**
   * Filter purchase orders array by search, status, and supplier.
   *
   * @param {Array} purchaseOrders
   * @param {string} searchTerm
   * @param {string} statusFilter
   * @param {string} supplierFilter
   * @returns {Array}
   */
  getFilteredPOs(purchaseOrders = [], searchTerm = "", statusFilter = "ALL", supplierFilter = "ALL") {
    const term = (searchTerm || "").toLowerCase().trim();

    return (purchaseOrders || []).filter(po => {
      const itemNames = po.items ? po.items.map(i => i.item_name).join(" ") : "";
      const matchesSearch = !term ||
        (po.po_number && po.po_number.toLowerCase().includes(term)) ||
        (po.supplier_name && po.supplier_name.toLowerCase().includes(term)) ||
        (po.supplier_contact && po.supplier_contact.toLowerCase().includes(term)) ||
        itemNames.toLowerCase().includes(term);

      const matchesStatus = statusFilter === "ALL" || po.status === statusFilter;
      const matchesSupplier = supplierFilter === "ALL" || po.supplier_name === supplierFilter;

      return matchesSearch && matchesStatus && matchesSupplier;
    });
  }

  /**
   * Render table body rows and pagination for purchase orders (max 20 rows per page).
   *
   * @param {Array} purchaseOrders
   * @param {string} searchTerm
   * @param {string} statusFilter
   * @param {string} supplierFilter
   * @param {Object|null} [serverPagination=null]
   */
  render(purchaseOrders = [], searchTerm = "", statusFilter = "ALL", supplierFilter = "ALL", serverPagination = null) {
    const tbody = this.getTbody();
    if (!tbody) return;

    const filtered = this.getFilteredPOs(purchaseOrders, searchTerm, statusFilter, supplierFilter);

    const useServerMeta = serverPagination &&
      typeof serverPagination.total === "number" &&
      serverPagination.total > purchaseOrders.length;

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
        "No Purchase Orders found. Create a new Purchase Order to request items from suppliers.",
        "fa-clipboard-list"
      );
      this.renderPagination(0, 1, 1, pageSize);
      return;
    }

    tbody.innerHTML = "";

    pageItems.forEach(item => {
      const entity = item instanceof PurchaseOrderEntity
        ? item
        : new PurchaseOrderRowBuilder(item).build();
      tbody.appendChild(entity.render());
    });

    this.renderPagination(total, totalPages, activePage, pageSize);
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
    const paginationBar = document.getElementById("poPaginationBar") ||
      document.querySelector("#grnPODirectoryView .grn-pagination-bar");

    if (totalCount <= 20) {
      if (paginationBar) paginationBar.style.display = "none";
      const infoElem = document.getElementById(this.paginationInfoId);
      const controlsElem = document.getElementById(this.paginationControlsId);
      if (infoElem) infoElem.textContent = "";
      if (controlsElem) controlsElem.innerHTML = "";
      return;
    }

    if (paginationBar) paginationBar.style.display = "flex";
    super.renderPagination(totalCount, totalPages, currentPage, pageSize, "Purchase Orders");
  }
}

export default POTableHandler;
