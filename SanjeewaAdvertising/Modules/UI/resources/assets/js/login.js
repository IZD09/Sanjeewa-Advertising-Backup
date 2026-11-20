/**
 * SanjeewaAdvertising - Login Module (OOP Class Architecture)
 * Responsible for:
 * - Managing login form interactions and state
 * - Password visibility toggle with SVG icon swapping
 * - Real-time input validation using ValidatBuilder component
 * - Asynchronous authentication submission with CSRF protection
 * - Loading indicators and user feedback alerts
 */

import { ValidatBuilder } from "./core/ValidatBuilder.js";
import { RequestHandler } from "./core/RequestHandler.js";

export class LoginManager {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.formId="form"]
   * @param {string} [options.usernameId="email"]
   * @param {string} [options.passwordId="pw"]
   * @param {string} [options.statusId="status"]
   * @param {string} [options.submitButtonId="go"]
   * @param {string} [options.submitLabelId="lbl"]
   * @param {string} [options.eyeButtonId="eye"]
   * @param {string} [options.eyeIconId="eye-i"]
   * @param {string} [options.yearId="yr"]
   * @param {string} [options.rememberId="rem"]
   * @param {string} [options.usernameFieldId="fe"]
   * @param {string} [options.passwordFieldId="fp"]
   */
  constructor(options = {}) {
    this.options = options;

    this.form = null;
    this.usernameInput = null;
    this.passwordInput = null;
    this.statusElement = null;
    this.submitButton = null;
    this.submitLabel = null;
    this.eyeButton = null;
    this.eyeIcon = null;
    this.yearElement = null;
    this.rememberCheckbox = null;
    this.usernameField = null;
    this.passwordField = null;

    // Permission Card elements
    this.loginFormSection = null;
    this.loginPermissionCard = null;
    this.btnRequestAccess = null;
    this.btnBackToLogin = null;
    this.permUserId = null;
    this.permUserName = null;
    this.permUserAvatar = null;
    this.permUserTag = null;
    this.permUserStatus = null;
    this.permStatus = null;
    this.permSpin = null;
    this.btnRequestIcon = null;
    this.btnRequestLabel = null;

    this.init();
  }

  /**
   * Initialize DOM elements, events, and dynamic year.
   */
  init() {
    const $ = (id) => document.getElementById(id);

    this.form = $(this.options.formId || "form");
    this.usernameInput = $(this.options.usernameId || "email");
    this.passwordInput = $(this.options.passwordId || "pw");
    this.statusElement = $(this.options.statusId || "status");
    this.submitButton = $(this.options.submitButtonId || "go");
    this.submitLabel = $(this.options.submitLabelId || "lbl");
    this.eyeButton = $(this.options.eyeButtonId || "eye");
    this.eyeIcon = $(this.options.eyeIconId || "eye-i");
    this.yearElement = $(this.options.yearId || "yr");
    this.rememberCheckbox = $(this.options.rememberId || "rem");
    this.usernameField = $(this.options.usernameFieldId || "fe");
    this.passwordField = $(this.options.passwordFieldId || "fp");

    // Permission restricted card elements
    this.loginFormSection = $("loginFormSection");
    this.loginPermissionCard = $("loginPermissionCard");
    this.btnRequestAccess = $("btnRequestAccess");
    this.btnBackToLogin = $("btnBackToLogin");
    this.permUserId = $("permUserId");
    this.permUserName = $("permUserName");
    this.permUserAvatar = $("permUserAvatar");
    this.permUserTag = $("permUserTag");
    this.permUserStatus = $("permUserStatus");
    this.permStatus = $("permStatus");
    this.permSpin = $("permSpin");
    this.btnRequestIcon = $("btnRequestIcon");
    this.btnRequestLabel = $("btnRequestLabel");

    this.updateCopyrightYear();
    this.updatePasswordEyeIcon();
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
      this.passwordInput.addEventListener("input", () => {
        this.updatePasswordEyeIcon();
        if (this.passwordField?.classList.contains("bad")) {
          this.validatePassword();
        }
      });
    }

    // Form submission listener
    if (this.form) {
      this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }

    // Permission request listeners
    if (this.btnRequestAccess) {
      this.btnRequestAccess.addEventListener("click", () => this.handleRequestAccess());
    }

    if (this.btnBackToLogin) {
      this.btnBackToLogin.addEventListener("click", () => this.hidePermissionCard());
    }
  }

  /**
   * Update the eye icon SVG and aria attributes to reflect current password visibility.
   */
  updatePasswordEyeIcon() {
    if (!this.passwordInput || !this.eyeIcon) return;

    const isVisible = this.passwordInput.type === "text";

    if (this.eyeButton) {
      this.eyeButton.setAttribute("aria-pressed", String(isVisible));
      this.eyeButton.setAttribute(
        "aria-label",
        isVisible ? "Hide password" : "Show password"
      );
    }

    this.eyeIcon.innerHTML = isVisible
      ? '<path d="M2 12s3.500-7 10-7 10 7 10 7-3.500 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
      : '<path d="M3 3l18 18"/><path d="M10.600 6.100A9.700 9.700 0 0112 5c6.500 0 10 7 10 7a17 17 0 01-3.200 4M6.600 6.600A17 17 0 002 12s3.500 7 10 7c1.600 0 3-.4 4.300-1"/><path d="M9.900 9.900a3 3 0 004.200 4.200"/>';
  }

  /**
   * Toggle password input visibility and swap eye icon.
   */
  togglePasswordVisibility() {
    if (!this.passwordInput) return;

    const isCurrentlyPassword = this.passwordInput.type === "password";
    this.passwordInput.type = isCurrentlyPassword ? "text" : "password";

    this.updatePasswordEyeIcon();
  }

  /**
   * Mark input container and element with validation error states and dynamic message.
   * @param {HTMLElement|null} fieldContainer
   * @param {HTMLInputElement|null} inputElement
   * @param {boolean} isInvalid
   * @param {string|null} [errorMessage=null]
   */
  markField(fieldContainer, inputElement, isInvalid, errorMessage = null) {
    if (fieldContainer) {
      fieldContainer.classList.toggle("bad", isInvalid);
      if (errorMessage) {
        const errEl = fieldContainer.querySelector(".err");
        if (errEl) {
          errEl.textContent = errorMessage;
        }
      }
    }
    if (inputElement) {
      inputElement.setAttribute("aria-invalid", String(isInvalid));
    }
  }

  /**
   * Validate username or email input using ValidatBuilder.
   * @returns {boolean}
   */
  validateUsername() {
    if (!this.usernameInput) return true;

    const val = this.usernameInput.value.trim();
    const validator = new ValidatBuilder();

    // Dynamically validate email or username based on format
    if (val.includes("@")) {
      validator.addEmailValidator(val, "email");
    } else {
      validator.addTextValidator(val, "username", 50, 2);
    }

    const result = validator.validate();
    const hasError = result.getStatus();
    const errorMessage = hasError ? result.getMessage() : "";

    this.markField(this.usernameField, this.usernameInput, hasError, errorMessage);
    return !hasError;
  }

  /**
   * Validate password field using ValidatBuilder.
   * @returns {boolean}
   */
  validatePassword() {
    if (!this.passwordInput) return true;

    const val = this.passwordInput.value;
    const validator = new ValidatBuilder()
      .addPasswordValidator(val, val, 100, 0);

    const result = validator.validate();
    const hasError = result.getStatus();
    const errorMessage = hasError ? result.getMessage() : "";

    this.markField(this.passwordField, this.passwordInput, hasError, errorMessage);
    return !hasError;
  }

  /**
   * Validate all form inputs before submit.
   * @returns {boolean}
   */
  validateForm() {
    const isUserValid = this.validateUsername();
    const isPassValid = this.validatePassword();

    if (!isUserValid) {
      this.usernameInput?.focus();
      return false;
    }

    if (!isPassValid) {
      this.passwordInput?.focus();
      return false;
    }

    return true;
  }

  /**
   * Set loading button state.
   * @param {boolean} isLoading
   * @param {string} [label="Signing in…"]
   */
  setLoading(isLoading, label = "Signing in…") {
    if (this.submitButton) {
      this.submitButton.disabled = isLoading;
      this.submitButton.classList.toggle("load", isLoading);
    }

    if (this.submitLabel) {
      this.submitLabel.textContent = isLoading ? label : "Sign in";
    }
  }

  /**
   * Display status feedback message.
   * @param {string} message
   * @param {"normal"|"error"|"success"} [type="normal"]
   */
  setStatus(message, type = "normal") {
    if (!this.statusElement) return;

    this.statusElement.textContent = message;

    if (type === "error") {
      this.statusElement.className = "status show is-error";
    } else if (type === "success") {
      this.statusElement.className = "status show is-success";
    } else if (type === "normal" && message) {
      this.statusElement.className = "status show";
    } else {
      this.statusElement.className = "status";
    }
  }

  /**
   * Clear status feedback.
   */
  clearStatus() {
    this.setStatus("", "normal");
  }

  /**
   * Get active CSRF token.
   * @returns {string}
   */
  getCsrfToken() {
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    const csrfInput = this.form?.querySelector('input[name="_token"]');

    return csrfMeta?.getAttribute("content") || csrfInput?.value || "";
  }

  /**
   * Handle login form submit.
   * @param {Event} event
   */
  async handleSubmit(event) {
    event.preventDefault();
    this.clearStatus();

    if (!this.validateForm()) {
      return;
    }

    this.setLoading(true, "Signing in…");

    const username = this.usernameInput?.value.trim() || "";
    const password = this.passwordInput?.value || "";
    const remember = this.rememberCheckbox ? this.rememberCheckbox.checked : false;

    const loginEndpoint =
      this.form?.getAttribute("action") || "/api/v1/auth/login";
    const redirectUrl =
      this.form?.dataset?.redirect || "/dashboard";

    try {
      const http = new RequestHandler();
      const data = await http.post(loginEndpoint, {
        username,
        password,
        remember,
      });

      if (data?.requires_permissions) {
        const targetUrl = data.redirect_url || "/access-restricted";
        window.location.href = targetUrl;
        return;
      }

      if (data?.success !== false) {
        this.setStatus(data?.message || "Sign in successful. Redirecting…", "success");
        if (this.submitLabel) {
          this.submitLabel.textContent = "Redirecting…";
        }

        const targetUrl = data?.data?.redirect_url || data?.redirect_url || redirectUrl;

        setTimeout(() => {
          window.location.href = targetUrl;
        }, 600);
        return;
      }

      // Handle failed credentials or validation errors
      const errorMsg =
        data?.message ||
        (data?.errors ? Object.values(data.errors).flat().join(" ") : null) ||
        "Invalid username or password. Please check your credentials.";

      this.setStatus(errorMsg, "error");
    } catch (err) {
      console.warn("[LoginManager] Authentication error:", err);

      // Check if access is restricted due to 0 module permissions -> Navigate immediately to dedicated restricted page
      if (err.data?.requires_permissions) {
        const targetUrl = err.data.redirect_url || "/access-restricted";
        window.location.href = targetUrl;
        return;
      }

      const errorMsg =
        (err.data && err.data.message) ||
        (err.data && err.data.errors ? Object.values(err.data.errors).flat().join(" ") : null) ||
        err.message ||
        "Unable to connect to sign-in service. Please try again.";

      this.setStatus(errorMsg, "error");
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Display the Permission Restricted card when the authenticated user has 0 module permissions.
   * @param {Object} [user={}]
   */
  showPermissionCard(user = {}) {
    if (this.loginFormSection) this.loginFormSection.style.display = "none";
    if (this.loginPermissionCard) this.loginPermissionCard.style.display = "block";

    if (this.permUserId) this.permUserId.value = user.id || "";
    if (this.permUserName) this.permUserName.textContent = user.name || user.username || "Staff Member";
    if (this.permUserAvatar) this.permUserAvatar.textContent = user.initials || "U";
    if (this.permUserTag) this.permUserTag.textContent = `@${user.username || "user"}`;
    if (this.permUserStatus) this.permUserStatus.textContent = user.status || "Active";

    // Reset button states
    if (this.btnRequestAccess) {
      this.btnRequestAccess.disabled = false;
      this.btnRequestAccess.classList.remove("sent-success");
    }
    if (this.btnRequestLabel) this.btnRequestLabel.textContent = "Request Permissions from Admin";
    if (this.btnRequestIcon) {
      this.btnRequestIcon.style.display = "inline-block";
      this.btnRequestIcon.className = "fa-solid fa-paper-plane";
    }
    if (this.permSpin) this.permSpin.style.display = "none";
    if (this.permStatus) {
      this.permStatus.className = "status";
      this.permStatus.textContent = "";
    }
  }

  /**
   * Hide Permission Restricted card and return to standard login inputs.
   */
  hidePermissionCard() {
    if (this.loginPermissionCard) this.loginPermissionCard.style.display = "none";
    if (this.loginFormSection) this.loginFormSection.style.display = "block";
    if (this.passwordInput) {
      this.passwordInput.value = "";
      this.passwordInput.focus();
    }
    this.clearStatus();
  }

  /**
   * Submit one-click permission request to all Administrators.
   */
  async handleRequestAccess() {
    const userId = this.permUserId?.value;
    if (!userId) return;

    if (this.btnRequestAccess) this.btnRequestAccess.disabled = true;
    if (this.permSpin) this.permSpin.style.display = "inline-block";
    if (this.btnRequestIcon) this.btnRequestIcon.style.display = "none";
    if (this.btnRequestLabel) this.btnRequestLabel.textContent = "Sending Request…";

    try {
      const http = new RequestHandler();
      const response = await http.post("/api/v1/permissions/request", {
        user_id: parseInt(userId, 10),
      });

      if (this.btnRequestAccess) {
        this.btnRequestAccess.classList.add("sent-success");
        this.btnRequestAccess.disabled = true;
      }
      if (this.permSpin) this.permSpin.style.display = "none";
      if (this.btnRequestIcon) {
        this.btnRequestIcon.style.display = "inline-block";
        this.btnRequestIcon.className = "fa-solid fa-circle-check";
      }
      if (this.btnRequestLabel) this.btnRequestLabel.textContent = "Request Sent to Administrators!";

      if (this.permStatus) {
        this.permStatus.className = "status show is-success";
        this.permStatus.textContent = response?.message || "Notification delivered to all Administrators. You will be able to log in once permissions are granted.";
      }
    } catch (err) {
      console.error("[LoginManager] Permission request error:", err);
      if (this.btnRequestAccess) this.btnRequestAccess.disabled = false;
      if (this.permSpin) this.permSpin.style.display = "none";
      if (this.btnRequestIcon) this.btnRequestIcon.style.display = "inline-block";
      if (this.btnRequestLabel) this.btnRequestLabel.textContent = "Retry Requesting Permissions";

      if (this.permStatus) {
        this.permStatus.className = "status show is-error";
        this.permStatus.textContent = err.data?.message || err.message || "Failed to submit permission request. Please contact your administrator directly.";
      }
    }
  }
}

// Global auto-initialization on DOM ready or Turbo load
if (typeof document !== "undefined") {
  const bootLogin = () => {
    const formEl = document.getElementById("form");
    if (formEl && !formEl.dataset.loginBooted) {
      formEl.dataset.loginBooted = "1";
      window.loginManager = new LoginManager();
    }
  };

  bootLogin();
  document.addEventListener("DOMContentLoaded", bootLogin);
  document.addEventListener("turbo:load", bootLogin);
}
