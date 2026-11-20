/**
 * Record Daily Salary Payment Modal Handler
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Includes searchable Staff Member combobox and real-time monthly salary,
 * daily salary taken total, and remaining payable balance breakdown.
 */

"use strict";

import { PayDailySalaryProcess } from "../processes/PayDailySalaryProcess.js";

export class PayDailySalaryModal {
  /**
   * @param {Object} [options={}]
   * @param {Object} [options.dataLoader]
   * @param {Function} [options.onDailySalaryRecorded]
   */
  constructor(options = {}) {
    this.dataLoader = options.dataLoader || null;
    this.onDailySalaryRecorded = options.onDailySalaryRecorded || (() => {});

    this.overlay = document.getElementById("modalPayDailySalary");
    this.form = document.getElementById("formPayDailySalary");
    this.errorEl = document.getElementById("payDailySalaryError");
    this.combobox = document.getElementById("dailySalaryStaffCombobox");
    this.searchInput = document.getElementById("hrDailySalaryStaffSearch");
    this.clearBtn = document.getElementById("btnDailySalaryStaffClear");
    this.toggleBtn = document.getElementById("btnDailySalaryStaffToggle");
    this.resultsEl = document.getElementById("hrDailySalaryStaffResults");
    this.staffIdInput = document.getElementById("hrDailySalaryStaffId");
    this.selectedSummaryEl = document.getElementById("hrDailySelectedSummary");
    this.amountInput = document.getElementById("hrDailySalaryAmount");
    this.payAtInput = document.getElementById("hrDailySalaryPayAt");
    this.quickAmountBtns = this.overlay ? this.overlay.querySelectorAll(".js-hr-quick-amount[data-quick-amount]") : [];
    this.closeBtns = this.overlay ? this.overlay.querySelectorAll(".hr-modal-close-trigger") : [];
    this.submitBtn = this.form ? this.form.querySelector('button[type="submit"]') : null;

    this.process = new PayDailySalaryProcess({
      dataLoader: this.dataLoader,
      onError: (errMsg) => {
        this.showError(errMsg);
      },
    });

    this.staffList = this.loadInitialStaffList();
    this.filteredStaff = [...this.staffList];
    this.highlightedIndex = -1;
    this.isDropdownOpen = false;
    this.selectedStaff = null;

    this.bindEvents();
  }

  /**
   * Parse initial staff dataset embedded on #dailySalaryStaffCombobox.
   *
   * @returns {Array<Object>}
   */
  loadInitialStaffList() {
    if (!this.combobox) return [];

    try {
      const raw = this.combobox.getAttribute("data-staff-list") || "[]";
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn("[PayDailySalaryModal] Could not parse staff list:", err);
      return [];
    }
  }

  /**
   * Register a newly added staff member into the searchable selector list.
   *
   * @param {Object} staff
   */
  addStaffOption(staff) {
    if (!staff || !staff.id) return;

    const normalized = {
      id: Number(staff.id),
      full_name: staff.full_name || `${staff.first_name || ""} ${staff.last_name || ""}`.trim(),
      nic: String(staff.nic || ""),
      mobile: String(staff.mobile || ""),
      status: String(staff.status?.staff_status || staff.status || "Active"),
      latest_salary: staff.latest_salary ?? null,
      daily_payments: Array.isArray(staff.daily_payments) ? staff.daily_payments : [],
    };

    this.staffList = this.staffList.filter((item) => Number(item.id) !== normalized.id);
    this.staffList.unshift(normalized);
  }

  /**
   * Update cached latest base salary for a staff member when changed via Set Base Salary.
   *
   * @param {number|string} staffId
   * @param {number} amount
   */
  updateStaffLatestSalary(staffId, amount) {
    const target = this.staffList.find((item) => Number(item.id) === Number(staffId));
    if (target) {
      target.latest_salary = parseFloat(amount);
      if (this.selectedStaff && Number(this.selectedStaff.id) === Number(staffId)) {
        this.renderSelectedSummary(target);
      }
    }
  }

