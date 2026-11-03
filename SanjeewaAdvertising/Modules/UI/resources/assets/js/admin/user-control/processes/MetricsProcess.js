/**
 * Metrics Process
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

export class MetricsProcess {
  constructor(options = {}) {
    this.dataLoader = options.dataLoader;

    this.kpiTotalUsers = document.getElementById("kpiTotalUsers");
    this.kpiTotalAdmins = document.getElementById("kpiTotalAdmins");
    this.kpiActiveAccounts = document.getElementById("kpiActiveAccounts");
    this.kpiConfiguredPerms = document.getElementById("kpiConfiguredPerms");

    this.badgeStaffCount = document.getElementById("badgeStaffCount");
    this.badgeAdminCount = document.getElementById("badgeAdminCount");
  }

  update() {
    const totalUsers = this.dataLoader.users.length;
    const totalAdmins = this.dataLoader.admins.length;

    const activeUsers = this.dataLoader.users.filter(u => u.status === "Active").length;
    const activeAdmins = this.dataLoader.admins.filter(a => a.status === "Active").length;
    const totalActive = activeUsers + activeAdmins;

    const configuredPermCount = Object.keys(this.dataLoader.permissions).length;

    if (this.kpiTotalUsers) this.kpiTotalUsers.textContent = totalUsers;
    if (this.kpiTotalAdmins) this.kpiTotalAdmins.textContent = totalAdmins;
    if (this.kpiActiveAccounts) this.kpiActiveAccounts.textContent = totalActive;
    if (this.kpiConfiguredPerms) this.kpiConfiguredPerms.textContent = `${configuredPermCount} Users`;

    if (this.badgeStaffCount) this.badgeStaffCount.textContent = totalUsers;
    if (this.badgeAdminCount) this.badgeAdminCount.textContent = totalAdmins;
  }
}

