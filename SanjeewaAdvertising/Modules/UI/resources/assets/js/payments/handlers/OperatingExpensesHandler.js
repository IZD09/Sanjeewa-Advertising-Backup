/**
 * SanjeewaAdvertising - Operating Expenses Handler
 *
 * Handles rendering for Operating Expenses (Monthly Overhead & Utility Bills):
 * - Month navigation and selection
 * - Monthly KPI metric calculations (Billed, Paid, Pending, Settlement Progress %)
 * - Category totals (Electricity, Water, Internet, Rent, Maintenance)
 * - Operating expenses table rendering via OperatingExpenseRowBuilder
 */

import { OperatingExpenseRowBuilder, OperatingExpenseEntity } from "../builders/OperatingExpenseRowBuilder.js";

export class OperatingExpensesHandler {
  /**
   * @param {Object} context
   * @param {Function} context.formatCurrency
   * @param {Function} context.onOpenAddModal
   * @param {Function} context.onOpenMarkPaidModal
   * @param {Function} context.onUndoPaid
   */
  constructor(context) {
    this.ctx = context;
    this.expenseMonthFilter = "2026-10";
    this.expenseSearch = "";
    this.expenseCategoryFilter = "ALL";
    this.expenseStatusFilter = "ALL";
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

  render(expenses) {
    const allExpenses = expenses || [];
    const tbody = document.getElementById("payExpenseTableBody");
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

    // 1. Filter expenses by selected month
    const monthExpenses = allExpenses.filter(b => {
      if (this.expenseMonthFilter === "ALL") return true;
      return b.month === this.expenseMonthFilter;
    });

    // 2. Compute KPIs for this month
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

    const elTotalBilled = document.getElementById("kpiExpTotalBilled");
    const elTotalPaid = document.getElementById("kpiExpTotalPaid");
    const elPaidCount = document.getElementById("kpiExpPaidCount");
    const elTotalPending = document.getElementById("kpiExpTotalPending");
    const elPendingCount = document.getElementById("kpiExpPendingCount");
    const elProgressPercent = document.getElementById("kpiExpProgressPercent");
    const elProgressBar = document.getElementById("kpiExpProgressBar");

    if (elTotalBilled) elTotalBilled.textContent = this.formatCurrency(totalBilled);
    if (elTotalPaid) elTotalPaid.textContent = this.formatCurrency(totalPaid);
    if (elPaidCount) elPaidCount.textContent = `${paidCount} bills settled (${paidCount} ගෙවා ඇත)`;
    if (elTotalPending) elTotalPending.textContent = this.formatCurrency(totalPending);
    if (elPendingCount) elPendingCount.textContent = `${pendingCount} bills pending (ගෙවීමට ඉතිරි: ${pendingCount})`;
    if (elProgressPercent) elProgressPercent.textContent = `${progressPercent}%`;
    if (elProgressBar) elProgressBar.style.width = `${progressPercent}%`;

    // 3. Category distribution
    const catMap = {
      Electricity: { billed: 0, paid: 0 },
      "Water Board": { billed: 0, paid: 0 },
      "Internet & Fiber": { billed: 0, paid: 0 },
      "Shop Rent": { billed: 0, paid: 0 },
      "Maintenance & Other": { billed: 0, paid: 0 }
    };

    monthExpenses.forEach(b => {
      const catKey = catMap[b.category] ? b.category : "Maintenance & Other";
      const amt = Number(b.amount) || 0;
      catMap[catKey].billed += amt;
      if (b.status === "Paid") {
        catMap[catKey].paid += (Number(b.paidAmount || amt) || 0);
      }
    });

    const setCatUI = (billedId, paidId, catKey) => {
      const elBilled = document.getElementById(billedId);
      const elPaid = document.getElementById(paidId);
      if (elBilled) elBilled.textContent = this.formatCurrency(catMap[catKey].billed);
      if (elPaid) elPaid.textContent = `${this.formatCurrency(catMap[catKey].paid)} Paid`;
    };

    setCatUI("catBilledElectricity", "catPaidElectricity", "Electricity");
    setCatUI("catBilledWater", "catPaidWater", "Water Board");
    setCatUI("catBilledInternet", "catPaidInternet", "Internet & Fiber");
    setCatUI("catBilledRent", "catPaidRent", "Shop Rent");
    setCatUI("catBilledMaintenance", "catPaidMaintenance", "Maintenance & Other");

    // 4. Render Table
    if (!tbody) return;

    const term = (this.expenseSearch || "").toLowerCase().trim();
    const tableFiltered = monthExpenses.filter(b => {
      const matchesSearch = !term ||
        (b.title && b.title.toLowerCase().includes(term)) ||
        (b.provider && b.provider.toLowerCase().includes(term)) ||
        (b.accountNo && b.accountNo.toLowerCase().includes(term)) ||
        (b.id && b.id.toLowerCase().includes(term));

      const matchesCat = this.expenseCategoryFilter === "ALL" || b.category === this.expenseCategoryFilter;
      const matchesStatus = this.expenseStatusFilter === "ALL" || b.status === this.expenseStatusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    });

    if (tableFiltered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 48px 16px; color: var(--text-muted);">
            <div style="font-size: 32px; margin-bottom: 8px; color: #cbd5e1;">
              <i class="fa-solid fa-receipt"></i>
            </div>
            <div style="font-size: 14px; font-weight: 600; color: var(--text);">
              No operating expenses match the selected filters.
            </div>
            <div style="font-size: 12px; margin-top: 4px;">
              Adjust month or search filter, or add a new utility bill for this month.
            </div>
            <button type="button" class="btn-filter-reset" id="btnEmptyAddExpense" style="margin-top: 14px; display: inline-flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-plus"></i> Add Monthly Bill
            </button>
          </td>
        </tr>
      `;

      const btnEmptyAdd = document.getElementById("btnEmptyAddExpense");
      if (btnEmptyAdd && this.ctx.onOpenAddModal) {
        btnEmptyAdd.addEventListener("click", () => this.ctx.onOpenAddModal());
      }
      return;
    }

    tbody.innerHTML = "";

    tableFiltered.forEach(b => {
      const entity = b instanceof OperatingExpenseEntity
        ? b
        : new OperatingExpenseRowBuilder(b).build();
      tbody.appendChild(entity.render());
    });

    // Bind action buttons in table
    tbody.querySelectorAll("[data-mark-paid-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-mark-paid-id");
        if (this.ctx.onOpenMarkPaidModal) this.ctx.onOpenMarkPaidModal(id);
      });
    });

    tbody.querySelectorAll("[data-undo-paid-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-undo-paid-id");
        if (this.ctx.onUndoPaid) this.ctx.onUndoPaid(id);
      });
    });
  }

  formatCurrency(amt) {
    if (this.ctx.formatCurrency) return this.ctx.formatCurrency(amt);
    return `Rs. ${(parseFloat(amt) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

export default OperatingExpensesHandler;

