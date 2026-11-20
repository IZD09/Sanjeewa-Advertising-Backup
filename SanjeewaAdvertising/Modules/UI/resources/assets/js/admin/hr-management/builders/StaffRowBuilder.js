/**
 * HR Staff Directory Table Row Builder
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

import { BaseTableRowBuilder } from "../../../core/BaseTableRowBuilder.js";
import { HRManagementDataLoader } from "../HRManagementDataLoader.js";

export class StaffRowBuilder extends BaseTableRowBuilder {
  /**
   * Build HTML markup for a single staff directory table row matching hr-management.blade.php.
   *
   * @returns {string}
   */
  build() {
    const member = this._data || {};
    const fullName = member.full_name || `${member.first_name || ""} ${member.last_name || ""}`.trim() || "Staff";
    const initials = `${(member.first_name || "S")[0] || "S"}${(member.last_name || "")[0] || ""}`.toUpperCase();
    const paddedId = String(member.id || 0).padStart(3, "0");
    const statusLabel = member.status || "Active";
    const statusClass = HRManagementDataLoader.resolveStatusBadgeClass(statusLabel);
    const statusRowClass = HRManagementDataLoader.resolveStatusRowClass(statusLabel);
    const searchIndex = `${fullName} ${member.nic || ""} ${member.mobile || ""}`.toLowerCase();
    const joinedDate = member.add_at_date || (member.add_at ? String(member.add_at).slice(0, 10) : "—");

    return `
      <tr
        class="hr-staff-clickable-row ${statusRowClass}"
        data-staff-id="${this.escapeHtml(member.id)}"
        data-staff-search="${this.escapeHtml(searchIndex)}"
        data-staff-status="${this.escapeHtml(statusLabel)}"
      >
        <td>
          <div class="hr-person-cell js-hr-view-staff" data-staff-id="${this.escapeHtml(member.id)}" title="Click to view staff details">
            <div class="hr-avatar">${this.escapeHtml(initials)}</div>
            <div>
              <div class="hr-person-name hr-person-link">${this.escapeHtml(fullName)}</div>
              <div class="hr-person-sub">ID #STF-${this.escapeHtml(paddedId)}</div>
            </div>
          </div>
        </td>
        <td><span class="hr-mono">${this.escapeHtml(member.nic || "—")}</span></td>
        <td>
          <span class="hr-phone"><i class="fa-solid fa-phone"></i> ${this.escapeHtml(member.mobile || "—")}</span>
        </td>
        <td>
          <span class="hr-tag ${statusClass}"><span class="hr-dot"></span> ${this.escapeHtml(statusLabel)}</span>
        </td>
        <td>${this.escapeHtml(joinedDate)}</td>
        <td>
          <div class="hr-row-actions">
            <button
              type="button"
              class="ant-btn ant-btn-default ant-btn-sm js-hr-quick-salary"
              data-staff-id="${this.escapeHtml(member.id)}"
              title="Update Base Salary"
            >
              <i class="fa-solid fa-money-check-dollar" style="color: #722ed1;"></i> Salary
            </button>
            <button
              type="button"
              class="ant-btn ant-btn-default ant-btn-sm js-hr-quick-daily-pay"
              data-staff-id="${this.escapeHtml(member.id)}"
              title="Record Daily Salary Payment"
            >
              <i class="fa-solid fa-hand-holding-dollar" style="color: #10b981;"></i> Pay
            </button>
            <button
              type="button"
              class="ant-btn ant-btn-default ant-btn-sm js-hr-change-status"
              data-staff-id="${this.escapeHtml(member.id)}"
              data-staff-name="${this.escapeHtml(fullName)}"
              data-staff-nic="${this.escapeHtml(member.nic || "")}"
              data-status-id="${this.escapeHtml(member.staff_statuses_id || 1)}"
              data-status-label="${this.escapeHtml(statusLabel)}"
              title="Change Employment Status"
            >
              <i class="fa-solid fa-arrows-rotate" style="color: #1677ff;"></i> Status
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  /**
   * Static helper to build row HTML directly from a staff object.
   *
   * @param {Object} member
   * @returns {string}
   */
  static build(member) {
    return new StaffRowBuilder(member).build();
  }
}

export default StaffRowBuilder;
