/**
 * SanjeewaAdvertising - Create Goods Received Note (GRN) Modal
 *
 * Orchestrates the Create GRN modal dialog (#createGrnModal) by delegating to:
 * - CreateGrnProcess (../processes/CreateGrnProcess.js): State, API data loading, PO linking, validation & submission
 * - CreateGrnHandler (../handlers/CreateGrnHandler.js): DOM rendering, dropdowns, tables & interactive row wiring
 * - CreateGrnPoRowBuilder & CreateGrnItemRowBuilder (../builders/): Table row and entity builders
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";
import { CreateGrnProcess } from "../processes/CreateGrnProcess.js";
import { CreateGrnHandler } from "../handlers/CreateGrnHandler.js";

export class CreateGrnModal extends BaseModalHandler {
  /**
   * @param {Object} context
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

    // 1. Business Logic & State Process
    this.process = new CreateGrnProcess(this.ctx);
    this.http = this.process.http;

    // 2. UI Rendering & DOM Interaction Handler
    this.handler = new CreateGrnHandler({
      process: this.process,
      ctx: this.ctx,
      callbacks: {
        onAddPurchaseOrder: (po) => this.addPurchaseOrder(po),
        onRemovePurchaseOrder: (poNum) => this.removePurchaseOrder(poNum),
        onQtyChange: (idx, val) => this.onQtyChange(idx, val),
        onCostChange: (idx, val) => this.onCostChange(idx, val),
        onRemoveItem: (idx) => this.removeItem(idx),
        onReaddItem: (idx) => this.readdItem(idx)
      }
    });

    this.bindEvents();
  }

  // State Getters & Setters (delegating to CreateGrnProcess for full compatibility)
  get selectedPurchaseOrders() { return this.process.selectedPurchaseOrders; }
  set selectedPurchaseOrders(v) { this.process.selectedPurchaseOrders = v; }
  get grnItems() { return this.process.grnItems; }
  set grnItems(v) { this.process.grnItems = v; }
  get removedGrnItems() { return this.process.removedGrnItems; }
  set removedGrnItems(v) { this.process.removedGrnItems = v; }
  get allPurchaseOrders() { return this.process.allPurchaseOrders; }
  set allPurchaseOrders(v) { this.process.allPurchaseOrders = v; }
  get suppliers() { return this.process.suppliers; }
  set suppliers(v) { this.process.suppliers = v; }
  get brands() { return this.process.brands; }
  set brands(v) { this.process.brands = v; }
  get stockItemsCatalog() { return this.process.stockItemsCatalog; }
  set stockItemsCatalog(v) { this.process.stockItemsCatalog = v; }
  get selectedSupplier() { return this.process.selectedSupplier; }
  set selectedSupplier(v) { this.process.selectedSupplier = v; }
  get poListLoaded() { return this.process.poListLoaded; }
  set poListLoaded(v) { this.process.poListLoaded = v; }
  get activeSupplierFilter() { return this.process.activeSupplierFilter; }
  set activeSupplierFilter(v) { this.process.activeSupplierFilter = v; }

  bindEvents() {
    const headerCreateBtn = document.getElementById("grnHeaderCreateBtn");
    if (headerCreateBtn) {
      headerCreateBtn.addEventListener("click", () => this.openCreateGrnModal());
    }

    const discountInput = document.getElementById("grnModalDiscount");
    if (discountInput) {
      discountInput.addEventListener("input", () => this.calculateFinancials());
    }

    const saveBtn = document.getElementById("saveNewGrnModalBtn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.saveGrn());
    }

    const suppSearchInput = document.getElementById("grnCreateSuppSearchInput");
    if (suppSearchInput && !suppSearchInput._grnSuppSearchBound) {
      suppSearchInput._grnSuppSearchBound = true;
      suppSearchInput.addEventListener("input", (e) => this.renderSupplierDropdown(e.target.value));
      suppSearchInput.addEventListener("focus", (e) => this.renderSupplierDropdown(e.target.value));
    }

    const toggleSuppBtn = document.getElementById("grnCreateToggleSuppDropdownBtn");
    if (toggleSuppBtn && !toggleSuppBtn._grnSuppToggleBound) {
      toggleSuppBtn._grnSuppToggleBound = true;
      toggleSuppBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleSupplierDropdown();
      });
    }

    const clearSuppBtn = document.getElementById("grnCreateClearSupplierBtn");
    if (clearSuppBtn && !clearSuppBtn._grnSuppClearBound) {
      clearSuppBtn._grnSuppClearBound = true;
      clearSuppBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.clearSelectedSupplier();
      });
    }

    const approvedPoSelect = document.getElementById("grnModalApprovedPoSelect");
    if (approvedPoSelect && !approvedPoSelect._grnApprovedPoBound) {
      approvedPoSelect._grnApprovedPoBound = true;
      approvedPoSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        if (val) {
          this.addPurchaseOrderByNumber(val);
          approvedPoSelect.value = "";
        }
      });
    }

    const addAllBtn = document.getElementById("grnCreateAddAllApprovedPoBtn");
    if (addAllBtn && !addAllBtn._grnAddAllBound) {
      addAllBtn._grnAddAllBound = true;
      addAllBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.addAllApprovedPOs();
      });
    }

    const headerReaddAllBtn = document.getElementById("grnHeaderReaddAllBtn");
    if (headerReaddAllBtn && !headerReaddAllBtn._grnReaddAllBound) {
      headerReaddAllBtn._grnReaddAllBound = true;
      headerReaddAllBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.readdAllItems();
      });
    }

    const readdAllBtn = document.getElementById("grnReaddAllRemovedBtn");
    if (readdAllBtn && !readdAllBtn._grnReaddAllBound2) {
      readdAllBtn._grnReaddAllBound2 = true;
      readdAllBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.readdAllItems();
      });
    }

    const readdSelectBtn = document.getElementById("grnModalReaddSelectBtn");
    if (readdSelectBtn && !readdSelectBtn._grnReaddSelectBound) {
      readdSelectBtn._grnReaddSelectBound = true;
      readdSelectBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleReaddFromDropdown();
      });
    }

    document.addEventListener("click", (e) => {
      const suppItem = e.target.closest(".grn-create-supp-item");
      if (suppItem) {
        e.preventDefault();
        const suppId = suppItem.getAttribute("data-supplier-id");
        const suppName = suppItem.getAttribute("data-supplier-name");
        const matched = this.suppliers.find(
          s => (suppId && String(s.id) === String(suppId)) || (suppName && s.name === suppName)
        );
        if (matched) {
          this.selectSupplier(matched);
        }
        return;
      }

      const poChip = e.target.closest(".grn-create-po-chip");
      if (poChip) {
        e.preventDefault();
        const poNum = poChip.getAttribute("data-po-number");
        if (poNum) {
          this.addPurchaseOrderByNumber(poNum);
        }
        return;
      }

      const suppGroup = document.getElementById("grnCreateSuppSearchGroup");
      const suppDropdown = document.getElementById("grnCreateSuppDropdown");
      if (suppDropdown && suppDropdown.style.display !== "none") {
        if (!suppGroup || !suppGroup.contains(e.target)) {
          this.hideSupplierDropdown();
        }
      }
    });
  }

  /**
   * Open the Create GRN Modal and initialize fields.
   * @param {string|null} [targetPoNumber=null]
   * @param {string|null} [targetSupplier=null]
   */
  async openCreateGrnModal(targetPoNumber = null, targetSupplier = null) {
    this.process.resetState(targetSupplier);

    const remarksInput = document.getElementById("grnModalRemarks");
    const discountInput = document.getElementById("grnModalDiscount");
    const receivedByInput = document.getElementById("grnModalReceivedBy");

    if (remarksInput) remarksInput.value = "";
    if (discountInput) discountInput.value = "0.00";
    if (receivedByInput && receivedByInput.dataset?.loggedUser) {
      receivedByInput.value = receivedByInput.dataset.loggedUser;
    }

    this.resetSupplierUI();
    this.renderSelectedPOs();
    this.renderGrnItems();
    this.renderRemovedGrnItems();
    this.calculateFinancials();

    await Promise.all([
      this.loadSuppliers(),
      this.loadActivePurchaseOrders(true),
      this.loadInventoryCatalog()
    ]);

    this.syncSuppliersWithApprovedPOs();

    if (targetPoNumber) {
      const po = this.allPurchaseOrders.find(
        (p) => p.po_number === targetPoNumber || String(p.id) === String(targetPoNumber)
      );
      if (po) {
        if (String(po.status || "").trim().toLowerCase() !== "approved") {
          this.showToast(`Please approve Purchase Order ${po.po_number} before receiving a GRN.`, "warning");
          return;
        }
        const supp = this.findSupplierForPo(po);
        if (supp) {
          this.selectSupplier(supp, po.po_number);
        } else {
          this.addPurchaseOrder(po);
        }
      }
    } else if (this.activeSupplierFilter) {
      const cleanFilter = this.activeSupplierFilter.toLowerCase();
      const supp = this.suppliers.find(
        s => String(s.id) === String(this.activeSupplierFilter) ||
             (s.name && s.name.toLowerCase() === cleanFilter)
      );
      if (supp) {
        this.selectSupplier(supp);
      }
    }

    this.openModal("createGrnModal");
  }

  // Data & Catalog Delegations -> CreateGrnProcess
  async loadSuppliers() { return this.process.loadSuppliers(); }
  async loadInventoryCatalog() { return this.process.loadInventoryCatalog(); }
  getCatalogItem(stockItemId, itemCode = null) { return this.process.getCatalogItem(stockItemId, itemCode); }
  getBrandsForItem(stockItemId, itemCode = null) { return this.process.getBrandsForItem(stockItemId, itemCode); }
  getExistingBatchesForItem(stockItemId, itemCode = null) { return this.process.getExistingBatchesForItem(stockItemId, itemCode); }
  syncSuppliersWithApprovedPOs() { this.process.syncSuppliersWithApprovedPOs(); }
  findSupplierForPo(po) { return this.process.findSupplierForPo(po); }
  getApprovedPOsForSupplier(supplier) { return this.process.getApprovedPOsForSupplier(supplier); }

  async loadActivePurchaseOrders(forceRefresh = false) {
    const loadingEl = document.getElementById("grnModalPoSearchLoading");
    const hintEl = document.getElementById("grnModalPoSearchHint");

    return this.process.loadActivePurchaseOrders(forceRefresh, {
      onStart: () => {
        if (loadingEl) loadingEl.style.display = "inline-block";
        if (hintEl) hintEl.textContent = "Loading active purchase orders from database...";
      },
      onEnd: () => {
        if (loadingEl) loadingEl.style.display = "none";
      },
      onLoaded: (activeCount) => {
        if (hintEl && !this.activeSupplierFilter) {
          hintEl.textContent = `${activeCount} Approved Purchase Order(s) available across all suppliers. Search or click to link POs.`;
        }
      }
    });
  }

  // UI & Dropdown Delegations -> CreateGrnHandler
  resetSupplierUI() { this.handler.resetSupplierUI(); }
  toggleSupplierDropdown() { this.handler.toggleSupplierDropdown(); }
  hideSupplierDropdown() { this.handler.hideSupplierDropdown(); }
  renderSupplierDropdown(query = "") { this.handler.renderSupplierDropdown(query); }
  populateApprovedPoSelector() { this.handler.populateApprovedPoSelector(); }
  searchAndRenderActivePOs(query = "") { this.handler.searchAndRenderActivePOs(query); }
  renderSelectedPOs() { this.handler.renderSelectedPOs(); }
  renderGrnItems() { this.handler.renderGrnItems(); }
  updateRowTotalDisplay(index) { this.handler.updateRowTotalDisplay(index); }
  renderRemovedGrnItems() { this.handler.renderRemovedGrnItems(); }
  calculateFinancials() { return this.handler.calculateFinancials(); }
  escapeHtml(str) { return this.handler.escapeHtml(str); }

  selectSupplier(supplier, autoAddPoNumber = null) {
    if (!supplier) return;
    this.selectedSupplier = supplier;
    this.hideSupplierDropdown();
    this.handler.renderSelectedSupplierCard(supplier);

    if (autoAddPoNumber) {
      const targetPo = this.allPurchaseOrders.find(
        p => p.po_number === autoAddPoNumber || String(p.id) === String(autoAddPoNumber)
      );
      if (targetPo) {
        this.addPurchaseOrder(targetPo);
      }
    }

    this.populateApprovedPoSelector();
  }

  clearSelectedSupplier() {
    this.process.clearSelectedSupplierState();
    this.resetSupplierUI();
    this.renderSelectedPOs();
    this.renderGrnItems();
    this.renderRemovedGrnItems();
    this.calculateFinancials();
  }

  addPurchaseOrderByNumber(poNumber) {
    if (!poNumber) return;
    const po = this.allPurchaseOrders.find(
      p => p.po_number === poNumber || String(p.id) === String(poNumber)
    );
    if (po) {
      this.addPurchaseOrder(po);
      this.populateApprovedPoSelector();
    }
  }

  addAllApprovedPOs() {
    if (!this.selectedSupplier) return;
    const approvedPOs = this.getApprovedPOsForSupplier(this.selectedSupplier);
    const selectedNumbers = this.selectedPurchaseOrders.map(p => p.po_number);
    const available = approvedPOs.filter(po => !selectedNumbers.includes(po.po_number));
    available.forEach(po => this.addPurchaseOrder(po));
    this.populateApprovedPoSelector();
  }

  handleManualAddPoItem() {
    const searchInput = document.getElementById("grnModalPoSearchInput");
    const dropdown = document.getElementById("grnModalPoSearchDropdown");
    const query = (searchInput?.value || "").trim().toLowerCase();

    const selectedNumbers = this.selectedPurchaseOrders.map((p) => p.po_number);
    const availablePOs = this.allPurchaseOrders.filter(
      (po) => String(po.status || "").trim().toLowerCase() === "approved" && !selectedNumbers.includes(po.po_number)
    );

    if (query) {
      let match = availablePOs.find(
        (po) => po.po_number.toLowerCase() === query ||
                String(po.id) === query ||
                po.po_number.toLowerCase().replace(/\D+/g, "") === query.replace(/\D+/g, "")
      );

      if (!match && this.selectedPurchaseOrders.some(
        (po) => po.po_number.toLowerCase() === query ||
                po.po_number.toLowerCase().replace(/\D+/g, "") === query.replace(/\D+/g, "")
      )) {
        this.showToast("Purchase Order is already linked to this GRN.", "warning");
        if (dropdown) dropdown.style.display = "none";
        return;
      }

      if (!match) {
        const supplierMatches = availablePOs.filter(
          (po) => po.supplier_name && po.supplier_name.toLowerCase().includes(query)
        );
        if (supplierMatches.length === 1) {
          match = supplierMatches[0];
        } else if (supplierMatches.length > 1) {
          this.searchAndRenderActivePOs(query);
          return;
        }
      }

      if (match) {
        this.addPurchaseOrder(match);
        if (searchInput) searchInput.value = "";
        if (dropdown) dropdown.style.display = "none";
        return;
      }
    }

    if (this.activeSupplierFilter) {
      const supPOs = availablePOs.filter(
        (po) => (po.supplier_name && po.supplier_name.toLowerCase() === this.activeSupplierFilter.toLowerCase()) ||
                String(po.suppliers_id) === String(this.activeSupplierFilter)
      );
      if (supPOs.length === 1) {
        this.addPurchaseOrder(supPOs[0]);
        if (searchInput) searchInput.value = "";
        if (dropdown) dropdown.style.display = "none";
        return;
      }
    }

    if (availablePOs.length === 1 && !query) {
      this.addPurchaseOrder(availablePOs[0]);
      if (searchInput) searchInput.value = "";
      if (dropdown) dropdown.style.display = "none";
      return;
    }

    if (availablePOs.length > 0) {
      if (searchInput) searchInput.focus();
      this.searchAndRenderActivePOs(query || (this.activeSupplierFilter || ""));
    } else {
      this.showToast(
        this.activeSupplierFilter
          ? `No active un-GRNed Purchase Orders available for "${this.activeSupplierFilter}".`
          : "No active un-GRNed Purchase Orders available to link.",
        "warning"
      );
      if (dropdown) dropdown.style.display = "none";
    }
  }

  addPurchaseOrder(po) {
    if (!po) return;
    const result = this.process.linkPurchaseOrder(po);
    if (!result.added) {
      if (result.reason) this.showToast(result.reason, "warning");
      return;
    }

    this.renderSelectedPOs();
    this.renderGrnItems();
    this.renderRemovedGrnItems();
    this.calculateFinancials();

    this.showToast(`Linked ${po.po_number} (${result.itemsCount} items added to GRN).`, "success");
  }

  removePurchaseOrder(poNumber) {
    const removed = this.process.unlinkPurchaseOrder(poNumber);
    if (removed) {
      this.renderSelectedPOs();
      this.renderGrnItems();
      this.renderRemovedGrnItems();
      this.calculateFinancials();
      this.populateApprovedPoSelector();
      this.showToast(`Removed Purchase Order ${poNumber} and its items.`, "info");
    }
  }

  updatePoInvoice(index, value) {
    this.process.updatePoInvoice(index, value);
  }

  onQtyChange(index, value) {
    this.process.updateItemQty(index, value);
    this.updateRowTotalDisplay(index);
    this.calculateFinancials();
  }

  onCostChange(index, value) {
    this.process.updateItemCost(index, value);
    this.updateRowTotalDisplay(index);
    this.calculateFinancials();
  }

  removeItem(index) {
    const removed = this.process.removeItem(index);
    if (removed) {
      this.renderGrnItems();
      this.renderRemovedGrnItems();
      this.calculateFinancials();
      this.showToast(`Removed "${removed.item_name}" from receiving list.`, "info");
    }
  }

  readdItem(removedIndex) {
    const restored = this.process.readdItem(removedIndex);
    if (restored) {
      this.renderGrnItems();
      this.renderRemovedGrnItems();
      this.calculateFinancials();
      this.showToast(`Re-added "${restored.item_name}" to receiving list.`, "success");
    }
  }

  readdAllItems() {
    const count = this.process.readdAllItems();
    if (count > 0) {
      this.renderGrnItems();
      this.renderRemovedGrnItems();
      this.calculateFinancials();
      this.showToast(`Re-added all ${count} removed items to receiving list.`, "success");
    }
  }

  handleReaddFromDropdown() {
    const select = document.getElementById("grnModalReaddSelect");
    const val = select?.value;
    if (val === "" || val === null || val === undefined) {
      this.showToast("Please choose an item from the dropdown to re-add.", "warning");
      return;
    }
    const idx = parseInt(val, 10);
    this.readdItem(idx);
  }

  async saveGrn() {
    const remarks = document.getElementById("grnModalRemarks")?.value?.trim() || "";

    const validation = this.process.validate();
    if (!validation.isValid) {
      this.showToast(validation.error, "error");
      return;
    }

    const saveBtn = document.getElementById("saveNewGrnModalBtn");
    const originalBtnText = saveBtn ? saveBtn.innerHTML : "";

    try {
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving GRN...';
      }

      const financials = this.calculateFinancials();
      const { createdGrn, grnCode } = await this.process.submitGrn(remarks, financials);

      this.showToast(
        `Goods Received Note ${grnCode} created with Pending status! ${this.selectedPurchaseOrders.length} PO(s) linked.`,
        "success"
      );

      this.closeModal("createGrnModal");

      if (createdGrn?.id && this.ctx.viewGRN) {
        setTimeout(() => {
          this.ctx.viewGRN(grnCode);
        }, 350);
      }
    } catch (err) {
      console.error("[CreateGrnModal] Error saving GRN:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to create GRN. Please check your inputs.";
      this.showToast(errMsg, "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalBtnText;
      }
    }
  }
}

export default CreateGrnModal;
