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
