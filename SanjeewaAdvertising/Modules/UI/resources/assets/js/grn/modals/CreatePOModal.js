/**
 * SanjeewaAdvertising - Create Purchase Order Modal
 *
 * Manages Create Purchase Order modal dialog (#createPOModal),
 * dynamic PO item line rows, live cost calculations, database stock items search/addition,
 * and saving new Purchase Orders.
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";
import { RequestHandler } from "../../core/RequestHandler.js";

export class CreatePOModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getPurchaseOrders
   * @param {Function} context.setPurchaseOrders
   * @param {Function} context.getSuppliers
   * @param {Function} context.savePOData
   * @param {Function} context.generateNextPONumber
   * @param {Function} context.formatCurrency
   * @param {Function} [context.getCatalogItems]
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
    this.http = new RequestHandler();
    this.newPoItems = [];
    this.catalogItems = [];
    this.catalogLoaded = false;

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

    // Search input for adding items from database
    const itemSearchInput = document.getElementById("newPoItemSearchInput");
    if (itemSearchInput) {
      itemSearchInput.addEventListener("input", (e) => this.searchAndRenderCatalogItems(e.target.value));
      itemSearchInput.addEventListener("focus", (e) => this.searchAndRenderCatalogItems(e.target.value));
    }

    // Close search dropdown on click outside
    document.addEventListener("click", (e) => {
      const dropdown = document.getElementById("newPoItemSearchDropdown");
      const searchInput = document.getElementById("newPoItemSearchInput");
      if (dropdown && searchInput && !searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });
  }

  /**
   * Fetch master stock items from database via API.
   * @param {boolean} [forceRefresh=false]
   */
  async loadCatalogItemsFromDatabase(forceRefresh = false) {
    if (this.catalogLoaded && !forceRefresh && this.catalogItems.length > 0) {
      return this.catalogItems;
    }

    const loadingEl = document.getElementById("newPoItemSearchLoading");
    const hintEl = document.getElementById("newPoItemSearchHint");

    if (loadingEl) loadingEl.style.display = "inline-block";
    if (hintEl) hintEl.textContent = "Loading database material stock items...";

    try {
      const response = await this.http.get("/api/v1/inventory/stock-items/data");
      if (response && response.success && response.data) {
        const rawItems = response.data.stock_items || [];
        this.catalogItems = rawItems.map((item) => {
          let latestCost = 0;
          if (Array.isArray(item.stocks) && item.stocks.length > 0) {
            latestCost = parseFloat(item.stocks[0].buy) || 0;
          }

          let unit = "Units";
          const lowerName = (item.name || "").toLowerCase();
          if (lowerName.includes("ink") || lowerName.includes("liter") || lowerName.includes("solvent")) {
            unit = "Liters";
          } else if (lowerName.includes("board") || lowerName.includes("paper") || lowerName.includes("sheet")) {
            unit = "Sheets";
          } else if (lowerName.includes("flex") || lowerName.includes("vinyl") || lowerName.includes("film") || lowerName.includes("banner")) {
            unit = "Rolls";
          } else if (lowerName.includes("stand") || lowerName.includes("display")) {
            unit = "Sets";
          }

          return {
            id: item.id,
            code: item.code || `ITM-${item.id}`,
            name: item.name,
            unit: unit,
            unitPrice: latestCost > 0 ? latestCost : (parseFloat(item.unit_cost) || 0),
            category: item.subcategory?.category?.category || "General",
            subcategory: item.subcategory?.subcategory || "",
          };
        });

        this.catalogLoaded = true;
        if (hintEl) {
          hintEl.textContent = `${this.catalogItems.length} database material items loaded. Type SKU code or name to search & add.`;
        }
      }
    } catch (err) {
      console.warn("[CreatePOModal] Could not fetch database stock items:", err);
      if (this.ctx.getCatalogItems) {
        this.catalogItems = this.ctx.getCatalogItems();
      }
      if (hintEl) {
        hintEl.textContent = "Type SKU code or material name to load & add directly";
      }
    } finally {
      if (loadingEl) loadingEl.style.display = "none";
    }

    return this.catalogItems;
  }

  /**
   * Search and render matching stock items dropdown.
   * @param {string} query
   */
  searchAndRenderCatalogItems(query = "") {
    const dropdown = document.getElementById("newPoItemSearchDropdown");
    if (!dropdown) return;

    const term = (query || "").toLowerCase().trim();
    let matches = this.catalogItems || [];

    if (term) {
      matches = matches.filter(
        (it) =>
          (it.name && it.name.toLowerCase().includes(term)) ||
          (it.code && it.code.toLowerCase().includes(term)) ||
          (it.category && it.category.toLowerCase().includes(term)) ||
          (it.subcategory && it.subcategory.toLowerCase().includes(term))
      );
    }

    dropdown.innerHTML = "";
    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div style="padding: 14px; text-align: center; color: var(--text-muted); font-size: 12px;">
          <i class="fa-solid fa-triangle-exclamation" style="margin-right: 6px; color: #faad14;"></i>
          No matching material stock items found in database
        </div>`;
      dropdown.style.display = "block";
      return;
    }

    // Dropdown Header
    const header = document.createElement("div");
    header.style.cssText =
      "padding: 7px 12px; background: rgba(22, 119, 255, 0.06); font-size: 11px; font-weight: 700; color: #1677ff; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;";
    header.innerHTML = `
      <span><i class="fa-solid fa-database"></i> Database Items (${matches.length})</span>
      <span style="font-size: 10.5px; font-weight: 500; color: var(--text-muted);">Click an item to add to Purchase Order</span>
    `;
    dropdown.appendChild(header);

    matches.slice(0, 20).forEach((item) => {
      const row = document.createElement("div");
      row.style.cssText =
        "padding: 9px 12px; cursor: pointer; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; transition: all 0.15s ease;";

      const costBadge = item.unitPrice > 0
        ? `<span style="font-size: 11.5px; font-weight: 700; color: #52c41a;">Rs. ${Number(item.unitPrice).toFixed(2)}</span>`
        : `<span style="font-size: 11px; color: var(--text-muted);">Est. Rs. 0.00</span>`;

      row.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <span class="inv-item-code" style="font-size: 11px; font-weight: 700; color: #1677ff;">${item.code}</span>
          <span style="font-weight: 600; font-size: 12.5px; color: var(--text);">${item.name}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
          ${costBadge}
          <span class="inv-cat-pill" style="font-size: 10px; padding: 2px 7px;">${item.category}</span>
          <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" style="font-size: 11px; height: 24px; padding: 0 8px; pointer-events: none;">
            <i class="fa-solid fa-plus"></i> Add
          </button>
        </div>
      `;

      row.addEventListener("mouseenter", () => (row.style.background = "rgba(22, 119, 255, 0.08)"));
      row.addEventListener("mouseleave", () => (row.style.background = "transparent"));
      row.addEventListener("click", () => {
        this.addItemToPo(item);
        dropdown.style.display = "none";
      });

      dropdown.appendChild(row);
    });

    dropdown.style.display = "block";
  }

  /**
   * Add a selected stock item to the Purchase Order line items table.
   * @param {Object} item
   */
  addItemToPo(item) {
    if (!item) return;

    // Check if item already exists in newPoItems
    const existingIndex = this.newPoItems.findIndex(
      (row) => row.item_id === item.code || (row.id && row.id === item.id)
    );

    if (existingIndex !== -1) {
      this.newPoItems[existingIndex].qty += 1;
      this.newPoItems[existingIndex].total =
        this.newPoItems[existingIndex].qty * this.newPoItems[existingIndex].unit_cost;
      this.showToast(`Incremented quantity for "${item.name}" (Qty: ${this.newPoItems[existingIndex].qty})`, "info");
    } else {
      const unitCost = Number(item.unitPrice) || 0;
      this.newPoItems.push({
        id: item.id,
        stock_items_id: item.id,
        item_id: item.code,
        item_name: item.name,
        unit: item.unit || "Units",
        qty: 1,
        unit_cost: unitCost,
        total: unitCost * 1,
      });
      this.showToast(`Added "${item.name}" to Purchase Order`, "success");
    }

    this.renderNewPoItems();
    this.calculateNewPoTotal();

    const searchInput = document.getElementById("newPoItemSearchInput");
    if (searchInput) {
      searchInput.value = "";
    }
  }

  async openCreatePOModal(defaultSupplier = null) {
    const poNumInput = document.getElementById("newPoNumber");
    const orderDateInput = document.getElementById("newPoDate");
    const expDateInput = document.getElementById("newPoExpectedDate");
    const supplierInput = document.getElementById("newPoSupplier");
    const contactInput = document.getElementById("newPoContact");
    const remarksInput = document.getElementById("newPoRemarks");
    const searchInput = document.getElementById("newPoItemSearchInput");

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
    if (searchInput) searchInput.value = "";

    // Initialize with empty item list (no default items)
    this.newPoItems = [];

    this.renderNewPoItems();
    this.calculateNewPoTotal();
    this.openModal("createPOModal");

    // Load database items asynchronously
    await this.loadCatalogItemsFromDatabase();
  }

  addNewPoRow() {
    const searchInput = document.getElementById("newPoItemSearchInput");
    if (searchInput) {
      searchInput.focus();
      this.searchAndRenderCatalogItems("");
    }
  }

  removeNewPoRow(index) {
    this.newPoItems.splice(index, 1);
    this.renderNewPoItems();
    this.calculateNewPoTotal();
  }

  renderNewPoItems() {
    const tbody = document.getElementById("newPoItemsTbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (this.newPoItems.length === 0) {
      const emptyRow = document.createElement("tr");
      emptyRow.id = "newPoEmptyStateRow";
      emptyRow.innerHTML = `
        <td colspan="6" style="text-align: center; padding: 36px 20px; background: rgba(0, 0, 0, 0.015); border-radius: 8px;">
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(22, 119, 255, 0.08); display: flex; align-items: center; justify-content: center; color: #1677ff; font-size: 22px;">
              <i class="fa-solid fa-boxes-stacked"></i>
            </div>
            <div>
              <div style="font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 4px;">
                No Materials Added Yet
              </div>
              <div style="font-size: 12px; color: var(--text-muted); max-width: 380px; line-height: 1.5;">
                Use the <strong>Search &amp; Add Material Item</strong> selector above to search from database items and add them to this Purchase Order.
              </div>
            </div>
            <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" style="margin-top: 4px;" onclick="window.grnManager.addNewPoRow()">
              <i class="fa-solid fa-magnifying-glass"></i> Search &amp; Add Item
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(emptyRow);
      return;
    }

    this.newPoItems.forEach((row, index) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td style="min-width: 250px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="inv-item-code" style="font-size: 11px; font-weight: 700; color: #1677ff;">${row.item_id}</span>
            <span style="font-weight: 600; font-size: 12.5px; color: var(--text);">${row.item_name}</span>
          </div>
        </td>
        <td style="width: 100px;">
          <span class="inv-unit-badge" style="font-size: 12px; font-weight: 600; color: var(--text);">${row.unit}</span>
        </td>
        <td style="width: 120px;">
          <input type="number"
                 id="newPoItemQty_${index}"
                 name="new_po_items[${index}][qty]"
                 aria-label="Order quantity for ${row.item_name}"
                 class="grn-inline-input text-right"
                 min="1"
                 step="1"
                 value="${row.qty}"
                 oninput="window.grnManager.onNewPoQtyChange(${index}, this.value)">
        </td>
        <td style="width: 140px;">
          <input type="number"
                 id="newPoItemCost_${index}"
                 name="new_po_items[${index}][cost]"
                 aria-label="Unit cost for ${row.item_name}"
                 class="grn-inline-input text-right"
                 min="0"
                 step="0.01"
                 value="${row.unit_cost}"
                 oninput="window.grnManager.onNewPoCostChange(${index}, this.value)">
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

  async saveNewPurchaseOrder() {
    const poNum = document.getElementById("newPoNumber")?.value || (this.ctx.generateNextPONumber ? this.ctx.generateNextPONumber() : `PO-${Date.now().toString().slice(-4)}`);
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
      this.showToast("Please add at least 1 material item to the Purchase Order", "error");
      return;
    }

    for (const item of this.newPoItems) {
      if (!item.qty || item.qty <= 0) {
        this.showToast(`Please enter a valid order quantity for "${item.item_name}"`, "error");
        return;
      }
    }

    const saveBtn = document.getElementById("saveNewPoBtn");
    const originalBtnText = saveBtn ? saveBtn.innerHTML : "";

    try {
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Placing &amp; Saving Order...';
      }

      // 1. Resolve supplier against existing list
      const suppliers = this.ctx.getSuppliers ? this.ctx.getSuppliers() : [];
      const matchedSupplier = suppliers.find(
        (s) => s.name?.toLowerCase() === supplier.toLowerCase() || String(s.id) === supplier
      );

      // 2. Format items for API
      const itemsPayload = this.newPoItems.map((item) => ({
        stock_items_id: parseInt(item.stock_items_id || item.id, 10),
        unit_cost: parseFloat(item.unit_cost) || 0,
        qty_ordered: parseInt(item.qty, 10) || 1,
        qty_received: 0,
      }));

      // 3. Construct API payload
      const payload = {
        suppliers_id: matchedSupplier ? matchedSupplier.id : null,
        supplier_name: supplier,
        supplier_contact: contact,
        add_date: orderDate ? `${orderDate} ${new Date().toTimeString().split(" ")[0]}` : null,
        expected_date: expDate || null,
        remarks: remarks,
        items: itemsPayload,
      };

      // 4. Send POST request to backend API
      const response = await this.http.post("/api/v1/purchase-orders", payload);
      const createdPo = response?.data?.formatted || response?.data || response;
      const poCode = createdPo?.po_number || (createdPo?.id ? `PO-${String(createdPo.id).padStart(4, "0")}` : poNum);

      // 5. Re-fetch and sync purchase orders from database
      if (this.ctx.dataLoader?.fetchPurchaseOrders) {
        await this.ctx.dataLoader.fetchPurchaseOrders({}, true);
      } else {
        const purchaseOrders = this.ctx.getPurchaseOrders ? this.ctx.getPurchaseOrders() : [];
        purchaseOrders.unshift(createdPo);
        if (this.ctx.setPurchaseOrders) this.ctx.setPurchaseOrders(purchaseOrders);
      }

      // 6. Refresh suppliers if a new supplier was created
      if (!matchedSupplier && this.ctx.dataLoader?.fetchSuppliers) {
        await this.ctx.dataLoader.fetchSuppliers({}, true);
      }

      // 7. Update UI tables and KPIs
      if (this.ctx.renderOpenPoBadge) this.ctx.renderOpenPoBadge();
      if (this.ctx.renderPOTable) this.ctx.renderPOTable();
      if (this.ctx.populatePOSupplierFilter) this.ctx.populatePOSupplierFilter();

      // 8. Close modal and show success feedback
      this.closeModal("createPOModal");
      this.showToast(`Purchase Order ${poCode} placed &amp; saved successfully!`, "success");

      // 9. Switch to PO tab so the newly placed PO is immediately visible
      if (this.ctx.switchView) {
        this.ctx.switchView("po");
      }
    } catch (err) {
      console.error("[CreatePOModal] Error placing purchase order:", err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to place Purchase Order. Please check inputs and try again.";
      this.showToast(errorMsg, "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalBtnText;
      }
    }
  }
}

export default CreatePOModal;
