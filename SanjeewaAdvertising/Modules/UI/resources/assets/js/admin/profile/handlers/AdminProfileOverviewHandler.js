/**
 * Admin Profile Overview & Personal Form Handler
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

export class AdminProfileOverviewHandler {
  constructor() {
    // Overview Display Elements
    this.avatarCircle = document.getElementById("adminAvatarCircle");
    this.displayNameEl = document.getElementById("adminDisplayName");
    this.displayUsernameEl = document.getElementById("adminDisplayUsername");
    this.badgeRoleEl = document.getElementById("adminBadgeRole");
    this.badgeStatusEl = document.getElementById("adminBadgeStatus");
    this.metaEmailEl = document.getElementById("adminMetaEmail");
    this.metaMobileEl = document.getElementById("adminMetaMobile");
    this.metaAddedEl = document.getElementById("adminMetaAdded");
    this.metaLoginsCountEl = document.getElementById("adminMetaLoginsCount");
    this.metaActivitiesCountEl = document.getElementById("adminMetaActivitiesCount");

    // Personal Details Form Inputs
    this.inputFirstName = document.getElementById("profFirstName");
    this.inputLastName = document.getElementById("profLastName");
    this.inputUsername = document.getElementById("profUsername");
    this.inputEmail = document.getElementById("profEmail");
    this.inputMobile = document.getElementById("profMobile");
    this.inputRole = document.getElementById("profRole");
    this.inputStatus = document.getElementById("profStatus");
  }

  /**
   * Render administrator profile card overview and populate personal detail inputs.
   *
   * @param {Object|null} admin
   */
  render(admin) {
    if (!admin) return;

    const fullName = `${admin.first_name || ""} ${admin.last_name || ""}`.trim() || admin.username;
    const initials = (admin.first_name?.[0] || admin.username?.[0] || "A") + (admin.last_name?.[0] || "");
    const roleName = admin.type?.admin_type || admin.type?.name || "Administrator";
    const statusName = admin.status?.admin_statas || admin.status?.name || "Active";

    if (this.avatarCircle) this.avatarCircle.textContent = initials.toUpperCase();
    if (this.displayNameEl) this.displayNameEl.textContent = fullName;
    if (this.displayUsernameEl) this.displayUsernameEl.textContent = `@${admin.username}`;
    if (this.badgeRoleEl) this.badgeRoleEl.textContent = roleName;
    if (this.badgeStatusEl) this.badgeStatusEl.textContent = statusName;

    if (this.metaEmailEl) this.metaEmailEl.textContent = admin.email || "—";
    if (this.metaMobileEl) this.metaMobileEl.textContent = admin.mobile || "—";
    if (this.metaAddedEl) {
      this.metaAddedEl.textContent = admin.add_time
        ? new Date(admin.add_time).toLocaleDateString("en-LK", { dateStyle: "medium" })
        : "—";
    }

    // Populate personal details form inputs
    if (this.inputFirstName) this.inputFirstName.value = admin.first_name || "";
    if (this.inputLastName) this.inputLastName.value = admin.last_name || "";
    if (this.inputUsername) this.inputUsername.value = admin.username || "";
    if (this.inputEmail) this.inputEmail.value = admin.email || "";
    if (this.inputMobile) this.inputMobile.value = admin.mobile || "";
    if (this.inputRole) this.inputRole.value = roleName;
    if (this.inputStatus) this.inputStatus.value = statusName;

    const logins = Array.isArray(admin.logins) ? admin.logins : [];
    this.updateLoginsCount(logins.length);

    const activities = Array.isArray(admin.activities) ? admin.activities : [];
    this.updateActivitiesCount(activities.length);
  }

  /**
   * Update recorded login sessions counter label.
   *
   * @param {number} count
   */
  updateLoginsCount(count) {
    if (this.metaLoginsCountEl) {
      this.metaLoginsCountEl.textContent = `${count} recorded`;
    }
  }

  /**
   * Update recorded activities counter label.
   *
   * @param {number} count
   */
  updateActivitiesCount(count) {
    if (this.metaActivitiesCountEl) {
      this.metaActivitiesCountEl.textContent = `${count} recorded`;
    }
  }
}

export default AdminProfileOverviewHandler;
