/**
 * View User Profile, Login/Logout History, Activity Log & Password Reset Modal
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

import { RequestHandler } from "../../../core/RequestHandler.js";

/**
 * Standard System Modules metadata with icons, brand accent colors, and descriptive subtitles.
 */
const SYSTEM_MODULES_CONFIG = {
  1: {
    name: "Dashboard & Analytics",
    icon: "fa-solid fa-gauge-high",
    color: "#1677ff",
    desc: "Executive KPIs, sales metrics, job charts and revenue summaries",
  },
  2: {
    name: "Print Jobs & Production",
    icon: "fa-solid fa-print",
    color: "#0284c7",
    desc: "Production queues, print machines, dimensions and job status tracking",
  },
  3: {
    name: "Design Management",
    icon: "fa-solid fa-pen-ruler",
    color: "#9333ea",
    desc: "Design approvals, artwork file revisions and creative workflows",
  },
  4: {
    name: "Place Order & Costing",
    icon: "fa-solid fa-cart-plus",
    color: "#f59e0b",
    desc: "Square footage pricing, job estimate calculations and order intake",
  },
  5: {
    name: "Customer Management",
    icon: "fa-solid fa-users",
    color: "#10b981",
    desc: "Customer profiles, contact phone numbers and credit balances",
  },
  6: {
    name: "Quotations & Invoices",
    icon: "fa-solid fa-file-invoice",
    color: "#06b6d4",
    desc: "Price quotations, commercial invoices and payment receipts",
  },
  7: {
    name: "Stock & Material Inventory",
    icon: "fa-solid fa-boxes-stacked",
    color: "#d97706",
    desc: "Banners, vinyls, inks, sheets, batch stocks and minimum alert limits",
  },
  8: {
    name: "GRN & Purchase Orders",
    icon: "fa-solid fa-clipboard-list",
    color: "#4f46e5",
    desc: "Supplier purchase orders (PO), Goods Received Notes (GRN) and material intake",
  },
  9: {
    name: "Payments & Financials",
    icon: "fa-solid fa-money-bill-transfer",
    color: "#16a34a",
    desc: "Job customer payments, GRN supplier settlement and shop expenses",
  },
  10: {
    name: "Management Reports",
    icon: "fa-solid fa-chart-pie",
    color: "#e11d48",
    desc: "Sales revenue, cash flow, stock consumption and production audit reports",
  },
  11: {
    name: "User Control & Permissions",
    icon: "fa-solid fa-user-shield",
    color: "#7c3aed",
    desc: "Staff user profiles, admin access privileges and granular security rules",
  },
  12: {
    name: "System Settings",
    icon: "fa-solid fa-gear",
    color: "#475569",
    desc: "Printers, media dimensions, costing rules and system configuration",
  },
};

export class ViewUserProfileModal {
  /**
   * @param {Object} options
   * @param {Object} options.adminVerifyModal - Instance of AdminVerifyModal for verifying admin credentials
   * @param {Function} [options.onManagePermissions] - Callback to jump to Permissions Matrix for this user
   * @param {Function} [options.onShowToast] - Callback to display toast notifications
   */
  constructor(options = {}) {
    this.http = new RequestHandler();
    this.adminVerifyModal = options.adminVerifyModal;
    this.onManagePermissions = options.onManagePermissions || (() => {});
    this.showToast = options.onShowToast || (() => {});

    this.overlay = document.getElementById("modalViewUserProfile");
    this.currentUserId = null;
    this.profileData = null;
    this.isUpdatingPassword = false;

    // Tab buttons & panes
    this.tabBtns = this.overlay ? this.overlay.querySelectorAll(".upm-tab-btn") : [];
    this.tabPanes = this.overlay ? this.overlay.querySelectorAll(".upm-tab-pane") : [];

    // Permissions filter & search controls
    this.permSearchInput = document.getElementById("upModalPermSearch");
    this.permFilterGroup = document.getElementById("upmPermFilterGroup");
    this.activePermFilter = "ALL";
    this.permSearchTerm = "";

    // Activity search & filter controls
    this.activitySearchInput = document.getElementById("upModalActivitySearch");
    this.activityActorFilter = document.getElementById("upModalActivityFilter");

    // Password change form controls
    this.passwordForm = document.getElementById("formAdminResetUserPassword");
    this.newPassInput = document.getElementById("upModalNewPassword");
    this.confirmPassInput = document.getElementById("upModalConfirmPassword");
    this.passErrorBox = document.getElementById("upModalPasswordError");
    this.passSuccessBox = document.getElementById("upModalPasswordSuccess");
    this.savePassBtn = document.getElementById("btnUpModalSavePassword");

    this.bindEvents();
  }

