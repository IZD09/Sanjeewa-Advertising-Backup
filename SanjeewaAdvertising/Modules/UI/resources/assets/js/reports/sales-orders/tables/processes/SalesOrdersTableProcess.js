/**
 * SanjeewaAdvertising - Sales & Orders Table Process
 *
 * Binds search input, category filter, quick-sort dropdown, sortable column headers,
 * and reset button for `#salesTable`.
 */

export class SalesOrdersTableProcess {
  /**
   * @param {Object} context
   * @param {import('../handlers/SalesOrdersTableHandler.js').SalesOrdersTableHandler} context.tableHandler
   */
  constructor(context = {}) {
    this.tableHandler = context.tableHandler;
    this.tableId = "salesTable";
    this.searchTerm = "";
    this.categoryFilter = "all";
  }

  bindEvents() {
    if (!this.tableHandler) return;
    this.tableHandler.cacheInitialRowOrder();

    const table = this.tableHandler.getTableElement();
    if (table) {
      table.querySelectorAll("thead th.rep-sortable").forEach((th) => {
        th.addEventListener("click", () => {
          const colIndex = parseInt(th.getAttribute("data-sort-col") || "0", 10);
          const sortType = th.getAttribute("data-sort-type") || "text";
          const currentDir = th.classList.contains("sort-asc") ? "asc" : th.classList.contains("sort-desc") ? "desc" : null;
          const nextDir = currentDir === "asc" ? "desc" : "asc";
          this.tableHandler.sortTableByColumn(colIndex, nextDir, sortType);
        });
      });
    }

    document.querySelectorAll(`.rep-table-search[data-target-table="${this.tableId}"]`).forEach((input) => {
      input.addEventListener("input", (e) => {
        this.searchTerm = e.target.value;
        this.tableHandler.filterRows(this.searchTerm, this.categoryFilter);
      });
    });

    document.querySelectorAll(`.rep-filter-select[data-target-table="${this.tableId}"]`).forEach((select) => {
      select.addEventListener("change", (e) => {
        this.categoryFilter = e.target.value;
        this.tableHandler.filterRows(this.searchTerm, this.categoryFilter);
      });
    });

    document.querySelectorAll(`.rep-sort-select[data-target-table="${this.tableId}"]`).forEach((select) => {
      select.addEventListener("change", (e) => {
        const [col, dir, type] = (e.target.value || "0:desc:text").split(":");
        this.tableHandler.sortTableByColumn(parseInt(col || "0", 10), dir || "desc", type || "text");
      });
    });

    document.querySelectorAll(`.rep-btn-reset-table[data-target-table="${this.tableId}"]`).forEach((btn) => {
      btn.addEventListener("click", () => {
        this.searchTerm = "";
        this.categoryFilter = "all";
        this.tableHandler.resetTable();
      });
    });
  }
}

export default SalesOrdersTableProcess;
