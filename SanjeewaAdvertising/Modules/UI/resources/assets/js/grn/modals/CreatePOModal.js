/**
 * SanjeewaAdvertising - Create Purchase Order Modal
 *
 * Manages Create Purchase Order modal dialog (#createPOModal),
 * dynamic PO item line rows, live cost calculations,
 * and saving new Purchase Orders.
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class CreatePOModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getPurchaseOrders
   * @param {Function} context.setPurchaseOrders
   * @param {Function} context.getSuppliers
   * @param {Function} context.savePOData
   * @param {Function} context.generateNextPONumber
   * @param {Function} context.formatCurrency
   * @param {Function} context.getCatalogItems
   * @param {Function} [context.renderOpenPoBadge]
   * @param {Function} [context.renderPOTable]
   * @param {Function} [context.populatePOSupplierFilter]
   * @param {Function} [context.populatePOSelect]
   * @param {Function} [context.onPurchaseOrderSelect]
   * @param {Function} [context.switchView]
   * @param {Function} [context.getCurrentView]
   */
  constructor(context) {
    super({
      activeModalClass: "open",
      overlaySelector: ".po-modal-overlay",
      toastContainerId: "poToastContainer",
      closeSelectors: ["[data-close-grn-modal]", "[data-close-modal]", ".po-modal-close"],
      autoBind: true
    });

    this.ctx = context;
    this.newPoItems = [];

    this.bindEvents();
  }

  bindEvents() {
    const newPoAddRowBtn = document.getElementById("newPoAddRowBtn");
    if (newPoAddRowBtn) {
      newPoAddRowBtn.addEventListener("click", () => this.addNewPoRow());
    }

    const saveNewPoBtn = document.getElementById("saveNewPoBtn");
    if (saveNewPoBtn) {
      saveNewPoBtn.addEventListener("click", () => this.saveNewPurchaseOrder());
    }

    // Modal open trigger buttons
    const headerCreatePOBtn = document.getElementById("grnHeaderCreatePOBtn");
    if (headerCreatePOBtn) {
      headerCreatePOBtn.addEventListener("click", () => this.openCreatePOModal());
    }

    const poToolbarCreateBtn = document.getElementById("poToolbarCreateBtn");
    if (poToolbarCreateBtn) {
      poToolbarCreateBtn.addEventListener("click", () => this.openCreatePOModal());
    }

    const quickAddPoBtn = document.getElementById("grnQuickAddPOBtn");
    if (quickAddPoBtn) {
      quickAddPoBtn.addEventListener("click", () => this.openCreatePOModal());
    }

    // Auto-fill phone on typing/selecting supplier in PO Modal
    const newPoSupplier = document.getElementById("newPoSupplier");
    if (newPoSupplier) {
      const autoFillHandler = (e) => {
        const val = e.target.value.trim().toLowerCase();
        const suppliers = this.ctx.getSuppliers ? this.ctx.getSuppliers() : [];
        const found = suppliers.find(s => s.name.toLowerCase() === val);
        const contactInput = document.getElementById("newPoContact");
        if (found && contactInput) {
          contactInput.value = found.phone;
        }
      };
      newPoSupplier.addEventListener("input", autoFillHandler);
      newPoSupplier.addEventListener("change", autoFillHandler);
    }
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
    const suppliers = this.ctx.getSuppliers ? this.ctx.getSuppliers() : [];
    const foundSup = suppliers.find(s => s.name.toLowerCase() === supName.toLowerCase());

    if (poNumInput) poNumInput.value = this.ctx.generateNextPONumber();
    if (orderDateInput) orderDateInput.value = today;
    if (expDateInput) expDateInput.value = expDate;
    if (supplierInput) supplierInput.value = supName;
    if (contactInput) contactInput.value = foundSup ? foundSup.phone : "077 123 4567";
    if (remarksInput) remarksInput.value = "";

    const catalog = this.ctx.getCatalogItems ? this.ctx.getCatalogItems() : [];
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
    this.openModal("createPOModal");
  }

  addNewPoRow() {
    const catalog = this.ctx.getCatalogItems ? this.ctx.getCatalogItems() : [];
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
      this.showToast("A Purchase Order must contain at least 1 item line", "warning");
      return;
    }
    this.newPoItems.splice(index, 1);
    this.renderNewPoItems();
    this.calculateNewPoTotal();
  }

  renderNewPoItems() {
    const tbody = document.getElementById("newPoItemsTbody");
    if (!tbody) return;

    const catalog = this.ctx.getCatalogItems ? this.ctx.getCatalogItems() : [];
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
    const catalog = this.ctx.getCatalogItems ? this.ctx.getCatalogItems() : [];
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
      this.showToast("Please enter or select a Supplier for the Purchase Order", "error");
      return;
    }

    if (!orderDate) {
      this.showToast("Please select the Order Date", "error");
      return;
    }

    if (this.newPoItems.length === 0) {
      this.showToast("Please add at least 1 item to the Purchase Order", "error");
      return;
    }

    for (const item of this.newPoItems) {
      if (!item.qty || item.qty <= 0) {
        this.showToast(`Please enter a valid order quantity for "${item.item_name}"`, "error");
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

    const purchaseOrders = this.ctx.getPurchaseOrders ? this.ctx.getPurchaseOrders() : [];
    purchaseOrders.unshift(newPO);
    if (this.ctx.setPurchaseOrders) this.ctx.setPurchaseOrders(purchaseOrders);
    if (this.ctx.savePOData) this.ctx.savePOData();
    if (this.ctx.renderOpenPoBadge) this.ctx.renderOpenPoBadge();
    if (this.ctx.renderPOTable) this.ctx.renderPOTable();
    if (this.ctx.populatePOSupplierFilter) this.ctx.populatePOSupplierFilter();

    this.closeModal("createPOModal");

    if (this.ctx.getCurrentView && this.ctx.getCurrentView() === "form") {
      if (this.ctx.populatePOSelect) this.ctx.populatePOSelect(newPO.po_number);
      const poSelect = document.getElementById("grnFormPOSelect");
      if (poSelect) poSelect.value = newPO.po_number;
      if (this.ctx.onPurchaseOrderSelect) this.ctx.onPurchaseOrderSelect(newPO.po_number);
      this.showToast(`Purchase Order ${newPO.po_number} created and items loaded for GRN!`, "success");
    } else {
      this.showToast(`Purchase Order ${newPO.po_number} created successfully!`, "success");
      if (this.ctx.getCurrentView && this.ctx.getCurrentView() !== "po" && this.ctx.switchView) {
        this.ctx.switchView("po");
      }
    }
  }
}

