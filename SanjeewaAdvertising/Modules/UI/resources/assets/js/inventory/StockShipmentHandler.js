/**
 * SanjeewaAdvertising - Stock Shipment Handler
 *
 * Manages Receive / Add Stock Shipment modal, new batch generation,
 * new SKU registration, financial impact previews, and inventory updates.
 */

export class StockShipmentHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getItems
   * @param {Function} context.setItems
   * @param {Function} context.saveData
   * @param {Function} context.render
   * @param {Function} context.formatCurrency
   * @param {Function} context.openModal
   * @param {Function} context.closeModal
   * @param {Function} context.showToast
   */
  constructor(context) {
    this.ctx = context;
  }

  openAddStockModal(prefillItemCode = null) {
    const itemSelect = document.getElementById("addStockItemSelect");
    if (!itemSelect) return;

    const items = this.ctx.getItems() || [];

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
    this.ctx.openModal("addStockModal");
  }

  handleItemSelectionChange() {
    const itemSelect = document.getElementById("addStockItemSelect");
    const newSkuSection = document.getElementById("newSkuDetailsSection");
    const supplierInput = document.getElementById("addStockSupplier");
    const sellingPriceInput = document.getElementById("addStockSellingPrice");
    const unitCostInput = document.getElementById("addStockUnitCost");
    const unitLabel = document.getElementById("addStockUnitLabel");

    const items = this.ctx.getItems() || [];
    const val = itemSelect?.value;

    if (val === "__NEW_SKU__") {
      if (newSkuSection) newSkuSection.style.display = "block";
      if (unitLabel) unitLabel.textContent = "Units";
    } else {
      if (newSkuSection) newSkuSection.style.display = "none";
      const item = items.find(i => i.code === val);
      if (item) {
        if (supplierInput) supplierInput.value = item.supplier || "";
        if (sellingPriceInput) sellingPriceInput.value = item.unitPrice || "";
        if (unitLabel) unitLabel.textContent = item.unit || "Units";
        if (unitCostInput && item.batches && item.batches.length > 0) {
          const lastBatch = item.batches[item.batches.length - 1];
          unitCostInput.value = lastBatch.unitCost || "";
        }
      }
    }
    this.updateAddStockFinancials();
  }

  updateAddStockFinancials() {
    const qtyInput = document.getElementById("addStockQty");
    const unitCostInput = document.getElementById("addStockUnitCost");
    const sellingPriceInput = document.getElementById("addStockSellingPrice");

    const totalCostElem = document.getElementById("addStockTotalCost");
    const totalValElem = document.getElementById("addStockTotalValue");

    const qty = parseFloat(qtyInput?.value) || 0;
    const unitCost = parseFloat(unitCostInput?.value) || 0;
    const sellingPrice = parseFloat(sellingPriceInput?.value) || 0;

    const totalCost = qty * unitCost;
    const totalVal = qty * sellingPrice;

    if (totalCostElem) totalCostElem.textContent = this.ctx.formatCurrency(totalCost);
    if (totalValElem) totalValElem.textContent = this.ctx.formatCurrency(totalVal);
  }

  saveNewStock() {
    const itemSelect = document.getElementById("addStockItemSelect");
    const supplierInput = document.getElementById("addStockSupplier");
    const batchInput = document.getElementById("addStockBatchId");
    const dateInput = document.getElementById("addStockDate");
    const qtyInput = document.getElementById("addStockQty");
    const unitCostInput = document.getElementById("addStockUnitCost");
    const sellingPriceInput = document.getElementById("addStockSellingPrice");
    const invoiceRefInput = document.getElementById("addStockInvoiceRef");
    const remarksInput = document.getElementById("addStockRemarks");

    const val = itemSelect?.value;
    const supplier = supplierInput?.value?.trim();
    const batchId = batchInput?.value?.trim() || `BAT-${Date.now().toString().slice(-4)}`;
    const receivedDate = dateInput?.value || new Date().toISOString().split("T")[0];
    const qty = parseFloat(qtyInput?.value);
    const unitCost = parseFloat(unitCostInput?.value) || 0;
    const sellingPrice = parseFloat(sellingPriceInput?.value) || 0;
    const invoiceRef = invoiceRefInput?.value?.trim() || "";
    const remarks = remarksInput?.value?.trim() || "";

    if (!val) {
      this.ctx.showToast("Please select a material or choose to register a new SKU", "error");
      return;
    }

    if (!supplier) {
      this.ctx.showToast("Please specify a supplier / vendor for this shipment", "error");
      return;
    }

    if (!qty || qty <= 0) {
      this.ctx.showToast("Please enter a valid received quantity greater than 0", "error");
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().replace("T", " ").substring(0, 16);
    const txnId = `TXN-${Date.now().toString().slice(-4)}`;
    const operator = "Admin User";
    let items = this.ctx.getItems() || [];

    if (val === "__NEW_SKU__") {
      const codeInput = document.getElementById("newSkuCode");
      const nameInput = document.getElementById("newSkuName");
      const catSelect = document.getElementById("newSkuCategory");
      const unitSelect = document.getElementById("newSkuUnit");

      const code = codeInput?.value?.trim().toUpperCase();
      const name = nameInput?.value?.trim();
      const category = catSelect?.value || "Paper & Boards";
      const unit = unitSelect?.value || "Units";

      if (!code || !name) {
        this.ctx.showToast("Please provide both an Item Code and Item Name for the new SKU", "error");
        return;
      }

      if (items.some(i => i.code.toUpperCase() === code)) {
        this.ctx.showToast(`An item with code "${code}" already exists in the catalog!`, "error");
        return;
      }

      const newItem = {
        code: code,
        name: name,
        category: category,
        supplier: supplier,
        unitPrice: sellingPrice > 0 ? sellingPrice : unitCost * 1.25,
        unit: unit,
        minThreshold: Math.max(5, Math.floor(qty * 0.2)),
        batches: [
          {
            id: batchId,
            receivedDate: receivedDate,
            unitCost: unitCost,
            initialQty: qty,
            availableQty: qty,
            supplier: supplier
          }
        ],
        transactions: [
          {
            id: txnId,
            date: dateStr,
            type: "ADD",
            batchId: batchId,
            qty: qty,
            reason: `Initial Consignment received from ${supplier}`,
            operator: operator,
            remarks: remarks || (invoiceRef ? `Invoice: ${invoiceRef}` : "New material catalog entry")
          }
        ]
      };

      items.unshift(newItem);
      this.ctx.setItems(items);
      this.ctx.saveData();
      this.ctx.closeModal("addStockModal");
      this.ctx.render();
      this.ctx.showToast(`Successfully registered new SKU ${code} and added ${qty} ${unit} to stock!`, "success");
    } else {
      const item = items.find(i => i.code === val);
      if (!item) {
        this.ctx.showToast("Selected item could not be found", "error");
        return;
      }

      item.supplier = supplier;
      if (sellingPrice > 0) {
        item.unitPrice = sellingPrice;
      }

      if (!item.batches) item.batches = [];
      item.batches.push({
        id: batchId,
        receivedDate: receivedDate,
        unitCost: unitCost,
        initialQty: qty,
        availableQty: qty,
        supplier: supplier
      });

      if (!item.transactions) item.transactions = [];
      item.transactions.unshift({
        id: txnId,
        date: dateStr,
        type: "ADD",
        batchId: batchId,
        qty: qty,
        reason: `Shipment received from ${supplier}`,
        operator: operator,
        remarks: remarks || (invoiceRef ? `Invoice: ${invoiceRef}` : "Consignment delivery")
      });

      this.ctx.saveData();
      this.ctx.closeModal("addStockModal");
      this.ctx.render();
      this.ctx.showToast(`Successfully added ${qty} ${item.unit} to ${item.code} (${item.name}) from ${supplier}!`, "success");
    }
  }
}

