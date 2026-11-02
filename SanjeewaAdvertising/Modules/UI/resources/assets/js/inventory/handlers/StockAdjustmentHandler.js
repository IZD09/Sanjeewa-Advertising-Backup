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
        const opt = document.createElement("option");
        opt.value = "BATCH-DEFAULT";
        opt.textContent = `General Batch — Available: 0 ${item.unit}`;
        batchSelect.appendChild(opt);
      }
    }

    // Reset Inputs
    const addRadio = document.getElementById("adjTypeAdd");
    if (addRadio) addRadio.checked = true;
    this.onAdjustmentTypeChange("ADD");

    const qtyInput = document.getElementById("adjQtyInput");
    if (qtyInput) qtyInput.value = "";

    const notesInput = document.getElementById("adjNotesInput");
    if (notesInput) notesInput.value = "";

    this.updatePreview(item);
    this.ctx.openModal("adjustStockModal");
  }

  onAdjustmentTypeChange(type) {
    this.currentAdjustmentType = type;
    const addLabel = document.getElementById("adjAddOption");
    const deductLabel = document.getElementById("adjDeductOption");

    if (addLabel && deductLabel) {
      addLabel.classList.toggle("selected", type === "ADD");
      deductLabel.classList.toggle("selected", type === "DEDUCT");
    }

    if (this.currentContextItem) {
      this.updatePreview(this.currentContextItem);
    }
  }

  onAdjustBatchSelect(batchId) {
    if (this.currentContextItem) {
      this.updatePreview(this.currentContextItem);
    }
  }

  onAdjustQtyChange(qty) {
    if (this.currentContextItem) {
      this.updatePreview(this.currentContextItem);
    }
  }

  updatePreview(item) {
    const batchSelect = document.getElementById("adjBatchSelect");
    const qtyInput = document.getElementById("adjQtyInput");
    const previewBox = document.getElementById("adjPreviewResult");
    if (!previewBox) return;

    const selectedBatchId = batchSelect ? batchSelect.value : null;
    const batch = (item.batches || []).find(b => b.id === selectedBatchId) || { availableQty: 0 };
    const adjQty = parseFloat(qtyInput ? qtyInput.value : 0) || 0;

    let newQty = batch.availableQty;
    if (this.currentAdjustmentType === "ADD") {
      newQty += adjQty;
    } else {
      newQty -= adjQty;
    }

    const isNegative = newQty < 0;

    previewBox.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: var(--text-muted);">Current Batch Stock:</span>
        <strong>${batch.availableQty} ${item.unit}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
        <span style="color: var(--text-muted);">${this.currentAdjustmentType === "ADD" ? "Stock Addition (+):" : "Stock Deduction (-):"}</span>
        <strong style="color: ${this.currentAdjustmentType === "ADD" ? "#52c41a" : "#ff4d4f"};">
          ${this.currentAdjustmentType === "ADD" ? "+" : "-"}${adjQty} ${item.unit}
        </strong>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color);">
        <span style="font-weight: 600; color: var(--text);">New Batch Balance:</span>
        <strong style="font-size: 15px; color: ${isNegative ? '#ff4d4f' : '#1677ff'};">
          ${newQty} ${item.unit}
        </strong>
      </div>
      ${isNegative ? `
        <div style="font-size: 11.5px; color: #ff4d4f; margin-top: 6px; font-weight: 600;">
          <i class="fa-solid fa-triangle-exclamation"></i> Warning: Deduct quantity exceeds current batch available stock!
        </div>
      ` : ""}
    `;
  }

  saveStockAdjustment() {
    if (!this.currentContextItem) return;

    const item = this.currentContextItem;
    const batchSelect = document.getElementById("adjBatchSelect");
    const qtyInput = document.getElementById("adjQtyInput");
    const reasonSelect = document.getElementById("adjReasonSelect");
    const notesInput = document.getElementById("adjNotesInput");

    const batchId = batchSelect ? batchSelect.value : null;
    const adjQty = parseFloat(qtyInput ? qtyInput.value : 0);
    const reason = reasonSelect ? reasonSelect.value : "Manual Audit Adjustment";
    const notes = notesInput ? notesInput.value.trim() : "";

    if (!adjQty || adjQty <= 0) {
      this.ctx.showToast("Please enter a valid adjustment quantity greater than 0", "error");
      return;
    }

    if (!item.batches) item.batches = [];
    let batch = item.batches.find(b => b.id === batchId);

    if (!batch) {
      batch = {
        id: `BATCH-${Date.now().toString().slice(-4)}`,
        receivedDate: new Date().toISOString().split("T")[0],
        initialQty: 0,
        availableQty: 0,
        unitCost: item.unitPrice || 0,
        supplier: item.supplier || "Internal Adjustment"
      };
      item.batches.push(batch);
    }

    const previousBatchQty = batch.availableQty;

    if (this.currentAdjustmentType === "ADD") {
      batch.availableQty += adjQty;
      batch.initialQty += adjQty;
    } else {
      if (adjQty > batch.availableQty) {
        const proceed = confirm(`Deduction quantity (${adjQty}) exceeds available batch stock (${batch.availableQty}). Proceed anyway?`);
        if (!proceed) return;
      }
      batch.availableQty = Math.max(0, batch.availableQty - adjQty);
    }

    // Add Audit Log Entry
    if (!item.history) item.history = [];
    item.history.unshift({
      id: `TXN-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      type: this.currentAdjustmentType,
      qty: adjQty,
      batchId: batch.id,
      reason: reason,
      notes: notes,
      user: "Admin User",
      resultingBatchStock: batch.availableQty
    });

    this.ctx.saveData();
    this.ctx.render();
    this.ctx.closeModal("adjustStockModal");
    this.ctx.showToast(`Stock for ${item.name} (${item.code}) successfully updated!`, "success");
  }
}

export default StockAdjustmentHandler;

