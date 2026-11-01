/**
 * SanjeewaAdvertising - PO Table Handler
 *
 * Extends BaseTableLoader core class to filter, paginate, and render
 * Purchase Orders (PO) records.
 */

import { BaseTableLoader } from "../core/BaseTableLoader.js";

export class POTableHandler extends BaseTableLoader {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.formatCurrency]
   * @param {Function} [options.viewPO]
   * @param {Function} [options.createGrnForPO]
   */
  constructor(options = {}) {
    super({
      tbodyId: "poTableBody",
      paginationInfoId: "poPaginationInfo",
      paginationControlsId: "poPaginationControls",
      pageSize: options.pageSize || 10,
      colspan: 8,
      emptyIcon: "fa-clipboard-list",
      emptyMessage: "No Purchase Orders found",
      onPageChange: options.onPageChange
    });

    this.formatCurrency = options.formatCurrency || ((amt) => `Rs. ${(parseFloat(amt) || 0).toFixed(2)}`);
    this.viewPO = options.viewPO || (() => {});
    this.createGrnForPO = options.createGrnForPO || (() => {});
  }

  /**
   * Filter purchase orders array by search, status, and supplier.
   *
   * @param {Array} purchaseOrders
   * @param {string} searchTerm
   * @param {string} statusFilter
   * @param {string} supplierFilter
   * @returns {Array}
   */
  getFilteredPOs(purchaseOrders = [], searchTerm = "", statusFilter = "ALL", supplierFilter = "ALL") {
    const term = (searchTerm || "").toLowerCase().trim();

    return (purchaseOrders || []).filter(po => {
      const itemNames = po.items ? po.items.map(i => i.item_name).join(" ") : "";
      const matchesSearch = !term ||
        (po.po_number && po.po_number.toLowerCase().includes(term)) ||
        (po.supplier_name && po.supplier_name.toLowerCase().includes(term)) ||
        (po.supplier_contact && po.supplier_contact.toLowerCase().includes(term)) ||
        itemNames.toLowerCase().includes(term);

      const matchesStatus = statusFilter === "ALL" || po.status === statusFilter;
      const matchesSupplier = supplierFilter === "ALL" || po.supplier_name === supplierFilter;

      return matchesSearch && matchesStatus && matchesSupplier;
    });
  }

  /**
   * Render table body rows for purchase orders.
   *
   * @param {Array} purchaseOrders
   * @param {string} searchTerm
   * @param {string} statusFilter
   * @param {string} supplierFilter
   */
  render(purchaseOrders = [], searchTerm = "", statusFilter = "ALL", supplierFilter = "ALL") {
    const tbody = this.getTbody();
    if (!tbody) return;

    const filtered = this.getFilteredPOs(purchaseOrders, searchTerm, statusFilter, supplierFilter);

    if (filtered.length === 0) {
      this.renderEmptyState(
        "No Purchase Orders found. Create a new Purchase Order to request items from suppliers.",
        "fa-clipboard-list"
      );
      return;
    }

    tbody.innerHTML = "";

    filtered.forEach(po => {
      const tr = document.createElement("tr");

      // Items summary tags
      let itemsTags = "";
      if (po.items && po.items.length > 0) {
        itemsTags = po.items.map(item => `
          <span class="po-item-tag" title="${item.item_name}">
            <strong>${item.qty_ordered} ${item.unit}</strong> ${item.item_name.substring(0, 22)}${item.item_name.length > 22 ? "..." : ""}
          </span>
        `).join("");
      }

      let statusBadgeClass = "pending";
      let statusIcon = "fa-clock";
      if (po.status === "Completed") {
        statusBadgeClass = "completed";
        statusIcon = "fa-circle-check";
      } else if (po.status === "Partial") {
        statusBadgeClass = "partial";
        statusIcon = "fa-hourglass-half";
      }

      const isCompleted = po.status === "Completed";

      tr.innerHTML = `
        <td>
          <span class="grn-code-badge" style="background: #e6f4ff; color: #1677ff; border-color: #91caff;">
            ${po.po_number}
          </span>
        </td>
        <td><span style="font-size: 12.5px; color: var(--text);">${po.order_date}</span></td>
        <td><span style="font-size: 12.5px; font-weight: 600; color: #fa8c16;">${po.expected_date || "N/A"}</span></td>
        <td>
          <span class="inv-supplier-pill"><i class="fa-solid fa-truck-field"></i> ${po.supplier_name}</span>
          <div style="font-size: 11px; color: var(--text-muted); font-family: ui-monospace; margin-top: 3px;">
            <i class="fa-solid fa-phone" style="font-size: 10px;"></i> ${po.supplier_contact || "-"}
          </div>
        </td>
        <td style="max-width: 320px;">
          ${itemsTags}
        </td>
        <td class="text-right" style="font-weight: 700; color: var(--text);">
          ${this.formatCurrency(po.total_amount)}
        </td>
        <td>
          <span class="grn-status-badge ${statusBadgeClass}">
            <i class="fa-solid ${statusIcon}"></i> ${po.status}
          </span>
        </td>
        <td class="text-center">
          <div class="inv-actions-group">
            <button class="ant-btn-action" title="View Purchase Order" onclick="window.grnManager.viewPO('${po.po_number}')">
              <i class="fa-solid fa-eye"></i> View
            </button>
            ${!isCompleted ? `
              <button class="ant-btn-action" style="color: #52c41a; border-color: #b7eb8f; background: #f6ffed;" title="Create GRN for this PO" onclick="window.grnManager.createGrnForPO('${po.po_number}')">
                <i class="fa-solid fa-truck-ramp-box"></i> Receive (GRN)
              </button>
            ` : ""}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

