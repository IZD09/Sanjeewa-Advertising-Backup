/**
 * SanjeewaAdvertising - Operating Expenses Handler
 *
 * Coordinates Operating Expenses (Monthly Overhead & Utility Bills):
 * - Month navigation and selection
 * - Top KPI metric calculations via PaymentKpiCardBuilder (Billed, Paid, Pending, Settlement Progress %)
 * - Overhead Bills by Category via ExpenseCategoryCardBuilder (Electricity, Water, Internet, Rent, Maintenance)
 * - Operating expenses table rendering via OperatingExpenseTableHandler (with BasePaginationHandler, 20 rows per page)
 */

import { PaymentKpiCardBuilder } from "../builders/PaymentKpiCardBuilder.js";
import { ExpenseCategoryCardBuilder } from "../builders/ExpenseCategoryCardBuilder.js";
import { OperatingExpenseTableHandler } from "./OperatingExpenseTableHandler.js";

export class OperatingExpensesHandler {
  /**
   * @param {Object} context
   * @param {Function} context.formatCurrency
   * @param {Function} context.onOpenAddModal
   * @param {Function} context.onOpenMarkPaidModal
   * @param {Function} context.onUndoPaid
   * @param {Function} [context.onPageChange]
   */
  constructor(context = {}) {
    this.ctx = context;
    this.expenseMonthFilter = "2026-10";
    this.expenseSearch = "";
    this.expenseCategoryFilter = "ALL";
    this.expenseStatusFilter = "ALL";

    this.tableHandler = new OperatingExpenseTableHandler({
      formatCurrency: context.formatCurrency,
      onOpenAddModal: context.onOpenAddModal,
      onOpenMarkPaidModal: context.onOpenMarkPaidModal,
      onUndoPaid: context.onUndoPaid,
      onPageChange: context.onPageChange,
      pageSize: 20
    });
  }

  setMonthFilter(month) {
    this.expenseMonthFilter = month;
  }

  setSearchFilter(search) {
    this.expenseSearch = (search || "").toLowerCase().trim();
  }

  setCategoryFilter(cat) {
    this.expenseCategoryFilter = cat;
  }

  setStatusFilter(status) {
    this.expenseStatusFilter = status;
  }

  /**
   * Render monthly bills tab:
   * 1. Month selector & labels
   * 2. Top KPI Cards via PaymentKpiCardBuilder
   * 3. Overhead Bills by Category via ExpenseCategoryCardBuilder
   * 4. Table with Pagination (max 20 rows) via OperatingExpenseTableHandler
   *
   * @param {Array} expenses
   * @param {boolean} [resetPage=false]
   */
  render(expenses = [], resetPage = false) {
    const allExpenses = Array.isArray(expenses) ? expenses : [];
    const monthSelect = document.getElementById("expMonthSelect");
    const monthLabel = document.getElementById("expCurrentMonthLabel");

    if (monthSelect && this.expenseMonthFilter && monthSelect.value !== this.expenseMonthFilter) {
      monthSelect.value = this.expenseMonthFilter;
    }

    if (monthLabel) {
      if (this.expenseMonthFilter === "ALL") {
        monthLabel.textContent = "Billing Month: All Months";
      } else {
        const [year, month] = this.expenseMonthFilter.split("-");
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        const monthName = monthNames[parseInt(month, 10) - 1] || month;
        monthLabel.textContent = `Billing Month: ${monthName} ${year}`;
      }
    }

    // 1. Top KPI Summary Cards via PaymentKpiCardBuilder
    PaymentKpiCardBuilder.buildExpenseMetrics(allExpenses, this.expenseMonthFilter);

    // 2. Overhead Bills by Category small cards via ExpenseCategoryCardBuilder
    const monthExpenses = allExpenses.filter(b => {
      if (!this.expenseMonthFilter || this.expenseMonthFilter === "ALL") return true;
      return b.month === this.expenseMonthFilter;
    });

    ExpenseCategoryCardBuilder.buildAll(monthExpenses, (categoryKey) => {
      this.expenseCategoryFilter = categoryKey;
      const catSelect = document.getElementById("payExpenseCategoryFilter");
      if (catSelect) catSelect.value = categoryKey;
      this.renderTable(allExpenses, true);
    });

    // 3. Render Table with BaseTableLoader and BasePaginationHandler
    this.renderTable(allExpenses, resetPage);
  }

  /**
   * Render table only with pagination.
   * @param {Array} expenses
   * @param {boolean} [resetPage=false]
   */
  renderTable(expenses = [], resetPage = false) {
    this.tableHandler.render(
      expenses,
      this.expenseSearch,
      this.expenseCategoryFilter,
      this.expenseStatusFilter,
      this.expenseMonthFilter,
      resetPage
    );
  }

  formatCurrency(amt) {
    if (this.ctx.formatCurrency) return this.ctx.formatCurrency(amt);
    return `Rs. ${(parseFloat(amt) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

export default OperatingExpensesHandler;
