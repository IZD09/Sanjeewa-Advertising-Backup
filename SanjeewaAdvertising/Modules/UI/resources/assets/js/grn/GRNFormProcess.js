/**
 * SanjeewaAdvertising - GRN Form Process
 *
 * Handles creation of Goods Received Notes, dynamic line items,
 * PO linking and autofill, calculation of totals, and stock updates.
 */

export class GRNFormProcess {
  /**
   * @param {Object} context
   * @param {Function} context.getGrnRecords
   * @param {Function} context.setGrnRecords
   * @param {Function} context.getPurchaseOrders
   * @param {Function} context.saveData
   * @param {Function} context.savePOData
   * @param {Function} context.generateNextGrnNumber
   * @param {Function} context.formatCurrency
   * @param {Function} context.showToast
   * @param {Function} context.switchView
   * @param {Function} context.viewGRN
   * @param {Function} context.renderPOTable
   * @param {Function} context.renderOpenPoBadge
   * @param {Function} context.render
   */
  constructor(context) {
    this.ctx = context;
    this.formItems = [];
  }

  getCatalogItems() {
    if (typeof window !== "undefined" && window.inventoryManager && window.inventoryManager.items && window.inventoryManager.items.length > 0) {
      return window.inventoryManager.items;
    }
    return [
      { code: "PAP-001", name: "300gsm Art Board SRA3", unit: "Sheets", unitPrice: 45.00 },
      { code: "PAP-002", name: "250gsm Ivory Board A3", unit: "Sheets", unitPrice: 38.00 },
      { code: "PAP-003", name: "150gsm Glossy Art Paper A4", unit: "Sheets", unitPrice: 14.00 },
      { code: "INK-101", name: "Flora Solvent Cyan Ink (5L)", unit: "Liters", unitPrice: 8500.00 },
      { code: "INK-102", name: "Flora Solvent Magenta Ink (5L)", unit: "Liters", unitPrice: 6800.00 },
      { code: "INK-103", name: "Flora Solvent Yellow Ink (5L)", unit: "Liters", unitPrice: 6800.00 },
      { code: "FLX-201", name: "Frontlit Flex 280gsm (10ft × 50m)", unit: "Rolls", unitPrice: 18500.00 },
      { code: "FLX-202", name: "Star Heavy Flex 380gsm (10.5ft × 50m)", unit: "Rolls", unitPrice: 26000.00 },
      { code: "VIN-301", name: "Glossy Self-Adhesive Vinyl (4ft × 50m)", unit: "Rolls", unitPrice: 16800.00 },
      { code: "VIN-303", name: "One-Way Vision Film (4.2ft × 30m)", unit: "Rolls", unitPrice: 21500.00 },
      { code: "RIG-401", name: "5mm White Foam Board (4ft × 8ft)", unit: "Sheets", unitPrice: 3400.00 },
      { code: "RIG-402", name: "Rollup Stand Luxury Aluminium (2.5ft × 6ft)", unit: "Sets", unitPrice: 2800.00 }
    ];
  }

  populatePOSelect(preselectedPoNo = null) {
    const select = document.getElementById("grnFormPOSelect");
    if (!select) return;

    select.innerHTML = "";

    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = "-- Select Approved / Pending Purchase Order --";
    select.appendChild(defaultOpt);

    const manualOpt = document.createElement("option");
    manualOpt.value = "MANUAL";
    manualOpt.textContent = "[+] Manual / Direct Consignment (No PO)";
    select.appendChild(manualOpt);

    const purchaseOrders = this.ctx.getPurchaseOrders() || [];
    const pendingPOs = purchaseOrders.filter(p => p.status !== "Completed");
    const completedPOs = purchaseOrders.filter(p => p.status === "Completed");

    if (pendingPOs.length > 0) {
      const group = document.createElement("optgroup");
      group.label = "Pending & Open Purchase Orders (Ready for GRN)";
      pendingPOs.forEach(po => {
        const opt = document.createElement("option");
        opt.value = po.po_number;
        opt.textContent = `${po.po_number} • ${po.supplier_name} (${po.items ? po.items.length : 0} items — ${this.ctx.formatCurrency(po.total_amount)}) [${po.status}]`;
        if (preselectedPoNo === po.po_number) opt.selected = true;
        group.appendChild(opt);
      });
      select.appendChild(group);
    }

    if (completedPOs.length > 0) {
      const group = document.createElement("optgroup");
      group.label = "Completed Purchase Orders (Already Received)";
      completedPOs.forEach(po => {
        const opt = document.createElement("option");
        opt.value = po.po_number;
        opt.textContent = `${po.po_number} • ${po.supplier_name} (Received)`;
        if (preselectedPoNo === po.po_number) opt.selected = true;
        group.appendChild(opt);
      });
      select.appendChild(group);
    }
  }