  bindEvents() {
    if (!this.overlay) return;

    // Close triggers
    this.overlay.querySelectorAll(".upm-close-trigger").forEach((btn) => {
      btn.addEventListener("click", () => this.close());
    });

    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Tab switching
    this.tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-upm-tab");
        this.switchTab(targetTab);
      });
    });

    // Refresh button
    const refreshBtn = document.getElementById("btnUpModalRefresh");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        if (this.currentUserId) {
          this.fetchUserProfile(this.currentUserId);
        }
      });
    }

    // Manage Permissions button inside overview tab
    const managePermsBtn = document.getElementById("btnUpModalManagePerms");
    if (managePermsBtn) {
      managePermsBtn.addEventListener("click", () => {
        const userId = this.currentUserId;
        if (userId) {
          this.close();
          this.onManagePermissions(userId);
        }
      });
    }

    // Permissions table search and filter
    if (this.permSearchInput) {
      this.permSearchInput.addEventListener("input", (e) => {
        this.permSearchTerm = (e.target.value || "").trim().toLowerCase();
        this.renderPermissionsGrid();
      });
    }

    if (this.permFilterGroup) {
      this.permFilterGroup.querySelectorAll(".upm-filter-pill").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.permFilterGroup.querySelectorAll(".upm-filter-pill").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          this.activePermFilter = btn.getAttribute("data-filter") || "ALL";
          this.renderPermissionsGrid();
        });
      });
    }

    // Activity search and filter
    if (this.activitySearchInput) {
      this.activitySearchInput.addEventListener("input", () => this.renderActivitiesTable());
    }
    if (this.activityActorFilter) {
      this.activityActorFilter.addEventListener("change", () => this.renderActivitiesTable());
    }

    // Show/hide password toggles
    this.overlay.querySelectorAll(".upm-toggle-pass").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-target");
        const input = document.getElementById(targetId);
        if (!input) return;
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        btn.innerHTML = isPassword
          ? '<i class="fa-solid fa-eye-slash"></i>'
          : '<i class="fa-solid fa-eye"></i>';
      });
    });

    // Password change form submission with mandatory Admin Verification
    if (this.passwordForm) {
      this.passwordForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handlePasswordChangeSubmit();
      });
    }
  }

  switchTab(tabId) {
    this.tabBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-upm-tab") === tabId);
    });
    this.tabPanes.forEach((pane) => {
      pane.classList.toggle("active", pane.id === tabId);
    });
  }

  open(userId, initialTab = "upModalPaneOverview") {
    if (!this.overlay || !userId) return;
    this.currentUserId = Number(userId);
    this.resetPasswordForm();

    if (this.permSearchInput) this.permSearchInput.value = "";
    this.permSearchTerm = "";
    this.activePermFilter = "ALL";
    if (this.permFilterGroup) {
      this.permFilterGroup.querySelectorAll(".upm-filter-pill").forEach((b) => {
        b.classList.toggle("active", b.getAttribute("data-filter") === "ALL");
      });
    }

    if (this.activitySearchInput) this.activitySearchInput.value = "";
    if (this.activityActorFilter) this.activityActorFilter.value = "ALL";

    this.switchTab(initialTab);
    this.overlay.classList.add("active");
    this.setLoadingState();
    this.fetchUserProfile(this.currentUserId);
  }

  close() {
    if (!this.overlay) return;
    this.overlay.classList.remove("active");
    this.resetPasswordForm();
  }

  resetPasswordForm() {
    if (this.passwordForm) this.passwordForm.reset();
    if (this.newPassInput) this.newPassInput.type = "password";
    if (this.confirmPassInput) this.confirmPassInput.type = "password";
    if (this.passErrorBox) {
      this.passErrorBox.style.display = "none";
      this.passErrorBox.textContent = "";
    }
    if (this.passSuccessBox) {
      this.passSuccessBox.style.display = "none";
      this.passSuccessBox.textContent = "";
    }
  }

  setLoadingState() {
    const setElText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setElText("upModalFullName", "Loading user profile...");
    setElText("upModalUsername", "@...");
    setElText("upModalMetaMobile", "—");
    setElText("upModalMetaRegistered", "—");
    setElText("upModalMetaLoginsCount", "—");
    setElText("upModalMetaActivitiesCount", "—");
    setElText("upModalMetaModulesCount", "—");
    setElText("upModalBadgeLogins", "0");
    setElText("upModalBadgeActivities", "0");
    setElText("upmPermCountAll", "0");
    setElText("upmPermCountGranted", "0");
    setElText("upmPermCountRestricted", "0");

    const permsGrid = document.getElementById("upModalPermissionsGrid");
    if (permsGrid) {
      permsGrid.innerHTML = `
        <div class="upm-perm-empty">
          <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px; display: block; color: #1677ff;"></i>
          Loading assigned module permissions...
        </div>
      `;
    }

    const loginsBody = document.getElementById("upModalLoginsTableBody");
    if (loginsBody) {
      loginsBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 28px; color: var(--text-muted, #64748b);">
            <i class="fa-solid fa-spinner fa-spin" style="margin-right: 6px;"></i> Loading login & logout history...
          </td>
        </tr>
      `;
    }

    const activitiesBody = document.getElementById("upModalActivitiesTableBody");
    if (activitiesBody) {
      activitiesBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 28px; color: var(--text-muted, #64748b);">
            <i class="fa-solid fa-spinner fa-spin" style="margin-right: 6px;"></i> Loading user activity details...
          </td>
        </tr>
      `;
    }
  }

  async fetchUserProfile(userId) {
    try {
      const response = await this.http.get(`/admin/users/${userId}/profile`);
      if (response && response.success && response.data) {
        this.profileData = response.data;
        this.renderProfile(this.profileData);
      } else {
        throw new Error(response?.message || "Failed to load user profile.");
      }
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Failed to load user profile data.";
      this.showToast(msg, "danger");
    }
  }

  renderProfile(data) {
    if (!data) return;

    const initials = (
      (data.first_name?.[0] || "") + (data.last_name?.[0] || data.username?.[0] || "U")
    ).toUpperCase();

    const setElText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    // Header
    setElText("upModalAvatar", initials || "U");
    setElText("upModalFullName", data.full_name || data.username || "Staff User");
    setElText("upModalUsername", `@${data.username || "user"}`);
    setElText("upModalUserIdBadge", `ID #${data.id}`);

    // Status badge
    const statusBadge = document.getElementById("upModalStatusBadge");
    if (statusBadge) {
      const isActive = String(data.status).toLowerCase() === "active";
      statusBadge.className = `ant-tag ${isActive ? "ant-tag-green" : "ant-tag-default"}`;
      statusBadge.innerHTML = `<i class="fa-solid fa-circle" style="font-size: 6px;"></i> ${this.escapeHtml(data.status || "Active")}`;
    }

    // Online / Offline session badge
    const sessionBadge = document.getElementById("upModalSessionBadge");
    if (sessionBadge) {
      const isOnline = Boolean(data.is_login);
      sessionBadge.className = `ant-tag ${isOnline ? "ant-tag-blue" : "ant-tag-default"}`;
      sessionBadge.innerHTML = isOnline
        ? '<i class="fa-solid fa-wifi" style="font-size: 10px;"></i> Online Session'
        : '<i class="fa-solid fa-power-off" style="font-size: 10px;"></i> Offline';
    }

    // Summary Strip
    const loginsList = Array.isArray(data.logins) ? data.logins : [];
    const activitiesList = Array.isArray(data.activities) ? data.activities : [];
    const modulesList = Array.isArray(data.modules) ? data.modules : [];

    const activeModules = modulesList.filter(
      (m) => m.view || m.create || m.edit || m.delete || m.export
    );
    const restrictedCount = modulesList.length - activeModules.length;

    const regDateShort = data.register_at ? String(data.register_at).split(" ")[0] : "—";

    setElText("upModalMetaMobile", data.mobile || "—");
    setElText("upModalMetaRegistered", regDateShort);
    setElText("upModalMetaLoginsCount", `${data.logins_count ?? loginsList.length} Sessions`);
    setElText("upModalMetaActivitiesCount", `${data.activities_count ?? activitiesList.length} Logs`);
    setElText("upModalMetaModulesCount", `${activeModules.length} Active / ${modulesList.length} Modules`);

    setElText("upModalBadgeLogins", String(loginsList.length));
    setElText("upModalBadgeActivities", String(activitiesList.length));

    // Update filter counts
    setElText("upmPermCountAll", String(modulesList.length));
    setElText("upmPermCountGranted", String(activeModules.length));
    setElText("upmPermCountRestricted", String(restrictedCount));

    // Tab 1: Personal Details & Assigned Permissions
    setElText("upModalDetailId", `#${data.id}`);
    setElText("upModalDetailFirstName", data.first_name || "—");
    setElText("upModalDetailLastName", data.last_name || "—");
    setElText("upModalDetailUsername", `@${data.username}`);
    setElText("upModalDetailMobile", data.mobile || "—");
    setElText("upModalDetailStatus", data.status || "Active");
    setElText("upModalDetailRegistered", data.register_at || "—");
    setElText("upModalDetailSession", data.is_login ? "Currently Logged In (Online)" : "Logged Out (Offline)");

    // Password tab target label
    setElText("upModalPassTargetUser", `${data.full_name} (@${data.username})`);

    this.renderPermissionsGrid();
    this.renderLoginsTable(loginsList);
    this.renderActivitiesTable();
  }

  /**
   * Resolve rich metadata (icon, color, display name, description) for a system module.
   */
  getModuleMeta(mod) {
    if (mod.id && SYSTEM_MODULES_CONFIG[mod.id]) {
      return SYSTEM_MODULES_CONFIG[mod.id];
    }

    const cleanName = String(mod.name || "").toLowerCase();
    for (const id in SYSTEM_MODULES_CONFIG) {
      const cfg = SYSTEM_MODULES_CONFIG[id];
      if (
        cfg.name.toLowerCase().includes(cleanName) ||
        cleanName.includes(cfg.name.toLowerCase()) ||
        cleanName.replace(/[^a-z]/g, "") === cfg.name.toLowerCase().replace(/[^a-z]/g, "")
      ) {
        return cfg;
      }
    }

    return {
      name: mod.name || "System Module",
      icon: "fa-solid fa-cube",
      color: "#1677ff",
      desc: "System operational module privileges and access controls",
    };
  }

  /**
   * Render neatly structured Permissions Cards Grid with filters and action pills.
   */
  renderPermissionsGrid() {
    const container = document.getElementById("upModalPermissionsGrid");
    if (!container || !this.profileData) return;

    const modules = Array.isArray(this.profileData.modules) ? this.profileData.modules : [];
    const search = this.permSearchTerm;
    const filter = this.activePermFilter;

    const filtered = modules.filter((mod) => {
      const meta = this.getModuleMeta(mod);
      const isGranted = Boolean(mod.view || mod.create || mod.edit || mod.delete || mod.export);

      if (filter === "GRANTED" && !isGranted) return false;
      if (filter === "RESTRICTED" && isGranted) return false;

      if (search) {
        const matchName = meta.name.toLowerCase().includes(search);
        const matchDesc = meta.desc.toLowerCase().includes(search);
        const matchRaw = String(mod.name || "").toLowerCase().includes(search);
        if (!matchName && !matchDesc && !matchRaw) return false;
      }

      return true;
    });

    if (!filtered.length) {
      container.innerHTML = `
        <div class="upm-perm-empty">
          <i class="fa-solid fa-filter-circle-xmark" style="font-size: 26px; display: block; margin-bottom: 8px; opacity: 0.5;"></i>
          No module permissions match the selected filter or search keyword.
        </div>
      `;
      return;
    }

    const renderPill = (isAllowed, actionKey, label) => {
      const actionClass = `upm-pill-${actionKey.toLowerCase()}`;
      const stateClass = isAllowed ? "upm-pill-active" : "upm-pill-inactive";
      const iconClass = isAllowed ? "fa-check" : "fa-xmark";
      return `
        <span class="upm-pill ${actionClass} ${stateClass}">
          <i class="fa-solid ${iconClass}"></i> ${label}
        </span>
      `;
    };

    container.innerHTML = filtered
      .map((mod) => {
        const meta = this.getModuleMeta(mod);
        const activeCount = [mod.view, mod.create, mod.edit, mod.delete, mod.export].filter(Boolean).length;
        const isRestricted = activeCount === 0;

        let statusTag = "";
        if (activeCount === 5) {
          statusTag = '<span class="ant-tag ant-tag-green"><i class="fa-solid fa-circle-check"></i> Full Access</span>';
        } else if (activeCount > 0 && mod.view && activeCount === 1) {
          statusTag = '<span class="ant-tag ant-tag-blue"><i class="fa-solid fa-eye"></i> View Only</span>';
        } else if (activeCount > 0) {
          statusTag = `<span class="ant-tag ant-tag-purple"><i class="fa-solid fa-sliders"></i> Custom (${activeCount}/5)</span>`;
        } else {
          statusTag = '<span class="ant-tag ant-tag-default" style="color: #94a3b8;"><i class="fa-solid fa-ban"></i> Restricted</span>';
        }

        return `
          <div class="upm-perm-card ${isRestricted ? "upm-card-restricted" : ""}">
            <div class="upm-perm-card-header">
              <div class="upm-perm-title">
                <div class="upm-perm-icon" style="background: ${meta.color}15; color: ${meta.color};">
                  <i class="${meta.icon}"></i>
                </div>
                <div>
                  <strong class="upm-perm-name">${this.escapeHtml(meta.name)}</strong>
                  <span class="upm-perm-desc">${this.escapeHtml(meta.desc)}</span>
                </div>
              </div>
              <div>${statusTag}</div>
            </div>
            <div class="upm-perm-pills">
              ${renderPill(mod.view, "view", "View")}
              ${renderPill(mod.create, "create", "Create")}
              ${renderPill(mod.edit, "edit", "Edit")}
              ${renderPill(mod.delete, "delete", "Delete")}
              ${renderPill(mod.export, "export", "Export")}
            </div>
          </div>
        `;
      })
      .join("");
  }


  renderLoginsTable(logins = []) {
    const tbody = document.getElementById("upModalLoginsTableBody");
    if (!tbody) return;

    if (!logins.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 32px; color: var(--text-muted, #94a3b8);">
            <i class="fa-solid fa-clock-rotate-left" style="font-size: 22px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
            No login or logout records found for this user.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = logins
      .map((item) => {
        const isActive = Boolean(item.is_active);
        const loginTimeHtml = item.login
          ? `<span class="upm-time-cell"><i class="fa-solid fa-right-to-bracket" style="color: #16a34a;"></i> ${this.escapeHtml(item.login)}</span>`
          : "—";

        const logoutTimeHtml = item.logout
          ? `<span class="upm-time-cell"><i class="fa-solid fa-right-from-bracket" style="color: #64748b;"></i> ${this.escapeHtml(item.logout)}</span>`
          : `<span style="color: #16a34a; font-weight: 600; font-size: 12px;"><i class="fa-solid fa-circle-dot"></i> Active Session</span>`;

        const statusBadge = isActive
          ? `<span class="ant-tag ant-tag-green"><i class="fa-solid fa-circle" style="font-size: 6px;"></i> Active</span>`
          : `<span class="ant-tag ant-tag-default"><i class="fa-solid fa-check" style="font-size: 9px;"></i> Logged Out</span>`;

        return `
          <tr>
            <td style="font-family: monospace; font-weight: 600; color: var(--text-muted, #64748b);">#${item.id}</td>
            <td>${loginTimeHtml}</td>
            <td>${logoutTimeHtml}</td>
            <td><span class="upm-duration-pill">${this.escapeHtml(item.duration || "—")}</span></td>
            <td>${statusBadge}</td>
          </tr>
        `;
      })
      .join("");
  }

  renderActivitiesTable() {
    const tbody = document.getElementById("upModalActivitiesTableBody");
    if (!tbody) return;

    const allActivities = Array.isArray(this.profileData?.activities) ? this.profileData.activities : [];
    const query = this.activitySearchInput ? this.activitySearchInput.value.trim().toLowerCase() : "";
    const actorFilter = this.activityActorFilter ? this.activityActorFilter.value : "ALL";

    let filtered = allActivities;

    if (actorFilter !== "ALL") {
      filtered = filtered.filter((a) => String(a.actor_type).toLowerCase() === actorFilter.toLowerCase());
    }

    if (query) {
      filtered = filtered.filter(
        (a) =>
          String(a.type || "").toLowerCase().includes(query) ||
          String(a.message || "").toLowerCase().includes(query) ||
          String(a.id || "").toLowerCase().includes(query) ||
          String(a.actor_name || "").toLowerCase().includes(query)
      );
    }

    if (!filtered.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 32px; color: var(--text-muted, #94a3b8);">
            <i class="fa-solid fa-clipboard-list" style="font-size: 22px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
            No user activity records found matching your criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered
      .map((act) => {
        const rowClass = this.getActivityRowClass(act.type);
        const typeBadgeClass = this.getActivityTypeTagClass(act.type);
        const typeIcon = this.getActivityTypeIcon(act.type);
        const isByAdmin = String(act.actor_type).toLowerCase() === "admin";
        const actorBadge = isByAdmin
          ? `<span class="ant-tag ant-tag-purple"><i class="fa-solid fa-user-shield" style="font-size: 10px;"></i> ${this.escapeHtml(act.actor_name)} (Admin)</span>`
          : `<span class="ant-tag ant-tag-blue"><i class="fa-solid fa-user" style="font-size: 10px;"></i> ${this.escapeHtml(act.actor_name)} (User)</span>`;

        return `
          <tr class="upm-activity-row ${rowClass}">
            <td style="font-family: monospace; font-size: 12px; font-weight: 600; color: var(--text-muted, #64748b);">
              ${this.escapeHtml(act.id || "—")}
            </td>
            <td style="white-space: nowrap; font-size: 12.5px;">
              <i class="fa-regular fa-clock" style="color: #94a3b8; margin-right: 4px;"></i>
              ${this.escapeHtml(act.timestamp || "—")}
            </td>
            <td>
              <span class="ant-tag ${typeBadgeClass}">
                <i class="fa-solid ${typeIcon}" style="font-size: 10.5px; margin-right: 4px;"></i>
                ${this.escapeHtml(act.type || "Activity")}
              </span>
            </td>
            <td style="font-size: 13px; color: var(--text, #1e293b); line-height: 1.45;">
              ${this.escapeHtml(act.message || "—")}
            </td>
            <td>${actorBadge}</td>
          </tr>
        `;
      })
      .join("");
  }

  getActivityRowClass(type = "") {
    const t = String(type).toLowerCase();
    if (t.includes("login")) return "upm-act-row-login";
    if (t.includes("logout")) return "upm-act-row-logout";
    if (t.includes("password")) return "upm-act-row-password";
    if (t.includes("permission")) return "upm-act-row-permission";
    if (t.includes("status")) return "upm-act-row-status";
    if (t.includes("print job") || t.includes("printjob")) return "upm-act-row-printjob";
    if (t.includes("create")) return "upm-act-row-create";
    if (t.includes("delete") || t.includes("remove")) return "upm-act-row-delete";
    return "upm-act-row-default";
  }

  getActivityTypeTagClass(type = "") {
    const t = String(type).toLowerCase();
    if (t.includes("login")) return "ant-tag-green";
    if (t.includes("logout")) return "ant-tag-orange";
    if (t.includes("password")) return "ant-tag-purple";
    if (t.includes("permission")) return "ant-tag-blue";
    if (t.includes("status")) return "ant-tag-orange";
    if (t.includes("print job") || t.includes("printjob")) return "ant-tag-cyan";
    if (t.includes("create")) return "ant-tag-green";
    if (t.includes("delete") || t.includes("remove")) return "ant-tag-red";
    return "ant-tag-default";
  }

  getActivityTypeIcon(type = "") {
    const t = String(type).toLowerCase();
    if (t.includes("login")) return "fa-right-to-bracket";
    if (t.includes("logout")) return "fa-right-from-bracket";
    if (t.includes("password")) return "fa-key";
    if (t.includes("permission")) return "fa-shield-halved";
    if (t.includes("status")) return "fa-user-gear";
    if (t.includes("print job") || t.includes("printjob")) return "fa-print";
    if (t.includes("create")) return "fa-user-plus";
    if (t.includes("delete") || t.includes("remove")) return "fa-trash-can";
    return "fa-clock-rotate-left";
  }

  handlePasswordChangeSubmit() {
    if (!this.currentUserId || this.isUpdatingPassword) return;

    const newPassword = this.newPassInput ? this.newPassInput.value : "";
    const confirmPassword = this.confirmPassInput ? this.confirmPassInput.value : "";

    if (this.passErrorBox) this.passErrorBox.style.display = "none";
    if (this.passSuccessBox) this.passSuccessBox.style.display = "none";

    if (!newPassword || newPassword.length < 6) {
      this.showPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      this.showPasswordError("New password and confirm password do not match.");
      return;
    }

    const targetUsername = this.profileData?.username || `User #${this.currentUserId}`;

    if (!this.adminVerifyModal) {
      this.showPasswordError("Admin security verification service is unavailable.");
      return;
    }

    // Trigger mandatory Admin Credential Verification before changing the user's password
    this.adminVerifyModal.requestPermission({
      description: `Changing the password for staff user '@${targetUsername}' requires administrator security verification. Please enter your administrator username and password to authorize this change.`,
      onSuccess: async (verifiedAdmin, credentials) => {
        await this.executePasswordChange(newPassword, confirmPassword, credentials);
      }
    });
  }

  async executePasswordChange(newPassword, confirmPassword, credentials = {}) {
    if (!this.currentUserId || this.isUpdatingPassword) return;
    this.isUpdatingPassword = true;

    const originalHtml = this.savePassBtn ? this.savePassBtn.innerHTML : "";
    if (this.savePassBtn) {
      this.savePassBtn.disabled = true;
      this.savePassBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating Password...';
    }

    try {
      const response = await this.http.put(`/admin/users/${this.currentUserId}/password`, {
        password: newPassword,
        password_confirmation: confirmPassword,
        admin_username: credentials.username,
        admin_password: credentials.password
      });

      if (response && response.success) {
        this.resetPasswordForm();
        const successMsg = response.message || "User password updated successfully!";
        if (this.passSuccessBox) {
          this.passSuccessBox.textContent = successMsg;
          this.passSuccessBox.style.display = "block";
        }
        this.showToast(successMsg, "success");

        // Refresh profile data so the new password change audit log appears in Activity Details
        await this.fetchUserProfile(this.currentUserId);
      } else {
        throw new Error(response?.message || "Failed to update user password.");
      }
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Failed to update user password.";
      this.showPasswordError(msg);
      this.showToast(msg, "danger");
    } finally {
      this.isUpdatingPassword = false;
      if (this.savePassBtn) {
        this.savePassBtn.disabled = false;
        this.savePassBtn.innerHTML = originalHtml;
      }
    }
  }

  showPasswordError(msg) {
    if (!this.passErrorBox) return;
    this.passErrorBox.textContent = msg;
    this.passErrorBox.style.display = "block";
  }

  escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
