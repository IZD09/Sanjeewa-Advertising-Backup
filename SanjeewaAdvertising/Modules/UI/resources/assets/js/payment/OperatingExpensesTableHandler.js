/**
 * SanjeewaAdvertising - Operating Expenses Table Handler
 *
 * Extends BaseTableLoader core class, utilizing OperatingExpenseRowBuilder
 * to render operating expenses (overhead & utility bills) with pagination,
 * search filtering, category filtering, and status filtering.
 */

import { BaseTableLoader } from "../core/BaseTableLoader.js";
import { OperatingExpenseRowBuilder, OperatingExpense } from "./OperatingExpenseRowBuilder.js";

export class OperatingExpensesTableHandler extends BaseTableLoader {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.formatCurrency]
   * @param {Function} [options.onOpenAddModal]
   * @param {Function} [options.onOpenMarkPaidModal]
   * @param {Function} [options.onUndoPaid]
   * @param {Function} [options.onPageChange]
   * @param {number} [options.pageSize=8]
   */
  constructor(options = {}) {
    super({
      tbodyId: "payExpenseTableBody",
      paginationInfoId: "payExpensePaginationInfo",
      paginationControlsId: "payExpensePaginationControls",
      pageSize: options.pageSize || 8,
      colspan: 8,
      emptyIcon: "fa-file-circle-check",
      emptyMessage: "No Operating Expense Bills Found",
      onPageChange: options.onPageChange,
      rowBuilder: OperatingExpenseRowBuilder
    });

    this.formatCurrency = options.formatCurrency || ((amt) => `Rs. ${(parseFloat(amt) || 0).toFixed(2)}`);
    this.onOpenAddModal = options.onOpenAddModal || (() => {});
    this.onOpenMarkPaidModal = options.onOpenMarkPaidModal || (() => {});
    this.onUndoPaid = options.onUndoPaid || (() => {});

    this.expenseMonthFilter = "2026-10";
    this.expenseSearch = "";
    this.expenseCategoryFilter = "ALL";
    this.expenseStatusFilter = "ALL";
  }

  setMonthFilter(m) {
    this.expenseMonthFilter = m;
  }

  setSearchFilter(s) {
    this.expenseSearch = (s || "").toLowerCase().trim();
  }

  setCategoryFilter(c) {
    this.expenseCategoryFilter = c;
  }

  setStatusFilter(st) {
    this.expenseStatusFilter = st;
  }

  getFilteredExpenses(expenses = []) {
    const allExpenses = expenses || [];

    // 1. Filter by month
    const monthFiltered = allExpenses.filter(b => {
      if (this.expenseMonthFilter === "ALL") return true;
      return b.month === this.expenseMonthFilter;
    });

    // 2. Filter by search term, category, and status
    return monthFiltered.filter(b => {
      const term = this.expenseSearch;
      const matchesSearch = !term ||
        (b.title && b.title.toLowerCase().includes(term)) ||
        (b.provider && b.provider.toLowerCase().includes(term)) ||
        (b.accountNo && b.accountNo.toLowerCase().includes(term)) ||
        (b.notes && b.notes.toLowerCase().includes(term)) ||
        (b.paidRef && b.paidRef.toLowerCase().includes(term));

      const matchesCategory = this.expenseCategoryFilter === "ALL" || b.category === this.expenseCategoryFilter;

      let matchesStatus = true;
      if (this.expenseStatusFilter === "Pending") {
        matchesStatus = b.status === "Pending";
      } else if (this.expenseStatusFilter === "Paid") {
        matchesStatus = b.status === "Paid";
      } else if (this.expenseStatusFilter === "Overdue") {
        matchesStatus = b.status === "Overdue" || (b.status === "Pending" && b.dueDate && new Date(b.dueDate) < new Date());
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  updateMetricsAndKPIs(allExpenses = []) {
    const monthExpenses = (allExpenses || []).filter(b => {
      if (this.expenseMonthFilter === "ALL") return true;
      return b.month === this.expenseMonthFilter;
    });

    const monthSelect = document.getElementById("expMonthSelect");
    const monthLabel = document.getElementById("expCurrentMonthLabel");

    if (monthSelect && this.expenseMonthFilter && monthSelect.value !== this.expenseMonthFilter) {
      monthSelect.value = this.expenseMonthFilter;
    }

    if (monthLabel) {
      if (this.expenseMonthFilter === "ALL") {
        monthLabel.textContent = "Billing Month: All Months (සියලු කාලසීමාවන්)";
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

    // Monthly KPIs
    const totalBilled = monthExpenses.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const paidList = monthExpenses.filter(b => b.status === "Paid");
    const pendingList = monthExpenses.filter(b => b.status === "Pending" || b.status === "Overdue");

    const totalPaid = paidList.reduce((sum, b) => sum + (Number(b.paidAmount || b.amount) || 0), 0);
    const totalPending = pendingList.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

    const paidCount = paidList.length;
    const pendingCount = pendingList.length;
    const progressPercent = totalBilled > 0
      ? Math.round((totalPaid / totalBilled) * 100)
      : (monthExpenses.length > 0 && pendingCount === 0 ? 100 : 0);

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setTxt("kpiExpTotalBilled", this.formatCurrency(totalBilled));
    setTxt("kpiExpTotalPaid", this.formatCurrency(totalPaid));
    setTxt("kpiExpPaidCount", `${paidCount} bills settled (${paidCount} ගෙවා ඇත)`);
    setTxt("kpiExpTotalPending", this.formatCurrency(totalPending));
    setTxt("kpiExpPendingCount", `${pendingCount} bills pending (ගෙවීමට ඉතිරි: ${pendingCount})`);
    setTxt("kpiExpProgressPercent", `${progressPercent}%`);

    const elProgressBar = document.getElementById("kpiExpProgressBar");
    if (elProgressBar) elProgressBar.style.width = `${progressPercent}%`;

    // Category Totals
    const catTotals = { Electricity: 0, "Water Board": 0, "Internet & Fiber": 0, "Shop Rent": 0, Other: 0 };
    monthExpenses.forEach(b => {
      const amt = Number(b.amount) || 0;
      if (b.category === "Electricity") catTotals.Electricity += amt;
      else if (b.category === "Water Board") catTotals["Water Board"] += amt;
      else if (b.category === "Internet & Fiber") catTotals["Internet & Fiber"] += amt;
      else if (b.category === "Shop Rent") catTotals["Shop Rent"] += amt;
      else catTotals.Other += amt;
    });

    setTxt("catTotalElectricity", `Rs. ${catTotals.Electricity.toLocaleString()}`);
    setTxt("catTotalWater", `Rs. ${catTotals["Water Board"].toLocaleString()}`);
    setTxt("catTotalInternet", `Rs. ${catTotals["Internet & Fiber"].toLocaleString()}`);
    setTxt("catTotalRent", `Rs. ${catTotals["Shop Rent"].toLocaleString()}`);
    setTxt("catTotalOther", `Rs. ${catTotals.Other.toLocaleString()}`);

    // Tab Badge
    const tabBadgeExp = document.getElementById("tabBadgeExpensesCount");
    if (tabBadgeExp) {
      const activePendingCount = (allExpenses || []).filter(b => (this.expenseMonthFilter === "ALL" || b.month === this.expenseMonthFilter) && b.status !== "Paid").length;
      tabBadgeExp.textContent = activePendingCount > 0 ? `${activePendingCount} Due` : `${monthExpenses.length} Bills`;
      tabBadgeExp.style.background = activePendingCount > 0 ? '#ef4444' : '#10b981';
      tabBadgeExp.style.color = '#ffffff';
    }
  }

  /**
   * Render table body rows and pagination controls using BaseTableLoader.
   *
   * @param {Array} expenses
   * @param {string} [search=this.expenseSearch]
   * @param {string} [categoryFilter=this.expenseCategoryFilter]
   * @param {string} [statusFilter=this.expenseStatusFilter]
   * @param {string} [monthFilter=this.expenseMonthFilter]
   * @param {number} [currentPage=this.currentPage]
   * @param {number} [pageSize=this.pageSize]
   */
  render(expenses = [], search = this.expenseSearch, categoryFilter = this.expenseCategoryFilter, statusFilter = this.expenseStatusFilter, monthFilter = this.expenseMonthFilter, currentPage = this.currentPage, pageSize = this.pageSize) {
    this.expenseSearch = search !== undefined ? search : this.expenseSearch;
    this.expenseCategoryFilter = categoryFilter !== undefined ? categoryFilter : this.expenseCategoryFilter;
    this.expenseStatusFilter = statusFilter !== undefined ? statusFilter : this.expenseStatusFilter;
    this.expenseMonthFilter = monthFilter !== undefined ? monthFilter : this.expenseMonthFilter;
    this.currentPage = currentPage || 1;
    this.pageSize = pageSize || 8;

    this.updateMetricsAndKPIs(expenses);

    const filtered = this.getFilteredExpenses(expenses);

    // Delegate row rendering and pagination to BaseTableLoader
    this.loadTable(filtered, (item) => {
      const bill = item instanceof OperatingExpense
        ? item
        : new OperatingExpenseRowBuilder(item).build();
      return bill.render();
    }, this.currentPage, this.pageSize);

    this.bindRowActions();
  }

  bindRowActions() {
    const tbody = this.getTbody();
    if (!tbody) return;

    tbody.querySelectorAll("[data-mark-paid-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = btn.getAttribute("data-mark-paid-id");
        this.onOpenMarkPaidModal(id);
      });
    });

    tbody.querySelectorAll("[data-undo-paid-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = btn.getAttribute("data-undo-paid-id");
        this.onUndoPaid(id);
      });
    });
  }

  renderPagination(totalCount, totalPages, currentPage, pageSize) {
    super.renderPagination(totalCount, totalPages, currentPage, pageSize);
    const infoElem = document.getElementById(this.paginationInfoId);
    if (infoElem && totalCount > 0) {
      const start = (currentPage - 1) * pageSize + 1;
      const end = Math.min(currentPage * pageSize, totalCount);
      infoElem.textContent = `Showing ${start}-${end} of ${totalCount} bills`;
    } else if (infoElem) {
      infoElem.textContent = "Showing 0 bills";
    }
  }
}

export const OperatingExpensesTableBuilder = OperatingExpensesTableHandler;
export const OperatingExpensesHandler = OperatingExpensesTableHandler;
export default OperatingExpensesTableHandler;

