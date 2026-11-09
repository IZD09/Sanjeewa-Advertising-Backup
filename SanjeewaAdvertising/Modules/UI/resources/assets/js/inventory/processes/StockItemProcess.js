/**
 * SanjeewaAdvertising - Stock Item Process
 *
 * Handles client-side validation, category cascading, brand modal selection,
 * and HTTP operations for Stock Items:
 * - Cascading Category -> Subcategory dropdown (disabled until category is chosen)
 * - System-generated SKU / Item Code (no manual input needed)
 * - Required Associated Brands modal selection (at least 1 brand required)
 * - Adding a new Stock Item (POST /api/v1/inventory/stock-items)
 * - Updating an existing Stock Item (PUT /api/v1/inventory/stock-items/{id})
 */

import { RequestHandler } from "../../core/RequestHandler.js";
import { FormValidator } from "../../core/FormValidator.js";

export class StockItemProcess {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.showToast]
   * @param {Function} [options.onSuccess]
   */
  constructor(options = {}) {
    this.http = new RequestHandler();
    this.showToast = options.showToast || ((msg, type) => console.log(`[Toast ${type}]: ${msg}`));
    this.onSuccess = options.onSuccess || (() => {});

    this.activeEditItem = null;
    this.categories = [];
    this.brands = [];
    this.selectedBrandIds = new Set();
    this.modalTempSelectedIds = new Set();
  }

  /**
   * Set available master categories and brands for forms and modals.
   *
   * @param {Array} categories
   * @param {Array} brands
   */
  setMasterData(categories = [], brands = []) {
    this.categories = Array.isArray(categories) ? categories : [];
    this.brands = Array.isArray(brands) ? brands : [];
    this.populateCategoryDropdown();
  }

  bindEvents() {
    const toggleBtn = document.getElementById("itemToggleNewBtn");
    const cancelBtn1 = document.getElementById("itemCancelFormBtn");
    const cancelBtn2 = document.getElementById("itemCancelFormBtn2");
    const saveBtn = document.getElementById("itemSaveBtn");

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

    // Cascading Category -> Subcategory
    const catSelect = document.getElementById("itemFormCategorySelect");
    if (catSelect) {
      catSelect.addEventListener("change", (e) => {
        this.onCategoryChange(e.target.value);
      });
    }

    // Brand Selection Modal Triggers
    const openBrandModalBtn = document.getElementById("itemOpenBrandSelectModalBtn");
    const closeBrandModalBtn = document.getElementById("closeSelectBrandsModalBtn");
    const cancelBrandModalBtn = document.getElementById("modalBrandCancelBtn");
    const confirmBrandModalBtn = document.getElementById("modalBrandConfirmBtn");
    const selectAllBrandsBtn = document.getElementById("modalBrandSelectAll");
    const clearAllBrandsBtn = document.getElementById("modalBrandClearAll");
    const searchModalBrandsInput = document.getElementById("modalBrandSearchInput");

    if (openBrandModalBtn) {
      openBrandModalBtn.addEventListener("click", () => this.openBrandSelectionModal());
    }
    if (closeBrandModalBtn) {
      closeBrandModalBtn.addEventListener("click", () => this.closeBrandSelectionModal());
    }
    if (cancelBrandModalBtn) {
      cancelBrandModalBtn.addEventListener("click", () => this.closeBrandSelectionModal());
    }
    if (confirmBrandModalBtn) {
      confirmBrandModalBtn.addEventListener("click", () => this.confirmBrandSelection());
    }
    if (selectAllBrandsBtn) {
      selectAllBrandsBtn.addEventListener("click", () => this.modalSelectAllBrands(true));
    }
    if (clearAllBrandsBtn) {
      clearAllBrandsBtn.addEventListener("click", () => this.modalSelectAllBrands(false));
    }
    if (searchModalBrandsInput) {
      searchModalBrandsInput.addEventListener("input", (e) => {
        this.filterModalBrands(e.target.value);
      });
    }

    const brandModal = document.getElementById("selectBrandsModal");
    if (brandModal) {
      brandModal.addEventListener("click", (e) => {
        if (e.target === brandModal) {
          this.closeBrandSelectionModal();
        }
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const m = document.getElementById("selectBrandsModal");
        if (m && m.classList.contains("open")) {
          this.closeBrandSelectionModal();
        }
      }
    });
  }

  /**
   * Populate Category select element.
   */
  populateCategoryDropdown() {
    const catSelect = document.getElementById("itemFormCategorySelect");
    if (!catSelect) return;

    const currentVal = catSelect.value;
    catSelect.innerHTML = '<option value="">-- Select Category --</option>';

    this.categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = String(cat.id);
      opt.textContent = cat.category;
      catSelect.appendChild(opt);
    });

    if (currentVal) catSelect.value = currentVal;
  }

  /**
   * Cascading Category selection handler:
   * Enables or disables Subcategory dropdown and populates matching subcategories.
   *
   * @param {string|number} categoryId
   * @param {string|number|null} [preselectedSubcatId=null]
   */
  onCategoryChange(categoryId, preselectedSubcatId = null) {
    const subcatSelect = document.getElementById("itemFormSubcatSelect");
    if (!subcatSelect) return;

    if (!categoryId) {
      subcatSelect.disabled = true;
      subcatSelect.innerHTML = '<option value="">-- Select Category First --</option>';
      FormValidator.markField(subcatSelect.closest(".po-field"), subcatSelect, false);
      return;
    }

    const selectedCat = this.categories.find((c) => String(c.id) === String(categoryId));
    const subcategories = (selectedCat && Array.isArray(selectedCat.subcategories)) ? selectedCat.subcategories : [];

    subcatSelect.disabled = false;
    subcatSelect.innerHTML = '<option value="">-- Select Subcategory --</option>';

    if (subcategories.length === 0) {
      const emptyOpt = document.createElement("option");
      emptyOpt.value = "";
      emptyOpt.textContent = "No subcategories found for this category";
      subcatSelect.appendChild(emptyOpt);
    } else {
      subcategories.forEach((sub) => {
        const opt = document.createElement("option");
        opt.value = String(sub.id);
        opt.textContent = sub.subcategory;
        if (preselectedSubcatId && String(sub.id) === String(preselectedSubcatId)) {
          opt.selected = true;
        }
        subcatSelect.appendChild(opt);
      });
    }

    FormValidator.markField(subcatSelect.closest(".po-field"), subcatSelect, false);
  }

  /**
   * Open the form to add a new Stock Item.
   */
  openAddForm() {
    this.activeEditItem = null;
    const box = document.getElementById("stockItemFormBox");
    const titleEl = document.getElementById("stockItemFormTitle");
    const saveBtn = document.getElementById("itemSaveBtn");

    if (titleEl) {
      titleEl.innerHTML = '<i class="fa-solid fa-circle-plus" style="color: #1677ff;"></i> Register New Stock Item';
    }
    if (saveBtn) {
      saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save Item';
    }

    this.resetForm();
    if (box) box.style.display = "block";

    const nameInput = document.getElementById("itemFormNameInput");
    if (nameInput) nameInput.focus();
  }

  /**
   * Open the form to edit an existing Stock Item.
   *
   * @param {Object} item
   */
  openEditForm(item) {
    if (!item) return;
    this.activeEditItem = item;

    const box = document.getElementById("stockItemFormBox");
    const titleEl = document.getElementById("stockItemFormTitle");
    const saveBtn = document.getElementById("itemSaveBtn");

    if (titleEl) {
      titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color: #faad14;"></i> Edit Item: ${item.name || item.code || ""}`;
    }
    if (saveBtn) {
      saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Update Item';
    }

    const codeInput = document.getElementById("itemFormCodeInput");
    const nameInput = document.getElementById("itemFormNameInput");
    const catSelect = document.getElementById("itemFormCategorySelect");
    const lowStockInput = document.getElementById("itemFormLowStockInput");
    const reorderInput = document.getElementById("itemFormReorderInput");

    if (codeInput) codeInput.value = item.code || "Auto Generated";
    if (nameInput) nameInput.value = item.name || "";
    if (lowStockInput) lowStockInput.value = item.low_stock_qty !== undefined ? item.low_stock_qty : 10;
    if (reorderInput) reorderInput.value = item.reorder_qty !== undefined ? item.reorder_qty : 20;

    // Determine category ID from item.subcategory
    const subcatId = item.subcategories_id || (item.subcategory && item.subcategory.id);
    let catId = item.subcategory && (item.subcategory.categories_id || (item.subcategory.category && item.subcategory.category.id));

    // Fallback category lookup
    if (!catId && subcatId && this.categories.length > 0) {
      for (const cat of this.categories) {
        if (Array.isArray(cat.subcategories) && cat.subcategories.some((s) => Number(s.id) === Number(subcatId))) {
          catId = cat.id;
          break;
        }
      }
    }

    if (catSelect && catId) {
      catSelect.value = String(catId);
      this.onCategoryChange(catId, subcatId);
    } else if (catSelect) {
      catSelect.value = "";
      this.onCategoryChange("", null);
    }

    // Set selected brands
    this.selectedBrandIds = new Set((item.brands || []).map((b) => Number(b.id)));
    this.renderSelectedBrandTags();

    if (box) box.style.display = "block";
    if (nameInput) nameInput.focus();
  }

  closeForm() {
    const box = document.getElementById("stockItemFormBox");
    if (box) box.style.display = "none";
    this.activeEditItem = null;
    this.resetForm();
  }

  resetForm() {
    const codeInput = document.getElementById("itemFormCodeInput");
    const nameInput = document.getElementById("itemFormNameInput");
    const catSelect = document.getElementById("itemFormCategorySelect");
    const subcatSelect = document.getElementById("itemFormSubcatSelect");
    const lowStockInput = document.getElementById("itemFormLowStockInput");
    const reorderInput = document.getElementById("itemFormReorderInput");

    if (lowStockInput) lowStockInput.value = "10";
    if (reorderInput) reorderInput.value = "20";

    if (codeInput) {
      codeInput.value = "Auto Generated by System";
      FormValidator.markField(codeInput.closest(".po-field"), codeInput, false);
    }
    if (nameInput) {
      nameInput.value = "";
      FormValidator.markField(nameInput.closest(".po-field"), nameInput, false);
    }
    if (catSelect) {
      catSelect.value = "";
      FormValidator.markField(catSelect.closest(".po-field"), catSelect, false);
    }
    if (subcatSelect) {
      subcatSelect.disabled = true;
      subcatSelect.innerHTML = '<option value="">-- Select Category First --</option>';
      FormValidator.markField(subcatSelect.closest(".po-field"), subcatSelect, false);
    }

    this.selectedBrandIds.clear();
    this.renderSelectedBrandTags();
    this.hideBrandError();
  }

  // ==========================================
  // BRAND MODAL SELECTION LOGIC
  // ==========================================

  openBrandSelectionModal() {
    const modal = document.getElementById("selectBrandsModal");
    if (!modal) return;

    this.modalTempSelectedIds = new Set(this.selectedBrandIds);
    this.renderModalBrandList();

    const searchInput = document.getElementById("modalBrandSearchInput");
    if (searchInput) {
      searchInput.value = "";
    }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    if (searchInput) setTimeout(() => searchInput.focus(), 60);
  }

  closeBrandSelectionModal() {
    const modal = document.getElementById("selectBrandsModal");
    if (modal) {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    }
  }

  renderModalBrandList(filterText = "") {
    const container = document.getElementById("modalBrandsListContainer");
    if (!container) return;

    container.innerHTML = "";

    const text = String(filterText || "").toLowerCase().trim();
    const list = text
      ? this.brands.filter((b) => String(b.brand || "").toLowerCase().includes(text))
      : this.brands;

    if (list.length === 0) {
      container.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 12px;">
          <i class="fa-solid fa-award" style="opacity: 0.35; margin-bottom: 6px; display: block; font-size: 18px;"></i>
          No brands found matching "${text}".
        </div>
      `;
      this.updateModalBrandCounts();
      return;
    }

    list.forEach((brand) => {
      const isChecked = this.modalTempSelectedIds.has(Number(brand.id));
      const row = document.createElement("label");
      row.className = "modal-brand-checkbox-row";
      row.style.cssText =
        "display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 7px 10px; border-radius: 6px; cursor: pointer; transition: background 0.15s; background: var(--surface); border: 1px solid var(--border);";

      row.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <input type="checkbox" class="modal-brand-cb" value="${brand.id}" ${isChecked ? "checked" : ""} style="cursor: pointer; width: 16px; height: 16px;">
          <span style="font-weight: 600; font-size: 13px; color: var(--text);">${brand.brand}</span>
        </div>
        <span class="ant-tag ant-tag-blue" style="font-size: 11px; margin: 0;">ID #${brand.id}</span>
      `;

      const cb = row.querySelector(".modal-brand-cb");
      cb.addEventListener("change", (e) => {
        const id = Number(e.target.value);
        if (e.target.checked) {
          this.modalTempSelectedIds.add(id);
        } else {
          this.modalTempSelectedIds.delete(id);
        }
        this.updateModalBrandCounts();
      });

      container.appendChild(row);
    });

    this.updateModalBrandCounts();
  }

  filterModalBrands(text) {
    this.renderModalBrandList(text);
  }

  modalSelectAllBrands(select = true) {
    const checkboxes = document.querySelectorAll(".modal-brand-cb");
    checkboxes.forEach((cb) => {
      cb.checked = select;
      const id = Number(cb.value);
      if (select) {
        this.modalTempSelectedIds.add(id);
      } else {
        this.modalTempSelectedIds.delete(id);
      }
    });

    this.updateModalBrandCounts();
  }

  updateModalBrandCounts() {
    const count = this.modalTempSelectedIds.size;
    const countEl = document.getElementById("modalBrandSelectCount");
    const confirmCountEl = document.getElementById("modalBrandConfirmCount");

    if (countEl) countEl.textContent = `${count} brand${count === 1 ? "" : "s"} selected`;
    if (confirmCountEl) confirmCountEl.textContent = String(count);
  }

  confirmBrandSelection() {
    this.selectedBrandIds = new Set(this.modalTempSelectedIds);
    this.renderSelectedBrandTags();
    this.closeBrandSelectionModal();

    if (this.selectedBrandIds.size > 0) {
      this.hideBrandError();
    }
  }

  /**
   * Render removable brand tags into the form display container.
   */
  renderSelectedBrandTags() {
    const container = document.getElementById("itemSelectedBrandsTags");
    if (!container) return;

    container.innerHTML = "";

    if (this.selectedBrandIds.size === 0) {
      container.innerHTML = `
        <span class="text-muted" id="itemBrandsEmptyPlaceholder" style="font-size: 12px; color: var(--text-muted);">
          No brands selected yet. Click "Add Brand" to select compatible manufacturers.
        </span>
      `;
      return;
    }

    this.selectedBrandIds.forEach((brandId) => {
      const brand = this.brands.find((b) => Number(b.id) === Number(brandId));
      const brandName = brand ? brand.brand : `Brand #${brandId}`;

      const tag = document.createElement("span");
      tag.className = "ant-tag ant-tag-blue";
      tag.style.cssText =
        "font-size: 12px; padding: 3px 8px; display: inline-flex; align-items: center; gap: 6px; margin: 2px;";
      tag.innerHTML = `
        <i class="fa-solid fa-award" style="font-size: 11px;"></i>
        <strong>${brandName}</strong>
        <button type="button" class="btn-remove-brand-tag" data-brand-id="${brandId}" title="Remove brand" style="border: none; background: none; color: #1677ff; cursor: pointer; padding: 0 2px; font-size: 14px; line-height: 1; font-weight: bold;">
          &times;
        </button>
      `;

      tag.querySelector(".btn-remove-brand-tag").addEventListener("click", (e) => {
        e.stopPropagation();
        this.selectedBrandIds.delete(Number(brandId));
        this.renderSelectedBrandTags();
        if (this.selectedBrandIds.size === 0) {
          this.showBrandError("Compatible / Associated Brands are required. At least one brand must be selected.");
        }
      });

      container.appendChild(tag);
    });
  }

  showBrandError(message) {
    const errEl = document.getElementById("itemBrandsErr");
    if (errEl) {
      errEl.textContent = message;
      errEl.style.display = "block";
    }
    const tagsBox = document.getElementById("itemSelectedBrandsTags");
    if (tagsBox) {
      tagsBox.style.borderColor = "#ff4d4f";
    }
  }

  hideBrandError() {
    const errEl = document.getElementById("itemBrandsErr");
    if (errEl) {
      errEl.textContent = "";
      errEl.style.display = "none";
    }
    const tagsBox = document.getElementById("itemSelectedBrandsTags");
    if (tagsBox) {
      tagsBox.style.borderColor = "var(--border)";
    }
  }

  // ==========================================
  // VALIDATION & SUBMISSION
  // ==========================================

  validate(data) {
    if (!FormValidator.isRequired(data.name)) {
      return { isValid: false, field: "name", message: "Item name is required." };
    }
    if (data.name.length < 2 || data.name.length > 50) {
      return { isValid: false, field: "name", message: "Item name must be 2-50 characters." };
    }

    if (!data.category_id || Number(data.category_id) <= 0) {
      return { isValid: false, field: "category", message: "Please select a material category." };
    }

    if (!data.subcategories_id || Number(data.subcategories_id) <= 0) {
      return { isValid: false, field: "subcat", message: "Please select a material subcategory." };
    }

    if (!Array.isArray(data.brands) || data.brands.length === 0) {
      return {
        isValid: false,
        field: "brands",
        message: "Compatible / Associated Brands are required. At least one brand must be selected.",
      };
    }

    return { isValid: true, message: "" };
  }

  async submit() {
    const nameInput = document.getElementById("itemFormNameInput");
    const catSelect = document.getElementById("itemFormCategorySelect");
    const subcatSelect = document.getElementById("itemFormSubcatSelect");
    const lowStockInput = document.getElementById("itemFormLowStockInput");
    const reorderInput = document.getElementById("itemFormReorderInput");
    const saveBtn = document.getElementById("itemSaveBtn");

    const payload = {
      name: nameInput ? nameInput.value.trim() : "",
      category_id: catSelect ? parseInt(catSelect.value, 10) : null,
      subcategories_id: subcatSelect ? parseInt(subcatSelect.value, 10) : null,
      low_stock_qty: lowStockInput ? parseInt(lowStockInput.value, 10) || 10 : 10,
      reorder_qty: reorderInput ? parseInt(reorderInput.value, 10) || 20 : 20,
      brands: Array.from(this.selectedBrandIds),
    };

    const val = this.validate(payload);
    if (!val.isValid) {
      if (val.field === "name" && nameInput) {
        FormValidator.markField(nameInput.closest(".po-field"), nameInput, true, val.message);
        nameInput.focus();
      } else if (val.field === "category" && catSelect) {
        FormValidator.markField(catSelect.closest(".po-field"), catSelect, true, val.message);
        catSelect.focus();
      } else if (val.field === "subcat" && subcatSelect) {
        FormValidator.markField(subcatSelect.closest(".po-field"), subcatSelect, true, val.message);
        subcatSelect.focus();
      } else if (val.field === "brands") {
        this.showBrandError(val.message);
      }
      this.showToast(val.message, "error");
      return;
    }

    this.hideBrandError();

    const originalHtml = saveBtn ? saveBtn.innerHTML : "";
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }

    try {
      let response = null;
      const isEdit = Boolean(this.activeEditItem && this.activeEditItem.id);

      // Clean payload for backend request
      const requestData = {
        name: payload.name,
        subcategories_id: payload.subcategories_id,
        brands: payload.brands,
      };

      if (isEdit) {
        if (this.activeEditItem.code) {
          requestData.code = this.activeEditItem.code;
        }
        response = await this.http.put(`/api/v1/inventory/stock-items/${this.activeEditItem.id}`, requestData);
      } else {
        response = await this.http.post("/api/v1/inventory/stock-items", requestData);
      }

      if (!response || response.success === false) {
        throw new Error((response && response.message) || "Failed to save stock item.");
      }

      const savedItem = response.data || response;
      const actionText = isEdit ? "updated" : "created";
      this.showToast(`Stock item "${savedItem.name}" (${savedItem.code || "SKU"}) ${actionText} successfully!`, "success");
      this.closeForm();
      await this.onSuccess(savedItem);
    } catch (err) {
      const errorMsg =
        err?.data?.message ||
        (err?.data?.errors ? Object.values(err.data.errors).flat().join(" ") : null) ||
        err?.message ||
        "Could not save stock item.";
      this.showToast(errorMsg, "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalHtml;
      }
    }
  }
}

export default StockItemProcess;
