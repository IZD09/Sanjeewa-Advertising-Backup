/**
 * SanjeewaAdvertising - Place Order Export Process
 *
 * Handles CSV export button event and file generation for orders records.
 */

export class ExportProcess {
  /**
   * @param {Object} context
   * @param {Function} context.getOrders
   * @param {Function} context.showToast
   */
  constructor(context) {
    this.ctx = context;
  }

  bindEvents() {
    const exportBtn = document.getElementById("exportOrdersBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportCSV());
    }
  }

  exportCSV() {
    const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
    if (!orders || orders.length === 0) {
      if (this.ctx.showToast) this.ctx.showToast("No orders available to export", "warning");
      return;
    }

    const headers = [
      "Order ID", "Date", "Customer Name", "Customer Mobile", "Product",
      "Dimensions", "Quantity", "Total Amount (LKR)", "Paid Amount (LKR)",
      "Balance (LKR)", "Payment Status", "Order Status", "Assigned Employee"
    ];

    const rows = orders.map(o => [
      `"${o.id}"`,
      `"${o.orderDate}"`,
      `"${o.customerName}"`,
      `"${o.customerMobile}"`,
      `"${o.productName}"`,
      `"${o.width}x${o.height} ${o.unit}"`,
      o.quantity,
      (Number(o.totalAmount) || 0).toFixed(2),
      (Number(o.paidAmount) || 0).toFixed(2),
      (Number(o.balanceAmount) || 0).toFixed(2),
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`,
      `"${o.assignedEmployee || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `Sanjeewa_Orders_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    if (this.ctx.showToast) this.ctx.showToast("Orders exported successfully as CSV!", "success");
  }
}

