/**
 * SanjeewaAdvertising - GRN Table Handler
 *
 * Extends BaseTableLoader core class to filter, paginate, and render
 * Goods Received Notes (GRN) records.
 */

import { BaseTableLoader } from "../core/BaseTableLoader.js";

export class GRNTableHandler extends BaseTableLoader {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.formatCurrency]
   * @param {Function} [options.viewGRN]
   * @param {Function} [options.finalizeDraftGRN]
   */
  constructor(options = {}) {
    super({
      tbodyId: "grnTableBody",
      paginationInfoId: "grnPaginationInfo",
      paginationControlsId: "grnPaginationControls",
      pageSize: options.pageSize || 10,
      colspan: 9,
      emptyIcon: "fa-file-invoice",
      emptyMessage: "No Goods Received Notes found",
      onPageChange: options.onPageChange
    });

    this.formatCurrency = options.formatCurrency || ((amt) => `Rs. ${(parseFloat(amt) || 0).toFixed(2)}`);
    this.viewGRN = options.viewGRN || (() => {});
    this.finalizeDraftGRN = options.finalizeDraftGRN || (() => {});
  }

  /**
   * Filter GRN records array by search, status, and supplier.
   *
   * @param {Array} records
   * @param {string} searchTerm
   * @param {string} statusFilter
   * @param {string} supplierFilter
   * @returns {Array}
   */
  getFilteredRecords(records = [], searchTerm = "", statusFilter = "ALL", supplierFilter = "ALL") {
    const term = (searchTerm || "").toLowerCase().trim();

    return (records || []).filter(rec => {
      const matchesSearch = !term ||
        (rec.grn_number && rec.grn_number.toLowerCase().includes(term)) ||
        (rec.purchase_order_no && rec.purchase_order_no.toLowerCase().includes(term)) ||
        (rec.supplier_name && rec.supplier_name.toLowerCase().includes(term)) ||
        (rec.supplier_contact && rec.supplier_contact.toLowerCase().includes(term)) ||
        (rec.supplier_invoice_no && rec.supplier_invoice_no.toLowerCase().includes(term)) ||
        (rec.received_by && rec.received_by.toLowerCase().includes(term));

      const matchesStatus = statusFilter === "ALL" || rec.status === statusFilter;
      const matchesSupplier = supplierFilter === "ALL" || rec.supplier_name === supplierFilter;

      return matchesSearch && matchesStatus && matchesSupplier;
    });
  }

  /**
   * Render table body rows and update count badge.
   *
   * @param {Array} records
   * @param {string} searchTerm
   * @param {string} statusFilter
   * @param {string} supplierFilter
   */
  render(records = [], searchTerm = "", statusFilter = "ALL", supplierFilter = "ALL") {
    const tbody = this.getTbody();
    const countLabel = document.getElementById("grnTableCount");
    if (!tbody) return;

    const filtered = this.getFilteredRecords(records, searchTerm, statusFilter, supplierFilter);

    if (countLabel) {
      countLabel.textContent = `Showing ${filtered.length} of ${records.length} GRN notes`;
    }

    if (filtered.length === 0) {
      this.renderEmptyState(
        "No Goods Received Notes found. Create your first GRN by clicking '+ Create New GRN'",
        "fa-file-invoice"
      );
      return;
    }

    tbody.innerHTML = "";

    filtered.forEach(rec => {
      const isCompleted = rec.status === "Completed";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><span class="grn-code-badge">${rec.grn_number}</span></td>
        <td>
          <span class="inv-supplier-pill"><i class="fa-solid fa-truck-field"></i> ${rec.supplier_name}</span>
        </td>
        <td><span style="font-family: ui-monospace; font-weight: 600; color: var(--text);"><i class="fa-solid fa-phone" style="font-size: 11px; color: var(--primary); margin-right: 5px;"></i>${rec.supplier_contact || rec.supplier_invoice_no || "N/A"}</span></td>
        <td>${rec.received_date}</td>
        <td>
          <span class="grn-code-badge" style="background: #f6ffed; color: #389e0d; border-color: #b7eb8f; display: inline-flex; align-items: center; gap: 4px;">
            <i class="fa-solid fa-file-invoice" style="font-size: 11px;"></i> ${rec.purchase_order_no || "PO-2026-088"}
          </span>
          <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 2px;">
            ${rec.items ? rec.items.length : 0} items
          </span>
        </td>
        <td class="text-right" style="font-weight: 700; color: var(--text);">${this.formatCurrency(rec.net_total)}</td>
        <td><span style="font-size: 12px; color: var(--text-muted);">${rec.received_by}</span></td>
        <td>
          <span class="grn-status-badge ${isCompleted ? "completed" : "draft"}">
            <i class="fa-solid ${isCompleted ? "fa-circle-check" : "fa-clock"}"></i>
            ${rec.status}
          </span>
        </td>
        <td class="text-center">
          <div class="inv-actions-group">
            <button class="ant-btn-action" title="View GRN Document" onclick="window.grnManager.viewGRN('${rec.grn_number}')">
              <i class="fa-solid fa-eye"></i> View
            </button>
            ${!isCompleted ? `
              <button class="ant-btn-action" style="color: #52c41a; border-color: #b7eb8f;" title="Complete GRN & Update Stock" onclick="window.grnManager.finalizeDraftGRN('${rec.grn_number}')">
                <i class="fa-solid fa-check-double"></i> Complete
              </button>
            ` : ""}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

