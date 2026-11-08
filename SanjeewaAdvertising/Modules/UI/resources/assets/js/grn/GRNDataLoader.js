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
    this.purchaseOrders = [];
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
      const response = await this.http.get("/api/v1/suppliers/data", params);
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
      const response = await this.http.get("/api/v1/purchase-orders/data", params);
      const data = response?.data || response;
      const orders = data?.purchase_orders ?? data?.orders ?? (Array.isArray(data) ? data : []);

      if (Array.isArray(orders)) {
        this.purchaseOrders = orders;
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
      const response = await this.http.get("/api/v1/grns/data", params);
      const data = response?.data || response;
      const grns = data?.grns ?? data?.records ?? (Array.isArray(data) ? data : []);

      if (Array.isArray(grns)) {
        this.grnRecords = grns;
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
