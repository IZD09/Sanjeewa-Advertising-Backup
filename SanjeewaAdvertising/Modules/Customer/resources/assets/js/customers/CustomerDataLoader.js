/**
 * SanjeewaAdvertising - Customer Data Loader
 *
 * Communicates with backend Customer module API endpoints for loading,
 * searching, and registering customer accounts.
 */

import { RequestHandler } from "../core/RequestHandler.js";

export class CustomerDataLoader {
  /**
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    this.endpoints = options.endpoints || {
      data: "/api/v1/customers/data",
      customers: "/api/v1/customers?all=1",
      all: "/api/v1/customers/all",
      search: "/api/v1/customers/search",
      create: "/api/v1/customers",
    };

    this.http = new RequestHandler();
  }

  /**
   * Retrieve customer directory payload including aggregated KPIs.
   * @param {Object} [params={}]
   * @returns {Promise<{customers: Array, kpis: Object|null}>}
   */
  async fetchCustomersData(params = {}) {
    try {
      const result = await this.http.get(this.endpoints.data, params);
      const payload = result && result.data ? result.data : result;
      return {
        customers: Array.isArray(payload?.customers)
          ? payload.customers
          : Array.isArray(payload)
            ? payload
            : [],
        kpis: payload?.kpis || null,
      };
    } catch (err) {
      console.warn("[CustomerDataLoader] fetchCustomersData error, fallback to loadCustomers:", err);
      const list = await this.loadCustomers();
      return { customers: list, kpis: null };
    }
  }

  /**
   * Load complete list of customer accounts.
   * @returns {Promise<Array>}
   */
  async loadCustomers() {
    try {
      const response = await this.http.get(this.endpoints.customers);
      if (Array.isArray(response)) {
        return response;
      }
      if (response && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (err) {
      console.warn("[CustomerDataLoader] Error loading customers:", err);
      // Fallback to /all endpoint
      try {
        const fallback = await this.http.get(this.endpoints.all);
        if (Array.isArray(fallback?.data)) return fallback.data;
        if (Array.isArray(fallback)) return fallback;
      } catch (fErr) {
        console.error("[CustomerDataLoader] Fallback customers load failed:", fErr);
      }
      return [];
    }
  }

  /**
   * Register a new customer via Customer module API.
   *
   * @param {Object} customerData
   * @param {string} customerData.name
   * @param {string} customerData.mobile
   * @param {string} [customerData.email]
   * @returns {Promise<Object>}
   */
  async createCustomer(customerData = {}) {
    return this.http.post(this.endpoints.create, customerData);
  }

  /**
   * Search customers by query.
   * @param {string} query
   * @returns {Promise<Array>}
   */
  async searchCustomers(query = "") {
    if (!query) return this.loadCustomers();
    try {
      const response = await this.http.get(`${this.endpoints.search}?search=${encodeURIComponent(query)}`);
      return response?.data || response || [];
    } catch (err) {
      console.warn("[CustomerDataLoader] Search customers failed:", err);
      return [];
    }
  }
}

export default CustomerDataLoader;

