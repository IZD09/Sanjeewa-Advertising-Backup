/**
 * SanjeewaAdvertising - User Profile Data Loader
 *
 * Communicates with User Profile module APIs via RequestHandler:
 * - GET /user/profile/data (fetches profile, logins history, assigned system permissions)
 * - PUT /user/profile (updates user contact information & credentials)
 */

"use strict";

import { RequestHandler } from "../core/RequestHandler.js";

export class ProfileDataLoader {
  constructor() {
    this.http = new RequestHandler();
  }

  /**
   * Fetch authenticated user profile data, session history, and module permissions.
   *
   * @returns {Promise<Object>}
   */
  async fetchProfileData() {
    try {
      const response = await this.http.get("/user/profile/data");
      const data = response?.data || response;
      return data;
    } catch (error) {
      console.error("[ProfileDataLoader] Failed to fetch user profile data:", error);
      throw error;
    }
  }

  /**
   * Update authenticated user personal details (first name, last name, mobile).
   *
   * @param {Object} payload
   * @param {string} payload.first_name
   * @param {string} payload.last_name
   * @param {string} payload.mobile
   * @returns {Promise<Object>}
   */
  async updateProfile(payload) {
    try {
      const response = await this.http.put("/user/profile", payload);
      return response;
    } catch (error) {
      console.error("[ProfileDataLoader] Failed to update user profile:", error);
      throw error;
    }
  }

  /**
   * Update authenticated user password credentials in User Module.
   *
   * @param {Object} payload
   * @param {string} payload.current_password
   * @param {string} payload.password
   * @param {string} payload.password_confirmation
   * @returns {Promise<Object>}
   */
  async updatePassword(payload) {
    try {
      const response = await this.http.put("/user/profile/password", payload);
      return response;
    } catch (error) {
      try {
        const fallbackRes = await this.http.put("/user/profile", payload);
        return fallbackRes;
      } catch (fallbackErr) {
        console.error("[ProfileDataLoader] Failed to update user password in User module:", error);
        throw error;
      }
    }
  }
}

export default ProfileDataLoader;
