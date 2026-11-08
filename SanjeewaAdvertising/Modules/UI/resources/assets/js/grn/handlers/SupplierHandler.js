/**
 * SanjeewaAdvertising - Supplier Handler
 *
 * Manages suppliers directory cards, supplier registration & edit modal,
 * filtering, dropdown population, and supplier deletion.
 */

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

    // 3. Count badge
    const badge = document.getElementById("grnSupplierCountBadge");
    if (badge) badge.textContent = suppliers.length;
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
        (s.phone && s.phone.includes(this.supplierSearchTerm)) ||
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

    pageItems.forEach(s => {
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
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span class="supplier-category-pill">${s.category || "General Printing Media"}</span>
            <span class="supplier-terms-badge">${s.payment_terms || "COD"}</span>
          </div>

          <div class="supplier-card-footer">
            <button type="button" class="ant-btn ant-btn-default" style="font-size: 11.5px; height: 30px; padding: 0 10px;" title="Create Purchase Order for this Supplier" onclick="window.grnManager.openCreatePOModal('${s.name}')">
              <i class="fa-solid fa-cart-arrow-down" style="color: #1677ff;"></i> + PO
            </button>
            <button type="button" class="ant-btn ant-btn-primary" style="font-size: 11.5px; height: 30px; padding: 0 10px;" title="Create GRN for this Supplier" onclick="window.grnManager.createGrnForSupplier('${s.name}')">
              <i class="fa-solid fa-file-invoice"></i> + GRN
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
    if (!infoElem || !controlsElem) return;

    if (totalCount === 0) {
      infoElem.textContent = "Showing 0 records";
      controlsElem.innerHTML = "";
      return;
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
    this.openRegisterSupplierModal(null, supplierCode);
  }

  openRegisterSupplierModal(callerContext = null, editingSupplierCode = null) {
    this.supplierCallerContext = callerContext;
    this.editingSupplierCode = editingSupplierCode;

    const modalTitle = document.getElementById("registerSupplierModalTitle");
    const saveBtn = document.getElementById("saveNewSupplierBtn");

    const codeInput = document.getElementById("newSupCode");
    const nameInput = document.getElementById("newSupName");
    const personInput = document.getElementById("newSupPerson");
    const phoneInput = document.getElementById("newSupPhone");
    const altPhoneInput = document.getElementById("newSupAltPhone");
    const emailInput = document.getElementById("newSupEmail");
    const categoryInput = document.getElementById("newSupCategory");
    const termsInput = document.getElementById("newSupTerms");
    const addressInput = document.getElementById("newSupAddress");
    const taxNoInput = document.getElementById("newSupTaxNo");
    const bankInput = document.getElementById("newSupBank");

    const suppliers = this.ctx.getSuppliers() || [];

    if (editingSupplierCode) {
      const s = suppliers.find(sup => sup.code === editingSupplierCode);
      if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color: #1677ff;"></i> Edit Supplier Details (${s ? s.code : ""})`;
      if (saveBtn) saveBtn.innerHTML = `<i class="fa-solid fa-check"></i> Update Supplier`;

      if (codeInput) codeInput.value = s ? s.code : "";
      if (nameInput) nameInput.value = s ? s.name : "";
      if (personInput) personInput.value = s ? s.contact_person : "";
      if (phoneInput) phoneInput.value = s ? s.phone : "";
      if (altPhoneInput) altPhoneInput.value = s ? (s.alt_phone || "") : "";
      if (emailInput) emailInput.value = s ? (s.email || "") : "";
      if (categoryInput) categoryInput.value = s ? (s.category || "Paper & Boards") : "Paper & Boards";
      if (termsInput) termsInput.value = s ? (s.payment_terms || "30 Days Credit") : "30 Days Credit";
      if (addressInput) addressInput.value = s ? (s.address || "") : "";
      if (taxNoInput) taxNoInput.value = s ? (s.tax_no || "") : "";
      if (bankInput) bankInput.value = s ? (s.bank_details || "") : "";
    } else {
      if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-truck-field" style="color: #1677ff;"></i> Register New Supplier / Vendor`;
      if (saveBtn) saveBtn.innerHTML = `<i class="fa-solid fa-user-check"></i> Save & Register Supplier`;

      if (codeInput) codeInput.value = this.ctx.generateNextSupplierCode();
      if (nameInput) nameInput.value = "";
      if (personInput) personInput.value = "";
      if (phoneInput) phoneInput.value = "";
      if (altPhoneInput) altPhoneInput.value = "";
      if (emailInput) emailInput.value = "";
      if (categoryInput) categoryInput.value = "Paper & Boards";
      if (termsInput) termsInput.value = "30 Days Credit";
      if (addressInput) addressInput.value = "";
      if (taxNoInput) taxNoInput.value = "";
      if (bankInput) bankInput.value = "";
    }

    this.ctx.openModal("registerSupplierModal");
  }

  saveNewSupplier() {
    const code = document.getElementById("newSupCode")?.value || this.ctx.generateNextSupplierCode();
    const name = document.getElementById("newSupName")?.value?.trim();
    const person = document.getElementById("newSupPerson")?.value?.trim() || "";
    const phone = document.getElementById("newSupPhone")?.value?.trim();
    const altPhone = document.getElementById("newSupAltPhone")?.value?.trim() || "";
    const email = document.getElementById("newSupEmail")?.value?.trim() || "";
    const category = document.getElementById("newSupCategory")?.value || "Paper & Boards";
    const terms = document.getElementById("newSupTerms")?.value || "30 Days Credit";
    const address = document.getElementById("newSupAddress")?.value?.trim() || "";
    const taxNo = document.getElementById("newSupTaxNo")?.value?.trim() || "";
    const bank = document.getElementById("newSupBank")?.value?.trim() || "";

    if (!name) {
      this.ctx.showToast("Please enter the Company / Supplier Name", "error");
      return;
    }

    if (!phone) {
      this.ctx.showToast("Please enter a valid Phone / Mobile Number", "error");
      return;
    }

    let suppliers = this.ctx.getSuppliers() || [];

    if (this.editingSupplierCode) {
      const existingIdx = suppliers.findIndex(sup => sup.code === this.editingSupplierCode);
      if (existingIdx !== -1) {
        suppliers[existingIdx] = {
          ...suppliers[existingIdx],
          name: name,
          contact_person: person || name,
          phone: phone,
          alt_phone: altPhone,
          email: email,
          category: category,
          payment_terms: terms,
          address: address,
          tax_no: taxNo,
          bank_details: bank
        };
        this.ctx.setSuppliers(suppliers);
        this.ctx.saveSupplierData();
        this.populateAllSupplierDropdowns();
        this.renderSuppliersGrid();
        this.ctx.closeModal("registerSupplierModal");
        this.ctx.showToast(`Supplier "${name}" updated successfully!`, "success");
        this.editingSupplierCode = null;
        return;
      }
    }

    const newSupplier = {
      code: code,
      name: name,
      contact_person: person || name,
      phone: phone,
      alt_phone: altPhone,
      email: email,
      category: category,
      payment_terms: terms,
      address: address,
      tax_no: taxNo,
      bank_details: bank,
      status: "Active",
      created_at: new Date().toISOString().split("T")[0]
    };

    suppliers.unshift(newSupplier);
    this.ctx.setSuppliers(suppliers);
    this.ctx.saveSupplierData();
    this.populateAllSupplierDropdowns();
    this.renderSuppliersGrid();

    this.ctx.closeModal("registerSupplierModal");

    if (this.supplierCallerContext === "grn") {
      const grnSup = document.getElementById("grnFormSupplier");
      const grnContact = document.getElementById("grnFormContact");
      if (grnSup) grnSup.value = newSupplier.name;
      if (grnContact) grnContact.value = newSupplier.phone;
      this.ctx.showToast(`Supplier "${newSupplier.name}" registered and selected in GRN!`, "success");
    } else if (this.supplierCallerContext === "po") {
      const poSup = document.getElementById("newPoSupplier");
      const poContact = document.getElementById("newPoContact");
      if (poSup) poSup.value = newSupplier.name;
      if (poContact) poContact.value = newSupplier.phone;
      this.ctx.showToast(`Supplier "${newSupplier.name}" registered and selected in Purchase Order!`, "success");
    } else {
      this.ctx.showToast(`Supplier "${newSupplier.name}" registered successfully!`, "success");
      this.ctx.switchView("suppliers");
    }
  }

  createGrnForSupplier(supplierName) {
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

  deleteSupplier(supplierCode) {
    let suppliers = this.ctx.getSuppliers() || [];
    const s = suppliers.find(sup => sup.code === supplierCode);
    if (!s) return;

    const confirmed = confirm(`Are you sure you want to remove supplier "${s.name}"?`);
    if (!confirmed) return;

    suppliers = suppliers.filter(sup => sup.code !== supplierCode);
    this.ctx.setSuppliers(suppliers);
    this.ctx.saveSupplierData();
    this.populateAllSupplierDropdowns();
    this.renderSuppliersGrid();
    this.ctx.showToast(`Supplier "${s.name}" deleted successfully.`, "info");
  }
}

export default SupplierHandler;

