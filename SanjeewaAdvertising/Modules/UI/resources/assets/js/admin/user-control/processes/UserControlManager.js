/**
 * User Control & Role-Based Permissions Management Controller
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Follows the modular architecture of payments and place-order
 */

"use strict";

import { RequestHandler } from "../../../core/RequestHandler.js";
import { UserControlDataLoader } from "../UserControlDataLoader.js";
import { UserHandler, AdminHandler, PermissionHandler } from "../handlers/index.js";
import { AddUserModal, AddAdminModal, AdminVerifyModal, ViewUserProfileModal } from "../modals/index.js";
import { AddUserProcess } from "./AddUserProcess.js";
import { FilterProcess } from "./FilterProcess.js";
import { MetricsProcess } from "./MetricsProcess.js";

export class UserControlManager {
  constructor() {
    this.http = new RequestHandler();

    this.dataLoader = new UserControlDataLoader({
      onUsersUpdated: () => {
        if (this.userHandler) this.userHandler.render();
        if (this.permissionHandler && (!this.permissionHandler.searchInput || !this.permissionHandler.searchInput.value.trim())) {
          this.permissionHandler.populateUserSelect();
        }
        if (this.metricsProcess) this.metricsProcess.update();
      },
      onAdminsUpdated: () => {
        if (this.adminHandler) this.adminHandler.render();
        if (this.metricsProcess) this.metricsProcess.update();
      }
    });

    this.metricsProcess = new MetricsProcess({
      dataLoader: this.dataLoader
    });

    this.liveUpdateTimer = null;
    this.isUpdatingUsers = false;
    this.liveUpdateInterval = 5000;

    this.permissionHandler = new PermissionHandler({
      dataLoader: this.dataLoader,
      onSavePermissions: (userId, permMap) => this.saveUserPermissions(userId, permMap),
      onPermissionsSaved: () => {
        this.showToast("Permissions updated successfully!", "success");
        this.metricsProcess.update();
      }
    });

    this.adminVerifyModal = new AdminVerifyModal({
      onVerified: (verifiedAdmin) => {
        this.showToast(`Admin access verified for @${verifiedAdmin.username}`, "success");
      }
    });

    // Security Verification & Auto-Lock States (1 minute timeout)
    this.TIMEOUT_MS = 60000;
    this.currentTab = "paneStaffUsers";

    this.hasVerifiedAdminsAccess = false;
    this.adminsInactivityTimer = null;
    this.adminsAwayTimer = null;
    this.adminsLeftTimestamp = null;

    this.hasVerifiedPermissions = false;
    this.permissionsInactivityTimer = null;
    this.permissionsAwayTimer = null;
    this.permissionsLeftTimestamp = null;

    this.boundResetActiveInactivity = () => this.resetActiveInactivity();

    // DOM Elements for Security Locks
    this.adminTabLockIcon = document.getElementById("adminTabLockIcon");
    this.permTabLockIcon = document.getElementById("permTabLockIcon");
    this.btnLockAdminTab = document.getElementById("btnLockAdminTab");
    this.btnLockPermTab = document.getElementById("btnLockPermTab");

    this.viewUserProfileModal = new ViewUserProfileModal({
      adminVerifyModal: this.adminVerifyModal,
      onShowToast: (msg, type) => this.showToast(msg, type),
      onManagePermissions: (userId) => {
        this.adminVerifyModal.requestPermission({
          description: `Configuring permissions for User #${userId} requires administrator security verification. Please enter your administrator password.`,
          onSuccess: () => {
            this.grantPermissionsAccess();
            this.filterProcess.switchTab("panePermissions", true);
            this.permissionHandler.loadUserPermissions(userId);
          }
        });
      }
    });

    this.userHandler = new UserHandler({
      dataLoader: this.dataLoader,
      onViewUserProfile: (userId) => {
        this.viewUserProfileModal.open(userId);
      },
      onSelectUserForPerms: (userId) => {
        this.adminVerifyModal.requestPermission({
          description: `Configuring permissions for User #${userId} requires administrator security verification. Please enter your administrator password.`,
          onSuccess: () => {
            this.grantPermissionsAccess();
            this.filterProcess.switchTab("panePermissions", true);
            this.permissionHandler.loadUserPermissions(userId);
          }
        });
      },
      onDataChanged: () => {
        this.metricsProcess.update();
      }
    });

    this.adminHandler = new AdminHandler({
      dataLoader: this.dataLoader,
      onDataChanged: () => {
        this.metricsProcess.update();
      }
    });

    this.addUserModal = new AddUserModal({
      dataLoader: this.dataLoader,
      onUserAdded: (newUser) => {
        this.userHandler.render();
        this.permissionHandler.populateUserSelect();
        this.metricsProcess.update();
        this.showToast(`User ${newUser.first_name} added successfully!`, "success");
      }
    });

    this.addAdminModal = new AddAdminModal({
      dataLoader: this.dataLoader,
      onAdminAdded: (newAdmin) => {
        this.adminHandler.render();
        this.metricsProcess.update();
        this.showToast(`Admin ${newAdmin.first_name} added successfully!`, "success");
      }
    });

    this.filterProcess = new FilterProcess({
      beforeTabSwitch: (targetTab, proceed) => {
        // If leaving paneAdmins to another tab
        if (this.currentTab === "paneAdmins" && targetTab !== "paneAdmins") {
          this.stopAdminsInactivityMonitoring();
          if (this.hasVerifiedAdminsAccess) {
            this.adminsLeftTimestamp = Date.now();
            if (this.adminsAwayTimer) clearTimeout(this.adminsAwayTimer);
            this.adminsAwayTimer = setTimeout(() => {
              this.handleAdminsAwayTimeout();
            }, this.TIMEOUT_MS);
          }
        }

        // If leaving panePermissions to another tab
        if (this.currentTab === "panePermissions" && targetTab !== "panePermissions") {
          this.stopPermissionsInactivityMonitoring();
          if (this.hasVerifiedPermissions) {
            this.permissionsLeftTimestamp = Date.now();
            if (this.permissionsAwayTimer) clearTimeout(this.permissionsAwayTimer);
            this.permissionsAwayTimer = setTimeout(() => {
              this.handlePermissionsAwayTimeout();
            }, this.TIMEOUT_MS);
          }
        }

        // Target: Administrators
        if (targetTab === "paneAdmins") {
          // Check away expiration (>= 1 minute)
          if (this.hasVerifiedAdminsAccess && this.adminsLeftTimestamp) {
            if (Date.now() - this.adminsLeftTimestamp >= this.TIMEOUT_MS) {
              this.handleAdminsAwayTimeout();
            }
          }

          if (!this.hasVerifiedAdminsAccess) {
            this.adminVerifyModal.requestPermission({
              description: "Viewing system administrators requires administrator security verification. Please enter your administrator password.",
              onSuccess: () => {
                this.grantAdminsAccess();
                proceed();
              }
            });
            return false;
          }

          if (this.adminsAwayTimer) {
            clearTimeout(this.adminsAwayTimer);
            this.adminsAwayTimer = null;
          }
          this.adminsLeftTimestamp = null;
        }

        // Target: Set User Permissions
        if (targetTab === "panePermissions") {
          // Check away expiration (>= 1 minute)
          if (this.hasVerifiedPermissions && this.permissionsLeftTimestamp) {
            if (Date.now() - this.permissionsLeftTimestamp >= this.TIMEOUT_MS) {
              this.handlePermissionsAwayTimeout();
            }
          }

          if (!this.hasVerifiedPermissions) {
            this.adminVerifyModal.requestPermission({
              description: "Configuring user module permissions requires administrator security verification. Please enter your administrator password.",
              onSuccess: () => {
                this.grantPermissionsAccess();
                proceed();
              }
            });
            return false;
          }

          if (this.permissionsAwayTimer) {
            clearTimeout(this.permissionsAwayTimer);
            this.permissionsAwayTimer = null;
          }
          this.permissionsLeftTimestamp = null;
        }

        return true;
      },
      onTabSwitched: (tabId) => {
        this.currentTab = tabId;

        if (tabId === "paneAdmins") {
          this.startAdminsInactivityMonitoring();
        } else if (tabId === "panePermissions") {
          this.permissionHandler.populateUserSelect();
          this.startPermissionsInactivityMonitoring();
        }
      }
    });

    this.toastEl = document.getElementById("ucToast");

    this.bindHeaderActions();
    this.init();
  }

