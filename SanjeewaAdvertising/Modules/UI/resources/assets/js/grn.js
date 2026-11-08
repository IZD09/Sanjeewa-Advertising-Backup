/**
 * Goods Received Note (GRN), Purchase Order (PO) & Supplier Management Module
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Ant Design / Gravity UI Clean Style
 *
 * Orchestrated modular architecture delegating to grn/ sub-classes,
 * grn/modals/ dialog handlers, and grn/processes/ button actions.
 */

"use strict";

import {
  GRNDataLoader,
  SupplierHandler,
  GRNTableHandler,
  POTableHandler,
  GRNFormProcess,
  GRNModalHandler,
  NavigationProcess,
  FilterProcess,
  FormButtonProcess,
  ExportProcess,
  MetricsProcess
} from "./grn/index.js";

export class GRNManager {
  constructor() {
    this.dataLoader = new GRNDataLoader();

    // 1. Modal Handler Orchestrator (delegates to grn/modals/ classes)
    this.modalHandler = new GRNModalHandler({
      getGrnRecords: () => this.dataLoader.grnRecords,
      getPurchaseOrders: () => this.dataLoader.purchaseOrders,
      setPurchaseOrders: (pos) => { this.dataLoader.purchaseOrders = pos; },
      getSuppliers: () => this.dataLoader.suppliers,
      setSuppliers: (sups) => { this.dataLoader.suppliers = sups; },
      saveSupplierData: () => this.dataLoader.saveSupplierData(),
      savePOData: () => this.dataLoader.savePOData(),
      generateNextPONumber: () => this.dataLoader.generateNextPONumber(),
      generateNextSupplierCode: () => this.dataLoader.generateNextSupplierCode(),
      formatCurrency: (amt) => this.dataLoader.formatCurrency(amt),
      getCatalogItems: () => this.grnFormProcess.getCatalogItems(),
      renderOpenPoBadge: () => this.renderOpenPoBadge(),
      renderPOTable: () => this.renderPOTable(),
      populatePOSupplierFilter: () => this.supplierHandler.populatePOSupplierFilter(),
      populateAllSupplierDropdowns: () => this.supplierHandler.populateAllSupplierDropdowns(),
      renderSuppliersGrid: () => this.renderSuppliersGrid(),
      createGrnForPO: (num) => this.createGrnForPO(num),
      populatePOSelect: (target) => this.grnFormProcess.populatePOSelect(target),
      onPurchaseOrderSelect: (num) => this.grnFormProcess.onPurchaseOrderSelect(num),
      switchView: (view) => this.switchView(view),
      getCurrentView: () => this.currentView
    });

    this.poProcessHandler = this.modalHandler;

    // 2. Supplier Directory Handler
    this.supplierHandler = new SupplierHandler({
      getSuppliers: () => this.dataLoader.suppliers,
      setSuppliers: (sups) => { this.dataLoader.suppliers = sups; },
      getGrnRecords: () => this.dataLoader.grnRecords,
      getPurchaseOrders: () => this.dataLoader.purchaseOrders,
      saveSupplierData: () => this.dataLoader.saveSupplierData(),
      generateNextSupplierCode: () => this.dataLoader.generateNextSupplierCode(),
      openRegisterSupplierModal: (caller, code) => this.modalHandler.openRegisterSupplierModal(caller, code),
      openEditSupplierModal: (code) => this.modalHandler.openEditSupplierModal(code),
      saveNewSupplier: () => this.modalHandler.saveNewSupplier(),
      showToast: (msg, type) => this.modalHandler.showToast(msg, type),
      switchView: (view) => this.switchView(view),
      clearSelectedPO: () => this.clearSelectedPO(),
      onPageChange: (page) => this.onSupplierPageChange(page)
    });

    // 3. Table Render Handlers (max 20 rows per page, AJAX pagination without page reload)
    this.grnTableHandler = new GRNTableHandler({
      pageSize: 20,
      formatCurrency: (amt) => this.dataLoader.formatCurrency(amt),
      viewGRN: (num) => this.viewGRN(num),
      finalizeDraftGRN: (num) => this.finalizeDraftGRN(num),
      onPageChange: (page) => this.onGrnPageChange(page)
    });

    this.poTableHandler = new POTableHandler({
      pageSize: 20,
      formatCurrency: (amt) => this.dataLoader.formatCurrency(amt),
      viewPO: (num) => this.viewPO(num),
      createGrnForPO: (num) => this.createGrnForPO(num),
      onPageChange: (page) => this.onPoPageChange(page)
    });

    // 4. Form Business Logic Process
    this.grnFormProcess = new GRNFormProcess({
      getGrnRecords: () => this.dataLoader.grnRecords,
      setGrnRecords: (recs) => { this.dataLoader.grnRecords = recs; },
      getPurchaseOrders: () => this.dataLoader.purchaseOrders,
      saveData: () => this.dataLoader.saveData(),
      savePOData: () => this.dataLoader.savePOData(),
      generateNextGrnNumber: () => this.dataLoader.generateNextGrnNumber(),
      formatCurrency: (amt) => this.dataLoader.formatCurrency(amt),
      showToast: (msg, type) => this.modalHandler.showToast(msg, type),
      switchView: (view, poNum) => this.switchView(view, poNum),
      viewGRN: (num) => this.viewGRN(num),
      renderPOTable: () => this.renderPOTable(),
      renderOpenPoBadge: () => this.renderOpenPoBadge(),
      render: () => this.render()
    });

    // 5. Button Processes (from grn/processes/)
    this.navigationProcess = new NavigationProcess({
      initNewGrnForm: (targetPo) => this.grnFormProcess.initNewGrnForm(targetPo),
      loadAndRenderPO: () => this.loadAndRenderPO(),
      renderPOTable: () => this.renderPOTable(),
      populatePOSupplierFilter: () => this.supplierHandler.populatePOSupplierFilter(),
      loadAndRenderGRN: () => this.loadAndRenderGRN(),
      loadAndRenderSuppliers: () => this.loadAndRenderSuppliers(),
      renderSuppliersGrid: () => this.renderSuppliersGrid(),
      render: () => this.render()
    });

    this.filterProcess = new FilterProcess({
      renderTable: () => {
        this.grnTableHandler.currentPage = 1;
        this.renderTable();
      },
      renderPOTable: () => {
        this.poTableHandler.currentPage = 1;
        this.renderPOTable();
      },
      renderSuppliersGrid: () => {
        this.supplierHandler.currentPage = 1;
        this.renderSuppliersGrid();
      }
    });

    this.formButtonProcess = new FormButtonProcess({
      onPurchaseOrderSelect: (po) => this.onPurchaseOrderSelect(po),
      clearSelectedPO: () => this.clearSelectedPO(),
      addNewRow: () => this.addNewRow(),
      calculateFinancials: () => this.calculateFinancials(),
      switchView: (view) => this.switchView(view),
      saveGRN: (isCompleted) => this.saveGRN(isCompleted),
      getSuppliers: () => this.dataLoader.suppliers
    });

    this.exportProcess = new ExportProcess({
      getGrnRecords: () => this.dataLoader.grnRecords,
      showToast: (msg, type) => this.modalHandler.showToast(msg, type)
    });

    this.metricsProcess = new MetricsProcess({
      getGrnRecords: () => this.dataLoader.grnRecords,
      getPurchaseOrders: () => this.dataLoader.purchaseOrders,
      getGrnKpis: () => this.dataLoader.grnKpis,
      getPoKpis: () => this.dataLoader.poKpis,
      formatCurrency: (amt) => this.dataLoader.formatCurrency(amt)
    });

    this.init();
  }

