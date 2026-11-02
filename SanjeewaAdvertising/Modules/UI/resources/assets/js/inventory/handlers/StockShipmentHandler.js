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

    // Reset Fields
    const batchInput = document.getElementById("addStockBatchNo");
    const dateInput = document.getElementById("addStockDate");
    const qtyInput = document.getElementById("addStockQty");
    const costInput = document.getElementById("addStockCost");
    const supplierInput = document.getElementById("addStockSupplier");
    const invoiceInput = document.getElementById("addStockInvoiceNo");
    const grnInput = document.getElementById("addStockGrnNo");
    const notesInput = document.getElementById("addStockNotes");

    const today = new Date().toISOString().split("T")[0];
    const autoBatch = `BATCH-${today.replace(/-/g, "").slice(2)}-${Math.floor(100 + Math.random() * 900)}`;

    if (batchInput) batchInput.value = autoBatch;
    if (dateInput) dateInput.value = today;
    if (qtyInput) qtyInput.value = "";
    if (costInput) costInput.value = "";
    if (supplierInput) supplierInput.value = "PaperPro Lanka";
    if (invoiceInput) invoiceInput.value = "";
    if (grnInput) grnInput.value = "";
    if (notesInput) notesInput.value = "";

    const newSkuSection = document.getElementById("newSkuRegistrationSection");
    if (newSkuSection) newSkuSection.style.display = "none";

    if (prefillItemCode) {
      this.onAddStockItemSelect(prefillItemCode);
    } else {
      this.onAddStockCalcChange();
    }

    this.ctx.openModal("addStockModal");
  }

  onAddStockItemSelect(selectedVal) {
    const newSkuSection = document.getElementById("newSkuRegistrationSection");
    const costInput = document.getElementById("addStockCost");
    const supplierInput = document.getElementById("addStockSupplier");
    const unitBadge = document.getElementById("addStockUnitBadge");

    if (selectedVal === "__NEW_SKU__") {
      if (newSkuSection) newSkuSection.style.display = "block";
      if (unitBadge) unitBadge.textContent = "Units";
      return;
    }

    if (newSkuSection) newSkuSection.style.display = "none";

    const items = this.ctx.getItems() || [];
    const item = items.find(i => i.code === selectedVal);
    if (item) {
      if (costInput && (!costInput.value || costInput.value == 0)) {
        costInput.value = item.unitPrice || "";
      }
      if (supplierInput) supplierInput.value = item.supplier || "PaperPro Lanka";
      if (unitBadge) unitBadge.textContent = item.unit || "Units";
    }

    this.onAddStockCalcChange();
  }

  onAddStockCalcChange() {
    const qtyInput = document.getElementById("addStockQty");
    const costInput = document.getElementById("addStockCost");
    const preview = document.getElementById("addStockSummaryPreview");
    if (!preview) return;

    const qty = parseFloat(qtyInput ? qtyInput.value : 0) || 0;
    const cost = parseFloat(costInput ? costInput.value : 0) || 0;
    const total = qty * cost;

    preview.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: var(--text-muted);">Shipment Total Value:</span>
        <strong style="font-size: 16px; color: #1677ff;">${this.ctx.formatCurrency(total)}</strong>
      </div>
    `;
  }

  saveAddStockShipment() {
    const itemSelect = document.getElementById("addStockItemSelect");
    const batchInput = document.getElementById("addStockBatchNo");
    const dateInput = document.getElementById("addStockDate");
    const qtyInput = document.getElementById("addStockQty");
    const costInput = document.getElementById("addStockCost");
    const supplierInput = document.getElementById("addStockSupplier");
    const invoiceInput = document.getElementById("addStockInvoiceNo");
    const grnInput = document.getElementById("addStockGrnNo");
    const notesInput = document.getElementById("addStockNotes");

    const selectedVal = itemSelect ? itemSelect.value : "";
    const batchNo = batchInput ? batchInput.value.trim() : "";
    const date = dateInput ? dateInput.value : new Date().toISOString().split("T")[0];
    const qty = parseFloat(qtyInput ? qtyInput.value : 0);
    const cost = parseFloat(costInput ? costInput.value : 0);
    const supplier = supplierInput ? supplierInput.value.trim() : "PaperPro Lanka";
    const invoiceNo = invoiceInput ? invoiceInput.value.trim() : "";
    const grnNo = grnInput ? grnInput.value.trim() : "";
    const notes = notesInput ? notesInput.value.trim() : "";

    if (!selectedVal) {
      this.ctx.showToast("Please select a Material SKU to receive", "error");
      return;
    }

    if (!batchNo) {
      this.ctx.showToast("Please provide a Batch / Consignment Number", "error");
      return;
    }

    if (!qty || qty <= 0) {
      this.ctx.showToast("Please enter a valid received quantity greater than 0", "error");
      return;
    }

    let items = this.ctx.getItems() || [];
    let targetItem = null;

    if (selectedVal === "__NEW_SKU__") {
      const codeInput = document.getElementById("newSkuCode");
      const nameInput = document.getElementById("newSkuName");
      const catInput = document.getElementById("newSkuCategory");
      const unitInput = document.getElementById("newSkuUnit");
      const threshInput = document.getElementById("newSkuThreshold");

      const code = codeInput ? codeInput.value.trim().toUpperCase() : "";
      const name = nameInput ? nameInput.value.trim() : "";
      const category = catInput ? catInput.value : "Paper & Boards";
      const unit = unitInput ? unitInput.value : "Units";
      const threshold = parseInt(threshInput ? threshInput.value : 10, 10) || 10;

      if (!code || !name) {
        this.ctx.showToast("Please enter both Material Code and Item Name for the new SKU", "error");
        return;
      }

      if (items.some(i => i.code === code)) {
        this.ctx.showToast(`Material SKU with code "${code}" already exists in catalog`, "error");
        return;
      }

      targetItem = {
        code: code,
        name: name,
        category: category,
        unit: unit,
        unitPrice: cost,
        supplier: supplier,
        minThreshold: threshold,
        batches: [],
        history: []
      };

      items.unshift(targetItem);
      this.ctx.setItems(items);
    } else {
      targetItem = items.find(i => i.code === selectedVal);
    }

    if (!targetItem) {
      this.ctx.showToast("Selected material item could not be found", "error");
      return;
    }

    if (!targetItem.batches) targetItem.batches = [];
    if (!targetItem.history) targetItem.history = [];

    // Add new Batch
    targetItem.batches.unshift({
      id: batchNo,
      receivedDate: date,
      initialQty: qty,
      availableQty: qty,
      unitCost: cost,
      supplier: supplier,
      invoiceNo: invoiceNo,
      grnNo: grnNo
    });

    // Update item cost reference if provided
    if (cost > 0) {
      targetItem.unitPrice = cost;
    }

    // Add Transaction History Entry
    targetItem.history.unshift({
      id: `TXN-${Date.now()}`,
      date: date,
      type: "ADD",
      qty: qty,
      batchId: batchNo,
      reason: "Goods Received (GRN)",
      notes: `${grnNo ? `GRN: ${grnNo} ` : ""}${invoiceNo ? `Invoice: ${invoiceNo} ` : ""}${notes}`,
      user: "Admin User",
      resultingBatchStock: qty
    });

    this.ctx.saveData();
    this.ctx.render();
    this.ctx.closeModal("addStockModal");
    this.ctx.showToast(`Successfully received ${qty} ${targetItem.unit} of ${targetItem.name} (${batchNo})!`, "success");
  }
}

export default StockShipmentHandler;

