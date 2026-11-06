/**
 * User Control Data Loader & State Repository
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Handles: Backend API synchronization and state management for Users, Admins, and Permissions
 * All data is loaded from backend modules (no hardcoded frontend demo data).
 */

"use strict";

import { RequestHandler } from "../../core/RequestHandler.js";

export class UserControlDataLoader {
  constructor(options = {}) {
    this.http = new RequestHandler();
    this.onUsersUpdated = options.onUsersUpdated || (() => {});
    this.onAdminsUpdated = options.onAdminsUpdated || (() => {});

    this.users = [];
    this.admins = [];
    this.permissions = {};

    // Module key <-> Database system_modules_id mapping
    this.moduleIdMap = {
      dashboard: 1,
      print_jobs: 2,
      design_mgmt: 3,
      place_order: 4,
      customers: 5,
      quotations_invoices: 6,
      inventory: 7,
      grn: 8,
      payments: 9,
      reports: 10,
      user_control: 11,
      settings: 12
    };

    this.reverseModuleIdMap = Object.entries(this.moduleIdMap).reduce((acc, [key, id]) => {
      acc[id] = key;
      return acc;
    }, {});

    this.init();
  }

  init() {
    this.clearLegacyDemoStorage();
    this.syncUsersFromBackend();
    this.syncAdminsFromBackend();
  }

  clearLegacyDemoStorage() {
    try {
      localStorage.removeItem("sa_uc_users");
      localStorage.removeItem("sa_uc_admins");
      localStorage.removeItem("sa_uc_permissions");
    } catch (e) {
      // Ignore storage access errors
    }
  }

  // Modules available in the system
  getAvailableModules() {
    return [
      { id: "dashboard", system_modules_id: 1, name: "Dashboard & Analytics", icon: "fa-solid fa-gauge-high", desc: "Access high-level sales KPIs, job metrics and revenue summaries" },
      { id: "print_jobs", system_modules_id: 2, name: "Print Jobs & Production", icon: "fa-solid fa-print", desc: "Manage live production queues, machine assignments and job statuses" },
      { id: "design_mgmt", system_modules_id: 3, name: "Design Management", icon: "fa-solid fa-pen-ruler", desc: "Design proof approvals, customer artwork revisions and creative workflows" },
      { id: "place_order", system_modules_id: 4, name: "Place Order & Pricing", icon: "fa-solid fa-cart-plus", desc: "Calculate job square-footage, quotation creation and order logging" },
      { id: "customers", system_modules_id: 5, name: "Customer Management", icon: "fa-solid fa-users", desc: "Create, view and manage printing customer profiles and credit limits" },
      { id: "quotations_invoices", system_modules_id: 6, name: "Quotations & Invoices", icon: "fa-solid fa-file-invoice", desc: "Generate customer quotations, tax invoices and billing receipts" },
      { id: "inventory", system_modules_id: 7, name: "Stock & Material Inventory", icon: "fa-solid fa-boxes-stacked", desc: "Roll/sheet raw material stock, stock adjustments and minimum level tracking" },
      { id: "grn", system_modules_id: 8, name: "Purchase Orders (PO) & GRN", icon: "fa-solid fa-clipboard-list", desc: "Supplier PO issuing, Goods Received Notes and material receiving" },
      { id: "payments", system_modules_id: 9, name: "Payments & Financials", icon: "fa-solid fa-money-bill-transfer", desc: "Job payments, supplier GRN payments and shop utility operating expenses" },
      { id: "reports", system_modules_id: 10, name: "Management Reports", icon: "fa-solid fa-chart-pie", desc: "Generate sales, cash flow, stock consumption and production reports" },
      { id: "user_control", system_modules_id: 11, name: "User Control & Permissions", icon: "fa-solid fa-user-shield", desc: "Create users, configure admin roles and grant module action privileges" },
      { id: "settings", system_modules_id: 12, name: "System Settings", icon: "fa-solid fa-gear", desc: "Printers, media dimensions, costing rules and profile settings" }
    ];
  }

