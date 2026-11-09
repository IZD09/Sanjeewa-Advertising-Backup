/**
 * SanjeewaAdvertising - Inventory Table Handler
 *
 * Extends BaseTableLoader core class, directly fetching and orchestrating:
 * - View 2: Detailed Stock Batches from the backend database (/api/v1/inventory/stocks)
 * - View 1: Consolidated Summary (Item-wise totals across batches)
 *
 * Mirrors the architecture of CategoriesTabHandler, StockMovementsHandler, and StockItemsTabHandler:
 * - Backend API fetch with loading state and error handling
 * - BaseTableLoader non-reloading pagination (max 20 rows per page)
 * - Live search filtering as the user types
 * - Category dropdown filtering
 * - View toggling between Consolidated Summary and Detailed Stock Batches
 */

import { BaseTableLoader } from "../../core/BaseTableLoader.js";
import { RequestHandler } from "../../core/RequestHandler.js";
import { InventoryRowBuilder, InventoryEntity } from "../builders/InventoryRowBuilder.js";
import { StockItemAggregatedRowBuilder, StockItemAggregatedEntity } from "../builders/StockItemAggregatedRowBuilder.js";

export class InventoryTableHandler extends BaseTableLoader {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.getItemAvailableQty]
   * @param {Function} [options.getItemStatus]
   * @param {Function} [options.formatCurrency]
   * @param {Function} [options.openViewModal]
   * @param {Function} [options.openAdjustModal]
   * @param {Function} [options.showToast]
   */
  constructor(options = {}) {
    super({
      tbodyId: "invAggregatedTableBody",
      paginationInfoId: "invPaginationInfo",
      paginationControlsId: "invPaginationControls",
      pageSize: 20,
      colspan: 10,
      emptyIcon: "fa-boxes-stacked",
      emptyMessage: "No stock records found matching criteria.",
      itemLabel: "records",
      rowBuilder: StockItemAggregatedRowBuilder,
      onPageChange: (newPage) => {
        this.currentPage = newPage;
        this.renderCurrentTable(newPage);
      },
    });

    this.http = new RequestHandler();
    this.showToast = options.showToast || ((msg, type) => console.log(`[Toast ${type}]: ${msg}`));

    this.activeView = "aggregated"; // 'aggregated' | 'batches'
    this.detailedStocks = [];
    this.aggregatedItems = [];
    this.stats = {
      total_items: 0,
      total_value: 0,
      low_stock_count: 0,
      out_of_stock_count: 0,
    };

    this.searchTerm = "";
    this.categoryFilter = "ALL";
    this.hasLoaded = false;

    this.getItemAvailableQty = options.getItemAvailableQty || ((item) => {
      if (item.batches && Array.isArray(item.batches) && item.batches.length > 0) {
        return item.batches.reduce((sum, b) => sum + (parseFloat(b.availableQty ?? b.qty) || 0), 0);
      }
      return parseFloat(item.currentStock ?? item.qty ?? 0) || 0;
    });

    this.getItemStatus = options.getItemStatus || ((item) => {
      if (item.status && item.status.label && item.status.class) {
        return item.status;
      }
      const qty = this.getItemAvailableQty(item);
      const min = item.low_stock_qty || item.minThreshold || 10;
      if (qty <= 0) return { label: "Out of Stock", class: "ant-tag-red" };
      if (qty <= min) return { label: "Low Stock", class: "ant-tag-orange" };
      return { label: "In Stock", class: "ant-tag-green" };
    });

    this.formatCurrency = options.formatCurrency || ((amt) => `Rs. ${(parseFloat(amt) || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`);

    this.openViewModal = options.openViewModal || (() => {});
    this.openAdjustModal = options.openAdjustModal || (() => {});
  }

  /**
   * Bind event listeners for Toolbar (Search, Category Filter, and View Toggle Buttons).
   */
  bindEvents() {
    // 1. View Toggle Buttons
    const aggBtn = document.getElementById("invViewToggleAggregatedBtn");
    const batBtn = document.getElementById("invViewToggleBatchesBtn");

    if (aggBtn) {
      aggBtn.addEventListener("click", () => this.switchView("aggregated"));
    }
    if (batBtn) {
      batBtn.addEventListener("click", () => this.switchView("batches"));
    }

    // 2. Live Search Input: filters and re-renders table on every keystroke
    const searchInput = document.getElementById("invSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchTerm = e.target.value.toLowerCase().trim();
        this.currentPage = 1;
        this.renderCurrentTable(1);
      });
    }

    // 3. Category Filter Dropdown
    const catSelect = document.getElementById("invCategoryFilter");
    if (catSelect) {
      catSelect.addEventListener("change", (e) => {
        this.categoryFilter = e.target.value;
        this.currentPage = 1;
        this.renderCurrentTable(1);
      });
    }
  }

  /**
   * Fetch live stock inventory and batches directly from the backend API.
   * @param {number} [page=1]
   */
  async fetchData(page = 1) {
    const isAggregated = this.activeView === "aggregated";
    this.tbodyId = isAggregated ? "invAggregatedTableBody" : "invTableBody";
    this.showLoading(isAggregated ? "Loading material catalog stock items..." : "Loading detailed stock batches...");

    try {
      const response = await this.http.get("/api/v1/inventory/stocks?per_page=100");
      if (response && response.success && response.data) {
        this.applyPayload(response.data, page);
      }
    } catch (err) {
      console.error("Error loading stock inventory data:", err);
      this.showToast("Could not load material stock batches from server", "error");
    }
  }

  /**
   * Apply backend data payload and trigger KPI + Table rendering.
   * @param {Object} payload
   * @param {number} [page=1]
   */
  applyPayload(payload = {}, page = 1) {
    this.detailedStocks = Array.isArray(payload.items) ? payload.items : [];
    this.aggregatedItems = Array.isArray(payload.aggregated_items) ? payload.aggregated_items : [];

    // Fallback: If aggregatedItems was not computed by backend, compute from detailed stocks
    if (this.aggregatedItems.length === 0 && this.detailedStocks.length > 0) {
      this.aggregatedItems = this.computeAggregatedFromStocks(this.detailedStocks);
    }

    this.stats = payload.stats || {
      total_items: this.aggregatedItems.length > 0 ? this.aggregatedItems.length : this.detailedStocks.length,
      total_value: this.detailedStocks.reduce((sum, s) => sum + ((s.qty || 0) * (s.unitPrice || s.price || 0)), 0),
      low_stock_count: 0,
      out_of_stock_count: 0,
    };

    this.hasLoaded = true;
    this.renderKPIs(this.stats);
    this.renderCurrentTable(page);
  }

  /**
   * Switch the active view between 'aggregated' (Item Summary) and 'batches' (Detailed Batches).
   * @param {"aggregated" | "batches"} viewName
   */
  switchView(viewName) {
    if (this.activeView === viewName) return;
    this.activeView = viewName;
    this.currentPage = 1;

    const aggBtn = document.getElementById("invViewToggleAggregatedBtn");
    const batBtn = document.getElementById("invViewToggleBatchesBtn");
    const aggWrap = document.getElementById("invAggregatedTableWrap");
    const batWrap = document.getElementById("invBatchesTableWrap");

    if (viewName === "aggregated") {
      this.tbodyId = "invAggregatedTableBody";
      this.rowBuilder = StockItemAggregatedRowBuilder;
      this.emptyMessage = "No matching material catalog items found";

      if (aggBtn) {
        aggBtn.classList.add("active");
        aggBtn.style.background = "#fff";
        aggBtn.style.color = "#1677ff";
        aggBtn.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
      }
      if (batBtn) {
        batBtn.classList.remove("active");
        batBtn.style.background = "transparent";
        batBtn.style.color = "var(--text-muted, #595959)";
        batBtn.style.boxShadow = "none";
      }

      if (aggWrap) aggWrap.style.display = "block";
      if (batWrap) batWrap.style.display = "none";
    } else {
      this.tbodyId = "invTableBody";
      this.rowBuilder = InventoryRowBuilder;
      this.emptyMessage = "No matching stock batch consignments found";

      if (batBtn) {
        batBtn.classList.add("active");
        batBtn.style.background = "#fff";
        batBtn.style.color = "#1677ff";
        batBtn.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
      }
      if (aggBtn) {
        aggBtn.classList.remove("active");
        aggBtn.style.background = "transparent";
        aggBtn.style.color = "var(--text-muted, #595959)";
        aggBtn.style.boxShadow = "none";
      }

      if (aggWrap) aggWrap.style.display = "none";
      if (batWrap) batWrap.style.display = "block";
    }

    this.renderCurrentTable(1);
  }

  /**
   * Filter items based on current search term and category.
   * @param {Array} items
   * @returns {Array}
   */
  getFilteredList(items = []) {
    const term = (this.searchTerm || "").toLowerCase().trim();
    const cat = this.categoryFilter;

    return (items || []).filter(item => {
      const code = String(item.code || "").toLowerCase();
      const name = String(item.name || "").toLowerCase();
      const itemCat = String(item.category || "").toLowerCase();
      const subcat = String(item.subcategory || "").toLowerCase();
      const supplier = String(item.supplier || "").toLowerCase();
      const brand = String(item.brand || "").toLowerCase();

      // Check brands list if array
      let brandsStr = "";
      if (Array.isArray(item.brands)) {
        brandsStr = item.brands
          .map(b => (typeof b === "object" ? (b.brand || b.name || "") : String(b)))
          .join(" ")
          .toLowerCase();
      }

      const matchesSearch = !term ||
        code.includes(term) ||
        name.includes(term) ||
        itemCat.includes(term) ||
        subcat.includes(term) ||
        supplier.includes(term) ||
        brand.includes(term) ||
        brandsStr.includes(term);

      const matchesCat = cat === "ALL" ||
        item.category === cat ||
        (item.subcategory && item.subcategory === cat) ||
        (item.category_id && String(item.category_id) === String(cat));

      return matchesSearch && matchesCat;
    });
  }

  /**
   * Render active view (Aggregated or Detailed Batches) with 20 items per page pagination.
   * @param {number} [page=this.currentPage]
   */
  renderCurrentTable(page = this.currentPage) {
    const isAggregated = this.activeView === "aggregated";
    const sourceList = isAggregated ? this.aggregatedItems : this.detailedStocks;

    const filtered = this.getFilteredList(sourceList);
    const total = filtered.length;

    // Update Showing Count label
    const countLabel = document.getElementById("invTableCount");
    if (countLabel) {
      const activePage = Math.max(1, Math.min(page, Math.ceil(total / this.pageSize) || 1));
      const start = total === 0 ? 0 : (activePage - 1) * this.pageSize + 1;
      const end = Math.min(activePage * this.pageSize, total);
      const labelNoun = isAggregated ? "items" : "stock batches";

      countLabel.textContent = total > this.pageSize
        ? `Showing ${start}-${end} of ${total} ${labelNoun}`
        : `Showing ${total} of ${sourceList.length} ${labelNoun}`;
    }

    const helpers = {
      getItemAvailableQty: (it) => this.getItemAvailableQty(it),
      getItemStatus: (it) => this.getItemStatus(it),
      formatCurrency: (amt) => this.formatCurrency(amt),
    };

    if (isAggregated) {
      this.tbodyId = "invAggregatedTableBody";
      this.rowBuilder = StockItemAggregatedRowBuilder;
      this.loadTable(
        filtered,
        (item, index) => {
          const entity = item instanceof StockItemAggregatedEntity
            ? item
            : new StockItemAggregatedRowBuilder({ ...item, rowNumber: (page - 1) * this.pageSize + index + 1 }).build();
          return entity.render(helpers);
        },
        page,
        this.pageSize
      );
    } else {
      this.tbodyId = "invTableBody";
      this.rowBuilder = InventoryRowBuilder;
      this.loadTable(
        filtered,
        (item) => {
          const entity = item instanceof InventoryEntity
            ? item
            : new InventoryRowBuilder(item).build();
          return entity.render(helpers);
        },
        page,
        this.pageSize
      );
    }
  }

  /**
   * Compute aggregated items from detailed stock batches if backend didn't supply it.
   * @param {Array} stocks
   * @returns {Array}
   */
  computeAggregatedFromStocks(stocks = []) {
    const map = new Map();

    stocks.forEach((st) => {
      const code = st.code || `SKU-${st.id}`;
      if (!map.has(code)) {
        map.set(code, {
          id: st.stock_items_id || st.id,
          code: code,
          name: st.name || `Material Item ${code}`,
          category: st.category || "General",
          subcategory: st.subcategory || "General",
          brands: st.brands || (st.brand ? [{ brand: st.brand }] : []),
          batches_count: 0,
          total_qty: 0,
          unit: st.unit || "Units",
          unitPrice: st.unitPrice || st.price || 0,
          total_val: 0,
          low_stock_qty: st.low_stock_qty || st.minThreshold || 10,
          reorder_qty: st.reorder_qty || 20,
          suppliers: [],
        });
      }

      const agg = map.get(code);
      const qty = this.getItemAvailableQty(st);
      const val = qty * (st.unitPrice || st.price || 0);

      agg.total_qty += qty;
      agg.total_val += val;
      agg.batches_count += (Array.isArray(st.batches) && st.batches.length > 0 ? st.batches.length : 1);
      if (st.supplier && !agg.suppliers.includes(st.supplier)) {
        agg.suppliers.push(st.supplier);
      }
    });

    return Array.from(map.values()).map(item => {
      const low = item.low_stock_qty;
      let status = { label: "In Stock", class: "ant-tag-green" };
      if (item.total_qty <= 0) {
        status = { label: "Out of Stock", class: "ant-tag-red" };
      } else if (item.total_qty <= low) {
        status = { label: "Low Stock", class: "ant-tag-orange" };
      }

      return {
        ...item,
        currentStock: item.total_qty,
        qty: item.total_qty,
        status: status,
        supplier: item.suppliers.join(", ") || "General Supplier",
      };
    });
  }

  /**
   * Render KPI summary metrics at top of Stock Management tab.
   * @param {Object} [stats=null]
   */
  renderKPIs(stats = null) {
    const kpiTotalItems = document.getElementById("invKpiTotalItems");
    const kpiTotalValue = document.getElementById("invKpiTotalValue");
    const kpiLowStock = document.getElementById("invKpiLowStock");
    const kpiOutOfStock = document.getElementById("invKpiOutOfStock");

    if (stats) {
      if (kpiTotalItems) kpiTotalItems.textContent = stats.total_items ?? 0;
      if (kpiTotalValue) kpiTotalValue.textContent = this.formatCurrency(stats.total_value ?? 0);
      if (kpiLowStock) kpiLowStock.textContent = stats.low_stock_count ?? 0;
      if (kpiOutOfStock) kpiOutOfStock.textContent = stats.out_of_stock_count ?? 0;
      return;
    }

    // Client-side fallback calculation
    const agg = this.aggregatedItems;
    const stocks = this.detailedStocks;

    const totalItems = agg.length > 0 ? agg.length : stocks.length;
    let totalStockValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    if (agg.length > 0) {
      agg.forEach(item => {
        const qty = item.total_qty ?? this.getItemAvailableQty(item);
        const val = item.total_val ?? (qty * (item.unitPrice || 0));
        totalStockValue += val;

        const lowThreshold = item.low_stock_qty || item.minThreshold || 10;
        if (qty <= 0) {
          outOfStockCount++;
        } else if (qty <= lowThreshold) {
          lowStockCount++;
        }
      });
    } else {
      stocks.forEach(item => {
        const qty = this.getItemAvailableQty(item);
        totalStockValue += (qty * (item.unitPrice || item.price || 0));
        if (qty <= 0) {
          outOfStockCount++;
        } else if (qty <= (item.minThreshold || 10)) {
          lowStockCount++;
        }
      });
    }

    if (kpiTotalItems) kpiTotalItems.textContent = totalItems;
    if (kpiTotalValue) kpiTotalValue.textContent = this.formatCurrency(totalStockValue);
    if (kpiLowStock) kpiLowStock.textContent = lowStockCount;
    if (kpiOutOfStock) kpiOutOfStock.textContent = outOfStockCount;
  }

  // Compatibility helper for legacy calls
  render(items = [], searchTerm = "", selectedCategory = "ALL", page = this.currentPage, aggregatedItems = []) {
    if (Array.isArray(items) && items.length > 0) {
      this.detailedStocks = items;
    }
    if (Array.isArray(aggregatedItems) && aggregatedItems.length > 0) {
      this.aggregatedItems = aggregatedItems;
    }
    this.searchTerm = (searchTerm || "").toLowerCase().trim();
    this.categoryFilter = selectedCategory || "ALL";
    this.renderCurrentTable(page);
    this.renderKPIs(this.stats);
  }
}

export default InventoryTableHandler;
