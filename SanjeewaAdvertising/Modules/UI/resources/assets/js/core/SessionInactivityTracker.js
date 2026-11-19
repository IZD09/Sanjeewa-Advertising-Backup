/**
 * Session Inactivity Tracker & Auto-Deactivator
 * Sanjeewa Advertising Printing Shop Management System
 *
 * Automatically monitors real user activities (mouse, keyboard, scroll, touch).
 * If a user or admin is completely inactive for 10 minutes (600 seconds):
 * - Displays an interactive warning at 9 minutes (60s countdown) with "Stay Logged In".
 * - At 10 minutes (600s), securely deactivates session on backend, updates database status, and redirects to login.
 */

"use strict";

import { RequestHandler } from "./RequestHandler.js";

export class SessionInactivityTracker {
  constructor(options = {}) {
    // Inactivity limits
    this.timeoutSeconds = Number(options.timeoutSeconds) || 600; // 10 minutes
    this.warningSeconds = Number(options.warningSeconds) || 540; // 9 minutes
    this.checkIntervalMs = Number(options.checkIntervalMs) || 2000;
    this.heartbeatThrottleMs = 120000; // Send background keep-alive every 2 minutes while active

    this.http = new RequestHandler();
    this.lastActivityTime = Date.now();
    this.lastHeartbeatTime = Date.now();
    this.timer = null;
    this.isWarningShown = false;
    this.isDeactivating = false;

    this.init();
  }

  init() {
    // Check if we are on a login or public guest page
    if (this.isGuestPage()) {
      return;
    }

    this.injectModalMarkup();
    this.bindUserActivityListeners();
    this.startTracking();
  }

  isGuestPage() {
    const path = window.location.pathname.toLowerCase();
    return path === "/login" ||
           path.endsWith("/login") ||
           path === "/logout" ||
           path.endsWith("/logout") ||
           document.body.classList.contains("auth-page");
  }

  isAdminArea() {
    return window.location.pathname.toLowerCase().startsWith("/admin");
  }

