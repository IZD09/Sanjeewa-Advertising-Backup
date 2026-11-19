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

    this.hasVerifiedPermissions = false;

    this.viewUserProfileModal = new ViewUserProfileModal({
      adminVerifyModal: this.adminVerifyModal,
      onShowToast: (msg, type) => this.showToast(msg, type),
      onManagePermissions: (userId) => {
        this.adminVerifyModal.requestPermission({
          description: `Configuring permissions for User #${userId} requires administrator security verification. Please enter your username and password.`,
          onSuccess: () => {
            this.hasVerifiedPermissions = true;
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
          description: `Configuring permissions for User #${userId} requires administrator security verification. Please enter your username and password.`,
          onSuccess: () => {
            this.hasVerifiedPermissions = true;
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
        if (targetTab === "paneAdmins") {
          this.adminVerifyModal.requestPermission({
            description: "Viewing system administrators requires administrator security verification. Please enter your username and password.",
            onSuccess: () => {
              proceed();
            }
          });
          return false; // Intercept until verified
        }

        if (targetTab === "panePermissions") {
          this.adminVerifyModal.requestPermission({
            description: "Configuring user module permissions requires administrator security verification. Please enter your username and password.",
            onSuccess: () => {
              this.hasVerifiedPermissions = true;
              proceed();
            }
          });
          return false; // Intercept until verified
        }

        return true;
      },
      onTabSwitched: (tabId) => {
        if (tabId === "panePermissions") {
          this.permissionHandler.populateUserSelect();
        } else {
          // Reset permissions verification state whenever leaving the permissions tab
          this.hasVerifiedPermissions = false;
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

