/**
 * SanjeewaAdvertising - Categories & Subcategories Tab Handler
 *
 * Orchestrates the Categories & Subcategories UI Tab (Tab 3):
 * - Fetches Categories, Subcategories, and KPI stats from the Inventory backend API (/api/v1/inventory/categories/data)
 * - Renders KPI cards using InventoryKpiCardBuilder
 * - Renders Categories master list using CategoryBuilder
 * - Renders Subcategories table rows using SubcategoryBuilder
 * - Delegates Category & Subcategory creation to AddCategoryProcess and AddSubcategoryProcess
 */

import { BaseTableLoader } from "../../core/BaseTableLoader.js";
import { RequestHandler } from "../../core/RequestHandler.js";
import { CategoryBuilder } from "../builders/CategoryBuilder.js";
import { SubcategoryBuilder } from "../builders/SubcategoryBuilder.js";
import { InventoryKpiCardBuilder } from "../builders/InventoryKpiCardBuilder.js";
import { AddCategoryProcess } from "../processes/AddCategoryProcess.js";
import { AddSubcategoryProcess } from "../processes/AddSubcategoryProcess.js";

export class CategoriesTabHandler extends BaseTableLoader {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.onFilterStock] - Callback to switch to Stock Tab and filter by category
   * @param {Function} [options.showToast] - Toast notification function
   */
  constructor(options = {}) {
    super({
      tbodyId: options.tbodyId || "subcategoriesTableBody",
      paginationInfoId: options.paginationInfoId || "subcategoriesPaginationInfo",
      paginationControlsId: options.paginationControlsId || "subcategoriesPaginationControls",
      pageSize: options.pageSize || 20,
      colspan: 5,
      emptyIcon: "fa-tags",
      emptyMessage: "No subcategories found matching criteria.",
      itemLabel: "subcategories",
      onPageChange: (newPage) => {
        this.currentPage = newPage;
        this.renderSubcategoriesTable(newPage);
      }
    });

    this.http = new RequestHandler();
    this.onFilterStock = options.onFilterStock || (() => {});
    this.showToast = options.showToast || ((msg, type) => {
      console.log(`[Toast ${type}]: ${msg}`);
    });

    this.categories = [];
    this.subcategories = [];
    this.stats = {
      total_categories: 0,
      total_subcategories: 0,
      total_items: 0
    };

    this.selectedCategoryId = "ALL";
    this.categorySearch = "";
    this.subcategorySearch = "";
    this.hasLoaded = false;

    // 1. Add Category Process
    this.addCategoryProcess = new AddCategoryProcess({
      getExistingCategories: () => this.categories,
      showToast: (msg, type) => this.showToast(msg, type),
      onCategoryCreated: async (createdCategory) => {
        await this.fetchData();
        if (createdCategory && createdCategory.id) {
          this.selectCategory(createdCategory.id, createdCategory.category);
        }
      }
    });

    // 2. Add Subcategory Process
    this.addSubcategoryProcess = new AddSubcategoryProcess({
      getExistingSubcategories: () => this.subcategories,
      showToast: (msg, type) => this.showToast(msg, type),
      onSubcategoryCreated: async (createdSubcategory) => {
        await this.fetchData();
        if (createdSubcategory && createdSubcategory.categories_id) {
          const parentCat = this.categories.find(
            (c) => String(c.id) === String(createdSubcategory.categories_id)
          );
          if (parentCat) {
            this.selectCategory(parentCat.id, parentCat.category);
          }
        }
      }
    });
  }

  /**
   * Bind DOM event listeners for search filters, refresh button, and creation processes.
   */
  bindEvents() {
    this.addCategoryProcess.bindEvents();
    this.addSubcategoryProcess.bindEvents();

    // Category Search Filter
    const catFilterInput = document.getElementById("catFilterInput");
    if (catFilterInput) {
      catFilterInput.addEventListener("input", (e) => {
        this.categorySearch = e.target.value.toLowerCase().trim();
        this.renderCategoriesList();
      });
    }

    // Subcategory Search Filter
    const subcatSearchInput = document.getElementById("subcatSearchInput");
    if (subcatSearchInput) {
      subcatSearchInput.addEventListener("input", (e) => {
        this.subcategorySearch = e.target.value.toLowerCase().trim();
        this.reset();
        this.renderSubcategoriesTable(1);
      });
    }

    // Refresh button
    const refreshBtn = document.getElementById("subcatRefreshBtn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.fetchData());
    }

    // Hydrate immediately if initial server-side database payload is available on window
    if (
      typeof window !== "undefined" &&
      window.__INITIAL_INVENTORY_CATEGORIES_DATA__ &&
      !this.hasLoaded
    ) {
      this.applyPayload(window.__INITIAL_INVENTORY_CATEGORIES_DATA__);
    }
  }

  /**
   * Apply categories, subcategories, and stats payload and render all UI builders.
   * @param {Object} payload
   */
  applyPayload(payload = {}) {
    if (!payload || typeof payload !== "object") {
      return;
    }

    this.categories = Array.isArray(payload.categories) ? payload.categories : [];
    this.subcategories = Array.isArray(payload.subcategories) ? payload.subcategories : [];
    this.stats = payload.stats || {
      total_categories: this.categories.length,
      total_subcategories: this.subcategories.length,
      total_items: 0
    };

    this.renderKPIs(this.stats);
    this.populateCategorySelect();
    this.syncStockCategoryFilterDropdown();
    this.renderCategoriesList();
    this.renderSubcategoriesTable();
    this.hasLoaded = true;
  }

  /**
   * Show loading indicator in categories list and subcategories table before initial load completes.
   */
  showLoadingState() {
    if (this.hasLoaded) {
      return;
    }

    const catContainer = document.getElementById("categoriesListContainer");
    if (catContainer && catContainer.children.length === 0) {
      catContainer.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 12px;">
          <i class="fa-solid fa-spinner fa-spin" style="margin-right: 6px;"></i> Loading categories...
        </div>
      `;
    }

    const subcatTbody = document.getElementById("subcategoriesTableBody");
    if (subcatTbody && subcatTbody.children.length === 0) {
      subcatTbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 32px 16px; color: var(--text-muted);">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 20px; margin-bottom: 8px; display: block;"></i>
            Loading subcategories from database...
          </td>
        </tr>
      `;
    }
  }

  /**
   * Load Categories, Subcategories, and KPI Statistics from the Inventory backend module.
   */
  async fetchData() {
    this.showLoadingState();

    try {
      const response = await this.http.get("/api/v1/inventory/categories/data");

      if (response && response.success && response.data) {
        this.applyPayload(response.data);
      } else {
        // Fallback to individual endpoints if needed
        const [catRes, subcatRes, statsRes] = await Promise.all([
          this.http.get("/api/v1/inventory/categories"),
          this.http.get("/api/v1/inventory/subcategories"),
          this.http.get("/api/v1/inventory/categories/stats")
        ]);

        const categories = (catRes && Array.isArray(catRes.data)) ? catRes.data : [];
        const subcategories = (subcatRes && Array.isArray(subcatRes.data)) ? subcatRes.data : [];
        const stats = (statsRes && statsRes.data) ? statsRes.data : {
          total_categories: categories.length,
          total_subcategories: subcategories.length,
          total_items: 0
        };

        this.applyPayload({ categories, subcategories, stats });
      }
    } catch (err) {
      console.error("Error loading categories data from backend:", err);
      this.showToast("Failed to load categories and subcategories from server", "error");
    }
  }

  /**
   * Render Tab 3 KPI Summary Cards using InventoryKpiCardBuilder.
   * @param {Object} stats
   */
  renderKPIs(stats = {}) {
    const totalCats = stats.total_categories ?? this.categories.length;
    const totalSubcats = stats.total_subcategories ?? this.subcategories.length;
    const totalItems = stats.total_items ?? 0;

    InventoryKpiCardBuilder.renderGrid("invCategoriesKpiGrid", [
      new InventoryKpiCardBuilder()
        .setValueId("catKpiTotalCategories")
        .setLabel("Material Categories")
        .setValue(Number(totalCats).toLocaleString())
        .setDescription("Primary Classifications")
        .setDescIcon("fa-folder-tree", "#1677ff")
        .setIcon("fa-folder-open", "blue")
        .toJSON(),
      new InventoryKpiCardBuilder()
        .setValueId("catKpiTotalSubcategories")
        .setLabel("Subcategories")
        .setValue(Number(totalSubcats).toLocaleString())
        .setValueColor("#52c41a")
        .setDescription("Material Sub-groups")
        .setDescIcon("fa-tags", "#52c41a")
        .setIcon("fa-tags", "green")
        .toJSON(),
      new InventoryKpiCardBuilder()
        .setValueId("catKpiTotalItems")
        .setLabel("Mapped Stock SKUs")
        .setValue(Number(totalItems).toLocaleString())
        .setValueColor("#722ed1")
        .setDescription("Registered Material Items")
        .setDescIcon("fa-boxes-stacked", "#722ed1")
        .setIcon("fa-layer-group", "purple")
        .toJSON()
    ]);

    const tabBadgeEl = document.getElementById("tabBadgeCategoriesCount");
    if (tabBadgeEl) {
      tabBadgeEl.textContent = String(totalCats);
    }
  }

  /**
   * Populate parent category dropdown in Add Subcategory form.
   */
  populateCategorySelect() {
    const select = document.getElementById("newSubcatCategorySelect");
    if (!select) {
      return;
    }

    select.innerHTML = '<option value="">-- Choose Category --</option>';
    this.categories.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.category;
      if (this.selectedCategoryId !== "ALL" && String(c.id) === String(this.selectedCategoryId)) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });
  }

  /**
   * Synchronize the main Stock Tab category filter dropdown (#invCategoryFilter)
   * and Add Stock Modal category dropdown (#newSkuCategory) with backend database categories.
   */
  syncStockCategoryFilterDropdown() {
    if (this.categories.length === 0) {
      return;
    }

    const stockFilter = document.getElementById("invCategoryFilter");
    if (stockFilter) {
      const existingValues = new Set(
        Array.from(stockFilter.options).map((opt) => opt.value)
      );

      this.categories.forEach((c) => {
        if (c.category && !existingValues.has(c.category)) {
          const opt = document.createElement("option");
          opt.value = c.category;
          opt.textContent = c.category;
          stockFilter.appendChild(opt);
          existingValues.add(c.category);
        }
      });
    }

    const newSkuCategory = document.getElementById("newSkuCategory");
    if (newSkuCategory) {
      newSkuCategory.innerHTML = "";
      this.categories.forEach((c) => {
        if (c.category) {
          const opt = document.createElement("option");
          opt.value = c.category;
          opt.textContent = c.category;
          newSkuCategory.appendChild(opt);
        }
      });
    }
  }

  /**
   * Render the left-hand Categories Master List using CategoryBuilder.
   */
  renderCategoriesList() {
    const container = document.getElementById("categoriesListContainer");
    if (!container) {
      return;
    }

    container.innerHTML = "";

    // 1. "All Categories" Master Item built with CategoryBuilder
    const allItem = new CategoryBuilder()
      .setId("ALL")
      .setCategory("All Categories")
      .setSubcategoriesCount(this.subcategories.length)
      .setIsActive(this.selectedCategoryId === "ALL")
      .setIcon("fa-layer-group")
      .setOnSelect((id, name) => this.selectCategory(id, name))
      .build();

    container.appendChild(allItem);

    // 2. Filter categories by search input
    const filtered = this.categories.filter(
      (c) => !this.categorySearch || String(c.category || "").toLowerCase().includes(this.categorySearch)
    );

    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.style.cssText = "padding: 16px; text-align: center; color: var(--text-muted); font-size: 12px;";
      empty.textContent = "No categories matching search";
      container.appendChild(empty);
      return;
    }

    // 3. Render each Category item using CategoryBuilder
    filtered.forEach((cat) => {
      const isSelected = String(this.selectedCategoryId) === String(cat.id);
      const itemEl = CategoryBuilder.renderItem(cat, {
        isActive: isSelected,
        icon: "fa-folder",
        onSelect: (id, name) => this.selectCategory(id, name)
      });
      container.appendChild(itemEl);
    });
  }

  /**
   * Set active selected category, reset pagination to page 1, and re-render subcategories view.
   * @param {string|number} catId
   * @param {string} catName
   */
  selectCategory(catId, catName) {
    this.selectedCategoryId = catId;
    this.reset();
    this.renderCategoriesList();

    const badge = document.getElementById("activeCategoryBadge");
    if (badge) {
      badge.textContent = catName || "All Categories";
    }

    const select = document.getElementById("newSubcatCategorySelect");
    if (select && catId !== "ALL") {
      select.value = String(catId);
    }

    this.renderSubcategoriesTable(1);
  }

  /**
   * Render the right-hand Subcategories Table using SubcategoryBuilder
   * with non-reloading pagination (max 20 subcategories per page via BasePaginationHandler).
   * @param {number} [page=this.currentPage]
   */
  renderSubcategoriesTable(page = this.currentPage) {
    const tbody = document.getElementById("subcategoriesTableBody");
    const countEl = document.getElementById("subcategoriesTableCount");
    if (!tbody) {
      return;
    }

    let filtered = this.subcategories;
    if (this.selectedCategoryId !== "ALL") {
      filtered = filtered.filter(
        (s) => String(s.categories_id) === String(this.selectedCategoryId)
      );
    }
    if (this.subcategorySearch) {
      filtered = filtered.filter(
        (s) =>
          String(s.subcategory || "").toLowerCase().includes(this.subcategorySearch) ||
          (s.category &&
            s.category.category &&
            s.category.category.toLowerCase().includes(this.subcategorySearch))
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 36px 16px; color: var(--text-muted);">
            <i class="fa-solid fa-tags" style="font-size: 28px; opacity: 0.35; margin-bottom: 8px; display: block;"></i>
            No subcategories found matching criteria.
          </td>
        </tr>
      `;
      if (countEl) {
        countEl.textContent = "Showing 0 subcategories";
      }
      this.renderPagination(0, 1, 1, this.pageSize, this.itemLabel);
      return;
    }

    const { pageItems, total, totalPages, activePage } = this.paginate(
      filtered,
      page,
      this.pageSize
    );

    if (countEl) {
      const start = (activePage - 1) * this.pageSize + 1;
      const end = Math.min(activePage * this.pageSize, total);
      countEl.textContent =
        total > this.pageSize
          ? `Showing ${start}-${end} of ${total} subcategories`
          : `Showing ${total} subcategories`;
    }

    tbody.innerHTML = "";
    pageItems.forEach((subcat, idx) => {
      const rowNumber = (activePage - 1) * this.pageSize + (idx + 1);
      const row = SubcategoryBuilder.renderRow(subcat, {
        rowNumber,
        onFilterStock: (categoryName) => this.onFilterStock(categoryName)
      });
      tbody.appendChild(row);
    });

    this.renderPagination(total, totalPages, activePage, this.pageSize, this.itemLabel);
  }

  /**
   * Backward compatibility helper for direct category creation calls.
   */
  async handleSaveCategory() {
    await this.addCategoryProcess.submit();
  }

  /**
   * Backward compatibility helper for direct subcategory creation calls.
   */
  async handleSaveSubcategory() {
    await this.addSubcategoryProcess.submit();
  }
}

export default CategoriesTabHandler;
