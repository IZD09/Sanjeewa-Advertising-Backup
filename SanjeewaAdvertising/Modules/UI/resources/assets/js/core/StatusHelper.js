const STATUS_ROW_CLASS_MAP = {
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
 * Map a print job / order status string to its row highlight CSS class.
 *
 * @param {string|null|undefined} status
 * @returns {string}
 */
export function getStatusRowClass(status) {
  const key = String(status || "").toLowerCase().trim();
  return STATUS_ROW_CLASS_MAP[key] || "";
}

/**
 * Map a payment stage string to its row highlight CSS class (matching place-order design).
 *
 * @param {string|null|undefined} stage
 * @returns {string}
 */
export function getPaymentStageRowClass(stage) {
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
