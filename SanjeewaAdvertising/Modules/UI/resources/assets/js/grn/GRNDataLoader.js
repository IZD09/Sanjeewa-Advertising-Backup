/**
 * SanjeewaAdvertising - GRN Data Loader
 *
 * Handles API communication via RequestHandler to the Supplier module,
 * client-side caching (localStorage), and code/number generators.
 * All demo and production records originate from backend Supplier service classes.
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

    this.poLoaded = false;
    this.grnLoaded = false;
    this.suppliersLoaded = false;
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
      const response = await this.http.get("/api/v1/suppliers/data", filters);
      const data = response?.data || response;
      const list = data?.suppliers || (Array.isArray(data) ? data : null);

      if (Array.isArray(list) && list.length > 0) {
        this.suppliers = list;
        this.saveSupplierData();
        this.suppliersLoaded = true;
        return this.suppliers;
      }
    } catch (e) {
      console.warn("[GRNDataLoader] Failed to fetch suppliers from API, checking local storage:", e);
    }

    const saved = localStorage.getItem(this.supplierStorageKey);
    if (saved) {
      try {
        this.suppliers = JSON.parse(saved);
      } catch (err) {
        this.suppliers = [];
      }
    }

    this.suppliersLoaded = true;
    return this.suppliers;
  }

  /**
   * Synchronously load suppliers from localStorage or trigger async fetch.
   * @returns {Array}
   */
  loadSuppliers() {
    const saved = localStorage.getItem(this.supplierStorageKey);
    if (saved) {
      try {
        this.suppliers = JSON.parse(saved);
      } catch (e) {
        this.suppliers = [];
      }
    }
    // Also trigger background fetch to ensure fresh server data
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
      const response = await this.http.get("/api/v1/purchase-orders/data", filters);
      const data = response?.data || response;
      const orders = data?.purchase_orders || data?.orders || (Array.isArray(data) ? data : null);

      if (Array.isArray(orders) && orders.length > 0) {
        this.purchaseOrders = orders;
        this.savePOData();
        this.poLoaded = true;
        return this.purchaseOrders;
      }
    } catch (e) {
      console.warn("[GRNDataLoader] Failed to fetch POs from API, checking local storage:", e);
    }

    const savedPOs = localStorage.getItem(this.poStorageKey);
    if (savedPOs) {
      try {
        this.purchaseOrders = JSON.parse(savedPOs);
      } catch (err) {
        this.purchaseOrders = [];
      }
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
      const response = await this.http.get("/api/v1/grns/data", filters);
      const data = response?.data || response;
      const grns = data?.grns || data?.records || (Array.isArray(data) ? data : null);

      if (Array.isArray(grns) && grns.length > 0) {
        this.grnRecords = grns;
        this.saveData();
        this.grnLoaded = true;
        return this.grnRecords;
      }
    } catch (e) {
      console.warn("[GRNDataLoader] Failed to fetch GRNs from API, checking local storage:", e);
    }

    const savedGrns = localStorage.getItem(this.storageKey);
    if (savedGrns) {
      try {
        this.grnRecords = JSON.parse(savedGrns);
      } catch (err) {
        this.grnRecords = [];
      }
    }

    this.grnLoaded = true;
    return this.grnRecords;
  }

  /**
   * Load data from localStorage or initialize empty arrays.
   */
  loadData() {
    this.loadSuppliers();

    const savedGrns = localStorage.getItem(this.storageKey);
    if (savedGrns) {
      try {
        this.grnRecords = JSON.parse(savedGrns);
      } catch (e) {
        this.grnRecords = [];
      }
    }

    const savedPOs = localStorage.getItem(this.poStorageKey);
    if (savedPOs) {
      try {
        this.purchaseOrders = JSON.parse(savedPOs);
      } catch (e) {
        this.purchaseOrders = [];
      }
    }

    return {
      suppliers: this.suppliers,
      grnRecords: this.grnRecords,
      purchaseOrders: this.purchaseOrders
    };
  }

  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.grnRecords));
  }

  savePOData() {
    localStorage.setItem(this.poStorageKey, JSON.stringify(this.purchaseOrders));
  }

  saveSupplierData() {
    localStorage.setItem(this.supplierStorageKey, JSON.stringify(this.suppliers));
  }

  formatCurrency(amount) {
    return `Rs. ${(parseFloat(amount) || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  generateNextGrnNumber() {
    let maxNum = 5;
    this.grnRecords.forEach(r => {
      const match = r.grn_number && r.grn_number.match(/GRN-\d+-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `GRN-2610-${String(nextNum).padStart(3, "0")}`;
  }

  generateNextPONumber() {
    let maxNum = 98;
    this.purchaseOrders.forEach(p => {
      const match = p.po_number && p.po_number.match(/PO-\d+-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `PO-2026-${String(nextNum).padStart(3, "0")}`;
  }

  generateNextSupplierCode() {
    let maxNum = 8;
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
