/**
 * Admin HR & Payroll Management Controller
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Follows the modular architecture of user-control, payments, and profile modules.
 */

"use strict";

import { HRManagementDataLoader } from "../HRManagementDataLoader.js";
import {
  StaffTableHandler,
  SalaryTableHandler,
  DailySalaryTableHandler,
} from "../handlers/index.js";
import {
  AddStaffModal,
  SetSalaryModal,
  PayDailySalaryModal,
  ViewStaffModal,
  ChangeStaffStatusModal,
} from "../modals/index.js";
import { HRTabNavigationProcess } from "./HRTabNavigationProcess.js";

export class AdminHRManager {
  constructor() {
    this.moduleEl = document.getElementById("module-hr-management");
    this.toastEl = document.getElementById("hrToast");

    if (!this.moduleEl) {
      return;
    }

    this.dataLoader = new HRManagementDataLoader();

    // Modals
    this.addStaffModal = new AddStaffModal({
      dataLoader: this.dataLoader,
      onStaffAdded: (newStaff, message) => {
        this.handleStaffAdded(newStaff, message);
      },
    });
    this.setSalaryModal = new SetSalaryModal({
      dataLoader: this.dataLoader,
      onSalaryUpdated: (newSalary, message) => {
        this.handleSalaryUpdated(newSalary, message);
      },
    });
    this.payDailySalaryModal = new PayDailySalaryModal({
      dataLoader: this.dataLoader,
      onDailySalaryRecorded: (payment, message) => {
        this.handleDailySalaryRecorded(payment, message);
      },
    });
    this.viewStaffModal = new ViewStaffModal({
      onQuickSetSalary: (staffId) => this.setSalaryModal.open(staffId),
      onQuickPayDaily: (staffId) => this.payDailySalaryModal.open(staffId),
    });
    this.changeStaffStatusModal = new ChangeStaffStatusModal({
      dataLoader: this.dataLoader,
      onStatusUpdated: (updatedStaff, message) => {
        this.handleStaffStatusUpdated(updatedStaff, message);
      },
    });

    // Handlers
    this.staffTableHandler = new StaffTableHandler({
      onViewStaffProfile: (staffId) => this.viewStaffModal.open(staffId),
      onQuickSetSalary: (staffId) => this.setSalaryModal.open(staffId),
      onQuickPayDaily: (staffId) => this.payDailySalaryModal.open(staffId),
      onChangeStaffStatus: (staffInfo) => this.changeStaffStatusModal.open(staffInfo),
    });
    this.salaryTableHandler = new SalaryTableHandler();
    this.dailySalaryTableHandler = new DailySalaryTableHandler();

    // Processes
    this.tabNavigationProcess = new HRTabNavigationProcess({
      moduleEl: this.moduleEl,
    });

    this.bindHeaderActions();
  }

