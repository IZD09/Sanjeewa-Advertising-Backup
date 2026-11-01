/**
 * Stock & Inventory Management Module (Ant Design / Gravity UI Style)
 * Sanjeewa Advertising Digital Printing Shop Management System
 *
 * Orchestrated modular architecture delegating to inventory/ sub-classes,
 * inventory/modals/ dialog handlers, and inventory/processes/ button actions.
 */

"use strict";

import {
  InventoryDataLoader,
  InventoryTableHandler,
  InventoryModalHandler,
  FilterProcess,
  ExportProcess,
  MetricsProcess
} from "./inventory/index.js";

export class InventoryManager {
  constructor() {
    this.dataLoader = new InventoryDataLoader();

    // 1. Modal Handler Orchestrator (delegates to inventory/modals/ classes)
    this.modalHandler = new InventoryModalHandler({
      getItems: () => this.dataLoader.items,
      setItems: (items) => { this.dataLoader.items = items; },
      getItemAvailableQty: (item) => this.dataLoader.getItemAvailableQty(item),
      formatCurrency: (amt) => this.dataLoader.formatCurrency(amt),
      renderTable: () => this.renderTable(),
      setSelectedCategory: (cat) => { this.filterProcess.selectedCategory = cat; },
      saveData: () => this.dataLoader.saveData(),
      render: () => this.render()
    });

    // 2. Table Handler
    this.tableHandler = new InventoryTableHandler({
      getItemAvailableQty: (item) => this.dataLoader.getItemAvailableQty(item),
      getItemStatus: (item) => this.dataLoader.getItemStatus(item),
      formatCurrency: (amt) => this.dataLoader.formatCurrency(amt),
      openViewModal: (code) => this.openViewModal(code),
      openAdjustModal: (code) => this.openAdjustModal(code)
    });

    // 3. Processes (from inventory/processes/)
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

    // Backward compatibility aliases
    this.adjustmentHandler = this.modalHandler.adjustStockModal;
    this.shipmentHandler = this.modalHandler.addStockModal;

    this.init();
  }

  // Getters for state compatibility
  get items() { return this.dataLoader.items; }
  set items(val) { this.dataLoader.items = val; }
  get searchTerm() { return this.filterProcess.searchTerm; }
  set searchTerm(val) { this.filterProcess.searchTerm = val; }
  get selectedCategory() { return this.filterProcess.selectedCategory; }
  set selectedCategory(val) { this.filterProcess.selectedCategory = val; }
  get currentAdjustmentType() { return this.modalHandler.adjustStockModal.currentAdjustmentType; }
  set currentAdjustmentType(val) { this.modalHandler.adjustStockModal.currentAdjustmentType = val; }
  get currentContextItem() { return this.modalHandler.currentContextItem; }

  init() {
    this.dataLoader.loadData();
    this.bindEvents();
    this.render();

    // URL parameter support (?view=categories)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("view") === "categories") {
      this.openCategoriesModal();
    }
  }

  saveData() { this.dataLoader.saveData(); }
  getItemAvailableQty(item) { return this.dataLoader.getItemAvailableQty(item); }
  getItemTotalValue(item) { return this.dataLoader.getItemTotalValue(item); }
  getItemStatus(item) { return this.dataLoader.getItemStatus(item); }
  formatCurrency(amount) { return this.dataLoader.formatCurrency(amount); }

  bindEvents() {
    this.filterProcess.bindEvents();
    this.exportProcess.bindEvents();

    // Suppliers button in header - links to GRN Suppliers Directory UI
    const invSuppliersBtn = document.getElementById("invSuppliersBtn");
    if (invSuppliersBtn) {
      invSuppliersBtn.addEventListener("click", () => {
        window.location.href = "/grn?view=suppliers";
      });
    }
  }

  render() {
    this.renderKPIs();
    this.renderTable();
  }

  renderKPIs() { this.metricsProcess.renderKPIs(); }
  renderTable() { this.tableHandler.render(this.dataLoader.items, this.searchTerm, this.selectedCategory); }

  // Modal Delegations (Backward compatibility for HTML onclick and window calls)
  openViewModal(itemCode) { this.modalHandler.openViewModal(itemCode); }
  openAdjustModal(itemCode) { this.modalHandler.openAdjustModal(itemCode); }
  setAdjustmentType(type) { this.modalHandler.setAdjustmentType(type); }
  updateAdjustmentImpact() { this.modalHandler.updateAdjustmentImpact(); }
  saveStockAdjustment() { this.modalHandler.saveStockAdjustment(); }

  openAddStockModal(prefillCode) { this.modalHandler.openAddStockModal(prefillCode); }
  handleItemSelectionChange() { this.modalHandler.handleItemSelectionChange(); }
  updateAddStockFinancials() { this.modalHandler.updateAddStockFinancials(); }
  saveNewStock() { this.modalHandler.saveNewStock(); }

  openCategoriesModal() { this.modalHandler.openCategoriesModal(); }
  renderCategoriesGrid() { this.modalHandler.renderCategoriesGrid(); }
  filterByCategoryFromModal(cat) { this.modalHandler.filterByCategoryFromModal(cat); }
  saveNewCategory() { this.modalHandler.saveNewCategory(); }

  exportCSV() { this.exportProcess.exportCSV(); }
  openModal(modalId) { this.modalHandler.openModal(modalId); }
  closeModal(modalId) { this.modalHandler.closeModal(modalId); }
  showToast(msg, type = "success") { this.modalHandler.showToast(msg, type); }
}

// Global initialization
if (typeof window !== "undefined") {
  window.InventoryManager = InventoryManager;
  document.addEventListener("DOMContentLoaded", () => {
    window.inventoryManager = new InventoryManager();
    window.inventoryApp = window.inventoryManager;
  });
}
