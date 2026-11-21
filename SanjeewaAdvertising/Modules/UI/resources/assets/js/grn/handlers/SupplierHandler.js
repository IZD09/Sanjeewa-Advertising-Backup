/**
 * SanjeewaAdvertising - Supplier Handler
 *
 * Manages suppliers directory cards, supplier registration & edit modal,
 * filtering, dropdown population, and supplier deletion.
 */

import { MobileNumberHelper } from "../../core/MobileNumberHelper.js";
import { SupplierCardBuilder } from "../builders/SupplierCardBuilder.js";

export class SupplierHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getSuppliers
   * @param {Function} context.setSuppliers
   * @param {Function} context.getGrnRecords
   * @param {Function} context.getPurchaseOrders
   * @param {Function} context.saveSupplierData
   * @param {Function} context.generateNextSupplierCode
   * @param {Function} context.openModal
   * @param {Function} context.closeModal
   * @param {Function} context.showToast
   * @param {Function} context.switchView
   * @param {Function} context.createGrnForPO
   * @param {Function} context.openCreatePOModal
   */
  constructor(context) {
    this.ctx = context;
    this.supplierCallerContext = null;
    this.editingSupplierCode = null;
    this.supplierSearchTerm = "";
    this.supplierCategoryFilter = "ALL";
    this.currentPage = 1;
    this.pageSize = 20;
    this.onPageChange = context.onPageChange || null;
  }

  setFilters(searchTerm = "", categoryFilter = "ALL") {
    if (this.supplierSearchTerm !== searchTerm || this.supplierCategoryFilter !== categoryFilter) {
      this.currentPage = 1;
    }
    this.supplierSearchTerm = searchTerm;
    this.supplierCategoryFilter = categoryFilter;
  }

  populateAllSupplierDropdowns() {
    const suppliers = this.ctx.getSuppliers() || [];

    // 1. Datalist for autocomplete inputs (only include active suppliers)
    const datalists = document.querySelectorAll("#grnSupplierList");
    datalists.forEach(dl => {
      dl.innerHTML = "";
      suppliers.forEach(s => {
        const isDisabled = (s.status || "").toLowerCase() === "disabled";
        if (!isDisabled) {
          const opt = document.createElement("option");
          opt.value = s.name;
          dl.appendChild(opt);
        }
      });
    });

    // 2. Filter dropdowns
    this.populateSupplierFilter();
    this.populatePOSupplierFilter();

    // 3. Purchase Order Supplier select box
    const poSupplierSelect = document.getElementById("newPoSupplier");
    if (poSupplierSelect && poSupplierSelect.tagName === "SELECT") {
      const currentVal = poSupplierSelect.value;
      poSupplierSelect.innerHTML = '<option value="" disabled' + (!currentVal ? ' selected' : '') + '>-- Select Supplier / Vendor --</option>';
      suppliers.forEach(s => {
        const isDisabled = (s.status || "").toLowerCase() === "disabled";
        const opt = document.createElement("option");
        opt.value = s.name;
        opt.textContent = isDisabled ? `${s.name} (Disabled)` : s.name;
        opt.dataset.mobile = s.mobile || s.phone || "";
        if (isDisabled) {
          opt.disabled = true;
        }
        if (currentVal && s.name.toLowerCase() === currentVal.toLowerCase()) {
          opt.selected = true;
        }
        poSupplierSelect.appendChild(opt);
      });
      const contactInput = document.getElementById("newPoContact");
      if (poSupplierSelect.value && contactInput && !contactInput.value) {
        const found = suppliers.find(s => s.name.toLowerCase() === poSupplierSelect.value.toLowerCase());
        if (found) contactInput.value = found.mobile || found.phone || "";
      }
    }

    // 4. Count badge
    const badge = document.getElementById("grnSupplierCountBadge");
    const pagination = this.ctx.getSupplierPagination ? this.ctx.getSupplierPagination() : null;
    if (badge) {
      badge.textContent = pagination && typeof pagination.total === "number" && pagination.total >= suppliers.length
        ? pagination.total
        : suppliers.length;
    }
  }

  populateSupplierFilter() {
    const select = document.getElementById("grnSupplierFilter");
    if (!select) return;

    const dbSuppliers = this.ctx.getGrnSuppliers ? this.ctx.getGrnSuppliers() : [];
    const suppliers = this.ctx.getSuppliers() || [];
    const grnRecords = this.ctx.getGrnRecords() || [];

    const supplierSet = new Set();
    dbSuppliers.forEach(s => {
      if (s.name) supplierSet.add(s.name);
    });
    suppliers.forEach(s => {
      if (s.name) supplierSet.add(s.name);
    });
    grnRecords.forEach(r => {
      if (r.supplier_name) supplierSet.add(r.supplier_name);
    });

    const currentVal = select.value;
    select.innerHTML = '<option value="ALL">All Suppliers</option>';
    Array.from(supplierSet).sort((a, b) => a.localeCompare(b)).forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      if (s === currentVal) opt.selected = true;
      select.appendChild(opt);
    });
  }

  populateGrnStatusFilter() {
    const select = document.getElementById("grnStatusFilter");
    if (!select) return;

    const dbStatuses = this.ctx.getGrnStatuses ? this.ctx.getGrnStatuses() : [];
    const statuses = Array.isArray(dbStatuses) && dbStatuses.length > 0
      ? dbStatuses
      : ["Completed", "Approved", "Draft", "Cancelled"];

    const currentVal = select.value;
    select.innerHTML = '<option value="ALL">All Statuses</option>';
    statuses.forEach(st => {
      const opt = document.createElement("option");
      opt.value = st;
      opt.textContent = st;
      if (st === currentVal) opt.selected = true;
      select.appendChild(opt);
    });
  }

  populatePOSupplierFilter() {
    const select = document.getElementById("poSupplierFilter");
    if (!select) return;

    const dbSuppliers = this.ctx.getPoSuppliers ? this.ctx.getPoSuppliers() : [];
    const suppliers = this.ctx.getSuppliers() || [];
    const purchaseOrders = this.ctx.getPurchaseOrders() || [];

    const supplierSet = new Set();
    dbSuppliers.forEach(s => {
      if (s.name) supplierSet.add(s.name);
    });
    suppliers.forEach(s => {
      if (s.name) supplierSet.add(s.name);
    });
    purchaseOrders.forEach(p => {
      if (p.supplier_name) supplierSet.add(p.supplier_name);
    });

    const currentVal = select.value;
    select.innerHTML = '<option value="ALL">All Suppliers</option>';
    Array.from(supplierSet).sort((a, b) => a.localeCompare(b)).forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      if (s === currentVal) opt.selected = true;
      select.appendChild(opt);
    });
  }

  populatePOStatusFilter() {
    const select = document.getElementById("poStatusFilter");
    if (!select) return;

    const dbStatuses = this.ctx.getPoStatuses ? this.ctx.getPoStatuses() : [];
    const statuses = Array.isArray(dbStatuses) && dbStatuses.length > 0
      ? dbStatuses
      : ["Pending", "Partial", "Completed", "Cancelled"];

    const currentVal = select.value;
    select.innerHTML = '<option value="ALL">All Statuses</option>';
    statuses.forEach(st => {
      const opt = document.createElement("option");
      opt.value = st;
      opt.textContent = st;
      if (st === currentVal) opt.selected = true;
      select.appendChild(opt);
    });
  }

  renderSuppliersGrid(serverPagination = null) {
    const container = document.getElementById("suppliersCardsContainer");
    if (!container) return;

    const suppliers = this.ctx.getSuppliers() || [];
    const filtered = suppliers.filter(s => {
      const matchesSearch = !this.supplierSearchTerm ||
        (s.name && s.name.toLowerCase().includes(this.supplierSearchTerm)) ||
        (s.code && s.code.toLowerCase().includes(this.supplierSearchTerm)) ||
        (s.contact_person && s.contact_person.toLowerCase().includes(this.supplierSearchTerm)) ||
        MobileNumberHelper.matchesMobile(s.phone, this.supplierSearchTerm) ||
        (s.email && s.email.toLowerCase().includes(this.supplierSearchTerm)) ||
        (s.address && s.address.toLowerCase().includes(this.supplierSearchTerm)) ||
        (s.category && s.category.toLowerCase().includes(this.supplierSearchTerm));

      const matchesCategory = this.supplierCategoryFilter === "ALL" || s.category === this.supplierCategoryFilter;

      return matchesSearch && matchesCategory;
    });

    const pageSize = this.pageSize || 20;
    const useServerMeta = serverPagination &&
      typeof serverPagination.total === "number" &&
      serverPagination.total > suppliers.length;

    let pageItems = [];
    let total = 0;
    let totalPages = 1;
    let activePage = this.currentPage;

    if (useServerMeta) {
      pageItems = filtered.slice(0, pageSize);
      total = serverPagination.total;
      totalPages = Math.max(1, serverPagination.last_page || Math.ceil(total / pageSize));
      activePage = serverPagination.current_page || this.currentPage;
      this.currentPage = activePage;
    } else {
      total = filtered.length;
      totalPages = Math.max(1, Math.ceil(total / pageSize));
      activePage = Math.max(1, Math.min(this.currentPage, totalPages));
      this.currentPage = activePage;
      const start = (activePage - 1) * pageSize;
      pageItems = filtered.slice(start, start + pageSize);
    }

    container.innerHTML = "";

    if (pageItems.length === 0) {
      container.innerHTML = `
        <div class="inv-empty-state" style="grid-column: 1 / -1; padding: 48px 16px; text-align: center; color: var(--text-muted);">
          <i class="fa-solid fa-truck-field" style="font-size: 36px; opacity: 0.4; margin-bottom: 12px; color: var(--po-orange, #ff6b00);"></i>
          <h4 style="margin: 0; font-size: 15px; color: var(--text);">No Suppliers Found</h4>
          <p style="margin: 6px 0 14px; font-size: 12.5px; color: var(--text-muted);">Register a new supplier to start issuing Purchase Orders and Goods Received Notes.</p>
          <button type="button" class="po-btn po-btn-primary" onclick="window.grnManager.openRegisterSupplierModal()">
            <i class="fa-solid fa-user-plus"></i> Register Supplier Now
          </button>
        </div>
      `;
      this.renderSupplierPagination(0, 1, 1, pageSize);
      return;
    }

    const purchaseOrders = this.ctx.getPurchaseOrders ? this.ctx.getPurchaseOrders() : [];

    pageItems.forEach(s => {
      // Calculate approved (ready for GRN) purchase orders count
      let approvedPoCount = 0;
      if (Array.isArray(purchaseOrders) && purchaseOrders.length > 0) {
        approvedPoCount = purchaseOrders.filter((po) => {
          const matchSup = (po.suppliers_id && s.id && Number(po.suppliers_id) === Number(s.id)) ||
            (po.supplier_name && s.name && po.supplier_name.toLowerCase() === s.name.toLowerCase());
          const isApproved = String(po.status || "").trim().toLowerCase() === "approved" ||
            Number(po.purchase_orders_status_id) === 5;
          return matchSup && isApproved;
        }).length;
      } else if (typeof s.approved_purchase_orders_count === "number") {
        approvedPoCount = s.approved_purchase_orders_count;
      }

      const builder = new SupplierCardBuilder({
        ...s,
        approvedPoCount,
        ungrnedPoCount: approvedPoCount,
      });

      container.insertAdjacentHTML("beforeend", builder.render());
    });

    this.renderSupplierPagination(total, totalPages, activePage, pageSize);
  }

  renderSupplierPagination(totalCount, totalPages, currentPage, pageSize) {
    const infoElem = document.getElementById("supplierPaginationInfo");
    const controlsElem = document.getElementById("supplierPaginationControls");
    const paginationBar = document.getElementById("supplierPaginationBar") || (infoElem ? infoElem.closest(".grn-pagination-bar") : null);
    if (!infoElem || !controlsElem) return;

    // Only display pagination if results are strictly more than 20
    if (totalCount <= 20) {
      if (paginationBar) {
        paginationBar.style.display = "none";
      }
      infoElem.textContent = "";
      controlsElem.innerHTML = "";
      return;
    }

    if (paginationBar) {
      paginationBar.style.display = "flex";
    }

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalCount);
    infoElem.textContent = `Showing ${start}-${end} of ${totalCount} records`;
    controlsElem.innerHTML = "";

    const handlePageSelect = (newPage) => {
      this.currentPage = newPage;
      if (typeof this.onPageChange === "function") {
        this.onPageChange(newPage);
      } else {
        this.renderSuppliersGrid();
      }
    };

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "page-btn";
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage > 1) handlePageSelect(currentPage - 1);
    });
    controlsElem.appendChild(prevBtn);

    for (let p = 1; p <= totalPages; p++) {
      const pageBtn = document.createElement("button");
      pageBtn.type = "button";
      pageBtn.className = `page-btn ${p === currentPage ? "active" : ""}`;
      pageBtn.textContent = String(p);
      pageBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (p !== currentPage) handlePageSelect(p);
      });
      controlsElem.appendChild(pageBtn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "page-btn";
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage < totalPages) handlePageSelect(currentPage + 1);
    });
    controlsElem.appendChild(nextBtn);
  }

  openEditSupplierModal(supplierCode) {
    if (this.ctx.openEditSupplierModal) {
      this.ctx.openEditSupplierModal(supplierCode);
      return;
    }
    this.openRegisterSupplierModal(null, supplierCode);
  }

  openRegisterSupplierModal(callerContext = null, editingSupplierCode = null) {
    if (this.ctx.openRegisterSupplierModal) {
      this.ctx.openRegisterSupplierModal(callerContext, editingSupplierCode);
      return;
    }
    this.supplierCallerContext = callerContext;
    this.editingSupplierCode = editingSupplierCode;

    const modalTitle = document.getElementById("registerSupplierModalTitle");
    const saveBtn = document.getElementById("saveNewSupplierBtn");

    const nameInput = document.getElementById("newSupName");
    const phoneInput = document.getElementById("newSupPhone");
    const emailInput = document.getElementById("newSupEmail");
    const bankAccountInput = document.getElementById("newSupBankAccount");

    const suppliers = this.ctx.getSuppliers ? this.ctx.getSuppliers() : [];

    if (editingSupplierCode) {
      const s = suppliers.find(sup => sup.code === editingSupplierCode || sup.id === editingSupplierCode);
      if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color: #1677ff;"></i> Edit Supplier Details (${s ? (s.code || ('SUP-' + s.id)) : ""})`;
      if (saveBtn) saveBtn.innerHTML = `<i class="fa-solid fa-check"></i> Update Supplier`;

      if (nameInput) nameInput.value = s ? s.name : "";
      if (phoneInput) phoneInput.value = s ? (s.phone || s.mobile || "") : "";
      if (emailInput) emailInput.value = s ? (s.email || "") : "";
      if (bankAccountInput) bankAccountInput.value = s ? (s.bank_account || s.bank_details || "") : "";
    } else {
      if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-truck-field" style="color: #1677ff;"></i> Register New Supplier / Vendor`;
      if (saveBtn) saveBtn.innerHTML = `<i class="fa-solid fa-user-check"></i> Save & Register Supplier`;

      if (nameInput) nameInput.value = "";
      if (phoneInput) phoneInput.value = "";
      if (emailInput) emailInput.value = "";
      if (bankAccountInput) bankAccountInput.value = "";
    }

    this.ctx.openModal("registerSupplierModal");
  }

  async saveNewSupplier() {
    if (this.ctx.saveNewSupplier) {
      return this.ctx.saveNewSupplier();
    }
  }

  async toggleSupplierStatus(supplierCode) {
    let suppliers = this.ctx.getSuppliers ? this.ctx.getSuppliers() : [];
    const s = suppliers.find(sup => String(sup.code) === String(supplierCode) || String(sup.id) === String(supplierCode));
    if (!s) return;

    const isCurrentlyDisabled = (s.status || "").toLowerCase() === "disabled";
    const actionVerb = isCurrentlyDisabled ? "enable" : "disable";
    const actionPast = isCurrentlyDisabled ? "enabled" : "disabled";

    const confirmed = confirm(`Are you sure you want to ${actionVerb} supplier "${s.name}"?`);
    if (!confirmed) return;

    if (this.ctx.toggleSupplierStatus && s.id) {
      try {
        const res = await this.ctx.toggleSupplierStatus(s.id);
        const updatedStatus = res?.data?.status || res?.status || (isCurrentlyDisabled ? "Active" : "Disabled");
        s.status = updatedStatus;

        if (this.ctx.fetchSuppliers) {
          await this.ctx.fetchSuppliers({}, true);
        }

        this.populateAllSupplierDropdowns();
        this.renderSuppliersGrid();
        this.ctx.showToast(`Supplier "${s.name}" has been ${actionPast} successfully.`, isCurrentlyDisabled ? "success" : "info");
        return;
      } catch (err) {
        this.ctx.showToast(err.message || `Failed to ${actionVerb} supplier`, "error");
        return;
      }
    }

    s.status = isCurrentlyDisabled ? "Active" : "Disabled";
    if (this.ctx.saveSupplierData) this.ctx.saveSupplierData();
    this.populateAllSupplierDropdowns();
    this.renderSuppliersGrid();
    this.ctx.showToast(`Supplier "${s.name}" has been ${actionPast} successfully.`, isCurrentlyDisabled ? "success" : "info");
  }

  async deleteSupplier(supplierCode) {
    return this.toggleSupplierStatus(supplierCode);
  }

  createGrnForSupplier(supplierName) {
    if (this.ctx.openCreateGrnModal) {
      this.ctx.openCreateGrnModal(null, supplierName);
      return;
    }

    this.ctx.switchView("form");
    if (this.ctx.clearSelectedPO) {
      this.ctx.clearSelectedPO();
    }

    const supInput = document.getElementById("grnFormSupplier");
    const contactInput = document.getElementById("grnFormContact");

    if (supInput) supInput.value = supplierName;
    const suppliers = this.ctx.getSuppliers() || [];
    const found = suppliers.find(s => s.name.toLowerCase() === supplierName.toLowerCase());
    if (found && contactInput) {
      contactInput.value = found.phone;
    }

    const formView = document.getElementById("grnFormView");
    if (formView) {
      formView.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

export default SupplierHandler;

