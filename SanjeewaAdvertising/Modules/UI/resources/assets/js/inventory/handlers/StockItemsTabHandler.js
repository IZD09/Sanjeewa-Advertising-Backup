/**
 * SanjeewaAdvertising - Stock Items Tab Handler
 *
 * Orchestrates Tab: Stock Items & Brands
 * - Fetches Stock Items, Brands, and Categories from /api/v1/inventory/stock-items/data
 * - Extends BaseTableLoader for non-reloading pagination (max 20 rows per page)
 * - Renders stock items using StockItemRowBuilder (extends BaseTableRowBuilder)
 * - Renders brands list using BrandCardBuilder (extends BaseTableRowBuilder)
 * - Cascades Category -> Subcategory dropdown in Add/Edit forms
 * - Integrates brand selection modal with required validation
 * - Handles live search for both Brands and Stock Items as the user types
 * - Delegates add/edit workflows to StockItemProcess and BrandProcess
 */

import { BaseTableLoader } from "../../core/BaseTableLoader.js";
import { RequestHandler } from "../../core/RequestHandler.js";
import { StockItemRowBuilder } from "../builders/StockItemRowBuilder.js";
import { BrandCardBuilder } from "../builders/BrandCardBuilder.js";
import { InventoryKpiCardBuilder } from "../builders/InventoryKpiCardBuilder.js";
import { StockItemProcess } from "../processes/StockItemProcess.js";
import { BrandProcess } from "../processes/BrandProcess.js";

