/**
 * Permission Matrix Handler
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Handles:
 *  - Granular module privilege toggles & role presets
 *  - Search users by Name, Username or ID (#1, Kamal, etc.)
 *  - Real-time dropdown filtering & floating autocomplete
 *  - Saving module action permissions
 */

"use strict";

import { PermissionMatrixBuilder } from "../builders/PermissionMatrixBuilder.js";

export class PermissionHandler {
  constructor(options = {}) {
    this.dataLoader = options.dataLoader;
    this.onPermissionsSaved = options.onPermissionsSaved || (() => {});

    this.userSelect = document.getElementById("permSelectUser");
    this.searchInput = document.getElementById("permSearchUser");
    this.searchClearBtn = document.getElementById("btnPermSearchClear");
    this.searchResults = document.getElementById("permSearchResults");
    this.activeUserBadge = document.getElementById("permActiveUserBadge");

    this.tableBody = document.getElementById("permissionsTableBody");
    this.saveBtn = document.getElementById("btnSavePermissions");
    this.btnSelectAll = document.getElementById("btnPermSelectAll");
    this.btnClearAll = document.getElementById("btnPermClearAll");
    this.presetSelect = document.getElementById("permPresetRole");

    this.currentUserId = null;
    this.currentPermissions = {};
    this.filteredUsers = [];

    this.bindEvents();
  }

