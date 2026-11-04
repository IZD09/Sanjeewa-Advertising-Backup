/**
 * User Control Data Loader & State Repository
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Handles: In-memory & LocalStorage caching, API synchronization, CRUD operations for Users, Admins, and Permissions
 */

"use strict";

export class UserControlDataLoader {
  constructor() {
    this.storageKeyUsers = "sa_uc_users";
    this.storageKeyAdmins = "sa_uc_admins";
    this.storageKeyPermissions = "sa_uc_permissions";

    this.users = [];
    this.admins = [];
    this.permissions = {};

    this.init();
  }

  init() {
    this.loadUsers();
    this.loadAdmins();
    this.loadPermissions();
    this.syncUsersFromBackend();
  }

  // Modules available in the system
  getAvailableModules() {
    return [
      { id: "dashboard", name: "Dashboard & Analytics", icon: "fa-solid fa-gauge-high", desc: "Access high-level sales KPIs, job metrics and revenue summaries" },
      { id: "print_jobs", name: "Print Jobs & Production", icon: "fa-solid fa-print", desc: "Manage live production queues, machine assignments and job statuses" },
      { id: "design_mgmt", name: "Design Management", icon: "fa-solid fa-pen-ruler", desc: "Design proof approvals, customer artwork revisions and creative workflows" },
      { id: "place_order", name: "Place Order & Pricing", icon: "fa-solid fa-cart-plus", desc: "Calculate job square-footage, quotation creation and order logging" },
      { id: "customers", name: "Customer Management", icon: "fa-solid fa-users", desc: "Create, view and manage printing customer profiles and credit limits" },
      { id: "quotations_invoices", name: "Quotations & Invoices", icon: "fa-solid fa-file-invoice", desc: "Generate customer quotations, tax invoices and billing receipts" },
      { id: "inventory", name: "Stock & Material Inventory", icon: "fa-solid fa-boxes-stacked", desc: "Roll/sheet raw material stock, stock adjustments and minimum level tracking" },
      { id: "grn", name: "Purchase Orders (PO) & GRN", icon: "fa-solid fa-clipboard-list", desc: "Supplier PO issuing, Goods Received Notes and material receiving" },
      { id: "payments", name: "Payments & Financials", icon: "fa-solid fa-money-bill-transfer", desc: "Job payments, supplier GRN payments and shop utility operating expenses" },
      { id: "reports", name: "Management Reports", icon: "fa-solid fa-chart-pie", desc: "Generate sales, cash flow, stock consumption and production reports" },
      { id: "user_control", name: "User Control & Permissions", icon: "fa-solid fa-user-shield", desc: "Create users, configure admin roles and grant module action privileges" },
      { id: "settings", name: "System Settings", icon: "fa-solid fa-gear", desc: "Printers, media dimensions, costing rules and profile settings" }
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

  loadUsers() {
    const cached = localStorage.getItem(this.storageKeyUsers);
    if (cached) {
      try {
        this.users = JSON.parse(cached);
        return;
      } catch (e) {}
    }

    // Default Seed Users (Aligned with User model schema)
    this.users = [
      {
        id: 1,
        first_name: "Kamal",
        last_name: "Perera",
        username: "kamal_print",
        mobile: "0771234567",
        register_at: "2026-01-15 08:30:00",
        user_statuses_id: 1,
        status: "Active",
        is_login: false
      },
      {
        id: 2,
        first_name: "Nimal",
        last_name: "Silva",
        username: "nimal_designer",
        mobile: "0719876543",
        register_at: "2026-02-10 09:15:00",
        user_statuses_id: 1,
        status: "Active",
        is_login: false
      },
      {
        id: 3,
        first_name: "Sunil",
        last_name: "Jayasinghe",
        username: "sunil_cashier",
        mobile: "0763456789",
        register_at: "2026-03-01 10:00:00",
        user_statuses_id: 1,
        status: "Active",
        is_login: false
      },
      {
        id: 4,
        first_name: "Kasun",
        last_name: "Fernando",
        username: "kasun_stock",
        mobile: "0758889990",
        register_at: "2026-04-12 14:20:00",
        user_statuses_id: 2,
        status: "Inactive",
        is_login: false
      }
    ];
    this.saveUsers();
  }

  syncUsersFromBackend() {
    fetch('/admin/users/all', {
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
      .then(res => {
        if (!res.ok) {
          return fetch('/api/v1/users/all', {
            credentials: 'same-origin',
            headers: {
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
          }).then(r => r.json());
        }
        return res.json();
      })
      .then(data => {
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          const statusMap = { 1: "Active", 2: "Inactive", 3: "Suspended", 4: "Pending" };
          this.users = data.data.map(u => ({
            id: u.id,
            first_name: u.first_name,
            last_name: u.last_name,
            username: u.username,
            mobile: u.mobile,
            user_statuses_id: u.user_statuses_id,
            status: u.status?.user_status || statusMap[u.user_statuses_id] || "Active",
            is_login: Boolean(u.is_login),
            register_at: u.register_at
          }));
          this.saveUsers();
        }
      })
      .catch(() => {});
  }

  loadAdmins() {
    const cached = localStorage.getItem(this.storageKeyAdmins);
    if (cached) {
      try {
        this.admins = JSON.parse(cached);
        return;
      } catch (e) {}
    }

    // Default Seed Admins
    this.admins = [
      {
        id: 1,
        first_name: "Sanjeewa",
        last_name: "Pushpakumara",
        username: "sanjeewa_admin",
        email: "sanjeewa@advertising.lk",
        mobile: "0777112233",
        add_time: "2025-11-01 08:00:00",
        type: "Super Admin",
        status: "Active"
      },
      {
        id: 2,
        first_name: "Dhammika",
        last_name: "Bandara",
        username: "dhammika_mgr",
        email: "dhammika@advertising.lk",
        mobile: "0714445566",
        add_time: "2026-01-10 11:30:00",
        type: "Manager",
        status: "Active"
      },
      {
        id: 3,
        first_name: "Nuwan",
        last_name: "Pradeep",
        username: "nuwan_acc",
        email: "nuwan@advertising.lk",
        mobile: "0785556677",
        add_time: "2026-02-18 16:45:00",
        type: "Accountant",
        status: "Active"
      }
    ];
    this.saveAdmins();
  }

  loadPermissions() {
    const cached = localStorage.getItem(this.storageKeyPermissions);
    if (cached) {
      try {
        this.permissions = JSON.parse(cached);
        return;
      } catch (e) {}
    }

    // Default Seed Matrix Permissions
    this.permissions = {
      // User 1: Production Lead
      "user_1": {
        dashboard: { view: true, create: false, edit: false, delete: false, export: true },
        print_jobs: { view: true, create: true, edit: true, delete: false, export: true },
        design_mgmt: { view: true, create: true, edit: false, delete: false, export: false },
        inventory: { view: true, create: false, edit: false, delete: false, export: false }
      },
      // User 2: Graphic Designer
      "user_2": {
        print_jobs: { view: true, create: false, edit: false, delete: false, export: false },
        design_mgmt: { view: true, create: true, edit: true, delete: false, export: true },
        customers: { view: true, create: false, edit: false, delete: false, export: false }
      },
      // User 3: Cashier
      "user_3": {
        place_order: { view: true, create: true, edit: true, delete: false, export: true },
        customers: { view: true, create: true, edit: true, delete: false, export: true },
        quotations_invoices: { view: true, create: true, edit: true, delete: false, export: true },
        payments: { view: true, create: true, edit: false, delete: false, export: true }
      },
      // User 4: Inventory Officer
      "user_4": {
        inventory: { view: true, create: true, edit: true, delete: false, export: true },
        grn: { view: true, create: true, edit: true, delete: false, export: true }
      }
    };
    this.savePermissions();
  }

  saveUsers() {
    localStorage.setItem(this.storageKeyUsers, JSON.stringify(this.users));
  }

  saveAdmins() {
    localStorage.setItem(this.storageKeyAdmins, JSON.stringify(this.admins));
  }

  savePermissions() {
    localStorage.setItem(this.storageKeyPermissions, JSON.stringify(this.permissions));
  }

  addUser(userData) {
    const nextId = this.users.length ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    const statusMap = {
      1: "Active",
      2: "Inactive",
      3: "Suspended",
      4: "Pending"
    };
    const statusId = Number(userData.user_statuses_id) || 1;
    const statusName = statusMap[statusId] || (typeof userData.status === "string" ? userData.status : "Active");

    const newUser = {
      id: nextId,
      first_name: userData.first_name,
      last_name: userData.last_name,
      username: userData.username,
      mobile: userData.mobile,
      user_statuses_id: statusId,
      status: statusName,
      is_login: false,
      register_at: now
    };

    // Attempt backend Admin Module persist
    fetch('/admin/users', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username,
        mobile: userData.mobile,
        password: userData.password,
        user_statuses_id: statusId
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.data) {
          newUser.id = data.data.id;
          this.saveUsers();
        }
      })
      .catch(() => {});

    this.users.unshift(newUser);
    this.saveUsers();
    return newUser;
  }

  addAdmin(adminData) {
    const nextId = this.admins.length ? Math.max(...this.admins.map(a => a.id)) + 1 : 1;
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    const newAdmin = {
      id: nextId,
      first_name: adminData.first_name,
      last_name: adminData.last_name,
      username: adminData.username,
      email: adminData.email,
      mobile: adminData.mobile,
      add_time: now,
      type: adminData.type || "Administrator",
      status: adminData.status || "Active"
    };
    this.admins.unshift(newAdmin);
    this.saveAdmins();
    return newAdmin;
  }

  getUserPermissions(userId) {
    const key = `user_${userId}`;
    return this.permissions[key] || {};
  }

  saveUserPermissions(userId, permMap) {
    const key = `user_${userId}`;
    this.permissions[key] = permMap;
    this.savePermissions();

    // Map UI module keys to database system_modules_id (1-12)
    const moduleIdMap = {
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

    const payloadPermissions = [];
    Object.keys(moduleIdMap).forEach(modKey => {
      const modId = moduleIdMap[modKey];
      const perms = permMap[modKey] || {};
      const actions = Object.values(perms);
      const trueCount = actions.filter(Boolean).length;

      let stateId = 4; // Denied by default
      if (trueCount >= 4) {
        stateId = 1; // Full Access
      } else if (trueCount > 1) {
        stateId = 3; // Restricted
      } else if (trueCount === 1 && perms.view) {
        stateId = 2; // Read Only
      } else if (trueCount === 1) {
        stateId = 3; // Restricted
      }

      payloadPermissions.push({
        system_modules_id: modId,
        permision_stateses_id: stateId
      });
    });

    fetch(`/admin/users/${userId}/permissions/sync`, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({ permissions: payloadPermissions })
    }).catch(err => console.error("Error syncing permissions with backend:", err));
  }

  toggleUserStatus(userId) {
    const user = this.users.find(u => u.id === Number(userId));
    if (user) {
      const nextStatusId = user.status === "Active" ? 2 : 1;
      user.status = user.status === "Active" ? "Inactive" : "Active";
      user.user_statuses_id = nextStatusId;

      fetch(`/admin/users/${user.id}/status`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ user_statuses_id: nextStatusId })
      }).catch(() => {});

      this.saveUsers();
      return user;
    }
    return null;
  }

  toggleAdminStatus(adminId) {
    const admin = this.admins.find(a => a.id === Number(adminId));
    if (admin) {
      admin.status = admin.status === "Active" ? "Inactive" : "Active";
      this.saveAdmins();
      return admin;
    }
    return null;
  }
}