export class StockItemsTabHandler extends BaseTableLoader {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.showToast]
   * @param {Function} [options.onFilterStock]
   */
  constructor(options = {}) {
    super({
      tbodyId: "catalogItemsTableBody",
      paginationInfoId: "catalogItemsPaginationInfo",
      paginationControlsId: "catalogItemsPaginationControls",
      pageSize: 20,
      colspan: 7,
      emptyIcon: "fa-boxes-stacked",
      emptyMessage: "No catalog stock items found matching criteria.",
      itemLabel: "items",
      rowBuilder: StockItemRowBuilder,
      onPageChange: (newPage) => {
        this.currentPage = newPage;
        this.renderItemsTable(newPage);
      },
    });

    this.http = new RequestHandler();
    this.showToast = options.showToast || ((msg, type) => console.log(`[Toast ${type}]: ${msg}`));
    this.onFilterStock = options.onFilterStock || (() => {});

    this.stockItems = [];
    this.brands = [];
    this.categories = [];
    this.stats = {
      total_items: 0,
      total_brands: 0,
      mapped_categories: 0,
      mapped_subcategories: 0,
    };

    this.searchTerm = "";
    this.categoryFilter = "ALL";
    this.brandFilter = "ALL";
    this.brandSearch = "";
    this.hasLoaded = false;

    // Sub-processes
    this.itemProcess = new StockItemProcess({
      showToast: (msg, type) => this.showToast(msg, type),
      onSuccess: async () => {
        await this.fetchData();
      },
    });

    this.brandProcess = new BrandProcess({
      showToast: (msg, type) => this.showToast(msg, type),
      onSuccess: async () => {
        await this.fetchData();
      },
    });
  }

  bindEvents() {
    this.itemProcess.bindEvents();
    this.brandProcess.bindEvents();

    // Live Stock Item Search: as user types, filter and render immediately
    const itemSearchInput = document.getElementById("catalogItemsSearchInput");
    if (itemSearchInput) {
      itemSearchInput.addEventListener("input", (e) => {
        this.searchTerm = e.target.value.toLowerCase().trim();
        this.reset();
        this.renderItemsTable(1);
      });
    }

    // Category filter dropdown
    const catSelect = document.getElementById("catalogCategoryFilter");
    if (catSelect) {
      catSelect.addEventListener("change", (e) => {
        this.categoryFilter = e.target.value;
        this.reset();
        this.renderItemsTable(1);
      });
    }

    // Brand filter dropdown
    const brandSelect = document.getElementById("catalogBrandFilter");
    if (brandSelect) {
      brandSelect.addEventListener("change", (e) => {
        this.brandFilter = e.target.value;
        this.reset();
        this.renderItemsTable(1);
      });
    }

    // Live Brand Search: as user types, filter and render immediately
    const brandSearchInput = document.getElementById("catalogBrandSearchInput");
    if (brandSearchInput) {
      brandSearchInput.addEventListener("input", (e) => {
        this.brandSearch = e.target.value.toLowerCase().trim();
        this.renderBrandsList();
      });
    }

    // Refresh button
    const refreshBtn = document.getElementById("catalogItemsRefreshBtn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.fetchData());
    }
  }

  async fetchData() {
    this.showLoading("Loading catalog items & brand registry...");

    try {
      const response = await this.http.get("/api/v1/inventory/stock-items/data");
      if (response && response.success && response.data) {
        this.applyPayload(response.data);
      }
    } catch (err) {
      console.error("Error loading stock items data:", err);
      this.showToast("Could not load stock items & brands from server", "error");
    }
  }

  applyPayload(payload = {}) {
    this.stockItems = Array.isArray(payload.stock_items) ? payload.stock_items : [];
    this.brands = Array.isArray(payload.brands) ? payload.brands : [];
    this.categories = Array.isArray(payload.categories) ? payload.categories : [];
    this.stats = payload.stats || {
      total_items: this.stockItems.length,
      total_brands: this.brands.length,
      mapped_categories: 0,
      mapped_subcategories: 0,
    };

    // Update master data in StockItemProcess for cascading selects & brand modal
    this.itemProcess.setMasterData(this.categories, this.brands);

    this.renderKPIs(this.stats);
    this.populateFilterDropdowns();
    this.renderBrandsList();
    this.renderItemsTable(this.currentPage);
    this.hasLoaded = true;
  }

  renderKPIs(stats = {}) {
    const totalItems = stats.total_items ?? this.stockItems.length;
    const totalBrands = stats.total_brands ?? this.brands.length;
    const totalCategories = stats.mapped_categories ?? 0;

    InventoryKpiCardBuilder.renderGrid("invStockItemsKpiGrid", [
      new InventoryKpiCardBuilder()
        .setValueId("kpiCatalogTotalItems")
        .setLabel("Registered Stock Items")
        .setValue(Number(totalItems).toLocaleString())
        .setDescription("Catalog Material SKUs")
        .setDescIcon("fa-boxes-stacked", "#1677ff")
        .setIcon("fa-boxes-stacked", "blue")
        .toJSON(),
      new InventoryKpiCardBuilder()
        .setValueId("kpiCatalogTotalBrands")
        .setLabel("Registered Brands")
        .setValue(Number(totalBrands).toLocaleString())
        .setValueColor("#52c41a")
        .setDescription("Manufacturer Brands")
        .setDescIcon("fa-copyright", "#52c41a")
        .setIcon("fa-award", "green")
        .toJSON(),
      new InventoryKpiCardBuilder()
        .setValueId("kpiCatalogMappedCategories")
        .setLabel("Active Categories")
        .setValue(Number(totalCategories).toLocaleString())
        .setValueColor("#722ed1")
        .setDescription("Material Classifications")
        .setDescIcon("fa-folder-tree", "#722ed1")
        .setIcon("fa-layer-group", "purple")
        .toJSON(),
    ]);

    const tabBadge = document.getElementById("tabBadgeStockItemsCount");
    if (tabBadge) {
      tabBadge.textContent = String(totalItems);
    }
  }

  populateFilterDropdowns() {
    const catSelect = document.getElementById("catalogCategoryFilter");
    if (catSelect && this.categories.length > 0) {
      const currentVal = catSelect.value;
      catSelect.innerHTML = '<option value="ALL">All Categories</option>';
      this.categories.forEach((cat) => {
        const opt = document.createElement("option");
        opt.value = String(cat.id);
        opt.textContent = cat.category;
        catSelect.appendChild(opt);
      });
      if (currentVal) catSelect.value = currentVal;
    }

    const brandSelect = document.getElementById("catalogBrandFilter");
    if (brandSelect && this.brands.length > 0) {
      const currentVal = brandSelect.value;
      brandSelect.innerHTML = '<option value="ALL">All Brands</option>';
      this.brands.forEach((brand) => {
        const opt = document.createElement("option");
        opt.value = String(brand.id);
        opt.textContent = brand.brand;
        brandSelect.appendChild(opt);
      });
      if (currentVal) brandSelect.value = currentVal;
    }
  }

  /**
   * Render Brand cards in the left column.
   * Handles live filtering as user types in the brand search input.
   */
  renderBrandsList() {
    const container = document.getElementById("catalogBrandsContainer");
    if (!container) return;

    let filtered = this.brands;
    if (this.brandSearch) {
      filtered = filtered.filter((b) =>
        String(b.brand || "").toLowerCase().includes(this.brandSearch)
      );
    }

    container.innerHTML = "";

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 12px;">
          <i class="fa-solid fa-award" style="font-size: 20px; opacity: 0.35; margin-bottom: 6px; display: block;"></i>
          No brands found matching "${this.brandSearch}".
        </div>
      `;
      return;
    }

    filtered.forEach((brand) => {
      const card = BrandCardBuilder.renderCard(brand, {
        onEdit: (b) => this.brandProcess.openEditForm(b),
        onFilter: (brandId) => {
          const brandSelect = document.getElementById("catalogBrandFilter");
          if (brandSelect) {
            brandSelect.value = String(brandId);
            this.brandFilter = String(brandId);
            this.reset();
            this.renderItemsTable(1);
          }
        },
      });
      container.appendChild(card);
    });
  }

  /**
   * Render Stock Items table rows using StockItemRowBuilder and BaseTableLoader pagination.
   * Handles live filtering as user types in the items search input.
   *
   * @param {number} [page=this.currentPage]
   */
  renderItemsTable(page = this.currentPage) {
    const tbody = document.getElementById("catalogItemsTableBody");
    const countEl = document.getElementById("catalogItemsTableCount");
    if (!tbody) return;

    let filtered = this.stockItems;

    if (this.categoryFilter !== "ALL") {
      filtered = filtered.filter(
        (item) =>
          item.subcategory &&
          String(item.subcategory.categories_id || (item.subcategory.category && item.subcategory.category.id)) ===
            String(this.categoryFilter)
      );
    }

    if (this.brandFilter !== "ALL") {
      filtered = filtered.filter((item) => {
        const itemBrands = item.brands || [];
        const hasDirectBrand = itemBrands.some((b) => String(b.id) === String(this.brandFilter));
        const hasStockBrand = (item.stocks || []).some((st) => String(st.brands_id) === String(this.brandFilter));
        return hasDirectBrand || hasStockBrand;
      });
    }

    if (this.searchTerm) {
      filtered = filtered.filter(
        (item) =>
          String(item.name || "").toLowerCase().includes(this.searchTerm) ||
          String(item.code || "").toLowerCase().includes(this.searchTerm) ||
          (item.subcategory && String(item.subcategory.subcategory || "").toLowerCase().includes(this.searchTerm)) ||
          (item.subcategory &&
            item.subcategory.category &&
            String(item.subcategory.category.category || "").toLowerCase().includes(this.searchTerm)) ||
          (Array.isArray(item.brands) &&
            item.brands.some((b) => String(b.brand || "").toLowerCase().includes(this.searchTerm)))
      );
    }

    const total = filtered.length;

    if (countEl) {
      const activePage = Math.max(1, Math.min(page, Math.ceil(total / this.pageSize) || 1));
      const start = total === 0 ? 0 : (activePage - 1) * this.pageSize + 1;
      const end = Math.min(activePage * this.pageSize, total);
      countEl.textContent =
        total > this.pageSize ? `Showing ${start}-${end} of ${total} items` : `Showing ${total} items`;
    }

    this.loadTable(
      filtered,
      (item, idx) => {
        const rowNumber = (this.currentPage - 1) * this.pageSize + (idx + 1);
        return StockItemRowBuilder.renderRow(item, {
          rowNumber,
          onEdit: (it) => this.itemProcess.openEditForm(it),
        });
      },
      page,
      this.pageSize
    );
  }
}

export default StockItemsTabHandler;
