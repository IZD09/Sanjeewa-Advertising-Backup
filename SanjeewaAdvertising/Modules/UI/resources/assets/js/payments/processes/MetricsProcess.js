/**
 * SanjeewaAdvertising - Payments Metrics Process
 *
 * Coordinates financial settlement KPIs, revenue summaries,
 * and overview breakdown panels.
 */

export class MetricsProcess {
  /**
   * @param {Object} context
   * @param {Function} context.updateKPIs
   * @param {Function} context.renderOverviewTab
   * @param {Function} context.getOrderPayments
   * @param {Function} context.getGrnPayments
   */
  constructor(context) {
    this.ctx = context;
  }

  updateMetrics() {
    const orderPayments = this.ctx.getOrderPayments ? this.ctx.getOrderPayments() : [];
    const grnPayments = this.ctx.getGrnPayments ? this.ctx.getGrnPayments() : [];

    if (this.ctx.updateKPIs) {
      this.ctx.updateKPIs(orderPayments, grnPayments);
    }
    if (this.ctx.renderOverviewTab) {
      this.ctx.renderOverviewTab(orderPayments, grnPayments);
    }
  }
}

