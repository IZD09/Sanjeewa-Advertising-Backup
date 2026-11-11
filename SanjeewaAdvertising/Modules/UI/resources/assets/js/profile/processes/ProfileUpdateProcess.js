/**
 * SanjeewaAdvertising - Profile Update Process
 *
 * Dedicated process handling personal details updates:
 * - First Name, Last Name, Mobile Phone
 * - Form validation
 * - Button loading indicator & feedback
 * - Toast notification
 */

"use strict";

import { ValidatBuilder } from "../../core/ValidatBuilder.js";

export class ProfileUpdateProcess {
  /**
   * @param {Object} context
   * @param {Object} context.dataLoader
   * @param {Function} [context.onProfileUpdated]
   * @param {Function} [context.showToast]
   */
  constructor(context = {}) {
    this.dataLoader = context.dataLoader;
    this.onProfileUpdated = context.onProfileUpdated || null;
    this.showToast = context.showToast || this.defaultShowToast.bind(this);

    // Form and button
    this.form = document.getElementById("formUpdateUserProfile");
    this.btnSave = document.getElementById("btnSaveUserProfile");

    // Inputs
    this.inputFirstName = document.getElementById("upFirstName");
    this.inputLastName = document.getElementById("upLastName");
    this.inputMobile = document.getElementById("upMobile");

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
   * Validate personal details using ValidatBuilder.
   *
   * @param {string} firstName
   * @param {string} lastName
   * @param {string} mobile
   * @returns {boolean}
   */
  validate(firstName, lastName, mobile) {
    const validator = new ValidatBuilder();
    validator
      .setCollectAllErrors(false)
      .addTextValidator(firstName, "first name", 50, 1)
      .addTextValidator(lastName, "last name", 50, 1)
      .addMobileValidator(mobile.replace(/[\s\-]/g, ""), "mobile number");

    const result = validator.validate();
    if (result.getStatus()) {
      const errorMsg = result.getMessage();
      this.showToast(errorMsg, true);
      return false;
    }

    return true;
  }

  /**
   * Handle personal details submission.
   */
  async handleSubmit() {
    const firstName = this.inputFirstName ? this.inputFirstName.value.trim() : "";
    const lastName = this.inputLastName ? this.inputLastName.value.trim() : "";
    const mobile = this.inputMobile ? this.inputMobile.value.trim() : "";

    if (!this.validate(firstName, lastName, mobile)) {
      return;
    }

    const payload = {
      first_name: firstName,
      last_name: lastName,
      mobile: mobile,
    };

    this.setButtonLoading(true);

    try {
      const response = await this.dataLoader.updateProfile(payload);
      const data = response?.data || response;

      this.showToast(response?.message || "Profile details updated successfully!", false);

      if (this.onProfileUpdated) {
        this.onProfileUpdated(data);
      }
    } catch (err) {
      const errorMsg = this.extractErrorMessage(err);
      this.showToast(errorMsg, true);
    } finally {
      this.setButtonLoading(false);
    }
  }

  setButtonLoading(isLoading) {
    if (!this.btnSave) return;
    this.btnSave.disabled = isLoading;
    if (isLoading) {
      this.btnSave.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Updating...`;
    } else {
      this.btnSave.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Update Profile`;
    }
  }

  extractErrorMessage(err) {
    if (err?.response?.data?.errors) {
      const errs = err.response.data.errors;
      const firstKey = Object.keys(errs)[0];
      return errs[firstKey][0];
    }
    return err?.response?.data?.message || err?.message || "Failed to update profile details.";
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

export default ProfileUpdateProcess;
