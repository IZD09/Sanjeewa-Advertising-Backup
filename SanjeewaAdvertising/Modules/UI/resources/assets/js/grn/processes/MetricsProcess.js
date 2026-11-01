/**
 * SanjeewaAdvertising - GRN Metrics & KPI Process
 *
 * Calculates and updates GRN overview KPI cards and open purchase order badges.
 */

export class MetricsProcess {
  /**
   * @param {Object} context
   * @param {Function} context.getGrnRecords
   * @param {Function} context.getPurchaseOrders
   * @param {Function} context.formatCurrency
   */
  constructor(context) {
    this.ctx = context;
  }

  renderKPIs() {
    const grnRecords = this.ctx.getGrnRecords ? this.ctx.getGrnRecords() : [];
    const totalGrns = grnRecords.length;
    let completedCount = 0;
    let draftCount = 0;
    let totalValue = 0;

    grnRecords.forEach(rec => {
      if (rec.status === "Completed") {
        completedCount++;
        totalValue += (parseFloat(rec.net_total) || 0);
      } else {
        draftCount++;
      }
    });

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl("grnKpiTotal", totalGrns);
    setEl("grnKpiCompleted", completedCount);
    setEl("grnKpiValue", this.ctx.formatCurrency ? this.ctx.formatCurrency(totalValue) : totalValue);
    setEl("grnKpiDraft", draftCount);
  }

  renderOpenPoBadge() {
    const badge = document.getElementById("grnOpenPoBadge");
    if (!badge) return;
    const purchaseOrders = this.ctx.getPurchaseOrders ? this.ctx.getPurchaseOrders() : [];
    badge.textContent = purchaseOrders.filter(p => p.status === "Pending" || p.status === "Partial").length;
  }
}

