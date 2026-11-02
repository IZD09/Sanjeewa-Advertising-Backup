/**
 * SanjeewaAdvertising - Payments Filter Process
 *
 * Manages search keyword inputs, status dropdowns, payment method filters,
 * and filter reset actions for:
 * 1. Invoice Payments
 * 2. GRN Supplier Payments
 * 3. Operating Expense Bills (including month filtering)
 */

export class FilterProcess {
  /**
   * @param {Object} context
   * @param {Function} context.renderInvoiceTable
   * @param {Function} context.renderGrnTable
   * @param {Function} context.renderExpenses
   * @param {Function} context.setExpenseMonth
   * @param {Function} context.setExpenseSearch
   * @param {Function} context.setExpenseCategory
   * @param {Function} context.setExpenseStatus
   * @param {Function} [context.showToast]
   */
  constructor(context) {
    this.ctx = context;

    // Filters for Invoice Payments
    this.invoiceSearch = "";
    this.invoiceStatusFilter = "ALL";
    this.invoiceMethodFilter = "ALL";

    // Filters for GRN Payments
    this.grnSearch = "";
    this.grnStatusFilter = "ALL";
    this.grnMethodFilter = "ALL";
  }

  bindEvents() {
    // 1. Invoice Filters
    const invSearch = document.getElementById("payInvoiceSearch");
    if (invSearch) {
      invSearch.addEventListener("input", (e) => {
        this.invoiceSearch = e.target.value.toLowerCase().trim();
        if (this.ctx.renderInvoiceTable) this.ctx.renderInvoiceTable();
      });
    }

    const invStatus = document.getElementById("payInvoiceStatusFilter");
    if (invStatus) {
      invStatus.addEventListener("change", (e) => {
        this.invoiceStatusFilter = e.target.value;
        if (this.ctx.renderInvoiceTable) this.ctx.renderInvoiceTable();
      });
    }

    const invMethod = document.getElementById("payInvoiceMethodFilter");
    if (invMethod) {
      invMethod.addEventListener("change", (e) => {
        this.invoiceMethodFilter = e.target.value;
        if (this.ctx.renderInvoiceTable) this.ctx.renderInvoiceTable();
      });
    }

    const invReset = document.getElementById("payInvoiceResetFilters");
    if (invReset) {
      invReset.addEventListener("click", () => {
        this.invoiceSearch = "";
        this.invoiceStatusFilter = "ALL";
        this.invoiceMethodFilter = "ALL";
        if (invSearch) invSearch.value = "";
        if (invStatus) invStatus.value = "ALL";
        if (invMethod) invMethod.value = "ALL";
        if (this.ctx.renderInvoiceTable) this.ctx.renderInvoiceTable();
      });
    }

    // 2. GRN Filters
    const grnSearch = document.getElementById("payGrnSearch");
    if (grnSearch) {
      grnSearch.addEventListener("input", (e) => {
        this.grnSearch = e.target.value.toLowerCase().trim();
        if (this.ctx.renderGrnTable) this.ctx.renderGrnTable();
      });
    }

    const grnStatus = document.getElementById("payGrnStatusFilter");
    if (grnStatus) {
      grnStatus.addEventListener("change", (e) => {
        this.grnStatusFilter = e.target.value;
        if (this.ctx.renderGrnTable) this.ctx.renderGrnTable();
      });
    }

    const grnMethod = document.getElementById("payGrnMethodFilter");
    if (grnMethod) {
      grnMethod.addEventListener("change", (e) => {
        this.grnMethodFilter = e.target.value;
        if (this.ctx.renderGrnTable) this.ctx.renderGrnTable();
      });
    }

    const grnReset = document.getElementById("payGrnResetFilters");
    if (grnReset) {
      grnReset.addEventListener("click", () => {
        this.grnSearch = "";
        this.grnStatusFilter = "ALL";
        this.grnMethodFilter = "ALL";
        if (grnSearch) grnSearch.value = "";
        if (grnStatus) grnStatus.value = "ALL";
        if (grnMethod) grnMethod.value = "ALL";
        if (this.ctx.renderGrnTable) this.ctx.renderGrnTable();
      });
    }

    // 3. Operating Expenses Filters
    const expMonthSelect = document.getElementById("expMonthSelect");
    if (expMonthSelect) {
      expMonthSelect.addEventListener("change", (e) => {
        if (this.ctx.setExpenseMonth) this.ctx.setExpenseMonth(e.target.value);
        if (this.ctx.renderExpenses) this.ctx.renderExpenses();
      });
    }

    const btnExpThisMonth = document.getElementById("btnExpThisMonth");
    if (btnExpThisMonth) {
      btnExpThisMonth.addEventListener("click", () => {
        const thisMonth = "2026-10";
        if (expMonthSelect) expMonthSelect.value = thisMonth;
        if (this.ctx.setExpenseMonth) this.ctx.setExpenseMonth(thisMonth);
        if (this.ctx.renderExpenses) this.ctx.renderExpenses();
        if (this.ctx.showToast) this.ctx.showToast("Filtered Operating Bills: This Month (2026-10)");
      });
    }

    const expSearch = document.getElementById("payExpenseSearch");
    if (expSearch) {
      expSearch.addEventListener("input", (e) => {
        if (this.ctx.setExpenseSearch) this.ctx.setExpenseSearch(e.target.value);
        if (this.ctx.renderExpenses) this.ctx.renderExpenses();
      });
    }

    const expCatFilter = document.getElementById("payExpenseCategoryFilter");
    if (expCatFilter) {
      expCatFilter.addEventListener("change", (e) => {
        if (this.ctx.setExpenseCategory) this.ctx.setExpenseCategory(e.target.value);
        if (this.ctx.renderExpenses) this.ctx.renderExpenses();
      });
    }

    const expStatFilter = document.getElementById("payExpenseStatusFilter");
    if (expStatFilter) {
      expStatFilter.addEventListener("change", (e) => {
        if (this.ctx.setExpenseStatus) this.ctx.setExpenseStatus(e.target.value);
        if (this.ctx.renderExpenses) this.ctx.renderExpenses();
      });
    }

    const expReset = document.getElementById("payExpenseResetFilters");
    if (expReset) {
      expReset.addEventListener("click", () => {
        if (expSearch) expSearch.value = "";
        if (expCatFilter) expCatFilter.value = "ALL";
        if (expStatFilter) expStatFilter.value = "ALL";
        if (this.ctx.setExpenseSearch) this.ctx.setExpenseSearch("");
        if (this.ctx.setExpenseCategory) this.ctx.setExpenseCategory("ALL");
        if (this.ctx.setExpenseStatus) this.ctx.setExpenseStatus("ALL");
        if (this.ctx.renderExpenses) this.ctx.renderExpenses();
      });
    }
  }

