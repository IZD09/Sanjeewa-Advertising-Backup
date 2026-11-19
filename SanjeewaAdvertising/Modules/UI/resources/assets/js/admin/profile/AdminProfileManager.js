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
    this.metaActivitiesCountEl = document.getElementById("adminMetaActivitiesCount");
    this.loginsTableBody = document.getElementById("adminLoginsTableBody");

    // Activity Tab Elements
    this.activitiesTableBody = document.getElementById("adminActivitiesTableBody");
    this.activitySearchInput = document.getElementById("adminActivitySearchInput");
    this.activityTypeSelect = document.getElementById("adminActivityTypeSelect");
    this.btnRefreshAdminActivities = document.getElementById("btnRefreshAdminActivities");
    this.activitiesCountInfo = document.getElementById("adminActivitiesCountInfo");
    this.btnAdminActPrev = document.getElementById("btnAdminActPrev");
    this.btnAdminActNext = document.getElementById("btnAdminActNext");
    this.actTabLockIcon = document.getElementById("actTabLockIcon");
    this.btnLockAdminActivities = document.getElementById("btnLockAdminActivities");

    // Activities Tab Permission Modal Elements
    this.actLockOverlay = document.getElementById("adminActivitiesVerifyModal");
    this.actLockForm = document.getElementById("formVerifyActivitiesAccess");
    this.actLockUsernameInput = document.getElementById("verifyActAdminUsername");
    this.actLockPasswordInput = document.getElementById("verifyActAdminPassword");
    this.actLockSubmitBtn = document.getElementById("btnSubmitActivitiesVerify");
    this.actLockError = document.getElementById("verifyActAccessError");
    this.btnCancelActivitiesVerify = document.getElementById("btnCancelActivitiesVerify");

    this.profActionWrap = document.getElementById("profActionWrap");

    this.activities = [];
    this.actCurrentPage = 1;
    this.actPageSize = 15;
    this.actSearchTerm = "";
    this.actTypeFilter = "ALL";
    this.hasVerifiedActivitiesAccess = false;
    this.currentTab = "tabProfileDetails";
    this.activitiesInactivityTimer = null;
    this.activitiesAwayTimer = null;
    this.activitiesLeftTimestamp = null;
    this.TIMEOUT_MS = 60000; // 1 minute auto-lock
    this.boundResetInactivity = () => this.resetActivitiesInactivity();

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

    // Activity tab search & filtering
    if (this.activitySearchInput) {
      this.activitySearchInput.addEventListener("input", (e) => {
        this.actSearchTerm = (e.target.value || "").trim().toLowerCase();
        this.actCurrentPage = 1;
        this.renderActivitiesTable();
      });
    }

    if (this.activityTypeSelect) {
      this.activityTypeSelect.addEventListener("change", (e) => {
        this.actTypeFilter = e.target.value || "ALL";
        this.actCurrentPage = 1;
        this.renderActivitiesTable();
      });
    }

    if (this.btnRefreshAdminActivities) {
      this.btnRefreshAdminActivities.addEventListener("click", () => {
        this.fetchActivities();
      });
    }

    if (this.btnAdminActPrev) {
      this.btnAdminActPrev.addEventListener("click", () => {
        if (this.actCurrentPage > 1) {
          this.actCurrentPage--;
          this.renderActivitiesTable();
        }
      });
    }

    if (this.btnAdminActNext) {
      this.btnAdminActNext.addEventListener("click", () => {
        this.actCurrentPage++;
        this.renderActivitiesTable();
      });
    }

    // Activities permission modal events
    if (this.actLockForm) {
      this.actLockForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleActivitiesVerify();
      });
    }

    if (this.btnCancelActivitiesVerify) {
      this.btnCancelActivitiesVerify.addEventListener("click", () => {
        this.closeActivitiesVerifyModal();
      });
    }

    if (this.btnLockAdminActivities) {
      this.btnLockAdminActivities.addEventListener("click", () => {
        this.lockActivitiesTab();
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

  openActivitiesVerifyModal() {
    if (!this.actLockOverlay) return;
    if (this.actLockForm) this.actLockForm.reset();
    if (this.actLockError) this.actLockError.style.display = "none";

    const defaultUser = this.verifiedAdmin?.username || window.__CURRENT_ADMIN_USERNAME__ || "";
    if (this.actLockUsernameInput) {
      this.actLockUsernameInput.value = defaultUser;
    }

    this.actLockOverlay.classList.add("active");
    setTimeout(() => {
      if (this.actLockPasswordInput) {
        this.actLockPasswordInput.focus();
      }
    }, 150);
  }

  closeActivitiesVerifyModal() {
    if (!this.actLockOverlay) return;
    this.actLockOverlay.classList.remove("active");
  }

  async handleActivitiesVerify() {
    const username = this.actLockUsernameInput?.value.trim() || this.verifiedAdmin?.username || window.__CURRENT_ADMIN_USERNAME__;
    const password = this.actLockPasswordInput?.value;

    if (!username || !password) {
      this.showActivitiesLockError("Please enter your administrator password.");
      return;
    }

    const origBtnHtml = this.actLockSubmitBtn ? this.actLockSubmitBtn.innerHTML : "";
    if (this.actLockSubmitBtn) {
      this.actLockSubmitBtn.disabled = true;
      this.actLockSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
    }
    if (this.actLockError) this.actLockError.style.display = "none";

    try {
      const response = await this.http.post("/admin/profile/verify", {
        username: username,
        password: password,
      });

      if (response && response.success) {
        this.hasVerifiedActivitiesAccess = true;
        this.activitiesLeftTimestamp = null;
        if (this.activitiesAwayTimer) {
          clearTimeout(this.activitiesAwayTimer);
          this.activitiesAwayTimer = null;
        }

        this.closeActivitiesVerifyModal();

        // Update lock icon on tab button
        if (this.actTabLockIcon) {
          this.actTabLockIcon.className = "fa-solid fa-lock-open";
          this.actTabLockIcon.style.color = "#52c41a";
          this.actTabLockIcon.title = "Permission granted";
        }

        this.switchTab("tabActivities");
        this.showToast("Activity audit permission verified & granted.", "success");

        // Refresh activities to ensure freshest data
        if (!this.activities || this.activities.length === 0) {
          this.fetchActivities();
        }
      } else {
        const msg = response?.message || "Invalid administrator password.";
        this.showActivitiesLockError(msg);
      }
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Failed to verify administrator password.";
      this.showActivitiesLockError(msg);
    } finally {
      if (this.actLockSubmitBtn) {
        this.actLockSubmitBtn.disabled = false;
        this.actLockSubmitBtn.innerHTML = origBtnHtml;
      }
    }
  }

  showActivitiesLockError(message) {
    if (!this.actLockError) return;
    this.actLockError.textContent = message;
    this.actLockError.style.display = "block";
    if (this.actLockPasswordInput) {
      this.actLockPasswordInput.value = "";
      this.actLockPasswordInput.focus();
    }
  }

  startActivitiesInactivityMonitoring() {
    this.stopActivitiesInactivityMonitoring();
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(evt => window.addEventListener(evt, this.boundResetInactivity, { passive: true }));
    this.activitiesInactivityTimer = setTimeout(() => {
      this.handleActivitiesInactivityTimeout();
    }, this.TIMEOUT_MS);
  }

  resetActivitiesInactivity() {
    if (this.currentTab !== "tabActivities") return;
    if (this.activitiesInactivityTimer) {
      clearTimeout(this.activitiesInactivityTimer);
    }
    this.activitiesInactivityTimer = setTimeout(() => {
      this.handleActivitiesInactivityTimeout();
    }, this.TIMEOUT_MS);
  }

  stopActivitiesInactivityMonitoring() {
    if (this.activitiesInactivityTimer) {
      clearTimeout(this.activitiesInactivityTimer);
      this.activitiesInactivityTimer = null;
    }
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(evt => window.removeEventListener(evt, this.boundResetInactivity));
  }

  handleActivitiesInactivityTimeout() {
    this.stopActivitiesInactivityMonitoring();
    this.lockActivitiesTab("Activities tab was automatically locked due to 1 minute of inactivity.");
  }

  handleActivitiesAwayTimeout() {
    if (this.activitiesAwayTimer) {
      clearTimeout(this.activitiesAwayTimer);
      this.activitiesAwayTimer = null;
    }
    this.hasVerifiedActivitiesAccess = false;
    this.activitiesLeftTimestamp = null;
    if (this.actTabLockIcon) {
      this.actTabLockIcon.className = "fa-solid fa-lock";
      this.actTabLockIcon.style.color = "#faad14";
      this.actTabLockIcon.title = "Permission required";
    }
    this.showToast("Activities tab session expired (away > 1 minute). Locked.", "warning");
  }

  lockActivitiesTab(message = "Activities tab has been locked.") {
    this.stopActivitiesInactivityMonitoring();
    if (this.activitiesAwayTimer) {
      clearTimeout(this.activitiesAwayTimer);
      this.activitiesAwayTimer = null;
    }
    this.activitiesLeftTimestamp = null;
    this.hasVerifiedActivitiesAccess = false;

    if (this.actTabLockIcon) {
      this.actTabLockIcon.className = "fa-solid fa-lock";
      this.actTabLockIcon.style.color = "#faad14";
      this.actTabLockIcon.title = "Permission required";
    }

    if (this.currentTab === "tabActivities") {
      this.switchTab("tabProfileDetails");
    }
    this.showToast(message, "warning");
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

    // Activities list
    const activities = Array.isArray(admin.activities) ? admin.activities : [];
    this.activities = activities;
    if (this.metaActivitiesCountEl) this.metaActivitiesCountEl.textContent = `${activities.length} recorded`;
    this.populateActivityTypeFilter();
    this.renderActivitiesTable();
  }

  populateActivityTypeFilter() {
    if (!this.activityTypeSelect) return;
    const currentVal = this.activityTypeSelect.value || "ALL";

    const types = new Set();
    this.activities.forEach(item => {
      if (item.type) types.add(item.type);
    });

    let optionsHtml = '<option value="ALL">All Activity Types</option>';
    Array.from(types).sort().forEach(type => {
      optionsHtml += `<option value="${type}" ${currentVal === type ? "selected" : ""}>${type}</option>`;
    });

    this.activityTypeSelect.innerHTML = optionsHtml;
  }

  async fetchActivities() {
    if (this.btnRefreshAdminActivities) {
      this.btnRefreshAdminActivities.disabled = true;
      this.btnRefreshAdminActivities.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Refreshing...';
    }

    try {
      const response = await this.http.get("/admin/profile/activities", { limit: 100 });
      if (response && response.success && Array.isArray(response.data)) {
        this.activities = response.data;
        if (this.metaActivitiesCountEl) this.metaActivitiesCountEl.textContent = `${this.activities.length} recorded`;
        this.populateActivityTypeFilter();
        this.renderActivitiesTable();
        this.showToast("Admin activities refreshed successfully.", "success");
      }
    } catch (err) {
      console.warn("[AdminProfileManager] Failed to fetch activities:", err);
      this.showToast("Failed to refresh activities.", "danger");
    } finally {
      if (this.btnRefreshAdminActivities) {
        this.btnRefreshAdminActivities.disabled = false;
        this.btnRefreshAdminActivities.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Refresh';
      }
    }
  }

  getActivityVisuals(item) {
    const type = String(item.type || "").toLowerCase();
    const action = String(item.action || "").toLowerCase();

    if (type.includes("login") || action.includes("login")) {
      return {
        rowClass: "upm-act-row-login",
        dotClass: "upm-dot-login",
        badgeClass: "ap-badge-green",
        icon: "fa-solid fa-right-to-bracket",
        iconColor: "#52c41a",
      };
    }
    if (type.includes("logout") || action.includes("logout")) {
      return {
        rowClass: "upm-act-row-logout",
        dotClass: "upm-dot-logout",
        badgeClass: "ap-badge-orange",
        icon: "fa-solid fa-right-from-bracket",
        iconColor: "#fa8c16",
      };
    }
    if (type.includes("permission") || action.includes("permission")) {
      return {
        rowClass: "upm-act-row-permission",
        dotClass: "upm-dot-permission",
        badgeClass: "ap-badge-blue",
        icon: "fa-solid fa-user-shield",
        iconColor: "#1677ff",
      };
    }
    if (
      type.includes("password") ||
      type.includes("security") ||
      type.includes("credential") ||
      action.includes("password") ||
      action.includes("security") ||
      action.includes("credential") ||
      action.includes("lock")
    ) {
      return {
        rowClass: "upm-act-row-security",
        dotClass: "upm-dot-security",
        badgeClass: "ap-badge-red",
        icon: "fa-solid fa-shield-halved",
        iconColor: "#ff4d4f",
      };
    }
    if (type.includes("user") || type.includes("admin") || type.includes("status")) {
      return {
        rowClass: "upm-act-row-status",
        dotClass: "upm-dot-status",
        badgeClass: "ap-badge-orange",
        icon: "fa-solid fa-user-gear",
        iconColor: "#faad14",
      };
    }

    return {
      rowClass: "",
      dotClass: "upm-dot-login",
      badgeClass: "ap-badge-purple",
      icon: "fa-solid fa-clock-rotate-left",
      iconColor: "#722ed1",
    };
  }

  formatRelativeTime(dateStr) {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMin = Math.round(diffMs / 60000);
      if (diffMin < 1) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.round(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.round(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-LK", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  }

  renderActivitiesTable() {
    if (!this.activitiesTableBody) return;

    // Filter
    let filtered = this.activities || [];
    if (this.actTypeFilter && this.actTypeFilter !== "ALL") {
      filtered = filtered.filter(item => String(item.type || "").toLowerCase() === this.actTypeFilter.toLowerCase());
    }

    if (this.actSearchTerm) {
      filtered = filtered.filter(item => {
        const text = `${item.id || ""} ${item.type || ""} ${item.action || ""} ${item.message || ""} ${JSON.stringify(item.details || {})}`.toLowerCase();
        return text.includes(this.actSearchTerm);
      });
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / this.actPageSize) || 1;
    if (this.actCurrentPage > totalPages) this.actCurrentPage = totalPages;
    if (this.actCurrentPage < 1) this.actCurrentPage = 1;

    const startIdx = (this.actCurrentPage - 1) * this.actPageSize;
    const pageItems = filtered.slice(startIdx, startIdx + this.actPageSize);

    if (this.activitiesCountInfo) {
      const from = total === 0 ? 0 : startIdx + 1;
      const to = Math.min(startIdx + this.actPageSize, total);
      this.activitiesCountInfo.textContent = `Showing ${from}-${to} of ${total} activities (Page ${this.actCurrentPage} of ${totalPages})`;
    }

    if (this.btnAdminActPrev) {
      this.btnAdminActPrev.disabled = this.actCurrentPage <= 1;
    }
    if (this.btnAdminActNext) {
      this.btnAdminActNext.disabled = this.actCurrentPage >= totalPages;
    }

    if (pageItems.length === 0) {
      this.activitiesTableBody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; color: var(--text-muted); padding: 36px 16px;">
            <div style="font-size: 28px; color: #cbd5e1; margin-bottom: 8px;">
              <i class="fa-solid fa-list-check"></i>
            </div>
            <div style="font-size: 14px; font-weight: 600; color: var(--text);">No activities recorded</div>
            <div style="font-size: 12px; margin-top: 4px;">No administrative activities match your current filter criteria.</div>
          </td>
        </tr>
      `;
      return;
    }

    this.activitiesTableBody.innerHTML = pageItems.map(item => {
      const visuals = this.getActivityVisuals(item);
      const relativeTime = this.formatRelativeTime(item.timestamp);
      const formattedTime = item.formatted_time || (item.timestamp ? new Date(item.timestamp).toLocaleString() : "—");

      // Build extra detail chips if available
      let detailChips = "";
      if (item.details && typeof item.details === "object") {
        const details = item.details;
        const chips = [];
        if (details.username) chips.push(`<span class="ant-tag" style="font-size: 11px;">User: @${details.username}</span>`);
        if (details.modules_count !== undefined) chips.push(`<span class="ant-tag ant-tag-blue" style="font-size: 11px;">${details.modules_count} modules</span>`);
        if (details.status) chips.push(`<span class="ant-tag ant-tag-orange" style="font-size: 11px;">Status: ${details.status}</span>`);
        if (details.ip_address) chips.push(`<span class="ant-tag" style="font-size: 11px;">IP: ${details.ip_address}</span>`);
        if (chips.length > 0) {
          detailChips = `<div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px;">${chips.join("")}</div>`;
        }
      }

      return `
        <tr class="upm-activity-row ${visuals.rowClass}">
          <td>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <span style="font-weight: 700; font-size: 12px; color: var(--text);">
                <i class="${visuals.icon}" style="color: ${visuals.iconColor}; margin-right: 6px;"></i>${item.id || "ACT"}
              </span>
              <span class="ap-badge ${visuals.badgeClass}" style="width: fit-content; font-size: 10.5px; padding: 2px 8px;">
                ${item.type || "Activity"}
              </span>
            </div>
          </td>
          <td>
            <div style="font-size: 13px; font-weight: 600; color: var(--text); line-height: 1.4;">
              ${item.message || item.action || "Administrative activity recorded."}
            </div>
            ${item.action && item.action !== item.message ? `<div style="font-size: 11.5px; color: var(--text-muted); font-family: monospace; margin-top: 2px;">action: ${item.action}</div>` : ""}
            ${detailChips}
          </td>
          <td>
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <span class="upm-time-cell">
                <i class="fa-regular fa-clock" style="color: #64748b; font-size: 11.5px;"></i>
                <span style="font-weight: 600; font-size: 12px;">${formattedTime}</span>
              </span>
              ${relativeTime ? `<span style="font-size: 11px; color: var(--text-muted);">${relativeTime}</span>` : ""}
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  switchTab(tabId) {
    // If leaving tabActivities to another tab
    if (this.currentTab === "tabActivities" && tabId !== "tabActivities") {
      this.stopActivitiesInactivityMonitoring();
      if (this.hasVerifiedActivitiesAccess) {
        this.activitiesLeftTimestamp = Date.now();
        if (this.activitiesAwayTimer) clearTimeout(this.activitiesAwayTimer);
        this.activitiesAwayTimer = setTimeout(() => {
          this.handleActivitiesAwayTimeout();
        }, this.TIMEOUT_MS);
      }
    }

    // If entering tabActivities
    if (tabId === "tabActivities") {
      // Check if permission expired while away (>= 1 minute)
      if (this.hasVerifiedActivitiesAccess && this.activitiesLeftTimestamp) {
        const elapsed = Date.now() - this.activitiesLeftTimestamp;
        if (elapsed >= this.TIMEOUT_MS) {
          this.handleActivitiesAwayTimeout();
        }
      }

      if (!this.hasVerifiedActivitiesAccess) {
        this.openActivitiesVerifyModal();
        return;
      }

      // Returned within 1 minute, keep active and start inactivity timer
      if (this.activitiesAwayTimer) {
        clearTimeout(this.activitiesAwayTimer);
        this.activitiesAwayTimer = null;
      }
      this.activitiesLeftTimestamp = null;
      this.startActivitiesInactivityMonitoring();
    }

    this.currentTab = tabId;

    this.tabBtns.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });

    this.tabPanes.forEach(pane => {
      pane.classList.toggle("active", pane.id === tabId);
    });

    // Hide Update Profile button on Recent Logins and Activities tabs
    if (this.profActionWrap) {
      const isFormTab = tabId === "tabProfileDetails" || tabId === "tabSecurity";
      this.profActionWrap.style.display = isFormTab ? "flex" : "none";
    }
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
