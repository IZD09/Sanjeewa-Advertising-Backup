/**
 * SanjeewaAdvertising - Inventory & Stock Row Builder
 *
 * Extends Core BaseTableRowBuilder for `#inventoryTable`.
 */

import { BaseTableRowBuilder } from "../../../../core/BaseTableRowBuilder.js";

export class InventoryStockReportRow {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  render() {
    const valuation = Number(this.qty || 0) * Number(this.buyCost || 0);
    const isLow = Number(this.qty || 0) <= Number(this.lowStockQty || 15);
    const alertBadge = isLow
      ? `<span class="rep-badge badge-overdue"><i class="fa-solid fa-triangle-exclamation"></i> Low Stock</span>`
      : `<span class="rep-badge badge-paid"><i class="fa-solid fa-check"></i> Sufficient</span>`;

    return `
      <tr>
        <td><strong>${this.code}</strong></td>
        <td>${this.itemName}</td>
        <td class="num-col"><strong>${Number(this.qty || 0).toLocaleString("en-LK")}</strong></td>
        <td class="num-col">Rs. ${Number(this.buyCost || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
        <td class="num-col">Rs. ${Number(this.sellingPrice || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
        <td>${alertBadge}</td>
        <td class="num-col" style="font-weight: 700;">Rs. ${valuation.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
      </tr>
    `;
  }
}

export class InventoryStockRowBuilder extends BaseTableRowBuilder {
  constructor(initialData = null) {
    super(initialData);
  }

  reset() {
    super.reset();
    this.code = "";
    this.itemName = "Raw Material";
    this.qty = 0;
    this.buyCost = 0;
    this.sellingPrice = 0;
    this.lowStockQty = 15;
    return this;
  }

  fromData(data = {}) {
    if (!data || typeof data !== "object") return this;
    super.fromData(data);
    this.code = data.code || data.item_code || `STK-${data.id || 1}`;
    this.itemName = data.itemName || data.item_name || "Raw Material";
    this.qty = Number(data.qty ?? data.quantity ?? 0);
    this.buyCost = Number(data.buyCost ?? data.buy_price ?? data.buy ?? 0);
    this.sellingPrice = Number(data.sellingPrice ?? data.sell_price ?? data.price ?? 0);
    this.lowStockQty = Number(data.lowStockQty ?? data.low_stock_qty ?? 15);
    return this;
  }

  build() {
    return new InventoryStockReportRow({
      code: this.code,
      itemName: this.itemName,
      qty: this.qty,
      buyCost: this.buyCost,
      sellingPrice: this.sellingPrice,
      lowStockQty: this.lowStockQty
    });
  }
}

export default InventoryStockRowBuilder;
