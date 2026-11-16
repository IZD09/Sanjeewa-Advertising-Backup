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
    this.selectedSupplier = null;
    this.selectedCategory = "ALL";
    this.selectedSubcategory = "ALL";
    this.dbCategories = [];
    this.catalogItems = [];
    this.catalogLoaded = false;

    this.bindEvents();
  }

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

    // Supplier searchable selector bindings
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

    // Sync if external code (e.g. SupplierModal) sets #newPoSupplier value & dispatches change
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

    // Category & Subcategory filters for material items
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

    // Search input for adding items from database
    const itemSearchInput = document.getElementById("newPoItemSearchInput");
    if (itemSearchInput && !itemSearchInput._poSearchBound) {
      itemSearchInput._poSearchBound = true;
      itemSearchInput.addEventListener("input", (e) => this.searchAndRenderCatalogItems(e.target.value));
      itemSearchInput.addEventListener("focus", (e) => this.searchAndRenderCatalogItems(e.target.value));
    }

    // Handle supplier dropdown selection & outside clicks
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
        this.dbCategories = Array.isArray(response.data.categories) ? response.data.categories : [];
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
            category_id: item.subcategory?.category?.id || null,
            category: item.subcategory?.category?.category || "General",
            subcategory_id: item.subcategory?.id || item.subcategory_id || null,
            subcategory: item.subcategory?.subcategory || "",
          };
        });

        this.catalogLoaded = true;
        this.populateCategoryFilters();
        if (hintEl) {
          hintEl.textContent = `${this.catalogItems.length} database material items loaded. Filter by category or type SKU / name.`;
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

  populateCategoryFilters() {
    const catSelect = document.getElementById("newPoItemCategoryFilter");
    if (!catSelect) return;

    let optionsHtml = '<option value="ALL">All Categories</option>';
    if (Array.isArray(this.dbCategories) && this.dbCategories.length > 0) {
      optionsHtml += this.dbCategories
        .map(c => `<option value="${this.escapeHtml(String(c.id))}">${this.escapeHtml(c.category)}</option>`)
        .join("");
    } else {
      const categories = Array.from(
        new Set((this.catalogItems || []).map(it => it.category).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b));
      optionsHtml += categories
        .map(c => `<option value="${this.escapeHtml(c)}">${this.escapeHtml(c)}</option>`)
        .join("");
    }

    catSelect.innerHTML = optionsHtml;
    catSelect.value = this.selectedCategory || "ALL";

    this.populateSubcategoryFilter();
  }

  populateSubcategoryFilter() {
    const subcatSelect = document.getElementById("newPoItemSubcategoryFilter");
    if (!subcatSelect) return;

    if (!this.selectedCategory || this.selectedCategory === "ALL") {
      subcatSelect.innerHTML = '<option value="ALL">-- Select Category First --</option>';
      subcatSelect.value = "ALL";
      subcatSelect.disabled = true;
      subcatSelect.style.opacity = "0.6";
      subcatSelect.style.cursor = "not-allowed";
      this.selectedSubcategory = "ALL";
      return;
    }

    subcatSelect.disabled = false;
    subcatSelect.style.opacity = "1";
    subcatSelect.style.cursor = "pointer";

    let subOptions = [];
    if (Array.isArray(this.dbCategories) && this.dbCategories.length > 0) {
      const matchedCat = this.dbCategories.find(
        c => String(c.id) === String(this.selectedCategory) || c.category === this.selectedCategory
      );
      if (matchedCat && Array.isArray(matchedCat.subcategories)) {
        subOptions = matchedCat.subcategories.map(sc => ({
          value: String(sc.id),
          label: sc.subcategory
        }));
      }
    } else {
      const items = (this.catalogItems || []).filter(it => it.category === this.selectedCategory);
      subOptions = Array.from(new Set(items.map(it => it.subcategory).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b))
        .map(sc => ({ value: sc, label: sc }));
    }

    subcatSelect.innerHTML = '<option value="ALL">All Subcategories</option>' +
      subOptions.map(sc => `<option value="${this.escapeHtml(sc.value)}">${this.escapeHtml(sc.label)}</option>`).join("");

    const hasCurrent = subOptions.some(sc => sc.value === String(this.selectedSubcategory));
    subcatSelect.value = hasCurrent ? String(this.selectedSubcategory) : "ALL";
    this.selectedSubcategory = subcatSelect.value;
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

    if (this.selectedCategory && this.selectedCategory !== "ALL") {
      matches = matches.filter(it =>
        String(it.category_id) === String(this.selectedCategory) || it.category === this.selectedCategory
      );
    }

    if (this.selectedSubcategory && this.selectedSubcategory !== "ALL") {
      matches = matches.filter(it =>
        String(it.subcategory_id) === String(this.selectedSubcategory) || it.subcategory === this.selectedSubcategory
      );
    }

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
      "padding: 7px 12px; background: #f0f7ff; font-size: 11px; font-weight: 700; color: #1677ff; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 2;";
    header.innerHTML = `
      <span><i class="fa-solid fa-database"></i> Database Items (${matches.length})</span>
      <span style="font-size: 10.5px; font-weight: 500; color: var(--text-muted);">Click an item to add to Purchase Order</span>
    `;
    dropdown.appendChild(header);

    matches.slice(0, 50).forEach((item) => {
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
          <span class="inv-cat-pill" style="font-size: 10px; padding: 2px 7px;">${this.escapeHtml(item.category)}${item.subcategory ? ` / ${this.escapeHtml(item.subcategory)}` : ""}</span>
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
    const expDateInput = document.getElementById("newPoExpectedDate");
    const remarksInput = document.getElementById("newPoRemarks");
    const searchInput = document.getElementById("newPoItemSearchInput");

    const expDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    if (expDateInput) expDateInput.value = expDate;
    if (remarksInput) remarksInput.value = "";
    if (searchInput) searchInput.value = "";

    // Initialize with empty item list (no default items)
    this.newPoItems = [];
    this.selectedSupplier = null;
    this.selectedCategory = "ALL";
    this.selectedSubcategory = "ALL";
    this.clearSelectedSupplier();
    if (this.catalogLoaded) {
      this.populateCategoryFilters();
    }

    this.renderNewPoItems();
    this.calculateNewPoTotal();

    // Load suppliers and pre-select if defaultSupplier was passed
    await this.populateSupplierSelect(defaultSupplier);

    this.openModal("createPOModal");

    // Load database items asynchronously
    await this.loadCatalogItemsFromDatabase();
  }

  /**
   * Ensure suppliers are loaded and optionally pre-select defaultSupplier.
   * @param {string|null} [defaultSupplier=null]
   */
  async populateSupplierSelect(defaultSupplier = null) {
    let suppliers = this.ctx.getSuppliers ? this.ctx.getSuppliers() : [];
    if ((!suppliers || suppliers.length === 0) && this.ctx.dataLoader?.fetchSuppliers) {
      await this.ctx.dataLoader.fetchSuppliers({ per_page: 100 }, true);
    }

    if (defaultSupplier) {
      this.selectSupplierByNameOrId(defaultSupplier);
    } else {
      this.clearSelectedSupplier();
    }
  }

  toggleSupplierDropdown() {
    const dropdown = document.getElementById("newPoSuppDropdown");
    if (!dropdown) return;

    if (dropdown.style.display === "block") {
      this.hideSupplierDropdown();
    } else {
      const searchInput = document.getElementById("newPoSuppSearchInput");
      this.renderSupplierDropdown(searchInput ? searchInput.value : "");
    }
  }

  hideSupplierDropdown() {
    const dropdown = document.getElementById("newPoSuppDropdown");
    const icon = document.getElementById("newPoSuppDropdownIcon");
    if (dropdown) dropdown.style.display = "none";
    if (icon) {
      icon.classList.remove("fa-chevron-up");
      icon.classList.add("fa-chevron-down");
    }
  }

  renderSupplierDropdown(query = "") {
    const dropdown = document.getElementById("newPoSuppDropdown");
    const icon = document.getElementById("newPoSuppDropdownIcon");
    if (!dropdown) return;

    const suppliers = (this.ctx.getSuppliers ? this.ctx.getSuppliers() : [])
      .filter(s => (s.status || "Active").toLowerCase() !== "disabled");

    const q = String(query || "").trim().toLowerCase();
    const matches = q
      ? suppliers.filter(s =>
          String(s.name || "").toLowerCase().includes(q) ||
          String(s.mobile || s.phone || "").toLowerCase().includes(q) ||
          String(s.code || "").toLowerCase().includes(q)
        )
      : suppliers;

    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div style="padding: 12px 14px; text-align: center; color: var(--text-muted); font-size: 12px;">
          <i class="fa-solid fa-truck-field" style="margin-right: 6px; opacity: 0.6;"></i>
          No active suppliers found matching "<strong>${this.escapeHtml(query)}</strong>"
        </div>`;
    } else {
      dropdown.innerHTML = matches.slice(0, 35).map(s => {
        const phone = s.mobile || s.phone || "No Phone";
        const code = s.code || (s.id ? `SUP-${String(s.id).padStart(3, "0")}` : "SUP");
        return `
          <div class="newpo-supp-item" data-supplier-id="${s.id || ""}" data-supplier-name="${this.escapeHtml(s.name)}" style="padding: 9px 12px; border-bottom: 1px solid var(--border-subtle, rgba(0,0,0,0.06)); cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.15s ease;">
            <div style="min-width: 0;">
              <strong style="color: var(--text); font-size: 13px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.escapeHtml(s.name)}</strong>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 1px;">${this.escapeHtml(phone)} • ${this.escapeHtml(code)}</div>
            </div>
            <span style="font-size: 11px; font-weight: 700; color: #1677ff; flex-shrink: 0;">Select &rarr;</span>
          </div>`;
      }).join("");

      dropdown.querySelectorAll(".newpo-supp-item").forEach(item => {
        item.addEventListener("mouseenter", () => item.style.backgroundColor = "var(--surface-2, rgba(22,119,255,0.05))");
        item.addEventListener("mouseleave", () => item.style.backgroundColor = "");
      });
    }

    dropdown.style.display = "block";
    if (icon) {
      icon.classList.remove("fa-chevron-down");
      icon.classList.add("fa-chevron-up");
    }
  }

  selectSupplierByNameOrId(nameOrId) {
    if (!nameOrId) return;
    const suppliers = this.ctx.getSuppliers ? this.ctx.getSuppliers() : [];
    const clean = String(nameOrId).trim().toLowerCase();
    const found = suppliers.find(
      s => String(s.id) === String(nameOrId) || String(s.name || "").trim().toLowerCase() === clean
    );
    if (found) {
      this.selectSupplier(found);
    } else {
      this.selectSupplier({ id: null, name: String(nameOrId).trim(), mobile: "", code: "" });
    }
  }

  selectSupplier(supplier) {
    if (!supplier) return;
    this.selectedSupplier = supplier;
    this.hideSupplierDropdown();

    const searchGroup = document.getElementById("newPoSuppSearchGroup");
    const card = document.getElementById("newPoSelectedSupplierCard");
    const nameEl = document.getElementById("newPoSelectedSuppName");
    const metaEl = document.getElementById("newPoSelectedSuppMeta");
    const hiddenName = document.getElementById("newPoSupplier");
    const hiddenId = document.getElementById("newPoSupplierId");

    const phone = supplier.mobile || supplier.phone || "No Phone";
    const code = supplier.code || (supplier.id ? `SUP-${String(supplier.id).padStart(3, "0")}` : "SUP");

    if (searchGroup) searchGroup.style.display = "none";
    if (card) card.style.display = "flex";
    if (nameEl) nameEl.textContent = supplier.name;
    if (metaEl) metaEl.textContent = `${phone} • ${code}`;
    if (hiddenName) hiddenName.value = supplier.name;
    if (hiddenId) hiddenId.value = supplier.id || "";
  }

  clearSelectedSupplier() {
    this.selectedSupplier = null;
    const searchGroup = document.getElementById("newPoSuppSearchGroup");
    const searchInput = document.getElementById("newPoSuppSearchInput");
    const card = document.getElementById("newPoSelectedSupplierCard");
    const hiddenName = document.getElementById("newPoSupplier");
    const hiddenId = document.getElementById("newPoSupplierId");

    if (searchGroup) searchGroup.style.display = "block";
    if (searchInput) searchInput.value = "";
    if (card) card.style.display = "none";
    if (hiddenName) hiddenName.value = "";
    if (hiddenId) hiddenId.value = "";
    this.hideSupplierDropdown();
  }

  async addNewPoRow() {
    const searchInput = document.getElementById("newPoItemSearchInput");
    const dropdown = document.getElementById("newPoItemSearchDropdown");

    if (searchInput) {
      searchInput.focus();
    }

    if (!this.catalogLoaded || !this.catalogItems || this.catalogItems.length === 0) {
      if (dropdown) {
        dropdown.innerHTML = `
          <div style="padding: 14px; text-align: center; color: var(--text-muted); font-size: 12px;">
            <i class="fa-solid fa-spinner fa-spin" style="margin-right: 6px; color: #1677ff;"></i>
            Loading material stock items from database...
          </div>`;
        dropdown.style.display = "block";
      }
      await this.loadCatalogItemsFromDatabase();
    }

    const currentQuery = searchInput ? searchInput.value : "";
    this.searchAndRenderCatalogItems(currentQuery);
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
    const expDate = document.getElementById("newPoExpectedDate")?.value;
    const supplierId = document.getElementById("newPoSupplierId")?.value?.trim();
    const supplier = (this.selectedSupplier?.name || document.getElementById("newPoSupplier")?.value || "").trim();
    const notes = document.getElementById("newPoRemarks")?.value?.trim() || "";

    if (!supplier && !supplierId) {
      this.showToast("Please search and select a Supplier for the Purchase Order", "error");
      return;
    }

    if (!expDate) {
      this.showToast("Please select the Expected Delivery Date", "error");
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
      const matchedSupplier = this.selectedSupplier?.id
        ? this.selectedSupplier
        : suppliers.find(
            (s) => (supplierId && String(s.id) === String(supplierId)) || (s.name?.toLowerCase() === supplier.toLowerCase())
          );
      const supplierContact = matchedSupplier?.mobile || matchedSupplier?.phone || "";

      // 2. Format items for API
      const itemsPayload = this.newPoItems.map((item) => ({
        stock_items_id: parseInt(item.stock_items_id || item.id, 10),
        unit_cost: parseFloat(item.unit_cost) || 0,
        qty_ordered: parseInt(item.qty, 10) || 1,
        qty_received: 0,
      }));

      // 3. Construct API payload (PO Number & Order Date are auto-generated on backend)
      const payload = {
        suppliers_id: matchedSupplier ? matchedSupplier.id : null,
        supplier_name: supplier,
        supplier_contact: supplierContact,
        expected_date: expDate || null,
        notes: notes || null,
        remarks: notes || null,
        items: itemsPayload,
      };

      // 4. Send POST request to backend API
      const response = await this.http.post("/api/v1/purchase-orders", payload);
      const createdPo = response?.data?.formatted || response?.data || response;
      const poCode = createdPo?.po_number || (createdPo?.id ? `PO-${String(createdPo.id).padStart(4, "0")}` : "PO-NEW");

      // 5. Re-fetch and sync purchase orders from database
      if (this.ctx.dataLoader?.fetchPurchaseOrders) {
        await this.ctx.dataLoader.fetchPurchaseOrders({}, true);
      } else {
        const purchaseOrders = this.ctx.getPurchaseOrders ? this.ctx.getPurchaseOrders() : [];
        purchaseOrders.unshift(createdPo);
        if (this.ctx.setPurchaseOrders) this.ctx.setPurchaseOrders(purchaseOrders);
      }

      // 6. Refresh suppliers and re-render grid so un-GRNed PO count auto-adjusts
      if (this.ctx.loadAndRenderSuppliers) {
        await this.ctx.loadAndRenderSuppliers(true);
      } else if (this.ctx.dataLoader?.fetchSuppliers) {
        await this.ctx.dataLoader.fetchSuppliers({}, true);
        if (this.ctx.renderSuppliersGrid) this.ctx.renderSuppliersGrid();
      } else if (this.ctx.renderSuppliersGrid) {
        this.ctx.renderSuppliersGrid();
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

  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

export default CreatePOModal;