  bindHeaderActions() {
    const btnAddUser = document.getElementById("btnOpenAddUserModal");
    if (btnAddUser) {
      btnAddUser.addEventListener("click", () => {
        this.addUserModal.open();
      });
    }

    const btnAddAdmin = document.getElementById("btnOpenAddAdminModal");
    if (btnAddAdmin) {
      btnAddAdmin.addEventListener("click", () => {
        this.adminVerifyModal.requestPermission({
          description: "Adding or provisioning a new system administrator requires administrator security verification. Please enter your username and password.",
          onSuccess: () => {
            this.addAdminModal.open();
          }
        });
      });
    }

    const btnQuickPerms = document.getElementById("btnQuickPermissions");
    if (btnQuickPerms) {
      btnQuickPerms.addEventListener("click", () => {
        this.filterProcess.switchTab("panePermissions");
      });
    }

    if (this.btnLockAdminTab) {
      this.btnLockAdminTab.addEventListener("click", () => {
        this.lockAdminsTab();
      });
    }

    if (this.btnLockPermTab) {
      this.btnLockPermTab.addEventListener("click", () => {
        this.lockPermissionsTab();
      });
    }
  }

  // --------------------------------------------------------------------------
  // ADMINISTRATORS TAB SECURITY & AUTO-LOCK (1 MINUTE TIMEOUT)
  // --------------------------------------------------------------------------