  // Actions available per module
  getAvailableActions() {
    return [
      { key: "view", label: "View" },
      { key: "create", label: "Create" },
      { key: "edit", label: "Edit" },
      { key: "delete", label: "Delete" },
      { key: "export", label: "Export" }
    ];
  }

  normalizeUser(u) {
    const statusMap = { 1: "Active", 2: "Inactive", 3: "Suspended", 4: "Pending" };
    const userId = Number(u.id);

    if (Array.isArray(u.permissions)) {
      this.permissions[`user_${userId}`] = this.convertBackendPermissionsToMatrix(u.permissions);
    }

    return {
      id: userId,
      first_name: u.first_name || "",
      last_name: u.last_name || "",
      username: u.username || "",
      mobile: u.mobile || "",
      user_statuses_id: Number(u.user_statuses_id) || 1,
      status: u.status?.user_status || (typeof u.status === "string" ? u.status : statusMap[u.user_statuses_id]) || "Active",
      is_login: Boolean(u.is_login),
      register_at: u.register_at || "",
      role: u.role || "Staff"
    };
  }

  normalizeAdmin(a) {
    const statusMap = { 1: "Active", 2: "Inactive", 3: "Suspended", 4: "Locked" };
    const typeMap = { 1: "Super Admin", 2: "Administrator", 3: "Manager", 4: "Accountant", 5: "Operator" };
    return {
      id: Number(a.id),
      first_name: a.first_name || "",
      last_name: a.last_name || "",
      username: a.username || "",
      email: a.email || "",
      mobile: a.mobile || "",
      add_time: a.add_time || "",
      admin_types_id: Number(a.admin_types_id) || 1,
      admin_statuses_id: Number(a.admin_statuses_id) || 1,
      type: a.type?.admin_type || a.type?.name || (typeof a.type === "string" ? a.type : typeMap[a.admin_types_id]) || "Administrator",
      status: a.status?.admin_statas || a.status?.admin_status || a.status?.name || (typeof a.status === "string" ? a.status : statusMap[a.admin_statuses_id]) || "Active"
    };
  }

  /**
   * Convert backend permission records ([{ system_modules_id, view, create, edit, delete, export }])
   * into the UI permission matrix structure.
   */
  convertBackendPermissionsToMatrix(backendPerms = []) {
    const matrix = {};
    if (!Array.isArray(backendPerms)) {
      return matrix;
    }

    backendPerms.forEach(item => {
      const modId = Number(item.system_modules_id);
      const modKey = this.reverseModuleIdMap[modId];
      if (!modKey) return;

      matrix[modKey] = {
        view: Boolean(item.view),
        create: Boolean(item.create),
        edit: Boolean(item.edit),
        delete: Boolean(item.delete),
        export: Boolean(item.export)
      };
    });

    return matrix;
  }

  /**
   * Convert UI permission matrix structure into backend payload array:
   * [{ system_modules_id, view, create, edit, delete, export }, ...]
   */
  buildPermissionsPayload(permMap = {}) {
    const payloadPermissions = [];

    Object.keys(this.moduleIdMap).forEach(modKey => {
      const modId = this.moduleIdMap[modKey];
      const perms = permMap[modKey] || {};

      payloadPermissions.push({
        system_modules_id: modId,
        view: Boolean(perms.view),
        create: Boolean(perms.create),
        edit: Boolean(perms.edit),
        delete: Boolean(perms.delete),
        export: Boolean(perms.export)
      });
    });

    return payloadPermissions;
  }

  async syncUsersFromBackend() {
    try {
      const response = await this.http.get("/api/v1/users/all");
      if (response && response.success && Array.isArray(response.data)) {
        this.users = response.data.map(u => this.normalizeUser(u));
        this.onUsersUpdated(this.users);
        return this.users;
      }
    } catch (err) {
      console.error("[UserControlDataLoader] Failed to load users from backend:", err);
    }
    return this.users;
  }

