/**
 * SanjeewaAdvertising - Supplier Modal
 *
 * Manages Supplier Registration and Edit Modal dialog (#registerSupplierModal),
 * form inputs population, and saving new/updated supplier details.
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class SupplierModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getSuppliers
   * @param {Function} context.setSuppliers
   * @param {Function} context.saveSupplierData
   * @param {Function} context.generateNextSupplierCode
   * @param {Function} [context.populateAllSupplierDropdowns]
   * @param {Function} [context.renderSuppliersGrid]
   * @param {Function} [context.switchView]
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
    this.supplierCallerContext = null;
    this.editingSupplierCode = null;

    this.bindEvents();
  }

  bindEvents() {
    const saveNewSupplierBtn = document.getElementById("saveNewSupplierBtn");
    if (saveNewSupplierBtn) {
      saveNewSupplierBtn.addEventListener("click", () => this.saveNewSupplier());
    }

    // Modal open trigger buttons
    const headerRegisterSupplierBtn = document.getElementById("grnHeaderRegisterSupplierBtn");
    if (headerRegisterSupplierBtn) {
      headerRegisterSupplierBtn.addEventListener("click", () => this.openRegisterSupplierModal());
    }

    const supplierToolbarCreateBtn = document.getElementById("supplierToolbarCreateBtn");
    if (supplierToolbarCreateBtn) {
      supplierToolbarCreateBtn.addEventListener("click", () => this.openRegisterSupplierModal());
    }

    const grnQuickAddSupplierBtn = document.getElementById("grnQuickAddSupplierBtn");
    if (grnQuickAddSupplierBtn) {
      grnQuickAddSupplierBtn.addEventListener("click", () => this.openRegisterSupplierModal("grn"));
    }

    const poQuickAddSupplierBtn = document.getElementById("poQuickAddSupplierBtn");
    if (poQuickAddSupplierBtn) {
      poQuickAddSupplierBtn.addEventListener("click", () => this.openRegisterSupplierModal("po"));
    }
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

    const suppliers = this.ctx.getSuppliers ? this.ctx.getSuppliers() : [];

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

      if (codeInput) codeInput.value = this.ctx.generateNextSupplierCode ? this.ctx.generateNextSupplierCode() : "";
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

    this.openModal("registerSupplierModal");
  }

  saveNewSupplier() {
    const code = document.getElementById("newSupCode")?.value || (this.ctx.generateNextSupplierCode ? this.ctx.generateNextSupplierCode() : "");
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
      this.showToast("Please enter the Company / Supplier Name", "error");
      return;
    }

    if (!phone) {
      this.showToast("Please enter a valid Phone / Mobile Number", "error");
      return;
    }

    let suppliers = this.ctx.getSuppliers ? this.ctx.getSuppliers() : [];

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
        if (this.ctx.setSuppliers) this.ctx.setSuppliers(suppliers);
        if (this.ctx.saveSupplierData) this.ctx.saveSupplierData();
        if (this.ctx.populateAllSupplierDropdowns) this.ctx.populateAllSupplierDropdowns();
        if (this.ctx.renderSuppliersGrid) this.ctx.renderSuppliersGrid();

        this.closeModal("registerSupplierModal");
        this.showToast(`Supplier "${name}" updated successfully!`, "success");
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
    if (this.ctx.setSuppliers) this.ctx.setSuppliers(suppliers);
    if (this.ctx.saveSupplierData) this.ctx.saveSupplierData();
    if (this.ctx.populateAllSupplierDropdowns) this.ctx.populateAllSupplierDropdowns();
    if (this.ctx.renderSuppliersGrid) this.ctx.renderSuppliersGrid();

    this.closeModal("registerSupplierModal");

    if (this.supplierCallerContext === "grn") {
      const grnSup = document.getElementById("grnFormSupplier");
      const grnContact = document.getElementById("grnFormContact");
      if (grnSup) grnSup.value = newSupplier.name;
      if (grnContact) grnContact.value = newSupplier.phone;
      this.showToast(`Supplier "${newSupplier.name}" registered and selected in GRN!`, "success");
    } else if (this.supplierCallerContext === "po") {
      const poSup = document.getElementById("newPoSupplier");
      const poContact = document.getElementById("newPoContact");
      if (poSup) poSup.value = newSupplier.name;
      if (poContact) poContact.value = newSupplier.phone;
      this.showToast(`Supplier "${newSupplier.name}" registered and selected in Purchase Order!`, "success");
    } else {
      this.showToast(`Supplier "${newSupplier.name}" registered successfully!`, "success");
      if (this.ctx.switchView) {
        this.ctx.switchView("suppliers");
      }
    }
  }
}

