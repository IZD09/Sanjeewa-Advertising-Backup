/**
 * Admin Recent Logins Table Handler
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

import { AdminLoginRowBuilder } from "../builders/AdminLoginRowBuilder.js";

export class AdminLoginsTableHandler {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.tbodyId="adminLoginsTableBody"]
   */
  constructor(options = {}) {
    this.tbody = document.getElementById(options.tbodyId || "adminLoginsTableBody");
  }

  /**
   * Render administrator login session history rows.
   *
   * @param {Array<Object>} logins
   */
  render(logins = []) {
    if (!this.tbody) return;

    const items = Array.isArray(logins) ? logins : [];

    if (items.length === 0) {
      this.tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: #94a3b8; padding: 24px;">
            No login sessions recorded.
          </td>
        </tr>
      `;
      return;
    }

    this.tbody.innerHTML = items.map((log) => AdminLoginRowBuilder.build(log)).join("");
  }
}

export default AdminLoginsTableHandler;
