/**
 * Admin Profile Data Loader & State Repository
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Handles: Backend API communication for Admin Profile verification, updates, and activity audit logs
 */

"use strict";

import { RequestHandler } from "../../core/RequestHandler.js";

export class AdminProfileDataLoader {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.onAdminUpdated]
   * @param {Function} [options.onActivitiesUpdated]
   */
  constructor(options = {}) {
    this.http = new RequestHandler();
    this.onAdminUpdated = options.onAdminUpdated || (() => {});
    this.onActivitiesUpdated = options.onActivitiesUpdated || (() => {});

    this.verifiedAdmin = null;
    this.activities = [];
  }

  /**
   * Get currently verified administrator object.
   *
   * @returns {Object|null}
   */
  getVerifiedAdmin() {
    return this.verifiedAdmin;
  }

  /**
   * Set currently verified administrator and extract activities.
   *
   * @param {Object|null} admin
   */
  setVerifiedAdmin(admin) {
    this.verifiedAdmin = admin || null;

    if (admin && Array.isArray(admin.activities)) {
      this.activities = admin.activities;
      this.onActivitiesUpdated(this.activities);
    }

    this.onAdminUpdated(this.verifiedAdmin);
  }

  /**
   * Merge updated fields into verified administrator state.
   *
   * @param {Object} updatedFields
   * @returns {Object|null}
   */
  mergeVerifiedAdmin(updatedFields = {}) {
    if (!this.verifiedAdmin) {
      return null;
    }

    this.verifiedAdmin = { ...this.verifiedAdmin, ...updatedFields };
    this.onAdminUpdated(this.verifiedAdmin);
    return this.verifiedAdmin;
  }

  /**
   * Get cached activities list.
   *
   * @returns {Array<Object>}
   */
  getActivities() {
    return Array.isArray(this.activities) ? this.activities : [];
  }

  /**
   * Verify administrator credentials via backend API.
   *
   * @param {string} username
   * @param {string} password
   * @returns {Promise<Object>}
   */
  async verifyCredentials(username, password) {
    return this.http.post("/admin/profile/verify", {
      username,
      password,
    });
  }

  /**
   * Update administrator profile & optional password via backend API.
   *
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async updateProfile(payload) {
    return this.http.put("/admin/profile", payload);
  }

  /**
   * Fetch latest admin activity logs from backend API.
   *
   * @param {number} [limit=100]
   * @returns {Promise<Array<Object>>}
   */
  async fetchActivities(limit = 100) {
    const response = await this.http.get("/admin/profile/activities", { limit });

    if (response && response.success && Array.isArray(response.data)) {
      this.activities = response.data;
      this.onActivitiesUpdated(this.activities);
      return this.activities;
    }

    throw new Error(response?.message || "Failed to refresh activities.");
  }
}

export default AdminProfileDataLoader;
