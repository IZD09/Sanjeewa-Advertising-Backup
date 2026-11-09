/**
 * SanjeewaAdvertising - Add Subcategory Process
 *
 * Handles the workflow for creating a new Material Subcategory:
 * - Client-side validation before sending the HTTP request (using Core FormValidator & ValidatBuilder)
 * - HTTP POST request via Core RequestHandler to the Inventory module API (/api/v1/inventory/subcategories)
 * - Inline form toggle, loading state management, and UI refresh callbacks
 */

import { RequestHandler } from "../../core/RequestHandler.js";
import { FormValidator } from "../../core/FormValidator.js";
import { ValidatBuilder } from "../../core/ValidatBuilder.js";

export class AddSubcategoryProcess {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.getExistingSubcategories] - Returns current subcategory list for duplicate check
   * @param {Function} [options.onSubcategoryCreated] - Callback invoked with created subcategory record
   * @param {Function} [options.showToast] - Notification helper
   */
  constructor(options = {}) {
    this.http = new RequestHandler();
    this.getExistingSubcategories = options.getExistingSubcategories || (() => []);
    this.onSubcategoryCreated = options.onSubcategoryCreated || (() => {});
    this.showToast = options.showToast || (() => {});
  }

  /**
   * Bind DOM events for the Add Subcategory inline form.
   */
  bindEvents() {
    const toggleBtn = document.getElementById("subcatToggleNewBtn");
    const cancelBtn1 = document.getElementById("subcatCancelNewBtn");
    const cancelBtn2 = document.getElementById("subcatCancelNewBtn2");
    const saveBtn = document.getElementById("subcatSaveBtn");
    const categorySelect = document.getElementById("newSubcatCategorySelect");
    const nameInput = document.getElementById("newSubcatNameInput");

    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => this.toggleForm());
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
    if (categorySelect) {
      categorySelect.addEventListener("change", () => {
        FormValidator.markField(categorySelect.closest(".po-field"), categorySelect, false);
      });
    }
    if (nameInput) {
      nameInput.addEventListener("input", () => {
        FormValidator.markField(nameInput.closest(".po-field"), nameInput, false);
      });
      nameInput.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          await this.submit();
        }
      });
    }
  }

  /**
   * Toggle visibility of the inline Add Subcategory form.
   */
  toggleForm() {
    const box = document.getElementById("subcatNewBox");
    const nameInput = document.getElementById("newSubcatNameInput");
    if (!box) {
      return;
    }

    const isVisible = box.style.display !== "none";
    if (isVisible) {
      this.closeForm();
    } else {
      box.style.display = "block";
      if (nameInput) {
        nameInput.focus();
      }
    }
  }

  /**
   * Hide and reset the inline Add Subcategory form.
   */
  closeForm() {
    const box = document.getElementById("subcatNewBox");
    const nameInput = document.getElementById("newSubcatNameInput");
    const categorySelect = document.getElementById("newSubcatCategorySelect");

    if (box) {
      box.style.display = "none";
    }
    if (nameInput) {
      nameInput.value = "";
      FormValidator.markField(nameInput.closest(".po-field"), nameInput, false);
    }
    if (categorySelect) {
      FormValidator.markField(categorySelect.closest(".po-field"), categorySelect, false);
    }
  }

  /**
   * Validate parent category ID and subcategory name before dispatching HTTP request.
   * @param {string|number} categoryId
   * @param {string} subcategoryName
   * @returns {{ isValid: boolean, field?: string, message: string }}
   */
  validate(categoryId, subcategoryName) {
    const parsedCatId = parseInt(String(categoryId || ""), 10);
    if (!FormValidator.isRequired(categoryId) || Number.isNaN(parsedCatId) || parsedCatId <= 0) {
      return {
        isValid: false,
        field: "category",
        message: "Please select a parent category."
      };
    }

    const trimmedName = String(subcategoryName || "").trim();
    if (!FormValidator.isRequired(trimmedName)) {
      return {
        isValid: false,
        field: "subcategory",
        message: "Subcategory name is required."
      };
    }

    if (trimmedName.length < 2) {
      return {
        isValid: false,
        field: "subcategory",
        message: "Subcategory name must be at least 2 characters."
      };
    }

    if (trimmedName.length > 50) {
      return {
        isValid: false,
        field: "subcategory",
        message: "Subcategory name must not exceed 50 characters."
      };
    }

    // Core ValidatBuilder text length check
    const validator = new ValidatBuilder()
      .addTextValidator(trimmedName, "Subcategory name", 50, 2)
      .validate();

    if (validator.getStatus()) {
      return {
        isValid: false,
        field: "subcategory",
        message: validator.getMessage() || "Invalid subcategory name."
      };
    }

    // Duplicate check against loaded subcategories
    const existing = this.getExistingSubcategories();
    if (Array.isArray(existing)) {
      const duplicate = existing.some(
        (s) => String(s.subcategory || "").trim().toLowerCase() === trimmedName.toLowerCase()
      );
      if (duplicate) {
        return {
          isValid: false,
          field: "subcategory",
          message: `Subcategory "${trimmedName}" already exists.`
        };
      }
    }

    return {
      isValid: true,
      message: ""
    };
  }

  /**
   * Validate and submit new subcategory creation request via Core RequestHandler.
   */
  async submit() {
    const categorySelect = document.getElementById("newSubcatCategorySelect");
    const nameInput = document.getElementById("newSubcatNameInput");
    const saveBtn = document.getElementById("subcatSaveBtn");

    const categoryId = categorySelect ? categorySelect.value : "";
    const subcategoryName = nameInput ? nameInput.value.trim() : "";

    const validation = this.validate(categoryId, subcategoryName);
    if (!validation.isValid) {
      if (validation.field === "category" && categorySelect) {
        FormValidator.markField(categorySelect.closest(".po-field"), categorySelect, true, validation.message);
        categorySelect.focus();
      } else if (nameInput) {
        FormValidator.markField(nameInput.closest(".po-field"), nameInput, true, validation.message);
        nameInput.focus();
      }
      this.showToast(validation.message, "error");
      return;
    }

    const originalHtml = saveBtn ? saveBtn.innerHTML : "";
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }

    try {
      const response = await this.http.post("/api/v1/inventory/subcategories", {
        categories_id: parseInt(categoryId, 10),
        subcategory: subcategoryName
      });

      if (!response || response.success === false) {
        throw new Error((response && response.message) || "Failed to create subcategory.");
      }

      const createdSubcategory = response.data || response;
      this.showToast(`Subcategory "${subcategoryName}" added successfully!`, "success");
      this.closeForm();

      await this.onSubcategoryCreated(createdSubcategory);
    } catch (err) {
      const errorMsg =
        err?.data?.message ||
        (err?.data?.errors ? Object.values(err.data.errors).flat().join(" ") : null) ||
        err?.message ||
        "Could not create subcategory.";
      if (nameInput) {
        FormValidator.markField(nameInput.closest(".po-field"), nameInput, true, errorMsg);
      }
      this.showToast(errorMsg, "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalHtml || '<i class="fa-solid fa-check"></i> Save Subcategory';
      }
    }
  }
}

export default AddSubcategoryProcess;
