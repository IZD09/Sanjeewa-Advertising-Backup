/**
 * SanjeewaAdvertising - GRN Data Loader
 *
 * Handles API communication via RequestHandler to the Supplier module,
 * pagination metadata tracking, and code/number generators.
 * All records originate directly from database-backed Supplier service classes.
 */

import { RequestHandler } from "../core/RequestHandler.js";

export class GRNDataLoader {
  constructor() {
    this.http = new RequestHandler();
    this.storageKey = "sa_advertising_grn_records";
    this.poStorageKey = "sa_advertising_purchase_orders";
    this.supplierStorageKey = "sa_advertising_suppliers";

    this.grnRecords = [];
    this.grnSuppliers = [];
    this.grnStatuses = ["Pending", "Approved", "Pending Stock", "Completed", "Draft", "Cancelled"];
    this.purchaseOrders = [];
    this.poSuppliers = [];
    this.poStatuses = ["Pending", "Partial", "Completed", "Cancelled"];
    this.suppliers = [];

    this.grnKpis = { total: 0, completed: 0, draft: 0, total_value: 0 };
    this.poKpis = { total: 0, pending: 0, partial: 0, completed: 0, open: 0, total_value: 0 };

    this.grnPagination = { total: 0, per_page: 20, current_page: 1, last_page: 1, from: 0, to: 0 };
    this.poPagination = { total: 0, per_page: 20, current_page: 1, last_page: 1, from: 0, to: 0 };
    this.supplierPagination = { total: 0, per_page: 20, current_page: 1, last_page: 1, from: 0, to: 0 };

    this.poLoaded = false;
    this.grnLoaded = false;
    this.suppliersLoaded = false;

    // Clear any legacy demo data cached in localStorage
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.poStorageKey);
      localStorage.removeItem(this.supplierStorageKey);
    } catch (e) {}
  }

  /**
   * Fetch Suppliers data from backend Supplier module via RequestHandler.
   *
   * @param {Object} [filters={}]
   * @param {boolean} [forceRefresh=false]
   * @returns {Promise<Array>}
   */
  async fetchSuppliers(filters = {}, forceRefresh = false) {
    if (this.suppliersLoaded && !forceRefresh && Object.keys(filters).length === 0) {
      return this.suppliers;
    }

    try {
      const params = { per_page: 20, ...filters };
      const response = await this.http.get("/advertising/suppliers/data", params);
      const data = response?.data || response;
      const list = data?.suppliers ?? (Array.isArray(data) ? data : []);

      if (Array.isArray(list)) {
        this.suppliers = list;
        if (data?.pagination) {
          this.supplierPagination = data.pagination;
        } else {
          this.supplierPagination = {
            total: list.length,
            per_page: 20,
            current_page: 1,
            last_page: Math.max(1, Math.ceil(list.length / 20)),
            from: list.length > 0 ? 1 : 0,
            to: list.length
          };
        }
        this.suppliersLoaded = true;
        return this.suppliers;
      }
    } catch (e) {
      console.warn("[GRNDataLoader] Failed to fetch suppliers from API:", e);
    }

    this.suppliersLoaded = true;
    return this.suppliers;
  }

  /**
   * Trigger async fetch for suppliers from database.
   * @returns {Array}
   */
  loadSuppliers() {
    this.fetchSuppliers().catch(() => {});
    return this.suppliers;
  }

  /**
   * Fetch Purchase Orders data from backend Supplier module via RequestHandler.
   *
   * @param {Object} [filters={}]
   * @param {boolean} [forceRefresh=false]
   * @returns {Promise<Array>}
   */
  async fetchPurchaseOrders(filters = {}, forceRefresh = false) {
    if (this.poLoaded && !forceRefresh && Object.keys(filters).length === 0) {
      return this.purchaseOrders;
    }

    try {
      const params = { per_page: 20, ...filters };
      const response = await this.http.get("/advertising/purchase-orders/data", params);
      const data = response?.data || response;
      const orders = data?.purchase_orders ?? data?.orders ?? (Array.isArray(data) ? data : []);

      if (Array.isArray(orders)) {
        this.purchaseOrders = orders;
        if (Array.isArray(data?.suppliers)) {
          this.poSuppliers = data.suppliers;
        }
        if (Array.isArray(data?.statuses) && data.statuses.length > 0) {
          this.poStatuses = data.statuses;
        }
        if (data?.kpis) {
          this.poKpis = data.kpis;
        }
        if (data?.pagination) {
          this.poPagination = data.pagination;
        } else {
          this.poPagination = {
            total: orders.length,
            per_page: 20,
            current_page: 1,
            last_page: Math.max(1, Math.ceil(orders.length / 20)),
            from: orders.length > 0 ? 1 : 0,
            to: orders.length
          };
        }
        this.poLoaded = true;
        return this.purchaseOrders;
      }
    } catch (e) {
      console.warn("[GRNDataLoader] Failed to fetch POs from API:", e);
    }

    this.poLoaded = true;
    return this.purchaseOrders;
  }

  /**
   * Update Purchase Order status via API.
   * @param {number|string} id
   * @param {number|string} statusIdOrName
   * @returns {Promise<Object>}
   */
  async updatePoStatus(id, statusIdOrName) {
    const payload = {};
    if (typeof statusIdOrName === "string") {
      payload.status = statusIdOrName;
      const lower = statusIdOrName.trim().toLowerCase();
      if (lower === "approved") {
        payload.purchase_orders_status_id = 5;
      } else if (lower === "cancelled" || lower === "canceled") {
        payload.purchase_orders_status_id = 4;
      } else if (lower === "completed") {
        payload.purchase_orders_status_id = 3;
      } else if (lower === "partial") {
        payload.purchase_orders_status_id = 2;
      } else if (lower === "pending") {
        payload.purchase_orders_status_id = 1;
      }
    } else {
      payload.purchase_orders_status_id = statusIdOrName;
      if (statusIdOrName === 5) {
        payload.status = "Approved";
      } else if (statusIdOrName === 4) {
        payload.status = "Cancelled";
      } else if (statusIdOrName === 3) {
        payload.status = "Completed";
      } else if (statusIdOrName === 2) {
        payload.status = "Partial";
      } else if (statusIdOrName === 1) {
        payload.status = "Pending";
      }
    }

    const response = await this.http.patch(`/advertising/purchase-orders/${id}`, payload);
    await this.fetchPurchaseOrders({}, true);
    return response;
  }

  /**
   * Fetch Goods Received Notes (GRN) data from backend Supplier module via RequestHandler.
   *
   * @param {Object} [filters={}]
   * @param {boolean} [forceRefresh=false]
   * @returns {Promise<Array>}
   */
  async fetchGrns(filters = {}, forceRefresh = false) {
    if (this.grnLoaded && !forceRefresh && Object.keys(filters).length === 0) {
      return this.grnRecords;
    }

    try {
      const params = { per_page: 20, ...filters };
      const response = await this.http.get("/advertising/grns/data", params);
      const data = response?.data || response;
      const grns = data?.grns ?? data?.records ?? (Array.isArray(data) ? data : []);

      if (Array.isArray(grns)) {
        this.grnRecords = grns;
        if (Array.isArray(data?.suppliers)) {
          this.grnSuppliers = data.suppliers;
        }
        if (Array.isArray(data?.statuses) && data.statuses.length > 0) {
          this.grnStatuses = data.statuses;
        }
        if (data?.kpis) {
          this.grnKpis = data.kpis;
        }
        if (data?.pagination) {
          this.grnPagination = data.pagination;
        } else {
          this.grnPagination = {
            total: grns.length,
            per_page: 20,
            current_page: 1,
            last_page: Math.max(1, Math.ceil(grns.length / 20)),
            from: grns.length > 0 ? 1 : 0,
            to: grns.length
          };
        }
        this.grnLoaded = true;
        return this.grnRecords;
      }
    } catch (e) {
      console.warn("[GRNDataLoader] Failed to fetch GRNs from API:", e);
    }

    this.grnLoaded = true;
    return this.grnRecords;
  }

  /**
   * Update GRN status (Approved, Cancelled, Completed, Draft) via API.
   * @param {number|string} id
   * @param {string} status
   * @returns {Promise<Object>}
   */
  async updateGrnStatus(id, status) {
    const response = await this.http.patch(`/advertising/grns/${id}/status`, { status });
    await this.fetchGrns({}, true);
    return response;
  }

  /**
   * Return current in-memory state.
   */
  loadData() {
    this.loadSuppliers();
    return {
      suppliers: this.suppliers,
      grnRecords: this.grnRecords,
      purchaseOrders: this.purchaseOrders
    };
  }

  saveData() {}

  savePOData() {}

  saveSupplierData() {}

  /**
   * Create a new supplier in the database via API.
   * @param {Object} data { name, mobile, email, bank_account }
   * @returns {Promise<Object>}
   */
  async createSupplier(data) {
    const payload = {
      name: (data.name || "").trim(),
      mobile: (data.mobile || data.phone || "").trim(),
      email: data.email && data.email.trim() ? data.email.trim() : null,
      bank_account: data.bank_account && data.bank_account.trim() ? data.bank_account.trim() : null
    };

    const response = await this.http.post("/advertising/suppliers", payload);
    const newRecord = response?.data || response;

    // Refresh suppliers list from database
    await this.fetchSuppliers({}, true);

    return newRecord;
  }

  /**
   * Update an existing supplier in the database via API.
   * @param {number|string} id
   * @param {Object} data { name, mobile, email, bank_account }
   * @returns {Promise<Object>}
   */
  async updateSupplier(id, data) {
    const payload = {
      name: (data.name || "").trim(),
      mobile: (data.mobile || data.phone || "").trim(),
      email: data.email && data.email.trim() ? data.email.trim() : null,
      bank_account: data.bank_account && data.bank_account.trim() ? data.bank_account.trim() : null
    };

    const response = await this.http.put(`/advertising/suppliers/${id}`, payload);
    const updatedRecord = response?.data || response;

    // Refresh suppliers list from database
    await this.fetchSuppliers({}, true);

    return updatedRecord;
  }

  /**
   * Toggle supplier active/disabled status via API.
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  async toggleSupplierStatus(id) {
    const response = await this.http.patch(`/advertising/suppliers/${id}/toggle-status`, {});
    await this.fetchSuppliers({}, true);
    return response;
  }

  /**
   * Delete / disable a supplier from the database via API.
   * @param {number|string} id
   * @returns {Promise<boolean>}
   */
  async deleteSupplier(id) {
    await this.http.delete(`/advertising/suppliers/${id}`);
    await this.fetchSuppliers({}, true);
    return true;
  }

  formatCurrency(amount) {
    return `Rs. ${(parseFloat(amount) || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  generateNextGrnNumber() {
    let maxNum = 0;
    this.grnRecords.forEach(r => {
      const match = r.grn_number && r.grn_number.match(/GRN-(?:\d+-)?(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `GRN-${String(nextNum).padStart(4, "0")}`;
  }

  generateNextPONumber() {
    let maxNum = 0;
    this.purchaseOrders.forEach(p => {
      const match = p.po_number && p.po_number.match(/PO-(?:\d+-)?(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `PO-${String(nextNum).padStart(4, "0")}`;
  }

  generateNextSupplierCode() {
    let maxNum = 0;
    this.suppliers.forEach(s => {
      const match = s.code && s.code.match(/SUP-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `SUP-${String(nextNum).padStart(3, "0")}`;
  }
}
