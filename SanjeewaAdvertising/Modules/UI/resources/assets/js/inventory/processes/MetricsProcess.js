/**
 * SanjeewaAdvertising - Inventory Metrics & KPI Process
 *
 * Calculates and updates inventory overview KPI summary cards.
 */

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
    let totalItems = items.length;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalAssetValue = 0;

    items.forEach(item => {
      const avail = this.ctx.getItemAvailableQty ? this.ctx.getItemAvailableQty(item) : 0;
      const status = this.ctx.getItemStatus ? this.ctx.getItemStatus(item) : "In Stock";
      const val = avail * (item.unitPrice || 0);

      totalAssetValue += val;
      if (status === "Low Stock") lowStockCount++;
      if (status === "Out of Stock") outOfStockCount++;
    });

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setTxt("kpiTotalItems", totalItems);
    setTxt("kpiTotalValue", this.ctx.formatCurrency ? this.ctx.formatCurrency(totalAssetValue) : totalAssetValue);
    setTxt("kpiLowStock", lowStockCount);
    setTxt("kpiOutOfStock", outOfStockCount);
  }
}