  // Getters for state compatibility
  get currentView() { return this.navigationProcess.currentView; }
  set currentView(v) { this.navigationProcess.currentView = v; }
  get searchTerm() { return this.filterProcess.searchTerm; }
  get statusFilter() { return this.filterProcess.statusFilter; }
  get supplierFilter() { return this.filterProcess.supplierFilter; }
  get poSearchTerm() { return this.filterProcess.poSearchTerm; }
  get poSupplierFilter() { return this.filterProcess.poSupplierFilter; }
  get poStatusFilter() { return this.filterProcess.poStatusFilter; }
  get supplierSearchTerm() { return this.filterProcess.supplierSearchTerm; }
  get supplierCategoryFilter() { return this.filterProcess.supplierCategoryFilter; }

  get grnRecords() { return this.dataLoader.grnRecords; }
  set grnRecords(val) { this.dataLoader.grnRecords = val; }
  get purchaseOrders() { return this.dataLoader.purchaseOrders; }
  set purchaseOrders(val) { this.dataLoader.purchaseOrders = val; }
  get suppliers() { return this.dataLoader.suppliers; }
  set suppliers(val) { this.dataLoader.suppliers = val; }
  get formItems() { return this.grnFormProcess.formItems; }
  set formItems(val) { this.grnFormProcess.formItems = val; }
  get newPoItems() { return this.modalHandler.newPoItems; }
  set newPoItems(val) { this.modalHandler.newPoItems = val; }
  get activePoContext() { return this.modalHandler.activePoContext; }
  get activeGrnContext() { return this.modalHandler.activeGrnContext; }

