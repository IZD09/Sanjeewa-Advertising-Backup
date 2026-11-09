/**
 * SanjeewaAdvertising - Add Category Process
 *
 * Handles the workflow for creating a new Material Category:
 * - Client-side validation before sending the HTTP request (using Core FormValidator & ValidatBuilder)
 * - HTTP POST request via Core RequestHandler to the Inventory module API (/api/v1/inventory/categories)
 * - Inline form toggle, loading state management, and UI refresh callbacks
 */

import { RequestHandler } from "../../core/RequestHandler.js";
import { FormValidator } from "../../core/FormValidator.js";
import { ValidatBuilder } from "../../core/ValidatBuilder.js";

export class AddCategoryProcess {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.getExistingCategories] - Returns current category list for duplicate check
   * @param {Function} [options.onCategoryCreated] - Callback invoked with created category record
   * @param {Function} [options.showToast] - Notification helper
   */
  constructor(options = {}) {
    this.http = new RequestHandler();
    this.getExistingCategories = options.getExistingCategories || (() => []);
    this.onCategoryCreated = options.onCategoryCreated || (() => {});
    this.showToast = options.showToast || (() => {});
  }

  /**
   * Bind DOM events for the Add Category inline form.
   */
  bindEvents() {
    const toggleBtn = document.getElementById("catToggleNewCategoryBtn");
    const cancelBtn1 = document.getElementById("catCancelNewCategoryBtn");
    const cancelBtn2 = document.getElementById("catCancelNewCategoryBtn2");
    const saveBtn = document.getElementById("catSaveCategoryBtn");
    const input = document.getElementById("newCategoryInput");

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
    if (input) {
      input.addEventListener("input", () => {
        FormValidator.markField(input.closest(".po-field"), input, false);
      });
      input.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          await this.submit();
        }
      });
    }
  }

  /**
   * Toggle visibility of the inline Add Category form.
   */
  toggleForm() {
    const box = document.getElementById("catNewCategoryBox");
    const input = document.getElementById("newCategoryInput");
    if (!box) {
      return;
    }

    const isVisible = box.style.display !== "none";
    if (isVisible) {
      this.closeForm();
    } else {
      box.style.display = "block";
      if (input) {
        input.focus();
      }
    }
  }

  /**
   * Hide and reset the inline Add Category form.
   */
  closeForm() {
    const box = document.getElementById("catNewCategoryBox");
    const input = document.getElementById("newCategoryInput");
    if (box) {
      box.style.display = "none";
    }
    if (input) {
      input.value = "";
      FormValidator.markField(input.closest(".po-field"), input, false);
    }
  }

  /**
   * Validate category name before dispatching HTTP request.
   * @param {string} categoryName
   * @returns {{ isValid: boolean, message: string }}
   */
  validate(categoryName) {
    const trimmed = String(categoryName || "").trim();

    if (!FormValidator.isRequired(trimmed)) {
      return {
        isValid: false,
        message: "Category name is required."
      };
    }

    if (trimmed.length < 2) {
      return {
        isValid: false,
        message: "Category name must be at least 2 characters."
      };
    }

    if (trimmed.length > 50) {
      return {
        isValid: false,
        message: "Category name must not exceed 50 characters."
      };
    }

    // Core ValidatBuilder text length check
    const validator = new ValidatBuilder()
      .addTextValidator(trimmed, "Category name", 50, 2)
      .validate();

    if (validator.getStatus()) {
      return {
        isValid: false,
        message: validator.getMessage() || "Invalid category name."
      };
    }

    // Duplicate check against loaded categories
    const existing = this.getExistingCategories();
    if (Array.isArray(existing)) {
      const duplicate = existing.some(
        (c) => String(c.category || "").trim().toLowerCase() === trimmed.toLowerCase()
      );
      if (duplicate) {
        return {
          isValid: false,
          message: `Category "${trimmed}" already exists.`
        };
      }
    }

    return {
      isValid: true,
      message: ""
    };
  }

  /**
   * Validate and submit new category creation request via Core RequestHandler.
   */
  async submit() {
    const input = document.getElementById("newCategoryInput");
    const saveBtn = document.getElementById("catSaveCategoryBtn");
    const categoryName = input ? input.value.trim() : "";

    const validation = this.validate(categoryName);
    if (!validation.isValid) {
      if (input) {
        FormValidator.markField(input.closest(".po-field"), input, true, validation.message);
        input.focus();
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
      const response = await this.http.post("/api/v1/inventory/categories", {
        category: categoryName
      });

      if (!response || response.success === false) {
        throw new Error((response && response.message) || "Failed to create category.");
      }

      const createdCategory = response.data || response;
      this.showToast(`Category "${categoryName}" added successfully!`, "success");
      this.closeForm();

      await this.onCategoryCreated(createdCategory);
    } catch (err) {
      const errorMsg =
        err?.data?.message ||
        (err?.data?.errors ? Object.values(err.data.errors).flat().join(" ") : null) ||
        err?.message ||
        "Could not create category.";
      if (input) {
        FormValidator.markField(input.closest(".po-field"), input, true, errorMsg);
      }
      this.showToast(errorMsg, "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalHtml || '<i class="fa-solid fa-check"></i> Save';
      }
    }
  }
}

export default AddCategoryProcess;
