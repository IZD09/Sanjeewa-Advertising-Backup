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

import { RequestHandler } from "../../../core/RequestHandler.js";
import { PermissionMatrixBuilder } from "../builders/PermissionMatrixBuilder.js";

export class PermissionHandler {
  constructor(options = {}) {
    this.http = new RequestHandler();
    this.dataLoader = options.dataLoader;
    this.onSavePermissions = options.onSavePermissions || null;
    this.onPermissionsSaved = options.onPermissionsSaved || (() => {});

    this.combobox = document.getElementById("permUserCombobox");
    this.userSelect = document.getElementById("permSelectUser");
    this.searchInput = document.getElementById("permSearchUser");
    this.searchClearBtn = document.getElementById("btnPermSearchClear");
    this.dropdownToggleBtn = document.getElementById("btnPermDropdownToggle");
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
    this.highlightedIndex = -1;
    this.isDropdownOpen = false;
    this.searchAbortController = null;

    this.bindEvents();
  }

  formatUserDisplay(user) {
    if (!user) return "";
    return `ID #${user.id} - ${user.first_name} ${user.last_name} (@${user.username})`;
  }

  bindEvents() {
    // Hidden select/input change fallback
    if (this.userSelect) {
      this.userSelect.addEventListener("change", (e) => {
        this.loadUserPermissions(e.target.value, true);
      });
    }

    // Unified Search + Dropdown input
    if (this.searchInput) {
      this.searchInput.addEventListener("input", () => {
        this.handleSearch();
      });

      this.searchInput.addEventListener("focus", () => {
        this.openDropdownWithAllOrFiltered();
      });

      this.searchInput.addEventListener("click", () => {
        if (!this.isDropdownOpen) {
          this.openDropdownWithAllOrFiltered();
        }
      });

      this.searchInput.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (!this.isDropdownOpen) {
            this.openDropdownWithAllOrFiltered();
          } else {
            this.moveHighlight(1);
          }
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (this.isDropdownOpen) {
            this.moveHighlight(-1);
          }
        } else if (e.key === "Enter") {
          e.preventDefault();
          this.selectHighlightedOrFirstResult();
        } else if (e.key === "Escape") {
          this.closeSearchResults(true);
        }
      });
    }

    // Dropdown chevron toggle button
    if (this.dropdownToggleBtn) {
      this.dropdownToggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.isDropdownOpen) {
          this.closeSearchResults(true);
        } else {
          this.filteredUsers = [...this.dataLoader.users];
          this.renderSearchResults(this.filteredUsers, "");
          if (this.searchInput) {
            this.searchInput.focus();
            this.searchInput.select();
          }
        }
      });
    }

    // Clear search button
    if (this.searchClearBtn) {
      this.searchClearBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.clearSearch();
      });
    }

    // Click on dropdown option item
    if (this.searchResults) {
      this.searchResults.addEventListener("click", (e) => {
        const item = e.target.closest(".uc-perm-search-item");
        if (item) {
          const userId = Number(item.getAttribute("data-id"));
          const user =
            this.filteredUsers.find(u => Number(u.id) === userId) ||
            this.dataLoader.users.find(u => Number(u.id) === userId);
          this.selectUserOption(user || { id: userId });
        }
      });
    }

    // Close dropdown on click outside
    document.addEventListener("click", (e) => {
      if (this.searchResults && !e.target.closest(".uc-perm-search-box")) {
        this.closeSearchResults(true);
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

  openDropdownWithAllOrFiltered() {
    if (!this.searchInput) return;
    const raw = this.searchInput.value.trim();
    const currentUser = this.dataLoader.users.find(u => Number(u.id) === Number(this.currentUserId));
    const isShowingSelectedLabel = currentUser && raw === this.formatUserDisplay(currentUser);

    if (!raw || isShowingSelectedLabel) {
      if (isShowingSelectedLabel) {
        this.searchInput.select();
      }
      this.filteredUsers = [...this.dataLoader.users];
      this.renderSearchResults(this.filteredUsers, "");
    } else {
      this.handleSearch();
    }
  }

  moveHighlight(step) {
    if (!this.filteredUsers || this.filteredUsers.length === 0) return;
    this.highlightedIndex += step;
    if (this.highlightedIndex >= this.filteredUsers.length) {
      this.highlightedIndex = 0;
    } else if (this.highlightedIndex < 0) {
      this.highlightedIndex = this.filteredUsers.length - 1;
    }

    const items = this.searchResults ? this.searchResults.querySelectorAll(".uc-perm-search-item") : [];
    items.forEach((el, idx) => {
      el.classList.toggle("highlighted", idx === this.highlightedIndex);
      if (idx === this.highlightedIndex) {
        el.scrollIntoView({ block: "nearest" });
      }
    });
  }

  selectUserOption(user) {
    if (!user || !user.id) return;
    const userId = Number(user.id);
    const resolvedUser =
      this.dataLoader.users.find(u => Number(u.id) === userId) ||
      this.filteredUsers.find(u => Number(u.id) === userId) ||
      user;

    if (this.searchInput && resolvedUser.first_name) {
      this.searchInput.value = this.formatUserDisplay(resolvedUser);
    }
    if (this.searchClearBtn) {
      this.searchClearBtn.style.display = "flex";
    }

    this.closeSearchResults(false);
    this.loadUserPermissions(userId, true);
  }

  async handleSearch() {
    if (!this.searchInput) return;
    const raw = this.searchInput.value.trim();
    const query = raw.toLowerCase().replace(/^#/, "").trim();
    const isNumericId = /^\d+$/.test(query);

    if (this.searchClearBtn) {
      this.searchClearBtn.style.display = raw ? "flex" : "none";
    }

    if (this.searchAbortController) {
      this.searchAbortController.abort();
      this.searchAbortController = null;
    }

    if (!query) {
      this.filteredUsers = [...this.dataLoader.users];
      this.renderSearchResults(this.filteredUsers, "");

      try {
        const response = await this.http.get("/api/v1/users/all");
        if (response && response.success && Array.isArray(response.data)) {
          this.dataLoader.users = response.data.map(u => this.dataLoader.normalizeUser(u));
          this.dataLoader.saveUsers();
          if (!this.searchInput.value.trim()) {
            this.filteredUsers = [...this.dataLoader.users];
            this.renderSearchResults(this.filteredUsers, "");
          }
        }
      } catch (err) {
        // Fallback to local users cache
      }
      return;
    }

    // Immediate local filtering while User Module request is in flight
    this.filteredUsers = this.filterLocalUsers(raw, query, isNumericId);
    this.renderSearchResults(this.filteredUsers, query);

    // Search users from User Module (/api/v1/users/search) using RequestHandler
    const controller = new AbortController();
    this.searchAbortController = controller;

    try {
      const params = {
        q: raw,
        all: true
      };
      if (isNumericId) {
        params.id = query;
      }

      const response = await this.http.get("/api/v1/users/search", params, {
        signal: controller.signal
      });

      const list = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
      const matchedUsers = list.map(u =>
        typeof this.dataLoader.normalizeUser === "function" ? this.dataLoader.normalizeUser(u) : u
      );

      // Sync discovered users into dataLoader cache
      matchedUsers.forEach(remoteUser => {
        const idx = this.dataLoader.users.findIndex(u => Number(u.id) === Number(remoteUser.id));
        if (idx !== -1) {
          this.dataLoader.users[idx] = { ...this.dataLoader.users[idx], ...remoteUser };
        } else {
          this.dataLoader.users.push(remoteUser);
        }
      });
      this.dataLoader.saveUsers();

      this.filteredUsers = matchedUsers;
      this.renderSearchResults(this.filteredUsers, query);
    } catch (err) {
      if (err && (err.name === "AbortError" || err.isTimeout)) {
        return;
      }
      // Keep local filtered results if API request fails
    }
  }

  filterLocalUsers(raw, query, isNumericId) {
    return this.dataLoader.users.filter(u => {
      const matchId =
        String(u.id) === query ||
        String(u.id).startsWith(query) ||
        `#${u.id}`.startsWith(raw.toLowerCase());

      if (isNumericId && !query.startsWith("0") && query.length <= 6) {
        return matchId;
      }

      const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
      const matchName =
        fullName.includes(query) ||
        (u.first_name || "").toLowerCase().includes(query) ||
        (u.last_name || "").toLowerCase().includes(query);
      const matchUsername = (u.username || "").toLowerCase().includes(query);
      const matchMobile = (u.mobile || "").includes(query);
      const matchRole = (u.role || "").toLowerCase().includes(query);

      return matchId || matchName || matchUsername || matchMobile || matchRole;
    });
  }

  renderSearchResults(matches, query) {
    if (!this.searchResults) return;

    this.isDropdownOpen = true;
    if (this.combobox) {
      this.combobox.classList.add("open");
    }
    if (this.searchInput) {
      this.searchInput.setAttribute("aria-expanded", "true");
    }

    if (matches.length === 0) {
      this.highlightedIndex = -1;
      this.searchResults.innerHTML = `
        <div style="padding: 14px; text-align: center; color: #94a3b8; font-size: 12.5px;">
          <i class="fa-solid fa-user-xmark" style="margin-right: 6px;"></i>
          No user found matching "<strong>${query}</strong>"
        </div>
      `;
      this.searchResults.style.display = "block";
      return;
    }

    const currentIdx = matches.findIndex(u => Number(u.id) === Number(this.currentUserId));
    this.highlightedIndex = currentIdx !== -1 ? currentIdx : 0;

    this.searchResults.innerHTML = matches.map((u, idx) => `
      <div class="uc-perm-search-item ${idx === this.highlightedIndex ? 'highlighted' : ''}" data-id="${u.id}" role="option" aria-selected="${Number(u.id) === Number(this.currentUserId)}">
        <span class="uc-perm-item-id">ID: #${u.id}</span>
        <div class="uc-perm-item-name">
          <span>${u.first_name} ${u.last_name}</span>
          <small>@${u.username}${u.mobile ? ` • ${u.mobile}` : ""}</small>
        </div>
        <span class="uc-perm-item-role">${u.status || u.role || 'Active'}</span>
      </div>
    `).join("");

    this.searchResults.style.display = "block";
  }

  selectHighlightedOrFirstResult() {
    if (this.filteredUsers && this.filteredUsers.length > 0) {
      const target =
        (this.highlightedIndex >= 0 && this.filteredUsers[this.highlightedIndex]) ||
        this.filteredUsers[0];
      this.selectUserOption(target);
    }
  }

  closeSearchResults(restoreSelectedText = false) {
    this.isDropdownOpen = false;
    if (this.combobox) {
      this.combobox.classList.remove("open");
    }
    if (this.searchInput) {
      this.searchInput.setAttribute("aria-expanded", "false");
    }
    if (this.searchResults) {
      this.searchResults.style.display = "none";
    }
    if (restoreSelectedText && this.currentUserId && this.searchInput) {
      const activeUser = this.dataLoader.users.find(u => Number(u.id) === Number(this.currentUserId));
      if (activeUser) {
        this.searchInput.value = this.formatUserDisplay(activeUser);
        if (this.searchClearBtn) {
          this.searchClearBtn.style.display = "flex";
        }
      }
    }
  }

  clearSearch() {
    if (this.searchInput) {
      this.searchInput.value = "";
      this.searchInput.focus();
    }
    if (this.searchClearBtn) {
      this.searchClearBtn.style.display = "none";
    }
    this.filteredUsers = [...this.dataLoader.users];
    this.renderSearchResults(this.filteredUsers, "");
  }

  populateUserSelect(userList = null) {
    const users = userList !== null ? userList : this.dataLoader.users;

    if (this.userSelect && this.userSelect.tagName === "SELECT") {
      if (users.length === 0) {
        this.userSelect.innerHTML = `<option value="">-- No Matching Users --</option>`;
      } else {
        this.userSelect.innerHTML = users.map(u => `
          <option value="${u.id}" ${Number(u.id) === Number(this.currentUserId) ? 'selected' : ''}>
            ID #${u.id} - ${u.first_name} ${u.last_name} (@${u.username})
          </option>
        `).join("");
      }
    }

    if (users.length > 0 && !users.some(u => Number(u.id) === Number(this.currentUserId))) {
      this.currentUserId = Number(users[0].id);
      this.loadUserPermissions(this.currentUserId, true);
    } else if (this.currentUserId) {
      const currentUser = users.find(u => Number(u.id) === Number(this.currentUserId));
      if (currentUser && this.searchInput && document.activeElement !== this.searchInput) {
        this.searchInput.value = this.formatUserDisplay(currentUser);
        if (this.searchClearBtn) {
          this.searchClearBtn.style.display = "flex";
        }
      }
    }
  }

  loadUserPermissions(userId, syncSearchInput = true) {
    this.currentUserId = Number(userId);
    if (this.userSelect && this.userSelect.value !== String(this.currentUserId)) {
      this.userSelect.value = String(this.currentUserId);
    }

    const user = this.dataLoader.users.find(u => Number(u.id) === this.currentUserId);
    if (user) {
      if (syncSearchInput && this.searchInput && document.activeElement !== this.searchInput) {
        this.searchInput.value = this.formatUserDisplay(user);
        if (this.searchClearBtn) {
          this.searchClearBtn.style.display = "flex";
        }
      }
      if (this.activeUserBadge) {
        this.activeUserBadge.innerHTML = `
          <span class="ant-tag ant-tag-blue" style="font-size: 12.5px; padding: 4px 10px; border-radius: 6px;">
            <i class="fa-solid fa-id-badge"></i> <strong>ID: #${user.id}</strong> — ${user.first_name} ${user.last_name} (@${user.username}) • <em>${user.status || user.role || 'Active'}</em>
          </span>
        `;
      }
    }

    const perms = this.dataLoader.getUserPermissions(this.currentUserId);
    this.currentPermissions = JSON.parse(JSON.stringify(perms));
    this.render();

    const requestedUserId = this.currentUserId;
    if (typeof this.dataLoader.fetchUserPermissions === "function") {
      this.dataLoader.fetchUserPermissions(requestedUserId).then((remotePerms) => {
        if (this.currentUserId === requestedUserId && remotePerms) {
          this.currentPermissions = JSON.parse(JSON.stringify(remotePerms));
          this.render();
        }
      });
    }
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

  async save() {
    if (!this.currentUserId) return;

    const originalHtml = this.saveBtn ? this.saveBtn.innerHTML : "";
    if (this.saveBtn) {
      this.saveBtn.disabled = true;
      this.saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;
    }

    try {
      if (typeof this.onSavePermissions === "function") {
        await this.onSavePermissions(this.currentUserId, this.currentPermissions);
      } else {
        this.dataLoader.setUserPermissions(this.currentUserId, this.currentPermissions);
        this.onPermissionsSaved();
      }
    } finally {
      if (this.saveBtn) {
        this.saveBtn.disabled = false;
        this.saveBtn.innerHTML = originalHtml;
      }
    }
  }
}