  async init() {
    this.navigationProcess.bindEvents();
    this.filterProcess.bindEvents();
    this.formButtonProcess.bindEvents();
    this.exportProcess.bindEvents();

    await this.dataLoader.fetchSuppliers({ page: 1, per_page: 20 });
    this.supplierHandler.populateAllSupplierDropdowns();

    // Check initial active view from URL
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get("view");

    if (viewParam === "po") {
      await this.loadAndRenderPO();
    } else if (viewParam === "suppliers") {
      await this.loadAndRenderSuppliers();
    } else if (viewParam === "form") {
      await this.dataLoader.fetchPurchaseOrders({ page: 1, per_page: 20 });
      this.grnFormProcess.initNewGrnForm();
    } else {
      await this.loadAndRenderGRN();
    }
  }

  /**
   * Handle GRN table page change without reloading the browser page.
   *
   * @param {number} page
   */
  async onGrnPageChange(page) {
    this.grnTableHandler.currentPage = page;
    const pagination = this.dataLoader.grnPagination;
    if (pagination && pagination.total > this.dataLoader.grnRecords.length) {
      await this.dataLoader.fetchGrns({
        page,
        per_page: 20,
        search: this.searchTerm,
        status: this.statusFilter,
        supplier: this.supplierFilter
      }, true);
    }
    this.renderTable();
  }

  /**
   * Handle PO table page change without reloading the browser page.
   *
   * @param {number} page
   */
  async onPoPageChange(page) {
    this.poTableHandler.currentPage = page;
    const pagination = this.dataLoader.poPagination;
    if (pagination && pagination.total > this.dataLoader.purchaseOrders.length) {
      await this.dataLoader.fetchPurchaseOrders({
        page,
        per_page: 20,
        search: this.poSearchTerm,
        status: this.poStatusFilter,
        supplier: this.poSupplierFilter
      }, true);
    }
    this.renderPOTable();
  }

  /**
   * Handle Supplier directory page change without reloading the browser page.
   *
   * @param {number} page
   */
  async onSupplierPageChange(page) {
    this.supplierHandler.currentPage = page;
    const pagination = this.dataLoader.supplierPagination;
    if (pagination && pagination.total > this.dataLoader.suppliers.length) {
      await this.dataLoader.fetchSuppliers({
        page,
        per_page: 20,
        search: this.supplierSearchTerm,
        category: this.supplierCategoryFilter
      }, true);
    }
    this.renderSuppliersGrid();
  }

  /**
   * On-demand data loading & rendering for Purchase Orders (PO) tab.
   * Loads data from backend Supplier module via RequestHandler.
   *
   * @param {boolean} [forceRefresh=false]
   */
  async loadAndRenderPO(forceRefresh = false) {
    await this.dataLoader.fetchPurchaseOrders({ page: this.poTableHandler.currentPage || 1, per_page: 20 }, forceRefresh);
    this.renderPOTable();
    this.supplierHandler.populatePOSupplierFilter();
    this.metricsProcess.renderOpenPoBadge();
  }

  /**
   * On-demand data loading & rendering for Goods Received (GRN) tab.
   * Loads data from backend Supplier module via RequestHandler.
   *
   * @param {boolean} [forceRefresh=false]
   */
  async loadAndRenderGRN(forceRefresh = false) {
    await this.dataLoader.fetchGrns({ page: this.grnTableHandler.currentPage || 1, per_page: 20 }, forceRefresh);
    this.renderTable();
    this.supplierHandler.populateSupplierFilter();
    this.metricsProcess.renderKPIs();
  }

  /**
   * On-demand data loading & rendering for Suppliers Directory tab.
   *
   * @param {boolean} [forceRefresh=false]
   */
  async loadAndRenderSuppliers(forceRefresh = false) {
    await this.dataLoader.fetchSuppliers({ page: this.supplierHandler.currentPage || 1, per_page: 20 }, forceRefresh);
    this.supplierHandler.populateAllSupplierDropdowns();
    this.renderSuppliersGrid();
  }

  render() {
    this.metricsProcess.renderKPIs();
    this.renderTable();
    this.supplierHandler.populateAllSupplierDropdowns();
    this.metricsProcess.renderOpenPoBadge();
    this.renderPOTable();
    this.renderSuppliersGrid();
  }

  // Navigation & View Actions
  switchView(viewName, targetPoNumber = null) {
    this.navigationProcess.switchView(viewName, targetPoNumber);
  }

  // Metrics Delegations
  renderKPIs() { this.metricsProcess.renderKPIs(); }
  renderOpenPoBadge() { this.metricsProcess.renderOpenPoBadge(); }

