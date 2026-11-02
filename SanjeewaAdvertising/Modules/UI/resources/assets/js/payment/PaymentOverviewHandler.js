/**
 * SanjeewaAdvertising - Payment Overview & Financial Analytics Handler
 * Computes financial KPIs, dual-channel settlements breakdown,
 * method aggregates, tab counts, and net cash flow reconciliation.
 */

"use strict";

export class PaymentOverviewHandler {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.getOrderPayments]
   * @param {Function} [options.getGrnPayments]
   */
  constructor(options = {}) {
    this.getOrderPayments = options.getOrderPayments || (() => []);
    this.getGrnPayments = options.getGrnPayments || (() => []);
  }

  /**
   * Recalculate and update all KPI cards across Invoice and GRN views.
   * @param {Array} [orderPayments]
   * @param {Array} [grnPayments]
   */
  updateKPIs(orderPayments = null, grnPayments = null) {
    const invList = orderPayments || this.getOrderPayments() || [];
    const grnList = grnPayments || this.getGrnPayments() || [];

    // 1. Invoice Payments Stats
    const totalInvBilled = invList.reduce((acc, p) => acc + (Number(p.totalBill) || 0), 0);
    const totalInvCollected = invList.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const totalInvPending = invList.reduce((acc, p) => acc + (Number(p.balance) || 0), 0);

    const invCompleteCount = invList.filter((p) => p.stage === "Complete Payment").length;
    const invAdvanceCount = invList.filter((p) => p.stage === "Advance Payment").length;
    const invPendingCount = invList.filter((p) => p.stage === "Pending Payment").length;

    const kpiInvBilled = document.getElementById("kpiInvTotalBilled");
    const kpiInvCollected = document.getElementById("kpiInvTotalCollected");
    const kpiInvPending = document.getElementById("kpiInvTotalPending");
    const kpiInvCounts = document.getElementById("kpiInvStageCounts");

    if (kpiInvBilled) {
      kpiInvBilled.textContent = `Rs. ${totalInvBilled.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    }
    if (kpiInvCollected) {
      kpiInvCollected.textContent = `Rs. ${totalInvCollected.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    }
    if (kpiInvPending) {
      kpiInvPending.textContent = `Rs. ${totalInvPending.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    }
    if (kpiInvCounts) {
      kpiInvCounts.innerHTML = `<strong>${invCompleteCount}</strong> Complete | <strong>${invAdvanceCount}</strong> Advance | <strong>${invPendingCount}</strong> Pending`;
    }

    // Invoice Methods Breakdown
    const invCard = invList.filter((p) => p.method === "Card").reduce((a, p) => a + (Number(p.amount) || 0), 0);
    const invCash = invList.filter((p) => p.method === "Cash").reduce((a, p) => a + (Number(p.amount) || 0), 0);
    const invCheck = invList.filter((p) => p.method === "Check").reduce((a, p) => a + (Number(p.amount) || 0), 0);
    const invTransfer = invList.filter((p) => p.method === "Bank Transfer").reduce((a, p) => a + (Number(p.amount) || 0), 0);

    const elInvCard = document.getElementById("invMethodCardTotal");
    const elInvCash = document.getElementById("invMethodCashTotal");
    const elInvCheck = document.getElementById("invMethodCheckTotal");
    const elInvTransfer = document.getElementById("invMethodTransferTotal");

    if (elInvCard) elInvCard.textContent = `Rs. ${invCard.toLocaleString()}`;
    if (elInvCash) elInvCash.textContent = `Rs. ${invCash.toLocaleString()}`;
    if (elInvCheck) elInvCheck.textContent = `Rs. ${invCheck.toLocaleString()}`;
    if (elInvTransfer) elInvTransfer.textContent = `Rs. ${invTransfer.toLocaleString()}`;

    // 2. GRN Payments Stats
    const totalGrnBilled = grnList.reduce((acc, p) => acc + (Number(p.totalBill) || 0), 0);
    const totalGrnPaid = grnList.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const totalGrnDue = grnList.reduce((acc, p) => acc + (Number(p.balance) || 0), 0);

    const grnCompleteCount = grnList.filter((p) => p.stage === "Complete Payment").length;
    const grnAdvanceCount = grnList.filter((p) => p.stage === "Advance Payment").length;
    const grnPendingCount = grnList.filter((p) => p.stage === "Pending Payment").length;

    const kpiGrnBilled = document.getElementById("kpiGrnTotalBilled");
    const kpiGrnPaid = document.getElementById("kpiGrnTotalPaid");
    const kpiGrnDue = document.getElementById("kpiGrnTotalDue");
    const kpiGrnCounts = document.getElementById("kpiGrnStageCounts");

    if (kpiGrnBilled) {
      kpiGrnBilled.textContent = `Rs. ${totalGrnBilled.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    }
    if (kpiGrnPaid) {
      kpiGrnPaid.textContent = `Rs. ${totalGrnPaid.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    }
    if (kpiGrnDue) {
      kpiGrnDue.textContent = `Rs. ${totalGrnDue.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    }
    if (kpiGrnCounts) {
      kpiGrnCounts.innerHTML = `<strong>${grnCompleteCount}</strong> Complete | <strong>${grnAdvanceCount}</strong> Advance | <strong>${grnPendingCount}</strong> Pending`;
    }

    // GRN Methods Breakdown
    const grnCard = grnList.filter((p) => p.method === "Card").reduce((a, p) => a + (Number(p.amount) || 0), 0);
    const grnCash = grnList.filter((p) => p.method === "Cash").reduce((a, p) => a + (Number(p.amount) || 0), 0);
    const grnCheck = grnList.filter((p) => p.method === "Check").reduce((a, p) => a + (Number(p.amount) || 0), 0);
    const grnTransfer = grnList.filter((p) => p.method === "Bank Transfer").reduce((a, p) => a + (Number(p.amount) || 0), 0);

    const elGrnCard = document.getElementById("grnMethodCardTotal");
    const elGrnCash = document.getElementById("grnMethodCashTotal");
    const elGrnCheck = document.getElementById("grnMethodCheckTotal");
    const elGrnTransfer = document.getElementById("grnMethodTransferTotal");

    if (elGrnCard) elGrnCard.textContent = `Rs. ${grnCard.toLocaleString()}`;
    if (elGrnCash) elGrnCash.textContent = `Rs. ${grnCash.toLocaleString()}`;
    if (elGrnCheck) elGrnCheck.textContent = `Rs. ${grnCheck.toLocaleString()}`;
    if (elGrnTransfer) elGrnTransfer.textContent = `Rs. ${grnTransfer.toLocaleString()}`;

    // Update Tab count badges
    const tabInvCount = document.getElementById("tabBadgeInvoiceCount");
    const tabGrnCount = document.getElementById("tabBadgeGrnCount");
    if (tabInvCount) tabInvCount.textContent = invList.length;
    if (tabGrnCount) tabGrnCount.textContent = grnList.length;
  }

  /**
   * Render financial overview tab with dual financial reconciliation & net operating cash flow.
   * @param {Array} [orderPayments]
   * @param {Array} [grnPayments]
   */
  renderOverviewTab(orderPayments = null, grnPayments = null) {
    const invList = orderPayments || this.getOrderPayments() || [];
    const grnList = grnPayments || this.getGrnPayments() || [];

    const totalJobInvoiced = invList.reduce((acc, p) => acc + (Number(p.totalBill) || 0), 0);
    const totalJobCollected = invList.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const totalJobReceivable = invList.reduce((acc, p) => acc + (Number(p.balance) || 0), 0);

    const totalGrnBilled = grnList.reduce((acc, p) => acc + (Number(p.totalBill) || 0), 0);
    const totalGrnPaid = grnList.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const totalGrnPayable = grnList.reduce((acc, p) => acc + (Number(p.balance) || 0), 0);

    const netOperatingCash = totalJobCollected - totalGrnPaid;

    const elNetCash = document.getElementById("ovNetOperatingCash");
    const elJobInflow = document.getElementById("ovJobCashInflow");
    const elGrnOutflow = document.getElementById("ovGrnCashOutflow");
    const elReceivables = document.getElementById("ovReceivablesTotal");
    const elPayables = document.getElementById("ovPayablesTotal");

    if (elNetCash) {
      elNetCash.textContent = `Rs. ${netOperatingCash.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
      elNetCash.style.color = netOperatingCash >= 0 ? "#10b981" : "#ef4444";
    }
    if (elJobInflow) {
      elJobInflow.textContent = `Rs. ${totalJobCollected.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    }
    if (elGrnOutflow) {
      elGrnOutflow.textContent = `Rs. ${totalGrnPaid.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    }
    if (elReceivables) {
      elReceivables.textContent = `Rs. ${totalJobReceivable.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    }
    if (elPayables) {
      elPayables.textContent = `Rs. ${totalGrnPayable.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    }
  }
}

