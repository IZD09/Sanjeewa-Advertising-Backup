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
    if (key === "complete payment" || key === "complete" || key === "paid") {
      return "row-stage-complete row-status-completed";
    }
    if (key === "advance payment" || key === "advance" || key === "partial" || key === "partial payment") {
      return "row-stage-advance row-status-approved";
    }
    if (key === "pending payment" || key === "pending" || key === "unpaid") {
      return "row-stage-pending row-status-pending";
    }
    return "";
  }

  // --- Instance Method Wrappers for Flexible OOP Usage ---

  getStatusRowClass(status) {
    return StatusHelper.getStatusRowClass(status);
  }

  getPaymentStageRowClass(stage) {
    return StatusHelper.getPaymentStageRowClass(stage);
  }
}

export const getStatusRowClass = (...args) => StatusHelper.getStatusRowClass(...args);
export const getPaymentStageRowClass = (...args) => StatusHelper.getPaymentStageRowClass(...args);

export default StatusHelper;
