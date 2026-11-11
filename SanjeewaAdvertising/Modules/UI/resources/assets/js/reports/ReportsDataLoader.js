/**
 * SanjeewaAdvertising - Reports Data Loader Service
 * Responsible for handling fetch requests, CSRF authentication,
 * embedded JSON payload extraction, asynchronous report data loading,
 * and localStorage caching for Reports.
 */

import { RequestHandler } from "../core/RequestHandler.js";

export class ReportsDataLoader {
  /**
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    this.storageKeys = options.storageKeys || {
      reportsPayload: "sa_advertising_reports_payload",
      dateRange: "sa_advertising_reports_date_range"
    };

    this.endpoints = options.endpoints || {
      reportsData: "/reports/data",
      reportsTable: "/reports/table",
      reportsKpis: "/reports/kpis"
    };

    this.http = new RequestHandler();
  }

  /**
   * Retrieve Laravel CSRF token.
   * @returns {string}
   */
  getCsrfToken() {
    return this.http.getCsrfToken();
  }

  /**
   * Universal request wrapper delegating to core RequestHandler.
   * @param {string} url
   * @param {Object} [options={}]
   * @returns {Promise<any>}
   */
  async request(url, options = {}) {
    return this.http.request(url, options);
  }

  /**
   * Load embedded chart and report payload from `#reports-chart-data` script tag.
   * @returns {Object}
   */
  loadEmbeddedPayload() {
    const el = document.getElementById("reports-chart-data");
    if (el && el.textContent) {
      try {
        const parsed = JSON.parse(el.textContent);
        this.savePayloadCache(parsed);
        return parsed;
      } catch (err) {
        console.warn("[ReportsDataLoader] Failed to parse embedded chart data:", err);
      }
    }

    const cached = localStorage.getItem(this.storageKeys.reportsPayload);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (err) {
        console.warn("[ReportsDataLoader] Corrupt cached reports payload.");
      }
    }

    return {};
  }

  /**
   * Fetch all report data (KPIs, Charts, and initial tables) asynchronously.
   *
   * @param {Object} [filters={}]
   * @returns {Promise<Object>}
   */
  async fetchReportData(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        params.append(key, val);
      }
    });

    const url = `${this.endpoints.reportsData}?${params.toString()}`;
    const result = await this.http.get(url);
    if (result && result.charts) {
      this.savePayloadCache(result.charts);
    }
    return result;
  }

  /**
   * Fetch paginated and filtered table records for a specific report tab without page reload.
   *
   * @param {string} tab - ('sales', 'payments', 'receivables', 'inventory', 'suppliers', 'profit_loss')
   * @param {Object} [filters={}]
   * @returns {Promise<Object>}
   */
  async fetchTableData(tab, filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        params.append(key, val);
      }
    });

    const url = `${this.endpoints.reportsTable}/${tab}?${params.toString()}`;
    return this.http.get(url);
  }

  /**
   * Fetch executive KPI card metrics alone.
   *
   * @param {Object} [filters={}]
   * @returns {Promise<Object>}
   */
  async fetchKpis(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        params.append(key, val);
      }
    });

    const url = `${this.endpoints.reportsKpis}?${params.toString()}`;
    return this.http.get(url);
  }

  /**
   * Persist payload cache to localStorage.
   * @param {Object} payload
   */
  savePayloadCache(payload) {
    try {
      localStorage.setItem(this.storageKeys.reportsPayload, JSON.stringify(payload));
    } catch (err) {
      console.warn("[ReportsDataLoader] Could not cache reports payload:", err);
    }
  }
}

export default ReportsDataLoader;
