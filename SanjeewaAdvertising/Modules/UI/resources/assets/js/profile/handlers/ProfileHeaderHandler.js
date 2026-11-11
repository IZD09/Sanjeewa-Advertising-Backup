/**
 * SanjeewaAdvertising - Profile Header & Meta Handler
 *
 * Coordinates DOM updates for:
 * - Avatar circle with user initials
 * - Display name and @username
 * - Role & status badges
 * - Contact information and metadata counts (login sessions, assigned modules)
 * - Personal details form input fields
 */

"use strict";

export class ProfileHeaderHandler {
  constructor() {
    this.avatarCircle = document.getElementById("userAvatarCircle");
    this.displayNameEl = document.getElementById("userDisplayName");
    this.displayUsernameEl = document.getElementById("userDisplayUsername");
    this.badgeRoleEl = document.getElementById("userBadgeRole");
    this.badgeStatusEl = document.getElementById("userBadgeStatus");
    this.metaMobileEl = document.getElementById("userMetaMobile");
    this.metaRegisteredEl = document.getElementById("userMetaRegistered");
    this.metaLoginsCountEl = document.getElementById("userMetaLoginsCount");
    this.metaModulesCountEl = document.getElementById("userMetaModulesCount");

    // Form inputs for Personal Details
    this.inputFirstName = document.getElementById("upFirstName");
    this.inputLastName = document.getElementById("upLastName");
    this.inputUsername = document.getElementById("upUsername");
    this.inputMobile = document.getElementById("upMobile");
    this.inputStatus = document.getElementById("upStatus");
  }

  /**
   * Render profile information across the overview card and form fields.
   *
   * @param {Object} user
   */
  render(user = {}) {
    if (!user) return;

    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    const fullName = user.full_name || `${firstName} ${lastName}`.trim() || user.username || "User";

    // 1. Overview Card Display
    if (this.displayNameEl) this.displayNameEl.textContent = fullName;
    if (this.displayUsernameEl) this.displayUsernameEl.textContent = `@${user.username || "user"}`;
    if (this.metaMobileEl) this.metaMobileEl.textContent = user.mobile || "—";
    if (this.metaRegisteredEl) {
      this.metaRegisteredEl.textContent = user.register_at ? user.register_at.split(" ")[0] : "—";
    }

    // 2. Avatar Initials
    if (this.avatarCircle) {
      const firstInitial = firstName.charAt(0) || user.username?.charAt(0) || "U";
      const secondInitial = lastName.charAt(0) || "";
      const initials = (firstInitial + secondInitial).toUpperCase();
      this.avatarCircle.textContent = initials || "U";
    }

    // 3. Status & Role Badges
    if (this.badgeStatusEl) {
      this.badgeStatusEl.textContent = user.status || "Active";
    }
    if (this.badgeRoleEl && user.role) {
      this.badgeRoleEl.textContent = user.role;
    }

    // 4. Metadata session & module counts
    const logins = Array.isArray(user.logins) ? user.logins : [];
    const modules = Array.isArray(user.modules) ? user.modules : [];

    if (this.metaLoginsCountEl) {
      this.metaLoginsCountEl.textContent = `${logins.length} sessions`;
    }
    if (this.metaModulesCountEl) {
      this.metaModulesCountEl.textContent = `${modules.length} modules`;
    }

    // 5. Personal Details Form Fields
    if (this.inputFirstName) this.inputFirstName.value = firstName;
    if (this.inputLastName) this.inputLastName.value = lastName;
    if (this.inputUsername) this.inputUsername.value = user.username || "";
    if (this.inputMobile) this.inputMobile.value = user.mobile || "";
    if (this.inputStatus) this.inputStatus.value = user.status || "Active";
  }

  /**
   * Update header elements after profile update.
   *
   * @param {Object} updatedUser
   */
  updateHeader(updatedUser = {}) {
    const firstName = updatedUser.first_name || "";
    const lastName = updatedUser.last_name || "";
    const fullName = updatedUser.full_name || `${firstName} ${lastName}`.trim();

    if (this.displayNameEl && fullName) this.displayNameEl.textContent = fullName;
    if (this.metaMobileEl && updatedUser.mobile) this.metaMobileEl.textContent = updatedUser.mobile;

    if (this.avatarCircle) {
      const firstInitial = firstName.charAt(0) || "U";
      const secondInitial = lastName.charAt(0) || "";
      this.avatarCircle.textContent = (firstInitial + secondInitial).toUpperCase();
    }
  }
}

export default ProfileHeaderHandler;
