/**
 * SanjeewaAdvertising - Reports Executive Metrics Process
 *
 * Uses ExecutiveKpiCardBuilder to load and render data into the 5 executive KPI cards.
 */

import { ExecutiveKpiCardBuilder } from "../builders/ExecutiveKpiCardBuilder.js";

export class MetricsProcess {
  /**
   * @param {Object} [context={}]
   * @param {Function} [context.getPayload]
   */
  constructor(context = {}) {
    this.ctx = context;
    this.cardKeys = [
      "grossBillings",
      "grnPurchases",
      "operatingExpenses",
      "netProfit",
      "uncollected"
    ];
  }

  /**
   * Render or update all 5 KPI cards from provided data or context payload.
   *
   * @param {Object} [kpisData]
   */
  renderKpis(kpisData = null) {
    const dataToUse = kpisData || (this.ctx.getPayload ? this.ctx.getPayload()?.kpis : null);
    if (!dataToUse || typeof dataToUse !== "object") return;

    this.cardKeys.forEach((key) => {
      const cardEl = document.querySelector(`.rep-kpi-card[data-kpi-card="${key}"]`);
      if (cardEl && dataToUse[key]) {
        new ExecutiveKpiCardBuilder(cardEl)
          .fromData(dataToUse[key])
          .render();
      }
    });
  }

  updateMetrics(kpisData = null) {
    this.renderKpis(kpisData);
  }
}

export default MetricsProcess;