  grantAdminsAccess() {
    this.hasVerifiedAdminsAccess = true;
    this.adminsLeftTimestamp = null;
    if (this.adminsAwayTimer) {
      clearTimeout(this.adminsAwayTimer);
      this.adminsAwayTimer = null;
    }
    if (this.adminTabLockIcon) {
      this.adminTabLockIcon.className = "fa-solid fa-lock-open";
      this.adminTabLockIcon.style.color = "#52c41a";
      this.adminTabLockIcon.title = "Permission granted";
    }
  }

  startAdminsInactivityMonitoring() {
    this.stopAdminsInactivityMonitoring();
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(evt => window.addEventListener(evt, this.boundResetActiveInactivity, { passive: true }));
    this.adminsInactivityTimer = setTimeout(() => {
      this.handleAdminsInactivityTimeout();
    }, this.TIMEOUT_MS);
  }

  stopAdminsInactivityMonitoring() {
    if (this.adminsInactivityTimer) {
      clearTimeout(this.adminsInactivityTimer);
      this.adminsInactivityTimer = null;
    }
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(evt => window.removeEventListener(evt, this.boundResetActiveInactivity));
  }

  handleAdminsInactivityTimeout() {
    this.stopAdminsInactivityMonitoring();
    this.lockAdminsTab("Administrators tab locked due to 1 minute of inactivity.");
  }

  handleAdminsAwayTimeout() {
    if (this.adminsAwayTimer) {
      clearTimeout(this.adminsAwayTimer);
      this.adminsAwayTimer = null;
    }
    this.hasVerifiedAdminsAccess = false;
    this.adminsLeftTimestamp = null;
    if (this.adminTabLockIcon) {
      this.adminTabLockIcon.className = "fa-solid fa-lock";
      this.adminTabLockIcon.style.color = "#faad14";
      this.adminTabLockIcon.title = "Permission required";
    }
    this.showToast("Administrators tab session expired (away > 1 min). Locked.", "warning");
  }

  lockAdminsTab(message = "Administrators tab has been locked.") {
    this.stopAdminsInactivityMonitoring();
    if (this.adminsAwayTimer) {
      clearTimeout(this.adminsAwayTimer);
      this.adminsAwayTimer = null;
    }
    this.adminsLeftTimestamp = null;
    this.hasVerifiedAdminsAccess = false;

    if (this.adminTabLockIcon) {
      this.adminTabLockIcon.className = "fa-solid fa-lock";
      this.adminTabLockIcon.style.color = "#faad14";
      this.adminTabLockIcon.title = "Permission required";
    }

    if (this.currentTab === "paneAdmins") {
      this.filterProcess.switchTab("paneStaffUsers");
    }
    this.showToast(message, "warning");
  }

  // --------------------------------------------------------------------------
  // USER PERMISSIONS TAB SECURITY & AUTO-LOCK (1 MINUTE TIMEOUT)
  // --------------------------------------------------------------------------

  grantPermissionsAccess() {
    this.hasVerifiedPermissions = true;
    this.permissionsLeftTimestamp = null;
    if (this.permissionsAwayTimer) {
      clearTimeout(this.permissionsAwayTimer);
      this.permissionsAwayTimer = null;
    }
    if (this.permTabLockIcon) {
      this.permTabLockIcon.className = "fa-solid fa-lock-open";
      this.permTabLockIcon.style.color = "#52c41a";
      this.permTabLockIcon.title = "Permission granted";
    }
  }