  bindEvents() {
    // Dropdown change
    if (this.userSelect) {
      this.userSelect.addEventListener("change", (e) => {
        this.loadUserPermissions(e.target.value);
      });
    }

    // Search input (by Name or ID)
    if (this.searchInput) {
      this.searchInput.addEventListener("input", () => {
        this.handleSearch();
      });

      this.searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.selectFirstSearchResult();
        } else if (e.key === "Escape") {
          this.closeSearchResults();
        }
      });

      this.searchInput.addEventListener("focus", () => {
        if (this.searchInput.value.trim()) {
          this.handleSearch();
        }
      });
    }

    // Clear search button
    if (this.searchClearBtn) {
      this.searchClearBtn.addEventListener("click", () => {
        this.clearSearch();
      });
    }

    // Click on autocomplete item
    if (this.searchResults) {
      this.searchResults.addEventListener("click", (e) => {
        const item = e.target.closest(".uc-perm-search-item");
        if (item) {
          const userId = Number(item.getAttribute("data-id"));
          const user = this.dataLoader.users.find(u => u.id === userId);
          if (user && this.searchInput) {
            this.searchInput.value = `${user.first_name} ${user.last_name}`;
            if (this.searchClearBtn) this.searchClearBtn.style.display = "flex";
          }
          this.closeSearchResults();
          this.loadUserPermissions(userId);
        }
      });
    }

    // Close autocomplete on click outside
    document.addEventListener("click", (e) => {
      if (this.searchResults && !e.target.closest(".uc-perm-search-box")) {
        this.closeSearchResults();
      }
    });

    // Permission matrix switches
    if (this.tableBody) {
      this.tableBody.addEventListener("click", (e) => {
        const toggleBtn = e.target.closest(".perm-toggle");
        if (toggleBtn) {
          const modId = toggleBtn.getAttribute("data-module");
          const actKey = toggleBtn.getAttribute("data-action");
          const isChecked = toggleBtn.classList.contains("checked");

          if (!this.currentPermissions[modId]) {
            this.currentPermissions[modId] = {};
          }
          this.currentPermissions[modId][actKey] = !isChecked;

          toggleBtn.classList.toggle("checked");
          toggleBtn.setAttribute("aria-checked", String(!isChecked));
        }
      });
    }

    // Save button
    if (this.saveBtn) {
      this.saveBtn.addEventListener("click", () => {
        this.save();
      });
    }

    // Bulk buttons
    if (this.btnSelectAll) {
      this.btnSelectAll.addEventListener("click", () => {
        this.toggleAll(true);
      });
    }

    if (this.btnClearAll) {
      this.btnClearAll.addEventListener("click", () => {
        this.toggleAll(false);
      });
    }

    // Role Presets
    if (this.presetSelect) {
      this.presetSelect.addEventListener("change", (e) => {
        this.applyPreset(e.target.value);
      });
    }
  }

  handleSearch() {
    if (!this.searchInput) return;
    const raw = this.searchInput.value.trim();
    const query = raw.toLowerCase().replace(/^#/, "");

    if (this.searchClearBtn) {
      this.searchClearBtn.style.display = raw ? "flex" : "none";
    }

    if (!query) {
      this.populateUserSelect();
      this.closeSearchResults();
      return;
    }

    // Filter users by ID, First Name, Last Name, Full Name, Username or Role
    this.filteredUsers = this.dataLoader.users.filter(u => {
      const matchId = String(u.id) === query || String(u.id).startsWith(query) || `#${u.id}`.startsWith(raw.toLowerCase());
      const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
      const matchName = fullName.includes(query) || u.first_name.toLowerCase().includes(query) || u.last_name.toLowerCase().includes(query);
      const matchUsername = u.username.toLowerCase().includes(query);
      const matchRole = (u.role || "").toLowerCase().includes(query);

      return matchId || matchName || matchUsername || matchRole;
    });

    // Update Select Dropdown with matches
    this.populateUserSelect(this.filteredUsers);

    // Render Floating Autocomplete Dropdown
    this.renderSearchResults(this.filteredUsers, query);
  }

  renderSearchResults(matches, query) {
    if (!this.searchResults) return;

    if (matches.length === 0) {
      this.searchResults.innerHTML = `
        <div style="padding: 14px; text-align: center; color: #94a3b8; font-size: 12.5px;">
          <i class="fa-solid fa-user-xmark" style="margin-right: 6px;"></i>
          No user found matching "<strong>${query}</strong>"
        </div>
      `;
      this.searchResults.style.display = "block";
      return;
    }

    this.searchResults.innerHTML = matches.map(u => `
      <div class="uc-perm-search-item ${u.id === this.currentUserId ? 'highlighted' : ''}" data-id="${u.id}">
        <span class="uc-perm-item-id">ID: #${u.id}</span>
        <div class="uc-perm-item-name">
          <span>${u.first_name} ${u.last_name}</span>
          <small>@${u.username}</small>
        </div>
        <span class="uc-perm-item-role">${u.role || 'Staff'}</span>
      </div>
    `).join("");

    this.searchResults.style.display = "block";
  }

  selectFirstSearchResult() {
    if (this.filteredUsers && this.filteredUsers.length > 0) {
      const first = this.filteredUsers[0];
      if (this.searchInput) {
        this.searchInput.value = `${first.first_name} ${first.last_name}`;
      }
      this.closeSearchResults();
      this.loadUserPermissions(first.id);
    }
  }

  closeSearchResults() {
    if (this.searchResults) {
      this.searchResults.style.display = "none";
    }
  }

  clearSearch() {
    if (this.searchInput) {
      this.searchInput.value = "";
    }
    if (this.searchClearBtn) {
      this.searchClearBtn.style.display = "none";
    }
    this.closeSearchResults();
    this.populateUserSelect();
    if (this.currentUserId) {
      this.loadUserPermissions(this.currentUserId);
    }
  }

  populateUserSelect(userList = null) {
    if (!this.userSelect) return;
    const users = userList !== null ? userList : this.dataLoader.users;

    if (users.length === 0) {
      this.userSelect.innerHTML = `<option value="">-- No Matching Users --</option>`;
      return;
    }

    this.userSelect.innerHTML = users.map(u => `
      <option value="${u.id}" ${u.id === this.currentUserId ? 'selected' : ''}>
        ID #${u.id} - ${u.first_name} ${u.last_name} (@${u.username})
      </option>
    `).join("");

    // If currently selected user is not in list, auto-select first
    if (!users.some(u => u.id === this.currentUserId)) {
      this.currentUserId = users[0].id;
      this.loadUserPermissions(this.currentUserId);
    }
  }

  loadUserPermissions(userId) {
    this.currentUserId = Number(userId);
    if (this.userSelect && this.userSelect.value !== String(this.currentUserId)) {
      this.userSelect.value = String(this.currentUserId);
    }

    // Update Active User Badge
    const user = this.dataLoader.users.find(u => u.id === this.currentUserId);
    if (user && this.activeUserBadge) {
      this.activeUserBadge.innerHTML = `
        <span class="ant-tag ant-tag-blue" style="font-size: 12.5px; padding: 4px 10px; border-radius: 6px;">
          <i class="fa-solid fa-id-badge"></i> <strong>ID: #${user.id}</strong> — ${user.first_name} ${user.last_name} (@${user.username}) • <em>${user.role || 'Staff'}</em>
        </span>
      `;
    }

    const perms = this.dataLoader.getUserPermissions(this.currentUserId);
    this.currentPermissions = JSON.parse(JSON.stringify(perms));
    this.render();
  }

  render() {
    if (!this.tableBody) return;

    const modules = this.dataLoader.getAvailableModules();
    const actions = this.dataLoader.getAvailableActions();

    this.tableBody.innerHTML = modules.map(m => 
      PermissionMatrixBuilder.buildRow(m, actions, this.currentPermissions)
    ).join("");
  }

  toggleAll(checked) {
    const modules = this.dataLoader.getAvailableModules();
    const actions = this.dataLoader.getAvailableActions();

    modules.forEach(m => {
      this.currentPermissions[m.id] = {};
      actions.forEach(a => {
        this.currentPermissions[m.id][a.key] = checked;
      });
    });

    this.render();
  }

  applyPreset(preset) {
    if (!preset) return;
    this.toggleAll(false);

    switch (preset) {
      case "designer":
        this.currentPermissions["print_jobs"] = { view: true, create: false, edit: false, delete: false, export: false };
        this.currentPermissions["design_mgmt"] = { view: true, create: true, edit: true, delete: false, export: true };
        this.currentPermissions["customers"] = { view: true, create: false, edit: false, delete: false, export: false };
        break;

      case "cashier":
        this.currentPermissions["place_order"] = { view: true, create: true, edit: true, delete: false, export: true };
        this.currentPermissions["customers"] = { view: true, create: true, edit: true, delete: false, export: true };
        this.currentPermissions["quotations_invoices"] = { view: true, create: true, edit: true, delete: false, export: true };
        this.currentPermissions["payments"] = { view: true, create: true, edit: false, delete: false, export: true };
        break;

      case "production":
        this.currentPermissions["dashboard"] = { view: true, create: false, edit: false, delete: false, export: true };
        this.currentPermissions["print_jobs"] = { view: true, create: true, edit: true, delete: false, export: true };
        this.currentPermissions["design_mgmt"] = { view: true, create: true, edit: false, delete: false, export: false };
        this.currentPermissions["inventory"] = { view: true, create: false, edit: false, delete: false, export: false };
        break;

      case "inventory":
        this.currentPermissions["inventory"] = { view: true, create: true, edit: true, delete: false, export: true };
        this.currentPermissions["grn"] = { view: true, create: true, edit: true, delete: false, export: true };
        break;

      case "manager":
        this.toggleAll(true);
        if (this.currentPermissions["user_control"]) {
          this.currentPermissions["user_control"].delete = false;
        }
        break;
    }

    this.render();
    if (this.presetSelect) {
      this.presetSelect.value = "";
    }
  }

  save() {
    if (!this.currentUserId) return;
    this.dataLoader.saveUserPermissions(this.currentUserId, this.currentPermissions);
    this.onPermissionsSaved();
  }
}
