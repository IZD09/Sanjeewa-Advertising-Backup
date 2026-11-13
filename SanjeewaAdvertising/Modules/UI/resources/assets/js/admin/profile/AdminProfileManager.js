/**
 * Admin Profile Manager & Permission Verification Controller
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

import { RequestHandler } from "../../core/RequestHandler.js";

export class AdminProfileManager {
  constructor() {
    this.http = new RequestHandler();

    // DOM Elements
    this.lockOverlay = document.getElementById("adminProfileLockModal");
    this.lockForm = document.getElementById("formVerifyAdminAccess");
    this.lockUsernameInput = document.getElementById("verifyAdminUsername");
    this.lockPasswordInput = document.getElementById("verifyAdminPassword");
    this.lockSubmitBtn = document.getElementById("btnVerifyAccessSubmit");
    this.lockError = document.getElementById("verifyAccessError");
    this.btnCancelVerify = document.getElementById("btnCancelVerify");

    this.profileContent = document.getElementById("adminProfileContent");
    this.formUpdateProfile = document.getElementById("formUpdateProfile");
    this.btnSaveProfile = document.getElementById("btnSaveProfile");
    this.toastEl = document.getElementById("apToast");

    this.tabBtns = document.querySelectorAll(".ap-tab-btn");
    this.tabPanes = document.querySelectorAll(".ap-tab-pane");

    // Profile Display Elements
    this.avatarCircle = document.getElementById("adminAvatarCircle");
    this.displayNameEl = document.getElementById("adminDisplayName");
    this.displayUsernameEl = document.getElementById("adminDisplayUsername");
    this.badgeRoleEl = document.getElementById("adminBadgeRole");
    this.badgeStatusEl = document.getElementById("adminBadgeStatus");
    this.metaEmailEl = document.getElementById("adminMetaEmail");
    this.metaMobileEl = document.getElementById("adminMetaMobile");
    this.metaAddedEl = document.getElementById("adminMetaAdded");
    this.metaLoginsCountEl = document.getElementById("adminMetaLoginsCount");
    this.loginsTableBody = document.getElementById("adminLoginsTableBody");

    // Form inputs
    this.inputFirstName = document.getElementById("profFirstName");
    this.inputLastName = document.getElementById("profLastName");
    this.inputUsername = document.getElementById("profUsername");
    this.inputEmail = document.getElementById("profEmail");
    this.inputMobile = document.getElementById("profMobile");
    this.inputRole = document.getElementById("profRole");
    this.inputStatus = document.getElementById("profStatus");
    this.inputCurrentPass = document.getElementById("profCurrentPassword");
    this.inputNewPass = document.getElementById("profNewPassword");
    this.inputConfirmPass = document.getElementById("profConfirmPassword");

    this.verifiedAdmin = null;

    this.bindEvents();
    this.init();
  }

  init() {
    // Every time admin arrives here, prompt for permission/credentials modal
    this.openLockModal();
  }

  bindEvents() {
    if (this.lockForm) {
      this.lockForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleVerify();
      });
    }

    if (this.btnCancelVerify) {
      this.btnCancelVerify.addEventListener("click", () => {
        // Redirect back to dashboard if user cancels verification
        window.location.href = "/admin/dashboard";
      });
    }

    // Tabs navigation
    this.tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-tab");
        this.switchTab(targetTab);
      });
    });

    // Profile form submit
    if (this.formUpdateProfile) {
      this.formUpdateProfile.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleProfileUpdate();
      });
    }
  }

  openLockModal() {
    if (!this.lockOverlay) return;
    if (this.lockForm) this.lockForm.reset();
    if (this.lockError) this.lockError.style.display = "none";

    // Auto-fill logged in username if already present in session/page
    const pageUser = document.getElementById("profileDropdownToggle")?.querySelector(".profile-name")?.textContent?.trim() || "";
    if (this.lockUsernameInput && !this.lockUsernameInput.value) {
      const defaultUser = window.__CURRENT_ADMIN_USERNAME__ || "";
      if (defaultUser) {
        this.lockUsernameInput.value = defaultUser;
      }
    }

    this.lockOverlay.classList.add("active");
    if (this.profileContent) {
      this.profileContent.style.filter = "blur(6px)";
      this.profileContent.style.pointerEvents = "none";
    }

    setTimeout(() => {
      if (this.lockUsernameInput && !this.lockUsernameInput.value) {
        this.lockUsernameInput.focus();
      } else if (this.lockPasswordInput) {
        this.lockPasswordInput.focus();
      }
    }, 150);
  }

  closeLockModal() {
    if (!this.lockOverlay) return;
    this.lockOverlay.classList.remove("active");
    if (this.profileContent) {
      this.profileContent.style.filter = "none";
      this.profileContent.style.pointerEvents = "auto";
    }
  }

  async handleVerify() {
    const username = this.lockUsernameInput?.value.trim();
    const password = this.lockPasswordInput?.value;

    if (!username || !password) {
      this.showLockError("Please enter both username and password.");
      return;
    }

    const originalBtnHtml = this.lockSubmitBtn ? this.lockSubmitBtn.innerHTML : "";
    if (this.lockSubmitBtn) {
      this.lockSubmitBtn.disabled = true;
      this.lockSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
    }
    if (this.lockError) this.lockError.style.display = "none";

    try {
      const response = await this.http.post("/admin/profile/verify", {
        username: username,
        password: password
      });

      if (response && response.success && response.data?.admin) {
        this.verifiedAdmin = response.data.admin;
        this.closeLockModal();
        this.renderAdminProfile(this.verifiedAdmin);
        this.showToast("Identity verified successfully. Welcome to Admin Profile!", "success");
      } else {
        const msg = response?.message || "Invalid administrator credentials.";
        this.showLockError(msg);
      }
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Failed to verify credentials. Access denied.";
      this.showLockError(msg);
    } finally {
      if (this.lockSubmitBtn) {
        this.lockSubmitBtn.disabled = false;
        this.lockSubmitBtn.innerHTML = originalBtnHtml;
      }
    }
  }

  showLockError(message) {
    if (!this.lockError) return;
    this.lockError.textContent = message;
    this.lockError.style.display = "block";
    if (this.lockPasswordInput) {
      this.lockPasswordInput.value = "";
      this.lockPasswordInput.focus();
    }
  }

  renderAdminProfile(admin) {
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
      this.metaAddedEl.textContent = admin.add_time ? new Date(admin.add_time).toLocaleDateString("en-LK", { dateStyle: "medium" }) : "—";
    }

    // Populate inputs
    if (this.inputFirstName) this.inputFirstName.value = admin.first_name || "";
    if (this.inputLastName) this.inputLastName.value = admin.last_name || "";
    if (this.inputUsername) this.inputUsername.value = admin.username || "";
    if (this.inputEmail) this.inputEmail.value = admin.email || "";
    if (this.inputMobile) this.inputMobile.value = admin.mobile || "";
    if (this.inputRole) this.inputRole.value = roleName;
    if (this.inputStatus) this.inputStatus.value = statusName;

    // Logins list
    const logins = Array.isArray(admin.logins) ? admin.logins : [];
    if (this.metaLoginsCountEl) this.metaLoginsCountEl.textContent = `${logins.length} recorded`;

    if (this.loginsTableBody) {
      if (logins.length === 0) {
        this.loginsTableBody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align: center; color: #94a3b8; padding: 24px;">
              No login sessions recorded.
            </td>
          </tr>
        `;
      } else {
        this.loginsTableBody.innerHTML = logins.map(log => `
          <tr>
            <td><strong>#${log.id}</strong></td>
            <td><i class="fa-regular fa-clock" style="margin-right: 6px; color: #1677ff;"></i>${log.login ? new Date(log.login).toLocaleString() : '—'}</td>
            <td>${log.logout ? new Date(log.logout).toLocaleString() : '<span class="ant-tag ant-tag-blue">Active Session</span>'}</td>
            <td><span class="ant-tag ant-tag-green">Success</span></td>
          </tr>
        `).join("");
      }
    }
  }

  switchTab(tabId) {
    this.tabBtns.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });

    this.tabPanes.forEach(pane => {
      pane.classList.toggle("active", pane.id === tabId);
    });
  }

  async handleProfileUpdate() {
    if (!this.verifiedAdmin) {
      this.showToast("Please verify credentials first.", "danger");
      return;
    }

    const firstName = this.inputFirstName?.value.trim();
    const lastName = this.inputLastName?.value.trim();
    const email = this.inputEmail?.value.trim();
    const mobile = this.inputMobile?.value.trim();

    const currentPass = this.inputCurrentPass?.value;
    const newPass = this.inputNewPass?.value;
    const confirmPass = this.inputConfirmPass?.value;

    if (!firstName || !lastName || !email || !mobile) {
      alert("Please fill in all profile fields.");
      return;
    }

    if (newPass) {
      if (!currentPass) {
        alert("Please enter your current password to set a new password.");
        return;
      }
      if (newPass.length < 6) {
        alert("New password must be at least 6 characters long.");
        return;
      }
      if (newPass !== confirmPass) {
        alert("New password and confirm password do not match.");
        return;
      }
    }

    const originalBtnHtml = this.btnSaveProfile ? this.btnSaveProfile.innerHTML : "";
    if (this.btnSaveProfile) {
      this.btnSaveProfile.disabled = true;
      this.btnSaveProfile.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }

    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        mobile: mobile,
      };

      if (newPass) {
        payload.current_password = currentPass;
        payload.password = newPass;
        payload.password_confirmation = confirmPass;
      }

      const response = await this.http.put("/admin/profile", payload);

      if (response && response.success && response.data) {
        this.verifiedAdmin = { ...this.verifiedAdmin, ...response.data };
        this.renderAdminProfile(this.verifiedAdmin);

        if (this.inputCurrentPass) this.inputCurrentPass.value = "";
        if (this.inputNewPass) this.inputNewPass.value = "";
        if (this.inputConfirmPass) this.inputConfirmPass.value = "";

        this.showToast("Profile details updated successfully!", "success");
      } else {
        alert(response?.message || "Failed to update profile.");
      }
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Failed to update profile details.";
      alert(msg);
    } finally {
      if (this.btnSaveProfile) {
        this.btnSaveProfile.disabled = false;
        this.btnSaveProfile.innerHTML = originalBtnHtml;
      }
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

// Auto-boot when loaded on admin profile page
const bootAdminProfile = () => {
  const container = document.getElementById("module-admin-profile");
  if (container) {
    window.adminProfileManager = new AdminProfileManager();
  }
};

bootAdminProfile();
document.addEventListener("DOMContentLoaded", bootAdminProfile);
document.addEventListener("turbo:load", bootAdminProfile);
