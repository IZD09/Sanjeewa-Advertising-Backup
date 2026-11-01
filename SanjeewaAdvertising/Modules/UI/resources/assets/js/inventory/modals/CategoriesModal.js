/**
 * SanjeewaAdvertising - Inventory Categories Modal
 *
 * Manages Stock Categories directory modal (#invCategoriesModal),
 * categories cards grid, and adding new categories.
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class CategoriesModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getItems
   * @param {Function} context.getItemAvailableQty
   * @param {Function} context.formatCurrency
   * @param {Function} context.renderTable
   * @param {Function} context.setSelectedCategory
   */
  constructor(context) {
    super({
      activeModalClass: "open",
      overlaySelector: ".po-modal-overlay",
      toastContainerId: "poToastContainer",
      closeSelectors: ["[data-close-inv-modal]", "[data-close-modal]", ".po-modal-close"],
      autoBind: true
    });

    this.ctx = context;

    this.bindEvents();
  }

  getCategoryIcon(catName) {
    const map = {
      "Paper & Boards": "fa-scroll",
      "Inks & Toners": "fa-fill-drip",
      "Flex & Banners": "fa-flag",
      "Vinyl & Stickers": "fa-note-sticky",
      "Rigid Boards & Hardware": "fa-hammer"
    };
    return map[catName] || "fa-tags";
  }

  bindEvents() {
    // Categories button in header
    const invCategoriesBtn = document.getElementById("invCategoriesBtn");
    if (invCategoriesBtn) {
      invCategoriesBtn.addEventListener("click", () => this.openCategoriesModal());
    }

    // New Category Form toggle
    const openNewCategoryFormBtn = document.getElementById("openNewCategoryFormBtn");
    const cancelNewCategoryBtn = document.getElementById("cancelNewCategoryBtn");
    const saveNewCategoryBtn = document.getElementById("saveNewCategoryBtn");
    const newCategoryFormWrap = document.getElementById("newCategoryFormWrap");

    if (openNewCategoryFormBtn && newCategoryFormWrap) {
      openNewCategoryFormBtn.addEventListener("click", () => {
        newCategoryFormWrap.style.display = "block";
      });
    }

    if (cancelNewCategoryBtn && newCategoryFormWrap) {
      cancelNewCategoryBtn.addEventListener("click", () => {
        newCategoryFormWrap.style.display = "none";
      });
    }

    if (saveNewCategoryBtn) {
      saveNewCategoryBtn.addEventListener("click", () => this.saveNewCategory());
    }
  }

  openCategoriesModal() {
    this.renderCategoriesGrid();
    const wrap = document.getElementById("newCategoryFormWrap");
    if (wrap) wrap.style.display = "none";
    this.openModal("invCategoriesModal");
  }

  renderCategoriesGrid() {
    const container = document.getElementById("invCategoriesGrid");
    if (!container) return;

    const items = this.ctx.getItems ? this.ctx.getItems() : [];
    const catStats = {};

    items.forEach(item => {
      const cat = item.category || "Uncategorized";
      if (!catStats[cat]) {
        catStats[cat] = { count: 0, totalUnits: 0, totalVal: 0 };
      }
      catStats[cat].count++;
      const avail = this.ctx.getItemAvailableQty ? this.ctx.getItemAvailableQty(item) : 0;
      catStats[cat].totalUnits += avail;
      catStats[cat].totalVal += avail * (item.unitPrice || 0);
    });

    container.innerHTML = "";

    const categories = Object.keys(catStats).sort();
    if (categories.length === 0) {
      container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px;">No categories configured.</div>`;
      return;
    }

    categories.forEach(catName => {
      const stat = catStats[catName];
      const icon = this.getCategoryIcon(catName);

      const card = document.createElement("div");
      card.className = "category-stat-card";
      card.innerHTML = `
        <div class="category-stat-header">
          <div class="category-icon-box">
            <i class="fa-solid ${icon}"></i>
          </div>
          <div>
            <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: var(--text);">${catName}</h4>
            <span style="font-size: 11px; color: var(--text-muted);">${stat.count} Distinct Material SKUs</span>
          </div>
        </div>

        <div class="category-stat-values">
          <div class="category-val-item">
            <label>Stock Units</label>
            <span>${stat.totalUnits.toLocaleString()}</span>
          </div>
          <div class="category-val-item">
            <label>Asset Value</label>
            <span style="color: #1677ff; font-weight: 700;">${this.ctx.formatCurrency ? this.ctx.formatCurrency(stat.totalVal) : stat.totalVal}</span>
          </div>
        </div>

        <div style="margin-top: 12px; display: flex; gap: 8px;">
          <button type="button" class="ant-btn ant-btn-default" style="font-size: 11.5px; height: 28px; flex: 1;" onclick="window.inventoryManager.filterByCategoryFromModal('${catName}')">
            <i class="fa-solid fa-filter"></i> View Materials
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  filterByCategoryFromModal(categoryName) {
    this.closeModal("invCategoriesModal");
    const categoryFilter = document.getElementById("invCategoryFilter");
    if (categoryFilter) {
      categoryFilter.value = categoryName;
    }
    if (this.ctx.setSelectedCategory) {
      this.ctx.setSelectedCategory(categoryName);
    }
    if (this.ctx.renderTable) {
      this.ctx.renderTable();
    }
  }

  saveNewCategory() {
    const nameInput = document.getElementById("newCategoryName");
    const catName = nameInput?.value?.trim();

    if (!catName) {
      this.showToast("Please enter a valid Category Name", "error");
      return;
    }

    const categoryFilter = document.getElementById("invCategoryFilter");
    const newSkuCategory = document.getElementById("newSkuCategory");

    if (categoryFilter) {
      let exists = false;
      for (let i = 0; i < categoryFilter.options.length; i++) {
        if (categoryFilter.options[i].value.toLowerCase() === catName.toLowerCase()) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        const opt = document.createElement("option");
        opt.value = catName;
        opt.textContent = catName;
        categoryFilter.appendChild(opt);
      }
    }

    if (newSkuCategory) {
      let exists = false;
      for (let i = 0; i < newSkuCategory.options.length; i++) {
        if (newSkuCategory.options[i].value.toLowerCase() === catName.toLowerCase()) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        const opt = document.createElement("option");
        opt.value = catName;
        opt.textContent = catName;
        newSkuCategory.appendChild(opt);
      }
    }

    if (nameInput) nameInput.value = "";
    const wrap = document.getElementById("newCategoryFormWrap");
    if (wrap) wrap.style.display = "none";

    this.renderCategoriesGrid();
    this.showToast(`Category "${catName}" added successfully!`, "success");
  }
}

