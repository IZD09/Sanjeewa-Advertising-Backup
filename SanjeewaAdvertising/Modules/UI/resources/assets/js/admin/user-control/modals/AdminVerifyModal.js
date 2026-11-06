/**
 * Admin Security Verification Modal Handler
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Prompts for administrator credentials (username & password) to authorize sensitive operations:
 * - Switching to Administrators tab
 * - Opening Add Admin modal
 */

"use strict";

import { RequestHandler } from "../../../core/RequestHandler.js";

export class AdminVerifyModal {
  /**
   * @param {Object} options
   * @param {Function} [options.onVerified] - Callback when verification succeeds
   * @param {Function} [options.onCancelled] - Callback when modal is cancelled/closed
   */
  constructor(options = {}) {
    this.http = new RequestHandler();
    this.onVerified = options.onVerified || (() => {});
    this.onCancelled = options.onCancelled || (() => {});

    this.overlay = document.getElementById("adminSecurityLockModal");
    this.form = document.getElementById("formVerifySecurityAccess");
    this.usernameInput = document.getElementById("secVerifyUsername");
    this.passwordInput = document.getElementById("secVerifyPassword");
    this.submitBtn = document.getElementById("btnSecVerifySubmit");
    this.cancelBtn = document.getElementById("btnSecVerifyCancel");
    this.closeBtn = this.overlay ? this.overlay.querySelector(".uc-modal-close") : null;
    this.errorMsg = document.getElementById("secVerifyError");
    this.descEl = document.getElementById("secVerifyDesc");

    this.currentActionCallback = null;
    this.isProcessing = false;

    this.bindEvents();
  }

  bindEvents() {
    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.submit();
      });
    }

    if (this.cancelBtn) {
      this.cancelBtn.addEventListener("click", () => {
        this.close();
      });
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => {
        this.close();
      });
    }

    if (this.overlay) {
      this.overlay.addEventListener("click", (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen()) {
        this.close();
      }
    });
  }

  isOpen() {
    return this.overlay && this.overlay.classList.contains("active");
  }

  /**
   * Request permission before executing a callback action.
   * Prompts user for username and password every time.
   *
   * @param {Object} [details]
   * @param {string} [details.description] - Custom explanation text
   * @param {Function} [details.onSuccess] - Callback to execute upon successful verification
   */
  requestPermission(details = {}) {
    this.currentActionCallback = details.onSuccess || null;

    if (this.descEl && details.description) {
      this.descEl.textContent = details.description;
    } else if (this.descEl) {
      this.descEl.textContent = "This action requires administrator credentials. Please enter your administrator username and password to proceed.";
    }

    this.open();
  }

  open() {
    if (!this.overlay) return;
    if (this.form) this.form.reset();
    if (this.errorMsg) this.errorMsg.style.display = "none";

    const defaultUser = window.__CURRENT_ADMIN_USERNAME__ || "";
    if (this.usernameInput && !this.usernameInput.value && defaultUser) {
      this.usernameInput.value = defaultUser;
    }

    this.overlay.classList.add("active");

    setTimeout(() => {
      if (this.usernameInput && !this.usernameInput.value) {
        this.usernameInput.focus();
      } else if (this.passwordInput) {
        this.passwordInput.focus();
      }
    }, 150);
  }

  close() {
    if (!this.overlay) return;
    this.overlay.classList.remove("active");
    if (this.form) this.form.reset();
    if (this.errorMsg) this.errorMsg.style.display = "none";

    const cancelledCb = this.onCancelled;
    this.currentActionCallback = null;
    if (typeof cancelledCb === "function") {
      cancelledCb();
    }
  }

  async submit() {
    if (this.isProcessing) return;

    const username = this.usernameInput?.value.trim();
    const password = this.passwordInput?.value;

    if (!username || !password) {
      this.showError("Please enter both administrator username and password.");
      return;
    }

    this.isProcessing = true;
    const originalBtnHtml = this.submitBtn ? this.submitBtn.innerHTML : "";
    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
    }
    if (this.errorMsg) this.errorMsg.style.display = "none";

    try {
      const response = await this.http.post("/admin/profile/verify", {
        username: username,
        password: password
      });

      if (response && response.success && response.data?.verified) {
        const verifiedAdmin = response.data.admin;
        const actionCb = this.currentActionCallback;
        
        // Hide modal
        if (this.overlay) this.overlay.classList.remove("active");
        if (this.form) this.form.reset();

        this.onVerified(verifiedAdmin);

        if (typeof actionCb === "function") {
          actionCb(verifiedAdmin);
        }
      } else {
        this.showError(response?.message || "Invalid administrator credentials.");
      }
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Failed to verify administrator credentials.";
      this.showError(msg);
    } finally {
      this.isProcessing = false;
      if (this.submitBtn) {
        this.submitBtn.disabled = false;
        this.submitBtn.innerHTML = originalBtnHtml;
      }
    }
  }

  showError(message) {
    if (!this.errorMsg) return;
    this.errorMsg.textContent = message;
    this.errorMsg.style.display = "block";
    if (this.passwordInput) {
      this.passwordInput.value = "";
      this.passwordInput.focus();
    }
  }
}

