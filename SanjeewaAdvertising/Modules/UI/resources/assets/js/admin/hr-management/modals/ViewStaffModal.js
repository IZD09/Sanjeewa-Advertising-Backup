/**
 * View Staff Member Profile & Payroll Details Modal Handler
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Fetches complete live staff profile, base salary history, and daily salary payments
 * from GET /admin/hr/staff/{id}.
 */

"use strict";

import { RequestHandler } from "../../../core/RequestHandler.js";
import { HRManagementDataLoader } from "../HRManagementDataLoader.js";

export class ViewStaffModal {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.onQuickSetSalary]
   * @param {Function} [options.onQuickPayDaily]
   */
  constructor(options = {}) {
    this.http = new RequestHandler();
    this.onQuickSetSalary = options.onQuickSetSalary || (() => {});
    this.onQuickPayDaily = options.onQuickPayDaily || (() => {});

    this.overlay = document.getElementById("modalViewStaff");
    this.closeBtns = this.overlay ? this.overlay.querySelectorAll(".hr-modal-close-trigger") : [];

    this.loadingEl = document.getElementById("viewStaffLoading");
    this.errorEl = document.getElementById("viewStaffError");
    this.contentEl = document.getElementById("viewStaffContent");

    this.avatarEl = document.getElementById("viewStaffAvatar");
    this.fullNameEl = document.getElementById("viewStaffFullName");
    this.statusBadgeEl = document.getElementById("viewStaffStatusBadge");
    this.codeEl = document.getElementById("viewStaffCode");

    this.nicEl = document.getElementById("viewStaffNic");
    this.mobileEl = document.getElementById("viewStaffMobile");
    this.joinedAtEl = document.getElementById("viewStaffJoinedAt");
    this.addedByEl = document.getElementById("viewStaffAddedBy");

    this.baseSalaryEl = document.getElementById("viewStaffBaseSalary");
    this.monthPaidLabelEl = document.getElementById("viewStaffMonthPaidLabel");
    this.monthPaidEl = document.getElementById("viewStaffMonthPaid");
    this.monthPaidCountEl = document.getElementById("viewStaffMonthPaidCount");
    this.monthRemainingEl = document.getElementById("viewStaffMonthRemaining");

    this.salaryCountEl = document.getElementById("viewStaffSalaryHistoryCount");
    this.dailyCountEl = document.getElementById("viewStaffDailyHistoryCount");
    this.salariesTbody = document.getElementById("viewStaffSalariesTbody");
    this.dailyTbody = document.getElementById("viewStaffDailyTbody");

    this.btnSetSalary = document.getElementById("btnViewStaffSetSalary");
    this.btnPayDaily = document.getElementById("btnViewStaffPayDaily");
    this.tabButtons = this.overlay ? this.overlay.querySelectorAll(".hr-view-tab-btn[data-view-tab]") : [];
    this.tabPanes = this.overlay ? this.overlay.querySelectorAll(".hr-view-tab-pane") : [];

    this.currentStaffId = null;

    this.bindEvents();
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

    this.tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-view-tab");
        this.switchTab(targetId);
      });
    });

    this.btnSetSalary?.addEventListener("click", () => {
      if (!this.currentStaffId) return;
      const id = this.currentStaffId;
      this.close();
      this.onQuickSetSalary(id);
    });

    this.btnPayDaily?.addEventListener("click", () => {
      if (!this.currentStaffId) return;
      const id = this.currentStaffId;
      this.close();
      this.onQuickPayDaily(id);
    });
  }

  switchTab(targetId) {
    this.tabButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-view-tab") === targetId);
    });

    this.tabPanes.forEach((pane) => {
      pane.classList.toggle("active", pane.id === targetId);
    });
  }

  formatCurrency(amount) {
    const num = Number(amount || 0);
    return `Rs. ${num.toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

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
   * Open modal and load complete details for a staff member from backend API.
   *
   * @param {number|string} staffId
   */
  async open(staffId) {
    if (!this.overlay || !staffId) return;

    this.currentStaffId = Number(staffId);
    this.switchTab("paneViewStaffSalaries");
    this.showLoading();
    this.overlay.classList.add("open");

    try {
      const response = await this.http.get(`/admin/hr/staff/${this.currentStaffId}`);

      if (response && response.success && response.data) {
        this.renderStaffDetails(response.data);
      } else {
        this.showError(response?.message || "Could not load staff member details.");
      }
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Failed to load staff member details.";
      this.showError(msg);
    }
  }

  close() {
    if (!this.overlay) return;
    this.overlay.classList.remove("open");
    this.currentStaffId = null;
  }

  showLoading() {
    if (this.loadingEl) this.loadingEl.style.display = "flex";
    if (this.errorEl) this.errorEl.style.display = "none";
    if (this.contentEl) this.contentEl.style.display = "none";
  }

  showError(message) {
    if (this.loadingEl) this.loadingEl.style.display = "none";
    if (this.contentEl) this.contentEl.style.display = "none";
    if (this.errorEl) {
      this.errorEl.textContent = message;
      this.errorEl.style.display = "block";
    }
  }

  renderStaffDetails(staff) {
    const fullName = staff.full_name || `${staff.first_name || ""} ${staff.last_name || ""}`.trim() || "Staff";
    const initials = `${(staff.first_name || "S")[0] || "S"}${(staff.last_name || "")[0] || ""}`.toUpperCase();
    const paddedId = String(staff.id || 0).padStart(3, "0");
    const statusLabel = staff.status?.staff_status || "Active";
    const statusClass = HRManagementDataLoader.resolveStatusBadgeClass(statusLabel);

    if (this.avatarEl) this.avatarEl.textContent = initials;
    if (this.fullNameEl) this.fullNameEl.textContent = fullName;
    if (this.codeEl) this.codeEl.textContent = `ID #STF-${paddedId}`;
    if (this.statusBadgeEl) {
      this.statusBadgeEl.className = `hr-tag ${statusClass}`;
      this.statusBadgeEl.innerHTML = `<span class="hr-dot"></span> ${this.escapeHtml(statusLabel)}`;
    }

    if (this.nicEl) this.nicEl.textContent = staff.nic || "—";
    if (this.mobileEl) this.mobileEl.textContent = staff.mobile || "—";
    if (this.joinedAtEl) this.joinedAtEl.textContent = staff.add_at || staff.add_at_date || "—";

    const addedBy = staff.added_by;
    const addedByDisplay = addedBy
      ? `${addedBy.full_name || addedBy.username}${addedBy.username ? ` (@${addedBy.username})` : ""}`
      : "System Admin";
    if (this.addedByEl) this.addedByEl.textContent = addedByDisplay;

    // Payroll Summary
    const summary = staff.payroll_summary || {};
    const baseSalary = staff.latest_salary ?? summary.base_salary ?? null;
    const monthLabel = summary.month_label || "This Month";
    const monthDailyTotal = Number(summary.month_daily_total || 0);
    const monthDailyCount = Number(summary.month_daily_count || 0);
    const monthRemaining = summary.month_remaining;

    if (this.baseSalaryEl) {
      this.baseSalaryEl.textContent = baseSalary !== null ? this.formatCurrency(baseSalary) : "Not Set";
      this.baseSalaryEl.className = `hr-view-payroll-val ${baseSalary !== null ? "purple" : "unset"}`;
    }

    if (this.monthPaidLabelEl) {
      this.monthPaidLabelEl.innerHTML = `<i class="fa-solid fa-hand-holding-dollar" style="color: #f59e0b;"></i> Daily Paid (${this.escapeHtml(monthLabel)})`;
    }
    if (this.monthPaidEl) {
      this.monthPaidEl.textContent = this.formatCurrency(monthDailyTotal);
    }
    if (this.monthPaidCountEl) {
      this.monthPaidCountEl.textContent = `${monthDailyCount} ${monthDailyCount === 1 ? "payment" : "payments"}`;
    }

    if (this.monthRemainingEl) {
      if (monthRemaining === null || monthRemaining === undefined) {
        this.monthRemainingEl.textContent = "Base Salary Not Set";
        this.monthRemainingEl.className = "hr-view-payroll-val unset";
      } else if (Number(monthRemaining) < 0) {
        this.monthRemainingEl.textContent = this.formatCurrency(monthRemaining);
        this.monthRemainingEl.className = "hr-view-payroll-val danger";
      } else {
        this.monthRemainingEl.textContent = this.formatCurrency(monthRemaining);
        this.monthRemainingEl.className = "hr-view-payroll-val emerald";
      }
    }

    // Salary History Table
    const salaries = Array.isArray(staff.salaries) ? staff.salaries : [];
    if (this.salaryCountEl) this.salaryCountEl.textContent = String(salaries.length);
    if (this.salariesTbody) {
      if (salaries.length === 0) {
        this.salariesTbody.innerHTML = `
          <tr>
            <td colspan="3" class="hr-empty-cell" style="padding: 24px 16px !important;">
              No base salary records set for this staff member yet.
            </td>
          </tr>
        `;
      } else {
        this.salariesTbody.innerHTML = salaries
          .map((sal, idx) => {
            const ref = `#SAL-${String(sal.id).padStart(4, "0")}`;
            const currentPill =
              idx === 0
                ? ' <span class="hr-tag hr-tag-green" style="margin-left: 6px; font-size: 10.5px;">Current</span>'
                : "";
            return `
              <tr>
                <td><span class="hr-mono">${this.escapeHtml(ref)}</span>${currentPill}</td>
                <td><strong class="hr-amount purple">${this.escapeHtml(this.formatCurrency(sal.amount))}</strong></td>
                <td>${this.escapeHtml(sal.update_at || "—")}</td>
              </tr>
            `;
          })
          .join("");
      }
    }

    // Daily Salary Payments Table
    const dailyPayments = Array.isArray(staff.daily_salaries) ? staff.daily_salaries : [];
    if (this.dailyCountEl) this.dailyCountEl.textContent = String(dailyPayments.length);
    if (this.dailyTbody) {
      if (dailyPayments.length === 0) {
        this.dailyTbody.innerHTML = `
          <tr>
            <td colspan="3" class="hr-empty-cell" style="padding: 24px 16px !important;">
              No daily salary payments recorded for this staff member yet.
            </td>
          </tr>
        `;
      } else {
        this.dailyTbody.innerHTML = dailyPayments
          .map((pay) => {
            const ref = `#DS-${String(pay.id).padStart(4, "0")}`;
            return `
              <tr>
                <td><span class="hr-mono">${this.escapeHtml(ref)}</span></td>
                <td><strong class="hr-amount green">${this.escapeHtml(this.formatCurrency(pay.amount))}</strong></td>
                <td>${this.escapeHtml(pay.pay_at || "—")}</td>
              </tr>
            `;
          })
          .join("");
      }
    }

    if (this.loadingEl) this.loadingEl.style.display = "none";
    if (this.errorEl) this.errorEl.style.display = "none";
    if (this.contentEl) this.contentEl.style.display = "block";
  }
}

export default ViewStaffModal;
