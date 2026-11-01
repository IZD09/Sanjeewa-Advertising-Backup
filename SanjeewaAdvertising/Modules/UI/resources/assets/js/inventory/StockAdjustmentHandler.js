/**
 * SanjeewaAdvertising - Stock Adjustment Handler
 *
 * Handles stock adjustment modal, ADD/DEDUCT quantity validations,
 * batch adjustments, and transaction history logging.
 */

export class StockAdjustmentHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getItems
   * @param {Function} context.saveData
   * @param {Function} context.render
   * @param {Function} context.formatCurrency
   * @param {Function} context.openModal
   * @param {Function} context.closeModal
   * @param {Function} context.showToast
   */
  constructor(context) {
    this.ctx = context;
    this.currentContextItem = null;
    this.currentAdjustmentType = "ADD"; // "ADD" or "DEDUCT"
  }

  openAdjustModal(itemCode) {
    const items = this.ctx.getItems() || [];
    const item = items.find(i => i.code === itemCode);
    if (!item) return;

    this.currentContextItem = item;
    this.currentAdjustmentType = "ADD";

    // Set Modal Title
    const titleElem = document.getElementById("invAdjustModalTitle");
    if (titleElem) {
      titleElem.innerHTML = `<i class="fa-solid fa-sliders" style="color: #faad14;"></i> Adjust Stock — ${item.name} <span class="inv-item-code" style="margin-left: 8px;">${item.code}</span>`;
    }

    // Populate Batch Dropdown
    const batchSelect = document.getElementById("adjBatchSelect");
    if (batchSelect) {
      batchSelect.innerHTML = "";
      if (item.batches && item.batches.length > 0) {
        item.batches.forEach(b => {
          const opt = document.createElement("option");
          opt.value = b.id;
          opt.textContent = `${b.id} — Available: ${b.availableQty} ${item.unit} (Unit Cost: ${this.ctx.formatCurrency(b.unitCost)})`;
          batchSelect.appendChild(opt);
        });
      } else {
        batchSelect.innerHTML = `<option value="">No existing batches available</option>`;
      }
    }

    // Reset Form Fields
    this.setAdjustmentType("ADD");
    const qtyInput = document.getElementById("adjQtyInput");
    if (qtyInput) qtyInput.value = "";
    const reasonSelect = document.getElementById("adjReasonSelect");
    if (reasonSelect) reasonSelect.selectedIndex = 0;
    const remarksInput = document.getElementById("adjRemarksInput");
    if (remarksInput) remarksInput.value = "";

    this.updateAdjustmentImpact();
    this.ctx.openModal("adjustStockModal");
  }

  setAdjustmentType(type) {
    this.currentAdjustmentType = type;
    const addBtn = document.getElementById("adjTypeAdd");
    const deductBtn = document.getElementById("adjTypeDeduct");

    if (addBtn && deductBtn) {
      if (type === "ADD") {
        addBtn.className = "inv-segmented-option active add";
        deductBtn.className = "inv-segmented-option";
      } else {
        addBtn.className = "inv-segmented-option";
        deductBtn.className = "inv-segmented-option active deduct";
      }
    }
    this.updateAdjustmentImpact();
  }

  updateAdjustmentImpact() {
    if (!this.currentContextItem) return;

    const batchSelect = document.getElementById("adjBatchSelect");
    const qtyInput = document.getElementById("adjQtyInput");
    const impactElem = document.getElementById("adjImpactValue");
    if (!impactElem) return;

    const selectedBatchId = batchSelect?.value;
    const batch = this.currentContextItem.batches?.find(b => b.id === selectedBatchId);
    const unitCost = batch ? (parseFloat(batch.unitCost) || 0) : (this.currentContextItem.unitPrice || 0);
    const qty = parseFloat(qtyInput?.value) || 0;
    const totalImpact = qty * unitCost;

    const prefix = this.currentAdjustmentType === "ADD" ? "(+) " : "(-) ";
    const color = this.currentAdjustmentType === "ADD" ? "#52c41a" : "#ff4d4f";

    impactElem.innerHTML = `<span style="color: ${color}; font-weight: 800;">${prefix}${this.ctx.formatCurrency(totalImpact)}</span> <span style="font-size: 11px; color: var(--text-muted);">(${qty} × ${this.ctx.formatCurrency(unitCost)})</span>`;
  }

  saveStockAdjustment() {
    if (!this.currentContextItem) return;

    const batchSelect = document.getElementById("adjBatchSelect");
    const qtyInput = document.getElementById("adjQtyInput");
    const reasonSelect = document.getElementById("adjReasonSelect");
    const remarksInput = document.getElementById("adjRemarksInput");

    const batchId = batchSelect?.value;
    const qty = parseFloat(qtyInput?.value);
    const reason = reasonSelect?.value;
    const remarks = remarksInput?.value?.trim() || "";

    if (!batchId) {
      this.ctx.showToast("Please select a batch for this adjustment", "error");
      return;
    }

    if (!qty || qty <= 0) {
      this.ctx.showToast("Please enter a valid positive adjustment quantity", "error");
      return;
    }

    const batch = this.currentContextItem.batches?.find(b => b.id === batchId);
    if (!batch) {
      this.ctx.showToast("Selected batch could not be found", "error");
      return;
    }

    if (this.currentAdjustmentType === "DEDUCT") {
      if (qty > batch.availableQty) {
        this.ctx.showToast(`Cannot deduct ${qty} ${this.currentContextItem.unit}. Batch ${batchId} only has ${batch.availableQty} available.`, "error");
        return;
      }
      batch.availableQty -= qty;
    } else {
      batch.availableQty += qty;
    }

    const now = new Date();
    const dateStr = now.toISOString().replace("T", " ").substring(0, 16);
    const txnId = `TXN-${Date.now().toString().slice(-4)}`;

    if (!this.currentContextItem.transactions) {
      this.currentContextItem.transactions = [];
    }

    this.currentContextItem.transactions.unshift({
      id: txnId,
      date: dateStr,
      type: this.currentAdjustmentType,
      batchId: batchId,
      qty: qty,
      reason: reason,
      operator: "Admin User",
      remarks: remarks
    });

    this.ctx.saveData();
    this.ctx.closeModal("adjustStockModal");
    this.ctx.render();

    const actionText = this.currentAdjustmentType === "ADD" ? "added to" : "deducted from";
    this.ctx.showToast(`Successfully ${actionText} ${this.currentContextItem.code} (${qty} ${this.currentContextItem.unit})!`, "success");
  }
}

