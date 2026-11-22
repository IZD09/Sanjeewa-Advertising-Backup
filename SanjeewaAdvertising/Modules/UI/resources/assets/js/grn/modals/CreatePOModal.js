/**
 * SanjeewaAdvertising - Create Purchase Order Modal
 *
 * Orchestrates the Create Purchase Order modal dialog (#createPOModal) by delegating to:
 * - CreatePoProcess (../processes/CreatePoProcess.js): State, catalog loading, item management, validation & submission
 * - CreatePoHandler (../handlers/CreatePoHandler.js): DOM rendering, supplier/category/item dropdowns & PO items table
 * - CreatePoItemRowBuilder (../builders/CreatePoItemRowBuilder.js): Table row and entity builder
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";
import { CreatePoProcess } from "../processes/CreatePoProcess.js";
import { CreatePoHandler } from "../handlers/CreatePoHandler.js";

export class CreatePOModal extends BaseModalHandler {
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
    this.process = new CreatePoProcess(this.ctx);
    this.http = this.process.http;

    // 2. UI Rendering & DOM Interaction Handler
    this.handler = new CreatePoHandler({
      process: this.process,
      ctx: this.ctx,
      callbacks: {
        onAddItemToPo: (item) => this.addItemToPo(item)
      }
    });

    this.bindEvents();
  }

  // State Getters & Setters (delegating to CreatePoProcess for full compatibility)
  get newPoItems() { return this.process.newPoItems; }
  set newPoItems(v) { this.process.newPoItems = v; }
  get selectedSupplier() { return this.process.selectedSupplier; }
  set selectedSupplier(v) { this.process.selectedSupplier = v; }
  get selectedCategory() { return this.process.selectedCategory; }
  set selectedCategory(v) { this.process.selectedCategory = v; }
  get selectedSubcategory() { return this.process.selectedSubcategory; }
  set selectedSubcategory(v) { this.process.selectedSubcategory = v; }
  get dbCategories() { return this.process.dbCategories; }
  set dbCategories(v) { this.process.dbCategories = v; }
  get catalogItems() { return this.process.catalogItems; }
  set catalogItems(v) { this.process.catalogItems = v; }
  get catalogLoaded() { return this.process.catalogLoaded; }
  set catalogLoaded(v) { this.process.catalogLoaded = v; }

  bindEvents() {
    const newPoAddRowBtn = document.getElementById("newPoAddRowBtn");
    if (newPoAddRowBtn && !newPoAddRowBtn._poAddRowBound) {
      newPoAddRowBtn._poAddRowBound = true;
      newPoAddRowBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.addNewPoRow();
      });
    }

    const saveNewPoBtn = document.getElementById("saveNewPoBtn");
    if (saveNewPoBtn) {
      saveNewPoBtn.addEventListener("click", () => this.saveNewPurchaseOrder());
    }

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

    const suppSearchInput = document.getElementById("newPoSuppSearchInput");
    if (suppSearchInput && !suppSearchInput._poSuppSearchBound) {
      suppSearchInput._poSuppSearchBound = true;
      suppSearchInput.addEventListener("input", (e) => this.renderSupplierDropdown(e.target.value));
      suppSearchInput.addEventListener("focus", (e) => this.renderSupplierDropdown(e.target.value));
    }

    const toggleSuppBtn = document.getElementById("newPoToggleSuppDropdownBtn");
    if (toggleSuppBtn && !toggleSuppBtn._poToggleBound) {
      toggleSuppBtn._poToggleBound = true;
      toggleSuppBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleSupplierDropdown();
      });
    }

    const clearSuppBtn = document.getElementById("newPoClearSupplierBtn");
    if (clearSuppBtn && !clearSuppBtn._poClearBound) {
      clearSuppBtn._poClearBound = true;
      clearSuppBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.clearSelectedSupplier();
      });
    }

    const newPoSupplier = document.getElementById("newPoSupplier");
    if (newPoSupplier && !newPoSupplier._poSupplierBound) {
      newPoSupplier._poSupplierBound = true;
      newPoSupplier.addEventListener("change", (e) => {
        const val = (e.target.value || "").trim();
        if (val) {
          this.selectSupplierByNameOrId(val);
        }
      });
    }

    const catFilter = document.getElementById("newPoItemCategoryFilter");
    if (catFilter && !catFilter._poCatBound) {
      catFilter._poCatBound = true;
      catFilter.addEventListener("change", (e) => {
        this.selectedCategory = e.target.value || "ALL";
        this.selectedSubcategory = "ALL";
        this.populateSubcategoryFilter();
        const searchVal = document.getElementById("newPoItemSearchInput")?.value || "";
        this.searchAndRenderCatalogItems(searchVal);
      });
    }

    const subcatFilter = document.getElementById("newPoItemSubcategoryFilter");
    if (subcatFilter && !subcatFilter._poSubcatBound) {
      subcatFilter._poSubcatBound = true;
      subcatFilter.addEventListener("change", (e) => {
        this.selectedSubcategory = e.target.value || "ALL";
        const searchVal = document.getElementById("newPoItemSearchInput")?.value || "";
        this.searchAndRenderCatalogItems(searchVal);
      });
    }

    const itemSearchInput = document.getElementById("newPoItemSearchInput");
    if (itemSearchInput && !itemSearchInput._poSearchBound) {
      itemSearchInput._poSearchBound = true;
      itemSearchInput.addEventListener("input", (e) => this.searchAndRenderCatalogItems(e.target.value));
      itemSearchInput.addEventListener("focus", (e) => this.searchAndRenderCatalogItems(e.target.value));
    }

    document.addEventListener("click", (e) => {
      const suppItem = e.target.closest(".newpo-supp-item");
      if (suppItem) {
        e.preventDefault();
        const suppId = suppItem.getAttribute("data-supplier-id");
        const suppName = suppItem.getAttribute("data-supplier-name");
        this.selectSupplierByNameOrId(suppId || suppName);
        return;
      }

      const suppGroup = document.getElementById("newPoSuppSearchGroup");
      const suppDropdown = document.getElementById("newPoSuppDropdown");
      if (suppDropdown && suppDropdown.style.display !== "none") {
        if (!suppGroup || !suppGroup.contains(e.target)) {
          this.hideSupplierDropdown();
        }
      }

      const dropdown = document.getElementById("newPoItemSearchDropdown");
      const searchInput = document.getElementById("newPoItemSearchInput");
      const addRowBtn = document.getElementById("newPoAddRowBtn");
      const catFilterEl = document.getElementById("newPoItemCategoryFilter");
      const subcatFilterEl = document.getElementById("newPoItemSubcategoryFilter");
      if (
        dropdown &&
        searchInput &&
        !searchInput.contains(e.target) &&
        !dropdown.contains(e.target) &&
        (!addRowBtn || !addRowBtn.contains(e.target)) &&
        (!catFilterEl || !catFilterEl.contains(e.target)) &&
        (!subcatFilterEl || !subcatFilterEl.contains(e.target))
      ) {
        dropdown.style.display = "none";
      }
    });
  }

  /**
   * Fetch master stock items from database via CreatePoProcess.
   * @param {boolean} [forceRefresh=false]
   */
  async loadCatalogItemsFromDatabase(forceRefresh = false) {
    const loadingEl = document.getElementById("newPoItemSearchLoading");
    const hintEl = document.getElementById("newPoItemSearchHint");

    return this.process.loadCatalogItemsFromDatabase(forceRefresh, {
      onStart: () => {
        if (loadingEl) loadingEl.style.display = "inline-block";
        if (hintEl) hintEl.textContent = "Loading database material stock items...";
      },
      onSuccess: (items) => {
        this.populateCategoryFilters();
        if (hintEl) {
          hintEl.textContent = `${items.length} database material items loaded. Filter by category or type SKU / name.`;
        }
      },
      onError: () => {
        if (hintEl) {
          hintEl.textContent = "Type SKU code or material name to load & add directly";
        }
      },
      onEnd: () => {
        if (loadingEl) loadingEl.style.display = "none";
      }
    });
  }

  // UI & Dropdown Delegations -> CreatePoHandler
  populateCategoryFilters() { this.handler.populateCategoryFilters(); }
  populateSubcategoryFilter() { this.handler.populateSubcategoryFilter(); }
  searchAndRenderCatalogItems(query = "") { this.handler.searchAndRenderCatalogItems(query); }
  toggleSupplierDropdown() { this.handler.toggleSupplierDropdown(); }
  hideSupplierDropdown() { this.handler.hideSupplierDropdown(); }
  renderSupplierDropdown(query = "") { this.handler.renderSupplierDropdown(query); }
  renderNewPoItems() { this.handler.renderNewPoItems(); }
  renderNewPoRowTotal(index) { this.handler.renderNewPoRowTotal(index); }
  escapeHtml(str) { return this.handler.escapeHtml(str); }

  addItemToPo(item) {
    if (!item) return;
    const result = this.process.addItemToPo(item);
    if (result.incremented) {
      this.showToast(`Incremented quantity for "${item.name}" (Qty: ${result.qty})`, "info");
    } else {
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
    const expDateInput = document.getElementById("newPoExpectedDate");
    const remarksInput = document.getElementById("newPoRemarks");
    const searchInput = document.getElementById("newPoItemSearchInput");

    const expDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    if (expDateInput) expDateInput.value = expDate;
    if (remarksInput) remarksInput.value = "";
    if (searchInput) searchInput.value = "";

    this.process.resetState();
    this.clearSelectedSupplier();
    if (this.catalogLoaded) {
      this.populateCategoryFilters();
    }

    this.renderNewPoItems();
    this.calculateNewPoTotal();

    await this.populateSupplierSelect(defaultSupplier);

    this.openModal("createPOModal");

    await this.loadCatalogItemsFromDatabase();
  }

  async populateSupplierSelect(defaultSupplier = null) {
    await this.process.ensureSuppliersLoaded();

    if (defaultSupplier) {
      this.selectSupplierByNameOrId(defaultSupplier);
    } else {
      this.clearSelectedSupplier();
    }
  }

  selectSupplierByNameOrId(nameOrId) {
    if (!nameOrId) return;
    const resolved = this.process.resolveSupplierByNameOrId(nameOrId);
    if (resolved) {
      this.selectSupplier(resolved);
    }
  }

  selectSupplier(supplier) {
    if (!supplier) return;
    this.selectedSupplier = supplier;
    this.hideSupplierDropdown();
    this.handler.renderSelectedSupplierCard(supplier);
  }

  clearSelectedSupplier() {
    this.selectedSupplier = null;
    this.handler.resetSelectedSupplierUI();
  }

  async addNewPoRow() {
    const searchInput = document.getElementById("newPoItemSearchInput");
    if (searchInput) {
      searchInput.focus();
    }

    if (!this.catalogLoaded || !this.catalogItems || this.catalogItems.length === 0) {
      this.handler.renderCatalogLoadingDropdown();
      await this.loadCatalogItemsFromDatabase();
    }

    const currentQuery = searchInput ? searchInput.value : "";
    this.searchAndRenderCatalogItems(currentQuery);
  }

  removeNewPoRow(index) {
    this.process.removeNewPoRow(index);
    this.renderNewPoItems();
    this.calculateNewPoTotal();
  }

  onNewPoItemSelectChange(index, itemCode) {
    if (this.process.updateRowItemByCode(index, itemCode)) {
      this.renderNewPoItems();
      this.calculateNewPoTotal();
    }
  }

  onNewPoQtyChange(index, qtyVal) {
    this.process.updateRowQty(index, qtyVal);
    this.calculateNewPoTotal();
    this.renderNewPoRowTotal(index);
  }

  onNewPoCostChange(index, costVal) {
    this.process.updateRowCost(index, costVal);
    this.calculateNewPoTotal();
    this.renderNewPoRowTotal(index);
  }

  calculateNewPoTotal() {
    const total = this.process.calculateTotal();
    this.handler.updateNewPoTotalDisplay(total);
    return total;
  }

  async saveNewPurchaseOrder() {
    const expDate = document.getElementById("newPoExpectedDate")?.value;
    const supplierId = document.getElementById("newPoSupplierId")?.value?.trim();
    const supplier = (this.selectedSupplier?.name || document.getElementById("newPoSupplier")?.value || "").trim();
    const notes = document.getElementById("newPoRemarks")?.value?.trim() || "";

    const validation = this.process.validate({ supplier, supplierId, expDate });
    if (!validation.isValid) {
      this.showToast(validation.error, "error");
      return;
    }

    const saveBtn = document.getElementById("saveNewPoBtn");
    const originalBtnText = saveBtn ? saveBtn.innerHTML : "";

    try {
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Placing &amp; Saving Order...';
      }

      const { poCode } = await this.process.submitPurchaseOrder({
        supplier,
        supplierId,
        expDate,
        notes
      });

      this.closeModal("createPOModal");
      this.showToast(`Purchase Order ${poCode} placed &amp; saved successfully!`, "success");

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
