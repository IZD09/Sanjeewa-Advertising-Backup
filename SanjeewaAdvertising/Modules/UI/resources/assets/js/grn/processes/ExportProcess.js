/**
 * SanjeewaAdvertising - GRN Export Process
 *
 * Handles CSV export button event and file generation for GRN records.
 */

export class ExportProcess {
  /**
   * @param {Object} context
   * @param {Function} context.getGrnRecords
   * @param {Function} context.showToast
   */
  constructor(context) {
    this.ctx = context;
  }

  bindEvents() {
    const exportBtn = document.getElementById("grnExportBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportCSV());
    }
  }

  exportCSV() {
    const grnRecords = this.ctx.getGrnRecords ? this.ctx.getGrnRecords() : [];
    if (!grnRecords || grnRecords.length === 0) {
      if (this.ctx.showToast) this.ctx.showToast("No GRN records available to export", "warning");
      return;
    }

    const headers = ["GRN Number", "Purchase Order", "Supplier", "Supplier Contact", "Received Date", "Items Count", "Sub Total (LKR)", "Discount (LKR)", "Net Total (LKR)", "Received By", "Status"];
    const rows = grnRecords.map(r => [
      `"${r.grn_number}"`,
      `"${r.purchase_order_no || ''}"`,
      `"${r.supplier_name}"`,
      `"${r.supplier_contact || r.supplier_invoice_no || ''}"`,
      r.received_date,
      r.items ? r.items.length : 0,
      r.sub_total.toFixed(2),
      (r.discount || 0).toFixed(2),
      r.net_total.toFixed(2),
      `"${r.received_by}"`,
      `"${r.status}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `Sanjeewa_GRN_Records_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    if (this.ctx.showToast) this.ctx.showToast("GRN records CSV exported successfully!", "success");
  }
}

