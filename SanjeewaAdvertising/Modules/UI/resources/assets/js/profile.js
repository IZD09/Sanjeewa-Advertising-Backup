/**
 * User Profile & Credentials Management Module
 * Sanjeewa Advertising Digital Printing Management System
 *
 * Architecture:
 * - ProfileDataLoader: Communicates with User Profile module APIs via RequestHandler
 * - ProfileSessionRowBuilder: Fluent builder constructing login session rows (extends BaseTableRowBuilder)
 * - ProfilePermissionCardBuilder: Fluent builder constructing module permission cards (extends BaseTableRowBuilder)
 * - ProfileHeaderHandler: Profile card overview & personal form fields handler
 * - ProfileLoginsTableHandler: Recent login sessions table loader
 * - ProfilePermissionsHandler: Module access permissions card grid loader
 * - ProfileNavigationProcess: Tab switching and navigation
 * - ProfileUpdateProcess: Personal details update process
 * - PasswordUpdateProcess: Password & credentials update process
 */

"use strict";

import {
  ProfileDataLoader,
  ProfileSessionRowBuilder,
  ProfilePermissionCardBuilder,
  ProfileHeaderHandler,
  ProfileLoginsTableHandler,
  ProfilePermissionsHandler,
  ProfileNavigationProcess,
  ProfileUpdateProcess,
  PasswordUpdateProcess,
} from "./profile/index.js";

export class ProfileManager {
  constructor() {
    this.dataLoader = new ProfileDataLoader();
    this.currentUser = null;

    // Handlers
    this.headerHandler = new ProfileHeaderHandler();
    this.loginsHandler = new ProfileLoginsTableHandler();
    this.permissionsHandler = new ProfilePermissionsHandler();

    // Navigation Process
    this.navigationProcess = new ProfileNavigationProcess();

    // Process 1: Update Profile Details (First Name, Last Name, Mobile)
    this.profileUpdateProcess = new ProfileUpdateProcess({
      dataLoader: this.dataLoader,
      onProfileUpdated: (updatedUser) => {
        this.headerHandler.updateHeader(updatedUser);
        if (this.currentUser) {
          Object.assign(this.currentUser, updatedUser);
        }
      },
      showToast: (msg, isErr) => this.showToast(msg, isErr),
    });

    // Process 2: Update Password & Security (Current Password, New Password, Confirm)
    this.passwordUpdateProcess = new PasswordUpdateProcess({
      dataLoader: this.dataLoader,
      onPasswordUpdated: (res) => {
        // Password updated callback
      },
      showToast: (msg, isErr) => this.showToast(msg, isErr),
    });

    this.init();
  }

  /**
   * Load profile data and populate view elements.
   */
  async init() {
    try {
      const data = await this.dataLoader.fetchProfileData();
      this.currentUser = data || {};

      this.headerHandler.render(this.currentUser);
      this.loginsHandler.render(this.currentUser.logins || []);
      this.permissionsHandler.render(this.currentUser.modules || []);
    } catch (err) {
      console.error("[ProfileManager] Initialization failed:", err);
      this.showToast("Could not retrieve profile information.", true);
    }
  }

  /**
   * Display toast notification.
   *
   * @param {string} message
   * @param {boolean} [isError=false]
   */
  showToast(message, isError = false) {
    const toast = document.getElementById("upToast");
    const toastMsg = document.getElementById("upToastMsg");
    if (!toast) return;

    if (toastMsg) toastMsg.textContent = message;
    toast.style.background = isError ? "#dc2626" : "#1e293b";
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3500);
  }
}

// Backward compatibility alias
export const UserProfileManager = ProfileManager;

const bootProfile = () => {
  if (document.getElementById("module-user-profile")) {
    window.profileManager = new ProfileManager();
  }
};

bootProfile();
document.addEventListener("DOMContentLoaded", bootProfile);
document.addEventListener("turbo:load", bootProfile);

export default ProfileManager;