  bindUserActivityListeners() {
    const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    let lastRecorded = 0;

    const onUserAction = () => {
      const now = Date.now();
      // Throttle event handling to once every 1000ms
      if (now - lastRecorded < 1000) return;
      lastRecorded = now;

      this.lastActivityTime = now;

      // If warning modal is currently visible, clicking or interacting dismisses it and keeps session alive
      if (this.isWarningShown && !this.isDeactivating) {
        this.dismissWarning();
        this.sendKeepAlive();
      }

      // Send background keep-alive ping periodically while user is actively working
      if (now - this.lastHeartbeatTime > this.heartbeatThrottleMs) {
        this.lastHeartbeatTime = now;
        this.sendKeepAlive();
      }
    };

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, onUserAction, { passive: true });
    });

    // When the browser tab regains visibility (e.g. laptop opened or tab switched back)
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        this.checkInactivity();
      }
    });
  }

  startTracking() {
    this.stopTracking();
    this.timer = setInterval(() => {
      this.checkInactivity();
    }, this.checkIntervalMs);
  }

  stopTracking() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  checkInactivity() {
    if (this.isDeactivating || this.isGuestPage()) {
      return;
    }

    const elapsedSeconds = Math.floor((Date.now() - this.lastActivityTime) / 1000);

    // 1. Session timeout reached (10 minutes)
    if (elapsedSeconds >= this.timeoutSeconds) {
      this.deactivateSession();
      return;
    }

    // 2. Warning threshold reached (9 minutes)
    if (elapsedSeconds >= this.warningSeconds) {
      const remainingSeconds = Math.max(0, this.timeoutSeconds - elapsedSeconds);
      this.showWarning(remainingSeconds);
    } else if (this.isWarningShown) {
      this.dismissWarning();
    }
  }

  showWarning(remainingSeconds) {
    this.isWarningShown = true;
    const modal = document.getElementById("sitWarningModal");
    const countEl = document.getElementById("sitCountdown");

    if (countEl) {
      countEl.textContent = remainingSeconds;
    }
    if (modal && modal.style.display !== "flex") {
      modal.style.display = "flex";
      // Force animation
      requestAnimationFrame(() => modal.classList.add("sit-active"));
    }
  }

  dismissWarning() {
    this.isWarningShown = false;
    const modal = document.getElementById("sitWarningModal");
    if (modal) {
      modal.classList.remove("sit-active");
      setTimeout(() => {
        if (!this.isWarningShown) {
          modal.style.display = "none";
        }
      }, 200);
    }
  }

  async sendKeepAlive() {
    try {
      await this.http.post("/session/keep-alive", {}, {
        headers: { "X-Background-Poll": "1" }
      });
      this.lastHeartbeatTime = Date.now();
    } catch (e) {
      // Non-blocking ping
    }
  }

  async deactivateSession() {
    if (this.isDeactivating) return;
    this.isDeactivating = true;
    this.stopTracking();
    this.dismissWarning();

    const deactModal = document.getElementById("sitDeactivatedModal");
    if (deactModal) {
      deactModal.style.display = "flex";
      requestAnimationFrame(() => deactModal.classList.add("sit-active"));
    }

    let redirectUrl = this.isAdminArea() ? "/admin/login" : "/login";

    try {
      const response = await this.http.post("/session/inactivity-timeout", {});
      if (response?.redirect_url) {
        redirectUrl = response.redirect_url;
      }
    } catch (e) {
      // Proceed to redirect even if network interrupted
    }

    // Redirect after 2.5 seconds or let user click 'Log In Again'
    const btnRelogin = document.getElementById("btnSitRelogin");
    if (btnRelogin) {
      btnRelogin.addEventListener("click", () => {
        window.location.href = redirectUrl;
      });
    }

    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 2800);
  }

  injectModalMarkup() {
    if (document.getElementById("sitWarningModal")) return;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <!-- 1. Inactivity Warning Modal (9 Minutes) -->
      <div id="sitWarningModal" class="sit-modal-overlay" style="display: none;">
        <div class="sit-modal-card">
          <div class="sit-modal-icon-badge sit-icon-warning">
            <i class="fa-solid fa-hourglass-half"></i>
          </div>
          <h3 class="sit-modal-title">Session Inactivity Warning</h3>
          <p class="sit-modal-desc">
            You have been inactive for over 9 minutes. To protect system security, your session will be deactivated in
            <strong id="sitCountdown" class="sit-countdown">60</strong> seconds.
          </p>
          <div class="sit-modal-actions">
            <button type="button" class="sit-btn sit-btn-primary" id="btnSitStayLoggedIn">
              <i class="fa-solid fa-circle-check"></i> Stay Logged In
            </button>
            <button type="button" class="sit-btn sit-btn-secondary" id="btnSitLogoutNow">
              <i class="fa-solid fa-right-from-bracket"></i> Log Out
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Session Deactivated Modal (10 Minutes) -->
      <div id="sitDeactivatedModal" class="sit-modal-overlay" style="display: none;">
        <div class="sit-modal-card sit-card-deactivated">
          <div class="sit-modal-icon-badge sit-icon-deactivated">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
          <h3 class="sit-modal-title">Session Deactivated</h3>
          <p class="sit-modal-desc">
            Your session has been deactivated due to 10 minutes of inactivity. Please log in again to resume your work safely.
          </p>
          <div class="sit-modal-actions">
            <button type="button" class="sit-btn sit-btn-primary" id="btnSitRelogin">
              <i class="fa-solid fa-arrow-right-to-bracket"></i> Log In Again
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);

    // Bind warning modal buttons
    const btnStay = document.getElementById("btnSitStayLoggedIn");
    if (btnStay) {
      btnStay.addEventListener("click", () => {
        this.lastActivityTime = Date.now();
        this.dismissWarning();
        this.sendKeepAlive();
      });
    }

    const btnLogout = document.getElementById("btnSitLogoutNow");
    if (btnLogout) {
      btnLogout.addEventListener("click", () => {
        this.deactivateSession();
      });
    }
  }
}
