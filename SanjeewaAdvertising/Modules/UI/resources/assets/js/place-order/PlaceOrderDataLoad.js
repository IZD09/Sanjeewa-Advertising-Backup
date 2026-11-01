/**
 * SanjeewaAdvertising - Place Order Data Service
 * Responsible for handling fetch requests, CSRF authentication,
 * API communication, localStorage caching, and sample seed data.
 */

import { PrintingOrderBuilder, PrintingOrder } from "./PrintingOrderBuilder.js";
import { RequestHandler } from "../core/RequestHandler.js";

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
      orders: "/api/v1/orders",
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
   * Load customers list.
   * @returns {Promise<Array>}
   */
  async loadCustomers() {
    // Attempt API fetch
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
    } catch {
      // API unavailable or empty; fallback to localStorage
    }

    const stored = localStorage.getItem(this.storageKeys.customers);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (err) {
        console.warn("[PlaceOrderDataLoad] Corrupt stored customers, re-seeding.");
      }
    }

    // Default Seed Customers
    const seeds = [
      { id: "CUST-001", name: "Kasun Jayasundara", mobile: "0771234567", address: "Colombo 03", type: "Regular" },
      { id: "CUST-002", name: "Dilhani Senaratne", mobile: "0719876543", address: "Kandy", type: "VIP" },
      { id: "CUST-003", name: "Sajith Warnakula", mobile: "0755554321", address: "Gampaha", type: "Corporate" },
      { id: "CUST-004", name: "Nadeeka Perera", mobile: "0723456789", address: "Negombo", type: "Regular" },
      { id: "CUST-005", name: "Nuwan Weerasinghe", mobile: "0781122334", address: "Kurunegala", type: "Corporate" }
    ];
    this.saveCustomers(seeds);
    return seeds;
  }

  /**
   * Load orders and payment records.
   * @returns {Promise<{orders: PrintingOrder[], payments: Array}>}
   */
  async loadOrdersAndPayments() {
    const storedOrders = localStorage.getItem(this.storageKeys.orders);
    const storedPayments = localStorage.getItem(this.storageKeys.payments);

    if (storedOrders && storedPayments) {
      try {
        const parsedOrders = JSON.parse(storedOrders);
        const parsedPayments = JSON.parse(storedPayments);

        if (Array.isArray(parsedOrders) && parsedOrders.length > 0 && parsedOrders[0].id) {
          return {
            orders: PrintingOrder.fromArray(parsedOrders),
            payments: Array.isArray(parsedPayments) ? parsedPayments : []
          };
        }
      } catch (err) {
        console.warn("[PlaceOrderDataLoad] Corrupt stored orders/payments, re-seeding.");
      }
    }

    // Generate Initial Sample Orders and Payments
    return this.seedInitialData();
  }

  /**
   * Generate default sample seed orders and payments.
   * @returns {{orders: PrintingOrder[], payments: Array}}
   */
  seedInitialData() {
    const today = new Date();
    const formatDate = (d) => d.toISOString().split("T")[0];

    const initialOrders = [
      {
        id: "ORD-2026-1048",
        orderDate: formatDate(new Date(today.getTime() - 86400000 * 3)),
        customerId: "CUST-001",
        customerName: "Kasun Jayasundara",
        customerMobile: "0771234567",
        productKey: "flex_normal",
        productName: "Flex Banner (Normal 280gsm)",
        width: 10,
        height: 4,
        unit: "feet",
        quantity: 2,
        areaSqFt: 80,
        unitPrice: 95.00,
        designStatus: "Customer Provides Design",
        deliveryMethod: "Pickup",
        requiredDate: formatDate(new Date(today.getTime() + 86400000 * 2)),
        totalAmount: 7600.00,
        paidAmount: 7600.00,
        balanceAmount: 0.00,
        paymentStatus: "Paid",
        orderStatus: "Completed",
        assignedEmployee: "Kasun Perera",
        notes: "Grommets on all 4 corners and reinforcement borders."
      },
      {
        id: "ORD-2026-1049",
        orderDate: formatDate(new Date(today.getTime() - 86400000 * 2)),
        customerId: "CUST-002",
        customerName: "Dilhani Senaratne",
        customerMobile: "0719876543",
        productKey: "sticker_glossy",
        productName: "Vinyl Sticker (Glossy)",
        width: 6,
        height: 3,
        unit: "feet",
        quantity: 3,
        areaSqFt: 54,
        unitPrice: 140.00,
        designStatus: "Shop Creates Design",
        deliveryMethod: "Delivery",
        requiredDate: formatDate(new Date(today.getTime() + 86400000 * 1)),
        totalAmount: 8060.00,
        paidAmount: 5000.00,
        balanceAmount: 3060.00,
        paymentStatus: "Partially Paid",
        orderStatus: "In Progress",
        assignedEmployee: "Nuwan Silva",
        notes: "Die-cut individual stickers for retail packaging."
      },
      {
        id: "ORD-2026-1050",
        orderDate: formatDate(today),
        customerId: "CUST-003",
        customerName: "Sajith Warnakula",
        customerMobile: "0755554321",
        productKey: "business_card_lux",
        productName: "Business Cards (Matte + Spot UV)",
        width: 90,
        height: 54,
        unit: "mm",
        quantity: 500,
        areaSqFt: 0,
        unitPrice: 22.00,
        designStatus: "Customer Provides Design",
        deliveryMethod: "Pickup",
        requiredDate: formatDate(new Date(today.getTime() + 86400000 * 4)),
        totalAmount: 11000.00,
        paidAmount: 0.00,
        balanceAmount: 11000.00,
        paymentStatus: "Unpaid",
        orderStatus: "Pending",
        assignedEmployee: "Dilshan Fernando",
        notes: "Double sided luxury print with spot UV logo."
      },
      {
        id: "ORD-2026-1051",
        orderDate: formatDate(today),
        customerId: "CUST-005",
        customerName: "Nuwan Weerasinghe",
        customerMobile: "0781122334",
        productKey: "rollup_banner",
        productName: "Rollup Banner Display (Complete Set)",
        width: 2.5,
        height: 6,
        unit: "feet",
        quantity: 2,
        areaSqFt: 30,
        unitPrice: 6500.00,
        designStatus: "Customer Provides Design",
        deliveryMethod: "Delivery",
        requiredDate: formatDate(new Date(today.getTime() + 86400000 * 3)),
        totalAmount: 13000.00,
        paidAmount: 6500.00,
        balanceAmount: 6500.00,
        paymentStatus: "Partially Paid",
        orderStatus: "In Progress",
        assignedEmployee: "Kasun Perera",
        notes: "Aluminium heavy-duty pull up base."
      }
    ];

    const initialPayments = [
      {
        paymentId: "PAY-2026-0001",
        orderId: "ORD-2026-1048",
        installmentNo: 1,
        date: formatDate(new Date(today.getTime() - 86400000 * 3)),
        amount: 4000.00,
        method: "Cash",
        ref: "RCPT-4091",
        receivedBy: "Admin User",
        status: "Successful",
        note: "Initial advance on order booking"
      },
      {
        paymentId: "PAY-2026-0002",
        orderId: "ORD-2026-1048",
        installmentNo: 2,
        date: formatDate(new Date(today.getTime() - 86400000 * 1)),
        amount: 3600.00,
        method: "Card",
        ref: "TXN-88402",
        receivedBy: "Admin User",
        status: "Successful",
        note: "Final payment settlement on collection"
      },
      {
        paymentId: "PAY-2026-0003",
        orderId: "ORD-2026-1049",
        installmentNo: 1,
        date: formatDate(new Date(today.getTime() - 86400000 * 2)),
        amount: 5000.00,
        method: "Bank Transfer",
        ref: "COM-SLIP-771",
        receivedBy: "Admin User",
        status: "Successful",
        note: "Commercial Bank deposit"
      },
      {
        paymentId: "PAY-2026-0004",
        orderId: "ORD-2026-1051",
        installmentNo: 1,
        date: formatDate(today),
        amount: 6500.00,
        method: "Cash",
        ref: "CSH-104",
        receivedBy: "Admin User",
        status: "Successful",
        note: "50% advance deposit"
      }
    ];

    const orders = PrintingOrder.fromArray(initialOrders);
    this.saveOrders(orders);
    this.savePayments(initialPayments);

    return { orders, payments: initialPayments };
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

