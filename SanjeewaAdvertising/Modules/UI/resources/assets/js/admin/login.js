/**
 * SanjeewaAdvertising - Admin Login Module (OOP Class Architecture)
 * Responsible for:
 * - Managing admin authentication form interactions and state
 * - Password visibility toggle with icon switching
 * - Real-time input validation using ValidatBuilder component
 * - Asynchronous authentication submission with CSRF protection
 * - Elevated security feedback and audit status indicators
 */

import { ValidatBuilder } from "../core/ValidatBuilder.js";
import { RequestHandler } from "../core/RequestHandler.js";

export class AdminLoginManager {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.formId="adminLoginForm"]
   * @param {string} [options.usernameId="adminUsername"]
   * @param {string} [options.passwordId="adminPassword"]
   * @param {string} [options.statusId="adminStatusBanner"]
   * @param {string} [options.submitButtonId="adminSubmitBtn"]
   * @param {string} [options.submitLabelId="adminSubmitLabel"]
   * @param {string} [options.eyeButtonId="adminPasswordToggle"]
   * @param {string} [options.rememberId="adminRemember"]
   * @param {string} [options.usernameFieldId="adminUsernameField"]
   * @param {string} [options.passwordFieldId="adminPasswordField"]
   * @param {string} [options.yearId="adminCopyrightYear"]
   */
  constructor(options = {}) {
    this.options = options;

    this.form = null;
    this.usernameInput = null;
    this.passwordInput = null;
    this.statusBanner = null;
    this.submitButton = null;
    this.submitLabel = null;
    this.eyeButton = null;
    this.rememberCheckbox = null;
    this.usernameField = null;
    this.passwordField = null;
    this.yearElement = null;

    this.init();
  }

  /**
   * Initialize DOM elements, events, and dynamic features.
   */
  init() {
    const $ = (id) => document.getElementById(id);

    this.form = $(this.options.formId || "adminLoginForm");
    this.usernameInput = $(this.options.usernameId || "adminUsername");
    this.passwordInput = $(this.options.passwordId || "adminPassword");
    this.statusBanner = $(this.options.statusId || "adminStatusBanner");
    this.submitButton = $(this.options.submitButtonId || "adminSubmitBtn");
    this.submitLabel = $(this.options.submitLabelId || "adminSubmitLabel");
    this.eyeButton = $(this.options.eyeButtonId || "adminPasswordToggle");
    this.rememberCheckbox = $(this.options.rememberId || "adminRemember");
    this.usernameField = $(this.options.usernameFieldId || "adminUsernameField");
    this.passwordField = $(this.options.passwordFieldId || "adminPasswordField");
    this.yearElement = $(this.options.yearId || "adminCopyrightYear");

    this.updateCopyrightYear();
    this.bindEvents();
  }

  /**
   * Automatically update the footer year.
   */
  updateCopyrightYear() {
    if (this.yearElement) {
      this.yearElement.textContent = String(new Date().getFullYear());
    }
  }

  /**
   * Attach all event listeners.
   */
  bindEvents() {
    // Password visibility toggle
    if (this.eyeButton && this.passwordInput) {
      this.eyeButton.addEventListener("click", () => this.togglePasswordVisibility());
    }

    // Username validation listeners
    if (this.usernameInput) {
      this.usernameInput.addEventListener("blur", () => {
        if (this.usernameInput.value) {
          this.validateUsername();
        }
      });

      this.usernameInput.addEventListener("input", () => {
        if (this.usernameField?.classList.contains("bad")) {
          this.validateUsername();
        }
      });
    }

    // Password validation listeners
    if (this.passwordInput) {
      this.passwordInput.addEventListener("blur", () => {
        if (this.passwordInput.value) {
          this.validatePassword();
        }
      });

      this.passwordInput.addEventListener("input", () => {
        if (this.passwordField?.classList.contains("bad")) {
          this.validatePassword();
        }
      });
    }

    // Form submission
    if (this.form) {
      this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }
  }

  /**
   * Toggle password input visibility between text and password.
   */
  togglePasswordVisibility() {
    if (!this.passwordInput || !this.eyeButton) return;

    const isPassword = this.passwordInput.type === "password";
    this.passwordInput.type = isPassword ? "text" : "password";
    this.eyeButton.setAttribute("aria-pressed", isPassword ? "true" : "false");

    const icon = this.eyeButton.querySelector("i");
    if (icon) {
      if (isPassword) {
        icon.className = "fa-solid fa-eye-slash";
      } else {
        icon.className = "fa-solid fa-eye";
      }
    }
  }

  /**
   * Validate the administrator username/identifier.
   * @returns {boolean}
   */
  validateUsername() {
    if (!this.usernameInput || !this.usernameField) return false;

    const val = this.usernameInput.value.trim();
    const validator = new ValidatBuilder();

    if (val.includes("@")) {
      validator.addEmailValidator(val, "email");
    } else {
      validator.addTextValidator(val, "username", 50, 3);
    }

    const result = validator.validate();
    const hasError = result.getStatus();

    if (hasError) {
      this.usernameField.classList.add("bad");
      const errEl = this.usernameField.querySelector(".err");
      if (errEl) {
        errEl.textContent = val ? "Admin username must be at least 3 characters." : "Enter your administrator username or email.";
      }
      return false;
    }

    this.usernameField.classList.remove("bad");
    return true;
  }

  /**
   * Validate the administrator password.
   * @returns {boolean}
   */
  validatePassword() {
    if (!this.passwordInput || !this.passwordField) return false;

    const val = this.passwordInput.value;
    const validator = new ValidatBuilder();
    validator.addPasswordValidator(val, val, 100, 4);

    const result = validator.validate();
    const hasError = result.getStatus();

    if (hasError) {
      this.passwordField.classList.add("bad");
      const errEl = this.passwordField.querySelector(".err");
      if (errEl) {
        errEl.textContent = val ? "Password must be at least 4 characters." : "Enter your administrator security key.";
      }
      return false;
    }

    this.passwordField.classList.remove("bad");
    return true;
  }

  /**
   * Display status message banner.
   * @param {string} msg
   * @param {'error'|'success'} [type='error']
   */
  setStatus(msg, type = "error") {
    if (!this.statusBanner) return;

    const isErr = type === "error";
    this.statusBanner.className = `status show ${isErr ? "is-error" : "is-success"}`;
    const iconClass = isErr ? "fa-triangle-exclamation" : "fa-circle-check";
    this.statusBanner.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${msg}</span>`;
  }

  /**
   * Clear status message banner.
   */
  clearStatus() {
    if (!this.statusBanner) return;
    this.statusBanner.className = "status";
    this.statusBanner.innerHTML = "";
  }

  /**
   * Set loading button state.
   * @param {boolean} isLoading
   */
  setLoading(isLoading) {
    if (!this.submitButton) return;

    this.submitButton.disabled = isLoading;
    if (isLoading) {
      this.submitButton.classList.add("load");
      if (this.submitLabel) {
        this.submitLabel.textContent = "Verifying Credentials...";
      }
    } else {
      this.submitButton.classList.remove("load");
      if (this.submitLabel) {
        this.submitLabel.textContent = "Authenticate & Enter Console";
      }
    }
  }

  /**
   * Handle form submission asynchronously.
   * @param {Event} e
   */
  async handleSubmit(e) {
    e.preventDefault();
    this.clearStatus();

    const isUserValid = this.validateUsername();
    const isPassValid = this.validatePassword();

    if (!isUserValid || !isPassValid) {
      this.setStatus("Please correct the errors before submitting.", "error");
      return;
    }

    this.setLoading(true);

    const actionUrl = this.form.getAttribute("action") || "/admin/login";
    const redirectUrl = this.form.getAttribute("data-redirect") || "/dashboard";

    const payload = {
      username: this.usernameInput.value.trim(),
      password: this.passwordInput.value,
      remember: this.rememberCheckbox ? this.rememberCheckbox.checked : false
    };

    try {
      const response = await RequestHandler.post(actionUrl, payload);

      if (response && (response.success || response.status === "success" || response.data)) {
        this.setStatus("Authentication successful! Loading administrator console...", "success");
        const targetUrl = response?.data?.redirect_url || response?.redirect_url || redirectUrl;
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 600);
      } else {
        const errorMsg = response?.message || response?.error || "Invalid administrator credentials or access denied.";
        this.setStatus(errorMsg, "error");
        this.setLoading(false);
      }
    } catch (err) {
      console.error("[AdminLoginManager] Authentication error:", err);
      const errorMsg = err?.response?.data?.message || err?.message || "Authentication failed. Please check credentials and try again.";
      this.setStatus(errorMsg, "error");
      this.setLoading(false);
    }
  }
}

// Auto-initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("adminLoginForm")) {
    window.adminLoginManager = new AdminLoginManager();
  }
});