  initNewGrnForm(targetPoNumber = null) {
    const grnNoInput = document.getElementById("grnFormNumber");
    const dateInput = document.getElementById("grnFormDate");
    const receivedByInput = document.getElementById("grnFormReceivedBy");
    const remarksInput = document.getElementById("grnFormRemarks");
    const discountInput = document.getElementById("grnFormDiscount");

    if (grnNoInput) grnNoInput.value = this.ctx.generateNextGrnNumber();
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];
    if (receivedByInput) receivedByInput.value = "Admin User";
    if (remarksInput) remarksInput.value = "";
    if (discountInput) discountInput.value = "0.00";

    this.populatePOSelect(targetPoNumber);

    const purchaseOrders = this.ctx.getPurchaseOrders() || [];

    if (targetPoNumber) {
      this.onPurchaseOrderSelect(targetPoNumber);
    } else {
      const pendingPo = purchaseOrders.find(p => p.status === "Pending" || p.status === "Partial");
      if (pendingPo) {
        const poSelect = document.getElementById("grnFormPOSelect");
        if (poSelect) poSelect.value = pendingPo.po_number;
        this.onPurchaseOrderSelect(pendingPo.po_number);
      } else {
        this.clearSelectedPO();
      }
    }
  }

  onPurchaseOrderSelect(poNumber) {
    const poInput = document.getElementById("grnFormPO");
    const supplierInput = document.getElementById("grnFormSupplier");
    const contactInput = document.getElementById("grnFormContact");
    const banner = document.getElementById("grnPoInfoBanner");
    const bannerCode = document.getElementById("grnPoBannerCode");
    const bannerStatus = document.getElementById("grnPoBannerStatus");
    const bannerSupplier = document.getElementById("grnPoBannerSupplier");
    const bannerCount = document.getElementById("grnPoBannerItemCount");

    if (!poNumber || poNumber === "MANUAL") {
      if (poInput) poInput.value = poNumber === "MANUAL" ? `DIR-${Date.now().toString().slice(-4)}` : "";
      if (banner) banner.style.display = "none";
      return;
    }

    const purchaseOrders = this.ctx.getPurchaseOrders() || [];
    const po = purchaseOrders.find(p => p.po_number === poNumber);
    if (!po) {
      if (poInput) poInput.value = poNumber;
      if (banner) banner.style.display = "none";
      return;
    }

    if (poInput) poInput.value = po.po_number;
    if (supplierInput) supplierInput.value = po.supplier_name;
    if (contactInput) contactInput.value = po.supplier_contact || "";

    if (banner) {
      banner.style.display = "flex";
      if (bannerCode) bannerCode.textContent = po.po_number;
      if (bannerStatus) {
        bannerStatus.className = `grn-status-badge ${po.status.toLowerCase()}`;
        bannerStatus.textContent = po.status;
      }
      if (bannerSupplier) {
        bannerSupplier.textContent = `Supplier: ${po.supplier_name} • Ordered Date: ${po.order_date}${po.expected_date ? ` • Due: ${po.expected_date}` : ""}`;
      }
      if (bannerCount) {
        bannerCount.textContent = `${po.items ? po.items.length : 0} items auto-loaded`;
      }
    }

    if (po.items && po.items.length > 0) {
      this.formItems = po.items.map(item => {
        const remainingQty = Math.max(1, (item.qty_ordered || 0) - (item.qty_received || 0));
        return {
          item_id: item.item_id,
          item_name: item.item_name,
          unit: item.unit,
          qty: remainingQty,
          ordered_qty: item.qty_ordered,
          unit_cost: item.unit_cost,
          total: remainingQty * item.unit_cost
        };
      });
    } else {
      this.formItems = [];
    }

    this.renderFormItems();
    this.calculateFinancials();
    this.ctx.showToast(`Loaded ${this.formItems.length} items from Purchase Order ${po.po_number}`, "success");
  }

  clearSelectedPO() {
    const poSelect = document.getElementById("grnFormPOSelect");
    const poInput = document.getElementById("grnFormPO");
    const banner = document.getElementById("grnPoInfoBanner");

    if (poSelect) poSelect.value = "MANUAL";
    if (poInput) poInput.value = "";
    if (banner) banner.style.display = "none";

    const catalog = this.getCatalogItems();
    const defaultItem = catalog[0] || { code: "PAP-001", name: "300gsm Art Board SRA3", unit: "Sheets", unitPrice: 45.00 };
    this.formItems = [
      {
        item_id: defaultItem.code,
        item_name: defaultItem.name,
        unit: defaultItem.unit,
        qty: 100,
        ordered_qty: null,
        unit_cost: defaultItem.unitPrice || 45.00,
        total: (defaultItem.unitPrice || 45.00) * 100
      }
    ];

    this.renderFormItems();
    this.calculateFinancials();
  }

  createGrnForPO(poNumber) {
    this.ctx.switchView("form", poNumber);
    const formView = document.getElementById("grnFormView");
    if (formView) {
      formView.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  addNewRow() {
    const catalog = this.getCatalogItems();
    const defaultItem = catalog[0] || { code: "PAP-001", name: "300gsm Art Board SRA3", unit: "Sheets", unitPrice: 45.00 };

    this.formItems.push({
      item_id: defaultItem.code,
      item_name: defaultItem.name,
      unit: defaultItem.unit,
      qty: 1,
      ordered_qty: null,
      unit_cost: defaultItem.unitPrice || 0,
      total: (defaultItem.unitPrice || 0) * 1
    });

    this.renderFormItems();
    this.calculateFinancials();
  }

  removeRow(index) {
    if (this.formItems.length <= 1) {
      this.ctx.showToast("A GRN must contain at least 1 item row", "warning");
      return;
    }
    this.formItems.splice(index, 1);
    this.renderFormItems();
    this.calculateFinancials();
  }

  renderFormItems() {
    const tbody = document.getElementById("grnFormItemsTbody");
    if (!tbody) return;

    const catalog = this.getCatalogItems();
    tbody.innerHTML = "";

    this.formItems.forEach((row, index) => {
      const tr = document.createElement("tr");

      const optionsHtml = catalog.map(item => `
        <option value="${item.code}" ${item.code === row.item_id ? "selected" : ""}>
          ${item.name} (${item.code})
        </option>
      `).join("");

      const orderedHintHtml = row.ordered_qty ? `
        <span class="po-ordered-hint">
          <i class="fa-solid fa-clipboard-check"></i> Ordered: ${row.ordered_qty} ${row.unit}
        </span>
      ` : "";

      tr.innerHTML = `
        <td style="min-width: 260px;">
          <select class="grn-inline-input" onchange="window.grnManager.onItemSelectChange(${index}, this.value)">
            ${optionsHtml}
          </select>
        </td>
        <td style="width: 100px;">
          <span class="inv-unit-badge" style="font-size: 12px; font-weight: 600; color: var(--text);">${row.unit}</span>
        </td>
        <td style="width: 130px;">
          <input type="number" class="grn-inline-input text-right" min="1" step="1" value="${row.qty}" oninput="window.grnManager.onQtyChange(${index}, this.value)">
          ${orderedHintHtml}
        </td>
        <td style="width: 140px;">
          <input type="number" class="grn-inline-input text-right" min="0" step="0.01" value="${row.unit_cost}" oninput="window.grnManager.onCostChange(${index}, this.value)">
        </td>
        <td class="text-right" style="width: 150px; font-weight: 700; color: var(--text);">
          ${this.ctx.formatCurrency(row.total)}
        </td>
        <td class="text-center" style="width: 70px;">
          <button type="button" class="ant-btn-action" style="color: #ff4d4f; border-color: transparent;" title="Delete Row" onclick="window.grnManager.removeRow(${index})">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });
  }

  onItemSelectChange(index, itemCode) {
    const catalog = this.getCatalogItems();
    const found = catalog.find(i => i.code === itemCode);
    if (!found) return;

    this.formItems[index].item_id = found.code;
    this.formItems[index].item_name = found.name;
    this.formItems[index].unit = found.unit;
    this.formItems[index].unit_cost = found.unitPrice || 0;
    this.formItems[index].total = this.formItems[index].qty * this.formItems[index].unit_cost;

    this.renderFormItems();
    this.calculateFinancials();
  }

  onQtyChange(index, qtyVal) {
    const qty = parseFloat(qtyVal) || 0;
    this.formItems[index].qty = qty;
    this.formItems[index].total = qty * this.formItems[index].unit_cost;
    this.renderRowTotal(index);
    this.calculateFinancials();
  }

  onCostChange(index, costVal) {
    const cost = parseFloat(costVal) || 0;
    this.formItems[index].unit_cost = cost;
    this.formItems[index].total = this.formItems[index].qty * cost;
    this.renderRowTotal(index);
    this.calculateFinancials();
  }

  renderRowTotal(index) {
    const tbody = document.getElementById("grnFormItemsTbody");
    if (!tbody) return;
    const tr = tbody.children[index];
    if (tr) {
      const totalTd = tr.children[4];
      if (totalTd) totalTd.textContent = this.ctx.formatCurrency(this.formItems[index].total);
    }
  }

  calculateFinancials() {
    const subTotal = this.formItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    const discountInput = document.getElementById("grnFormDiscount");
    const discount = parseFloat(discountInput?.value) || 0;
    const netTotal = Math.max(0, subTotal - discount);

    const subTotalElem = document.getElementById("grnFormSubTotal");
    const netTotalElem = document.getElementById("grnFormNetTotal");

    if (subTotalElem) subTotalElem.textContent = this.ctx.formatCurrency(subTotal);
    if (netTotalElem) netTotalElem.textContent = this.ctx.formatCurrency(netTotal);

    return { subTotal, discount, netTotal };
  }

  saveGRN(isCompleted = false) {
    const grnNumber = document.getElementById("grnFormNumber")?.value || this.ctx.generateNextGrnNumber();
    const poNumber = document.getElementById("grnFormPO")?.value || document.getElementById("grnFormPOSelect")?.value || "";
    const receivedDate = document.getElementById("grnFormDate")?.value;
    const supplierName = document.getElementById("grnFormSupplier")?.value?.trim();
    const contactNo = document.getElementById("grnFormContact")?.value?.trim() || "";
    const receivedBy = document.getElementById("grnFormReceivedBy")?.value || "Admin User";
    const remarks = document.getElementById("grnFormRemarks")?.value || "";

    if (!supplierName) {
      this.ctx.showToast("Please enter or select a Supplier / Vendor", "error");
      return;
    }

    if (!receivedDate) {
      this.ctx.showToast("Please select the Received Date", "error");
      return;
    }

    if (this.formItems.length === 0) {
      this.ctx.showToast("Please add at least 1 item to the GRN", "error");
      return;
    }

    for (const item of this.formItems) {
      if (!item.qty || item.qty <= 0) {
        this.ctx.showToast(`Please enter a valid received quantity for "${item.item_name}"`, "error");
        return;
      }
    }

    const { subTotal, discount, netTotal } = this.calculateFinancials();
    const status = isCompleted ? "Completed" : "Draft";
    const now = new Date();
    const dateStr = now.toISOString().replace("T", " ").substring(0, 16);

    const finalizedItems = this.formItems.map((item) => {
      let batchId = "PENDING";
      if (isCompleted) {
        batchId = `BAT-2610-${Math.floor(100 + Math.random() * 899)}`;
      }
      return {
        item_id: item.item_id,
        item_name: item.item_name,
        unit: item.unit,
        qty_received: item.qty,
        unit_cost: item.unit_cost,
        item_total: item.total,
        batch_id: batchId
      };
    });

    const newRecord = {
      grn_id: grnNumber,
      grn_number: grnNumber,
      purchase_order_no: poNumber || "DIR-GRN",
      supplier_id: `SUP-${Date.now().toString().slice(-3)}`,
      supplier_name: supplierName,
      supplier_contact: contactNo,
      supplier_invoice_no: contactNo,
      received_date: receivedDate,
      sub_total: subTotal,
      discount: discount,
      net_total: netTotal,
      received_by: receivedBy,
      status: status,
      created_at: dateStr,
      remarks: remarks,
      items: finalizedItems
    };

    // Update inventory stock live if completed
    if (isCompleted && typeof window !== "undefined" && window.inventoryManager) {
      finalizedItems.forEach(item => {
        let catalogItem = window.inventoryManager.items.find(i => i.code === item.item_id);
        if (catalogItem) {
          if (!catalogItem.batches) catalogItem.batches = [];
          catalogItem.batches.push({
            id: item.batch_id,
            receivedDate: receivedDate,
            unitCost: item.unit_cost,
            initialQty: item.qty_received,
            availableQty: item.qty_received,
            supplier: supplierName,
            grnNo: grnNumber
          });

          if (!catalogItem.transactions) catalogItem.transactions = [];
          catalogItem.transactions.unshift({
            id: `TXN-${Date.now().toString().slice(-4)}`,
            date: dateStr,
            type: "ADD",
            batchId: item.batch_id,
            qty: item.qty_received,
            reason: `GRN Completed (${grnNumber})`,
            operator: receivedBy,
            remarks: `Supplier: ${supplierName}${poNumber ? ` (PO: ${poNumber})` : ""}${contactNo ? ` [Tel: ${contactNo}]` : ""}`
          });

          catalogItem.supplier = supplierName;
        }
      });

      window.inventoryManager.saveData();
      window.inventoryManager.render();
    }

    if (isCompleted && poNumber) {
      this.updatePurchaseOrderStatus(poNumber, finalizedItems);
    }

    const grnRecords = this.ctx.getGrnRecords() || [];
    grnRecords.unshift(newRecord);
    this.ctx.setGrnRecords(grnRecords);
    this.ctx.saveData();

    this.ctx.showToast(
      isCompleted
        ? `GRN ${grnNumber} completed! Stock batches and inventory values updated successfully.`
        : `GRN ${grnNumber} saved as Draft! You can finalize it anytime.`,
      "success"
    );

    this.ctx.switchView("list");

    if (isCompleted) {
      setTimeout(() => this.ctx.viewGRN(grnNumber), 400);
    }
  }

  finalizeDraftGRN(grnNumber) {
    const grnRecords = this.ctx.getGrnRecords() || [];
    const rec = grnRecords.find(r => r.grn_number === grnNumber);
    if (!rec || rec.status === "Completed") return;

    const confirmed = confirm(`Are you sure you want to complete ${grnNumber}? This will create stock batches and increase warehouse inventory values.`);
    if (!confirmed) return;

    rec.status = "Completed";
    const now = new Date();
    const dateStr = now.toISOString().replace("T", " ").substring(0, 16);

    if (typeof window !== "undefined" && window.inventoryManager && rec.items) {
      rec.items.forEach(item => {
        item.batch_id = `BAT-2610-${Math.floor(100 + Math.random() * 899)}`;
        let catalogItem = window.inventoryManager.items.find(i => i.code === item.item_id);
        if (catalogItem) {
          if (!catalogItem.batches) catalogItem.batches = [];
          catalogItem.batches.push({
            id: item.batch_id,
            receivedDate: rec.received_date,
            unitCost: item.unit_cost,
            initialQty: item.qty_received,
            availableQty: item.qty_received,
            supplier: rec.supplier_name,
            grnNo: rec.grn_number
          });

          if (!catalogItem.transactions) catalogItem.transactions = [];
          catalogItem.transactions.unshift({
            id: `TXN-${Date.now().toString().slice(-4)}`,
            date: dateStr,
            type: "ADD",
            batchId: item.batch_id,
            qty: item.qty_received,
            reason: `GRN Completed (${rec.grn_number})`,
            operator: rec.received_by,
            remarks: `Supplier: ${rec.supplier_name}${rec.purchase_order_no ? ` (PO: ${rec.purchase_order_no})` : ""}${rec.supplier_contact ? ` [Tel: ${rec.supplier_contact}]` : ""}`
          });
        }
      });

      window.inventoryManager.saveData();
      window.inventoryManager.render();
    }

    if (rec.purchase_order_no) {
      this.updatePurchaseOrderStatus(rec.purchase_order_no, rec.items);
    }

    this.ctx.setGrnRecords(grnRecords);
    this.ctx.saveData();
    this.ctx.render();
    this.ctx.showToast(`GRN ${grnNumber} is now Completed and stock batches have been updated!`, "success");
  }

  updatePurchaseOrderStatus(poNumber, receivedItems) {
    if (!poNumber) return;
    const purchaseOrders = this.ctx.getPurchaseOrders() || [];
    const po = purchaseOrders.find(p => p.po_number === poNumber);
    if (!po) return;

    if (receivedItems && po.items) {
      receivedItems.forEach(recItem => {
        const poItem = po.items.find(i => i.item_id === recItem.item_id);
        if (poItem) {
          poItem.qty_received = (poItem.qty_received || 0) + (recItem.qty_received || 0);
        }
      });

      const allReceived = po.items.every(i => (i.qty_received || 0) >= (i.qty_ordered || 0));
      const anyReceived = po.items.some(i => (i.qty_received || 0) > 0);

      if (allReceived) {
        po.status = "Completed";
      } else if (anyReceived) {
        po.status = "Partial";
      }
    }

    this.ctx.savePOData();
    this.ctx.renderOpenPoBadge();
    this.ctx.renderPOTable();
  }
}