  startPermissionsInactivityMonitoring() {
    this.stopPermissionsInactivityMonitoring();
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(evt => window.addEventListener(evt, this.boundResetActiveInactivity, { passive: true }));
    this.permissionsInactivityTimer = setTimeout(() => {
      this.handlePermissionsInactivityTimeout();
    }, this.TIMEOUT_MS);
  }

  stopPermissionsInactivityMonitoring() {
    if (this.permissionsInactivityTimer) {
      clearTimeout(this.permissionsInactivityTimer);
      this.permissionsInactivityTimer = null;
    }
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(evt => window.removeEventListener(evt, this.boundResetActiveInactivity));
  }

  handlePermissionsInactivityTimeout() {
    this.stopPermissionsInactivityMonitoring();
    this.lockPermissionsTab("Permissions tab locked due to 1 minute of inactivity.");
  }

  handlePermissionsAwayTimeout() {
    if (this.permissionsAwayTimer) {
      clearTimeout(this.permissionsAwayTimer);
      this.permissionsAwayTimer = null;
    }
    this.hasVerifiedPermissions = false;
    this.permissionsLeftTimestamp = null;
    if (this.permTabLockIcon) {
      this.permTabLockIcon.className = "fa-solid fa-lock";
      this.permTabLockIcon.style.color = "#faad14";
      this.permTabLockIcon.title = "Permission required";
    }
    this.showToast("Permissions tab session expired (away > 1 min). Locked.", "warning");
  }

  lockPermissionsTab(message = "Permissions tab has been locked.") {
    this.stopPermissionsInactivityMonitoring();
    if (this.permissionsAwayTimer) {
      clearTimeout(this.permissionsAwayTimer);
      this.permissionsAwayTimer = null;
    }
    this.permissionsLeftTimestamp = null;
    this.hasVerifiedPermissions = false;

    if (this.permTabLockIcon) {
      this.permTabLockIcon.className = "fa-solid fa-lock";
      this.permTabLockIcon.style.color = "#faad14";
      this.permTabLockIcon.title = "Permission required";
    }

    if (this.currentTab === "panePermissions") {
      this.filterProcess.switchTab("paneStaffUsers");
    }
    this.showToast(message, "warning");
  }

  // --------------------------------------------------------------------------
  // USER ACTIVITY INTERACTION RESET
  // --------------------------------------------------------------------------

  resetActiveInactivity() {
    if (this.currentTab === "paneAdmins") {
      if (this.adminsInactivityTimer) clearTimeout(this.adminsInactivityTimer);
      this.adminsInactivityTimer = setTimeout(() => {
        this.handleAdminsInactivityTimeout();
      }, this.TIMEOUT_MS);
    } else if (this.currentTab === "panePermissions") {
      if (this.permissionsInactivityTimer) clearTimeout(this.permissionsInactivityTimer);
      this.permissionsInactivityTimer = setTimeout(() => {
        this.handlePermissionsInactivityTimeout();
      }, this.TIMEOUT_MS);
    }
  }

  init() {
    this.userHandler.render();
    this.adminHandler.render();
    this.permissionHandler.populateUserSelect();
    this.metricsProcess.update();
    this.bindLiveUpdate();
    this.startLiveAutoUpdate(5000);
  }

