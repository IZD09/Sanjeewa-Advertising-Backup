/**
 * SanjeewaAdvertising - Inventory Table Handler
 *
 * Extends BaseTableLoader core class, utilizing InventoryRowBuilder
 * to filter, paginate, and render materials stock catalog and top summary KPIs.
 */

import { BaseTableLoader } from "../../core/BaseTableLoader.js";
import { InventoryRowBuilder, InventoryEntity } from "../builders/InventoryRowBuilder.js";

export class InventoryTableHandler extends BaseTableLoader {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.getItemAvailableQty]
   * @param {Function} [options.getItemStatus]
   * @param {Function} [options.formatCurrency]
   * @param {Function} [options.openViewModal]
   * @param {Function} [options.openAdjustModal]
   * @param {Function} [options.onPageChange]
   */
  constructor(options = {}) {
    super({
      tbodyId: "invTableBody",
      paginationInfoId: "invPaginationInfo",
      paginationControlsId: "invPaginationControls",
      pageSize: options.pageSize || 10,
      colspan: 10,
      emptyIcon: "fa-box-open",
      emptyMessage: "No matching materials found",
      onPageChange: options.onPageChange,
      rowBuilder: InventoryRowBuilder
    });

    this.getItemAvailableQty = options.getItemAvailableQty || (() => 0);
    this.getItemStatus = options.getItemStatus || (() => ({ label: "In Stock", class: "ant-tag-green" }));
    this.formatCurrency = options.formatCurrency || ((amt) => `Rs. ${(parseFloat(amt) || 0).toFixed(2)}`);
    this.openViewModal = options.openViewModal || (() => {});
    this.openAdjustModal = options.openAdjustModal || (() => {});
  }

  getFilteredItems(items = [], searchTerm = "", selectedCategory = "ALL") {
    const term = (searchTerm || "").toLowerCase().trim();

    return (items || []).filter(item => {
      const matchesSearch = !term ||
        item.code.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        (item.supplier && item.supplier.toLowerCase().includes(term));

      const matchesCat = selectedCategory === "ALL" || item.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }

  render(items = [], searchTerm = "", selectedCategory = "ALL") {
    const tbody = this.getTbody();
    const countLabel = document.getElementById("invTableCount");
    if (!tbody) return;

    const filtered = this.getFilteredItems(items, searchTerm, selectedCategory);

    if (countLabel) {
      countLabel.textContent = `Showing ${filtered.length} of ${items.length} materials`;
    }

    if (filtered.length === 0) {
      this.renderEmptyState(
        "No matching materials found. Try adjusting your search criteria or category filter.",
        "fa-box-open"
      );
      return;
    }

    tbody.innerHTML = "";

    const helpers = {
      getItemAvailableQty: (it) => this.getItemAvailableQty(it),
      getItemStatus: (it) => this.getItemStatus(it),
      formatCurrency: (amt) => this.formatCurrency(amt)
    };

    filtered.forEach(item => {
      const entity = item instanceof InventoryEntity
        ? item
        : new InventoryRowBuilder(item).build();
      tbody.appendChild(entity.render(helpers));
    });
  }

  renderKPIs(items = []) {
    const totalItems = items.length;
    let totalStockValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    items.forEach(item => {
      const qty = this.getItemAvailableQty(item);
      totalStockValue += (qty * (item.unitPrice || 0));
      if (qty <= 0) {
        outOfStockCount++;
      } else if (qty <= (item.minThreshold || 0)) {
        lowStockCount++;
      }
    });

    const kpiTotalItems = document.getElementById("invKpiTotalItems");
    const kpiTotalValue = document.getElementById("invKpiTotalValue");
    const kpiLowStock = document.getElementById("invKpiLowStock");
    const kpiOutOfStock = document.getElementById("invKpiOutOfStock");

    if (kpiTotalItems) kpiTotalItems.textContent = totalItems;
    if (kpiTotalValue) kpiTotalValue.textContent = this.formatCurrency(totalStockValue);
    if (kpiLowStock) kpiLowStock.textContent = lowStockCount;
    if (kpiOutOfStock) kpiOutOfStock.textContent = outOfStockCount;
  }
}

export default InventoryTableHandler;

