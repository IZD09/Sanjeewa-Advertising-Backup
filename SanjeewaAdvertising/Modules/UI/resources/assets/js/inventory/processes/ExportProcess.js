/**
 * SanjeewaAdvertising - Inventory Export Process
 *
 * Handles CSV export button event and file generation for inventory stock records.
 */

export class ExportProcess {
  /**
   * @param {Object} context
   * @param {Function} context.getItems
   * @param {Function} context.getItemAvailableQty
   * @param {Function} context.getItemTotalValue
   * @param {Function} context.getItemStatus
   * @param {Function} context.showToast
   */
  constructor(context) {
    this.ctx = context;
  }

  bindEvents() {
    const exportBtn = document.getElementById("invExportBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportCSV());
    }
  }

  exportCSV() {
    const items = this.ctx.getItems ? this.ctx.getItems() : [];
    if (!items || items.length === 0) {
      if (this.ctx.showToast) this.ctx.showToast("No inventory items to export", "warning");
      return;
    }

    const headers = ["Item Code", "Item Name", "Category", "Supplier", "Available Qty", "Unit", "Min Threshold", "Unit Price (LKR)", "Total Asset Value (LKR)", "Status"];
    const rows = items.map(item => {
      const avail = this.ctx.getItemAvailableQty ? this.ctx.getItemAvailableQty(item) : 0;
      const totalVal = this.ctx.getItemTotalValue ? this.ctx.getItemTotalValue(item) : (avail * (item.unitPrice || 0));
      const status = this.ctx.getItemStatus ? this.ctx.getItemStatus(item) : "In Stock";

      return [
        `"${item.code}"`,
        `"${item.name}"`,
        `"${item.category}"`,
        `"${item.supplier || ''}"`,
        avail,
        `"${item.unit}"`,
        item.minThreshold || 0,
        (item.unitPrice || 0).toFixed(2),
        totalVal.toFixed(2),
        `"${status}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `Sanjeewa_Inventory_Stock_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    if (this.ctx.showToast) this.ctx.showToast("Inventory stock CSV exported successfully!", "success");
  }
}

