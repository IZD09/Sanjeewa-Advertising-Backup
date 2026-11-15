/**
 * SanjeewaAdvertising - Supplier Handler
 *
 * Manages suppliers directory cards, supplier registration & edit modal,
 * filtering, dropdown population, and supplier deletion.
 */

import { matchesMobile } from "../../core/MobileNumberHelper.js";

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

    // 1. Datalist for autocomplete inputs
    const datalists = document.querySelectorAll("#grnSupplierList");
    datalists.forEach(dl => {
      dl.innerHTML = "";
      suppliers.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.name;
        dl.appendChild(opt);
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
        const opt = document.createElement("option");
        opt.value = s.name;
        opt.textContent = s.name;
        opt.dataset.mobile = s.mobile || s.phone || "";
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

    const suppliers = this.ctx.getSuppliers() || [];
    const grnRecords = this.ctx.getGrnRecords() || [];

    const supplierSet = new Set();
    grnRecords.forEach(r => {
      if (r.supplier_name) supplierSet.add(r.supplier_name);
    });
    suppliers.forEach(s => supplierSet.add(s.name));

    const currentVal = select.value;
    select.innerHTML = '<option value="ALL">All Suppliers</option>';
    supplierSet.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      if (s === currentVal) opt.selected = true;
      select.appendChild(opt);
    });
  }

  populatePOSupplierFilter() {
    const select = document.getElementById("poSupplierFilter");
    if (!select) return;

    const suppliers = this.ctx.getSuppliers() || [];
    const purchaseOrders = this.ctx.getPurchaseOrders() || [];

    const supplierSet = new Set();
    purchaseOrders.forEach(p => {
      if (p.supplier_name) supplierSet.add(p.supplier_name);
    });
    suppliers.forEach(s => supplierSet.add(s.name));

    const currentVal = select.value;
    select.innerHTML = '<option value="ALL">All Suppliers</option>';
    supplierSet.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      if (s === currentVal) opt.selected = true;
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
        matchesMobile(s.phone, this.supplierSearchTerm) ||
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
        <div class="inv-empty-state" style="grid-column: 1 / -1; padding: 40px;">
          <i class="fa-solid fa-truck-field"></i>
          <h4 style="margin: 0; font-size: 15px; color: var(--text);">No Suppliers Found</h4>
          <p style="margin: 6px 0 14px; font-size: 12.5px; color: var(--text-muted);">Register a new supplier to start issuing Purchase Orders and Goods Received Notes.</p>
          <button type="button" class="ant-btn ant-btn-primary" onclick="window.grnManager.openRegisterSupplierModal()">
            <i class="fa-solid fa-user-plus"></i> Register Supplier Now
          </button>
        </div>
      `;
      this.renderSupplierPagination(0, 1, 1, pageSize);
      return;
    }

    const purchaseOrders = this.ctx.getPurchaseOrders ? this.ctx.getPurchaseOrders() : [];

    pageItems.forEach(s => {
      // Calculate un-GRNed (pending/partial) purchase orders count
      let ungrnedPoCount = 0;
      if (Array.isArray(purchaseOrders) && purchaseOrders.length > 0) {
        ungrnedPoCount = purchaseOrders.filter((po) => {
          const matchSup = (po.suppliers_id && s.id && Number(po.suppliers_id) === Number(s.id)) ||
            (po.supplier_name && s.name && po.supplier_name.toLowerCase() === s.name.toLowerCase());
          return matchSup && po.status !== "Completed" && po.status !== "Cancelled";
        }).length;
      } else if (typeof s.pending_purchase_orders_count === "number") {
        ungrnedPoCount = s.pending_purchase_orders_count;
      }

      const card = document.createElement("div");
      card.className = "supplier-card";
      card.innerHTML = `
        <div>
          <div class="supplier-card-header">
            <div class="supplier-brand-info">
              <h4><i class="fa-solid fa-truck-ramp-box"></i> ${s.name}</h4>
              <div class="supplier-contact-person">
                <i class="fa-solid fa-user-tie"></i> ${s.contact_person || s.name}
              </div>
            </div>
            <span class="grn-code-badge" style="background: #e6f4ff; color: #1677ff; border-color: #91caff;">${s.code}</span>
          </div>

          <div class="supplier-details-list" style="margin-top: 12px;">
            <div class="supplier-detail-row">
              <i class="fa-solid fa-phone"></i>
              <a href="tel:${s.phone}" style="color: var(--text); font-weight: 600; text-decoration: none;">${s.phone}</a>
              ${s.alt_phone ? `<span style="color: var(--text-muted); font-size: 11px;">/ ${s.alt_phone}</span>` : ""}
            </div>
            ${s.email ? `
              <div class="supplier-detail-row">
                <i class="fa-solid fa-envelope"></i>
                <a href="mailto:${s.email}" style="color: var(--text-muted); text-decoration: none;">${s.email}</a>
              </div>
            ` : ""}
            ${s.address ? `
              <div class="supplier-detail-row">
                <i class="fa-solid fa-location-dot"></i>
                <span title="${s.address}">${s.address}</span>
              </div>
            ` : ""}
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span class="supplier-category-pill">${s.category || "General Printing Media"}</span>
            <span class="supplier-terms-badge">${s.payment_terms || "COD"}</span>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; padding: 7px 10px; background: rgba(22, 119, 255, 0.04); border: 1px solid ${ungrnedPoCount > 0 ? '#91caff' : 'var(--border)'}; border-radius: 6px; margin-bottom: 12px;">
            <span style="font-size: 11.5px; font-weight: 600; color: var(--text);">
              <i class="fa-solid fa-clipboard-list" style="color: ${ungrnedPoCount > 0 ? '#1677ff' : 'var(--text-muted)'}; margin-right: 5px;"></i>
              Un-GRNed POs:
            </span>
            <span class="tab-count-badge" style="background: ${ungrnedPoCount > 0 ? '#faad14' : '#f0f0f0'}; color: ${ungrnedPoCount > 0 ? '#fff' : 'var(--text-muted)'}; font-weight: 700; padding: 1px 8px; border-radius: 10px; font-size: 11px; border: 1px solid ${ungrnedPoCount > 0 ? '#d48806' : 'var(--border)'};">
              ${ungrnedPoCount}
            </span>
          </div>

          <div class="supplier-card-footer">
            <button type="button" class="ant-btn ant-btn-default" style="font-size: 11.5px; height: 30px; padding: 0 10px;" title="Create Purchase Order for this Supplier" onclick="window.grnManager.openCreatePOModal('${s.name}')">
              <i class="fa-solid fa-cart-arrow-down" style="color: #1677ff;"></i> + PO
            </button>
            <button type="button" class="ant-btn ant-btn-primary" style="font-size: 11.5px; height: 30px; padding: 0 10px; display: inline-flex; align-items: center; gap: 6px;" title="Create GRN for this Supplier (${ungrnedPoCount} un-GRNed POs)" onclick="window.grnManager.createGrnForSupplier('${s.name}')">
              <i class="fa-solid fa-file-invoice"></i> + GRN
              <span style="background: ${ungrnedPoCount > 0 ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.15)'}; color: #fff; padding: 1px 6px; border-radius: 10px; font-size: 10.5px; font-weight: 700;">${ungrnedPoCount}</span>
            </button>
            <button type="button" class="ant-btn-action" style="color: var(--text-muted); border-color: transparent;" title="Edit Supplier Details" onclick="window.grnManager.openEditSupplierModal('${s.code}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button type="button" class="ant-btn-action" style="color: #ff4d4f; border-color: transparent;" title="Delete Supplier" onclick="window.grnManager.deleteSupplier('${s.code}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
      container.appendChild(card);
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

    const suppliers = this.ctx.getSuppliers ? this.ctx.getSuppliers() : [];

    if (editingSupplierCode) {
      const s = suppliers.find(sup => sup.code === editingSupplierCode || sup.id === editingSupplierCode);
      if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color: #1677ff;"></i> Edit Supplier Details (${s ? (s.code || ('SUP-' + s.id)) : ""})`;
      if (saveBtn) saveBtn.innerHTML = `<i class="fa-solid fa-check"></i> Update Supplier`;

      if (nameInput) nameInput.value = s ? s.name : "";
      if (phoneInput) phoneInput.value = s ? (s.phone || s.mobile || "") : "";
      if (emailInput) emailInput.value = s ? (s.email || "") : "";
    } else {
      if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-truck-field" style="color: #1677ff;"></i> Register New Supplier / Vendor`;
      if (saveBtn) saveBtn.innerHTML = `<i class="fa-solid fa-user-check"></i> Save & Register Supplier`;

      if (nameInput) nameInput.value = "";
      if (phoneInput) phoneInput.value = "";
      if (emailInput) emailInput.value = "";
    }

    this.ctx.openModal("registerSupplierModal");
  }

  async saveNewSupplier() {
    if (this.ctx.saveNewSupplier) {
      return this.ctx.saveNewSupplier();
    }
  }

  async deleteSupplier(supplierCode) {
    let suppliers = this.ctx.getSuppliers() || [];
    const s = suppliers.find(sup => sup.code === supplierCode || sup.id === supplierCode);
    if (!s) return;

    const confirmed = confirm(`Are you sure you want to remove supplier "${s.name}"?`);
    if (!confirmed) return;

    if (this.ctx.deleteSupplier && s.id) {
      try {
        await this.ctx.deleteSupplier(s.id);
        this.populateAllSupplierDropdowns();
        this.renderSuppliersGrid();
        this.ctx.showToast(`Supplier "${s.name}" deleted successfully.`, "info");
        return;
      } catch (err) {
        this.ctx.showToast(err.message || "Failed to delete supplier", "error");
        return;
      }
    }

    suppliers = suppliers.filter(sup => sup.code !== supplierCode && sup.id !== supplierCode);
    this.ctx.setSuppliers(suppliers);
    if (this.ctx.saveSupplierData) this.ctx.saveSupplierData();
    this.populateAllSupplierDropdowns();
    this.renderSuppliersGrid();
    this.ctx.showToast(`Supplier "${s.name}" deleted successfully.`, "info");
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

