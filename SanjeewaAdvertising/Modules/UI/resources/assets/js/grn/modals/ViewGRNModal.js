/**
 * SanjeewaAdvertising - View GRN Modal
 *
 * Manages View/Print GRN voucher modal dialog (#viewGrnModal)
 * and printable voucher document generation.
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class ViewGRNModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getGrnRecords
   * @param {Function} context.formatCurrency
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
    this.activeGrnContext = null;

    this.bindEvents();
  }

  bindEvents() {
    const printGrnBtn = document.getElementById("printGrnDocBtn");
    if (printGrnBtn) {
      printGrnBtn.addEventListener("click", () => this.triggerPrintGrn());
    }
  }

  viewGRN(grnNumber) {
    const grnRecords = this.ctx.getGrnRecords ? this.ctx.getGrnRecords() : [];
    const rec = grnRecords.find(r => r.grn_number === grnNumber);
    if (!rec) return;

    this.activeGrnContext = rec;

    const docNo = document.getElementById("grnDocNumber");
    const docDate = document.getElementById("grnDocDate");
    const docSupplier = document.getElementById("grnDocSupplier");
    const docContact = document.getElementById("grnDocContact") || document.getElementById("grnDocInvoice");
    const docPO = document.getElementById("grnDocPO");
    const docStatus = document.getElementById("grnDocStatus");
    const docStatusTable = document.getElementById("grnDocStatusTable");
    const docReceivedBy = document.getElementById("grnDocReceivedBy");
    const docRemarks = document.getElementById("grnDocRemarks");
    const docSubTotal = document.getElementById("grnDocSubTotal");
    const docDiscount = document.getElementById("grnDocDiscount");
    const docNetTotal = document.getElementById("grnDocNetTotal");
    const tbody = document.getElementById("grnDocItemsTbody");

    if (docNo) docNo.textContent = rec.grn_number;
    if (docDate) docDate.textContent = rec.received_date;
    if (docSupplier) docSupplier.textContent = rec.supplier_name;
    if (docContact) docContact.textContent = rec.supplier_contact || rec.supplier_invoice_no || "N/A";
    if (docPO) docPO.textContent = rec.purchase_order_no || "N/A";
    if (docStatus) {
      docStatus.className = `grn-status-badge ${rec.status === "Completed" ? "completed" : "draft"}`;
      docStatus.textContent = rec.status;
    }
    if (docStatusTable) {
      docStatusTable.className = `grn-status-badge ${rec.status === "Completed" ? "completed" : "draft"}`;
      docStatusTable.textContent = rec.status;
    }
    if (docReceivedBy) docReceivedBy.textContent = rec.received_by;
    if (docRemarks) docRemarks.textContent = rec.remarks || "No additional notes provided.";
    if (docSubTotal) docSubTotal.textContent = this.ctx.formatCurrency(rec.sub_total);
    if (docDiscount) docDiscount.textContent = this.ctx.formatCurrency(rec.discount || 0);
    if (docNetTotal) docNetTotal.textContent = this.ctx.formatCurrency(rec.net_total);

    if (tbody) {
      tbody.innerHTML = "";
      if (rec.items && rec.items.length > 0) {
        rec.items.forEach((item, idx) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${idx + 1}</td>
            <td><strong>${item.item_name}</strong> <span style="font-size: 11px; color: #666;">(${item.item_id})</span></td>
            <td><span class="grn-code-badge" style="font-size: 11px;">${item.batch_id || "PENDING"}</span></td>
            <td>${item.unit}</td>
            <td class="text-right"><strong>${(item.qty_received || 0).toLocaleString()}</strong></td>
            <td class="text-right">${this.ctx.formatCurrency(item.unit_cost)}</td>
            <td class="text-right" style="font-weight: bold;">${this.ctx.formatCurrency(item.item_total)}</td>
          `;
          tbody.appendChild(tr);
        });
      }
    }

    this.openModal("viewGrnModal");
  }

  triggerPrintGrn() {
    const printArea = document.getElementById("grnPrintArea");
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
      .grn-status-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; border: 1px solid #52c41a; color: #52c41a; background: #f6ffed; }
      .grn-status-badge.draft { border-color: #faad14; color: #faad14; background: #fffbe6; }
      .grn-voucher-signatures { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; }
      .grn-sig-box { width: 180px; border-top: 1px dashed #666; text-align: center; font-size: 12px; color: #555; padding-top: 5px; }
    `;

    this.printDocument(
      printArea.innerHTML,
      `GRN - ${this.activeGrnContext?.grn_number || "Document"}`,
      extraStyles
    );
  }
}