  /**
   * Bind page header & toolbar action buttons and global Escape modal dismissal.
   */
  bindHeaderActions() {
    document.getElementById("btnOpenAddStaffModal")?.addEventListener("click", () => {
      this.addStaffModal.open();
    });

    document.getElementById("btnOpenSetSalaryModal")?.addEventListener("click", () => {
      this.setSalaryModal.open();
    });

    document.getElementById("btnToolbarSetSalary")?.addEventListener("click", () => {
      this.setSalaryModal.open();
    });

    document.getElementById("btnOpenPayDailySalaryModal")?.addEventListener("click", () => {
      this.payDailySalaryModal.open();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (this.setSalaryModal?.isDropdownOpen) {
          this.setSalaryModal.closeDropdown(true);
          return;
        }
        if (this.payDailySalaryModal?.isDropdownOpen) {
          this.payDailySalaryModal.closeDropdown(true);
          return;
        }
        this.closeAllModals();
      }
    });
  }

  /**
   * Update staff directory table, KPI counters, tab badge, and salary dropdowns after creating a staff member.
   *
   * @param {Object} newStaff
   * @param {string} [message]
   */
  handleStaffAdded(newStaff, message = "") {
    if (!newStaff) return;

    this.staffTableHandler.prependStaffRow(newStaff);
    this.incrementCounter("kpiTotalStaff");
    this.incrementCounter("badgeHrStaffCount");

    if (String(newStaff.status || "").toLowerCase() === "active") {
      this.incrementCounter("kpiActiveStaff");
    }

    this.setSalaryModal.addStaffOption(newStaff);
    this.payDailySalaryModal.addStaffOption(newStaff);

    const displayName = newStaff.full_name || `${newStaff.first_name} ${newStaff.last_name}`.trim();
    this.showToast(message || `Staff member ${displayName} added successfully!`, "success");
  }

  /**
   * Update Staff Directory row status, KPI counters, and cached modal lists after changing staff status.
   *
   * @param {Object} updatedStaff
   * @param {string} [message]
   */
  handleStaffStatusUpdated(updatedStaff, message = "") {
    if (!updatedStaff) return;

    const statusLabel = updatedStaff.status || "Active";
    this.staffTableHandler.updateStaffRowStatus(
      updatedStaff.id,
      updatedStaff.staff_statuses_id,
      statusLabel
    );
    this.setSalaryModal.updateStaffStatus(updatedStaff.id, statusLabel);
    this.payDailySalaryModal.updateStaffStatus(updatedStaff.id, statusLabel);

    if (
      updatedStaff.kpi_active_staff !== null &&
      updatedStaff.kpi_active_staff !== undefined &&
      !isNaN(Number(updatedStaff.kpi_active_staff))
    ) {
      const activeEl = document.getElementById("kpiActiveStaff");
      if (activeEl) activeEl.textContent = String(updatedStaff.kpi_active_staff);
    }

    if (
      updatedStaff.kpi_on_leave_staff !== null &&
      updatedStaff.kpi_on_leave_staff !== undefined &&
      !isNaN(Number(updatedStaff.kpi_on_leave_staff))
    ) {
      const onLeaveEl = document.getElementById("kpiOnLeaveStaffCount");
      if (onLeaveEl) onLeaveEl.textContent = String(updatedStaff.kpi_on_leave_staff);
    }

    const displayName =
      updatedStaff.full_name || `${updatedStaff.first_name || ""} ${updatedStaff.last_name || ""}`.trim();
    this.showToast(message || `Status updated to ${statusLabel} for ${displayName}.`, "success");
  }

  /**
   * Update Base Salaries table, Staff Directory row, tab badge, and Base Payroll KPI after setting salary.
   *
   * @param {Object} newSalary
   * @param {string} [message]
   */
  handleSalaryUpdated(newSalary, message = "") {
    if (!newSalary) return;

    this.salaryTableHandler.prependSalaryRow(newSalary);
    this.payDailySalaryModal.updateStaffLatestSalary(newSalary.staff_id, newSalary.amount);
    this.incrementCounter("badgeHrSalaryCount");

    if (
      newSalary.monthly_payroll_total !== null &&
      newSalary.monthly_payroll_total !== undefined &&
      !isNaN(Number(newSalary.monthly_payroll_total))
    ) {
      const kpiEl = document.getElementById("kpiMonthlyPayroll");
      if (kpiEl) {
        const formatted = Number(newSalary.monthly_payroll_total).toLocaleString("en-LK", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        kpiEl.textContent = `Rs. ${formatted}`;
      }
    }

    this.showToast(message || `Base salary updated for ${newSalary.staff_name}!`, "success");
  }

  /**
   * Update Daily Salary Payments table, KPI card, and tab badge after recording a daily payment.
   *
   * @param {Object} payment
   * @param {string} [message]
   */
  handleDailySalaryRecorded(payment, message = "") {
    if (!payment) return;

    this.dailySalaryTableHandler.prependDailySalaryRow(payment);
    this.incrementCounter("badgeHrDailySalaryCount");

    if (
      payment.daily_salary_total !== null &&
      payment.daily_salary_total !== undefined &&
      !isNaN(Number(payment.daily_salary_total))
    ) {
      const totalEl = document.getElementById("kpiDailyPayouts");
      if (totalEl) {
        const formatted = Number(payment.daily_salary_total).toLocaleString("en-LK", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        totalEl.textContent = `Rs. ${formatted}`;
      }
    }

    if (
      payment.daily_salary_count !== null &&
      payment.daily_salary_count !== undefined &&
      !isNaN(Number(payment.daily_salary_count))
    ) {
      const countEl = document.getElementById("kpiDailyPayoutsCount");
      if (countEl) {
        countEl.textContent = String(payment.daily_salary_count);
      }
    } else {
      this.incrementCounter("kpiDailyPayoutsCount");
    }

    if (
      payment.today_daily_salary_total !== null &&
      payment.today_daily_salary_total !== undefined &&
      !isNaN(Number(payment.today_daily_salary_total))
    ) {
      const todayTotalEl = document.getElementById("kpiTodayDailyPayouts");
      if (todayTotalEl) {
        const formatted = Number(payment.today_daily_salary_total).toLocaleString("en-LK", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        todayTotalEl.textContent = `Rs. ${formatted}`;
      }
    }

    if (
      payment.today_daily_salary_count !== null &&
      payment.today_daily_salary_count !== undefined &&
      !isNaN(Number(payment.today_daily_salary_count))
    ) {
      const todayCountEl = document.getElementById("kpiTodayDailyPayoutsCount");
      if (todayCountEl) {
        todayCountEl.textContent = String(payment.today_daily_salary_count);
      }
    }

    this.showToast(message || `Daily salary payment recorded for ${payment.staff_name}!`, "success");
  }

  /**
   * Increment an integer counter element by 1.
   *
   * @param {string} elementId
   */
  incrementCounter(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const current = parseInt(el.textContent || "0", 10);
    if (!isNaN(current)) {
      el.textContent = String(current + 1);
    }
  }

  /**
   * Append a newly registered staff member to a select dropdown if not already present.
   *
   * @param {string} selectId
   * @param {Object} staff
   */
  appendStaffOption(selectId, staff) {
    const select = document.getElementById(selectId);
    if (!select || !staff?.id) return;

    const value = String(staff.id);
    if (select.querySelector(`option[value="${value}"]`)) {
      return;
    }

    const option = document.createElement("option");
    option.value = value;
    const fullName = staff.full_name || `${staff.first_name || ""} ${staff.last_name || ""}`.trim();
    option.textContent = `${fullName} (${staff.nic || ""})`;
    select.appendChild(option);
  }

  /**
   * Close all open HR modals.
   */
  closeAllModals() {
    this.addStaffModal.close();
    this.setSalaryModal.close();
    this.payDailySalaryModal.close();
    this.viewStaffModal.close();
    this.changeStaffStatusModal.close();
  }

  /**
   * Display toast notification.
   *
   * @param {string} message
   * @param {string} [type="success"]
   */
  showToast(message, type = "success") {
    if (!this.toastEl) return;
    const msgSpan = this.toastEl.querySelector(".toast-msg") || this.toastEl;
    msgSpan.textContent = message;

    this.toastEl.className = `hr-toast ${type} active`;
    setTimeout(() => {
      this.toastEl.classList.remove("active");
    }, 3200);
  }
}

// Auto-boot when loaded on HR management page (prevents duplicate initialization)
const bootAdminHR = () => {
  const container = document.getElementById("module-hr-management");
  if (container && container.dataset.hrBooted !== "1") {
    container.dataset.hrBooted = "1";
    window.adminHRManager = new AdminHRManager();
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootAdminHR, { once: true });
} else {
  bootAdminHR();
}
document.addEventListener("turbo:load", bootAdminHR);

export default AdminHRManager;
