/**
 * Admin Login Session Table Row Builder
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

import { BaseTableRowBuilder } from "../../../core/BaseTableRowBuilder.js";

export class AdminLoginRowBuilder extends BaseTableRowBuilder {
  /**
   * Build HTML markup for a single admin login session table row.
   *
   * @returns {string}
   */
  build() {
    const log = this._data || {};
    const loginTime = log.login ? new Date(log.login).toLocaleString() : "—";
    const logoutCell = log.logout
      ? new Date(log.logout).toLocaleString()
      : '<span class="ant-tag ant-tag-blue">Active Session</span>';

    return `
      <tr>
        <td><strong>#${this.escapeHtml(log.id)}</strong></td>
        <td><i class="fa-regular fa-clock" style="margin-right: 6px; color: #1677ff;"></i>${this.escapeHtml(loginTime)}</td>
        <td>${log.logout ? this.escapeHtml(logoutCell) : logoutCell}</td>
        <td><span class="ant-tag ant-tag-green">Success</span></td>
      </tr>
    `;
  }

  /**
   * Static helper to build row HTML directly from a login session record.
   *
   * @param {Object} log
   * @returns {string}
   */
  static build(log) {
    return new AdminLoginRowBuilder(log).build();
  }
}

export default AdminLoginRowBuilder;
