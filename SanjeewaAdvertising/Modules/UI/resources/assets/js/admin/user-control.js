/**
 * User Control & Role-Based Permissions Management Controller
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Follows the modular architecture of payments and place-order
 */

"use strict";

import {
  UserControlDataLoader,
  UserHandler,
  AdminHandler,
  PermissionHandler,
  AddUserModal,
  AddAdminModal,
  FilterProcess,
  MetricsProcess
} from "./user-control/index.js";

export class UserControlManager {
  constructor() {
    this.dataLoader = new UserControlDataLoader();

    this.metricsProcess = new MetricsProcess({
      dataLoader: this.dataLoader
    });

    this.permissionHandler = new PermissionHandler({
      dataLoader: this.dataLoader,
      onPermissionsSaved: () => {
        this.showToast("Permissions updated successfully!", "success");
        this.metricsProcess.update();
      }
    });

    this.userHandler = new UserHandler({
      dataLoader: this.dataLoader,
      onSelectUserForPerms: (userId) => {
        this.filterProcess.switchTab("panePermissions");
        this.permissionHandler.loadUserPermissions(userId);
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
      onTabSwitched: (tabId) => {
        if (tabId === "panePermissions") {
          this.permissionHandler.populateUserSelect();
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
        this.addAdminModal.open();
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

// Auto-boot when loaded on user-control view with safe readyState handling
const bootUserControl = () => {
  const container = document.getElementById("module-user-control");
  if (container && !window.userControlManager) {
    window.userControlManager = new UserControlManager();
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootUserControl);
} else {
  bootUserControl();
}

