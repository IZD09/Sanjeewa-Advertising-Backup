/**
 * SanjeewaAdvertising - View Purchase Order Modal
 *
 * Manages View/Print PO modal dialog (#viewPOModal),
 * printable document generation, and convert-to-GRN workflow action.
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class ViewPOModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getPurchaseOrders
   * @param {Function} context.formatCurrency
   * @param {Function} [context.createGrnForPO]
   */
  constructor(context) {
    super({
      activeModalClass: "open",
      overlaySelector: ".po-modal-overlay",
      toastContainerId: "poToastContainer",
      closeSelectors: ["[data-close-grn-modal]", "[data-close-modal]", ".po-modal-close"],
      autoBind: true
    });

    this.ctx = context;
    this.activePoContext = null;

    this.bindEvents();
  }

  bindEvents() {
    const printPoBtn = document.getElementById("printPoDocBtn");
    if (printPoBtn) {
      printPoBtn.addEventListener("click", () => this.triggerPrintPO());
    }

    const poCreateGrnActionBtn = document.getElementById("poCreateGrnActionBtn");
    if (poCreateGrnActionBtn) {
      poCreateGrnActionBtn.addEventListener("click", () => {
        if (this.activePoContext) {
          const poNo = this.activePoContext.po_number;
          this.closeModal("viewPOModal");
          if (this.ctx.createGrnForPO) {
            this.ctx.createGrnForPO(poNo);
          }
        }
      });
    }
  }

  viewPO(poNumber) {
    const purchaseOrders = this.ctx.getPurchaseOrders ? this.ctx.getPurchaseOrders() : [];
    const po = purchaseOrders.find(p => p.po_number === poNumber);
    if (!po) return;

    this.activePoContext = po;

    const docNo = document.getElementById("poDocNumber");
    const docStatus = document.getElementById("poDocStatus");
    const docSupplier = document.getElementById("poDocSupplier");
    const docDate = document.getElementById("poDocDate");
    const docContact = document.getElementById("poDocContact");
    const docExpDate = document.getElementById("poDocExpectedDate");
    const docRemarks = document.getElementById("poDocRemarks");
    const docTotal = document.getElementById("poDocTotal");
    const tbody = document.getElementById("poDocItemsTbody");

    if (docNo) docNo.textContent = po.po_number;
    if (docStatus) {
      docStatus.className = `grn-status-badge ${po.status.toLowerCase()}`;
      docStatus.textContent = po.status;
    }
    if (docSupplier) docSupplier.textContent = po.supplier_name;
    if (docDate) docDate.textContent = po.order_date;
    if (docContact) docContact.textContent = po.supplier_contact || "N/A";
    if (docExpDate) docExpDate.textContent = po.expected_date || "N/A";
    if (docRemarks) docRemarks.textContent = po.remarks || "Standard packaging & delivery terms apply.";
    if (docTotal) docTotal.textContent = this.ctx.formatCurrency(po.total_amount);

    if (tbody) {
      tbody.innerHTML = "";
      if (po.items && po.items.length > 0) {
        po.items.forEach((item, idx) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${idx + 1}</td>
            <td><strong>${item.item_name}</strong> <span style="font-size: 11px; color: #666;">(${item.item_id})</span></td>
            <td>${item.unit}</td>
            <td class="text-right"><strong>${(item.qty_ordered || 0).toLocaleString()}</strong></td>
            <td class="text-right" style="color: ${item.qty_received >= item.qty_ordered ? '#52c41a' : '#faad14'}; font-weight: 600;">
              ${(item.qty_received || 0).toLocaleString()}
            </td>
            <td class="text-right">${this.ctx.formatCurrency(item.unit_cost)}</td>
            <td class="text-right" style="font-weight: bold;">${this.ctx.formatCurrency(item.item_total)}</td>
          `;
          tbody.appendChild(tr);
        });
      }
    }

    const poCreateGrnActionBtn = document.getElementById("poCreateGrnActionBtn");
    if (poCreateGrnActionBtn) {
      poCreateGrnActionBtn.style.display = po.status === "Completed" ? "none" : "inline-flex";
    }

    this.openModal("viewPOModal");
  }

  triggerPrintPO() {
    const printArea = document.getElementById("poPrintArea");
    if (!printArea) return;

    const extraStyles = `
      .grn-voucher-header { display: flex; justify-content: space-between; border-bottom: 2px solid #1677ff; padding-bottom: 14px; margin-bottom: 16px; }
      .grn-voucher-brand strong { font-size: 22px; color: #000; display: block; }
      .grn-voucher-brand span { font-size: 12px; letter-spacing: 2px; color: #f97316; font-weight: 800; }
      .grn-voucher-meta-table { width: 100%; margin-bottom: 18px; font-size: 13px; border-collapse: collapse; }
      .grn-voucher-meta-table td { padding: 5px 8px; }
      .grn-voucher-items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12.5px; }
      .grn-voucher-items-table th { background: #f0f5ff; color: #1677ff; border: 1px solid #d9d9d9; padding: 8px 10px; font-weight: bold; }
      .grn-voucher-items-table td { border: 1px solid #e8e8e8; padding: 7px 10px; }
      .text-right { text-align: right; }
      .grn-code-badge { font-family: monospace; font-weight: bold; background: #e6f4ff; color: #1677ff; padding: 2px 6px; border-radius: 4px; }
      .grn-status-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; border: 1px solid #faad14; color: #faad14; background: #fffbe6; }
      .grn-status-badge.completed { border-color: #52c41a; color: #52c41a; background: #f6ffed; }
      .grn-voucher-signatures { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; }
      .grn-sig-box { width: 180px; border-top: 1px dashed #666; text-align: center; font-size: 12px; color: #555; padding-top: 5px; }
    `;

    this.printDocument(
      printArea.innerHTML,
      `Purchase Order - ${this.activePoContext?.po_number || "Document"}`,
      extraStyles
    );
  }
}

