/**
 * HR & Payroll Management Data Loader & State Repository
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Handles: Backend API communication and client-side state for Staff, Base Salaries, and Daily Salaries
 */

"use strict";

import { RequestHandler } from "../../core/RequestHandler.js";

export class HRManagementDataLoader {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.onStaffUpdated]
   * @param {Function} [options.onSalariesUpdated]
   * @param {Function} [options.onDailySalariesUpdated]
   */
  constructor(options = {}) {
    this.http = new RequestHandler();
    this.onStaffUpdated = options.onStaffUpdated || (() => {});
    this.onSalariesUpdated = options.onSalariesUpdated || (() => {});
    this.onDailySalariesUpdated = options.onDailySalariesUpdated || (() => {});

    this.staffMembers = [];
    this.salaries = [];
    this.dailySalaries = [];
  }

  /**
   * Resolve status tag CSS class matching admin-hr-management.css.
   *
   * @param {string} statusName
   * @returns {string}
   */
  static resolveStatusBadgeClass(statusName) {
    const normalized = String(statusName || "").trim().toLowerCase();

    if (normalized === "active") return "hr-tag-green";
    if (normalized === "on leave") return "hr-tag-orange";
    if (normalized === "suspended" || normalized === "resigned") return "hr-tag-red";

    return "hr-tag-default";
  }

  /**
   * Resolve table row highlight CSS class based on staff employment status.
   *
   * @param {string} statusName
   * @returns {string}
   */
  static resolveStatusRowClass(statusName) {
    const normalized = String(statusName || "").trim().toLowerCase();

    if (normalized === "active") return "hr-status-row-active";
    if (normalized === "on leave") return "hr-status-row-on-leave";
    if (normalized === "suspended") return "hr-status-row-suspended";
    if (normalized === "resigned") return "hr-status-row-resigned";

    return "hr-status-row-inactive";
  }

  /**
   * Normalize a staff record returned by backend APIs.
   *
   * @param {Object} member
   * @returns {Object}
   */
  normalizeStaff(member = {}) {
    const statusName =
      member.status?.staff_status ||
      (typeof member.status === "string" ? member.status : "Active");

    const addedByObj = member.added_by || member.addedBy || null;
    const addedByName = addedByObj
      ? (addedByObj.full_name || `${addedByObj.first_name || ""} ${addedByObj.last_name || ""}`.trim() || addedByObj.username || "System Admin")
      : (typeof member.added_by === "string" ? member.added_by : "System Admin");

    const rawDate = member.add_at_date || (member.add_at ? String(member.add_at).slice(0, 10) : "");

    return {
      id: Number(member.id),
      first_name: member.first_name || "",
      last_name: member.last_name || "",
      full_name: member.full_name || `${member.first_name || ""} ${member.last_name || ""}`.trim(),
      mobile: member.mobile || "",
      nic: member.nic || "",
      staff_statuses_id: Number(member.staff_statuses_id) || 1,
      status: statusName,
      add_at: member.add_at || "",
      add_at_date: rawDate || "—",
      added_by: addedByName,
      latest_salary: member.latest_salary ?? null,
    };
  }

  /**
   * Normalize a base salary record returned by backend APIs.
   *
   * @param {Object} record
   * @returns {Object}
   */
  normalizeSalary(record = {}) {
    const staff = record.staff || {};
    const statusName =
      staff.status?.staff_status ||
      (typeof staff.status === "string" ? staff.status : "Unknown");

    return {
      id: Number(record.id),
      staff_id: Number(record.staff_id || staff.id || 0),
      staff_first_name: staff.first_name || "",
      staff_last_name: staff.last_name || "",
      staff_name: staff.full_name || `${staff.first_name || ""} ${staff.last_name || ""}`.trim() || "Unknown Staff",
      staff_nic: staff.nic || "—",
      staff_mobile: staff.mobile || "—",
      staff_status: statusName,
      amount: parseFloat(record.amount || 0),
      update_at: record.update_at || "",
      monthly_payroll_total:
        record.monthly_payroll_total !== undefined && record.monthly_payroll_total !== null
          ? parseFloat(record.monthly_payroll_total)
          : null,
    };
  }

  /**
   * Normalize a daily salary payout record returned by backend APIs.
   *
   * @param {Object} record
   * @returns {Object}
   */
  normalizeDailySalary(record = {}) {
    const staff = record.staff || {};
    const payAt = record.pay_at || "";

    return {
      id: Number(record.id),
      staff_id: Number(record.staff_id || staff.id || 0),
      staff_first_name: staff.first_name || "",
      staff_last_name: staff.last_name || "",
      staff_name: staff.full_name || `${staff.first_name || ""} ${staff.last_name || ""}`.trim() || "Unknown Staff",
      staff_nic: staff.nic || "—",
      staff_mobile: staff.mobile || "—",
      amount: parseFloat(record.amount || 0),
      pay_at: payAt,
      pay_at_date: record.pay_at_date || (payAt ? String(payAt).slice(0, 10) : ""),
      pay_at_month: record.pay_at_month || (payAt ? String(payAt).slice(0, 7) : ""),
      daily_salary_total:
        record.daily_salary_total !== undefined && record.daily_salary_total !== null
          ? parseFloat(record.daily_salary_total)
          : null,
      daily_salary_count:
        record.daily_salary_count !== undefined && record.daily_salary_count !== null
          ? parseInt(record.daily_salary_count, 10)
          : null,
      today_daily_salary_total:
        record.today_daily_salary_total !== undefined && record.today_daily_salary_total !== null
          ? parseFloat(record.today_daily_salary_total)
          : null,
      today_daily_salary_count:
        record.today_daily_salary_count !== undefined && record.today_daily_salary_count !== null
          ? parseInt(record.today_daily_salary_count, 10)
          : null,
    };
  }
}

export default HRManagementDataLoader;
