/**
 * HR Daily Salary Payments Table Handler
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Handles live search, date filtering, paid-date row color grouping,
 * row insertion, and pagination (>20 rows) using core BasePaginationHandler.
 */

"use strict";

import { BasePaginationHandler } from "../../../core/BasePaginationHandler.js";
import { DailySalaryRowBuilder } from "../builders/DailySalaryRowBuilder.js";

const DATE_GROUP_CLASSES = [
  "hr-daily-date-0",
  "hr-daily-date-1",
  "hr-daily-date-2",
  "hr-daily-date-3",
  "hr-daily-date-4",
  "hr-daily-date-5",
];

export class DailySalaryTableHandler {
  /**
   * @param {Object} [options={}]
   * @param {number} [options.pageSize=20]
   */
  constructor(options = {}) {
    this.tbody = document.getElementById("hrDailySalariesTableBody");
    this.searchInput = document.getElementById("searchHrDailySalaries");
    this.dateInput = document.getElementById("filterHrDailyDate");
    this.clearDateBtn = document.getElementById("btnClearHrDailyDate");
    this.paginationBar = document.getElementById("hrDailySalariesPagination");

    this.pagination = new BasePaginationHandler({
      paginationInfoId: "hrDailySalariesPageInfo",
      paginationControlsId: "hrDailySalariesPageControls",
      pageSize: options.pageSize || 20,
      itemLabel: "daily payments",
      onPageChange: () => this.applyFilter(),
    });

    this.bindEvents();
    this.applyDateColors();
    this.applyFilter();
  }

  bindEvents() {
    this.searchInput?.addEventListener("input", () => {
      this.pagination.reset();
      this.applyFilter();
    });

    this.dateInput?.addEventListener("change", () => {
      this.pagination.reset();
      this.applyFilter();
    });

    this.clearDateBtn?.addEventListener("click", () => {
      if (this.dateInput) {
        this.dateInput.value = "";
        this.pagination.reset();
        this.applyFilter();
      }
    });
  }

  /**
   * Assign consistent row color classes grouped strictly by Paid Date (YYYY-MM-DD, ignoring time).
   * Rows paid on the same calendar date receive the same highlight tint.
   */
  applyDateColors() {
    if (!this.tbody) return;

    const rows = Array.from(this.tbody.querySelectorAll("tr[data-daily-date]"));
    const dateColorMap = new Map();
    let nextIndex = 0;

    rows.forEach((row) => {
      row.classList.remove(...DATE_GROUP_CLASSES);

      const payDate = (row.getAttribute("data-daily-date") || "").trim();
      if (!payDate) return;

      if (!dateColorMap.has(payDate)) {
        dateColorMap.set(payDate, nextIndex % DATE_GROUP_CLASSES.length);
        nextIndex++;
      }

      row.classList.add(DATE_GROUP_CLASSES[dateColorMap.get(payDate)]);
    });
  }

  /**
   * Prepend a newly recorded daily salary payment row into the Daily Salary Payments table.
   *
   * @param {Object} payment
   */
  prependDailySalaryRow(payment) {
    if (!this.tbody || !payment) return;

    const emptyCell = this.tbody.querySelector(".hr-empty-cell");
    if (emptyCell) {
      emptyCell.closest("tr")?.remove();
    }

    this.tbody.insertAdjacentHTML("afterbegin", DailySalaryRowBuilder.build(payment));
    this.applyDateColors();
    this.pagination.reset();
    this.applyFilter();
  }

  /**
   * Apply live search, payment date filter, and 20-per-page pagination.
   */
  applyFilter() {
    if (!this.tbody) return;

    const query = (this.searchInput?.value || "").trim().toLowerCase();
    const dateVal = this.dateInput?.value || "";
    const allRows = Array.from(this.tbody.querySelectorAll("tr[data-daily-search]"));
    const matchingRows = [];

    allRows.forEach((row) => {
      const hay = row.getAttribute("data-daily-search") || "";
      const rowDate = row.getAttribute("data-daily-date") || "";
      const matchesQuery = !query || hay.includes(query);
      const matchesDate = !dateVal || rowDate === dateVal;

      row.style.display = "none";
      if (matchesQuery && matchesDate) {
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

export default DailySalaryTableHandler;
