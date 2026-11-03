/**
 * Add Administrator Modal Handler
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

export class AddAdminModal {
  constructor(options = {}) {
    this.dataLoader = options.dataLoader;
    this.onAdminAdded = options.onAdminAdded || (() => {});

    this.overlay = document.getElementById("modalAddAdmin");
    this.form = document.getElementById("formAddAdmin");
    this.closeBtns = this.overlay ? this.overlay.querySelectorAll(".modal-close-trigger") : [];

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

  submit() {
    const firstName = document.getElementById("adminFirstName")?.value.trim();
    const lastName = document.getElementById("adminLastName")?.value.trim();
    const username = document.getElementById("adminUsername")?.value.trim();
    const email = document.getElementById("adminEmail")?.value.trim();
    const mobile = document.getElementById("adminMobile")?.value.trim();
    const password = document.getElementById("adminPassword")?.value;
    const confirmPassword = document.getElementById("adminPasswordConfirm")?.value;
    const type = document.getElementById("adminTypeSelect")?.value || "Administrator";
    const status = document.getElementById("adminStatusSelect")?.value || "Active";

    if (!firstName || !lastName || !username || !email || !mobile || !password) {
      alert("Please fill in all required fields marked with *");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const newAdmin = this.dataLoader.addAdmin({
      first_name: firstName,
      last_name: lastName,
      username: username,
      email: email,
      mobile: mobile,
      type: type,
      status: status
    });

    this.close();
    this.onAdminAdded(newAdmin);
  }
}

