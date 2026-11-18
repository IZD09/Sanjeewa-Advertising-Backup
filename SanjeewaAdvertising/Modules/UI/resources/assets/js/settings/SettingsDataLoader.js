/**
 * SanjeewaAdvertising - Settings Data Loader
 *
 * Handles default settings, localStorage synchronization, and backend HTTP communication
 * via RequestHandler for shop preferences and system configuration.
 */

"use strict";

import { RequestHandler } from "../core/RequestHandler.js";

export class SettingsDataLoader {
  static STORAGE_KEY = "sa_shop_settings";

  static DEFAULT_SETTINGS = {
    shop_name: "Sanjeewa Advertising & Printing",
    shop_address: "No. 42 Main Street, Colombo 03, Sri Lanka",
    shop_phone: "+94 11 234 5678",
    currency_symbol: "Rs.",
    logo_url: null,
    logo_icon: "fa-solid fa-print",
    theme_mode: "light",
    theme_color: "#2563eb",
  };

  /**
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    this.http = new RequestHandler({
      baseUrl: options.baseUrl || "",
    });
    this.defaults = { ...SettingsDataLoader.DEFAULT_SETTINGS, ...(options.defaults || {}) };
  }

  /**
   * Retrieve default fallback settings object.
   *
   * @returns {Object}
   */
  getDefaultSettings() {
    return { ...this.defaults };
  }

  /**
   * Load persisted settings from localStorage if available.
   *
   * @returns {Object|null}
   */
  getSavedLocalSettings() {
    try {
      const savedJson = localStorage.getItem(SettingsDataLoader.STORAGE_KEY);
      if (savedJson) {
        return JSON.parse(savedJson);
      }
    } catch (_) {}
    return null;
  }

  /**
   * Persist settings payload into localStorage.
   *
   * @param {Object} settingsData
   */
  saveLocalSettings(settingsData) {
    if (!settingsData) return;
    try {
      localStorage.setItem(SettingsDataLoader.STORAGE_KEY, JSON.stringify(settingsData));
    } catch (_) {}
  }

  /**
   * Fetch current shop settings from backend endpoint.
   *
   * @returns {Promise<Object>}
   */
  async fetchSettingsData() {
    const response = await this.http.get("/settings/data");
    return response?.data || response || {};
  }

  /**
   * Submit settings FormData (supports multipart file uploads) to backend endpoint.
   *
   * @param {FormData} formData
   * @param {string} [actionUrl="/settings"]
   * @returns {Promise<Object>}
   */
  async saveSettings(formData, actionUrl = "/settings") {
    const response = await this.http.post(actionUrl, formData);
    if (response && response.success && response.data) {
      this.saveLocalSettings(response.data);
    }
    return response;
  }
}

export default SettingsDataLoader;