  /**
   * Update cached employment status for a staff member in the searchable combobox list.
   *
   * @param {number|string} staffId
   * @param {string} statusLabel
   */
  updateStaffStatus(staffId, statusLabel) {
    const target = this.staffList.find((item) => Number(item.id) === Number(staffId));
    if (target) {
      target.status = statusLabel;
      if (this.selectedStaff && Number(this.selectedStaff.id) === Number(staffId)) {
        this.renderSelectedSummary(target);
      }
    }
  }

  /**
   * Record a new daily payment into cached state so remaining balance updates immediately.
   *
   * @param {number|string} staffId
   * @param {number} amount
   * @param {string} payAt
   */
  recordLocalDailyPayment(staffId, amount, payAt) {
    const target = this.staffList.find((item) => Number(item.id) === Number(staffId));
    if (!target) return;

    const month = String(payAt || "").slice(0, 7) || this.getSelectedMonthKey();
    if (!Array.isArray(target.daily_payments)) {
      target.daily_payments = [];
    }
    target.daily_payments.push({
      amount: parseFloat(amount || 0),
      month,
    });
  }

  /**
   * Format staff display text inside the search input.
   *
   * @param {Object} staff
   * @returns {string}
   */
  formatStaffDisplay(staff) {
    if (!staff) return "";
    const paddedId = String(staff.id).padStart(3, "0");
    return `#STF-${paddedId} - ${staff.full_name} (${staff.nic})`;
  }

