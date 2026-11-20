/**
 * HR Daily Salary Payment Table Row Builder
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

import { BaseTableRowBuilder } from "../../../core/BaseTableRowBuilder.js";

export class DailySalaryRowBuilder extends BaseTableRowBuilder {
  /**
   * Build HTML markup for a single daily salary payment table row matching hr-management.blade.php.
   *
   * @returns {string}
   */
  build() {
    const payment = this._data || {};
    const paddedId = String(payment.id || 0).padStart(4, "0");
    const staffName = payment.staff_name || "Unknown Staff";
    const nameParts = staffName.trim().split(/\s+/);
    const initials = `${(payment.staff_first_name || nameParts[0] || "S")[0] || "S"}${(payment.staff_last_name || nameParts[1] || "")[0] || ""}`.toUpperCase();
    const payDateOnly = payment.pay_at_date || (payment.pay_at ? String(payment.pay_at).slice(0, 10) : "");
    const searchIndex = `${staffName} ${payment.staff_nic || ""}`.toLowerCase();

    return `
      <tr data-daily-search="${this.escapeHtml(searchIndex)}" data-daily-date="${this.escapeHtml(payDateOnly)}">
        <td><span class="hr-mono">#DS-${this.escapeHtml(paddedId)}</span></td>
        <td>
          <div class="hr-person-cell">
            <div class="hr-avatar green">${this.escapeHtml(initials)}</div>
            <div>
              <div class="hr-person-name">${this.escapeHtml(staffName)}</div>
              <div class="hr-person-sub">${this.escapeHtml(payment.staff_mobile || "—")}</div>
            </div>
          </div>
        </td>
        <td><span class="hr-mono">${this.escapeHtml(payment.staff_nic || "—")}</span></td>
        <td><strong class="hr-amount green">${this.formatCurrency(payment.amount)}</strong></td>
        <td>${this.escapeHtml(this.formatDate(payment.pay_at))}</td>
      </tr>
    `;
  }

  /**
   * Static helper to build row HTML directly from a daily salary payment record.
   *
   * @param {Object} payment
   * @returns {string}
   */
  static build(payment) {
    return new DailySalaryRowBuilder(payment).build();
  }
}

export default DailySalaryRowBuilder;
