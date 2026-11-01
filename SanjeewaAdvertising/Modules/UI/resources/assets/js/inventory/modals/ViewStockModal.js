/**
 * SanjeewaAdvertising - View Stock Details Modal
 *
 * Manages item details view modal (#viewStockDetailsModal),
 * batch breakdowns table, and transaction history timeline.
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class ViewStockModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getItems
   * @param {Function} context.getItemAvailableQty
   * @param {Function} context.formatCurrency
   */
  constructor(context) {
    super({
      activeModalClass: "open",
      overlaySelector: ".po-modal-overlay",
      toastContainerId: "poToastContainer",
      closeSelectors: ["[data-close-inv-modal]", "[data-close-modal]", ".po-modal-close"],
      autoBind: true
    });

    this.ctx = context;
    this.currentContextItem = null;
  }

  openViewModal(itemCode) {
    const items = this.ctx.getItems ? this.ctx.getItems() : [];
    const item = items.find(i => i.code === itemCode);
    if (!item) return;

    this.currentContextItem = item;
    const availQty = this.ctx.getItemAvailableQty ? this.ctx.getItemAvailableQty(item) : 0;
    const totalVal = availQty * (item.unitPrice || 0);

    const titleElem = document.getElementById("invViewModalTitle");
    if (titleElem) {
      titleElem.innerHTML = `<i class="fa-solid fa-boxes-stacked" style="color: #1677ff;"></i> ${item.name} <span class="inv-item-code" style="margin-left: 8px;">${item.code}</span> <span class="inv-supplier-pill" style="margin-left: 8px;"><i class="fa-solid fa-truck-field"></i> ${item.supplier || "Standard Supplier"}</span>`;
    }

    const totalQtyElem = document.getElementById("invViewTotalQty");
    const totalValElem = document.getElementById("invViewTotalVal");
    if (totalQtyElem) totalQtyElem.textContent = `${availQty.toLocaleString()} ${item.unit}`;
    if (totalValElem) totalValElem.textContent = this.ctx.formatCurrency ? this.ctx.formatCurrency(totalVal) : totalVal;

    const batchTbody = document.getElementById("invViewBatchTbody");
    if (batchTbody) {
      batchTbody.innerHTML = "";
      if (!item.batches || item.batches.length === 0) {
        batchTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 14px;">No batch records available</td></tr>`;
      } else {
        item.batches.forEach(b => {
          const batchVal = (parseFloat(b.availableQty) || 0) * (parseFloat(b.unitCost) || 0);
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td><strong style="color: #1677ff;">${b.id}</strong></td>
            <td>${b.receivedDate}</td>
            <td class="text-right">${this.ctx.formatCurrency ? this.ctx.formatCurrency(b.unitCost) : b.unitCost}</td>
            <td class="text-right">${b.initialQty.toLocaleString()}</td>
            <td class="text-right"><strong>${b.availableQty.toLocaleString()}</strong></td>
            <td class="text-right" style="font-weight: 700;">${this.ctx.formatCurrency ? this.ctx.formatCurrency(batchVal) : batchVal}</td>
          `;
          batchTbody.appendChild(tr);
        });
      }
    }

    const timelineElem = document.getElementById("invViewTimeline");
    if (timelineElem) {
      timelineElem.innerHTML = "";
      if (!item.transactions || item.transactions.length === 0) {
        timelineElem.innerHTML = `<div style="color: var(--text-muted); font-size: 12px; padding: 10px 0;">No stock transaction history recorded yet.</div>`;
      } else {
        item.transactions.slice(0, 8).forEach(tx => {
          const isAdd = tx.type === "ADD";
          const itemDiv = document.createElement("div");
          itemDiv.className = "inv-timeline-item";
          itemDiv.innerHTML = `
            <span class="inv-timeline-dot ${isAdd ? "add" : "deduct"}"></span>
            <div class="inv-timeline-content">
              <div class="inv-timeline-main">
                <span class="ant-tag ${isAdd ? "ant-tag-green" : "ant-tag-red"}" style="padding: 1px 7px; font-size: 10.5px; margin-right: 6px;">
                  ${isAdd ? "+ ADD" : "- DEDUCT"}
                </span>
                <strong>${tx.qty > 0 ? "+" : ""}${tx.qty} ${item.unit}</strong>
                <span style="color: var(--text-muted); margin-left: 8px;">(${tx.reason})</span>
              </div>
              <div class="inv-timeline-meta">
                <span><i class="fa-regular fa-clock"></i> ${tx.date}</span>
                <span><i class="fa-solid fa-barcode"></i> Batch: ${tx.batchId || "N/A"}</span>
                <span><i class="fa-regular fa-user"></i> ${tx.user || "Admin"}</span>
              </div>
            </div>
          `;
          timelineElem.appendChild(itemDiv);
        });
      }
    }

    this.openModal("viewStockDetailsModal");
  }
}

