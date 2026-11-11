/**
 * SanjeewaAdvertising - Payment KPI Card Builder
 *
 * Implements Builder Pattern (GoF) extending Core BaseTableRowBuilder:
 * - PaymentKpiCardEntity: Encapsulates individual KPI metric card data and handles DOM rendering/updating.
 * - PaymentKpiCardBuilder: Fluent builder for KPI metric cards across all payment tabs:
 *     1. Invoice Payments (Total Billed, Total Collected, Pending Receivables, Stages Breakdown, Method Totals)
 *     2. GRN Stock Payments (Total Stock Billed, Supplier Paid, Outstanding Payables, Stages Breakdown, Method Totals)
 *     3. Operating Expenses (Total Monthly Bills, Paid Bills, Due at Month-End, Progress %)
 *     4. Reconciliation & Overview (Inflow, Outflow, Net Cash Position, Receivables vs Payables)
 */

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";

/**
 * PaymentKpiCardEntity - Entity model for a Payment KPI metric card
 */
export class PaymentKpiCardEntity {
  /**
   * @param {Object} [data={}]
   */
  constructor(data = {}) {
    this.valueId = data.valueId || data.id || "";
    this.label = data.label || "Metric";
    this.value = data.value ?? "Rs. 0.00";
    this.valueColor = data.valueColor || "";
    this.subText = data.subText || "";
    this.subElementId = data.subElementId || "";
    this.icon = data.icon || "fa-chart-pie";
    this.iconColor = data.iconColor || "";
    this.theme = data.theme || "metric-blue";
  }

  /**
   * Update existing DOM elements representing this KPI card.
   */
  updateDom() {
    if (typeof document === "undefined") return;

    if (this.valueId) {
      const valEl = document.getElementById(this.valueId);
      if (valEl) {
        if (typeof this.value === "string" && this.value.includes("<")) {
          valEl.innerHTML = this.value;
        } else {
          valEl.textContent = String(this.value);
        }
        if (this.valueColor) {
          valEl.style.color = this.valueColor;
        }
      }
    }

    if (this.subElementId && this.subText) {
      const subEl = document.getElementById(this.subElementId);
      if (subEl) {
        if (typeof this.subText === "string" && this.subText.includes("<")) {
          subEl.innerHTML = this.subText;
        } else {
          subEl.textContent = String(this.subText);
        }
      }
    }
  }

  /**
   * Render a new KPI card DOM element (<div class="pay-metric-card">).
   * @returns {HTMLDivElement}
   */
  render() {
    const card = document.createElement("div");
    card.className = `pay-metric-card ${this.theme}`;

    const valIdAttr = this.valueId ? ` id="${this.valueId}"` : "";
    const valStyleAttr = this.valueColor ? ` style="color: ${this.valueColor};"` : "";
    const iconStyleAttr = this.iconColor ? ` style="color: ${this.iconColor};"` : "";

    card.innerHTML = `
      <div class="pay-metric-label">
        <span>${this.label}</span>
        <i class="fa-solid ${this.icon}"${iconStyleAttr}></i>
      </div>
      <div class="pay-metric-value"${valIdAttr}${valStyleAttr}>${this.value}</div>
      ${this.subText ? `<div class="pay-metric-sub"${this.subElementId ? ` id="${this.subElementId}"` : ""}>${this.subText}</div>` : ""}
    `;

    return card;
  }
}

/**
 * PaymentKpiCardBuilder - Fluent builder class for Payment KPI Summary Cards
 */
export class PaymentKpiCardBuilder extends BaseTableRowBuilder {
  setValueId(id) {
    return this.set("valueId", id);
  }

  setLabel(label) {
    return this.set("label", label);
  }

  setValue(value) {
    return this.set("value", value);
  }

  setValueColor(color) {
    return this.set("valueColor", color);
  }

  setSubText(text, elementId = "") {
    this.set("subText", text);
    if (elementId) this.set("subElementId", elementId);
    return this;
  }

  setIcon(icon, color = "") {
    this.set("icon", icon);
    if (color) this.set("iconColor", color);
    return this;
  }

  setTheme(theme) {
    return this.set("theme", theme);
  }

