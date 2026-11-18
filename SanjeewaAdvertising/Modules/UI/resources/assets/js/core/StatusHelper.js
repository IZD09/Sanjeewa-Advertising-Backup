/**
 * StatusHelper Component Class
 * Maps print job / order statuses and payment stages to row highlight CSS classes.
 * Provides both static helper utilities and instance method wrappers.
 */

"use strict";

export class StatusHelper {
  static STATUS_ROW_CLASS_MAP = {
    pending: "row-status-pending",
    designing: "row-status-designing",
    approved: "row-status-approved",
    printing: "row-status-printing",
    finishing: "row-status-finishing",
    "ready for pickup": "row-status-ready",
    completed: "row-status-completed",
    delivered: "row-status-delivered",
    cancelled: "row-status-cancelled",
    rejected: "row-status-cancelled",
    "in stock": "row-status-completed",
    "in-stock": "row-status-completed",
    "low stock": "row-status-pending",
    "low-stock": "row-status-pending",
    "out of stock": "row-status-cancelled",
    "out-of-stock": "row-status-cancelled",
  };

  /**
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Map a print job / order status string to its row highlight CSS class.
   *
   * @param {string|null|undefined} status
   * @returns {string}
   */
  static getStatusRowClass(status) {
    const key = String(status || "").toLowerCase().trim();
    return this.STATUS_ROW_CLASS_MAP[key] || "";
  }

  /**
   * Map a payment stage string to its row highlight CSS class (matching place-order design).
   *
   * @param {string|null|undefined} stage
   * @returns {string}
   */
  static getPaymentStageRowClass(stage) {
    const key = String(stage || "").toLowerCase().trim();
    if (key === "complete payment" || key === "complete" || key === "paid" || key === "settled" || key === "cleared") {
      return "row-stage-complete row-status-completed";
    }
    if (key === "advance payment" || key === "advance" || key === "partial" || key === "partial payment" || key === "partial paid") {
      return "row-stage-advance row-status-approved";
    }
    if (key === "overdue" || key === "overdue (31+ days)") {
      return "row-stage-overdue row-status-cancelled";
    }
    if (key === "pending payment" || key === "pending" || key === "unpaid" || key === "1-30 days") {
      return "row-stage-pending row-status-pending";
    }
    if (key === "no orders") {
      return "row-stage-neutral";
    }
    return "";
  }

  /**
   * Render universal payment method badge HTML.
   *
   * @param {string|null|undefined} method
   * @param {string} [ref=""]
   * @returns {string}
   */
  static renderPaymentMethodBadge(method, ref = "") {
    const raw = String(method || "Cash").trim();
    const m = raw.toLowerCase();

    if (m.includes("card")) {
      const label = raw === "Credit Card" || raw === "Debit Card" ? raw : "Card";
      return `<span class="method-pill card"><i class="fa-solid fa-credit-card"></i> ${label}</span>`;
    }
    if (m.includes("cash")) {
      return `<span class="method-pill cash"><i class="fa-solid fa-money-bill-wave"></i> Cash</span>`;
    }
    if (m.includes("cheque") || m.includes("check")) {
      return `<span class="method-pill check"><i class="fa-solid fa-money-check"></i> Cheque</span>`;
    }
    if (m.includes("qr") || m.includes("online")) {
      return `<span class="method-pill online"><i class="fa-solid fa-qrcode"></i> Online / QR</span>`;
    }
    if (m.includes("transfer") || m.includes("bank")) {
      return `<span class="method-pill transfer"><i class="fa-solid fa-building-columns"></i> Bank Transfer</span>`;
    }
    return `<span class="method-pill transfer"><i class="fa-solid fa-wallet"></i> ${raw}</span>`;
  }

  /**
   * Check if a payment method matches a filter string.
   *
   * @param {string} paymentMethod
   * @param {string} filterValue
   * @returns {boolean}
   */
  static matchesPaymentMethod(paymentMethod, filterValue) {
    if (!filterValue || filterValue === "ALL") return true;
    const filterNorm = String(filterValue).toLowerCase().trim();
    const m = String(paymentMethod || "").toLowerCase().trim();

    if (filterNorm === "card") {
      return m.includes("card");
    }
    if (filterNorm === "cash") {
      return m.includes("cash");
    }
    if (filterNorm === "check" || filterNorm === "cheque") {
      return m.includes("check") || m.includes("cheque");
    }
    if (filterNorm === "bank transfer" || filterNorm === "transfer" || filterNorm === "bank") {
      return m.includes("transfer") || m.includes("bank");
    }
    if (filterNorm === "online" || filterNorm === "qr" || filterNorm === "online / qr") {
      return m.includes("online") || m.includes("qr");
    }
    return m === filterNorm;
  }

  // --- Instance Method Wrappers for Flexible OOP Usage ---

  getStatusRowClass(status) {
    return StatusHelper.getStatusRowClass(status);
  }

  getPaymentStageRowClass(stage) {
    return StatusHelper.getPaymentStageRowClass(stage);
  }

  renderPaymentMethodBadge(method, ref = "") {
    return StatusHelper.renderPaymentMethodBadge(method, ref);
  }

  matchesPaymentMethod(paymentMethod, filterValue) {
    return StatusHelper.matchesPaymentMethod(paymentMethod, filterValue);
  }
}

export const getStatusRowClass = (...args) => StatusHelper.getStatusRowClass(...args);
export const getPaymentStageRowClass = (...args) => StatusHelper.getPaymentStageRowClass(...args);
export const renderPaymentMethodBadge = (...args) => StatusHelper.renderPaymentMethodBadge(...args);
export const matchesPaymentMethod = (...args) => StatusHelper.matchesPaymentMethod(...args);

export default StatusHelper;
