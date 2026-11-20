/**
 * Add Staff Member Modal Handler
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Aligned with HR Module Staff Schema (default Active employment status)
 */

"use strict";

import { AddStaffProcess } from "../processes/AddStaffProcess.js";

export class AddStaffModal {
  /**
   * @param {Object} [options={}]
   * @param {Object} [options.dataLoader]
   * @param {Function} [options.onStaffAdded]
   */
  constructor(options = {}) {
    this.dataLoader = options.dataLoader || null;
    this.onStaffAdded = options.onStaffAdded || (() => {});

    this.overlay = document.getElementById("modalAddStaff");
    this.form = document.getElementById("formAddStaff");
    this.errorEl = document.getElementById("addStaffError");
    this.closeBtns = this.overlay ? this.overlay.querySelectorAll(".hr-modal-close-trigger") : [];
    this.submitBtn = this.form ? this.form.querySelector('button[type="submit"]') : null;

    this.process = new AddStaffProcess({
      dataLoader: this.dataLoader,
      onError: (errMsg) => {
        this.showError(errMsg);
      },
    });

    this.bindEvents();
  }

  bindEvents() {
    this.closeBtns.forEach((btn) => {
      btn.addEventListener("click", () => this.close());
    });

    if (this.overlay) {
      this.overlay.addEventListener("click", (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
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
    this.clearError();
    this.overlay.classList.add("open");
    const firstInput = this.overlay.querySelector("input");
    if (firstInput) firstInput.focus();
  }

  close() {
    if (!this.overlay) return;
    this.overlay.classList.remove("open");
    this.clearError();
  }

  showError(message) {
    if (this.errorEl) {
      this.errorEl.textContent = message;
      this.errorEl.style.display = "block";
    } else {
      alert(message);
    }
  }

  clearError() {
    if (this.errorEl) {
      this.errorEl.textContent = "";
      this.errorEl.style.display = "none";
    }
  }

  async submit() {
    this.clearError();

    const firstName = document.getElementById("hrStaffFirstName")?.value.trim() || "";
    const lastName = document.getElementById("hrStaffLastName")?.value.trim() || "";
    const nic = document.getElementById("hrStaffNic")?.value.trim() || "";
    const mobile = document.getElementById("hrStaffMobile")?.value.trim() || "";

    const originalBtnHtml = this.submitBtn
      ? this.submitBtn.innerHTML
      : '<i class="fa-solid fa-check"></i> Save Staff Member';

    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving Staff...';
    }

    try {
      const result = await this.process.execute({
        first_name: firstName,
        last_name: lastName,
        nic,
        mobile,
      });

      if (result.success && result.data) {
        this.close();
        if (this.form) this.form.reset();
        this.onStaffAdded(result.data, result.message);
      }
    } finally {
      if (this.submitBtn) {
        this.submitBtn.disabled = false;
        this.submitBtn.innerHTML = originalBtnHtml;
      }
    }
  }
}

export default AddStaffModal;
