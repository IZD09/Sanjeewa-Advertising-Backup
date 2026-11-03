/**
 * Add User Modal Handler
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Aligned with User Module Model Schema
 */

"use strict";

export class AddUserModal {
  constructor(options = {}) {
    this.dataLoader = options.dataLoader;
    this.onUserAdded = options.onUserAdded || (() => {});

    this.overlay = document.getElementById("modalAddUser");
    this.form = document.getElementById("formAddUser");
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
    const firstName = document.getElementById("userFirstName")?.value.trim();
    const lastName = document.getElementById("userLastName")?.value.trim();
    const username = document.getElementById("userUsername")?.value.trim();
    const mobile = document.getElementById("userMobile")?.value.trim();
    const password = document.getElementById("userPassword")?.value;
    const confirmPassword = document.getElementById("userPasswordConfirm")?.value;
    const statusSelect = document.getElementById("userStatusSelect");
    const userStatusesId = statusSelect ? parseInt(statusSelect.value, 10) : 1;

    if (!firstName || !lastName || !username || !mobile || !password) {
      alert("Please fill in all required fields marked with *");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const newUser = this.dataLoader.addUser({
      first_name: firstName,
      last_name: lastName,
      username: username,
      mobile: mobile,
      password: password,
      user_statuses_id: userStatusesId
    });

    this.close();
    this.onUserAdded(newUser);
  }
}