  // Supplier Delegations
  populateAllSupplierDropdowns() { this.supplierHandler.populateAllSupplierDropdowns(); }
  populateSupplierFilter() { this.supplierHandler.populateSupplierFilter(); }
  populatePOSupplierFilter() { this.supplierHandler.populatePOSupplierFilter(); }
  renderSuppliersGrid() {
    this.supplierHandler.setFilters(this.supplierSearchTerm, this.supplierCategoryFilter);
    this.supplierHandler.renderSuppliersGrid(this.dataLoader.supplierPagination);
  }
  createGrnForSupplier(name) { this.supplierHandler.createGrnForSupplier(name); }
  deleteSupplier(code) { this.supplierHandler.deleteSupplier(code); }

  // Table Render Delegations
  renderTable() {
    this.grnTableHandler.render(
      this.dataLoader.grnRecords,
      this.searchTerm,
      this.statusFilter,
      this.supplierFilter,
      this.dataLoader.grnPagination
    );
  }

  renderPOTable() {
    this.poTableHandler.render(
      this.dataLoader.purchaseOrders,
      this.poSearchTerm,
      this.poStatusFilter,
      this.poSupplierFilter,
      this.dataLoader.poPagination
    );
  }

  // GRN Form Process Delegations
  populatePOSelect(po) { this.grnFormProcess.populatePOSelect(po); }
  initNewGrnForm(po) { this.grnFormProcess.initNewGrnForm(po); }
  onPurchaseOrderSelect(po) { this.grnFormProcess.onPurchaseOrderSelect(po); }
  clearSelectedPO() { this.grnFormProcess.clearSelectedPO(); }
  createGrnForPO(po) { this.grnFormProcess.createGrnForPO(po); }
  getCatalogItems() { return this.grnFormProcess.getCatalogItems(); }
  addNewRow() { this.grnFormProcess.addNewRow(); }
  removeRow(i) { this.grnFormProcess.removeRow(i); }
  renderFormItems() { this.grnFormProcess.renderFormItems(); }
  onItemSelectChange(i, code) { this.grnFormProcess.onItemSelectChange(i, code); }
  onQtyChange(i, qty) { this.grnFormProcess.onQtyChange(i, qty); }
  onCostChange(i, cost) { this.grnFormProcess.onCostChange(i, cost); }
  renderRowTotal(i) { this.grnFormProcess.renderRowTotal(i); }
  calculateFinancials() { return this.grnFormProcess.calculateFinancials(); }
  saveGRN(isCompleted = false) { this.grnFormProcess.saveGRN(isCompleted); }
  finalizeDraftGRN(num) { this.grnFormProcess.finalizeDraftGRN(num); }
  updatePurchaseOrderStatus(num, items) { this.grnFormProcess.updatePurchaseOrderStatus(num, items); }

  // Modal Delegations (Backward compatibility for HTML onclick and external calls)
  openModal(modalId) { this.modalHandler.openModal(modalId); }
  closeModal(modalId) { this.modalHandler.closeModal(modalId); }
  showToast(message, type = "success") { this.modalHandler.showToast(message, type); }
  exportCSV() { this.exportProcess.exportCSV(); }

  viewGRN(grnNumber) { this.modalHandler.viewGRN(grnNumber); }
  triggerPrintGrn() { this.modalHandler.triggerPrintGrn(); }

  viewPO(poNumber) { this.modalHandler.viewPO(poNumber); }
  triggerPrintPO() { this.modalHandler.triggerPrintPO(); }

  openCreatePOModal(defaultSupplier = null) { this.modalHandler.openCreatePOModal(defaultSupplier); }
  addNewPoRow() { this.modalHandler.addNewPoRow(); }
  removeNewPoRow(index) { this.modalHandler.removeNewPoRow(index); }
  renderNewPoItems() { this.modalHandler.renderNewPoItems(); }
  onNewPoItemSelectChange(index, itemCode) { this.modalHandler.onNewPoItemSelectChange(index, itemCode); }
  onNewPoQtyChange(index, qtyVal) { this.modalHandler.onNewPoQtyChange(index, qtyVal); }
  onNewPoCostChange(index, costVal) { this.modalHandler.onNewPoCostChange(index, costVal); }
  renderNewPoRowTotal(index) { this.modalHandler.renderNewPoRowTotal(index); }
  calculateNewPoTotal() { return this.modalHandler.calculateNewPoTotal(); }
  saveNewPurchaseOrder() { this.modalHandler.saveNewPurchaseOrder(); }

  openRegisterSupplierModal(caller = null, code = null) { this.modalHandler.openRegisterSupplierModal(caller, code); }
  openEditSupplierModal(code) { this.modalHandler.openEditSupplierModal(code); }
  saveNewSupplier() { this.modalHandler.saveNewSupplier(); }
}

// Global initialization
if (typeof window !== "undefined") {
  window.GRNManager = GRNManager;
  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("module-grn") && !window.grnManager) {
      window.grnManager = new GRNManager();
    }
  });
}
