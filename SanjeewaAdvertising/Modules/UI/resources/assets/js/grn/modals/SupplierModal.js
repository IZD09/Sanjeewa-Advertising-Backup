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
    this._isSubmitting = false;

    this.bindEvents();
  }

  bindEvents() {
    const saveNewSupplierBtn = document.getElementById("saveNewSupplierBtn");
    if (saveNewSupplierBtn && !saveNewSupplierBtn._supplierBound) {
      saveNewSupplierBtn._supplierBound = true;
      saveNewSupplierBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.saveNewSupplier();
      });
    }

    // Modal open trigger buttons (bind once only)
    const bindTriggerOnce = (id, contextParam = null) => {
      const btn = document.getElementById(id);
      if (btn && !btn._supplierTriggerBound) {
        btn._supplierTriggerBound = true;
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          this.openRegisterSupplierModal(contextParam);
        });
      }
    };

    bindTriggerOnce("grnHeaderRegisterSupplierBtn");
    bindTriggerOnce("supplierToolbarCreateBtn");
    bindTriggerOnce("grnQuickAddSupplierBtn", "grn");
    bindTriggerOnce("poQuickAddSupplierBtn", "po");
  }

  openEditSupplierModal(supplierCode) {
    this.openRegisterSupplierModal(null, supplierCode);
  }

  openRegisterSupplierModal(callerContext = null, editingSupplierCode = null) {
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

    this.openModal("registerSupplierModal");
  }

  async saveNewSupplier() {
    if (this._isSubmitting) {
      return;
    }

    const name = document.getElementById("newSupName")?.value?.trim();
    const phone = document.getElementById("newSupPhone")?.value?.trim();
    const email = document.getElementById("newSupEmail")?.value?.trim() || "";

    if (!name) {
      this.showToast("Please enter the Company / Business Name", "error");
      return;
    }

    if (!phone) {
      this.showToast("Please enter a valid Mobile / Phone Number", "error");
      return;
    }

    this._isSubmitting = true;

    const saveBtn = document.getElementById("saveNewSupplierBtn");
    const originalBtnHtml = saveBtn ? saveBtn.innerHTML : "";
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.style.pointerEvents = "none";
      saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;
    }

    try {
      let suppliers = this.ctx.getSuppliers ? this.ctx.getSuppliers() : [];

      if (this.editingSupplierCode) {
        const existing = suppliers.find(sup => sup.code === this.editingSupplierCode || sup.id === this.editingSupplierCode);
        const supplierId = existing ? existing.id : (this.editingSupplierCode.toString().replace(/\D+/g, "") || null);

        if (this.ctx.updateSupplier && supplierId) {
          await this.ctx.updateSupplier(supplierId, { name, mobile: phone, email: email || null });
        } else {
          const existingIdx = suppliers.findIndex(sup => sup.code === this.editingSupplierCode || sup.id === this.editingSupplierCode);
          if (existingIdx !== -1) {
            suppliers[existingIdx] = {
              ...suppliers[existingIdx],
              name: name,
              contact_person: name,
              phone: phone,
              mobile: phone,
              email: email
            };
            if (this.ctx.setSuppliers) this.ctx.setSuppliers(suppliers);
          }
        }

        if (this.ctx.populateAllSupplierDropdowns) this.ctx.populateAllSupplierDropdowns();
        if (this.ctx.renderSuppliersGrid) this.ctx.renderSuppliersGrid();

        this.closeModal("registerSupplierModal");
        this.showToast(`Supplier "${name}" updated successfully!`, "success");
        this.editingSupplierCode = null;
        return;
      }

      // Create new supplier in database
      if (this.ctx.createSupplier) {
        await this.ctx.createSupplier({ name, mobile: phone, email: email || null });
      } else {
        const fallbackId = Date.now();
        const newSupplier = {
          id: fallbackId,
          code: `SUP-${fallbackId}`,
          name: name,
          contact_person: name,
          phone: phone,
          mobile: phone,
          email: email,
          status: "Active"
        };
        suppliers.unshift(newSupplier);
        if (this.ctx.setSuppliers) this.ctx.setSuppliers(suppliers);
      }

      if (this.ctx.populateAllSupplierDropdowns) this.ctx.populateAllSupplierDropdowns();
      if (this.ctx.renderSuppliersGrid) this.ctx.renderSuppliersGrid();

      this.closeModal("registerSupplierModal");

      if (this.supplierCallerContext === "grn") {
        const grnSup = document.getElementById("grnFormSupplier");
        const grnContact = document.getElementById("grnFormContact");
        if (grnSup) grnSup.value = name;
        if (grnContact) grnContact.value = phone;
        this.showToast(`Supplier "${name}" registered and selected in GRN!`, "success");
      } else if (this.supplierCallerContext === "po") {
        const poSup = document.getElementById("newPoSupplier");
        const poContact = document.getElementById("newPoContact");
        if (poSup) {
          poSup.value = name;
          poSup.dispatchEvent(new Event("change"));
        }
        if (poContact) poContact.value = phone;
        this.showToast(`Supplier "${name}" registered and selected in Purchase Order!`, "success");
      } else {
        this.showToast(`Supplier "${name}" registered successfully!`, "success");
        if (this.ctx.switchView) {
          this.ctx.switchView("suppliers");
        }
      }
    } catch (error) {
      console.error("[SupplierModal] Error saving supplier to database:", error);
      this.showToast(error.message || "Failed to save supplier to database", "error");
    } finally {
      this._isSubmitting = false;
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.style.pointerEvents = "";
        saveBtn.innerHTML = originalBtnHtml;
      }
    }
  }
}