  buildEntity() {
    return new PaymentKpiCardEntity(this._data);
  }

  build() {
    return this.buildEntity().render();
  }

  update() {
    this.buildEntity().updateDom();
    return this;
  }

  // =========================================================================
  // BATCH COMPUTATION & CARD LOADING HELPERS
  // =========================================================================

  /**
   * Format currency helper.
   * @param {number|string} amount
   * @returns {string}
   */
  static formatAmount(amount) {
    const num = parseFloat(amount);
    if (isNaN(num)) return "Rs. 0.00";
    return `Rs. ${num.toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  /**
   * Build and update all KPI summary cards on the Customer Invoice Payments tab.
   * @param {Array} orderPayments
   */
  static buildInvoiceMetrics(orderPayments = []) {
    const list = Array.isArray(orderPayments) ? orderPayments : [];

    const totalBilled = list.reduce((sum, p) => sum + (Number(p.totalBill ?? p.total_amount ?? p.totalAmount) || 0), 0);
    const totalCollected = list.reduce((sum, p) => sum + (Number(p.paidAmount ?? p.paid_amount ?? p.amount) || 0), 0);
    const totalPending = list.reduce((sum, p) => sum + (Number(p.balanceAmount ?? p.balance_amount ?? p.balance) || 0), 0);

    const completeCount = list.filter(p => p.stage === "Complete Payment" || p.payment_status === "Paid").length;
    const advanceCount = list.filter(p => p.stage === "Advance Payment" || p.payment_status === "Partial").length;
    const pendingCount = list.filter(p => p.stage === "Pending Payment" || p.payment_status === "Pending").length;

    // Card 1: Total Jobs Invoiced
    new PaymentKpiCardBuilder()
      .setValueId("kpiInvTotalBilled")
      .setValue(this.formatAmount(totalBilled))
      .update();

    // Card 2: Total Collected Revenue
    new PaymentKpiCardBuilder()
      .setValueId("kpiInvTotalCollected")
      .setValue(this.formatAmount(totalCollected))
      .setValueColor("#10b981")
      .update();

    // Card 3: Pending Receivables
    new PaymentKpiCardBuilder()
      .setValueId("kpiInvTotalPending")
      .setValue(this.formatAmount(totalPending))
      .setValueColor("#ef4444")
      .update();

    // Card 4: Payment Stages Breakdown
    new PaymentKpiCardBuilder()
      .setValueId("kpiInvStageCounts")
      .setValue(`<strong>${completeCount}</strong> Complete | <strong>${advanceCount}</strong> Advance | <strong>${pendingCount}</strong> Pending`)
      .update();

    // Tab Badge Count
    const tabBadge = document.getElementById("tabBadgeInvoiceCount");
    if (tabBadge) tabBadge.textContent = String(list.length);

    // Method Breakdown Badges
    const cardAmt = list.filter(p => p.method === "Card").reduce((sum, p) => sum + (Number(p.paidAmount ?? p.amount) || 0), 0);
    const cashAmt = list.filter(p => p.method === "Cash").reduce((sum, p) => sum + (Number(p.paidAmount ?? p.amount) || 0), 0);
    const checkAmt = list.filter(p => p.method === "Check").reduce((sum, p) => sum + (Number(p.paidAmount ?? p.amount) || 0), 0);
    const transferAmt = list.filter(p => p.method === "Bank Transfer").reduce((sum, p) => sum + (Number(p.paidAmount ?? p.amount) || 0), 0);

    const elCard = document.getElementById("invMethodCardTotal");
    const elCash = document.getElementById("invMethodCashTotal");
    const elCheck = document.getElementById("invMethodCheckTotal");
    const elTransfer = document.getElementById("invMethodTransferTotal");

    if (elCard) elCard.textContent = this.formatAmount(cardAmt);
    if (elCash) elCash.textContent = this.formatAmount(cashAmt);
    if (elCheck) elCheck.textContent = this.formatAmount(checkAmt);
    if (elTransfer) elTransfer.textContent = this.formatAmount(transferAmt);

    return { totalBilled, totalCollected, totalPending, completeCount, advanceCount, pendingCount };
  }

  /**
   * Build and update all KPI summary cards on the Supplier GRN Payments tab.
   * @param {Array} grnPayments
   */
  static buildGrnMetrics(grnPayments = []) {
    const list = Array.isArray(grnPayments) ? grnPayments : [];

    const totalBilled = list.reduce((sum, p) => sum + (Number(p.totalBill ?? p.total_amount ?? p.net_total) || 0), 0);
    const totalPaid = list.reduce((sum, p) => sum + (Number(p.paidAmount ?? p.paid_amount ?? p.amount) || 0), 0);
    const totalDue = list.reduce((sum, p) => sum + (Number(p.balanceAmount ?? p.balance_amount ?? p.balance) || 0), 0);

    const completeCount = list.filter(p => p.stage === "Complete Payment" || p.payment_status === "Paid").length;
    const advanceCount = list.filter(p => p.stage === "Advance Payment" || p.payment_status === "Partial").length;
    const pendingCount = list.filter(p => p.stage === "Pending Payment" || p.payment_status === "Pending").length;

    // Card 1: Total GRN Stock Billed
    new PaymentKpiCardBuilder()
      .setValueId("kpiGrnTotalBilled")
      .setValue(this.formatAmount(totalBilled))
      .update();

    // Card 2: Paid to Suppliers
    new PaymentKpiCardBuilder()
      .setValueId("kpiGrnTotalPaid")
      .setValue(this.formatAmount(totalPaid))
      .setValueColor("var(--blue, #2563eb)")
      .update();

    // Card 3: Outstanding Payables
    new PaymentKpiCardBuilder()
      .setValueId("kpiGrnTotalDue")
      .setValue(this.formatAmount(totalDue))
      .setValueColor("#ef4444")
      .update();

    // Card 4: Payment Stages Breakdown
    new PaymentKpiCardBuilder()
      .setValueId("kpiGrnStageCounts")
      .setValue(`<strong>${completeCount}</strong> Complete | <strong>${advanceCount}</strong> Advance | <strong>${pendingCount}</strong> Pending`)
      .update();

    // Tab Badge Count
    const tabBadge = document.getElementById("tabBadgeGrnCount");
    if (tabBadge) tabBadge.textContent = String(list.length);

    // Method Breakdown Badges
    const cardAmt = list.filter(p => p.method === "Card").reduce((sum, p) => sum + (Number(p.paidAmount ?? p.amount) || 0), 0);
    const cashAmt = list.filter(p => p.method === "Cash").reduce((sum, p) => sum + (Number(p.paidAmount ?? p.amount) || 0), 0);
    const checkAmt = list.filter(p => p.method === "Check").reduce((sum, p) => sum + (Number(p.paidAmount ?? p.amount) || 0), 0);
    const transferAmt = list.filter(p => p.method === "Bank Transfer").reduce((sum, p) => sum + (Number(p.paidAmount ?? p.amount) || 0), 0);

    const elCard = document.getElementById("grnMethodCardTotal");
    const elCash = document.getElementById("grnMethodCashTotal");
    const elCheck = document.getElementById("grnMethodCheckTotal");
    const elTransfer = document.getElementById("grnMethodTransferTotal");

    if (elCard) elCard.textContent = this.formatAmount(cardAmt);
    if (elCash) elCash.textContent = this.formatAmount(cashAmt);
    if (elCheck) elCheck.textContent = this.formatAmount(checkAmt);
    if (elTransfer) elTransfer.textContent = this.formatAmount(transferAmt);

    return { totalBilled, totalPaid, totalDue, completeCount, advanceCount, pendingCount };
  }

  /**
   * Build and update all KPI summary cards on the Operating Expenses tab.
   * @param {Array} expenses
   * @param {string} [monthFilter="ALL"]
   */
  static buildExpenseMetrics(expenses = [], monthFilter = "ALL") {
    const allExpenses = Array.isArray(expenses) ? expenses : [];
    const monthExpenses = allExpenses.filter(b => {
      if (!monthFilter || monthFilter === "ALL") return true;
      return b.month === monthFilter;
    });

    const totalBilled = monthExpenses.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const paidList = monthExpenses.filter(b => b.status === "Paid");
    const pendingList = monthExpenses.filter(b => b.status === "Pending" || b.status === "Overdue");

    const totalPaid = paidList.reduce((sum, b) => sum + (Number(b.paidAmount || b.amount) || 0), 0);
    const totalPending = pendingList.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

    const paidCount = paidList.length;
    const pendingCount = pendingList.length;
    const progressPercent = totalBilled > 0
      ? Math.round((totalPaid / totalBilled) * 100)
      : (monthExpenses.length > 0 && pendingCount === 0 ? 100 : 0);

    // Card 1: Total Monthly Bills
    new PaymentKpiCardBuilder()
      .setValueId("kpiExpTotalBilled")
      .setValue(this.formatAmount(totalBilled))
      .setSubText(monthFilter === "ALL" ? "Total overhead bills across all periods" : "Total overhead bills for this month", "kpiExpTotalSub")
      .update();

    // Card 2: Paid Bills
    new PaymentKpiCardBuilder()
      .setValueId("kpiExpTotalPaid")
      .setValue(this.formatAmount(totalPaid))
      .setValueColor("#10b981")
      .setSubText(`${paidCount} bills settled`, "kpiExpPaidCount")
      .update();

    // Card 3: Due at Month-End
    new PaymentKpiCardBuilder()
      .setValueId("kpiExpTotalPending")
      .setValue(this.formatAmount(totalPending))
      .setValueColor("#ef4444")
      .setSubText(`${pendingCount} bills pending settlement`, "kpiExpPendingCount")
      .update();

    // Card 4: Settlement Progress
    new PaymentKpiCardBuilder()
      .setValueId("kpiExpProgressPercent")
      .setValue(`${progressPercent}%`)
      .setValueColor("var(--blue, #2563eb)")
      .update();

    const progressBar = document.getElementById("kpiExpProgressBar");
    if (progressBar) progressBar.style.width = `${progressPercent}%`;

    // Tab Badge Count
    const tabBadge = document.getElementById("tabBadgeExpensesCount");
    if (tabBadge) tabBadge.textContent = String(pendingCount);

    return { totalBilled, totalPaid, totalPending, paidCount, pendingCount, progressPercent };
  }

  /**
   * Build and update all KPI summary cards on the Financial Overview tab.
   * @param {Array} orderPayments
   * @param {Array} grnPayments
   */
  static buildOverviewMetrics(orderPayments = [], grnPayments = []) {
    const orders = Array.isArray(orderPayments) ? orderPayments : [];
    const grns = Array.isArray(grnPayments) ? grnPayments : [];

    const jobInflow = orders.reduce((sum, p) => sum + (Number(p.paidAmount ?? p.paid_amount ?? p.amount) || 0), 0);
    const grnOutflow = grns.reduce((sum, p) => sum + (Number(p.paidAmount ?? p.paid_amount ?? p.amount) || 0), 0);
    const netCash = jobInflow - grnOutflow;

    const totalReceivables = orders.reduce((sum, p) => sum + (Number(p.balanceAmount ?? p.balance_amount ?? p.balance) || 0), 0);
    const totalPayables = grns.reduce((sum, p) => sum + (Number(p.balanceAmount ?? p.balance_amount ?? p.balance) || 0), 0);

    new PaymentKpiCardBuilder()
      .setValueId("ovJobCashInflow")
      .setValue(this.formatAmount(jobInflow))
      .setValueColor("#2563eb")
      .update();

    new PaymentKpiCardBuilder()
      .setValueId("ovGrnCashOutflow")
      .setValue(this.formatAmount(grnOutflow))
      .setValueColor("#ef4444")
      .update();

    new PaymentKpiCardBuilder()
      .setValueId("ovNetOperatingCash")
      .setValue(this.formatAmount(netCash))
      .setValueColor(netCash >= 0 ? "#10b981" : "#ef4444")
      .update();

    const elRec = document.getElementById("ovReceivablesTotal");
    const elPay = document.getElementById("ovPayablesTotal");
    if (elRec) elRec.textContent = this.formatAmount(totalReceivables);
    if (elPay) elPay.textContent = this.formatAmount(totalPayables);

    return { jobInflow, grnOutflow, netCash, totalReceivables, totalPayables };
  }
}

export default PaymentKpiCardBuilder;
