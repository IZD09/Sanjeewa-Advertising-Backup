/**
 * SanjeewaAdvertising - PO Process Handler
 *
 * Manages Create Purchase Order modal, dynamic item rows, calculations,
 * and PO printable documents.
 */

export class POProcessHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getPurchaseOrders
   * @param {Function} context.setPurchaseOrders
   * @param {Function} context.getSuppliers
   * @param {Function} context.savePOData
   * @param {Function} context.generateNextPONumber
   * @param {Function} context.formatCurrency
   * @param {Function} context.openModal
   * @param {Function} context.closeModal
   * @param {Function} context.showToast
   * @param {Function} context.switchView
   * @param {Function} context.getCurrentView
   * @param {Function} context.populatePOSelect
   * @param {Function} context.onPurchaseOrderSelect
   * @param {Function} context.renderOpenPoBadge
   * @param {Function} context.renderPOTable
   * @param {Function} context.populatePOSupplierFilter
   * @param {Function} context.createGrnForPO
   * @param {Function} context.getCatalogItems
   */
  constructor(context) {
    this.ctx = context;
    this.newPoItems = [];
    this.activePoContext = null;
  }

  openCreatePOModal(defaultSupplier = null) {
    const poNumInput = document.getElementById("newPoNumber");
    const orderDateInput = document.getElementById("newPoDate");
    const expDateInput = document.getElementById("newPoExpectedDate");
    const supplierInput = document.getElementById("newPoSupplier");
    const contactInput = document.getElementById("newPoContact");
    const remarksInput = document.getElementById("newPoRemarks");

    const today = new Date().toISOString().split("T")[0];
    const expDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const supName = defaultSupplier || "PaperPro Lanka";
    const suppliers = this.ctx.getSuppliers() || [];
    const foundSup = suppliers.find(s => s.name.toLowerCase() === supName.toLowerCase());

    if (poNumInput) poNumInput.value = this.ctx.generateNextPONumber();
    if (orderDateInput) orderDateInput.value = today;
    if (expDateInput) expDateInput.value = expDate;
    if (supplierInput) supplierInput.value = supName;
    if (contactInput) contactInput.value = foundSup ? foundSup.phone : "077 123 4567";
    if (remarksInput) remarksInput.value = "";

    const catalog = this.ctx.getCatalogItems();
    this.newPoItems = [
      {
        item_id: catalog[0]?.code || "PAP-001",
        item_name: catalog[0]?.name || "300gsm Art Board SRA3",
        unit: catalog[0]?.unit || "Sheets",
        qty: 500,
        unit_cost: catalog[0]?.unitPrice || 45.00,
        total: (catalog[0]?.unitPrice || 45.00) * 500
      },
      {
        item_id: catalog[3]?.code || "INK-101",
        item_name: catalog[3]?.name || "Flora Solvent Cyan Ink (5L)",
        unit: catalog[3]?.unit || "Liters",
        qty: 4,
        unit_cost: catalog[3]?.unitPrice || 8500.00,
        total: (catalog[3]?.unitPrice || 8500.00) * 4
      }
    ];

    this.renderNewPoItems();
    this.calculateNewPoTotal();
    this.ctx.openModal("createPOModal");
  }

  addNewPoRow() {
    const catalog = this.ctx.getCatalogItems();
    const defaultItem = catalog[0] || { code: "PAP-001", name: "300gsm Art Board SRA3", unit: "Sheets", unitPrice: 45.00 };

    this.newPoItems.push({
      item_id: defaultItem.code,
      item_name: defaultItem.name,
      unit: defaultItem.unit,
      qty: 10,
      unit_cost: defaultItem.unitPrice || 0,
      total: (defaultItem.unitPrice || 0) * 10
    });

    this.renderNewPoItems();
    this.calculateNewPoTotal();
  }

  removeNewPoRow(index) {
    if (this.newPoItems.length <= 1) {
      this.ctx.showToast("A Purchase Order must contain at least 1 item line", "warning");
      return;
    }
    this.newPoItems.splice(index, 1);
    this.renderNewPoItems();
    this.calculateNewPoTotal();
  }

  renderNewPoItems() {
    const tbody = document.getElementById("newPoItemsTbody");
    if (!tbody) return;

    const catalog = this.ctx.getCatalogItems();
    tbody.innerHTML = "";

    this.newPoItems.forEach((row, index) => {
      const tr = document.createElement("tr");

      const optionsHtml = catalog.map(item => `
        <option value="${item.code}" ${item.code === row.item_id ? "selected" : ""}>
          ${item.name} (${item.code})
        </option>
      `).join("");

      tr.innerHTML = `
        <td style="min-width: 250px;">
          <select class="grn-inline-input" onchange="window.grnManager.onNewPoItemSelectChange(${index}, this.value)">
            ${optionsHtml}
          </select>
        </td>
        <td style="width: 100px;">
          <span class="inv-unit-badge" style="font-size: 12px; font-weight: 600; color: var(--text);">${row.unit}</span>
        </td>
        <td style="width: 120px;">
          <input type="number" class="grn-inline-input text-right" min="1" step="1" value="${row.qty}" oninput="window.grnManager.onNewPoQtyChange(${index}, this.value)">
        </td>
        <td style="width: 140px;">
          <input type="number" class="grn-inline-input text-right" min="0" step="0.01" value="${row.unit_cost}" oninput="window.grnManager.onNewPoCostChange(${index}, this.value)">
        </td>
        <td class="text-right" style="width: 150px; font-weight: 700; color: #1677ff;">
          ${this.ctx.formatCurrency(row.total)}
        </td>
        <td class="text-center" style="width: 60px;">
          <button type="button" class="ant-btn-action" style="color: #ff4d4f; border-color: transparent;" title="Delete Row" onclick="window.grnManager.removeNewPoRow(${index})">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });
  }

  onNewPoItemSelectChange(index, itemCode) {
    const catalog = this.ctx.getCatalogItems();
    const found = catalog.find(i => i.code === itemCode);
    if (!found) return;

    this.newPoItems[index].item_id = found.code;
    this.newPoItems[index].item_name = found.name;
    this.newPoItems[index].unit = found.unit;
    this.newPoItems[index].unit_cost = found.unitPrice || 0;
    this.newPoItems[index].total = this.newPoItems[index].qty * this.newPoItems[index].unit_cost;

    this.renderNewPoItems();
    this.calculateNewPoTotal();
  }

  onNewPoQtyChange(index, qtyVal) {
    const qty = parseFloat(qtyVal) || 0;
    this.newPoItems[index].qty = qty;
    this.newPoItems[index].total = qty * this.newPoItems[index].unit_cost;
    this.calculateNewPoTotal();
    this.renderNewPoRowTotal(index);
  }

  onNewPoCostChange(index, costVal) {
    const cost = parseFloat(costVal) || 0;
    this.newPoItems[index].unit_cost = cost;
    this.newPoItems[index].total = this.newPoItems[index].qty * cost;
    this.calculateNewPoTotal();
    this.renderNewPoRowTotal(index);
  }

  renderNewPoRowTotal(index) {
    const tbody = document.getElementById("newPoItemsTbody");
    if (!tbody) return;
    const tr = tbody.children[index];
    if (tr) {
      const totalTd = tr.children[4];
      if (totalTd) totalTd.textContent = this.ctx.formatCurrency(this.newPoItems[index].total);
    }
  }

  calculateNewPoTotal() {
    const total = this.newPoItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    const display = document.getElementById("newPoTotalDisplay");
    if (display) display.textContent = this.ctx.formatCurrency(total);
    return total;
  }

  saveNewPurchaseOrder() {
    const poNum = document.getElementById("newPoNumber")?.value || this.ctx.generateNextPONumber();
    const orderDate = document.getElementById("newPoDate")?.value;
    const expDate = document.getElementById("newPoExpectedDate")?.value;
    const supplier = document.getElementById("newPoSupplier")?.value?.trim();
    const contact = document.getElementById("newPoContact")?.value?.trim() || "";
    const remarks = document.getElementById("newPoRemarks")?.value?.trim() || "";

    if (!supplier) {
      this.ctx.showToast("Please enter or select a Supplier for the Purchase Order", "error");
      return;
    }

    if (!orderDate) {
      this.ctx.showToast("Please select the Order Date", "error");
      return;
    }

    if (this.newPoItems.length === 0) {
      this.ctx.showToast("Please add at least 1 item to the Purchase Order", "error");
      return;
    }

    for (const item of this.newPoItems) {
      if (!item.qty || item.qty <= 0) {
        this.ctx.showToast(`Please enter a valid order quantity for "${item.item_name}"`, "error");
        return;
      }
    }

    const totalAmount = this.calculateNewPoTotal();

    const newPO = {
      po_number: poNum,
      order_date: orderDate,
      expected_date: expDate,
      supplier_name: supplier,
      supplier_contact: contact,
      status: "Pending",
      total_amount: totalAmount,
      created_by: "Admin User",
      remarks: remarks,
      items: this.newPoItems.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name,
        unit: item.unit,
        qty_ordered: item.qty,
        qty_received: 0,
        unit_cost: item.unit_cost,
        item_total: item.total
      }))
    };

    const purchaseOrders = this.ctx.getPurchaseOrders() || [];
    purchaseOrders.unshift(newPO);
    this.ctx.setPurchaseOrders(purchaseOrders);
    this.ctx.savePOData();
    this.ctx.renderOpenPoBadge();
    this.ctx.renderPOTable();
    this.ctx.populatePOSupplierFilter();

    this.ctx.closeModal("createPOModal");

    if (this.ctx.getCurrentView() === "form") {
      this.ctx.populatePOSelect(newPO.po_number);
      const poSelect = document.getElementById("grnFormPOSelect");
      if (poSelect) poSelect.value = newPO.po_number;
      this.ctx.onPurchaseOrderSelect(newPO.po_number);
      this.ctx.showToast(`Purchase Order ${newPO.po_number} created and items loaded for GRN!`, "success");
    } else {
      this.ctx.showToast(`Purchase Order ${newPO.po_number} created successfully!`, "success");
      if (this.ctx.getCurrentView() !== "po") {
        this.ctx.switchView("po");
      }
    }
  }

  viewPO(poNumber) {
    const purchaseOrders = this.ctx.getPurchaseOrders() || [];
    const po = purchaseOrders.find(p => p.po_number === poNumber);
    if (!po) return;

    this.activePoContext = po;

    const docNo = document.getElementById("poDocNumber");
    const docStatus = document.getElementById("poDocStatus");
    const docSupplier = document.getElementById("poDocSupplier");
    const docDate = document.getElementById("poDocDate");
    const docContact = document.getElementById("poDocContact");
    const docExpDate = document.getElementById("poDocExpectedDate");
    const docRemarks = document.getElementById("poDocRemarks");
    const docTotal = document.getElementById("poDocTotal");
    const tbody = document.getElementById("poDocItemsTbody");

    if (docNo) docNo.textContent = po.po_number;
    if (docStatus) {
      docStatus.className = `grn-status-badge ${po.status.toLowerCase()}`;
      docStatus.textContent = po.status;
    }
    if (docSupplier) docSupplier.textContent = po.supplier_name;
    if (docDate) docDate.textContent = po.order_date;
    if (docContact) docContact.textContent = po.supplier_contact || "N/A";
    if (docExpDate) docExpDate.textContent = po.expected_date || "N/A";
    if (docRemarks) docRemarks.textContent = po.remarks || "Standard packaging & delivery terms apply.";
    if (docTotal) docTotal.textContent = this.ctx.formatCurrency(po.total_amount);

    if (tbody) {
      tbody.innerHTML = "";
      if (po.items && po.items.length > 0) {
        po.items.forEach((item, idx) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${idx + 1}</td>
            <td><strong>${item.item_name}</strong> <span style="font-size: 11px; color: #666;">(${item.item_id})</span></td>
            <td>${item.unit}</td>
            <td class="text-right"><strong>${(item.qty_ordered || 0).toLocaleString()}</strong></td>
            <td class="text-right" style="color: ${item.qty_received >= item.qty_ordered ? '#52c41a' : '#faad14'}; font-weight: 600;">
              ${(item.qty_received || 0).toLocaleString()}
            </td>
            <td class="text-right">${this.ctx.formatCurrency(item.unit_cost)}</td>
            <td class="text-right" style="font-weight: bold;">${this.ctx.formatCurrency(item.item_total)}</td>
          `;
          tbody.appendChild(tr);
        });
      }
    }

    const poCreateGrnActionBtn = document.getElementById("poCreateGrnActionBtn");
    if (poCreateGrnActionBtn) {
      poCreateGrnActionBtn.style.display = po.status === "Completed" ? "none" : "inline-flex";
    }

    this.ctx.openModal("viewPOModal");
  }

  triggerPrintPO() {
    const printArea = document.getElementById("poPrintArea");
    if (!printArea) return;

    const printWin = window.open("", "_blank", "width=850,height=900");
    if (!printWin) {
      alert("Please allow popups to print the Purchase Order Document.");
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purchase Order - ${this.activePoContext?.po_number || "Document"}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; padding: 24px; color: #111; }
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
          .grn-status-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; border: 1px solid #faad14; color: #faad14; background: #fffbe6; }
          .grn-status-badge.completed { border-color: #52c41a; color: #52c41a; background: #f6ffed; }
          .grn-voucher-signatures { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; }
          .grn-sig-box { width: 180px; border-top: 1px dashed #666; text-align: center; font-size: 12px; color: #555; padding-top: 5px; }
        </style>
      </head>
      <body>
        ${printArea.innerHTML}
      </body>
      </html>
    `);

    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
      printWin.close();
    }, 350);
  }
}

export default POProcessHandler;

