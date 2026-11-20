/**
 * Admin Profile & Security Update Process
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

export class UpdateAdminProfileProcess {
  /**
   * @param {Object} [options={}]
   * @param {Object} options.dataLoader
   * @param {Function} [options.onProfileUpdated]
   * @param {Function} [options.onShowToast]
   */
  constructor(options = {}) {
    this.dataLoader = options.dataLoader;
    this.onProfileUpdated = options.onProfileUpdated || (() => {});
    this.onShowToast = options.onShowToast || (() => {});

    this.form = document.getElementById("formUpdateProfile");
    this.btnSave = document.getElementById("btnSaveProfile");

    this.inputFirstName = document.getElementById("profFirstName");
    this.inputLastName = document.getElementById("profLastName");
    this.inputEmail = document.getElementById("profEmail");
    this.inputMobile = document.getElementById("profMobile");
    this.inputCurrentPass = document.getElementById("profCurrentPassword");
    this.inputNewPass = document.getElementById("profNewPassword");
    this.inputConfirmPass = document.getElementById("profConfirmPassword");

    this.bindEvents();
  }

  bindEvents() {
    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.execute();
      });
    }
  }

  async execute() {
    const verifiedAdmin = this.dataLoader?.getVerifiedAdmin();
    if (!verifiedAdmin) {
      this.onShowToast("Please verify credentials first.", "danger");
      return;
    }

    const firstName = this.inputFirstName?.value.trim();
    const lastName = this.inputLastName?.value.trim();
    const email = this.inputEmail?.value.trim();
    const mobile = this.inputMobile?.value.trim();

    const currentPass = this.inputCurrentPass?.value;
    const newPass = this.inputNewPass?.value;
    const confirmPass = this.inputConfirmPass?.value;

    if (!firstName || !lastName || !email || !mobile) {
      alert("Please fill in all profile fields.");
      return;
    }

    if (newPass) {
      if (!currentPass) {
        alert("Please enter your current password to set a new password.");
        return;
      }
      if (newPass.length < 6) {
        alert("New password must be at least 6 characters long.");
        return;
      }
      if (newPass !== confirmPass) {
        alert("New password and confirm password do not match.");
        return;
      }
    }

    const originalBtnHtml = this.btnSave ? this.btnSave.innerHTML : "";
    if (this.btnSave) {
      this.btnSave.disabled = true;
      this.btnSave.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }

    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        email,
        mobile,
      };

      if (newPass) {
        payload.current_password = currentPass;
        payload.password = newPass;
        payload.password_confirmation = confirmPass;
      }

      const response = await this.dataLoader.updateProfile(payload);

      if (response && response.success && response.data) {
        const merged = this.dataLoader.mergeVerifiedAdmin(response.data);

        if (this.inputCurrentPass) this.inputCurrentPass.value = "";
        if (this.inputNewPass) this.inputNewPass.value = "";
        if (this.inputConfirmPass) this.inputConfirmPass.value = "";

        this.onProfileUpdated(merged);
        this.onShowToast("Profile details updated successfully!", "success");
      } else {
        alert(response?.message || "Failed to update profile.");
      }
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Failed to update profile details.";
      alert(msg);
    } finally {
      if (this.btnSave) {
        this.btnSave.disabled = false;
        this.btnSave.innerHTML = originalBtnHtml;
      }
    }
  }
}

export default UpdateAdminProfileProcess;
