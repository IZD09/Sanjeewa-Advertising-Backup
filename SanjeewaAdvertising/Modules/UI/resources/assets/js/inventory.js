/**
 * Stock & Inventory Management Module (Ant Design / Gravity UI Style)
 * Sanjeewa Advertising Digital Printing Shop Management System
 *
 * Orchestrated modular architecture:
 * - Tab 1: Material Stock Inventory (StockTable, Batches, Live Quantities)
 * - Tab 2: Stock Movements & Logs (Audit Log, GRN, Job issues, Adjustments)
 * - Tab 3: Categories & Subcategories (Classification hierarchy, Quick Add)
 */

"use strict";

import {
  InventoryDataLoader,
  InventoryTableHandler,
  InventoryModalHandler,
  StockMovementsHandler,
  CategoriesTabHandler,
  StockItemsTabHandler,
  FilterProcess,
  ExportProcess,
  MetricsProcess,
  StockItemProcess,
  BrandProcess,
  AddStockProcess
} from "./inventory/index.js";

export class InventoryManager {
  constructor() {
    this.dataLoader = new InventoryDataLoader();

    // 1. Modal Handler Orchestrator (delegates to inventory/modals/ classes)
    this.modalHandler = new InventoryModalHandler({
      getItems: () => this.tableHandler.detailedStocks,
      setItems: (items) => { this.tableHandler.detailedStocks = items; },
      getItemAvailableQty: (item) => this.tableHandler.getItemAvailableQty(item),
      formatCurrency: (amt) => this.tableHandler.formatCurrency(amt),
      renderTable: () => this.renderTable(),
      setSelectedCategory: (cat) => { this.tableHandler.categoryFilter = cat; },
      saveData: () => this.dataLoader.saveData(),
      render: () => this.render()
    });

    // 2. Table Handler (Stock Items & Batches Table)
    this.tableHandler = new InventoryTableHandler({
      openViewModal: (code) => this.openViewModal(code),
      openAdjustModal: (code) => this.openAdjustModal(code),
      showToast: (msg, type) => this.showToast(msg, type)
    });

    // 3. Stock Movements & Audit Handler (Tab 2)
    this.movementsHandler = new StockMovementsHandler();

    // 4. Categories & Subcategories Handler (Tab 3)
    this.categoriesHandler = new CategoriesTabHandler({
      onFilterStock: (catName) => this.filterStockByCategory(catName),
      showToast: (msg, type) => this.showToast(msg, type)
    });

    // 5. Stock Items & Brands Handler (Tab 4)
    this.stockItemsHandler = new StockItemsTabHandler({
      onFilterStock: (catName) => this.filterStockByCategory(catName),
      showToast: (msg, type) => this.showToast(msg, type)
    });

    // 6. Processes (from inventory/processes/)
    this.filterProcess = new FilterProcess({
      renderTable: () => this.renderTable()
    });

    this.exportProcess = new ExportProcess({
      getItems: () => this.dataLoader.items,
      getItemAvailableQty: (item) => this.dataLoader.getItemAvailableQty(item),
      getItemTotalValue: (item) => this.dataLoader.getItemTotalValue(item),
      getItemStatus: (item) => this.dataLoader.getItemStatus(item),
      showToast: (msg, type) => this.modalHandler.showToast(msg, type)
    });

    this.metricsProcess = new MetricsProcess({
      getItems: () => this.dataLoader.items,
      getItemAvailableQty: (item) => this.dataLoader.getItemAvailableQty(item),
      getItemStatus: (item) => this.dataLoader.getItemStatus(item),
      formatCurrency: (amt) => this.dataLoader.formatCurrency(amt)
    });

    // 7. Add / Receive Stock Shipment Process (Database-aligned)
    this.addStockProcess = new AddStockProcess({
      showToast: (msg, type) => this.showToast(msg, type),
      onSuccess: async () => {
        await this.tableHandler.fetchData();
        this.movementsHandler.fetchStats();
        this.movementsHandler.fetchMovements(1);
        this.stockItemsHandler.fetchData();
      }
    });

    // Backward compatibility aliases
    this.adjustmentHandler = this.modalHandler.adjustStockModal;
    this.shipmentHandler = this.modalHandler.addStockModal;

    this.init();
  }

  // Getters for state compatibility
  get items() { return this.tableHandler.detailedStocks; }
  set items(val) { this.tableHandler.detailedStocks = val; }
  get searchTerm() { return this.tableHandler.searchTerm; }
  set searchTerm(val) { this.tableHandler.searchTerm = val; }
  get selectedCategory() { return this.tableHandler.categoryFilter; }
  set selectedCategory(val) { this.tableHandler.categoryFilter = val; }
  get currentAdjustmentType() { return this.modalHandler.adjustStockModal.currentAdjustmentType; }
  set currentAdjustmentType(val) { this.modalHandler.adjustStockModal.currentAdjustmentType = val; }
  get currentContextItem() { return this.modalHandler.currentContextItem; }

