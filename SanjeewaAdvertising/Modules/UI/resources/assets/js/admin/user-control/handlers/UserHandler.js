/**
 * User Table Handler
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

import { UserRowBuilder } from "../builders/UserRowBuilder.js";

export class UserHandler {
  constructor(options = {}) {
    this.dataLoader = options.dataLoader;
    this.onSelectUserForPerms = options.onSelectUserForPerms || (() => {});
    this.onDataChanged = options.onDataChanged || (() => {});

    this.tableBody = document.getElementById("usersTableBody");
    this.searchInput = document.getElementById("searchUsers");
    this.statusFilter = document.getElementById("filterUserStatus");

    this.bindEvents();
  }

  bindEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener("input", () => this.render());
    }
    if (this.statusFilter) {
      this.statusFilter.addEventListener("change", () => this.render());
    }

    if (this.tableBody) {
      this.tableBody.addEventListener("click", (e) => {
        // Toggle user status
        const toggleBtn = e.target.closest(".btn-toggle-user-status");
        if (toggleBtn) {
          const userId = toggleBtn.getAttribute("data-id");
          this.dataLoader.toggleUserStatus(userId);
          this.render();
          this.onDataChanged();
          return;
        }

        // Jump to set permissions
        const permBtn = e.target.closest(".btn-set-perm");
        if (permBtn) {
          const userId = permBtn.getAttribute("data-id");
          this.onSelectUserForPerms(userId);
          return;
        }
      });
    }
  }

  render() {
    if (!this.tableBody) return;

    let users = [...this.dataLoader.users];
    const query = this.searchInput ? this.searchInput.value.trim().toLowerCase() : "";
    const statusVal = this.statusFilter ? this.statusFilter.value : "ALL";

    if (query) {
      users = users.filter(u => 
        u.first_name.toLowerCase().includes(query) ||
        u.last_name.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query) ||
        u.mobile.includes(query)
      );
    }

    if (statusVal && statusVal !== "ALL") {
      users = users.filter(u => u.status === statusVal);
    }

    if (users.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: #94a3b8; padding: 32px;">
            <i class="fa-solid fa-users-slash" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
            No users match your criteria.
          </td>
        </tr>
      `;
      return;
    }

    this.tableBody.innerHTML = users.map(u => UserRowBuilder.build(u)).join("");
  }
}

