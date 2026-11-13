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
   * @param {Function} [context.getGrnKpis]
   * @param {Function} [context.getPoKpis]
   * @param {Function} context.formatCurrency
   */
  constructor(context) {
    this.ctx = context;
  }

  renderKPIs() {
    const grnRecords = this.ctx.getGrnRecords ? this.ctx.getGrnRecords() : [];
    const serverKpis = this.ctx.getGrnKpis ? this.ctx.getGrnKpis() : null;
    const grnPagination = this.ctx.getGrnPagination ? this.ctx.getGrnPagination() : null;

    let totalGrns = grnRecords.length;
    let completedCount = 0;
    let draftCount = 0;
    let totalValue = 0;

    if (serverKpis && typeof serverKpis.total === "number" && serverKpis.total >= grnRecords.length) {
      totalGrns = serverKpis.total;
      completedCount = serverKpis.completed || 0;
      draftCount = serverKpis.draft || 0;
      totalValue = parseFloat(serverKpis.total_value) || 0;
    } else if (grnPagination && typeof grnPagination.total === "number" && grnPagination.total >= grnRecords.length) {
      totalGrns = grnPagination.total;
    } else {
      grnRecords.forEach(rec => {
        if (rec.status === "Completed") {
          completedCount++;
          totalValue += (parseFloat(rec.net_total) || 0);
        } else {
          draftCount++;
        }
      });
    }

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl("grnKpiTotal", totalGrns);
    setEl("grnKpiCompleted", completedCount);
    setEl("grnKpiValue", this.ctx.formatCurrency ? this.ctx.formatCurrency(totalValue) : totalValue);
    setEl("grnKpiDraft", draftCount);
    setEl("grnRecordCountBadge", totalGrns);
  }

  renderOpenPoBadge() {
    const badge = document.getElementById("grnPoCountBadge") || document.getElementById("grnOpenPoBadge");
    if (!badge) return;
    const poKpis = this.ctx.getPoKpis ? this.ctx.getPoKpis() : null;
    const poPagination = this.ctx.getPoPagination ? this.ctx.getPoPagination() : null;
    const purchaseOrders = this.ctx.getPurchaseOrders ? this.ctx.getPurchaseOrders() : [];

    let totalPOs = purchaseOrders.length;
    if (poKpis && typeof poKpis.total === "number" && poKpis.total >= purchaseOrders.length) {
      totalPOs = poKpis.total;
    } else if (poPagination && typeof poPagination.total === "number" && poPagination.total >= purchaseOrders.length) {
      totalPOs = poPagination.total;
    }
    badge.textContent = totalPOs;
  }
}
