/**
 * Admin Activities Tab Permission Verification Modal Handler
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

export class AdminActivitiesVerifyModal {
  /**
   * @param {Object} [options={}]
   * @param {Object} options.dataLoader
   * @param {Function} [options.onVerified]
   */
  constructor(options = {}) {
    this.dataLoader = options.dataLoader;
    this.onVerified = options.onVerified || (() => {});

    this.overlay = document.getElementById("adminActivitiesVerifyModal");
    this.form = document.getElementById("formVerifyActivitiesAccess");
    this.usernameInput = document.getElementById("verifyActAdminUsername");
    this.passwordInput = document.getElementById("verifyActAdminPassword");
    this.submitBtn = document.getElementById("btnSubmitActivitiesVerify");
    this.errorEl = document.getElementById("verifyActAccessError");
    this.btnCancel = document.getElementById("btnCancelActivitiesVerify");

    this.bindEvents();
  }

  bindEvents() {
    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.submit();
      });
    }

    if (this.btnCancel) {
      this.btnCancel.addEventListener("click", () => {
        this.close();
      });
    }
  }

  open() {
    if (!this.overlay) return;
    if (this.form) this.form.reset();
    if (this.errorEl) this.errorEl.style.display = "none";

    const verifiedAdmin = this.dataLoader?.getVerifiedAdmin();
    const defaultUser = verifiedAdmin?.username || window.__CURRENT_ADMIN_USERNAME__ || "";
    if (this.usernameInput) {
      this.usernameInput.value = defaultUser;
    }

    this.overlay.classList.add("active");
    setTimeout(() => {
      if (this.passwordInput) {
        this.passwordInput.focus();
      }
    }, 150);
  }

  close() {
    if (!this.overlay) return;
    this.overlay.classList.remove("active");
  }

  async submit() {
    const verifiedAdmin = this.dataLoader?.getVerifiedAdmin();
    const username =
      this.usernameInput?.value.trim() ||
      verifiedAdmin?.username ||
      window.__CURRENT_ADMIN_USERNAME__;
    const password = this.passwordInput?.value;

    if (!username || !password) {
      this.showError("Please enter your administrator password.");
      return;
    }

    const originalBtnHtml = this.submitBtn ? this.submitBtn.innerHTML : "";
    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
    }
    if (this.errorEl) this.errorEl.style.display = "none";

    try {
      const response = await this.dataLoader.verifyCredentials(username, password);

      if (response && response.success) {
        this.close();
        this.onVerified();
      } else {
        const msg = response?.message || "Invalid administrator password.";
        this.showError(msg);
      }
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Failed to verify administrator password.";
      this.showError(msg);
    } finally {
      if (this.submitBtn) {
        this.submitBtn.disabled = false;
        this.submitBtn.innerHTML = originalBtnHtml;
      }
    }
  }

  showError(message) {
    if (!this.errorEl) return;
    this.errorEl.textContent = message;
    this.errorEl.style.display = "block";
    if (this.passwordInput) {
      this.passwordInput.value = "";
      this.passwordInput.focus();
    }
  }
}

export default AdminActivitiesVerifyModal;
