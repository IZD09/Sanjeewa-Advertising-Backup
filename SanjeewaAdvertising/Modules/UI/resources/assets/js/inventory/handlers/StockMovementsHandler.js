/**
 * SanjeewaAdvertising - Stock Movements Handler
 *
 * Handles fetching, filtering, searching, and rendering historical stock movements,
 * extending the core BaseTableLoader for 20-row client/server pagination without page reloads.
 */

import { BaseTableLoader } from "../../core/BaseTableLoader.js";
import { RequestHandler } from "../../core/RequestHandler.js";
import { StockMovementRowBuilder } from "../builders/StockMovementRowBuilder.js";
import { InventoryKpiCardBuilder } from "../builders/InventoryKpiCardBuilder.js";

export class StockMovementsHandler extends BaseTableLoader {
  constructor(options = {}) {
    super({
      tbodyId: options.tbodyId || "invMovementsTableBody",
      paginationInfoId: options.paginationInfoId || "movementsPaginationInfo",
      paginationControlsId: options.paginationControlsId || "movementsPaginationControls",
      pageSize: 20,
      colspan: 10,
      emptyIcon: "fa-clock-rotate-left",
      emptyMessage: "No stock movement logs found matching your criteria",
      itemLabel: "movements",
      onPageChange: (newPage) => this.fetchMovements(newPage),
    });

    this.http = new RequestHandler();
    this.directionFilter = "ALL";
    this.typeIdFilter = "ALL";
    this.searchTerm = "";
    this.hasLoaded = false;
  }

  /**
   * Initialize event listeners for movements tab toolbar and search.
   */
  bindEvents() {
    // Search input with debounce
    const searchInput = document.getElementById("invMovementsSearchInput");
    if (searchInput) {
      let debounceTimer = null;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.searchTerm = e.target.value.trim();
          this.fetchMovements(1);
        }, 300);
      });
    }

    // Direction filter
    const dirFilter = document.getElementById("invMovementsDirectionFilter");
    if (dirFilter) {
      dirFilter.addEventListener("change", (e) => {
        this.directionFilter = e.target.value;
        this.fetchMovements(1);
      });
    }

    // Type filter
    const typeFilter = document.getElementById("invMovementsTypeFilter");
    if (typeFilter) {
      typeFilter.addEventListener("change", (e) => {
        this.typeIdFilter = e.target.value;
        this.fetchMovements(1);
      });
    }

    // Refresh button
    const refreshBtn = document.getElementById("invMovementsRefreshBtn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        this.fetchMovements(this.currentPage);
        this.fetchStats();
      });
    }
  }

  /**
   * Fetch paginated movements from the backend API.
   * @param {number} [page=1]
   */
  async fetchMovements(page = 1) {
    this.showLoading("Loading stock movements & audit log...");

    const params = new URLSearchParams({
      page: String(page),
      per_page: String(this.pageSize),
    });

    if (this.searchTerm) {
      params.append("search", this.searchTerm);
    }
    if (this.directionFilter && this.directionFilter !== "ALL") {
      params.append("direction", this.directionFilter);
    }
    if (this.typeIdFilter && this.typeIdFilter !== "ALL") {
      params.append("type_id", this.typeIdFilter);
    }

    try {
      const response = await this.http.get(`/api/v1/inventory/movements?${params.toString()}`);
      if (response && response.success && Array.isArray(response.data)) {
        const items = response.data;
        const pagination = response.pagination || {};

        this.currentPage = pagination.current_page || page;
        this.totalCount = pagination.total || items.length;
        this.totalPages = pagination.last_page || Math.max(1, Math.ceil(this.totalCount / this.pageSize));

        this.renderMovementsTable(items);
        this.renderPagination(this.totalCount, this.totalPages, this.currentPage, this.pageSize, this.itemLabel);
        this.updateTableCount(items.length, this.totalCount);
        this.hasLoaded = true;
      } else {
        this.renderEmpty("Failed to load movement records from server");
      }
    } catch (err) {
      console.error("Error fetching stock movements:", err);
      this.renderEmpty("Could not communicate with inventory movement API");
    }
  }

  /**
   * Fetch and render KPI metrics for movements using InventoryKpiCardBuilder.
   */
  async fetchStats() {
    try {
      const response = await this.http.get("/api/v1/inventory/movements/stats");
      if (response && response.success && response.data) {
        const stats = response.data;

        InventoryKpiCardBuilder.renderGrid("invMovementsKpiGrid", [
          new InventoryKpiCardBuilder()
            .setValueId("movKpiTotalMovements")
            .setLabel("Total Movements")
            .setValue(Number(stats.total_movements || 0).toLocaleString())
            .setDescription("Historical Audit Entries")
            .setDescIcon("fa-clock-rotate-left", "#1677ff")
            .setIcon("fa-list-check", "blue")
            .toJSON(),
          new InventoryKpiCardBuilder()
            .setValueId("movKpiInwardQty")
            .setLabel("Stock Inward / GRN")
            .setValue("+" + Number(stats.inward_qty || 0).toLocaleString())
            .setValueColor("#52c41a")
            .setDescription("Purchased & Received")
            .setDescIcon("fa-arrow-down-long", "#52c41a")
            .setIcon("fa-boxes-packing", "green")
            .toJSON(),
          new InventoryKpiCardBuilder()
            .setValueId("movKpiOutwardQty")
            .setLabel("Stock Outward / Usage")
            .setValue("-" + Number(stats.outward_qty || 0).toLocaleString())
            .setValueColor("#faad14")
            .setDescription("Consumed in Print Jobs")
            .setDescIcon("fa-arrow-up-long", "#faad14")
            .setIcon("fa-truck-ramp-box", "yellow")
            .toJSON(),
          new InventoryKpiCardBuilder()
            .setValueId("movKpiAdjustments")
            .setLabel("Audits & Adjustments")
            .setValue(Number(stats.adjustment_count || 0).toLocaleString())
            .setValueColor("#722ed1")
            .setDescription("Variance Reconciliations")
            .setDescIcon("fa-scale-balanced", "#722ed1")
            .setIcon("fa-scale-balanced", "purple")
            .toJSON()
        ]);

        const badgeMovEl = document.getElementById("tabBadgeMovementsCount");
        if (badgeMovEl) {
          badgeMovEl.textContent = stats.total_movements || 0;
        }
      }
    } catch (err) {
      console.error("Error fetching movement stats:", err);
    }
  }

  /**
   * Render movement table rows into the DOM.
   * @param {Array} items
   */
  renderMovementsTable(items = []) {
    const tbody = this.getTbody();
    if (!tbody) return;

    if (items.length === 0) {
      this.renderEmpty("No stock movements found matching your filters");
      return;
    }

    tbody.innerHTML = "";
    items.forEach((item) => {
      const row = StockMovementRowBuilder.renderRow(item);
      tbody.appendChild(row);
    });
  }

  /**
   * Update the table counter indicator in the toolbar.
   */
  updateTableCount(showingCount, totalCount) {
    const countEl = document.getElementById("invMovementsTableCount");
    if (countEl) {
      countEl.textContent = `Showing ${showingCount} of ${totalCount} records`;
    }
  }
}
