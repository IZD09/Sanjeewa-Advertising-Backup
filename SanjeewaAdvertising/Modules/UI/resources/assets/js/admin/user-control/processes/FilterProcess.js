/**
 * User Control Filter & Tab Navigation Process
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

export class FilterProcess {
  constructor(options = {}) {
    this.tabButtons = document.querySelectorAll(".uc-tab-btn");
    this.tabPanes = document.querySelectorAll(".uc-tab-pane");
    this.onTabSwitched = options.onTabSwitched || (() => {});

    this.bindEvents();
  }

  bindEvents() {
    this.tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-tab");
        this.switchTab(targetTab);
      });
    });
  }

  switchTab(tabId) {
    this.tabButtons.forEach(b => {
      if (b.getAttribute("data-tab") === tabId) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });

    this.tabPanes.forEach(p => {
      if (p.id === tabId) {
        p.classList.add("active");
      } else {
        p.classList.remove("active");
      }
    });

    this.onTabSwitched(tabId);
  }
}

