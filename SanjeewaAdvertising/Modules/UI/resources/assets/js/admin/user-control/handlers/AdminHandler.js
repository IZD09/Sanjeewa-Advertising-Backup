/**
 * Admin Table Handler
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

import { AdminRowBuilder } from "../builders/AdminRowBuilder.js";

export class AdminHandler {
  constructor(options = {}) {
    this.dataLoader = options.dataLoader;
    this.onDataChanged = options.onDataChanged || (() => {});

    this.tableBody = document.getElementById("adminsTableBody");
    this.searchInput = document.getElementById("searchAdmins");
    this.typeFilter = document.getElementById("filterAdminType");

    this.bindEvents();
  }

  bindEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener("input", () => this.render());
    }
    if (this.typeFilter) {
      this.typeFilter.addEventListener("change", () => this.render());
    }

    if (this.tableBody) {
      this.tableBody.addEventListener("click", (e) => {
        const toggleBtn = e.target.closest(".btn-toggle-admin-status");
        if (toggleBtn) {
          const adminId = toggleBtn.getAttribute("data-id");
          this.dataLoader.toggleAdminStatus(adminId);
          this.render();
          this.onDataChanged();
          return;
        }
      });
    }
  }

  render() {
    if (!this.tableBody) return;

    let admins = [...this.dataLoader.admins];
    const query = this.searchInput ? this.searchInput.value.trim().toLowerCase() : "";
    const typeVal = this.typeFilter ? this.typeFilter.value : "ALL";

    if (query) {
      admins = admins.filter(a => 
        a.first_name.toLowerCase().includes(query) ||
        a.last_name.toLowerCase().includes(query) ||
        a.username.toLowerCase().includes(query) ||
        a.email.toLowerCase().includes(query) ||
        a.mobile.includes(query)
      );
    }

    if (typeVal && typeVal !== "ALL") {
      admins = admins.filter(a => a.type === typeVal);
    }

    if (admins.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: #94a3b8; padding: 32px;">
            <i class="fa-solid fa-user-shield" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
            No administrators match your criteria.
          </td>
        </tr>
      `;
      return;
    }

    this.tableBody.innerHTML = admins.map(a => AdminRowBuilder.build(a)).join("");
  }
}