  bindLiveUpdate() {
    const btnRefresh = document.getElementById("btnRefreshUsers");
    if (btnRefresh) {
      btnRefresh.addEventListener("click", async () => {
        const icon = btnRefresh.querySelector("i");
        if (icon) icon.classList.add("fa-spin");
        btnRefresh.disabled = true;

        try {
          await this.dataLoader.syncUsersFromBackend({ force: true });
          this.flashLiveBadge();
          this.showToast("Staff Users list refreshed!", "success");
        } catch (err) {
          this.showToast("Failed to refresh users.", "error");
        } finally {
          setTimeout(() => {
            if (icon) icon.classList.remove("fa-spin");
            btnRefresh.disabled = false;
          }, 400);
        }
      });
    }

    // React to visibility changes: immediately poll when user returns to tab
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        this.pollUsersLive();
      }
    });

    window.addEventListener("beforeunload", () => {
      this.stopLiveAutoUpdate();
    });

    document.addEventListener("turbo:before-cache", () => {
      this.stopLiveAutoUpdate();
    });
  }

  startLiveAutoUpdate(interval = 5000) {
    this.stopLiveAutoUpdate();
    this.liveUpdateInterval = interval;

    this.liveUpdateTimer = setInterval(() => {
      this.pollUsersLive();
    }, this.liveUpdateInterval);
  }

  stopLiveAutoUpdate() {
    if (this.liveUpdateTimer) {
      clearInterval(this.liveUpdateTimer);
      this.liveUpdateTimer = null;
    }
  }

  async pollUsersLive() {
    if (document.hidden) return;
    if (this.isUpdatingUsers) return;

    // Do not disrupt while user is actively typing in search
    if (document.activeElement === this.userHandler?.searchInput && this.userHandler?.searchInput?.value) {
      return;
    }

    // If an add user/admin modal is actively open and being filled out, skip
    if (this.addUserModal?.modalEl?.classList.contains("active") || this.addAdminModal?.modalEl?.classList.contains("active")) {
      return;
    }

    this.isUpdatingUsers = true;
    try {
      const result = await this.dataLoader.syncUsersFromBackend({ silent: true });
      if (result?.changed) {
        this.flashLiveBadge();
      }
    } finally {
      this.isUpdatingUsers = false;
    }
  }

  flashLiveBadge() {
    const badge = document.getElementById("ucUsersLiveBadge");
    if (badge) {
      badge.classList.add("flashing");
      setTimeout(() => badge.classList.remove("flashing"), 800);
    }
  }

  /**
   * Save the active state of modules marked in the UI for a given user into the database.
   * Sends PUT /admin/users/{userId}/permissions/sync using RequestHandler.
   *
   * @param {number|string} userId
   * @param {Object} permMap
   * @returns {Promise<boolean>}
   */
  async saveUserPermissions(userId, permMap = {}) {
    if (!userId) {
      this.showToast("Please select a user first!", "error");
      return false;
    }

    if (!this.hasVerifiedPermissions) {
      return new Promise((resolve) => {
        this.adminVerifyModal.requestPermission({
          description: "Saving user permissions requires administrator security verification. Please enter your username and password.",
          onSuccess: async () => {
            this.hasVerifiedPermissions = true;
            const success = await this.executeSavePermissions(userId, permMap);
            resolve(success);
          }
        });
      });
    }

    return this.executeSavePermissions(userId, permMap);
  }

  async executeSavePermissions(userId, permMap = {}) {
    try {
      const permissionsPayload = this.dataLoader.buildPermissionsPayload(permMap);

      const response = await this.http.put(`/admin/users/${userId}/permissions/sync`, {
        permissions: permissionsPayload
      });

      if (response && response.success === false) {
        throw new Error(response.message || "Failed to save user permissions.");
      }

      this.dataLoader.setUserPermissions(userId, permMap);

      if (response?.data) {
        const updatedUser = this.dataLoader.normalizeUser(response.data);
        const idx = this.dataLoader.users.findIndex(u => Number(u.id) === Number(updatedUser.id));
        if (idx !== -1) {
          this.dataLoader.users[idx] = updatedUser;
        }
      }

      if (this.metricsProcess) {
        this.metricsProcess.update();
      }

      this.showToast(response?.message || "Permissions saved to database successfully!", "success");
      return true;
    } catch (error) {
      const message = error?.data?.message || error?.message || "Failed to save permissions to database.";
      this.showToast(message, "error");
      return false;
    }
  }

  showToast(message, type = "success") {
    if (!this.toastEl) return;
    const msgSpan = this.toastEl.querySelector(".toast-msg") || this.toastEl;
    msgSpan.textContent = message;

    this.toastEl.className = `uc-toast ${type} active`;
    setTimeout(() => {
      this.toastEl.classList.remove("active");
    }, 3200);
  }
}

// Auto-boot when loaded on user-control view with safe readyState handling (prevents duplicate initialization)
const bootUserControl = () => {
  const container = document.getElementById("module-user-control");
  if (container && container.dataset.ucInitialized !== "true") {
    container.dataset.ucInitialized = "true";
    window.userControlManager = new UserControlManager();
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootUserControl, { once: true });
} else {
  bootUserControl();
}
document.addEventListener("turbo:load", bootUserControl);