  /**
   * Format numeric currency in Sri Lankan Rupees.
   *
   * @param {number} value
   * @returns {string}
   */
  formatCurrency(value) {
    const num = Number(value || 0);
    return `Rs. ${num.toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  /**
   * Escape HTML special characters for safe rendering.
   *
   * @param {*} value
   * @returns {string}
   */
  escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Format current local browser date & time for datetime-local input (YYYY-MM-DDTHH:mm).
   *
   * @returns {string}
   */
  getCurrentDateTimeLocal() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /**
   * Set Payment Date & Time input to current local time.
   */
  setDefaultPayAt() {
    if (this.payAtInput) {
      this.payAtInput.value = this.getCurrentDateTimeLocal();
    }
  }

  /**
   * Get YYYY-MM key from #hrDailySalaryPayAt (falls back to current month).
   *
   * @returns {string}
   */
  getSelectedMonthKey() {
    const raw = this.payAtInput?.value || "";
    if (/^\d{4}-\d{2}/.test(raw)) {
      return raw.slice(0, 7);
    }

    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }

  /**
   * Format YYYY-MM month key to human-readable month label (e.g. November 2026).
   *
   * @param {string} monthKey
   * @returns {string}
   */
  formatMonthLabel(monthKey) {
    const parts = String(monthKey || "").split("-");
    if (parts.length !== 2) return monthKey;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const date = new Date(year, month, 1);

    if (isNaN(date.getTime())) return monthKey;
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  /**
   * Calculate monthly daily-salary summary for a staff member in a given YYYY-MM month.
   *
   * @param {Object} staff
   * @param {string} monthKey
   * @returns {{baseSalary: number|null, takenTotal: number, paymentCount: number, remaining: number|null, usedPercent: number}}
   */
  calculateMonthlySummary(staff, monthKey) {
    const baseSalary =
      staff.latest_salary !== null && staff.latest_salary !== undefined
        ? parseFloat(staff.latest_salary)
        : null;

    const payments = Array.isArray(staff.daily_payments) ? staff.daily_payments : [];
    const monthPayments = payments.filter((p) => String(p.month || "") === monthKey);
    const takenTotal = monthPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const remaining = baseSalary !== null ? baseSalary - takenTotal : null;
    const usedPercent =
      baseSalary !== null && baseSalary > 0
        ? Math.min(100, Math.max(0, Math.round((takenTotal / baseSalary) * 100)))
        : 0;

    return {
      baseSalary,
      takenTotal,
      paymentCount: monthPayments.length,
      remaining,
      usedPercent,
    };
  }

  bindEvents() {
    this.closeBtns.forEach((btn) => {
      btn.addEventListener("click", () => this.close());
    });

    if (this.overlay) {
      this.overlay.addEventListener("click", (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });
    }

    if (this.searchInput) {
      this.searchInput.addEventListener("input", () => {
        this.handleSearchInput();
      });

      this.searchInput.addEventListener("focus", () => {
        this.openDropdown(this.selectedStaff ? "" : this.searchInput.value);
      });

      this.searchInput.addEventListener("click", () => {
        if (!this.isDropdownOpen) {
          this.openDropdown(this.selectedStaff ? "" : this.searchInput.value);
        }
      });

      this.searchInput.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (!this.isDropdownOpen) {
            this.openDropdown(this.searchInput.value);
          } else {
            this.moveHighlight(1);
          }
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (this.isDropdownOpen) {
            this.moveHighlight(-1);
          }
        } else if (e.key === "Enter") {
          if (this.isDropdownOpen) {
            e.preventDefault();
            this.selectHighlightedOrFirst();
          }
        } else if (e.key === "Escape") {
          if (this.isDropdownOpen) {
            e.preventDefault();
            e.stopPropagation();
            this.closeDropdown(true);
          }
        }
      });
    }

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (this.isDropdownOpen) {
          this.closeDropdown(true);
        } else {
          this.openDropdown("");
          this.searchInput?.focus();
          this.searchInput?.select();
        }
      });
    }

    if (this.clearBtn) {
      this.clearBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.clearSelection(true);
      });
    }

    if (this.resultsEl) {
      this.resultsEl.addEventListener("click", (e) => {
        const item = e.target.closest(".hr-combobox-item[data-staff-id]");
        if (!item) return;

        const staffId = Number(item.getAttribute("data-staff-id"));
        const match = this.staffList.find((s) => Number(s.id) === staffId);
        if (match) {
          this.selectStaff(match);
        }
      });
    }

    document.addEventListener("click", (e) => {
      if (this.isDropdownOpen && this.combobox && !this.combobox.contains(e.target)) {
        this.closeDropdown(true);
      }
    });

    // Recalculate monthly summary live when Payment Date or Amount changes
    this.payAtInput?.addEventListener("change", () => {
      if (this.selectedStaff) {
        this.renderSelectedSummary(this.selectedStaff);
      }
    });

    this.amountInput?.addEventListener("input", () => {
      this.syncQuickAmountButtons();
      if (this.selectedStaff) {
        this.renderSelectedSummary(this.selectedStaff);
      }
    });

    this.quickAmountBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const preset = btn.getAttribute("data-quick-amount");
        if (!preset || !this.amountInput) return;

        this.amountInput.value = preset;
        this.syncQuickAmountButtons();

        if (this.selectedStaff) {
          this.renderSelectedSummary(this.selectedStaff);
        }

        this.amountInput.focus();
      });
    });

    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.submit();
      });
    }
  }

  handleSearchInput() {
    const query = (this.searchInput?.value || "").trim();

    if (this.selectedStaff && query !== this.formatStaffDisplay(this.selectedStaff)) {
      this.selectedStaff = null;
      if (this.staffIdInput) this.staffIdInput.value = "";
      this.renderSelectedSummary(null);
    }

    if (this.clearBtn) {
      this.clearBtn.style.display = query ? "inline-flex" : "none";
    }

    this.openDropdown(query);
  }

  openDropdown(rawQuery = "") {
    if (!this.resultsEl || !this.combobox) return;

    const query = String(rawQuery || "").trim().toLowerCase();
    const cleanNumeric = query.replace(/^#(stf-?)?/i, "");

    this.filteredStaff = !query
      ? [...this.staffList]
      : this.staffList.filter((staff) => {
          const paddedId = `stf-${String(staff.id).padStart(3, "0")}`;
          const hay = `${staff.id} ${paddedId} ${staff.full_name} ${staff.nic} ${staff.mobile} ${staff.status}`.toLowerCase();
          return hay.includes(query) || (cleanNumeric && String(staff.id) === cleanNumeric);
        });

    this.highlightedIndex = this.filteredStaff.length > 0 ? 0 : -1;
    this.isDropdownOpen = true;
    this.combobox.classList.add("open");
    this.searchInput?.setAttribute("aria-expanded", "true");
    this.renderDropdownResults();
    this.resultsEl.style.display = "block";
  }

  closeDropdown(restoreSelectedText = false) {
    if (!this.resultsEl || !this.combobox) return;

    this.isDropdownOpen = false;
    this.highlightedIndex = -1;
    this.combobox.classList.remove("open");
    this.searchInput?.setAttribute("aria-expanded", "false");
    this.resultsEl.style.display = "none";

    if (restoreSelectedText && this.searchInput) {
      this.searchInput.value = this.selectedStaff ? this.formatStaffDisplay(this.selectedStaff) : "";
      if (this.clearBtn) {
        this.clearBtn.style.display = this.selectedStaff ? "inline-flex" : "none";
      }
    }
  }

  renderDropdownResults() {
    if (!this.resultsEl) return;

    if (this.filteredStaff.length === 0) {
      this.resultsEl.innerHTML = `
        <div class="hr-combobox-empty">
          <i class="fa-solid fa-user-slash" style="margin-right: 6px;"></i>
          No matching staff members found.
        </div>
      `;
      return;
    }

    const selectedId = this.selectedStaff ? Number(this.selectedStaff.id) : null;

    this.resultsEl.innerHTML = this.filteredStaff
      .map((staff, idx) => {
        const paddedId = String(staff.id).padStart(3, "0");
        const isSelected = selectedId === Number(staff.id);
        const isHighlighted = idx === this.highlightedIndex;
        const itemClasses = [
          "hr-combobox-item",
          isSelected ? "selected" : "",
          isHighlighted ? "highlighted" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return `
          <div class="${itemClasses}" role="option" aria-selected="${isSelected}" data-staff-id="${staff.id}" data-index="${idx}">
            <div class="hr-combobox-item-main">
              <span class="hr-combobox-item-id">#STF-${this.escapeHtml(paddedId)}</span>
              <span class="hr-combobox-item-name">${this.escapeHtml(staff.full_name)}</span>
            </div>
            <span class="hr-combobox-item-meta">${this.escapeHtml(staff.nic)}</span>
          </div>
        `;
      })
      .join("");
  }

  moveHighlight(step) {
    if (this.filteredStaff.length === 0) return;

    const count = this.filteredStaff.length;
    this.highlightedIndex = (this.highlightedIndex + step + count) % count;
    this.renderDropdownResults();

    const activeEl = this.resultsEl?.querySelector(`.hr-combobox-item[data-index="${this.highlightedIndex}"]`);
    activeEl?.scrollIntoView({ block: "nearest" });
  }

  selectHighlightedOrFirst() {
    if (this.filteredStaff.length === 0) return;
    const target = this.filteredStaff[this.highlightedIndex >= 0 ? this.highlightedIndex : 0];
    if (target) {
      this.selectStaff(target);
    }
  }

  selectStaff(staff) {
    if (!staff) return;

    this.selectedStaff = staff;

    if (this.staffIdInput) {
      this.staffIdInput.value = String(staff.id);
    }

    if (this.searchInput) {
      this.searchInput.value = this.formatStaffDisplay(staff);
    }

    if (this.clearBtn) {
      this.clearBtn.style.display = "inline-flex";
    }

    this.renderSelectedSummary(staff);
    this.closeDropdown(false);
    this.amountInput?.focus();
  }

  clearSelection(reopenDropdown = false) {
    this.selectedStaff = null;

    if (this.staffIdInput) this.staffIdInput.value = "";
    if (this.searchInput) this.searchInput.value = "";
    if (this.clearBtn) this.clearBtn.style.display = "none";

    this.renderSelectedSummary(null);

    if (reopenDropdown) {
      this.openDropdown("");
      this.searchInput?.focus();
    } else {
      this.closeDropdown(false);
    }
  }

  /**
   * Render detailed monthly salary, daily salary taken, and remaining balance card for selected staff.
   *
   * @param {Object|null} staff
   */
  renderSelectedSummary(staff) {
    if (!this.selectedSummaryEl) return;

    if (!staff) {
      this.selectedSummaryEl.innerHTML = "";
      this.selectedSummaryEl.style.display = "none";
      return;
    }

    const paddedId = String(staff.id || 0).padStart(3, "0");
    const nameParts = String(staff.full_name || "S").trim().split(/\s+/);
    const initials = `${nameParts[0]?.[0] || "S"}${nameParts[1]?.[0] || ""}`.toUpperCase();
    const statusLabel = staff.status || "Active";
    const statusLower = statusLabel.toLowerCase();
    const statusClass =
      statusLower === "active"
        ? "hr-tag-green"
        : statusLower === "on leave"
          ? "hr-tag-orange"
          : statusLower === "suspended" || statusLower === "resigned"
            ? "hr-tag-red"
            : "hr-tag-default";

    const monthKey = this.getSelectedMonthKey();
    const monthLabel = this.formatMonthLabel(monthKey);
    const summary = this.calculateMonthlySummary(staff, monthKey);

    const typedAmount = parseFloat(this.amountInput?.value || "0");
    const hasTypedAmount = !isNaN(typedAmount) && typedAmount > 0;
    const afterPaymentRemaining =
      summary.remaining !== null && hasTypedAmount ? summary.remaining - typedAmount : null;

    const baseSalaryHtml =
      summary.baseSalary !== null
        ? `<div class="hr-daily-metric-val purple">${this.escapeHtml(this.formatCurrency(summary.baseSalary))}</div>`
        : '<div class="hr-daily-metric-val unset">Not Set</div>';

    let remainingValHtml = '<div class="hr-daily-metric-val unset">Set Base Salary First</div>';
    let remainingCardClass = "";
    if (summary.remaining !== null) {
      if (summary.remaining < 0) {
        remainingValHtml = `<div class="hr-daily-metric-val danger">${this.escapeHtml(this.formatCurrency(summary.remaining))}</div>`;
        remainingCardClass = "is-danger";
      } else if (summary.remaining === 0) {
        remainingValHtml = `<div class="hr-daily-metric-val warning">${this.escapeHtml(this.formatCurrency(0))}</div>`;
        remainingCardClass = "is-warning";
      } else {
        remainingValHtml = `<div class="hr-daily-metric-val emerald">${this.escapeHtml(this.formatCurrency(summary.remaining))}</div>`;
        remainingCardClass = "is-emerald";
      }
    }

    const afterPayHintHtml =
      afterPaymentRemaining !== null
        ? `<div class="hr-daily-after-pay ${afterPaymentRemaining < 0 ? "danger" : "emerald"}">
             <i class="fa-solid ${afterPaymentRemaining < 0 ? "fa-triangle-exclamation" : "fa-circle-info"}"></i>
             <span>Balance after this payment: <strong>${this.escapeHtml(this.formatCurrency(afterPaymentRemaining))}</strong></span>
           </div>`
        : "";

    const progressSectionHtml =
      summary.baseSalary !== null && summary.baseSalary > 0
        ? `<div class="hr-daily-progress-wrap">
             <div class="hr-daily-progress-header">
               <span><i class="fa-regular fa-calendar"></i> ${this.escapeHtml(monthLabel)} Usage</span>
               <strong>${summary.usedPercent}% used</strong>
             </div>
             <div class="hr-daily-progress-track">
               <div class="hr-daily-progress-fill ${summary.remaining < 0 ? "danger" : ""}" style="width: ${summary.usedPercent}%;"></div>
             </div>
           </div>`
        : "";

    this.selectedSummaryEl.innerHTML = `
      <div class="hr-selected-staff-card emerald">
        <div class="hr-selected-staff-top">
          <div class="hr-selected-staff-identity">
            <div class="hr-avatar green">${this.escapeHtml(initials)}</div>
            <div>
              <div class="hr-selected-staff-name">${this.escapeHtml(staff.full_name || "Staff")}</div>
              <div class="hr-selected-staff-id">ID #STF-${this.escapeHtml(paddedId)} &bull; ${this.escapeHtml(staff.nic || "—")} &bull; ${this.escapeHtml(staff.mobile || "—")}</div>
            </div>
          </div>
          <span class="hr-tag ${statusClass}"><span class="hr-dot"></span> ${this.escapeHtml(statusLabel)}</span>
        </div>

        <div class="hr-daily-metrics-grid">
          <div class="hr-daily-metric-box">
            <span class="hr-selected-meta-label"><i class="fa-solid fa-money-check-dollar"></i> Monthly Base Salary</span>
            ${baseSalaryHtml}
            <span class="hr-daily-metric-sub">Fixed monthly salary</span>
          </div>

          <div class="hr-daily-metric-box">
            <span class="hr-selected-meta-label"><i class="fa-solid fa-hand-holding-dollar"></i> Daily Paid (${this.escapeHtml(monthLabel)})</span>
            <div class="hr-daily-metric-val orange">${this.escapeHtml(this.formatCurrency(summary.takenTotal))}</div>
            <span class="hr-daily-metric-sub">${summary.paymentCount} ${summary.paymentCount === 1 ? "payment" : "payments"} taken</span>
          </div>

          <div class="hr-daily-metric-box full ${remainingCardClass}">
            <div>
              <span class="hr-selected-meta-label"><i class="fa-solid fa-wallet"></i> Remaining Payable (${this.escapeHtml(monthLabel)})</span>
              <span class="hr-daily-metric-sub">Available balance for this month</span>
            </div>
            ${remainingValHtml}
          </div>
        </div>

        ${progressSectionHtml}
        ${afterPayHintHtml}
      </div>
    `;
    this.selectedSummaryEl.style.display = "block";
  }

  showError(message) {
    if (this.errorEl) {
      this.errorEl.textContent = message;
      this.errorEl.style.display = "block";
    } else {
      alert(message);
    }
  }

  clearError() {
    if (this.errorEl) {
      this.errorEl.textContent = "";
      this.errorEl.style.display = "none";
    }
  }

  async submit() {
    this.clearError();

    const staffId = this.staffIdInput?.value || "";
    const amount = this.amountInput?.value || "";
    const payAt = this.payAtInput?.value || "";

    const originalBtnHtml = this.submitBtn
      ? this.submitBtn.innerHTML
      : '<i class="fa-solid fa-check"></i> Record Payment';

    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Recording Payment...';
    }

    try {
      const result = await this.process.execute({
        staff_id: staffId,
        amount,
        pay_at: payAt,
      });

      if (result.success && result.data) {
        this.recordLocalDailyPayment(
          result.data.staff_id,
          result.data.amount,
          result.data.pay_at_month || result.data.pay_at
        );
        this.close();
        if (this.form) this.form.reset();
        this.onDailySalaryRecorded(result.data, result.message);
      }
    } finally {
      if (this.submitBtn) {
        this.submitBtn.disabled = false;
        this.submitBtn.innerHTML = originalBtnHtml;
      }
    }
  }

  /**
   * Highlight quick-amount preset pill matching the current Amount input value.
   */
  syncQuickAmountButtons() {
    const currentNum = parseFloat(this.amountInput?.value || "");
    this.quickAmountBtns.forEach((btn) => {
      const btnNum = parseFloat(btn.getAttribute("data-quick-amount") || "");
      btn.classList.toggle("active", !isNaN(currentNum) && currentNum === btnNum);
    });
  }

  /**
   * Open Pay Daily Salary modal, optionally pre-selecting a staff member.
   *
   * @param {string|number|null} [staffId=null]
   */
  open(staffId = null) {
    if (!this.overlay) return;
    if (this.form) this.form.reset();

    this.setDefaultPayAt();
    this.syncQuickAmountButtons();
    this.clearError();
    this.clearSelection(false);

    if (staffId) {
      const match = this.staffList.find((s) => Number(s.id) === Number(staffId));
      if (match) {
        this.selectStaff(match);
      }
    }

    this.overlay.classList.add("open");

    if (staffId && this.amountInput) {
      this.amountInput.focus();
    } else if (this.searchInput) {
      this.searchInput.focus();
    }
  }

  close() {
    if (!this.overlay) return;
    this.closeDropdown(false);
    this.clearError();
    this.overlay.classList.remove("open");
  }
}

export default PayDailySalaryModal;
