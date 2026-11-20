/**
 * Admin Profile Tab Navigation & Activities Security Auto-Lock Process
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

export class AdminProfileNavigationProcess {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.onRequireActivitiesVerification]
   * @param {Function} [options.onShowToast]
   * @param {number} [options.timeoutMs=60000]
   */
  constructor(options = {}) {
    this.onRequireActivitiesVerification = options.onRequireActivitiesVerification || (() => {});
    this.onShowToast = options.onShowToast || (() => {});
    this.TIMEOUT_MS = options.timeoutMs || 60000;

    this.tabBtns = document.querySelectorAll(".ap-tab-btn");
    this.tabPanes = document.querySelectorAll(".ap-tab-pane");
    this.profActionWrap = document.getElementById("profActionWrap");
    this.actTabLockIcon = document.getElementById("actTabLockIcon");
    this.btnLockAdminActivities = document.getElementById("btnLockAdminActivities");

    this.currentTab = "tabProfileDetails";
    this.hasVerifiedActivitiesAccess = false;
    this.activitiesInactivityTimer = null;
    this.activitiesAwayTimer = null;
    this.activitiesLeftTimestamp = null;
    this.boundResetInactivity = () => this.resetActivitiesInactivity();

    this.bindEvents();
  }

  bindEvents() {
    this.tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-tab");
        this.switchTab(targetTab);
      });
    });

    if (this.btnLockAdminActivities) {
      this.btnLockAdminActivities.addEventListener("click", () => {
        this.lockActivitiesTab();
      });
    }
  }

  /**
   * Mark Activities tab as verified and switch directly to it.
   */
  grantActivitiesAccess() {
    this.hasVerifiedActivitiesAccess = true;
    this.activitiesLeftTimestamp = null;

    if (this.activitiesAwayTimer) {
      clearTimeout(this.activitiesAwayTimer);
      this.activitiesAwayTimer = null;
    }

    if (this.actTabLockIcon) {
      this.actTabLockIcon.className = "fa-solid fa-lock-open";
      this.actTabLockIcon.style.color = "#52c41a";
      this.actTabLockIcon.title = "Permission granted";
    }

    this.switchTab("tabActivities");
  }

  /**
   * Switch active profile tab while enforcing Activities tab security rules.
   *
   * @param {string} tabId
   */
  switchTab(tabId) {
    // Leaving tabActivities to another tab
    if (this.currentTab === "tabActivities" && tabId !== "tabActivities") {
      this.stopActivitiesInactivityMonitoring();
      if (this.hasVerifiedActivitiesAccess) {
        this.activitiesLeftTimestamp = Date.now();
        if (this.activitiesAwayTimer) clearTimeout(this.activitiesAwayTimer);
        this.activitiesAwayTimer = setTimeout(() => {
          this.handleActivitiesAwayTimeout();
        }, this.TIMEOUT_MS);
      }
    }

    // Entering tabActivities
    if (tabId === "tabActivities") {
      if (this.hasVerifiedActivitiesAccess && this.activitiesLeftTimestamp) {
        const elapsed = Date.now() - this.activitiesLeftTimestamp;
        if (elapsed >= this.TIMEOUT_MS) {
          this.handleActivitiesAwayTimeout();
        }
      }

      if (!this.hasVerifiedActivitiesAccess) {
        this.onRequireActivitiesVerification();
        return;
      }

      if (this.activitiesAwayTimer) {
        clearTimeout(this.activitiesAwayTimer);
        this.activitiesAwayTimer = null;
      }
      this.activitiesLeftTimestamp = null;
      this.startActivitiesInactivityMonitoring();
    }

    this.currentTab = tabId;

    this.tabBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });

    this.tabPanes.forEach((pane) => {
      pane.classList.toggle("active", pane.id === tabId);
    });

    if (this.profActionWrap) {
      const isFormTab = tabId === "tabProfileDetails" || tabId === "tabSecurity";
      this.profActionWrap.style.display = isFormTab ? "flex" : "none";
    }
  }

  startActivitiesInactivityMonitoring() {
    this.stopActivitiesInactivityMonitoring();
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, this.boundResetInactivity, { passive: true }));
    this.activitiesInactivityTimer = setTimeout(() => {
      this.handleActivitiesInactivityTimeout();
    }, this.TIMEOUT_MS);
  }

  resetActivitiesInactivity() {
    if (this.currentTab !== "tabActivities") return;
    if (this.activitiesInactivityTimer) {
      clearTimeout(this.activitiesInactivityTimer);
    }
    this.activitiesInactivityTimer = setTimeout(() => {
      this.handleActivitiesInactivityTimeout();
    }, this.TIMEOUT_MS);
  }

  stopActivitiesInactivityMonitoring() {
    if (this.activitiesInactivityTimer) {
      clearTimeout(this.activitiesInactivityTimer);
      this.activitiesInactivityTimer = null;
    }
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((evt) => window.removeEventListener(evt, this.boundResetInactivity));
  }

  handleActivitiesInactivityTimeout() {
    this.stopActivitiesInactivityMonitoring();
    this.lockActivitiesTab("Activities tab was automatically locked due to 1 minute of inactivity.");
  }

  handleActivitiesAwayTimeout() {
    if (this.activitiesAwayTimer) {
      clearTimeout(this.activitiesAwayTimer);
      this.activitiesAwayTimer = null;
    }
    this.hasVerifiedActivitiesAccess = false;
    this.activitiesLeftTimestamp = null;

    if (this.actTabLockIcon) {
      this.actTabLockIcon.className = "fa-solid fa-lock";
      this.actTabLockIcon.style.color = "#faad14";
      this.actTabLockIcon.title = "Permission required";
    }

    this.onShowToast("Activities tab session expired (away > 1 minute). Locked.", "warning");
  }

  lockActivitiesTab(message = "Activities tab has been locked.") {
    this.stopActivitiesInactivityMonitoring();

    if (this.activitiesAwayTimer) {
      clearTimeout(this.activitiesAwayTimer);
      this.activitiesAwayTimer = null;
    }

    this.activitiesLeftTimestamp = null;
    this.hasVerifiedActivitiesAccess = false;

    if (this.actTabLockIcon) {
      this.actTabLockIcon.className = "fa-solid fa-lock";
      this.actTabLockIcon.style.color = "#faad14";
      this.actTabLockIcon.title = "Permission required";
    }

    if (this.currentTab === "tabActivities") {
      this.switchTab("tabProfileDetails");
    }

    this.onShowToast(message, "warning");
  }
}

export default AdminProfileNavigationProcess;
