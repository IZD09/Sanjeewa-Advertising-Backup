/**
 * SanjeewaAdvertising - Payments Overview Handler
 *
 * Manages dual financial reconciliation (Job inflow vs GRN outflow),
 * KPI cards, payment status badges, and payment method badges.
 */

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
    // 1. Invoice Payments Stats
    const totalInvBilled = orderPayments.reduce((acc, p) => acc + (Number(p.totalBill) || 0), 0);
    const totalInvCollected = orderPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const totalInvPending = orderPayments.reduce((acc, p) => acc + (Number(p.balance) || 0), 0);

    const invCompleteCount = orderPayments.filter(p => p.stage === "Complete Payment").length;
    const invAdvanceCount = orderPayments.filter(p => p.stage === "Advance Payment").length;
    const invPendingCount = orderPayments.filter(p => p.stage === "Pending Payment").length;

    const kpiInvBilled = document.getElementById("kpiInvTotalBilled");
    const kpiInvCollected = document.getElementById("kpiInvTotalCollected");
    const kpiInvPending = document.getElementById("kpiInvTotalPending");
    const kpiInvCounts = document.getElementById("kpiInvStageCounts");

    if (kpiInvBilled) kpiInvBilled.textContent = `Rs. ${totalInvBilled.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    if (kpiInvCollected) kpiInvCollected.textContent = `Rs. ${totalInvCollected.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    if (kpiInvPending) kpiInvPending.textContent = `Rs. ${totalInvPending.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    if (kpiInvCounts) kpiInvCounts.innerHTML = `<strong>${invCompleteCount}</strong> Complete | <strong>${invAdvanceCount}</strong> Advance | <strong>${invPendingCount}</strong> Pending`;

    // Invoice Methods Breakdown
    const invCard = orderPayments.filter(p => p.method === "Card").reduce((a, p) => a + Number(p.amount), 0);
    const invCash = orderPayments.filter(p => p.method === "Cash").reduce((a, p) => a + Number(p.amount), 0);
    const invCheck = orderPayments.filter(p => p.method === "Check").reduce((a, p) => a + Number(p.amount), 0);
    const invTransfer = orderPayments.filter(p => p.method === "Bank Transfer").reduce((a, p) => a + Number(p.amount), 0);

    const elInvCard = document.getElementById("invMethodCardTotal");
    const elInvCash = document.getElementById("invMethodCashTotal");
    const elInvCheck = document.getElementById("invMethodCheckTotal");
    const elInvTransfer = document.getElementById("invMethodTransferTotal");

    if (elInvCard) elInvCard.textContent = `Rs. ${invCard.toLocaleString()}`;
    if (elInvCash) elInvCash.textContent = `Rs. ${invCash.toLocaleString()}`;
    if (elInvCheck) elInvCheck.textContent = `Rs. ${invCheck.toLocaleString()}`;
    if (elInvTransfer) elInvTransfer.textContent = `Rs. ${invTransfer.toLocaleString()}`;

    // 2. GRN Payments Stats
    const totalGrnBilled = grnPayments.reduce((acc, p) => acc + (Number(p.totalBill) || 0), 0);
    const totalGrnPaid = grnPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const totalGrnDue = grnPayments.reduce((acc, p) => acc + (Number(p.balance) || 0), 0);

    const grnCompleteCount = grnPayments.filter(p => p.stage === "Complete Payment").length;
    const grnAdvanceCount = grnPayments.filter(p => p.stage === "Advance Payment").length;
    const grnPendingCount = grnPayments.filter(p => p.stage === "Pending Payment").length;

    const kpiGrnBilled = document.getElementById("kpiGrnTotalBilled");
    const kpiGrnPaid = document.getElementById("kpiGrnTotalPaid");
    const kpiGrnDue = document.getElementById("kpiGrnTotalDue");
    const kpiGrnCounts = document.getElementById("kpiGrnStageCounts");

    if (kpiGrnBilled) kpiGrnBilled.textContent = `Rs. ${totalGrnBilled.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    if (kpiGrnPaid) kpiGrnPaid.textContent = `Rs. ${totalGrnPaid.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    if (kpiGrnDue) kpiGrnDue.textContent = `Rs. ${totalGrnDue.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    if (kpiGrnCounts) kpiGrnCounts.innerHTML = `<strong>${grnCompleteCount}</strong> Complete | <strong>${grnAdvanceCount}</strong> Advance | <strong>${grnPendingCount}</strong> Pending`;

    // GRN Methods Breakdown
    const grnCard = grnPayments.filter(p => p.method === "Card").reduce((a, p) => a + Number(p.amount), 0);
    const grnCash = grnPayments.filter(p => p.method === "Cash").reduce((a, p) => a + Number(p.amount), 0);
    const grnCheck = grnPayments.filter(p => p.method === "Check").reduce((a, p) => a + Number(p.amount), 0);
    const grnTransfer = grnPayments.filter(p => p.method === "Bank Transfer").reduce((a, p) => a + Number(p.amount), 0);

    const elGrnCard = document.getElementById("grnMethodCardTotal");
    const elGrnCash = document.getElementById("grnMethodCashTotal");
    const elGrnCheck = document.getElementById("grnMethodCheckTotal");
    const elGrnTransfer = document.getElementById("grnMethodTransferTotal");

    if (elGrnCard) elGrnCard.textContent = `Rs. ${grnCard.toLocaleString()}`;
    if (elGrnCash) elGrnCash.textContent = `Rs. ${grnCash.toLocaleString()}`;
    if (elGrnCheck) elGrnCheck.textContent = `Rs. ${grnCheck.toLocaleString()}`;
    if (elGrnTransfer) elGrnTransfer.textContent = `Rs. ${grnTransfer.toLocaleString()}`;
  }

  renderOverviewTab(orderPayments = [], grnPayments = []) {
    this.updateKPIs(orderPayments, grnPayments);

    const totalInflow = orderPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const totalOutflow = grnPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
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

