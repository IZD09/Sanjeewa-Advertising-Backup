/**
 * HR Management Tab Navigation Process
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

export class HRTabNavigationProcess {
  /**
   * @param {Object} [options={}]
   * @param {HTMLElement|null} [options.moduleEl]
   * @param {Function} [options.onTabSwitched]
   */
  constructor(options = {}) {
    this.moduleEl = options.moduleEl || document.getElementById("module-hr-management");
    this.onTabSwitched = options.onTabSwitched || (() => {});

    this.tabButtons = this.moduleEl
      ? this.moduleEl.querySelectorAll(".hr-tab-btn[data-hr-tab]")
      : [];
    this.tabPanes = this.moduleEl
      ? this.moduleEl.querySelectorAll(".hr-tab-pane")
      : [];

    this.bindEvents();
  }

  bindEvents() {
    this.tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-hr-tab");
        this.switchTab(targetTab);
      });
    });
  }

  /**
   * Activate target HR tab pane and highlight matching button.
   *
   * @param {string} tabId
   */
  switchTab(tabId) {
    this.tabButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-hr-tab") === tabId);
    });

    this.tabPanes.forEach((pane) => {
      pane.classList.toggle("active", pane.id === tabId);
    });

    this.onTabSwitched(tabId);
  }
}

export default HRTabNavigationProcess;
