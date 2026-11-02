/**
 * SanjeewaAdvertising - Operating Expenses Handler
 *
 * Handles rendering for Operating Expenses (Monthly Overhead & Utility Bills):
 * - Month navigation and selection
 * - Monthly KPI metric calculations (Billed, Paid, Pending, Settlement Progress %)
 * - Category totals (Electricity, Water, Internet, Rent, Maintenance)
 * - Operating expenses table rendering with category badges, status indicators, and actions
 */

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

    // 3. Category Breakdown for month
    const catTotals = {
      Electricity: 0,
      "Water Board": 0,
      "Internet & Fiber": 0,
      "Shop Rent": 0,
      Other: 0
    };

    monthExpenses.forEach(b => {
      const amt = Number(b.amount) || 0;
      if (b.category === "Electricity") catTotals.Electricity += amt;
      else if (b.category === "Water Board") catTotals["Water Board"] += amt;
      else if (b.category === "Internet & Fiber") catTotals["Internet & Fiber"] += amt;
      else if (b.category === "Shop Rent") catTotals["Shop Rent"] += amt;
      else catTotals.Other += amt;
    });

    const elCatElec = document.getElementById("catTotalElectricity");
    const elCatWater = document.getElementById("catTotalWater");
    const elCatNet = document.getElementById("catTotalInternet");
    const elCatRent = document.getElementById("catTotalRent");
    const elCatOther = document.getElementById("catTotalOther");

    if (elCatElec) elCatElec.textContent = `Rs. ${catTotals.Electricity.toLocaleString()}`;
    if (elCatWater) elCatWater.textContent = `Rs. ${catTotals["Water Board"].toLocaleString()}`;
    if (elCatNet) elCatNet.textContent = `Rs. ${catTotals["Internet & Fiber"].toLocaleString()}`;
    if (elCatRent) elCatRent.textContent = `Rs. ${catTotals["Shop Rent"].toLocaleString()}`;
    if (elCatOther) elCatOther.textContent = `Rs. ${catTotals.Other.toLocaleString()}`;

    // 4. Update Tab badge for expenses
    const tabBadgeExp = document.getElementById("tabBadgeExpensesCount");
    if (tabBadgeExp) {
      const activePendingCount = allExpenses.filter(b => (this.expenseMonthFilter === "ALL" || b.month === this.expenseMonthFilter) && b.status !== "Paid").length;
      tabBadgeExp.textContent = activePendingCount > 0 ? `${activePendingCount} Due` : `${monthExpenses.length} Bills`;
      tabBadgeExp.style.background = activePendingCount > 0 ? '#ef4444' : '#10b981';
      tabBadgeExp.style.color = '#ffffff';
    }

    if (!tbody) return;

    // 5. Filter for Table
    const tableFiltered = monthExpenses.filter(b => {
      const matchesSearch = !this.expenseSearch ||
        (b.title && b.title.toLowerCase().includes(this.expenseSearch)) ||
        (b.provider && b.provider.toLowerCase().includes(this.expenseSearch)) ||
        (b.accountNo && b.accountNo.toLowerCase().includes(this.expenseSearch)) ||
        (b.notes && b.notes.toLowerCase().includes(this.expenseSearch)) ||
        (b.paidRef && b.paidRef.toLowerCase().includes(this.expenseSearch));

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

    if (tableFiltered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
            <div style="font-size: 38px; margin-bottom: 12px; color: #f59e0b;"><i class="fa-solid fa-file-circle-check"></i></div>
            <div style="font-size: 15px; font-weight: 700; color: var(--text);">No Operating Expense Bills Found</div>
            <p style="font-size: 13px; margin-top: 4px;">මෙම මාසය සඳහා හෝ පෙරහන් සඳහා ගැළපෙන බිල්පත් හමු නොවීය. නව බිල්පතක් එකතු කරන්න.</p>
            <button type="button" class="po-btn po-btn-primary" id="btnEmptyAddExpense" style="margin-top: 14px; background: linear-gradient(135deg, #f59e0b, #d97706); border-color: #d97706;">
              <i class="fa-solid fa-circle-plus"></i> Add New Bill (නව බිල්පතක් ඇතුලත් කරන්න)
            </button>
          </td>
        </tr>`;
      const btnEmptyAdd = document.getElementById("btnEmptyAddExpense");
      if (btnEmptyAdd && this.ctx.onOpenAddModal) {
        btnEmptyAdd.addEventListener("click", () => this.ctx.onOpenAddModal());
      }
      return;
    }

    tbody.innerHTML = tableFiltered.map(b => {
      let catIcon = "fa-receipt";
      let catClass = "other";
      if (b.category === "Electricity") {
        catIcon = "fa-bolt-lightning";
        catClass = "elec";
      } else if (b.category === "Water Board") {
        catIcon = "fa-droplet";
        catClass = "water";
      } else if (b.category === "Internet & Fiber") {
        catIcon = "fa-wifi";
        catClass = "internet";
      } else if (b.category === "Shop Rent") {
        catIcon = "fa-building";
        catClass = "rent";
      } else if (b.category === "Mobile & Telephone") {
        catIcon = "fa-phone";
        catClass = "internet";
      }

      const isPaid = b.status === "Paid";
      const isOverdue = !isPaid && b.dueDate && (new Date(b.dueDate) < new Date());

      let statusBadge = "";
      if (isPaid) {
        statusBadge = `<span class="exp-badge exp-badge-paid"><i class="fa-solid fa-circle-check"></i> Paid (ගෙවා අවසන්)</span>`;
      } else if (isOverdue) {
        statusBadge = `<span class="exp-badge exp-badge-overdue"><i class="fa-solid fa-triangle-exclamation"></i> Overdue (කල් ඉකුත් වූ)</span>`;
      } else {
        statusBadge = `<span class="exp-badge exp-badge-pending"><i class="fa-solid fa-clock"></i> Pending (ගෙවීමට ඇති)</span>`;
      }

      let settlementInfo = "";
      if (isPaid) {
        settlementInfo = `
          <div style="font-size: 12px; font-weight: 700; color: #10b981;">
            <i class="fa-solid fa-check"></i> ${b.paidDate || '-'}
          </div>
          <div style="font-size: 11px; color: var(--text-muted);">
            ${b.paidMethod || 'Paid'} ${b.paidRef ? `• Ref: ${b.paidRef}` : ''}
          </div>
          ${b.paidNote ? `<div style="font-size: 10.5px; color: var(--text-muted); font-style: italic;">"${b.paidNote}"</div>` : ''}
        `;
      } else {
        settlementInfo = `
          <div style="font-size: 12px; font-weight: 700; color: #ef4444;">
            <i class="fa-solid fa-hourglass-start"></i> Month-End Payable
          </div>
          <div style="font-size: 11px; color: var(--text-muted);">
            Settlement pending by ${b.dueDate || 'month-end'}
          </div>
        `;
      }

      return `
        <tr data-expense-id="${b.id}">
          <td>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div class="exp-cat-icon ${catClass}">
                <i class="fa-solid ${catIcon}"></i>
              </div>
              <div>
                <div style="font-weight: 800; color: var(--text); font-size: 13.5px;">${b.title}</div>
                <div style="font-size: 11px; color: var(--text-muted);">
                  <span style="font-weight: 600; color: #f59e0b;">${b.category}</span>
                  ${b.provider ? ` • ${b.provider}` : ''}
                </div>
                ${b.notes ? `<div style="font-size: 10.5px; color: var(--text-muted); margin-top: 2px;">${b.notes}</div>` : ''}
              </div>
            </div>
          </td>
          <td>
            <div style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; font-weight: 700; color: var(--text);">
              ${b.accountNo || '-'}
            </div>
            <div style="font-size: 10.5px; color: var(--text-muted);">${b.id}</div>
          </td>
          <td>
            <span style="font-weight: 700; font-size: 12.5px; color: var(--text);">${b.month || '-'}</span>
          </td>
          <td>
            <span style="font-size: 12px; font-weight: ${isOverdue ? '800' : '600'}; color: ${isOverdue ? '#ef4444' : 'var(--text)'};">
              ${b.dueDate || '-'}
            </span>
          </td>
          <td style="font-weight: 800; font-size: 14px; color: ${isPaid ? '#10b981' : '#ef4444'};">
            ${this.formatCurrency(b.amount)}
          </td>
          <td>
            ${statusBadge}
          </td>
          <td>
            ${settlementInfo}
          </td>
          <td style="text-align: right;">
            <div style="display: inline-flex; align-items: center; justify-content: flex-end; gap: 6px;">
              ${!isPaid ? `
                <button type="button" class="btn-mark-paid" data-mark-paid-id="${b.id}" title="Mark this bill as Paid (බිල්පත ගෙවූ බව සටහන් කරන්න)">
                  <i class="fa-solid fa-circle-check"></i> Mark as Paid
                </button>
              ` : `
                <button type="button" class="btn-undo-paid" data-undo-paid-id="${b.id}" title="Revert status back to Pending (නැවත Pending තත්ත්වයට)">
                  <i class="fa-solid fa-rotate-left"></i> Revert
                </button>
              `}
            </div>
          </td>
        </tr>`;
    }).join("");

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

