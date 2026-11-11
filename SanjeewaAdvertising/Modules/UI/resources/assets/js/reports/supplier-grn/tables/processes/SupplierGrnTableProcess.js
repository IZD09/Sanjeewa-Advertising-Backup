/**
 * SanjeewaAdvertising - Supplier & GRN Table Process
 *
 * Binds search input, quick-sort dropdown, sortable column headers,
 * and reset button for `#suppliersTable`.
 */

export class SupplierGrnTableProcess {
  constructor(context = {}) {
    this.tableHandler = context.tableHandler;
    this.tableId = "suppliersTable";
    this.searchTerm = "";
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
        this.tableHandler.filterRows(this.searchTerm, "all");
      });
    });

    document.querySelectorAll(`.rep-sort-select[data-target-table="${this.tableId}"]`).forEach((select) => {
      select.addEventListener("change", (e) => {
        const [col, dir, type] = (e.target.value || "6:desc:number").split(":");
        this.tableHandler.sortTableByColumn(parseInt(col || "6", 10), dir || "desc", type || "number");
      });
    });

    document.querySelectorAll(`.rep-btn-reset-table[data-target-table="${this.tableId}"]`).forEach((btn) => {
      btn.addEventListener("click", () => {
        this.searchTerm = "";
        this.tableHandler.resetTable();
      });
    });
  }
}

export default SupplierGrnTableProcess;
