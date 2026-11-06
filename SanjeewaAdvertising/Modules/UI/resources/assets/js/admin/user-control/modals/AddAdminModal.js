/**
 * Add Administrator Modal Handler
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

import { AddAdminProcess } from "../processes/AddAdminProcess.js";

export class AddAdminModal {
  constructor(options = {}) {
    this.dataLoader = options.dataLoader;
    this.onAdminAdded = options.onAdminAdded || (() => {});

    this.overlay = document.getElementById("modalAddAdmin");
    this.form = document.getElementById("formAddAdmin");
    this.closeBtns = this.overlay ? this.overlay.querySelectorAll(".modal-close-trigger") : [];
    this.submitBtn = this.form ? this.form.querySelector('button[type="submit"]') : null;

    this.process = new AddAdminProcess({
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
    const firstName = document.getElementById("adminFirstName")?.value.trim();
    const lastName = document.getElementById("adminLastName")?.value.trim();
    const username = document.getElementById("adminUsername")?.value.trim();
    const email = document.getElementById("adminEmail")?.value.trim();
    const mobile = document.getElementById("adminMobile")?.value.trim();
    const password = document.getElementById("adminPassword")?.value;
    const confirmPassword = document.getElementById("adminPasswordConfirm")?.value;
    const typeVal = document.getElementById("adminTypeSelect")?.value || "2";
    const statusVal = document.getElementById("adminStatusSelect")?.value || "1";

    const originalBtnHtml = this.submitBtn ? this.submitBtn.innerHTML : '<i class="fa-solid fa-shield-check"></i> Provision Admin';
    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Provisioning Admin...';
    }

    try {
      const result = await this.process.execute({
        first_name: firstName,
        last_name: lastName,
        username: username,
        email: email,
        mobile: mobile,
        password: password,
        password_confirmation: confirmPassword,
        admin_types_id: typeVal,
        admin_statuses_id: statusVal
      });

      if (result.success && result.data) {
        this.close();
        if (this.form) this.form.reset();
        this.onAdminAdded(result.data);
      }
    } finally {
      if (this.submitBtn) {
        this.submitBtn.disabled = false;
        this.submitBtn.innerHTML = originalBtnHtml;
      }
    }
  }
}