  async syncAdminsFromBackend() {
    try {
      const response = await this.http.get("/api/v1/admins/all");
      if (response && response.success && Array.isArray(response.data)) {
        this.admins = response.data.map(a => this.normalizeAdmin(a));
        this.onAdminsUpdated(this.admins);
        return this.admins;
      }
    } catch (err) {
      console.error("[UserControlDataLoader] Failed to load admins from backend:", err);
    }
    return this.admins;
  }

  /**
   * Fetch user permissions from the backend User Module (/api/v1/users/{userId}/permissions).
   */
  async fetchUserPermissions(userId) {
    if (!userId) return {};
    try {
      const response = await this.http.get(`/api/v1/users/${userId}/permissions`);
      const list = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
      const matrix = this.convertBackendPermissionsToMatrix(list);
      this.permissions[`user_${userId}`] = matrix;
      return matrix;
    } catch (err) {
      return this.getUserPermissions(userId);
    }
  }

  /**
   * Search users via User Module endpoint (/api/v1/users/search) using RequestHandler.
   *
   * @param {string} [rawQuery=""]
   * @param {Object} [options={}]
   * @returns {Promise<Array>}
   */
  async searchUsers(rawQuery = "", options = {}) {
    const trimmed = String(rawQuery || "").trim();
    const cleanQuery = trimmed.replace(/^#/, "").trim();

    if (!cleanQuery) {
      return this.syncUsersFromBackend();
    }

    const params = {
      q: trimmed,
      all: true
    };

    if (/^\d+$/.test(cleanQuery)) {
      params.id = cleanQuery;
    }

    const response = await this.http.get("/api/v1/users/search", params, options);
    const list = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
    const normalized = list.map(u => this.normalizeUser(u));

    // Merge returned users into in-memory store so user lookup by ID always succeeds
    normalized.forEach(remoteUser => {
      const idx = this.users.findIndex(u => Number(u.id) === Number(remoteUser.id));
      if (idx !== -1) {
        this.users[idx] = { ...this.users[idx], ...remoteUser };
      } else {
        this.users.push(remoteUser);
      }
    });

    return normalized;
  }

  // Safe no-op methods for backward compatibility with existing callers
  saveUsers() {}
  saveAdmins() {}
  savePermissions() {}

  getUserPermissions(userId) {
    const key = `user_${userId}`;
    return this.permissions[key] || {};
  }

  setUserPermissions(userId, permMap) {
    const key = `user_${userId}`;
    this.permissions[key] = JSON.parse(JSON.stringify(permMap || {}));
  }

  saveUserPermissions(userId, permMap) {
    this.setUserPermissions(userId, permMap);
  }

  toggleUserStatus(userId) {
    const user = this.users.find(u => u.id === Number(userId));
    if (user) {
      const nextStatusId = user.status === "Active" ? 2 : 1;
      user.status = user.status === "Active" ? "Inactive" : "Active";
      user.user_statuses_id = nextStatusId;

      this.http.patch(`/admin/users/${user.id}/status`, {
        user_statuses_id: nextStatusId
      }).catch(() => {});

      return user;
    }
    return null;
  }

  toggleAdminStatus(adminId) {
    const admin = this.admins.find(a => a.id === Number(adminId));
    if (admin) {
      const nextStatusId = admin.status === "Active" ? 2 : 1;
      admin.status = admin.status === "Active" ? "Inactive" : "Active";
      admin.admin_statuses_id = nextStatusId;

      this.http.patch(`/admin/admins/${admin.id}/status`, {
        admin_statuses_id: nextStatusId
      }).catch(() => {});

      return admin;
    }
    return null;
  }

  addAdmin(adminData) {
    const maxId = this.admins.reduce((max, a) => Math.max(max, a.id), 0);
    const newAdmin = this.normalizeAdmin({
      id: maxId + 1,
      ...adminData,
      add_time: new Date().toISOString().slice(0, 16).replace("T", " ")
    });
    this.admins.unshift(newAdmin);
    return newAdmin;
  }
}
