/**
 * SanjeewaAdvertising - Profile Permissions Handler
 *
 * Coordinates rendering assigned module permissions cards in #userPermissionsContainer
 * using ProfilePermissionCardBuilder.
 */

"use strict";

import { ProfilePermissionCardBuilder } from "../builders/ProfilePermissionCardBuilder.js";

export class ProfilePermissionsHandler {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.containerId="userPermissionsContainer"]
   */
  constructor(options = {}) {
    this.containerId = options.containerId || "userPermissionsContainer";
  }

  getContainer() {
    return document.getElementById(this.containerId);
  }

  /**
   * Render assigned system module permissions into card elements.
   *
   * @param {Array<Object>} modules
   */
  render(modules = []) {
    const container = this.getContainer();
    if (!container) return;

    container.innerHTML = "";

    const items = Array.isArray(modules) ? modules : [];

    if (items.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: #94a3b8; padding: 28px 16px;">
          <i class="fa-solid fa-shield-halved" style="font-size: 28px; margin-bottom: 8px; display: block; color: #cbd5e1;"></i>
          No specific module permissions assigned.
        </div>
      `;
      return;
    }

    items.forEach(mod => {
      const card = ProfilePermissionCardBuilder.buildFrom(mod);
      container.appendChild(card);
    });
  }
}

export default ProfilePermissionsHandler;
