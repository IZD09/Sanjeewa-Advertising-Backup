/**
 * SanjeewaAdvertising - Brand Process
 *
 * Handles client-side validation and HTTP operations for Brands:
 * - Adding a new Brand (POST /api/v1/inventory/brands)
 * - Updating an existing Brand (PUT /api/v1/inventory/brands/{id})
 * - Form validation with FormValidator and ValidatBuilder
 */

import { RequestHandler } from "../../core/RequestHandler.js";
import { FormValidator } from "../../core/FormValidator.js";

export class BrandProcess {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.showToast]
   * @param {Function} [options.onSuccess]
   */
  constructor(options = {}) {
    this.http = new RequestHandler();
    this.showToast = options.showToast || (() => {});
    this.onSuccess = options.onSuccess || (() => {});
    this.activeEditBrand = null;
  }

  bindEvents() {
    const toggleBtn = document.getElementById("brandToggleNewBtn");
    const cancelBtn1 = document.getElementById("brandCancelFormBtn");
    const cancelBtn2 = document.getElementById("brandCancelFormBtn2");
    const saveBtn = document.getElementById("brandSaveBtn");
    const input = document.getElementById("brandFormInput");

    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => this.openAddForm());
    }
    if (cancelBtn1) {
      cancelBtn1.addEventListener("click", () => this.closeForm());
    }
    if (cancelBtn2) {
      cancelBtn2.addEventListener("click", () => this.closeForm());
    }
    if (saveBtn) {
      saveBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await this.submit();
      });
    }
    if (input) {
      input.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          await this.submit();
        }
      });
    }
  }

  openAddForm() {
    this.activeEditBrand = null;
    const box = document.getElementById("brandFormBox");
    const titleEl = document.getElementById("brandFormTitle");
    const saveBtn = document.getElementById("brandSaveBtn");
    const input = document.getElementById("brandFormInput");

    if (titleEl) {
      titleEl.innerHTML = '<i class="fa-solid fa-circle-plus" style="color: #1677ff;"></i> Register New Brand';
    }
    if (saveBtn) {
      saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save Brand';
    }
    if (input) {
      input.value = "";
      FormValidator.markField(input.closest(".po-field"), input, false);
    }
    if (box) box.style.display = "block";
    if (input) input.focus();
  }

  openEditForm(brand) {
    if (!brand) return;
    this.activeEditBrand = brand;

    const box = document.getElementById("brandFormBox");
    const titleEl = document.getElementById("brandFormTitle");
    const saveBtn = document.getElementById("brandSaveBtn");
    const input = document.getElementById("brandFormInput");

    if (titleEl) {
      titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color: #faad14;"></i> Edit Brand: ${brand.brand || ""}`;
    }
    if (saveBtn) {
      saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Update Brand';
    }
    if (input) {
      input.value = brand.brand || "";
      FormValidator.markField(input.closest(".po-field"), input, false);
    }
    if (box) box.style.display = "block";
    if (input) input.focus();
  }

  closeForm() {
    const box = document.getElementById("brandFormBox");
    if (box) box.style.display = "none";
    this.activeEditBrand = null;
  }

  validate(brandName) {
    const trimmed = String(brandName || "").trim();
    if (!FormValidator.isRequired(trimmed)) {
      return { isValid: false, message: "Brand name is required." };
    }
    if (trimmed.length < 2 || trimmed.length > 50) {
      return { isValid: false, message: "Brand name must be 2 to 50 characters." };
    }
    return { isValid: true, message: "" };
  }

  async submit() {
    const input = document.getElementById("brandFormInput");
    const saveBtn = document.getElementById("brandSaveBtn");
    const brandName = input ? input.value.trim() : "";

    const val = this.validate(brandName);
    if (!val.isValid) {
      if (input) {
        FormValidator.markField(input.closest(".po-field"), input, true, val.message);
        input.focus();
      }
      this.showToast(val.message, "error");
      return;
    }

    const originalHtml = saveBtn ? saveBtn.innerHTML : "";
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }

    try {
      let response = null;
      const isEdit = Boolean(this.activeEditBrand && this.activeEditBrand.id);

      if (isEdit) {
        response = await this.http.put(`/api/v1/inventory/brands/${this.activeEditBrand.id}`, {
          brand: brandName,
        });
      } else {
        response = await this.http.post("/api/v1/inventory/brands", {
          brand: brandName,
        });
      }

      if (!response || response.success === false) {
        throw new Error((response && response.message) || "Failed to save brand.");
      }

      const actionText = isEdit ? "updated" : "created";
      this.showToast(`Brand "${brandName}" ${actionText} successfully!`, "success");
      this.closeForm();
      await this.onSuccess(response.data || response);
    } catch (err) {
      const errorMsg =
        err?.data?.message ||
        (err?.data?.errors ? Object.values(err.data.errors).flat().join(" ") : null) ||
        err?.message ||
        "Could not save brand.";
      this.showToast(errorMsg, "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalHtml;
      }
    }
  }
}

export default BrandProcess;
