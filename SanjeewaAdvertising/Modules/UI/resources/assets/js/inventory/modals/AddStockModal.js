/**
 * SanjeewaAdvertising - Add Stock Modal
 *
 * Manages Receive / Add Stock Shipment modal dialog (#addStockModal),
 * item/SKU selection, live cost/price calculations, and stock receipt saves.
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class AddStockModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getItems
   * @param {Function} context.setItems
   * @param {Function} context.saveData
   * @param {Function} context.render
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

    this.bindEvents();
  }

  bindEvents() {
    // Add Stock button to open modal
    const addStockBtn = document.getElementById("invAddStockBtn");
    if (addStockBtn) {
      addStockBtn.addEventListener("click", () => this.openAddStockModal());
    }

    // Add Stock item selection change
    const addStockItemSelect = document.getElementById("addStockItemSelect");
    if (addStockItemSelect) {
      addStockItemSelect.addEventListener("change", () => this.handleItemSelectionChange());
    }

    // Add Stock financial live calculations
    const addStockQty = document.getElementById("addStockQty");
    const addStockUnitCost = document.getElementById("addStockUnitCost");
    const addStockSellingPrice = document.getElementById("addStockSellingPrice");

    if (addStockQty) addStockQty.addEventListener("input", () => this.updateAddStockFinancials());
    if (addStockUnitCost) addStockUnitCost.addEventListener("input", () => this.updateAddStockFinancials());
    if (addStockSellingPrice) addStockSellingPrice.addEventListener("input", () => this.updateAddStockFinancials());

    // Save Stock Shipment button
    const saveNewStockBtn = document.getElementById("saveNewStockBtn");
    if (saveNewStockBtn) {
      saveNewStockBtn.addEventListener("click", () => this.saveNewStock());
    }
  }

  openAddStockModal(prefillItemCode = null) {
    const itemSelect = document.getElementById("addStockItemSelect");
    if (!itemSelect) return;

    const items = this.ctx.getItems ? this.ctx.getItems() : [];

    itemSelect.innerHTML = "";
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = "-- Select Material SKU from Catalog --";
    itemSelect.appendChild(defaultOpt);

    items.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.code;
      opt.textContent = `${item.code} — ${item.name} (${item.category})`;
      if (prefillItemCode && item.code === prefillItemCode) {
        opt.selected = true;
      }
      itemSelect.appendChild(opt);
    });

    const newOpt = document.createElement("option");
    newOpt.value = "__NEW_SKU__";
    newOpt.textContent = "+ [Register New Material SKU]";
    itemSelect.appendChild(newOpt);

    // Reset Form Fields
    const batchInput = document.getElementById("addStockBatchId");
    if (batchInput) {
      batchInput.value = `BAT-${Math.floor(100 + Math.random() * 900)}`;
    }

    const dateInput = document.getElementById("addStockDate");
    if (dateInput) {
      dateInput.value = new Date().toISOString().split("T")[0];
    }

    const qtyInput = document.getElementById("addStockQty");
    if (qtyInput) qtyInput.value = "";

    const unitCostInput = document.getElementById("addStockUnitCost");
    if (unitCostInput) unitCostInput.value = "";

    const sellingPriceInput = document.getElementById("addStockSellingPrice");
    if (sellingPriceInput) sellingPriceInput.value = "";

    const invRefInput = document.getElementById("addStockInvoiceRef");
    if (invRefInput) invRefInput.value = "";

    const remarksInput = document.getElementById("addStockRemarks");
    if (remarksInput) remarksInput.value = "";

    const newCodeInput = document.getElementById("newSkuCode");
    if (newCodeInput) newCodeInput.value = "";

    const newNameInput = document.getElementById("newSkuName");
    if (newNameInput) newNameInput.value = "";

    this.handleItemSelectionChange();
    this.openModal("addStockModal");
  }

  handleItemSelectionChange() {
    const itemSelect = document.getElementById("addStockItemSelect");
    const newSkuSection = document.getElementById("newSkuDetailsSection");
    const supplierInput = document.getElementById("addStockSupplier");
    const sellingPriceInput = document.getElementById("addStockSellingPrice");
    const unitCostInput = document.getElementById("addStockUnitCost");
    const unitLabel = document.getElementById("addStockUnitLabel");

    const items = this.ctx.getItems ? this.ctx.getItems() : [];
    const val = itemSelect?.value;

    if (val === "__NEW_SKU__") {
      if (newSkuSection) newSkuSection.style.display = "block";
      if (unitLabel) unitLabel.textContent = "Units";
      if (supplierInput) supplierInput.value = "Local Importer / Supplier";
      if (sellingPriceInput) sellingPriceInput.value = "";
      if (unitCostInput) unitCostInput.value = "";
    } else {
      if (newSkuSection) newSkuSection.style.display = "none";
      const found = items.find(i => i.code === val);
      if (found) {
        if (unitLabel) unitLabel.textContent = found.unit;
        if (supplierInput) supplierInput.value = found.supplier || "Standard Supplier";
        if (sellingPriceInput) sellingPriceInput.value = found.unitPrice || 0;
        const lastBatch = found.batches && found.batches.length > 0 ? found.batches[found.batches.length - 1] : null;
        if (unitCostInput) unitCostInput.value = lastBatch ? lastBatch.unitCost : (found.unitPrice ? (found.unitPrice * 0.75).toFixed(2) : 0);
      }
    }
    this.updateAddStockFinancials();
  }

  updateAddStockFinancials() {
    const qtyInput = document.getElementById("addStockQty");
    const unitCostInput = document.getElementById("addStockUnitCost");
    const sellingPriceInput = document.getElementById("addStockSellingPrice");

    const totalCostElem = document.getElementById("addStockTotalCost");
    const projectedRevElem = document.getElementById("addStockProjectedRevenue");
    const profitElem = document.getElementById("addStockProjectedProfit");

    const qty = parseFloat(qtyInput?.value) || 0;
    const unitCost = parseFloat(unitCostInput?.value) || 0;
    const sellingPrice = parseFloat(sellingPriceInput?.value) || 0;

    const totalCost = qty * unitCost;
    const projectedRev = qty * sellingPrice;
    const projectedProfit = projectedRev - totalCost;

    const fmt = (amt) => this.ctx.formatCurrency ? this.ctx.formatCurrency(amt) : amt;
    if (totalCostElem) totalCostElem.textContent = fmt(totalCost);
    if (projectedRevElem) projectedRevElem.textContent = fmt(projectedRev);

    if (profitElem) {
      profitElem.textContent = fmt(projectedProfit);
      profitElem.style.color = projectedProfit >= 0 ? "#52c41a" : "#ff4d4f";
    }
  }

  saveNewStock() {
    const itemSelect = document.getElementById("addStockItemSelect");
    const batchInput = document.getElementById("addStockBatchId");
    const dateInput = document.getElementById("addStockDate");
    const qtyInput = document.getElementById("addStockQty");
    const unitCostInput = document.getElementById("addStockUnitCost");
    const sellingPriceInput = document.getElementById("addStockSellingPrice");
    const supplierInput = document.getElementById("addStockSupplier");
    const invoiceRefInput = document.getElementById("addStockInvoiceRef");
    const remarksInput = document.getElementById("addStockRemarks");

    const isNewSku = itemSelect?.value === "__NEW_SKU__";
    let targetCode = itemSelect?.value;

    const batchId = batchInput?.value?.trim() || `BAT-${Date.now().toString().slice(-4)}`;
    const recDate = dateInput?.value || new Date().toISOString().split("T")[0];
    const qty = parseFloat(qtyInput?.value);
    const unitCost = parseFloat(unitCostInput?.value);
    const sellingPrice = parseFloat(sellingPriceInput?.value) || 0;
    const supplier = supplierInput?.value?.trim() || "Local Vendor";
    const invoiceRef = invoiceRefInput?.value?.trim() || "N/A";
    const remarks = remarksInput?.value?.trim() || "";

    if (!targetCode) {
      this.showToast("Please choose an existing SKU or Register a New SKU", "error");
      return;
    }

    if (!qty || qty <= 0) {
      this.showToast("Please enter a valid positive received quantity", "error");
      return;
    }

    if (unitCost === undefined || isNaN(unitCost) || unitCost < 0) {
      this.showToast("Please enter a valid unit cost (buying price)", "error");
      return;
    }

    let items = this.ctx.getItems ? this.ctx.getItems() : [];

    if (isNewSku) {
      const newCode = document.getElementById("newSkuCode")?.value?.trim()?.toUpperCase();
      const newName = document.getElementById("newSkuName")?.value?.trim();
      const newCategory = document.getElementById("newSkuCategory")?.value || "Paper & Boards";
      const newUnit = document.getElementById("newSkuUnit")?.value || "Pcs";
      const newMinThreshold = parseInt(document.getElementById("newSkuMinThreshold")?.value, 10) || 10;
      const newLocation = document.getElementById("newSkuLocation")?.value?.trim() || "Main Warehouse";

      if (!newCode) {
        this.showToast("Please enter a SKU Code for the new item", "error");
        return;
      }
      if (!newName) {
        this.showToast("Please enter a Product/Item Name for the new item", "error");
        return;
      }

      if (items.some(i => i.code.toLowerCase() === newCode.toLowerCase())) {
        this.showToast(`Item code "${newCode}" already exists. Please use a unique code.`, "error");
        return;
      }

      const newItem = {
        code: newCode,
        name: newName,
        category: newCategory,
        unit: newUnit,
        minThreshold: newMinThreshold,
        supplier: supplier,
        location: newLocation,
        unitPrice: sellingPrice > 0 ? sellingPrice : unitCost * 1.3,
        batches: [
          {
            id: batchId,
            receivedDate: recDate,
            initialQty: qty,
            availableQty: qty,
            unitCost: unitCost,
            supplierInvoice: invoiceRef
          }
        ],
        transactions: [
          {
            id: `TXN-${Date.now().toString().slice(-4)}`,
            date: `${recDate} ${new Date().toTimeString().slice(0, 5)}`,
            type: "ADD",
            batchId: batchId,
            qty: qty,
            reason: `Shipment from ${supplier} (Inv: ${invoiceRef})`,
            operator: "Admin User",
            remarks: remarks
          }
        ]
      };

      items.unshift(newItem);
      if (this.ctx.setItems) this.ctx.setItems(items);
      targetCode = newCode;
    } else {
      const existing = items.find(i => i.code === targetCode);
      if (!existing) {
        this.showToast("Selected item could not be found", "error");
        return;
      }

      if (sellingPrice > 0) {
        existing.unitPrice = sellingPrice;
      }
      if (supplier) {
        existing.supplier = supplier;
      }

      if (!existing.batches) existing.batches = [];
      existing.batches.push({
        id: batchId,
        receivedDate: recDate,
        initialQty: qty,
        availableQty: qty,
        unitCost: unitCost,
        supplierInvoice: invoiceRef
      });

      if (!existing.transactions) existing.transactions = [];
      existing.transactions.unshift({
        id: `TXN-${Date.now().toString().slice(-4)}`,
        date: `${recDate} ${new Date().toTimeString().slice(0, 5)}`,
        type: "ADD",
        batchId: batchId,
        qty: qty,
        reason: `Shipment from ${supplier} (Inv: ${invoiceRef})`,
        operator: "Admin User",
        remarks: remarks
      });
    }

    if (this.ctx.saveData) this.ctx.saveData();
    this.closeModal("addStockModal");
    if (this.ctx.render) this.ctx.render();

    this.showToast(`Stock shipment for ${targetCode} (${qty} units) received successfully!`, "success");
  }
}

