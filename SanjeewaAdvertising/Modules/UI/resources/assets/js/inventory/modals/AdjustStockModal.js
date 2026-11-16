/**
 * SanjeewaAdvertising - Adjust Stock Modal
 *
 * Handles stock adjustment modal dialog (#adjustStockModal),
 * displays selected item name (editable false), initializes adjustment quantity with current stock,
 * enables (+) Add Stock / (-) Deduct Stock quantity steppers, and persists stock adjustment
 * to the backend database with audit movement logging.
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";
import { RequestHandler } from "../../core/RequestHandler.js";

export class AdjustStockModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getItems
   * @param {Function} [context.saveData]
   * @param {Function} [context.render]
   * @param {Function} [context.formatCurrency]
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
    this.http = new RequestHandler();
    this.currentContextItem = null;
    this.currentStockId = null;
    this.baseQty = 0;
    this.currentAdjustmentType = "ADD"; // "ADD" or "DEDUCT"

    this.bindEvents();
  }

  bindEvents() {
    // Adjustment modal segmented options toggle + quantity stepper
    const addOption = document.getElementById("adjTypeAdd");
    const deductOption = document.getElementById("adjTypeDeduct");
    if (addOption) {
      addOption.addEventListener("click", () => this.stepAdjustment("ADD"));
    }
    if (deductOption) {
      deductOption.addEventListener("click", () => this.stepAdjustment("DEDUCT"));
    }

    // Adjustment quantity input live calculation and automatic type detection
    const adjQtyInput = document.getElementById("adjQtyInput");
    if (adjQtyInput) {
      adjQtyInput.addEventListener("input", () => this.onQtyInputChange());
    }

    // Save Adjustment button
    const saveAdjBtn = document.getElementById("saveStockAdjustmentBtn");
    if (saveAdjBtn) {
      saveAdjBtn.addEventListener("click", () => this.saveStockAdjustment());
    }
  }

  /**
   * Open the Adjust Stock modal for a selected stock batch.
   *
   * @param {string|number} itemCode
   * @param {string|number|null} [stockId=null]
   */
  openAdjustModal(itemCode, stockId = null) {
    const items = this.ctx.getItems ? this.ctx.getItems() : [];
    let item = null;

    if (stockId) {
      item = items.find(i => String(i.id) === String(stockId) || String(i.stock_id) === String(stockId));
    }
    if (!item && itemCode) {
      item = items.find(i => i.code === itemCode);
    }
    if (!item && items.length > 0) {
      item = items.find(i => String(i.id) === String(itemCode) || String(i.stock_id) === String(itemCode));
    }
    if (!item) return;

    this.currentContextItem = item;
    this.currentStockId = stockId || item.id || item.stock_id || null;
    this.baseQty = parseInt(item.qty ?? item.currentStock ?? 0, 10) || 0;
    this.currentAdjustmentType = "ADD";

    // Set Modal Title
    const titleElem = document.getElementById("invAdjustModalTitle");
    if (titleElem) {
      titleElem.innerHTML = `<i class="fa-solid fa-sliders" style="color: #faad14;"></i> Adjust Stock — ${item.name} <span class="inv-item-code" style="margin-left: 8px;">${item.code}</span>`;
    }

    // Set Item Name (readonly / editable false input field)
    const itemNameInput = document.getElementById("adjItemNameInput");
    if (itemNameInput) {
      itemNameInput.value = item.name || item.code || "";
    }
    const stockIdInput = document.getElementById("adjStockId");
    if (stockIdInput) {
      stockIdInput.value = String(this.currentStockId || "");
    }
    const batchHidden = document.getElementById("adjBatchSelect");
    if (batchHidden) {
      batchHidden.value = String(this.currentStockId || "");
    }

    // Set Adjustment Quantity input to selected value's current quantity
    const qtyInput = document.getElementById("adjQtyInput");
    if (qtyInput) {
      qtyInput.value = this.baseQty;
    }

    // Set Adjustment Type back to default
    this.setAdjustmentType("ADD", false);

    // Reset Reason & Remarks
    const reasonSelect = document.getElementById("adjReasonSelect");
    if (reasonSelect) {
      reasonSelect.selectedIndex = 0;
    }
    const remarksInput = document.getElementById("adjRemarksInput");
    if (remarksInput) {
      remarksInput.value = "";
    }

    this.updateAdjustmentImpact();
    this.openModal("adjustStockModal");
  }

  /**
   * Handle click on (+) Add Stock or (-) Deduct Stock button:
   * switches the active mode and steps the quantity up or down.
   *
   * @param {"ADD" | "DEDUCT"} type
   */
  stepAdjustment(type) {
    this.setAdjustmentType(type, false);
    const qtyInput = document.getElementById("adjQtyInput");
    if (!qtyInput) return;

    let currentVal = parseInt(qtyInput.value, 10);
    if (isNaN(currentVal)) {
      currentVal = this.baseQty;
    }

    if (type === "ADD") {
      qtyInput.value = currentVal + 1;
    } else if (type === "DEDUCT") {
      if (currentVal > 0) {
        qtyInput.value = currentVal - 1;
      }
    }

    this.updateAdjustmentImpact();
  }

  /**
   * Handle user typing directly into the Adjustment Quantity field.
   */
  onQtyInputChange() {
    const qtyInput = document.getElementById("adjQtyInput");
    if (!qtyInput) return;

    const val = parseInt(qtyInput.value, 10) || 0;
    if (val >= this.baseQty) {
      this.setAdjustmentType("ADD", false);
    } else {
      this.setAdjustmentType("DEDUCT", false);
    }

    this.updateAdjustmentImpact();
  }

  /**
   * Update active segmented state between (+) Add Stock and (-) Deduct Stock.
   *
   * @param {"ADD" | "DEDUCT"} type
   * @param {boolean} [triggerImpact=true]
   */
  setAdjustmentType(type, triggerImpact = true) {
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

    if (triggerImpact) {
      this.updateAdjustmentImpact();
    }
  }

  /**
   * Calculate and render financial impact and difference preview.
   */
  updateAdjustmentImpact() {
    if (!this.currentContextItem) return;

    const qtyInput = document.getElementById("adjQtyInput");
    const impactElem = document.getElementById("adjImpactValue");
    if (!impactElem) return;

    const targetQty = parseInt(qtyInput?.value, 10) || 0;
    const diff = targetQty - this.baseQty;
    const unitPrice = parseFloat(this.currentContextItem.unitPrice ?? this.currentContextItem.buyPrice ?? 0) || 0;
    const impactVal = Math.abs(diff) * unitPrice;

    const formatCurrency = this.ctx.formatCurrency || ((amt) => `Rs. ${(parseFloat(amt) || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`);

    const unit = this.currentContextItem.unit || "Units";
    const costStr = formatCurrency(unitPrice);
    const impactStr = formatCurrency(impactVal);

    if (diff > 0) {
      impactElem.innerHTML = `<span style="color: #52c41a; font-weight: 800;">(+) ${impactStr}</span> <span style="font-size: 11px; color: var(--text-muted);">(+${diff} ${unit} × ${costStr})</span>`;
    } else if (diff < 0) {
      impactElem.innerHTML = `<span style="color: #ff4d4f; font-weight: 800;">(-) ${impactStr}</span> <span style="font-size: 11px; color: var(--text-muted);">(${diff} ${unit} × ${costStr})</span>`;
    } else {
      impactElem.innerHTML = `<span style="color: var(--text-muted); font-weight: 600;">Rs. 0.00</span> <span style="font-size: 11px; color: var(--text-muted);">(No quantity change)</span>`;
    }
  }

  /**
   * Persist stock adjustment to the database via API endpoint.
   */
  async saveStockAdjustment() {
    if (!this.currentContextItem) return;

    const stockId = this.currentStockId || this.currentContextItem.id || this.currentContextItem.stock_id;
    const qtyInput = document.getElementById("adjQtyInput");
    const reasonSelect = document.getElementById("adjReasonSelect");
    const remarksInput = document.getElementById("adjRemarksInput");
    const saveBtn = document.getElementById("saveStockAdjustmentBtn");

    if (!stockId) {
      this.showToast("Stock identifier missing for adjustment", "error");
      return;
    }

    const targetQty = parseInt(qtyInput?.value, 10);
    if (isNaN(targetQty) || targetQty < 0) {
      this.showToast("Please enter a valid non-negative adjustment quantity", "error");
      return;
    }

    const diff = targetQty - this.baseQty;
    const reason = reasonSelect?.value || "Physical Count Mismatch";
    const remarks = remarksInput?.value?.trim() || "";

    const payload = {
      stock_id: stockId,
      adjustment_type: this.currentAdjustmentType,
      new_qty: targetQty,
      qty: Math.abs(diff),
      reason: reason,
      remarks: remarks
    };

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }

    try {
      const response = await this.http.post(`/api/v1/inventory/stocks/${stockId}/adjust`, payload);

      if (response && response.success) {
        this.closeModal("adjustStockModal");
        const actionWord = diff >= 0 ? "increased to" : "reduced to";
        this.showToast(`Stock for ${this.currentContextItem.name || this.currentContextItem.code} successfully adjusted (${this.baseQty} -> ${targetQty})!`, "success");

        // Refresh live tables and statistics
        if (window.inventoryManager?.tableHandler) {
          await window.inventoryManager.tableHandler.fetchData();
        }
        if (window.inventoryManager?.movementsHandler) {
          window.inventoryManager.movementsHandler.fetchStats();
          window.inventoryManager.movementsHandler.fetchMovements(1);
        }
        if (window.inventoryManager?.stockItemsHandler) {
          window.inventoryManager.stockItemsHandler.fetchData();
        }
      } else {
        throw new Error(response?.message || "Failed to adjust stock");
      }
    } catch (err) {
      console.error("Error saving stock adjustment:", err);
      this.showToast(err.message || "Failed to save stock adjustment", "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save Adjustment';
      }
    }
  }
}
