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
    let items = [];
    if (this.ctx.getItems) {
      items = this.ctx.getItems() || [];
    }
    const cleanCode = String(itemCode || "").trim().toLowerCase();

    // Look up item in detailedStocks
    let item = items.find(i =>
      String(i.code || "").trim().toLowerCase() === cleanCode ||
      String(i.id || "").trim().toLowerCase() === cleanCode ||
      String(i.stock_id || "").trim().toLowerCase() === cleanCode
    );

    // Fallback: check aggregatedItems
    if (!item && this.ctx.getAggregatedItems) {
      item = (this.ctx.getAggregatedItems() || []).find(i =>
        String(i.code || "").trim().toLowerCase() === cleanCode ||
        String(i.id || "").trim().toLowerCase() === cleanCode ||
        String(i.stock_items_id || "").trim().toLowerCase() === cleanCode
      );
    }

    if (!item) return;

    this.currentContextItem = item;
    const availQty = this.ctx.getItemAvailableQty ? (this.ctx.getItemAvailableQty(item) ?? 0) : (item.currentStock ?? item.qty ?? 0);
    const unitPrice = parseFloat(item.unitPrice ?? item.price ?? 0) || 0;
    const totalVal = availQty * unitPrice;
    const unit = item.unit || "Units";

    const titleElem = document.getElementById("invViewModalTitle");
    if (titleElem) {
      titleElem.innerHTML = `<i class="fa-solid fa-boxes-stacked" style="color: #1677ff;"></i> ${item.name || "Material Item"} <span class="inv-item-code" style="margin-left: 8px;">${item.code || ""}</span> <span class="inv-supplier-pill" style="margin-left: 8px;"><i class="fa-solid fa-truck-field"></i> ${item.supplier || "Standard Supplier"}</span>`;
    }

    const totalQtyElem = document.getElementById("invViewTotalQty");
    const totalValElem = document.getElementById("invViewTotalVal");
    if (totalQtyElem) totalQtyElem.textContent = `${Number(availQty || 0).toLocaleString()} ${unit}`;
    if (totalValElem) totalValElem.textContent = this.ctx.formatCurrency ? this.ctx.formatCurrency(totalVal) : `Rs. ${Number(totalVal || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const batchTbody = document.getElementById("invViewBatchTbody");
    if (batchTbody) {
      batchTbody.innerHTML = "";

      let batches = Array.isArray(item.batches) && item.batches.length > 0 ? [...item.batches] : [];

      // If item came from aggregated list, collect all consignment batches for this code from detailedStocks
      if (batches.length === 0 && Array.isArray(items) && items.length > 0) {
        const matchingStocks = items.filter(st => String(st.code || "").trim().toLowerCase() === cleanCode);
        if (matchingStocks.length > 0) {
          batches = matchingStocks.flatMap(st => {
            if (Array.isArray(st.batches) && st.batches.length > 0) {
              return st.batches;
            }
            return [{
              id: st.id ? `BAT-${st.id}` : `BAT-${st.code || "1"}`,
              batch_id: st.id,
              receivedDate: st.add_date || "—",
              unitCost: st.buyPrice || st.unitPrice || 0,
              initialQty: st.qty || 0,
              availableQty: st.qty || 0
            }];
          });
        }
      }

      if (batches.length === 0) {
        batches = [{
          id: item.id ? `BAT-${item.id}` : `BAT-${item.code || "1"}`,
          batch_id: item.id,
          receivedDate: item.add_date || "—",
          unitCost: item.buyPrice || item.unitPrice || 0,
          initialQty: availQty || item.qty || 0,
          availableQty: availQty || item.qty || 0
        }];
      }

      batches.forEach(b => {
        const batchId = b.id || (b.batch_no ? b.batch_no : (b.batch_id ? `BAT-${b.batch_id}` : (item.id ? `BAT-${item.id}` : "Batch")));
        const receivedDate = b.receivedDate || b.add_date || item.add_date || "—";
        const unitCost = Number(b.unitCost ?? b.buyPrice ?? b.buy ?? item.buyPrice ?? item.unitPrice ?? 0) || 0;
        const initQty = Number(b.initialQty ?? b.initial_qty ?? b.qty ?? b.availableQty ?? availQty ?? 0) || 0;
        const curAvailQty = Number(b.availableQty ?? b.available_qty ?? b.qty ?? availQty ?? 0) || 0;
        const batchVal = curAvailQty * unitCost;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong style="color: #1677ff;">${batchId}</strong></td>
          <td>${receivedDate}</td>
          <td class="text-right">${this.ctx.formatCurrency ? this.ctx.formatCurrency(unitCost) : `Rs. ${unitCost.toFixed(2)}`}</td>
          <td class="text-right">${Number(initQty || 0).toLocaleString()}</td>
          <td class="text-right"><strong>${Number(curAvailQty || 0).toLocaleString()}</strong></td>
          <td class="text-right" style="font-weight: 700;">${this.ctx.formatCurrency ? this.ctx.formatCurrency(batchVal) : `Rs. ${batchVal.toFixed(2)}`}</td>
        `;
        batchTbody.appendChild(tr);
      });
    }

    const timelineElem = document.getElementById("invViewTimeline");
    if (timelineElem) {
      timelineElem.innerHTML = "";
      if (!item.transactions || item.transactions.length === 0) {
        timelineElem.innerHTML = `<div style="color: var(--text-muted); font-size: 12px; padding: 10px 0;">No stock transaction history recorded yet.</div>`;
      } else {
        item.transactions.slice(0, 8).forEach(tx => {
          const isAdd = tx.type === "ADD";
          const qty = Number(tx.qty || 0);
          const itemDiv = document.createElement("div");
          itemDiv.className = "inv-timeline-item";
          itemDiv.innerHTML = `
            <span class="inv-timeline-dot ${isAdd ? "add" : "deduct"}"></span>
            <div class="inv-timeline-content">
              <div class="inv-timeline-main">
                <span class="ant-tag ${isAdd ? "ant-tag-green" : "ant-tag-red"}" style="padding: 1px 7px; font-size: 10.5px; margin-right: 6px;">
                  ${isAdd ? "+ ADD" : "- DEDUCT"}
                </span>
                <strong>${qty > 0 ? "+" : ""}${qty.toLocaleString()} ${unit}</strong>
                <span style="color: var(--text-muted); margin-left: 8px;">(${tx.reason || "Consignment"})</span>
              </div>
              <div class="inv-timeline-meta">
                <span><i class="fa-regular fa-clock"></i> ${tx.date || "—"}</span>
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