  async init() {
    this.bindEvents();

    // Fetch live backend data for Stock Inventory & Detailed Batches (Mirroring other tab handlers)
    await this.tableHandler.fetchData();

    // Immediately load Categories, Subcategories, Movement Stats, and Stock Items from the database
    this.categoriesHandler.fetchData();
    this.movementsHandler.fetchStats();
    this.movementsHandler.fetchMovements(1);
    this.stockItemsHandler.fetchData();

    // URL parameter support (?tab=items, ?tab=categories, ?tab=movements, ?view=categories)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("tab") === "items" || urlParams.get("tab") === "stock-items" || urlParams.get("view") === "items" || window.location.hash === "#items") {
      this.switchTab("items");
    } else if (urlParams.get("tab") === "categories" || urlParams.get("view") === "categories" || window.location.hash === "#categories") {
      this.switchTab("categories");
    } else if (urlParams.get("tab") === "movements" || window.location.hash === "#movements") {
      this.switchTab("movements");
    } else {
      this.switchTab("stock");
    }
  }

  saveData() { this.dataLoader.saveData(); }
  getItemAvailableQty(item) { return this.tableHandler.getItemAvailableQty(item); }
  getItemTotalValue(item) {
    const qty = this.getItemAvailableQty(item);
    return qty * (item.unitPrice || item.price || 0);
  }
  getItemStatus(item) { return this.tableHandler.getItemStatus(item); }
  formatCurrency(amount) { return this.tableHandler.formatCurrency(amount); }

  bindEvents() {
    this.tableHandler.bindEvents();
    this.movementsHandler.bindEvents();
    this.categoriesHandler.bindEvents();
    this.stockItemsHandler.bindEvents();
    this.addStockProcess.bindEvents();

    // Top action bar Add Stock button
    const invAddStockBtn = document.getElementById("invAddStockBtn");
    if (invAddStockBtn) {
      invAddStockBtn.addEventListener("click", () => this.addStockProcess.openModal());
    }

    // Tab switcher events
    const invTabStockBtn = document.getElementById("invTabStockBtn");
    const invTabMovementsBtn = document.getElementById("invTabMovementsBtn");
    const invTabCategoriesBtn = document.getElementById("invTabCategoriesBtn");
    const invTabStockItemsBtn = document.getElementById("invTabStockItemsBtn");

    if (invTabStockBtn) {
      invTabStockBtn.addEventListener("click", () => this.switchTab("stock"));
    }
    if (invTabMovementsBtn) {
      invTabMovementsBtn.addEventListener("click", () => this.switchTab("movements"));
    }
    if (invTabCategoriesBtn) {
      invTabCategoriesBtn.addEventListener("click", () => this.switchTab("categories"));
    }
    if (invTabStockItemsBtn) {
      invTabStockItemsBtn.addEventListener("click", () => this.switchTab("items"));
    }

    // Categories button in header switches directly to Categories Tab!
    const invCategoriesBtn = document.getElementById("invCategoriesBtn");
    if (invCategoriesBtn) {
      invCategoriesBtn.addEventListener("click", () => this.switchTab("categories"));
    }

    // Suppliers button in header - links to GRN Suppliers Directory UI
    const invSuppliersBtn = document.getElementById("invSuppliersBtn");
    if (invSuppliersBtn) {
      invSuppliersBtn.addEventListener("click", () => {
        window.location.href = "/grn?view=suppliers";
      });
    }
  }

  /**
   * Switch between Tab 1 (stock), Tab 2 (movements), Tab 3 (categories), and Tab 4 (items).
   * @param {"stock" | "movements" | "categories" | "items"} tabName
   */
  switchTab(tabName) {
    const tabStockBtn = document.getElementById("invTabStockBtn");
    const tabMovementsBtn = document.getElementById("invTabMovementsBtn");
    const tabCategoriesBtn = document.getElementById("invTabCategoriesBtn");
    const tabStockItemsBtn = document.getElementById("invTabStockItemsBtn");

    const paneStock = document.getElementById("invTabPaneStock");
    const paneMovements = document.getElementById("invTabPaneMovements");
    const paneCategories = document.getElementById("invTabPaneCategories");
    const paneStockItems = document.getElementById("invTabPaneStockItems");

    // Clear active classes from buttons
    if (tabStockBtn) tabStockBtn.classList.remove("active");
    if (tabMovementsBtn) tabMovementsBtn.classList.remove("active");
    if (tabCategoriesBtn) tabCategoriesBtn.classList.remove("active");
    if (tabStockItemsBtn) tabStockItemsBtn.classList.remove("active");

    // Hide all tab panes
    if (paneStock) paneStock.style.display = "none";
    if (paneMovements) paneMovements.style.display = "none";
    if (paneCategories) paneCategories.style.display = "none";
    if (paneStockItems) paneStockItems.style.display = "none";

    if (tabName === "items") {
      if (tabStockItemsBtn) tabStockItemsBtn.classList.add("active");
      if (paneStockItems) paneStockItems.style.display = "flex";
      this.stockItemsHandler.fetchData();
    } else if (tabName === "categories") {
      if (tabCategoriesBtn) tabCategoriesBtn.classList.add("active");
      if (paneCategories) paneCategories.style.display = "flex";
      this.categoriesHandler.fetchData();
    } else if (tabName === "movements") {
      if (tabMovementsBtn) tabMovementsBtn.classList.add("active");
      if (paneMovements) paneMovements.style.display = "flex";
      if (!this.movementsHandler.hasLoaded) {
        this.movementsHandler.fetchMovements(1);
      }
      this.movementsHandler.fetchStats();
    } else {
      if (tabStockBtn) tabStockBtn.classList.add("active");
      if (paneStock) paneStock.style.display = "flex";
      if (!this.tableHandler.hasLoaded) {
        this.tableHandler.fetchData();
      }
    }
  }

  /**
   * Filter stock table by category and switch to Material Stock tab.
   * @param {string} catName
   */
  filterStockByCategory(catName) {
    this.switchTab("stock");
    this.tableHandler.categoryFilter = catName;
    const catSelect = document.getElementById("invCategoryFilter");
    if (catSelect) {
      catSelect.value = catName;
    }
    this.tableHandler.renderCurrentTable(1);
  }

  render() {
    this.tableHandler.renderCurrentTable();
  }

  renderKPIs() {
    this.tableHandler.renderKPIs(this.tableHandler.stats);
  }

  renderTable() {
    this.tableHandler.renderCurrentTable();
  }

  viewItemBatches(itemCode) {
    this.switchTab("stock");
    this.tableHandler.switchView("batches");
    if (itemCode) {
      this.tableHandler.searchTerm = itemCode;
      const searchInput = document.getElementById("invSearchInput");
      if (searchInput) {
        searchInput.value = itemCode;
      }
      this.tableHandler.renderCurrentTable(1);
    }
  }

  // Modal Delegations (Backward compatibility for HTML onclick and window calls)
  openViewModal(itemCode) { this.modalHandler.openViewModal(itemCode); }
  openAdjustModal(itemCode) { this.modalHandler.openAdjustModal(itemCode); }
  setAdjustmentType(type) { this.modalHandler.setAdjustmentType(type); }
  updateAdjustmentImpact() { this.modalHandler.updateAdjustmentImpact(); }
  saveStockAdjustment() { this.modalHandler.saveStockAdjustment(); }

  openAddStockModal(prefill = {}) {
    if (typeof prefill === "string") {
      this.addStockProcess.openModal({ item_code: prefill });
    } else {
      this.addStockProcess.openModal(prefill);
    }
  }
  handleItemSelectionChange() { this.modalHandler.handleItemSelectionChange(); }
  updateAddStockFinancials() { this.modalHandler.updateAddStockFinancials(); }
  saveNewStock() { this.modalHandler.saveNewStock(); }

  openCategoriesModal() { this.switchTab("categories"); }
  renderCategoriesGrid() { this.categoriesHandler.fetchData(); }
  filterByCategoryFromModal(cat) { this.filterStockByCategory(cat); }
  saveNewCategory() { this.categoriesHandler.handleSaveCategory(); }

  exportCSV() { this.exportProcess.exportCSV(); }
  openModal(modalId) { this.modalHandler.openModal(modalId); }
  closeModal(modalId) { this.modalHandler.closeModal(modalId); }
  showToast(msg, type = "success") { this.modalHandler.showToast(msg, type); }
}

// Global initialization with safe readyState check
if (typeof window !== "undefined") {
  window.InventoryManager = InventoryManager;

  const bootInventory = () => {
    if (document.getElementById("module-inventory") && !window.inventoryManager) {
      window.inventoryManager = new InventoryManager();
      window.inventoryApp = window.inventoryManager;
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootInventory);
  } else {
    bootInventory();
  }
}
