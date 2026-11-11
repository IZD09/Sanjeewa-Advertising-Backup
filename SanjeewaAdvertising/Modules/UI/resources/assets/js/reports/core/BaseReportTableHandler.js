/**
 * SanjeewaAdvertising - Base Report Table Handler
 *
 * Extends BaseTableLoader core class to provide column sorting (numeric/currency, date, text),
 * quick-sort dropdown synchronization, keyword search, category filtering, and table reset
 * across all 6 report tabs.
 */

import { BaseTableLoader } from "../../core/BaseTableLoader.js";

export class BaseReportTableHandler extends BaseTableLoader {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.tableId=""] - DOM ID of the report `<table class="rep-table">`
   * @param {Function} [options.showToast] - Callback to display toast feedback
   */
  constructor(options = {}) {
    super({
      tbodyId: options.tbodyId || (options.tableId ? `${options.tableId}Body` : ""),
      paginationInfoId: options.paginationInfoId || (options.tableId ? `${options.tableId.replace("Table", "")}PaginationInfo` : "paginationInfo"),
      paginationControlsId: options.paginationControlsId || (options.tableId ? `${options.tableId.replace("Table", "")}PaginationControls` : "paginationControls"),
      pageSize: options.pageSize || 15,
      itemLabel: options.itemLabel || "records",
      colspan: options.colspan || 8,
      rowBuilder: options.rowBuilder || null
    });

    this.tableId = options.tableId || "";
    this.showToast = options.showToast || (() => {});
    this.dataLoader = null;
    this.tabName = null;
    this.currentFilters = {
      page: 1,
      per_page: this.pageSize,
      search: "",
      filter: "all",
      sort_col: 0,
      sort_dir: "desc"
    };

    this.onPageChange = (page) => {
      this.currentFilters.page = page;
      if (this.dataLoader && this.tabName) {
        this.fetchData({ page });
      } else {
        this.renderPagination(this.totalCount, this.totalPages, page, this.pageSize);
      }
    };
  }

  /**
   * Bind server-side data source from ReportsDataLoader.
   * @param {import('../ReportsDataLoader.js').ReportsDataLoader} dataLoader
   * @param {string} tabName
   */
  setServerSource(dataLoader, tabName) {
    this.dataLoader = dataLoader;
    this.tabName = tabName;
  }

  /**
   * Fetch table data asynchronously from Reports module without page reload.
   * @param {Object} [filters={}]
   */
  async fetchData(filters = {}) {
    if (!this.dataLoader || !this.tabName) return;
    this.currentFilters = { ...this.currentFilters, ...filters };
    this.showLoading("Loading report data...");

    try {
      const response = await this.dataLoader.fetchTableData(this.tabName, this.currentFilters);
      if (response && response.success && response.table) {
        const { data, total, last_page, current_page, per_page } = response.table;
        this.renderServerData(data, total, last_page, current_page, per_page);
      }
    } catch (err) {
      console.error(`[BaseReportTableHandler] Failed to fetch table data for ${this.tabName}:`, err);
      this.renderEmptyState("Failed to load records. Please retry.");
    }
  }

  /**
   * Render rows and pagination controls from server response.
   */
  renderServerData(data = [], total = 0, lastPage = 1, currentPage = 1, pageSize = this.pageSize) {
    const tbody = this.getTbody();
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!data || data.length === 0) {
      this.renderEmptyState("No matching report records found for this period.");
      this.renderPagination(0, 1, 1, pageSize);
      return;
    }

    data.forEach((item, index) => {
      let tr = null;
      if (this.rowBuilder) {
        const builder = new this.rowBuilder();
        tr = builder.fromData(item).build().render();
      } else if (typeof item?.render === "function") {
        tr = item.render();
      }

      if (tr instanceof HTMLElement) {
        tbody.appendChild(tr);
      } else if (typeof tr === "string") {
        tbody.insertAdjacentHTML("beforeend", tr);
      }
    });

    this.renderPagination(total, lastPage, currentPage, pageSize);
  }

  /**
   * Retrieve the `<table class="rep-table">` element.
   * @returns {HTMLTableElement|null}
   */
  getTableElement() {
    return typeof document !== "undefined" && this.tableId
      ? document.getElementById(this.tableId)
      : null;
  }

  /**
   * Cache initial row indices (`data-initial-index`) so Reset restores original row order.
   */
  cacheInitialRowOrder() {
    const table = this.getTableElement();
    if (!table) return;
    const rows = table.querySelectorAll("tbody tr");
    rows.forEach((row, index) => {
      if (!row.hasAttribute("data-initial-index")) {
        row.setAttribute("data-initial-index", String(index));
      }
    });
  }

  /**
   * Parse cell text according to sortType (`number`, `date`, or `text`).
   * @param {string} cellText
   * @param {string} sortType
   * @returns {number|string}
   */
  parseCellValue(cellText, sortType = "text") {
    const clean = (cellText || "").trim();
    if (sortType === "number") {
      const isNegative = clean.startsWith("-") || clean.startsWith("(");
      const numericStr = clean.replace(/[^0-9.]/g, "");
      const val = parseFloat(numericStr);
      if (isNaN(val)) return 0;
      return isNegative ? -val : val;
    }
    if (sortType === "date") {
      const ts = Date.parse(clean);
      return isNaN(ts) ? 0 : ts;
    }
    return clean.toLowerCase();
  }

  /**
   * Sort the table rows by column index, direction (`asc` | `desc`), and data type.
   * If server source is configured, queries server asynchronously; otherwise sorts local DOM rows.
   *
   * @param {number} colIndex
   * @param {string} direction
   * @param {string} [sortType="text"]
   */
  sortTableByColumn(colIndex, direction = "asc", sortType = "text") {
    const table = this.getTableElement();
    if (!table) return;

    // Update header sort classes and icons
    const headers = table.querySelectorAll("thead th.rep-sortable");
    headers.forEach((th) => {
      const thCol = parseInt(th.getAttribute("data-sort-col") || "-1", 10);
      const icon = th.querySelector(".rep-sort-icon");
      th.classList.remove("sort-asc", "sort-desc");

      if (thCol === colIndex) {
        th.classList.add(direction === "asc" ? "sort-asc" : "sort-desc");
        if (icon) {
          icon.className = `fa-solid ${direction === "asc" ? "fa-sort-up" : "fa-sort-down"} rep-sort-icon`;
        }
      } else if (icon) {
        icon.className = "fa-solid fa-sort rep-sort-icon";
      }
    });

    if (this.dataLoader && this.tabName) {
      this.fetchData({ sort_col: colIndex, sort_dir: direction, page: 1 });
      return;
    }

    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll("tr"));
    if (rows.length <= 1) return;

    rows.sort((rowA, rowB) => {
      const cellA = rowA.children[colIndex]?.innerText || "";
      const cellB = rowB.children[colIndex]?.innerText || "";

      const valA = this.parseCellValue(cellA, sortType);
      const valB = this.parseCellValue(cellB, sortType);

      if (typeof valA === "number" && typeof valB === "number") {
        return direction === "asc" ? valA - valB : valB - valA;
      }
      return direction === "asc"
        ? String(valA).localeCompare(String(valB), undefined, { numeric: true })
        : String(valB).localeCompare(String(valA), undefined, { numeric: true });
    });

    rows.forEach((row) => tbody.appendChild(row));
  }

  /**
   * Filter table rows by search keyword and optional category/status dropdown value.
   * If server source is configured, fetches filtered rows asynchronously.
   *
   * @param {string} [searchQuery=""]
   * @param {string} [filterValue="all"]
   */
  filterRows(searchQuery = "", filterValue = "all") {
    if (this.dataLoader && this.tabName) {
      this.fetchData({ search: searchQuery, filter: filterValue, page: 1 });
      return;
    }

    const table = this.getTableElement();
    if (!table) return;

    const q = (searchQuery || "").toLowerCase().trim();
    const f = (filterValue || "all").toLowerCase().trim();

    const rows = table.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      const matchSearch = !q || text.includes(q);
      const matchFilter = !f || f === "all" || text.includes(f);
      row.style.display = matchSearch && matchFilter ? "" : "none";
    });
  }

  /**
   * Reset table row order, search input, filter dropdown, and sort dropdown.
   */
  resetTable() {
    const table = this.getTableElement();
    if (!table) return;

    table.querySelectorAll("thead th.rep-sortable").forEach((th) => {
      th.classList.remove("sort-asc", "sort-desc");
      const icon = th.querySelector(".rep-sort-icon");
      if (icon) icon.className = "fa-solid fa-sort rep-sort-icon";
    });

    document.querySelectorAll(`.rep-table-search[data-target-table="${this.tableId}"]`).forEach((inp) => {
      inp.value = "";
    });
    document.querySelectorAll(`.rep-filter-select[data-target-table="${this.tableId}"]`).forEach((sel) => {
      sel.selectedIndex = 0;
    });
    document.querySelectorAll(`.rep-sort-select[data-target-table="${this.tableId}"]`).forEach((sel) => {
      sel.selectedIndex = 0;
    });

    if (this.dataLoader && this.tabName) {
      this.currentFilters = {
        page: 1,
        per_page: this.pageSize,
        search: "",
        filter: "all",
        sort_col: 0,
        sort_dir: "desc"
      };
      this.fetchData(this.currentFilters);
      this.showToast("Table reset to initial records.");
      return;
    }

    const tbody = table.querySelector("tbody");
    if (tbody) {
      const rows = Array.from(tbody.querySelectorAll("tr"));
      rows.sort((a, b) => {
        const idxA = parseInt(a.getAttribute("data-initial-index") || "0", 10);
        const idxB = parseInt(b.getAttribute("data-initial-index") || "0", 10);
        return idxA - idxB;
      });
      rows.forEach((r) => {
        r.style.display = "";
        tbody.appendChild(r);
      });
    }

    this.showToast("Table sort order and filters reset to default.");
  }
}

export default BaseReportTableHandler;
