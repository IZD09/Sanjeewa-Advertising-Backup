/**
 * SanjeewaAdvertising - Payments Overview Handler
 *
 * Manages dual financial reconciliation (Job inflow vs GRN outflow),
 * KPI cards via PaymentKpiCardBuilder, payment status badges, and payment method badges.
 */

import { PaymentKpiCardBuilder } from "../builders/PaymentKpiCardBuilder.js";

export class PaymentsOverviewHandler {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.formatCurrency]
   */
  constructor(options = {}) {
    this.formatCurrency = options.formatCurrency || ((amt) => `Rs. ${(parseFloat(amt) || 0).toFixed(2)}`);
  }

  renderStageBadge(stage) {
    if (stage === "Complete Payment") {
      return `<span class="status-pill complete"><i class="fa-solid fa-circle-check"></i> Complete Payment</span>`;
    } else if (stage === "Advance Payment") {
      return `<span class="status-pill advance"><i class="fa-solid fa-hourglass-half"></i> Advance Payment</span>`;
    } else {
      return `<span class="status-pill pending"><i class="fa-solid fa-clock"></i> Pending Payment</span>`;
    }
  }

  renderMethodBadge(method, ref = "") {
    if (method === "Card") {
      return `<span class="method-pill card"><i class="fa-solid fa-credit-card"></i> Card</span>`;
    } else if (method === "Cash") {
      return `<span class="method-pill cash"><i class="fa-solid fa-money-bill-wave"></i> Cash</span>`;
    } else if (method === "Check") {
      return `<span class="method-pill check"><i class="fa-solid fa-money-check"></i> Check</span>`;
    } else {
      return `<span class="method-pill transfer"><i class="fa-solid fa-building-columns"></i> Bank Transfer</span>`;
    }
  }

  updateKPIs(orderPayments = [], grnPayments = []) {
    // 1. Invoice Payments Top KPI Cards
    PaymentKpiCardBuilder.buildInvoiceMetrics(orderPayments);

    // 2. GRN Payments Top KPI Cards
    PaymentKpiCardBuilder.buildGrnMetrics(grnPayments);
  }

  renderOverviewTab(orderPayments = [], grnPayments = []) {
    this.updateKPIs(orderPayments, grnPayments);

    // Overview cards
    PaymentKpiCardBuilder.buildOverviewMetrics(orderPayments, grnPayments);

    const totalInflow = (orderPayments || []).reduce((acc, p) => acc + (Number(p.paidAmount ?? p.paid_amount ?? p.amount) || 0), 0);
    const totalOutflow = (grnPayments || []).reduce((acc, p) => acc + (Number(p.paidAmount ?? p.paid_amount ?? p.amount) || 0), 0);
    const netCashPosition = totalInflow - totalOutflow;

    const elInflow = document.getElementById("overviewTotalInflow");
    const elOutflow = document.getElementById("overviewTotalOutflow");
    const elNet = document.getElementById("overviewNetCashPosition");

    if (elInflow) elInflow.textContent = this.formatCurrency(totalInflow);
    if (elOutflow) elOutflow.textContent = this.formatCurrency(totalOutflow);
    if (elNet) {
      elNet.textContent = this.formatCurrency(netCashPosition);
      elNet.style.color = netCashPosition >= 0 ? "#10b981" : "#ef4444";
    }

    // Inflow vs Outflow progress visualizer
    const totalVolume = totalInflow + totalOutflow;
    const elBarInflow = document.getElementById("barInflowShare");
    const elBarOutflow = document.getElementById("barOutflowShare");
    if (elBarInflow && elBarOutflow && totalVolume > 0) {
      const inflowPct = Math.round((totalInflow / totalVolume) * 100);
      const outflowPct = 100 - inflowPct;
      elBarInflow.style.width = `${inflowPct}%`;
      elBarOutflow.style.width = `${outflowPct}%`;
      elBarInflow.title = `Inflow: ${inflowPct}% (${this.formatCurrency(totalInflow)})`;
      elBarOutflow.title = `Outflow: ${outflowPct}% (${this.formatCurrency(totalOutflow)})`;
    }
  }
}

export default PaymentsOverviewHandler;
