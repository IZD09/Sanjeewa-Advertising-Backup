/**
 * Admin Profile Manager & Permission Verification Controller
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Follows the modular architecture of user-control, payments, and profile modules.
 */

"use strict";

import { AdminProfileDataLoader } from "../AdminProfileDataLoader.js";
import {
  AdminProfileOverviewHandler,
  AdminLoginsTableHandler,
  AdminActivitiesHandler,
} from "../handlers/index.js";
import {
  AdminProfileLockModal,
  AdminActivitiesVerifyModal,
} from "../modals/index.js";
import { AdminProfileNavigationProcess } from "./AdminProfileNavigationProcess.js";
import { UpdateAdminProfileProcess } from "./UpdateAdminProfileProcess.js";

export class AdminProfileManager {
  constructor() {
    this.toastEl = document.getElementById("apToast");

    this.dataLoader = new AdminProfileDataLoader({
      onAdminUpdated: (admin) => {
        if (admin) {
          this.renderAdminProfile(admin);
        }
      },
      onActivitiesUpdated: (activities) => {
        if (this.overviewHandler) {
          this.overviewHandler.updateActivitiesCount(activities.length);
        }
      },
    });

    // Handlers
    this.overviewHandler = new AdminProfileOverviewHandler();
    this.loginsHandler = new AdminLoginsTableHandler();
    this.activitiesHandler = new AdminActivitiesHandler({
      dataLoader: this.dataLoader,
      onActivitiesRefreshed: (activities) => {
        this.overviewHandler.updateActivitiesCount(activities.length);
      },
      onShowToast: (msg, type) => this.showToast(msg, type),
    });

    // Modals
    this.profileLockModal = new AdminProfileLockModal({
      dataLoader: this.dataLoader,
      onVerified: (admin) => {
        this.dataLoader.setVerifiedAdmin(admin);
        this.showToast("Identity verified successfully. Welcome to Admin Profile!", "success");
      },
      onCancelled: () => {
        window.location.href = "/admin/dashboard";
      },
    });

    this.activitiesVerifyModal = new AdminActivitiesVerifyModal({
      dataLoader: this.dataLoader,
      onVerified: () => {
        this.navigationProcess.grantActivitiesAccess();
        this.showToast("Activity audit permission verified & granted.", "success");

        if (this.dataLoader.getActivities().length === 0) {
          this.activitiesHandler.refresh();
        }
      },
    });

    // Processes
    this.navigationProcess = new AdminProfileNavigationProcess({
      onRequireActivitiesVerification: () => {
        this.activitiesVerifyModal.open();
      },
      onShowToast: (msg, type) => this.showToast(msg, type),
    });

    this.updateProfileProcess = new UpdateAdminProfileProcess({
      dataLoader: this.dataLoader,
      onShowToast: (msg, type) => this.showToast(msg, type),
    });

    this.init();
  }

  /**
   * Initialize admin profile page by prompting for identity verification.
   */
  init() {
    this.profileLockModal.open();
  }

  /**
   * Render verified administrator overview, logins table, and activity logs.
   *
   * @param {Object} admin
   */
  renderAdminProfile(admin) {
    this.overviewHandler.render(admin);
    this.loginsHandler.render(Array.isArray(admin.logins) ? admin.logins : []);
    this.activitiesHandler.populateTypeFilter();
    this.activitiesHandler.render();
  }

  /**
   * Display toast notification.
   *
   * @param {string} message
   * @param {string} [type="success"]
   */
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

// Auto-boot when loaded on admin profile page (prevents duplicate initialization)
const bootAdminProfile = () => {
  const container = document.getElementById("module-admin-profile");
  if (container && container.dataset.apInitialized !== "true") {
    container.dataset.apInitialized = "true";
    window.adminProfileManager = new AdminProfileManager();
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootAdminProfile, { once: true });
} else {
  bootAdminProfile();
}
document.addEventListener("turbo:load", bootAdminProfile);

export default AdminProfileManager;
