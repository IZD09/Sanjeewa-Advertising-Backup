/**
 * SanjeewaAdvertising - Place Order Data Service
 * Responsible for handling fetch requests, CSRF authentication,
 * API communication, localStorage caching, and sample seed data.
 */

import { PrintingOrderBuilder, PrintingOrder } from "./PrintingOrderBuilder.js";
import { RequestHandler } from "../core/RequestHandler.js";

export const PRINTING_TYPES = [
  { key: "flex", name: "Flex & Banners (Area Based)" },
  { key: "sticker", name: "Stickers & Vinyls (Area Based)" },
  { key: "commercial", name: "Cards & Leaflets (Unit / Quantity Based)" },
  { key: "signage", name: "Rigid Signage & Backlit" }
];

export const PRINTING_TYPE_PRODUCTS = {
  flex: [
    { key: "flex_normal", name: "Flex Banner (Normal 280gsm) — Rs. 95/sq.ft", defaultUnit: "feet", unitPrice: 95.00 },
    { key: "flex_star", name: "Flex Banner (Star / Heavy 380gsm) — Rs. 135/sq.ft", defaultUnit: "feet", unitPrice: 135.00 },
    { key: "rollup_banner", name: "Rollup Banner Display (Complete Set) — Rs. 6,500/unit", defaultUnit: "feet", unitPrice: 6500.00 }
  ],
  sticker: [
    { key: "sticker_glossy", name: "Vinyl Sticker (Glossy) — Rs. 140/sq.ft", defaultUnit: "feet", unitPrice: 140.00 },
    { key: "sticker_matte", name: "Vinyl Sticker (Matte) — Rs. 155/sq.ft", defaultUnit: "feet", unitPrice: 155.00 },
    { key: "sticker_clear", name: "Clear / Transparent Vinyl — Rs. 175/sq.ft", defaultUnit: "feet", unitPrice: 175.00 },
    { key: "oneway_vision", name: "One-Way Vision Film — Rs. 210/sq.ft", defaultUnit: "feet", unitPrice: 210.00 }
  ],
  commercial: [
    { key: "business_card_std", name: "Business Cards (Standard 350gsm) — Rs. 12/card", defaultUnit: "mm", unitPrice: 12.00 },
    { key: "business_card_lux", name: "Business Cards (Matte + Spot UV) — Rs. 22/card", defaultUnit: "mm", unitPrice: 22.00 },
    { key: "flyer_a5", name: "Flyers / Leaflets (A5 Full Color) — Rs. 15/leaflet", defaultUnit: "mm", unitPrice: 15.00 },
    { key: "flyer_a4", name: "Flyers / Leaflets (A4 Full Color) — Rs. 25/leaflet", defaultUnit: "mm", unitPrice: 25.00 }
  ],
  signage: [
    { key: "foam_board", name: "Foam Board Signage (5mm) — Rs. 280/sq.ft", defaultUnit: "feet", unitPrice: 280.00 },
    { key: "acrylic_sign", name: "Acrylic Lettering Sign — Rs. 650/sq.ft", defaultUnit: "inches", unitPrice: 650.00 },
    { key: "backlit_film", name: "Lightbox Backlit Film — Rs. 240/sq.ft", defaultUnit: "feet", unitPrice: 240.00 }
  ]
};