  applyConceptFilter(targetTab, filterType, filterVal) {
    if (targetTab === "expenses") {
      if (filterType === "expense-category") {
        const catSelect = document.getElementById("payExpenseCategoryFilter");
        if (catSelect) catSelect.value = filterVal;
        if (this.ctx.setExpenseCategory) this.ctx.setExpenseCategory(filterVal);
        if (this.ctx.renderExpenses) this.ctx.renderExpenses();
        if (this.ctx.showToast) this.ctx.showToast(`Filtered Operating Bills by Category: ${filterVal}`);
      } else if (filterType === "expense-status") {
        const statSelect = document.getElementById("payExpenseStatusFilter");
        if (statSelect) statSelect.value = filterVal;
        if (this.ctx.setExpenseStatus) this.ctx.setExpenseStatus(filterVal);
        if (this.ctx.renderExpenses) this.ctx.renderExpenses();
        if (this.ctx.showToast) this.ctx.showToast(`Filtered Operating Bills by Status: ${filterVal}`);
      }
      const table = document.querySelector("#payTabPaneExpenses .pay-table-card");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }

    if (targetTab === "invoice") {
      if (filterType === "stage") {
        const statSelect = document.getElementById("payInvoiceStatusFilter");
        if (statSelect) statSelect.value = filterVal;
        this.invoiceStatusFilter = filterVal;
        if (this.ctx.renderInvoiceTable) this.ctx.renderInvoiceTable();
      } else if (filterType === "method") {
        const methodSelect = document.getElementById("payInvoiceMethodFilter");
        if (methodSelect) methodSelect.value = filterVal;
        this.invoiceMethodFilter = filterVal;
        if (this.ctx.renderInvoiceTable) this.ctx.renderInvoiceTable();
      }
      const table = document.querySelector("#payTabPaneInvoice .pay-table-card");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else if (targetTab === "grn") {
      if (filterType === "stage") {
        const statSelect = document.getElementById("payGrnStatusFilter");
        if (statSelect) statSelect.value = filterVal;
        this.grnStatusFilter = filterVal;
        if (this.ctx.renderGrnTable) this.ctx.renderGrnTable();
      } else if (filterType === "method") {
        const methodSelect = document.getElementById("payGrnMethodFilter");
        if (methodSelect) methodSelect.value = filterVal;
        this.grnMethodFilter = filterVal;
        if (this.ctx.renderGrnTable) this.ctx.renderGrnTable();
      }
      const table = document.querySelector("#payTabPaneGrn .pay-table-card");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
}
