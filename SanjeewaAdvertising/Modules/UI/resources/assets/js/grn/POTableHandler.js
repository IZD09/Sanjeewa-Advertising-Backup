/**
 * SanjeewaAdvertising - PO Table Handler
 *
 * Extends BaseTableLoader core class, utilizing PurchaseOrderRowBuilder
 * to filter, format, and render Purchase Orders (PO) records.
 */

import { BaseTableLoader } from "../core/BaseTableLoader.js";
import { PurchaseOrderRowBuilder, PurchaseOrderEntity } from "./builders/PurchaseOrderRowBuilder.js";

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
      pageSize: options.pageSize || 10,
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
   * Render table body rows for purchase orders using PurchaseOrderRowBuilder.
   *
   * @param {Array} purchaseOrders
   * @param {string} searchTerm
   * @param {string} statusFilter
   * @param {string} supplierFilter
   */
  render(purchaseOrders = [], searchTerm = "", statusFilter = "ALL", supplierFilter = "ALL") {
    const tbody = this.getTbody();
    if (!tbody) return;

    const filtered = this.getFilteredPOs(purchaseOrders, searchTerm, statusFilter, supplierFilter);

    if (filtered.length === 0) {
      this.renderEmptyState(
        "No Purchase Orders found. Create a new Purchase Order to request items from suppliers.",
        "fa-clipboard-list"
      );
      return;
    }

    tbody.innerHTML = "";

    filtered.forEach(item => {
      const entity = item instanceof PurchaseOrderEntity
        ? item
        : new PurchaseOrderRowBuilder(item).build();
      tbody.appendChild(entity.render());
    });
  }
}
