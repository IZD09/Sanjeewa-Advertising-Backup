/**
 * Admin Activities Table & Filter Handler
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

import { AdminActivityRowBuilder } from "../builders/AdminActivityRowBuilder.js";

export class AdminActivitiesHandler {
  /**
   * @param {Object} [options={}]
   * @param {Object} options.dataLoader
   * @param {Function} [options.onActivitiesRefreshed]
   * @param {Function} [options.onShowToast]
   */
  constructor(options = {}) {
    this.dataLoader = options.dataLoader;
    this.onActivitiesRefreshed = options.onActivitiesRefreshed || (() => {});
    this.onShowToast = options.onShowToast || (() => {});

    this.tableBody = document.getElementById("adminActivitiesTableBody");
    this.searchInput = document.getElementById("adminActivitySearchInput");
    this.typeSelect = document.getElementById("adminActivityTypeSelect");
    this.btnRefresh = document.getElementById("btnRefreshAdminActivities");
    this.countInfo = document.getElementById("adminActivitiesCountInfo");
    this.btnPrev = document.getElementById("btnAdminActPrev");
    this.btnNext = document.getElementById("btnAdminActNext");

    this.currentPage = 1;
    this.pageSize = 15;
    this.searchTerm = "";
    this.typeFilter = "ALL";

    this.bindEvents();
  }

  bindEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        this.searchTerm = (e.target.value || "").trim().toLowerCase();
        this.currentPage = 1;
        this.render();
      });
    }

    if (this.typeSelect) {
      this.typeSelect.addEventListener("change", (e) => {
        this.typeFilter = e.target.value || "ALL";
        this.currentPage = 1;
        this.render();
      });
    }

    if (this.btnRefresh) {
      this.btnRefresh.addEventListener("click", () => {
        this.refresh();
      });
    }

    if (this.btnPrev) {
      this.btnPrev.addEventListener("click", () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.render();
        }
      });
    }

    if (this.btnNext) {
      this.btnNext.addEventListener("click", () => {
        this.currentPage++;
        this.render();
      });
    }
  }

  /**
   * Populate activity type filter dropdown from current activity records.
   */
  populateTypeFilter() {
    if (!this.typeSelect) return;

    const currentVal = this.typeSelect.value || "ALL";
    const activities = this.dataLoader?.getActivities() || [];
    const types = new Set();

    activities.forEach((item) => {
      if (item.type) types.add(item.type);
    });

    let optionsHtml = '<option value="ALL">All Activity Types</option>';
    Array.from(types)
      .sort()
      .forEach((type) => {
        optionsHtml += `<option value="${type}" ${currentVal === type ? "selected" : ""}>${type}</option>`;
      });

    this.typeSelect.innerHTML = optionsHtml;
  }

  /**
   * Refresh activity logs from backend API.
   */
  async refresh() {
    if (!this.dataLoader) return;

    if (this.btnRefresh) {
      this.btnRefresh.disabled = true;
      this.btnRefresh.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Refreshing...';
    }

    try {
      const activities = await this.dataLoader.fetchActivities(100);
      this.populateTypeFilter();
      this.render();
      this.onActivitiesRefreshed(activities);
      this.onShowToast("Admin activities refreshed successfully.", "success");
    } catch (err) {
      console.warn("[AdminActivitiesHandler] Failed to fetch activities:", err);
      this.onShowToast("Failed to refresh activities.", "danger");
    } finally {
      if (this.btnRefresh) {
        this.btnRefresh.disabled = false;
        this.btnRefresh.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Refresh';
      }
    }
  }

  /**
   * Filter, paginate, and render activities table rows.
   */
  render() {
    if (!this.tableBody) return;

    let filtered = this.dataLoader?.getActivities() || [];

    if (this.typeFilter && this.typeFilter !== "ALL") {
      filtered = filtered.filter(
        (item) => String(item.type || "").toLowerCase() === this.typeFilter.toLowerCase()
      );
    }

    if (this.searchTerm) {
      filtered = filtered.filter((item) => {
        const text = `${item.id || ""} ${item.type || ""} ${item.action || ""} ${item.message || ""} ${JSON.stringify(item.details || {})}`.toLowerCase();
        return text.includes(this.searchTerm);
      });
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / this.pageSize) || 1;
    if (this.currentPage > totalPages) this.currentPage = totalPages;
    if (this.currentPage < 1) this.currentPage = 1;

    const startIdx = (this.currentPage - 1) * this.pageSize;
    const pageItems = filtered.slice(startIdx, startIdx + this.pageSize);

    if (this.countInfo) {
      const from = total === 0 ? 0 : startIdx + 1;
      const to = Math.min(startIdx + this.pageSize, total);
      this.countInfo.textContent = `Showing ${from}-${to} of ${total} activities (Page ${this.currentPage} of ${totalPages})`;
    }

    if (this.btnPrev) {
      this.btnPrev.disabled = this.currentPage <= 1;
    }

    if (this.btnNext) {
      this.btnNext.disabled = this.currentPage >= totalPages;
    }

    if (pageItems.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; color: var(--text-muted); padding: 36px 16px;">
            <div style="font-size: 28px; color: #cbd5e1; margin-bottom: 8px;">
              <i class="fa-solid fa-list-check"></i>
            </div>
            <div style="font-size: 14px; font-weight: 600; color: var(--text);">No activities recorded</div>
            <div style="font-size: 12px; margin-top: 4px;">No administrative activities match your current filter criteria.</div>
          </td>
        </tr>
      `;
      return;
    }

    this.tableBody.innerHTML = pageItems.map((item) => AdminActivityRowBuilder.build(item)).join("");
  }
}

export default AdminActivitiesHandler;