export class PlaceOrderDataLoad {
  /**
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    this.storageKeys = options.storageKeys || {
      orders: "sa_advertising_orders",
      payments: "sa_advertising_payments",
      customers: "sa_advertising_customers",
      audit: "sa_advertising_audit_log"
    };

    this.endpoints = options.endpoints || {
      orders: "/api/v1/print-jobs/place-order-data",
      fallbackOrders: "/print-jobs/place-order-data",
      customers: "/api/v1/customers",
      payments: "/api/v1/payments"
    };

    this.productsCatalog = {
      flex_normal: { name: "Flex Banner (Normal 280gsm)", category: "area", unitPrice: 95.00, defaultUnit: "feet" },
      flex_star: { name: "Flex Banner (Star / Heavy 380gsm)", category: "area", unitPrice: 135.00, defaultUnit: "feet" },
      sticker_glossy: { name: "Vinyl Sticker (Glossy)", category: "area", unitPrice: 140.00, defaultUnit: "feet" },
      sticker_matte: { name: "Vinyl Sticker (Matte)", category: "area", unitPrice: 155.00, defaultUnit: "feet" },
      sticker_clear: { name: "Clear / Transparent Sticker", category: "area", unitPrice: 175.00, defaultUnit: "feet" },
      oneway_vision: { name: "One-Way Vision Film", category: "area", unitPrice: 210.00, defaultUnit: "feet" },
      business_card_std: { name: "Business Cards (Standard 350gsm)", category: "unit", unitPrice: 12.00, defaultUnit: "mm" },
      business_card_lux: { name: "Business Cards (Matte + Spot UV)", category: "unit", unitPrice: 22.00, defaultUnit: "mm" },
      flyer_a5: { name: "Flyers / Leaflets (A5 Full Color)", category: "unit", unitPrice: 15.00, defaultUnit: "mm" },
      flyer_a4: { name: "Flyers / Leaflets (A4 Full Color)", category: "unit", unitPrice: 25.00, defaultUnit: "mm" },
      rollup_banner: { name: "Rollup Banner Display (Complete Set)", category: "unit", unitPrice: 6500.00, defaultUnit: "feet" },
      foam_board: { name: "Foam Board Signage (5mm)", category: "area", unitPrice: 280.00, defaultUnit: "feet" },
      acrylic_sign: { name: "Acrylic Lettering Sign", category: "area", unitPrice: 650.00, defaultUnit: "inches" },
      backlit_film: { name: "Lightbox Backlit Film", category: "area", unitPrice: 240.00, defaultUnit: "feet" }
    };

    this.http = new RequestHandler();
  }

  /* ==========================================================================
     CSRF & Fetch Request Wrapper
     ========================================================================== */

  /**
   * Retrieve Laravel CSRF token.
   * @returns {string}
   */
  getCsrfToken() {
    return this.http.getCsrfToken();
  }

  /**
   * Universal request wrapper delegating to core RequestHandler.
   *
   * @param {string} url
   * @param {Object} [options={}]
   * @returns {Promise<any>}
   */
  async request(url, options = {}) {
    return this.http.request(url, options);
  }

  /* ==========================================================================
     Initial Data Loading (API + LocalStorage Fallback)
     ========================================================================== */

  /**
   * Load all initial state datasets: customers, orders, payments, products.
   * Checks API first; falls back to localStorage; if empty, uses default seeds.
   *
   * @returns {Promise<{customers: Array, orders: PrintingOrder[], payments: Array, products: Object}>}
   */
  async loadInitialData() {
    let customers = await this.loadCustomers();
    let { orders, payments } = await this.loadOrdersAndPayments();

    return {
      customers,
      orders,
      payments,
      products: this.productsCatalog
    };
  }

  /**
   * Load customers list from backend API or local storage.
   *
   * @returns {Promise<Array>}
   */
  async loadCustomers() {
    // 1. Attempt API fetch from Customers endpoint
    try {
      const result = await this.request(this.endpoints.customers, { method: "GET" });
      if (Array.isArray(result) && result.length > 0) {
        this.saveCustomers(result);
        return result;
      }
      if (result && Array.isArray(result.data) && result.data.length > 0) {
        this.saveCustomers(result.data);
        return result.data;
      }
    } catch (err) {
      console.warn("[PlaceOrderDataLoad] Customers API fetch failed, trying local storage:", err);
    }

    // 2. Fallback to localStorage
    const stored = localStorage.getItem(this.storageKeys.customers);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (err) {
        console.warn("[PlaceOrderDataLoad] Corrupt stored customers.");
      }
    }

