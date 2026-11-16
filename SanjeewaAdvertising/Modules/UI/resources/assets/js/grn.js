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
import { ActionMenuHelper } from "./core/ActionMenuHelper.js";

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
      createSupplier: (data) => this.dataLoader.createSupplier(data),
      updateSupplier: (id, data) => this.dataLoader.updateSupplier(id, data),
      deleteSupplier: (id) => this.dataLoader.deleteSupplier(id),
      savePOData: () => this.dataLoader.savePOData(),
      generateNextPONumber: () => this.dataLoader.generateNextPONumber(),
      generateNextSupplierCode: () => this.dataLoader.generateNextSupplierCode(),
      generateNextGrnNumber: () => this.dataLoader.generateNextGrnNumber(),
      formatCurrency: (amt) => this.dataLoader.formatCurrency(amt),
      getCatalogItems: () => this.grnFormProcess.getCatalogItems(),
      renderOpenPoBadge: () => this.renderOpenPoBadge(),
      renderPOTable: () => this.renderPOTable(),
      populatePOSupplierFilter: () => this.supplierHandler.populatePOSupplierFilter(),
      populateAllSupplierDropdowns: () => this.supplierHandler.populateAllSupplierDropdowns(),
      renderSuppliersGrid: () => this.renderSuppliersGrid(),
      loadAndRenderGRN: (force) => this.loadAndRenderGRN(force),
      loadAndRenderPO: (force) => this.loadAndRenderPO(force),
      loadAndRenderSuppliers: (force) => this.loadAndRenderSuppliers(force),
      dataLoader: this.dataLoader,
      viewGRN: (num) => this.viewGRN(num),
      showToast: (msg, type) => this.showToast(msg, type),
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
      getSupplierPagination: () => this.dataLoader.supplierPagination,
      getGrnRecords: () => this.dataLoader.grnRecords,
      getGrnSuppliers: () => this.dataLoader.grnSuppliers,
      getGrnStatuses: () => this.dataLoader.grnStatuses,
      getPurchaseOrders: () => this.dataLoader.purchaseOrders,
      getPoSuppliers: () => this.dataLoader.poSuppliers,
      getPoStatuses: () => this.dataLoader.poStatuses,
      saveSupplierData: () => this.dataLoader.saveSupplierData(),
      createSupplier: (data) => this.dataLoader.createSupplier(data),
      updateSupplier: (id, data) => this.dataLoader.updateSupplier(id, data),
      deleteSupplier: (id) => this.dataLoader.deleteSupplier(id),
      toggleSupplierStatus: (id) => this.dataLoader.toggleSupplierStatus(id),
      fetchSuppliers: (params, force) => this.dataLoader.fetchSuppliers(params, force),
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
      openCreateGrnModal: (targetPo, supplier) => this.openCreateGrnModal(targetPo, supplier),
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
      getGrnPagination: () => this.dataLoader.grnPagination,
      getPoPagination: () => this.dataLoader.poPagination,
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
      // Also fetch PO in background so its tab badge and form dropdowns are warmed up
      this.dataLoader.fetchPurchaseOrders({ page: 1, per_page: 20 }).then(() => {
        this.metricsProcess.renderOpenPoBadge();
      }).catch(() => {});
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
    this.supplierHandler.populatePOStatusFilter();
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
    this.supplierHandler.populateGrnStatusFilter();
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
  createGrnForSupplier(name) { this.modalHandler.openCreateGrnModal(null, name); }
  deleteSupplier(code) { this.supplierHandler.deleteSupplier(code); }
  toggleSupplierStatus(code) { this.supplierHandler.toggleSupplierStatus(code); }

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
  createGrnForPO(po) { this.modalHandler.openCreateGrnModal(po); }
  openCreateGrnModal(po = null, supplier = null) { this.modalHandler.openCreateGrnModal(po, supplier); }
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
  toggleRowMenu(triggerBtn) { ActionMenuHelper.toggleRowActionMenu(triggerBtn); }
  closeRowMenus() { ActionMenuHelper.closeAllActionMenus(); }
  openActionConfirmModal({
    type = "approve",
    title = "Confirm Action",
    questionPrefix = "Are you sure you want to proceed with",
    targetLabel = "this record",
    subtext = "This will update the status immediately.",
    confirmHtml = '<i class="fa-solid fa-check"></i> Confirm',
    loadingHtml = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...',
    onConfirm
  } = {}) {
    const modal = document.getElementById("grnActionConfirmModal");
    if (!modal) {
      if (typeof onConfirm === "function") onConfirm();
      return;
    }

    const titleIcon = document.getElementById("grnConfirmTitleIcon");
    const titleText = document.getElementById("grnConfirmTitleText");
    const banner = document.getElementById("grnConfirmBanner");
    const bannerIcon = document.getElementById("grnConfirmBannerIcon");
    const prefixEl = document.getElementById("grnConfirmQuestionPrefix");
    const targetEl = document.getElementById("grnConfirmTargetLabel");
    const subtextEl = document.getElementById("grnConfirmSubtext");
    const submitBtn = document.getElementById("grnConfirmSubmitBtn");
    const cancelBtn = document.getElementById("grnConfirmCancelBtn");
    const closeBtn = document.getElementById("grnConfirmCloseBtn");

    const palette = {
      approve: {
        color: "#16a34a",
        bg: "rgba(22, 163, 74, 0.08)",
        border: "rgba(22, 163, 74, 0.22)",
        icon: "fa-circle-check",
        btnBg: "#16a34a",
        btnBorder: "#15803d"
      },
      cancel: {
        color: "#dc2626",
        bg: "rgba(220, 38, 38, 0.08)",
        border: "rgba(220, 38, 38, 0.22)",
        icon: "fa-triangle-exclamation",
        btnBg: "#dc2626",
        btnBorder: "#b91c1c"
      },
      restore: {
        color: "#1677ff",
        bg: "rgba(22, 119, 255, 0.08)",
        border: "rgba(22, 119, 255, 0.22)",
        icon: "fa-rotate-left",
        btnBg: "#1677ff",
        btnBorder: "#0958d9"
      }
    }[type] || {
      color: "#16a34a",
      bg: "rgba(22, 163, 74, 0.08)",
      border: "rgba(22, 163, 74, 0.22)",
      icon: "fa-circle-check",
      btnBg: "#16a34a",
      btnBorder: "#15803d"
    };

    if (titleIcon) {
      titleIcon.className = `fa-solid ${palette.icon}`;
      titleIcon.style.color = palette.color;
    }
    if (titleText) titleText.textContent = title;
    if (banner) {
      banner.style.background = palette.bg;
      banner.style.borderColor = palette.border;
    }
    if (bannerIcon) {
      bannerIcon.className = `fa-solid ${palette.icon}`;
      bannerIcon.style.color = palette.color;
    }
    if (prefixEl) prefixEl.textContent = questionPrefix;
    if (targetEl) {
      targetEl.textContent = targetLabel;
      targetEl.style.color = palette.color;
    }
    if (subtextEl) subtextEl.textContent = subtext;
    if (submitBtn) {
      submitBtn.innerHTML = confirmHtml;
      submitBtn.style.background = palette.btnBg;
      submitBtn.style.borderColor = palette.btnBorder;
      submitBtn.style.color = "#ffffff";
    }

    this._pendingConfirmAction = onConfirm;
    this._pendingConfirmLoadingHtml = loadingHtml;
    this._pendingConfirmDefaultHtml = confirmHtml;

    if (!modal._grnConfirmBound) {
      modal._grnConfirmBound = true;
      const closeModalFn = () => this.closeActionConfirmModal();
      if (closeBtn) closeBtn.addEventListener("click", closeModalFn);
      if (cancelBtn) cancelBtn.addEventListener("click", closeModalFn);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModalFn();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("open")) closeModalFn();
      });
      if (submitBtn) {
        submitBtn.addEventListener("click", async () => {
          if (typeof this._pendingConfirmAction !== "function") {
            closeModalFn();
            return;
          }
          submitBtn.disabled = true;
          submitBtn.innerHTML = this._pendingConfirmLoadingHtml || '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
          try {
            await this._pendingConfirmAction();
          } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = this._pendingConfirmDefaultHtml || '<i class="fa-solid fa-check"></i> Confirm';
            closeModalFn();
          }
        });
      }
    }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  closeActionConfirmModal() {
    const modal = document.getElementById("grnActionConfirmModal");
    if (!modal) return;
    if (document.activeElement && modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    this._pendingConfirmAction = null;
  }

  async approveGRN(grnNumber) {
    const rec = this.dataLoader.grnRecords.find(r => r.grn_number === grnNumber || String(r.id) === String(grnNumber));
    const id = rec?.id || parseInt(String(grnNumber || "").replace(/\D/g, ""), 10);
    if (!id) return;
    const label = rec?.grn_number || grnNumber;

    this.openActionConfirmModal({
      type: "approve",
      title: "Approve GRN",
      questionPrefix: "Are you sure you want to approve",
      targetLabel: label,
      subtext: "This will update the GRN status to Approved.",
      confirmHtml: '<i class="fa-solid fa-check"></i> Yes, Approve GRN',
      loadingHtml: '<i class="fa-solid fa-spinner fa-spin"></i> Approving...',
      onConfirm: async () => {
        try {
          await this.dataLoader.updateGrnStatus(id, "Approved");
          this.renderTable();
          this.supplierHandler.populateGrnStatusFilter();
          this.metricsProcess.renderKPIs();
          this.showToast(`GRN ${label} approved successfully!`, "success");
        } catch (err) {
          this.showToast(err?.message || "Failed to approve GRN", "error");
        }
      }
    });
  }

  async cancelGRN(grnNumber) {
    const rec = this.dataLoader.grnRecords.find(r => r.grn_number === grnNumber || String(r.id) === String(grnNumber));
    const id = rec?.id || parseInt(String(grnNumber || "").replace(/\D/g, ""), 10);
    if (!id) return;
    const label = rec?.grn_number || grnNumber;

    this.openActionConfirmModal({
      type: "cancel",
      title: "Cancel GRN",
      questionPrefix: "Are you sure you want to cancel",
      targetLabel: label,
      subtext: "This will update the GRN status to Cancelled.",
      confirmHtml: '<i class="fa-solid fa-xmark"></i> Yes, Cancel GRN',
      loadingHtml: '<i class="fa-solid fa-spinner fa-spin"></i> Cancelling...',
      onConfirm: async () => {
        try {
          await this.dataLoader.updateGrnStatus(id, "Cancelled");
          this.renderTable();
          this.supplierHandler.populateGrnStatusFilter();
          this.metricsProcess.renderKPIs();
          this.showToast(`GRN ${label} cancelled.`, "info");
        } catch (err) {
          this.showToast(err?.message || "Failed to cancel GRN", "error");
        }
      }
    });
  }

  async approvePO(poNumber) {
    const po = this.dataLoader.purchaseOrders.find(p => p.po_number === poNumber || String(p.id) === String(poNumber));
    const id = po?.id || parseInt(String(poNumber || "").replace(/\D/g, ""), 10);
    if (!id) return;
    const label = po?.po_number || poNumber;

    this.openActionConfirmModal({
      type: "approve",
      title: "Approve Purchase Order",
      questionPrefix: "Are you sure you want to approve",
      targetLabel: label,
      subtext: "This will update the Purchase Order status to Approved.",
      confirmHtml: '<i class="fa-solid fa-check"></i> Yes, Approve PO',
      loadingHtml: '<i class="fa-solid fa-spinner fa-spin"></i> Approving...',
      onConfirm: async () => {
        try {
          await this.dataLoader.updatePoStatus(id, 2);
          this.renderPOTable();
          this.renderSuppliersGrid();
          this.supplierHandler.populatePOStatusFilter();
          this.metricsProcess.renderOpenPoBadge();
          this.showToast(`Purchase Order ${label} approved successfully!`, "success");
        } catch (err) {
          this.showToast(err?.message || "Failed to approve Purchase Order", "error");
        }
      }
    });
  }

  async cancelPO(poNumber) {
    const po = this.dataLoader.purchaseOrders.find(p => p.po_number === poNumber || String(p.id) === String(poNumber));
    const id = po?.id || parseInt(String(poNumber || "").replace(/\D/g, ""), 10);
    if (!id) return;
    const label = po?.po_number || poNumber;

    this.openActionConfirmModal({
      type: "cancel",
      title: "Cancel Purchase Order",
      questionPrefix: "Are you sure you want to cancel",
      targetLabel: label,
      subtext: "This will update the Purchase Order status to Cancelled.",
      confirmHtml: '<i class="fa-solid fa-xmark"></i> Yes, Cancel PO',
      loadingHtml: '<i class="fa-solid fa-spinner fa-spin"></i> Cancelling...',
      onConfirm: async () => {
        try {
          await this.dataLoader.updatePoStatus(id, 4);
          this.renderPOTable();
          this.renderSuppliersGrid();
          this.supplierHandler.populatePOStatusFilter();
          this.metricsProcess.renderOpenPoBadge();
          this.showToast(`Purchase Order ${label} cancelled.`, "info");
        } catch (err) {
          this.showToast(err?.message || "Failed to cancel Purchase Order", "error");
        }
      }
    });
  }
  updatePurchaseOrderStatus(num, items) { this.grnFormProcess.updatePurchaseOrderStatus(num, items); }

  // Modal Delegations (Backward compatibility for HTML onclick and external calls)
  openModal(modalId) { this.modalHandler.openModal(modalId); }
  closeModal(modalId) { this.modalHandler.closeModal(modalId); }
  showToast(message, type = "success") { this.modalHandler.showToast(message, type); }
  exportCSV() { this.exportProcess.exportCSV(); }

  viewGRN(grnNumber) { this.modalHandler.viewGRN(grnNumber); }
  triggerPrintGrn() { this.modalHandler.triggerPrintGrn(); }

  viewPO(poNumber) { this.modalHandler.viewPO(poNumber); }
  printPO(poNumber) {
    this.viewPO(poNumber);
    setTimeout(() => this.triggerPrintPO(), 150);
  }
  async restorePO(poNumber) {
    const po = this.dataLoader.purchaseOrders.find(p => p.po_number === poNumber || String(p.id) === String(poNumber));
    const id = po?.id || parseInt(String(poNumber || "").replace(/\D/g, ""), 10);
    if (!id) return;
    const label = po?.po_number || poNumber;

    this.openActionConfirmModal({
      type: "restore",
      title: "Restore Purchase Order",
      questionPrefix: "Are you sure you want to restore",
      targetLabel: label,
      subtext: "This will move the Purchase Order back to Pending status.",
      confirmHtml: '<i class="fa-solid fa-rotate-left"></i> Yes, Restore PO',
      loadingHtml: '<i class="fa-solid fa-spinner fa-spin"></i> Restoring...',
      onConfirm: async () => {
        try {
          await this.dataLoader.updatePoStatus(id, 1);
          this.renderPOTable();
          this.renderSuppliersGrid();
          this.supplierHandler.populatePOStatusFilter();
          this.metricsProcess.renderOpenPoBadge();
          this.showToast(`Purchase Order ${label} restored to Pending.`, "success");
        } catch (err) {
          this.showToast(err?.message || "Failed to restore Purchase Order", "error");
        }
      }
    });
  }
  triggerPrintPO() { this.modalHandler.triggerPrintPO(); }

  openCreatePOModal(defaultSupplier = null) { this.modalHandler.openCreatePOModal(defaultSupplier); }
  addNewPoRow() { this.modalHandler.addNewPoRow(); }
  addItemToPo(item) { this.modalHandler.addItemToPo(item); }
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

  const bootGrn = () => {
    if (document.getElementById("module-grn")) {
      if (!window.grnManager) {
        window.grnManager = new GRNManager();
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootGrn, { once: true });
  } else {
    bootGrn();
  }

  document.addEventListener("turbo:load", bootGrn);
  document.addEventListener("turbo:before-cache", () => {
    window.grnManager = null;
  });
}
