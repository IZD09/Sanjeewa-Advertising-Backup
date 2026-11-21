/**
 * SanjeewaAdvertising - Goods Received Note (GRN) Row Builder
 *
 * Implements Builder Pattern (GoF) extending the Core BaseTableRowBuilder:
 * - GrnEntity: Entity model encapsulating GRN consignment data and rendering <tr> HTML elements.
 * - GrnRowBuilder: Fluent builder class with setters, defaults, and .build() finalization.
 */

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";

/**
 * GrnEntity - Entity model for a Goods Received Note record
 */
export class GrnEntity {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  /**
   * Format currency helper
   * @param {number|string} amt
   * @returns {string}
   */
  formatCurrency(amt) {
    const num = parseFloat(amt) || 0;
    return `Rs. ${num.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Render complete table row DOM element (<tr>).
   * @returns {HTMLTableRowElement}
   */
  render() {
    const tr = document.createElement("tr");
    tr.id = `grnRow_${this.grn_number || ""}`;

    const statusKey = String(this.status || "").toLowerCase().trim();
    if (statusKey === "approved") {
      tr.className = "row-status-approved grn-clickable-row";
    } else if (statusKey === "pending stock") {
      tr.className = "row-status-pending-stock grn-clickable-row";
    } else if (statusKey === "completed") {
      tr.className = "row-status-completed grn-clickable-row";
    } else if (statusKey === "cancelled") {
      tr.className = "row-status-cancelled grn-clickable-row";
    } else {
      tr.className = "row-status-pending grn-clickable-row";
    }
    tr.style.cursor = "pointer";
    tr.title = `Click row to view Goods Received Note (${this.grn_number || "GRN"})`;

    const isApproved = statusKey === "approved";
    const isPendingStock = statusKey === "pending stock";
    const isCompleted = statusKey === "completed";
    const isCancelled = statusKey === "cancelled";
    const isPending = !isApproved && !isPendingStock && !isCompleted && !isCancelled;
    const canApprove = isPending;
    const canCancel = isPending || isApproved;

    let badgeClass = "pending";
    let badgeIcon = "fa-clock";
    if (isApproved) {
      badgeClass = "approved";
      badgeIcon = "fa-thumbs-up";
    } else if (isPendingStock) {
      badgeClass = "pending-stock";
      badgeIcon = "fa-boxes-stacked";
    } else if (isCompleted) {
      badgeClass = "completed";
      badgeIcon = "fa-circle-check";
    } else if (isCancelled) {
      badgeClass = "cancelled";
      badgeIcon = "fa-ban";
    }

    const itemCount = this.items && Array.isArray(this.items) ? this.items.length : 0;

    tr.innerHTML = `
      <td><span class="grn-code-badge">${this.grn_number || "—"}</span></td>
      <td>
        <span class="inv-supplier-pill"><i class="fa-solid fa-truck-field"></i> ${this.supplier_name || "—"}</span>
      </td>
      <td>
        <span style="font-family: ui-monospace; font-weight: 600; color: var(--text);">
          <i class="fa-solid fa-phone" style="font-size: 11px; color: var(--primary, #1677ff); margin-right: 5px;"></i>${this.supplier_contact || this.supplier_invoice_no || "N/A"}
        </span>
      </td>
      <td><span style="font-size: 12.5px; color: var(--text);">${this.received_date || "—"}</span></td>
      <td>
        <span class="grn-code-badge" style="background: #f6ffed; color: #389e0d; border-color: #b7eb8f; display: inline-flex; align-items: center; gap: 4px;">
          <i class="fa-solid fa-file-invoice" style="font-size: 11px;"></i> ${this.purchase_order_no || "N/A"}
        </span>
        <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 2px;">
          ${itemCount} items
        </span>
      </td>
      <td class="text-right" style="font-weight: 700; color: var(--text);">
        ${this.formatCurrency(this.net_total)}
      </td>
      <td><span style="font-size: 12px; color: var(--text-muted);">${this.received_by || "Admin User"}</span></td>
      <td>
        <span class="grn-status-badge ${badgeClass}">
          <i class="fa-solid ${badgeIcon}"></i>
          ${this.status || "Pending"}
        </span>
      </td>
      <td class="text-center">
        <div class="po-action-group">
          ${(isCompleted || isPendingStock) ? `
            <button type="button" class="ant-btn ant-btn-default ant-btn-sm" title="Print GRN Voucher" onclick="window.grnManager?.printGRN('${this.grn_number}')">
              <i class="fa-solid fa-print"></i> Print GRN
            </button>
          ` : `
            <button type="button" class="action-btn approve-action" title="${canApprove ? "Approve GRN" : (isApproved ? "Already Approved" : "Cannot Approve Cancelled GRN")}" onclick="window.grnManager?.approveGRN('${this.grn_number}')" ${canApprove ? "" : 'disabled style="opacity: 0.45; cursor: not-allowed;"'}>
              <i class="fa-solid fa-check"></i>
            </button>
            <button type="button" class="action-btn cancel-action" title="${canCancel ? "Cancel GRN" : "Already Cancelled"}" onclick="window.grnManager?.cancelGRN('${this.grn_number}')" ${canCancel ? "" : 'disabled style="opacity: 0.45; cursor: not-allowed;"'}>
              <i class="fa-solid fa-xmark"></i>
            </button>
            ${isApproved ? `
              <button type="button" class="ant-btn ant-btn-default ant-btn-sm" title="Complete GRN" onclick="window.grnManager?.finalizeDraftGRN('${this.grn_number}')">
                <i class="fa-solid fa-check-double" style="color: #10b981;"></i> Complete GRN
              </button>
            ` : (isPending ? `
              <button type="button" class="ant-btn ant-btn-default ant-btn-sm" disabled style="opacity: 0.45; cursor: not-allowed;" title="Approve this GRN first before completing">
                <i class="fa-solid fa-check-double"></i> Complete GRN
              </button>
            ` : `
              <button type="button" class="ant-btn ant-btn-default ant-btn-sm" title="Restore to Pending" onclick="window.grnManager?.restoreGRN('${this.grn_number}')">
                <i class="fa-solid fa-rotate-left" style="color: #1677ff;"></i> Restore
              </button>
            `)}
          `}
        </div>
      </td>
    `;

    tr.addEventListener("click", (e) => {
      if (e.target.closest(".po-action-group, button, a, input, select, .row-action-menu-wrap")) {
        return;
      }
      window.grnManager?.viewGRN(this.grn_number);
    });

    return tr;
  }

  renderTableRow() {
    return this.render();
  }

  static fromArray(list) {
    if (!Array.isArray(list)) return [];
    return list.map(item => new GrnRowBuilder(item).build());
  }
}

/**
 * GrnRowBuilder - Fluent builder extending Core BaseTableRowBuilder
 */
export class GrnRowBuilder extends BaseTableRowBuilder {
  constructor(initialData = null) {
    super(initialData);
  }

  reset() {
    super.reset();
    this._data = {
      grn_number: "",
      supplier_name: "",
      supplier_contact: "",
      supplier_invoice_no: "",
      received_date: new Date().toISOString().split("T")[0],
      purchase_order_no: "",
      sub_total: 0.0,
      discount: 0.0,
      net_total: 0.0,
      received_by: "Admin User",
      status: "Pending",
      remarks: "",
      items: []
    };
    return this;
  }

  setGrnNumber(val) {
    return this.set("grn_number", val);
  }

  setSupplier(name, contact = "", invoice = "") {
    this.set("supplier_name", name);
    if (contact) this.set("supplier_contact", contact);
    if (invoice) this.set("supplier_invoice_no", invoice);
    return this;
  }

  setReceivedDate(val) {
    return this.set("received_date", val);
  }

  setPurchaseOrder(po) {
    return this.set("purchase_order_no", po);
  }

  setTotals(subTotal, discount = 0, netTotal = null) {
    const sub = parseFloat(subTotal) || 0;
    const disc = parseFloat(discount) || 0;
    const net = netTotal !== null ? parseFloat(netTotal) : Math.max(0, sub - disc);
    this.set("sub_total", sub);
    this.set("discount", disc);
    this.set("net_total", net);
    return this;
  }

  setReceivedBy(val) {
    return this.set("received_by", val);
  }

  setStatus(val) {
    return this.set("status", val);
  }

  setRemarks(val) {
    return this.set("remarks", val);
  }

  setItems(items = []) {
    return this.set("items", Array.isArray(items) ? items : []);
  }

  build() {
    return new GrnEntity(this._data);
  }
}

