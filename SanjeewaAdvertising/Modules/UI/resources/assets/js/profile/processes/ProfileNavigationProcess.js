/**
 * SanjeewaAdvertising - Profile Navigation Process
 *
 * Coordinates tab switching among:
 * 1. tabPersonal (Personal Details)
 * 2. tabSecurity (Password & Security)
 * 3. tabPermissions (Assigned Permissions)
 * 4. tabLogins (Recent Logins)
 */

"use strict";

export class ProfileNavigationProcess {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.onTabSwitch]
   */
  constructor(options = {}) {
    this.tabBtns = document.querySelectorAll(".up-tab-btn");
    this.tabPanes = document.querySelectorAll(".up-tab-pane");
    this.onTabSwitch = options.onTabSwitch || null;
    this.activeTab = "tabPersonal";

    this.bindEvents();
  }

  bindEvents() {
    this.tabBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const targetTab = btn.getAttribute("data-tab");
        if (targetTab) {
          this.switchTab(targetTab);
        }
      });
    });
  }

  /**
   * Switch active tab pane by ID.
   *
   * @param {string} targetTabId
   */
  switchTab(targetTabId) {
    this.activeTab = targetTabId;

    this.tabBtns.forEach(btn => {
      const isMatch = btn.getAttribute("data-tab") === targetTabId;
      btn.classList.toggle("active", isMatch);
    });

    this.tabPanes.forEach(pane => {
      const isMatch = pane.id === targetTabId;
      pane.classList.toggle("active", isMatch);
    });

    if (typeof this.onTabSwitch === "function") {
      this.onTabSwitch(targetTabId);
    }
  }
}

export default ProfileNavigationProcess;
