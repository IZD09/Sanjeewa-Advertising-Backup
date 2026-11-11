/**
 * SanjeewaAdvertising - Profile Logins Table Handler
 *
 * Coordinates rendering user login session history rows in #userLoginsTableBody
 * using ProfileSessionRowBuilder.
 */

"use strict";

import { ProfileSessionRowBuilder } from "../builders/ProfileSessionRowBuilder.js";

export class ProfileLoginsTableHandler {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.tbodyId="userLoginsTableBody"]
   */
  constructor(options = {}) {
    this.tbodyId = options.tbodyId || "userLoginsTableBody";
  }

  getTbody() {
    return document.getElementById(this.tbodyId);
  }

  /**
   * Render login sessions array into table rows.
   *
   * @param {Array<Object>} logins
   */
  render(logins = []) {
    const tbody = this.getTbody();
    if (!tbody) return;

    tbody.innerHTML = "";

    const items = Array.isArray(logins) ? logins : [];

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: #94a3b8; padding: 24px 16px;">
            <i class="fa-solid fa-list-check" style="font-size: 24px; margin-bottom: 6px; display: block; color: #cbd5e1;"></i>
            No login sessions recorded.
          </td>
        </tr>
      `;
      return;
    }

    items.forEach(session => {
      const row = ProfileSessionRowBuilder.buildFrom(session);
      tbody.appendChild(row);
    });
  }
}

export default ProfileLoginsTableHandler;
