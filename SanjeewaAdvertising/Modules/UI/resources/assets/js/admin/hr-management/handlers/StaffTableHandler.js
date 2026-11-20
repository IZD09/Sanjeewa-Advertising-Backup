/**
 * HR Staff Directory Table Handler
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Handles live search, status filtering, row injection, staff profile click,
 * quick actions (Salary, Pay, Change Status), and pagination (>20 rows)
 * using core BasePaginationHandler.
 */

"use strict";

import { BasePaginationHandler } from "../../../core/BasePaginationHandler.js";
import { HRManagementDataLoader } from "../HRManagementDataLoader.js";
import { StaffRowBuilder } from "../builders/StaffRowBuilder.js";

const STATUS_ROW_CLASSES = [
  "hr-status-row-active",
  "hr-status-row-on-leave",
  "hr-status-row-inactive",
  "hr-status-row-suspended",
  "hr-status-row-resigned",
];

export class StaffTableHandler {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.onViewStaffProfile]
   * @param {Function} [options.onQuickSetSalary]
   * @param {Function} [options.onQuickPayDaily]
   * @param {Function} [options.onChangeStaffStatus]
   * @param {number} [options.pageSize=20]
   */
  constructor(options = {}) {
    this.onViewStaffProfile = options.onViewStaffProfile || (() => {});
    this.onQuickSetSalary = options.onQuickSetSalary || (() => {});
    this.onQuickPayDaily = options.onQuickPayDaily || (() => {});
    this.onChangeStaffStatus = options.onChangeStaffStatus || (() => {});

    this.tbody = document.getElementById("hrStaffTableBody");
    this.searchInput = document.getElementById("searchHrStaff");
    this.statusSelect = document.getElementById("filterHrStaffStatus");
    this.paginationBar = document.getElementById("hrStaffPagination");

    this.pagination = new BasePaginationHandler({
      paginationInfoId: "hrStaffPageInfo",
      paginationControlsId: "hrStaffPageControls",
      pageSize: options.pageSize || 20,
      itemLabel: "staff members",
      onPageChange: () => this.applyFilter(),
    });

    this.bindEvents();
    this.applyFilter();
  }

  bindEvents() {
    this.searchInput?.addEventListener("input", () => {
      this.pagination.reset();
      this.applyFilter();
    });

    this.statusSelect?.addEventListener("change", () => {
      this.pagination.reset();
      this.applyFilter();
    });

    this.tbody?.addEventListener("click", (e) => {
      const salaryBtn = e.target.closest(".js-hr-quick-salary");
      if (salaryBtn) {
        const staffId = salaryBtn.getAttribute("data-staff-id");
        this.onQuickSetSalary(staffId);
        return;
      }

      const dailyPayBtn = e.target.closest(".js-hr-quick-daily-pay");
      if (dailyPayBtn) {
        const staffId = dailyPayBtn.getAttribute("data-staff-id");
        this.onQuickPayDaily(staffId);
        return;
      }

      const statusBtn = e.target.closest(".js-hr-change-status");
      if (statusBtn) {
        this.onChangeStaffStatus({
          id: statusBtn.getAttribute("data-staff-id"),
          name: statusBtn.getAttribute("data-staff-name") || "",
          nic: statusBtn.getAttribute("data-staff-nic") || "",
          statusId: statusBtn.getAttribute("data-status-id") || "",
          statusLabel: statusBtn.getAttribute("data-status-label") || "Active",
        });
        return;
      }

      // Clicking any staff member cell or row (outside action buttons) opens profile details modal
      if (e.target.closest(".hr-row-actions") || e.target.closest("button")) {
        return;
      }

      const staffTrigger = e.target.closest(".js-hr-view-staff") || e.target.closest("tr[data-staff-id]");
      if (staffTrigger) {
        const staffId = staffTrigger.getAttribute("data-staff-id");
        if (staffId) {
          this.onViewStaffProfile(staffId);
        }
      }
    });
  }

  escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Prepend a newly created staff member row into the Staff Directory table.
   *
   * @param {Object} member
   */
  prependStaffRow(member) {
    if (!this.tbody || !member) return;

    const emptyCell = this.tbody.querySelector(".hr-empty-cell");
    if (emptyCell) {
      emptyCell.closest("tr")?.remove();
    }

    this.tbody.insertAdjacentHTML("afterbegin", StaffRowBuilder.build(member));
    this.pagination.reset();
    this.applyFilter();
  }

  /**
   * Live-update a staff row's employment status badge, status row color class, and filter attributes.
   *
   * @param {number|string} staffId
   * @param {number|string} statusId
   * @param {string} statusLabel
   */
  updateStaffRowStatus(staffId, statusId, statusLabel) {
    if (!this.tbody || !staffId) return;

    const row = this.tbody.querySelector(`tr[data-staff-id="${staffId}"]`);
    if (!row) return;

    const badgeClass = HRManagementDataLoader.resolveStatusBadgeClass(statusLabel);
    const rowClass = HRManagementDataLoader.resolveStatusRowClass(statusLabel);

    row.classList.remove(...STATUS_ROW_CLASSES);
    row.classList.add(rowClass);
    row.setAttribute("data-staff-status", statusLabel);

    const statusCell = row.children[3];
    if (statusCell) {
      statusCell.innerHTML = `<span class="hr-tag ${badgeClass}"><span class="hr-dot"></span> ${this.escapeHtml(statusLabel)}</span>`;
    }

    const statusBtn = row.querySelector(".js-hr-change-status");
    if (statusBtn) {
      statusBtn.setAttribute("data-status-id", String(statusId));
      statusBtn.setAttribute("data-status-label", statusLabel);
    }

    this.applyFilter();
  }

  /**
   * Apply live text search, status filter, and 20-per-page pagination.
   */
  applyFilter() {
    if (!this.tbody) return;

    const query = (this.searchInput?.value || "").trim().toLowerCase();
    const status = this.statusSelect?.value || "ALL";
    const allRows = Array.from(this.tbody.querySelectorAll("tr[data-staff-search]"));

    const matchingRows = [];

    allRows.forEach((row) => {
      const hay = row.getAttribute("data-staff-search") || "";
      const rowStatus = row.getAttribute("data-staff-status") || "";
      const matchesQuery = !query || hay.includes(query);
      const matchesStatus = status === "ALL" || rowStatus.toLowerCase() === status.toLowerCase();

      row.style.display = "none";
      if (matchesQuery && matchesStatus) {
        matchingRows.push(row);
      }
    });

    const { pageItems, total, totalPages, activePage, pageSize } = this.pagination.paginate(matchingRows);
    pageItems.forEach((row) => {
      row.style.display = "";
    });

    if (this.paginationBar) {
      this.paginationBar.style.display = total > pageSize ? "flex" : "none";
    }

    this.pagination.renderPagination(total, totalPages, activePage, pageSize);
  }
}

export default StaffTableHandler;
