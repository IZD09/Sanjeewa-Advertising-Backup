/**
 * SanjeewaAdvertising - Inventory Metrics & KPI Process
 *
 * Calculates and renders Material Stock Inventory overview KPI summary cards (Tab 1)
 * using the InventoryKpiCardBuilder class.
 */

import { InventoryKpiCardBuilder } from "../builders/InventoryKpiCardBuilder.js";

export class MetricsProcess {
  /**
   * @param {Object} context
   * @param {Function} context.getItems
   * @param {Function} context.getItemAvailableQty
   * @param {Function} context.getItemStatus
   * @param {Function} context.formatCurrency
   */
  constructor(context) {
    this.ctx = context;
  }

  renderKPIs() {
    const items = this.ctx.getItems ? this.ctx.getItems() : [];
    const totalItems = items.length;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalAssetValue = 0;

    items.forEach((item) => {
      const avail = this.ctx.getItemAvailableQty ? this.ctx.getItemAvailableQty(item) : 0;
      const statusObj = this.ctx.getItemStatus ? this.ctx.getItemStatus(item) : "In Stock";
      const statusLabel = typeof statusObj === "object" && statusObj !== null ? statusObj.label : statusObj;
      const val = avail * (item.unitPrice || 0);

      totalAssetValue += val;
      if (statusLabel === "Low Stock") {
        lowStockCount++;
      }
      if (statusLabel === "Out of Stock") {
        outOfStockCount++;
      }
    });

    const formattedValue = this.ctx.formatCurrency
      ? this.ctx.formatCurrency(totalAssetValue)
      : `Rs. ${Number(totalAssetValue).toFixed(2)}`;

    InventoryKpiCardBuilder.renderGrid("invStockKpiGrid", [
      new InventoryKpiCardBuilder()
        .setValueId("invKpiTotalItems")
        .setLabel("Total Items")
        .setValue(Number(totalItems).toLocaleString())
        .setDescription("Active Material SKUs")
        .setDescIcon("fa-layer-group", "#1677ff")
        .setIcon("fa-boxes-stacked", "blue")
        .toJSON(),
      new InventoryKpiCardBuilder()
        .setValueId("invKpiTotalValue")
        .setLabel("Total Stock Value")
        .setValue(formattedValue)
        .setDescription("Warehouse Valuation")
        .setDescIcon("fa-chart-line", "#52c41a")
        .setIcon("fa-vault", "green")
        .toJSON(),
      new InventoryKpiCardBuilder()
        .setValueId("invKpiLowStock")
        .setLabel("Low Stock Items")
        .setValue(Number(lowStockCount).toLocaleString())
        .setValueColor("#faad14")
        .setDescription("Reorder Threshold Reached")
        .setDescIcon("fa-triangle-exclamation", "#faad14")
        .setIcon("fa-triangle-exclamation", "yellow")
        .toJSON(),
      new InventoryKpiCardBuilder()
        .setValueId("invKpiOutOfStock")
        .setLabel("Out of Stock")
        .setValue(Number(outOfStockCount).toLocaleString())
        .setValueColor("#ff4d4f")
        .setDescription("Immediate Action Required")
        .setDescIcon("fa-circle-exclamation", "#ff4d4f")
        .setIcon("fa-box-open", "red")
        .toJSON()
    ]);
  }
}

export default MetricsProcess;
