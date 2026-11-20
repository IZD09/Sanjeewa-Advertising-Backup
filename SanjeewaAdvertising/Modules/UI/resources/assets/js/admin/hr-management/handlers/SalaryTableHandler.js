/**
 * HR Base Salaries Table Handler
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Handles live search filtering, row insertion, and pagination (>20 rows)
 * using core BasePaginationHandler.
 */

"use strict";

import { BasePaginationHandler } from "../../../core/BasePaginationHandler.js";
import { SalaryRowBuilder } from "../builders/SalaryRowBuilder.js";

export class SalaryTableHandler {
  /**
   * @param {Object} [options={}]
   * @param {number} [options.pageSize=20]
   */
  constructor(options = {}) {
    this.tbody = document.getElementById("hrSalariesTableBody");
    this.searchInput = document.getElementById("searchHrSalaries");
    this.paginationBar = document.getElementById("hrSalariesPagination");

    this.pagination = new BasePaginationHandler({
      paginationInfoId: "hrSalariesPageInfo",
      paginationControlsId: "hrSalariesPageControls",
      pageSize: options.pageSize || 20,
      itemLabel: "salary records",
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
  }

  /**
   * Prepend a newly saved base salary record into the Base Salaries table.
   *
   * @param {Object} record
   */
  prependSalaryRow(record) {
    if (!this.tbody || !record) return;

    const emptyCell = this.tbody.querySelector(".hr-empty-cell");
    if (emptyCell) {
      emptyCell.closest("tr")?.remove();
    }

    this.tbody.insertAdjacentHTML("afterbegin", SalaryRowBuilder.build(record));
    this.pagination.reset();
    this.applyFilter();
  }

  /**
   * Apply live search filter and 20-per-page pagination to base salary rows.
   */
  applyFilter() {
    if (!this.tbody) return;

    const query = (this.searchInput?.value || "").trim().toLowerCase();
    const allRows = Array.from(this.tbody.querySelectorAll("tr[data-salary-search]"));
    const matchingRows = [];

    allRows.forEach((row) => {
      const hay = row.getAttribute("data-salary-search") || "";
      row.style.display = "none";
      if (!query || hay.includes(query)) {
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

export default SalaryTableHandler;
