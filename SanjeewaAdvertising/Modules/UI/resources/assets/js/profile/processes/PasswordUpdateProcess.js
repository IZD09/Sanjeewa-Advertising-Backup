/**
 * SanjeewaAdvertising - Password Update Process
 *
 * Dedicated process handling credential & security updates:
 * - Current password validation
 * - New password strength (minimum 6 characters)
 * - Password confirmation match check
 * - Button loading indicator & feedback
 * - Inline error alerts & toast feedback
 */

"use strict";

import { ValidatBuilder } from "../../core/ValidatBuilder.js";

export class PasswordUpdateProcess {
  /**
   * @param {Object} context
   * @param {Object} context.dataLoader
   * @param {Function} [context.onPasswordUpdated]
   * @param {Function} [context.showToast]
   */
  constructor(context = {}) {
    this.dataLoader = context.dataLoader;
    this.onPasswordUpdated = context.onPasswordUpdated || null;
    this.showToast = context.showToast || this.defaultShowToast.bind(this);

    // Form and button
    this.form = document.getElementById("formUpdatePassword");
    this.btnSave = document.getElementById("btnSaveUserPassword");

    // Inputs
    this.inputCurrentPass = document.getElementById("upCurrentPassword");
    this.inputNewPass = document.getElementById("upNewPassword");
    this.inputConfirmPass = document.getElementById("upConfirmPassword");
    this.passwordErrorEl = document.getElementById("upPasswordError");

    this.bindEvents();
  }

  bindEvents() {
    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }
  }

  /**
   * Validate password inputs using ValidatBuilder.
   *
   * @returns {boolean}
   */
  validate() {
    this.clearPasswordError();

    const currentPass = this.inputCurrentPass ? this.inputCurrentPass.value : "";
    const newPass = this.inputNewPass ? this.inputNewPass.value : "";
    const confirmPass = this.inputConfirmPass ? this.inputConfirmPass.value : "";

    const validator = new ValidatBuilder();
    validator
      .setCollectAllErrors(false)
      .addTextValidator(currentPass, "current password", 100, 0)
      .addPasswordValidator(newPass, confirmPass, 100, 5);

    const result = validator.validate();
    if (result.getStatus()) {
      const errorMsg = result.getMessage();
      this.showPasswordError(errorMsg);
      this.showToast(errorMsg, true);
      return false;
    }

    return true;
  }

  /**
   * Handle password form submission.
   */
  async handleSubmit() {
    if (!this.validate()) {
      return;
    }

    const currentPass = this.inputCurrentPass ? this.inputCurrentPass.value : "";
    const newPass = this.inputNewPass ? this.inputNewPass.value : "";
    const confirmPass = this.inputConfirmPass ? this.inputConfirmPass.value : "";

    const payload = {
      current_password: currentPass,
      password: newPass,
      password_confirmation: confirmPass,
    };

    this.setButtonLoading(true);

    try {
      const response = await this.dataLoader.updatePassword(payload);

      this.showToast(response?.message || "Password updated successfully!", false);
      this.clearPasswordInputs();
      this.clearPasswordError();

      if (this.onPasswordUpdated) {
        this.onPasswordUpdated(response);
      }
    } catch (err) {
      const errorMsg = this.extractErrorMessage(err);
      this.showPasswordError(errorMsg);
      this.showToast(errorMsg, true);
    } finally {
      this.setButtonLoading(false);
    }
  }

  clearPasswordInputs() {
    if (this.inputCurrentPass) this.inputCurrentPass.value = "";
    if (this.inputNewPass) this.inputNewPass.value = "";
    if (this.inputConfirmPass) this.inputConfirmPass.value = "";
  }

  showPasswordError(msg) {
    if (this.passwordErrorEl) {
      this.passwordErrorEl.textContent = msg;
      this.passwordErrorEl.style.display = "block";
    }
  }

  clearPasswordError() {
    if (this.passwordErrorEl) {
      this.passwordErrorEl.textContent = "";
      this.passwordErrorEl.style.display = "none";
    }
  }

  setButtonLoading(isLoading) {
    if (!this.btnSave) return;
    this.btnSave.disabled = isLoading;
    if (isLoading) {
      this.btnSave.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Updating Password...`;
    } else {
      this.btnSave.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Update Password`;
    }
  }

  extractErrorMessage(err) {
    if (err?.response?.data?.errors) {
      const errs = err.response.data.errors;
      const firstKey = Object.keys(errs)[0];
      return errs[firstKey][0];
    }
    return err?.response?.data?.message || err?.message || "Failed to update password.";
  }

  defaultShowToast(message, isError = false) {
    const toast = document.getElementById("upToast");
    const toastMsg = document.getElementById("upToastMsg");
    if (!toast) return;

    if (toastMsg) toastMsg.textContent = message;
    toast.style.background = isError ? "#dc2626" : "#1e293b";
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3500);
  }
}

export default PasswordUpdateProcess;
