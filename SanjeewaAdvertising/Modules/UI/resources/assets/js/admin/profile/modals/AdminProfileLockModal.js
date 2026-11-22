/**
 * Admin Profile Identity Lock Modal Handler
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Prompts administrator credentials on page entry before revealing profile content.
 */

"use strict";

export class AdminProfileLockModal {
  /**
   * @param {Object} [options={}]
   * @param {Object} options.dataLoader
   * @param {Function} [options.onVerified]
   * @param {Function} [options.onCancelled]
   */
  constructor(options = {}) {
    this.dataLoader = options.dataLoader;
    this.onVerified = options.onVerified || (() => {});
    this.onCancelled = options.onCancelled || (() => {
      window.location.href = "/admin/dashboard";
    });

    this.overlay = document.getElementById("adminProfileLockModal");
    this.form = document.getElementById("formVerifyAdminAccess");
    this.usernameInput = document.getElementById("verifyAdminUsername");
    this.passwordInput = document.getElementById("verifyAdminPassword");
    this.submitBtn = document.getElementById("btnVerifyAccessSubmit");
    this.errorEl = document.getElementById("verifyAccessError");
    this.btnCancel = document.getElementById("btnCancelVerify");
    this.profileContent = document.getElementById("adminProfileContent");

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
        this.onCancelled();
      });
    }
  }

  open() {
    if (!this.overlay) return;
    if (this.form) this.form.reset();
    if (this.errorEl) this.errorEl.style.display = "none";

    if (this.usernameInput) {
      this.usernameInput.value = "";
      this.usernameInput.setAttribute("readonly", "readonly");
    }
    if (this.passwordInput) {
      this.passwordInput.value = "";
      this.passwordInput.setAttribute("readonly", "readonly");
    }

    this.overlay.classList.add("active");
    if (this.profileContent) {
      this.profileContent.style.filter = "blur(6px)";
      this.profileContent.style.pointerEvents = "none";
    }

    setTimeout(() => {
      if (this.usernameInput) {
        this.usernameInput.removeAttribute("readonly");
        this.usernameInput.value = "";
        this.usernameInput.focus();
      }
      if (this.passwordInput) {
        this.passwordInput.removeAttribute("readonly");
        this.passwordInput.value = "";
      }
    }, 150);
  }

  close() {
    if (!this.overlay) return;
    this.overlay.classList.remove("active");
    if (this.form) this.form.reset();
    if (this.usernameInput) {
      this.usernameInput.value = "";
      this.usernameInput.setAttribute("readonly", "readonly");
    }
    if (this.passwordInput) {
      this.passwordInput.value = "";
      this.passwordInput.setAttribute("readonly", "readonly");
    }
    if (this.profileContent) {
      this.profileContent.style.filter = "none";
      this.profileContent.style.pointerEvents = "auto";
    }
  }

  async submit() {
    const username = this.usernameInput?.value.trim();
    const password = this.passwordInput?.value;

    if (!username || !password) {
      this.showError("Please enter both username and password.");
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

      if (response && response.success && response.data?.admin) {
        this.close();
        this.onVerified(response.data.admin);
      } else {
        const msg = response?.message || "Invalid administrator credentials.";
        this.showError(msg);
      }
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Failed to verify credentials. Access denied.";
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

export default AdminProfileLockModal;
