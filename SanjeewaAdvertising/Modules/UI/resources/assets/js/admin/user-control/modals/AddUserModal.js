/**
 * Add User Modal Handler
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Aligned with User Module Model Schema
 */

"use strict";

import { AddUserProcess } from "../processes/AddUserProcess.js";

export class AddUserModal {
  constructor(options = {}) {
    this.dataLoader = options.dataLoader;
    this.onUserAdded = options.onUserAdded || (() => {});

    this.overlay = document.getElementById("modalAddUser");
    this.form = document.getElementById("formAddUser");
    this.closeBtns = this.overlay ? this.overlay.querySelectorAll(".modal-close-trigger") : [];
    this.submitBtn = this.form ? this.form.querySelector('button[type="submit"]') : null;

    this.process = new AddUserProcess({
      dataLoader: this.dataLoader,
      onError: (errMsg) => {
        alert(errMsg);
      }
    });

    this.bindEvents();
  }

  bindEvents() {
    this.closeBtns.forEach(btn => {
      btn.addEventListener("click", () => this.close());
    });

    if (this.overlay) {
      this.overlay.addEventListener("click", (e) => {
        if (e.target === this.overlay) this.close();
      });
    }

    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.submit();
      });
    }
  }

  open() {
    if (!this.overlay) return;
    if (this.form) this.form.reset();
    this.overlay.classList.add("active");
    const firstInput = this.overlay.querySelector("input");
    if (firstInput) firstInput.focus();
  }

  close() {
    if (!this.overlay) return;
    this.overlay.classList.remove("active");
  }

  async submit() {
    const firstName = document.getElementById("userFirstName")?.value.trim();
    const lastName = document.getElementById("userLastName")?.value.trim();
    const username = document.getElementById("userUsername")?.value.trim();
    const mobile = document.getElementById("userMobile")?.value.trim();
    const password = document.getElementById("userPassword")?.value;
    const confirmPassword = document.getElementById("userPasswordConfirm")?.value;
    const statusSelect = document.getElementById("userStatusSelect");
    const userStatusesId = statusSelect ? parseInt(statusSelect.value, 10) : 1;

    // Set button loading state
    const originalBtnHtml = this.submitBtn ? this.submitBtn.innerHTML : '<i class="fa-solid fa-check"></i> Create User';
    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating User...';
    }

    try {
      const result = await this.process.execute({
        first_name: firstName,
        last_name: lastName,
        username: username,
        mobile: mobile,
        password: password,
        password_confirmation: confirmPassword,
        user_statuses_id: userStatusesId
      });

      if (result.success && result.data) {
        this.close();
        if (this.form) this.form.reset();
        this.onUserAdded(result.data);
      }
    } finally {
      if (this.submitBtn) {
        this.submitBtn.disabled = false;
        this.submitBtn.innerHTML = originalBtnHtml;
      }
    }
  }
}
