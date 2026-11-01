/**
 * SanjeewaAdvertising - Place Order Metrics Process
 *
 * Calculates and updates KPIs and status counters on the Place Order dashboard.
 */

export class MetricsProcess {
  /**
   * @param {Object} context
   * @param {Function} context.getOrders
   */
  constructor(context) {
    this.ctx = context;
  }

  updateMetrics() {
    const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];

    let pending = 0;
    let inProgress = 0;
    let completed = 0;
    let totalRevenue = 0;

    orders.forEach(o => {
      const status = (o.orderStatus || "").toLowerCase();
      if (status === "pending") pending++;
      else if (status === "in progress" || status === "printing") inProgress++;
      else if (status === "completed" || status === "delivered") completed++;

      totalRevenue += (Number(o.totalAmount) || 0);
    });

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setTxt("kpiTotalOrders", orders.length);
    setTxt("kpiPendingOrders", pending);
    setTxt("kpiInProgressOrders", inProgress);
    setTxt("kpiCompletedOrders", completed);
    setTxt("kpiTotalRevenue", `Rs. ${totalRevenue.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
  }
}

