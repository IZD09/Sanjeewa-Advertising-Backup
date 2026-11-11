/**
 * SanjeewaAdvertising - Operating Expense Table Handler
 *
 * Extends BaseTableLoader core class (which extends BasePaginationHandler),
 * utilizing OperatingExpenseRowBuilder to filter, paginate (20 rows per page),
 * and render Monthly Operating Bills & Utility Expenses without page reloads.
 */

import { BaseTableLoader } from "../../core/BaseTableLoader.js";
import { OperatingExpenseRowBuilder, OperatingExpenseEntity } from "../builders/OperatingExpenseRowBuilder.js";

export class OperatingExpenseTableHandler extends BaseTableLoader {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.formatCurrency]
   * @param {Function} [options.onOpenAddModal]
   * @param {Function} [options.onOpenMarkPaidModal]
   * @param {Function} [options.onUndoPaid]
   * @param {Function} [options.onPageChange]
   * @param {number} [options.pageSize=20]
   */
  constructor(options = {}) {
    super({
      tbodyId: "payExpenseTableBody",
      paginationInfoId: "payExpensePaginationInfo",
      paginationControlsId: "payExpensePaginationControls",
      pageSize: options.pageSize || 20,
      colspan: 8,
      emptyIcon: "fa-receipt",
      emptyMessage: "No operating expenses match the selected filters.",
      itemLabel: "bills",
      onPageChange: (page) => {
        this.currentPage = page;
        this.renderCurrent();
        if (options.onPageChange) options.onPageChange(page);
      },
      rowBuilder: OperatingExpenseRowBuilder
    });

    this.formatCurrency = options.formatCurrency || ((amt) => `Rs. ${(parseFloat(amt) || 0).toFixed(2)}`);
    this.onOpenAddModal = options.onOpenAddModal || (() => {});
    this.onOpenMarkPaidModal = options.onOpenMarkPaidModal || (() => {});
    this.onUndoPaid = options.onUndoPaid || (() => {});

    this.lastDataset = [];
    this.lastSearch = "";
    this.lastCategory = "ALL";
    this.lastStatus = "ALL";
    this.lastMonth = "ALL";
  }

  /**
   * Filter expenses by month, search keyword, category, and status.
   *
   * @param {Array} expenses
   * @param {string} expenseSearch
   * @param {string} expenseCategoryFilter
   * @param {string} expenseStatusFilter
   * @param {string} expenseMonthFilter
   * @returns {Array}
   */
  getFilteredExpenses(expenses = [], expenseSearch = "", expenseCategoryFilter = "ALL", expenseStatusFilter = "ALL", expenseMonthFilter = "ALL") {
    const term = (expenseSearch || "").toLowerCase().trim();

    return (expenses || []).filter(b => {
      // Month match
      if (expenseMonthFilter && expenseMonthFilter !== "ALL" && b.month !== expenseMonthFilter) {
        return false;
      }

      // Search match
      const title = String(b.title || "").toLowerCase();
      const provider = String(b.provider || "").toLowerCase();
      const accountNo = String(b.accountNo || b.account_no || "").toLowerCase();
      const id = String(b.id || "").toLowerCase();
      const notes = String(b.notes || "").toLowerCase();

      const matchesSearch = !term ||
        title.includes(term) ||
        provider.includes(term) ||
        accountNo.includes(term) ||
        id.includes(term) ||
        notes.includes(term);

      // Category match
      let matchesCat = (expenseCategoryFilter === "ALL");
      if (!matchesCat) {
        const cat = b.category || "";
        if (expenseCategoryFilter === "Electricity" && (cat.includes("Electric") || cat === "Electricity")) {
          matchesCat = true;
        } else if (expenseCategoryFilter === "Water Board" && (cat.includes("Water") || cat === "Water Board")) {
          matchesCat = true;
        } else if (expenseCategoryFilter === "Internet & Fiber" && (cat.includes("Internet") || cat.includes("Fiber") || cat.includes("Telecom"))) {
          matchesCat = true;
        } else if (expenseCategoryFilter === "Shop Rent" && (cat.includes("Rent") || cat === "Shop Rent")) {
          matchesCat = true;
        } else if (expenseCategoryFilter === "Maintenance & Other" && (cat.includes("Maintenance") || cat === "Maintenance & Other")) {
          matchesCat = true;
        } else {
          matchesCat = (cat === expenseCategoryFilter);
        }
      }

      // Status match
      const status = b.status || "Pending";
      const matchesStatus = (expenseStatusFilter === "ALL" || status === expenseStatusFilter);

      return matchesSearch && matchesCat && matchesStatus;
    });
  }

  /**
   * Filter, paginate (20 per page), and render table rows.
   *
   * @param {Array} expenses
   * @param {string} expenseSearch
   * @param {string} expenseCategoryFilter
   * @param {string} expenseStatusFilter
   * @param {string} expenseMonthFilter
   * @param {boolean} [resetPage=false]
   */
  render(expenses = [], expenseSearch = "", expenseCategoryFilter = "ALL", expenseStatusFilter = "ALL", expenseMonthFilter = "ALL", resetPage = false) {
    if (resetPage || expenseSearch !== this.lastSearch || expenseCategoryFilter !== this.lastCategory || expenseStatusFilter !== this.lastStatus || expenseMonthFilter !== this.lastMonth) {
      this.currentPage = 1;
    }

    this.lastDataset = expenses || [];
    this.lastSearch = expenseSearch || "";
    this.lastCategory = expenseCategoryFilter || "ALL";
    this.lastStatus = expenseStatusFilter || "ALL";
    this.lastMonth = expenseMonthFilter || "ALL";

    this.renderCurrent();
  }

  /**
   * Render table using stored criteria and active page.
   */
  renderCurrent() {
    const tbody = this.getTbody();
    if (!tbody) return;

    const filtered = this.getFilteredExpenses(
      this.lastDataset,
      this.lastSearch,
      this.lastCategory,
      this.lastStatus,
      this.lastMonth
    );

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${this.colspan}" style="text-align: center; padding: 44px 16px; color: var(--text-muted);">
            <div style="font-size: 32px; margin-bottom: 8px; color: #cbd5e1;">
              <i class="fa-solid fa-receipt"></i>
            </div>
            <div style="font-size: 14px; font-weight: 600; color: var(--text);">
              No operating expenses match the selected filters.
            </div>
            <div style="font-size: 12px; margin-top: 4px;">
              Adjust month or search keyword, or record a new utility bill.
            </div>
            <button type="button" class="po-btn po-btn-secondary" id="btnEmptyAddExpense" style="margin-top: 14px; display: inline-flex; align-items: center; gap: 6px; border-radius: 8px;">
              <i class="fa-solid fa-plus"></i> Add Monthly Bill
            </button>
          </td>
        </tr>
      `;

      const btnEmptyAdd = document.getElementById("btnEmptyAddExpense");
      if (btnEmptyAdd && this.onOpenAddModal) {
        btnEmptyAdd.addEventListener("click", () => this.onOpenAddModal());
      }

      this.renderPagination(0, 1, 1, this.pageSize, "bills");
      return;
    }

    // Paginate: max 20 rows per page
    const paginated = this.paginate(filtered, this.currentPage, this.pageSize);

    tbody.innerHTML = "";

    paginated.pageItems.forEach(b => {
      const entity = b instanceof OperatingExpenseEntity
        ? b
        : new OperatingExpenseRowBuilder(b).build();
      tbody.appendChild(entity.render());
    });

    // Bind action buttons in table
    tbody.querySelectorAll("[data-mark-paid-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-mark-paid-id");
        if (this.onOpenMarkPaidModal) this.onOpenMarkPaidModal(id);
      });
    });

    tbody.querySelectorAll("[data-undo-paid-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-undo-paid-id");
        if (this.onUndoPaid) this.onUndoPaid(id);
      });
    });

    // Render standard pagination bar & navigation controls without reload
    this.renderPagination(
      paginated.total,
      paginated.totalPages,
      paginated.activePage,
      this.pageSize,
      "bills"
    );
  }
}

export default OperatingExpenseTableHandler;