    return [];
  }

  /**
   * Load orders and payment records from the PrintJob module API.
   * Sends request via RequestHandler to the PrintJob module endpoint.
   *
   * @returns {Promise<{orders: PrintingOrder[], payments: Array}>}
   */
  async loadOrdersAndPayments() {
    // 1. Attempt API fetch from PrintJob module using RequestHandler
    try {
      let result = null;
      try {
        result = await this.http.get(this.endpoints.orders);
      } catch (e) {
        if (this.endpoints.fallbackOrders) {
          result = await this.http.get(this.endpoints.fallbackOrders);
        } else {
          throw e;
        }
      }

      const payload = (result && result.data) ? result.data : result;
      const rawOrders = Array.isArray(payload?.orders)
        ? payload.orders
        : (Array.isArray(payload) ? payload : null);

      if (rawOrders && rawOrders.length > 0) {
        const rawPayments = Array.isArray(payload?.payments) ? payload.payments : [];

        this.saveOrders(rawOrders);
        if (rawPayments.length > 0) {
          this.savePayments(rawPayments);
        }

        return {
          orders: PrintingOrder.fromArray(rawOrders),
          payments: rawPayments
        };
      }
    } catch (err) {
      console.warn("[PlaceOrderDataLoad] PrintJob API fetch failed, trying local storage fallback:", err);
    }

    // 2. Fallback to localStorage if API unavailable
    const storedOrders = localStorage.getItem(this.storageKeys.orders);
    const storedPayments = localStorage.getItem(this.storageKeys.payments);

    if (storedOrders) {
      try {
        const parsedOrders = JSON.parse(storedOrders);
        const parsedPayments = storedPayments ? JSON.parse(storedPayments) : [];

        if (Array.isArray(parsedOrders) && parsedOrders.length > 0 && parsedOrders[0].id) {
          return {
            orders: PrintingOrder.fromArray(parsedOrders),
            payments: Array.isArray(parsedPayments) ? parsedPayments : []
          };
        }
      } catch (err) {
        console.warn("[PlaceOrderDataLoad] Corrupt stored orders/payments.");
      }
    }

    return { orders: [], payments: [] };
  }

  /**
   * Directly reload orders from PrintJob module via RequestHandler and refresh the table.
   *
   * @param {Object} [params={}]
   * @returns {Promise<{orders: PrintingOrder[], payments: Array, kpis: Object|null}>}
   */
  async fetchPrintJobOrders(params = {}) {
    let result = null;
    try {
      result = await this.http.get(this.endpoints.orders, params);
    } catch (e) {
      if (this.endpoints.fallbackOrders) {
        result = await this.http.get(this.endpoints.fallbackOrders, params);
      } else {
        throw e;
      }
    }

    const payload = (result && result.data) ? result.data : result;
    const rawOrders = Array.isArray(payload?.orders)
      ? payload.orders
      : (Array.isArray(payload) ? payload : []);
    const rawPayments = Array.isArray(payload?.payments) ? payload.payments : [];
    const kpis = payload?.kpis || null;

    if (rawOrders.length > 0) {
      this.saveOrders(rawOrders);
    }
    if (rawPayments.length > 0) {
      this.savePayments(rawPayments);
    }

    return {
      orders: PrintingOrder.fromArray(rawOrders),
      payments: rawPayments,
      kpis
    };
  }

  /* ==========================================================================
     Storage & Persistence Helpers
     ========================================================================== */

  saveOrders(orders) {
    try {
      localStorage.setItem(this.storageKeys.orders, JSON.stringify(orders));
    } catch (err) {
      console.error("[PlaceOrderDataLoad] Failed to save orders to localStorage:", err);
    }
  }

  savePayments(payments) {
    try {
      localStorage.setItem(this.storageKeys.payments, JSON.stringify(payments));
    } catch (err) {
      console.error("[PlaceOrderDataLoad] Failed to save payments to localStorage:", err);
    }
  }

  saveCustomers(customers) {
    try {
      localStorage.setItem(this.storageKeys.customers, JSON.stringify(customers));
    } catch (err) {
      console.error("[PlaceOrderDataLoad] Failed to save customers to localStorage:", err);
    }
  }

  logAudit(action, orderId, details) {
    try {
      const logs = JSON.parse(localStorage.getItem(this.storageKeys.audit) || "[]");
      logs.unshift({
        timestamp: new Date().toISOString(),
        action,
        orderId,
        details,
        user: "Admin User"
      });
      localStorage.setItem(this.storageKeys.audit, JSON.stringify(logs.slice(0, 100)));
    } catch (err) {
      console.warn("[PlaceOrderDataLoad] Could not write audit log:", err);
    }
  }
}

export default PlaceOrderDataLoad;

