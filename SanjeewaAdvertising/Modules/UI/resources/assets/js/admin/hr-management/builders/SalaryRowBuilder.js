/**
 * HR Base Salary Table Row Builder
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

import { BaseTableRowBuilder } from "../../../core/BaseTableRowBuilder.js";
import { HRManagementDataLoader } from "../HRManagementDataLoader.js";

export class SalaryRowBuilder extends BaseTableRowBuilder {
  /**
   * Build HTML markup for a single base salary record table row matching hr-management.blade.php.
   *
   * @returns {string}
   */
  build() {
    const record = this._data || {};
    const paddedId = String(record.id || 0).padStart(4, "0");
    const staffName = record.staff_name || "Unknown Staff";
    const nameParts = staffName.trim().split(/\s+/);
    const initials = `${(record.staff_first_name || nameParts[0] || "S")[0] || "S"}${(record.staff_last_name || nameParts[1] || "")[0] || ""}`.toUpperCase();
    const statusName = record.staff_status || "Unknown";
    const statusClass = HRManagementDataLoader.resolveStatusBadgeClass(statusName);
    const statusRowClass = HRManagementDataLoader.resolveStatusRowClass(statusName);
    const searchIndex = `${staffName} ${record.staff_nic || ""}`.toLowerCase();

    return `
      <tr class="${statusRowClass}" data-salary-search="${this.escapeHtml(searchIndex)}">
        <td><span class="hr-mono">#SAL-${this.escapeHtml(paddedId)}</span></td>
        <td>
          <div class="hr-person-cell">
            <div class="hr-avatar purple">${this.escapeHtml(initials)}</div>
            <div>
              <div class="hr-person-name">${this.escapeHtml(staffName)}</div>
              <div class="hr-person-sub">${this.escapeHtml(record.staff_mobile || "—")}</div>
            </div>
          </div>
        </td>
        <td><span class="hr-mono">${this.escapeHtml(record.staff_nic || "—")}</span></td>
        <td><strong class="hr-amount purple">${this.formatCurrency(record.amount)}</strong></td>
        <td>${this.escapeHtml(this.formatDate(record.update_at))}</td>
        <td><span class="hr-tag ${statusClass}"><span class="hr-dot"></span> ${this.escapeHtml(statusName)}</span></td>
      </tr>
    `;
  }

  /**
   * Static helper to build row HTML directly from a salary record.
   *
   * @param {Object} record
   * @returns {string}
   */
  static build(record) {
    return new SalaryRowBuilder(record).build();
  }
}

export default SalaryRowBuilder;
