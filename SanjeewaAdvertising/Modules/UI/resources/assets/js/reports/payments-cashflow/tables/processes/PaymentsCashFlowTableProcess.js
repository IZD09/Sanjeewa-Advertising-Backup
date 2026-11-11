/**
 * SanjeewaAdvertising - Payments, Cash Flow & Operating Expenses Table Process
 *
 * Binds search inputs, channel/status filter dropdowns, quick-sort dropdowns,
 * sortable column headers, and reset buttons for both `#cashFlowTable` and `#operatingExpensesTable`.
 */

export class PaymentsCashFlowTableProcess {
  /**
   * @param {Object} context
   * @param {import('../handlers/PaymentsCashFlowTableHandler.js').PaymentsCashFlowTableHandler} context.cashFlowTableHandler
   * @param {import('../handlers/PaymentsCashFlowTableHandler.js').OperatingExpensesReportTableHandler} context.operatingExpensesTableHandler
   */
  constructor(context = {}) {
    this.cashFlowTableHandler = context.cashFlowTableHandler;
    this.operatingExpensesTableHandler = context.operatingExpensesTableHandler;
  }

  bindEvents() {
    this.bindTableProcess(this.cashFlowTableHandler, "cashFlowTable");
    this.bindTableProcess(this.operatingExpensesTableHandler, "operatingExpensesTable");
  }

  bindTableProcess(handler, tableId) {
    if (!handler) return;
    handler.cacheInitialRowOrder();

    let searchTerm = "";
    let filterVal = "all";

    const table = handler.getTableElement();
    if (table) {
      table.querySelectorAll("thead th.rep-sortable").forEach((th) => {
        th.addEventListener("click", () => {
          const colIndex = parseInt(th.getAttribute("data-sort-col") || "0", 10);
          const sortType = th.getAttribute("data-sort-type") || "text";
          const currentDir = th.classList.contains("sort-asc") ? "asc" : th.classList.contains("sort-desc") ? "desc" : null;
          const nextDir = currentDir === "asc" ? "desc" : "asc";
          handler.sortTableByColumn(colIndex, nextDir, sortType);
        });
      });
    }

    document.querySelectorAll(`.rep-table-search[data-target-table="${tableId}"]`).forEach((input) => {
      input.addEventListener("input", (e) => {
        searchTerm = e.target.value;
        handler.filterRows(searchTerm, filterVal);
      });
    });

    document.querySelectorAll(`.rep-filter-select[data-target-table="${tableId}"]`).forEach((select) => {
      select.addEventListener("change", (e) => {
        filterVal = e.target.value;
        handler.filterRows(searchTerm, filterVal);
      });
    });

    document.querySelectorAll(`.rep-sort-select[data-target-table="${tableId}"]`).forEach((select) => {
      select.addEventListener("change", (e) => {
        const [col, dir, type] = (e.target.value || "0:desc:text").split(":");
        handler.sortTableByColumn(parseInt(col || "0", 10), dir || "desc", type || "text");
      });
    });

    document.querySelectorAll(`.rep-btn-reset-table[data-target-table="${tableId}"]`).forEach((btn) => {
      btn.addEventListener("click", () => {
        searchTerm = "";
        filterVal = "all";
        handler.resetTable();
      });
    });
  }
}

export default PaymentsCashFlowTableProcess;
