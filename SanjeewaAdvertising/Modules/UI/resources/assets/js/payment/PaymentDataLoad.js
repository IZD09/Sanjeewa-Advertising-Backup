/**
<<<<<<< Updated upstream:SanjeewaAdvertising/Modules/UI/resources/assets/js/payment/PaymentDataLoad.js
 * SanjeewaAdvertising - Payment Data Service & Request Handler
 * Handles API fetch requests, CSRF authentication, endpoints,
 * localStorage persistence, sample data enrichment, and UI data loading.
 */

"use strict";

import { TableBuilder } from "./TableBuilder.js";
import { InvoicePaymentRowBuilder } from "./InvoicePaymentRowBuilder.js";
import { GrnPaymentRowBuilder } from "./GrnPaymentRowBuilder.js";

export class PaymentDataLoad {
  /**
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    this.storageKeys = options.storageKeys || {
      orders: "sa_advertising_orders",
      orderPayments: "sa_advertising_payments",
      grnRecords: "sa_advertising_grn_records",
      grnPayments: "sa_advertising_grn_payments"
    };

    this.endpoints = options.endpoints || {
      invoicePayments: "/api/v1/payments/invoices",
      grnPayments: "/api/v1/payments/grn",
      orders: "/api/v1/orders",
      grnRecords: "/api/v1/grn"
    };
  }

  /* ==========================================================================
     CSRF & Fetch Request Handling
     ========================================================================== */

  /**
   * Retrieve Laravel CSRF token from DOM or meta tag.
   * @returns {string}
   */
  getCsrfToken() {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag && metaTag.content) {
      return metaTag.content;
    }
    const inputToken = document.querySelector('input[name="_token"]');
    if (inputToken && inputToken.value) {
      return inputToken.value;
    }
    return "";
  }

  /**
   * Universal fetch request wrapper with headers, JSON serialization, and error handling.
   *
   * @param {string} url
   * @param {Object} [options={}]
   * @returns {Promise<any>}
   */
  async request(url, options = {}) {
    const csrfToken = this.getCsrfToken();
    const defaultHeaders = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {})
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    };

    if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      // Remote endpoint unreachable/404; handled by caller with fallback
      throw error;
    }
  }

  /**
   * Convenience GET request helper.
   * @param {string} endpoint
   * @param {Object} [params={}]
   * @returns {Promise<any>}
   */
  async get(endpoint, params = {}) {
    let url = endpoint;
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        searchParams.append(k, v);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
    return this.request(url, { method: "GET" });
  }

  /**
   * Convenience POST request helper.
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise<any>}
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: data
    });
  }

  /**
   * Convenience PUT request helper.
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise<any>}
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: data
    });
  }

  /**
   * Convenience DELETE request helper.
   * @param {string} endpoint
   * @param {Object} [data={}]
   * @returns {Promise<any>}
   */
  async delete(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "DELETE",
      body: data
    });
  }

  /* ==========================================================================
     UI Data Loading & Table Row Builders Integration
     ========================================================================== */

  /**
   * Load Invoice Payment table rows mapped to InvoicePaymentRowBuilder instances.
   * @returns {Promise<InvoicePaymentRowBuilder[]>}
   */
  async loadInvoicePaymentRows() {
    const rawPayments = await this.loadOrderPayments();
    return InvoicePaymentRowBuilder.fromArray(rawPayments);
  }

  /**
   * Load GRN Payment table rows mapped to GrnPaymentRowBuilder instances.
   * @returns {Promise<GrnPaymentRowBuilder[]>}
   */
  async loadGrnPaymentRows() {
    const rawGrnPayments = await this.loadGrnPayments();
    return GrnPaymentRowBuilder.fromArray(rawGrnPayments);
  }

  /**
   * Render the Invoice Payment table utilizing TableBuilder and InvoicePaymentRowBuilder.
   * @param {string} [containerId="payInvoiceTableBody"]
   * @param {Array} [rows=null]
   * @returns {Promise<TableBuilder>}
   */
  async renderInvoicePaymentTable(containerId = "payInvoiceTableBody", rows = null) {
    const data = rows || (await this.requestInvoicePayments());
    return TableBuilder.renderInvoiceTable(data, { tbodyId: containerId });
  }

  /**
   * Render the GRN Payment table utilizing TableBuilder and GrnPaymentRowBuilder.
   * @param {string} [containerId="payGrnTableBody"]
   * @param {Array} [rows=null]
   * @returns {Promise<TableBuilder>}
   */
  async renderGrnPaymentTable(containerId = "payGrnTableBody", rows = null) {
    const data = rows || (await this.requestGrnPayments());
    return TableBuilder.renderGrnTable(data, { tbodyId: containerId });
  }

  /**
   * Load and populate datasets directly into the PaymentManager UI instance
   * using simulated/remote API requests and TableBuilder.
   * @param {Object} [manager=null]
   * @returns {Promise<{orders: Array, orderPayments: Array, grnRecords: Array, grnPayments: Array, invoiceRows: InvoicePaymentRowBuilder[], grnRows: GrnPaymentRowBuilder[]}>}
   */
  async loadIntoUI(manager = null) {
    const data = await this.loadInitialData();

    // 1. Render tables directly with TableBuilder
    TableBuilder.renderInvoiceTable(data.orderPayments);
    TableBuilder.renderGrnTable(data.grnPayments);

    const invoiceRows = InvoicePaymentRowBuilder.fromArray(data.orderPayments);
    const grnRows = GrnPaymentRowBuilder.fromArray(data.grnPayments);

    const app = manager || (typeof window !== "undefined" ? (window.paymentManager || window.paymentsManager) : null);

    if (app) {
      app.orders = data.orders || [];
      app.orderPayments = data.orderPayments || [];
      app.grnRecords = data.grnRecords || [];
      app.grnPayments = data.grnPayments || [];
      app.invoiceRows = invoiceRows;
      app.grnRows = grnRows;

      if (app.invoiceHandler) {
        app.invoiceHandler.render(data.orderPayments);
      }
      if (app.grnHandler) {
        app.grnHandler.render(data.grnPayments);
      }
      if (app.overviewHandler) {
        app.overviewHandler.updateKPIs(data.orderPayments, data.grnPayments);
        app.overviewHandler.renderOverviewTab(data.orderPayments, data.grnPayments);
      }
    }

    return {
      ...data,
      invoiceRows,
      grnRows
    };
  }

  /**
   * Load all payment, order, and GRN datasets from remote API or localStorage.
   * @returns {Promise<{orders: Array, orderPayments: Array, grnRecords: Array, grnPayments: Array}>}
   */
  async loadInitialData() {
    const [orders, orderPayments, grnRecords, grnPayments] = await Promise.all([
      this.loadOrders(),
      this.loadOrderPayments(),
      this.loadGrnRecords(),
      this.loadGrnPayments()
    ]);

    return {
      orders,
      orderPayments,
      grnRecords,
      grnPayments
    };
  }

  /**
   * Load orders (Jobs) list.
   * @returns {Promise<Array>}
   */
  async loadOrders() {
    try {
      const apiOrders = await this.get(this.endpoints.orders);
      if (Array.isArray(apiOrders) && apiOrders.length > 0) {
        this.saveOrders(apiOrders);
        return apiOrders;
      }
    } catch {
      // Fallback
    }

    const saved = localStorage.getItem(this.storageKeys.orders);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.warn("[PaymentDataLoad] Corrupt stored orders, re-seeding.", e);
      }
    }

    return this.seedDefaultOrders();
  }

  /**
   * Load GRN stock acquisition records.
   * @returns {Promise<Array>}
   */
  async loadGrnRecords() {
    try {
      const apiGrns = await this.get(this.endpoints.grnRecords);
      if (Array.isArray(apiGrns) && apiGrns.length > 0) {
        this.saveGrnRecords(apiGrns);
        return apiGrns;
      }
      if (apiGrns && Array.isArray(apiGrns.data) && apiGrns.data.length > 0) {
        this.saveGrnRecords(apiGrns.data);
        return apiGrns.data;
      }
    } catch {
      // Remote unavailable, fall back to stored or seed
    }

    const saved = localStorage.getItem(this.storageKeys.grnRecords);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.warn("[PaymentDataLoad] Corrupt stored GRN records, re-seeding.", e);
      }
    }

    return this.seedDefaultGrnRecords();
  }

  /**
   * Simulate realistic asynchronous network request with HTTP status.
   * @param {string} endpoint
   * @param {Object} mockResponse
   * @returns {Promise<Object>}
   */
  async simulateApiRequest(endpoint, mockResponse) {
    await new Promise((resolve) => setTimeout(resolve, 60));
    console.info(`[PaymentDataLoad] Handled request for [${endpoint}] with HTTP ${mockResponse.status}`);
    return mockResponse;
  }

  /**
   * Request handler for Invoice / Job Payments.
   * Handles remote API fetch or resolves via simulated request delivering demo dataset.
   * @returns {Promise<Array>}
   */
  async requestInvoicePayments() {
    try {
      const apiPayments = await this.get(this.endpoints.invoicePayments);
      if (Array.isArray(apiPayments) && apiPayments.length > 0) {
        this.saveOrderPayments(apiPayments);
        return apiPayments;
      }
      if (apiPayments && Array.isArray(apiPayments.data) && apiPayments.data.length > 0) {
        this.saveOrderPayments(apiPayments.data);
        return apiPayments.data;
      }
    } catch {
      // Remote unavailable, handle request via simulated demo response
    }

    // Deliver user demo data via simulated HTTP request
    const demoData = this.getDemoInvoicePayments();
    const simulated = await this.simulateApiRequest(this.endpoints.invoicePayments, {
      status: 200,
      statusText: "OK",
      data: demoData
    });

    this.saveOrderPayments(simulated.data);
    return simulated.data;
  }

  /**
   * Request handler for Supplier Stock / GRN Payments.
   * Handles remote API fetch or resolves via simulated request delivering demo dataset.
   * @returns {Promise<Array>}
   */
  async requestGrnPayments() {
    try {
      const apiGrnPayments = await this.get(this.endpoints.grnPayments);
      if (Array.isArray(apiGrnPayments) && apiGrnPayments.length > 0) {
        this.saveGrnPayments(apiGrnPayments);
        return apiGrnPayments;
      }
      if (apiGrnPayments && Array.isArray(apiGrnPayments.data) && apiGrnPayments.data.length > 0) {
        this.saveGrnPayments(apiGrnPayments.data);
        return apiGrnPayments.data;
      }
    } catch {
      // Remote unavailable, handle request via simulated demo response
    }

    // Deliver user demo data via simulated HTTP request
    const demoData = this.getDemoGrnPayments();
    const simulated = await this.simulateApiRequest(this.endpoints.grnPayments, {
      status: 200,
      statusText: "OK",
      data: demoData
    });

    this.saveGrnPayments(simulated.data);
    return simulated.data;
  }

  /**
   * Load invoice payments list via request handler.
   * @returns {Promise<Array>}
   */
  async loadOrderPayments() {
    return this.requestInvoicePayments();
  }

  /**
   * Load GRN supplier stock payments list via request handler.
   * @returns {Promise<Array>}
   */
  async loadGrnPayments() {
    return this.requestGrnPayments();
  }

  /* ==========================================================================
     Sample Data Enrichers & Default Seeders
     ========================================================================== */

  /**
   * Default sample orders seed data.
   * @returns {Array}
   */
  seedDefaultOrders() {
    const today = new Date();
    const formatDate = (d) => d.toISOString().split("T")[0];

    const orders = [
      {
        id: "ORD-2026-1048",
        customerName: "Kasun Jayasundara",
        customerMobile: "0771234567",
        productName: "Flex Banner (Normal 280gsm)",
        totalAmount: 7600.00,
        paidAmount: 7600.00,
        balanceAmount: 0.00,
        paymentStatus: "Paid",
        orderStatus: "Completed",
        date: formatDate(new Date(today.getTime() - 86400000 * 3))
      },
      {
        id: "ORD-2026-1049",
        customerName: "Dilhani Senaratne",
        customerMobile: "0719876543",
        productName: "Vinyl Sticker (Glossy)",
        totalAmount: 8060.00,
        paidAmount: 5000.00,
        balanceAmount: 3060.00,
        paymentStatus: "Partially Paid",
        orderStatus: "In Progress",
        date: formatDate(new Date(today.getTime() - 86400000 * 2))
      },
      {
        id: "ORD-2026-1050",
        customerName: "Sajith Warnakula",
        customerMobile: "0755554321",
        productName: "Business Cards (Matte + Spot UV)",
        totalAmount: 11000.00,
        paidAmount: 0.00,
        balanceAmount: 11000.00,
        paymentStatus: "Unpaid",
        orderStatus: "Pending",
        date: formatDate(today)
      },
      {
        id: "ORD-2026-1051",
        customerName: "Nuwan Weerasinghe",
        customerMobile: "0781122334",
        productName: "Rollup Banner Display (Complete Set)",
        totalAmount: 13000.00,
        paidAmount: 6500.00,
        balanceAmount: 6500.00,
        paymentStatus: "Partially Paid",
        orderStatus: "In Progress",
        date: formatDate(today)
      }
    ];

    this.saveOrders(orders);
    return orders;
  }

  /**
   * Default sample GRN records seed data.
   * @returns {Array}
   */
  seedDefaultGrnRecords() {
    const today = new Date();
    const formatDate = (d) => d.toISOString().split("T")[0];

    const grns = [
      {
        grn_id: "GRN-2610-001",
        grn_number: "GRN-2610-001",
        po_number: "PO-2026-088",
        supplier_id: "SUP-001",
        supplier_name: "PaperPro Lanka",
        stock_category: "300gsm Art Board & Cyan Ink",
        net_total: 87500.00,
        date: formatDate(new Date(today.getTime() - 86400000 * 2))
      },
      {
        grn_id: "GRN-2610-002",
        grn_number: "GRN-2610-002",
        po_number: "PO-2026-074",
        supplier_id: "SUP-003",
        supplier_name: "MegaFlex Imports",
        stock_category: "Flex Banner Heavy Star 380gsm",
        net_total: 108000.00,
        date: formatDate(new Date(today.getTime() - 86400000 * 1))
      },
      {
        grn_id: "GRN-2610-003",
        grn_number: "GRN-2610-003",
        po_number: "PO-2026-092",
        supplier_id: "SUP-002",
        supplier_name: "Flora Tech International",
        stock_category: "Solvent Inks & Cleaning Solvents",
        net_total: 64000.00,
        date: formatDate(today)
      },
      {
        grn_id: "GRN-2610-004",
        grn_number: "GRN-2610-004",
        po_number: "PO-2026-068",
        supplier_id: "SUP-005",
        supplier_name: "Star Media Group",
        stock_category: "Foam Boards 5mm & Acrylic Sheets",
        net_total: 42000.00,
        date: formatDate(today)
      },
      {
        grn_id: "GRN-2610-005",
        grn_number: "GRN-2610-005",
        po_number: "PO-2026-095",
        supplier_id: "SUP-004",
        supplier_name: "Avery Dennison Lanka",
        stock_category: "Vinyl Sticker Glossy Rolls",
        net_total: 96000.00,
        date: formatDate(today)
      }
    ];

    this.saveGrnRecords(grns);
    return grns;
  }

  /**
   * Get comprehensive demo dataset for Invoice Payments.
   * Adheres strictly to the user's order & invoice payment data structure.
   * @returns {Array}
   */
  getDemoInvoicePayments() {
    const today = new Date();
    const formatDate = (d) => d.toISOString().split("T")[0];

    return [
      {
        id: "ORD-2026-1048",
        customerName: "Kasun Jayasundara",
        customerMobile: "0771234567",
        productName: "Flex Banner (Normal 280gsm)",
        totalAmount: 7600.00,
        paidAmount: 7600.00,
        balanceAmount: 0.00,
        paymentStatus: "Paid",
        orderStatus: "Completed",
        date: formatDate(new Date(today.getTime() - 86400000 * 3)),
        paymentId: "PAY-INV-2026-001",
        orderId: "ORD-2026-1048",
        invoiceNo: "INV-2026-1048",
        totalBill: 7600.00,
        amount: 7600.00,
        balance: 0.00,
        stage: "Complete Payment",
        method: "Cash",
        ref: "CASH-REC-1048",
        note: "Settled in full upon job pickup"
      },
      {
        id: "ORD-2026-1049",
        customerName: "Dilhani Senaratne",
        customerMobile: "0719876543",
        productName: "Vinyl Sticker (Glossy)",
        totalAmount: 8060.00,
        paidAmount: 5000.00,
        balanceAmount: 3060.00,
        paymentStatus: "Partially Paid",
        orderStatus: "In Progress",
        date: formatDate(new Date(today.getTime() - 86400000 * 2)),
        paymentId: "PAY-INV-2026-002",
        orderId: "ORD-2026-1049",
        invoiceNo: "INV-2026-1049",
        totalBill: 8060.00,
        amount: 5000.00,
        balance: 3060.00,
        stage: "Advance Payment",
        method: "Card",
        ref: "VISA-AUTH-9921",
        note: "50% advance paid on Visa Debit"
      },
      {
        id: "ORD-2026-1050",
        customerName: "Sajith Warnakula",
        customerMobile: "0755554321",
        productName: "Business Cards (Matte + Spot UV)",
        totalAmount: 11000.00,
        paidAmount: 0.00,
        balanceAmount: 11000.00,
        paymentStatus: "Unpaid",
        orderStatus: "Pending",
        date: formatDate(today),
        paymentId: "PAY-INV-2026-003",
        orderId: "ORD-2026-1050",
        invoiceNo: "INV-2026-1050",
        totalBill: 11000.00,
        amount: 0.00,
        balance: 11000.00,
        stage: "Pending Payment",
        method: "Check",
        ref: "CHQ-PENDING",
        note: "Cheque promised upon final delivery"
      },
      {
        id: "ORD-2026-1051",
        customerName: "Nuwan Weerasinghe",
        customerMobile: "0781122334",
        productName: "Rollup Banner Display (Complete Set)",
        totalAmount: 13000.00,
        paidAmount: 6500.00,
        balanceAmount: 6500.00,
        paymentStatus: "Partially Paid",
        orderStatus: "In Progress",
        date: formatDate(today),
        paymentId: "PAY-INV-2026-004",
        orderId: "ORD-2026-1051",
        invoiceNo: "INV-2026-1051",
        totalBill: 13000.00,
        amount: 6500.00,
        balance: 6500.00,
        stage: "Advance Payment",
        method: "Bank Transfer",
        ref: "BOC-TXN-881920",
        note: "Direct online transfer to BOC"
      },
      {
        id: "ORD-2026-1052",
        customerName: "Thilini Perera",
        customerMobile: "0723344556",
        productName: "Acrylic 3D Letter Signboard",
        totalAmount: 34500.00,
        paidAmount: 34500.00,
        balanceAmount: 0.00,
        paymentStatus: "Paid",
        orderStatus: "Completed",
        date: formatDate(new Date(today.getTime() - 86400000 * 1)),
        paymentId: "PAY-INV-2026-005",
        orderId: "ORD-2026-1052",
        invoiceNo: "INV-2026-1052",
        totalBill: 34500.00,
        amount: 34500.00,
        balance: 0.00,
        stage: "Complete Payment",
        method: "Bank Transfer",
        ref: "HNB-TRANS-7721",
        note: "Full settlement transferred via HNB"
      },
      {
        id: "ORD-2026-1053",
        customerName: "Chaminda Bandara",
        customerMobile: "0779988776",
        productName: "Vehicle Branding (Full Van Wrap)",
        totalAmount: 68000.00,
        paidAmount: 35000.00,
        balanceAmount: 33000.00,
        paymentStatus: "Partially Paid",
        orderStatus: "In Progress",
        date: formatDate(new Date(today.getTime() - 86400000 * 4)),
        paymentId: "PAY-INV-2026-006",
        orderId: "ORD-2026-1053",
        invoiceNo: "INV-2026-1053",
        totalBill: 68000.00,
        amount: 35000.00,
        balance: 33000.00,
        stage: "Advance Payment",
        method: "Check",
        ref: "CHQ-COM-44391",
        note: "Cheque advance deposited for materials"
      },
      {
        id: "ORD-2026-1054",
        customerName: "Anusha Alwis",
        customerMobile: "0761122448",
        productName: "LED Light Box 4x3ft",
        totalAmount: 22400.00,
        paidAmount: 0.00,
        balanceAmount: 22400.00,
        paymentStatus: "Unpaid",
        orderStatus: "Pending",
        date: formatDate(new Date(today.getTime() - 86400000 * 1)),
        paymentId: "PAY-INV-2026-007",
        orderId: "ORD-2026-1054",
        invoiceNo: "INV-2026-1054",
        totalBill: 22400.00,
        amount: 0.00,
        balance: 22400.00,
        stage: "Pending Payment",
        method: "Cash",
        ref: "COD-DELIVERY",
        note: "Agreed COD payment on installation"
      },
      {
        id: "ORD-2026-1055",
        customerName: "Kusal Mendis",
        customerMobile: "0704433221",
        productName: "Promotional Canvas Prints & Flags",
        totalAmount: 14800.00,
        paidAmount: 14800.00,
        balanceAmount: 0.00,
        paymentStatus: "Paid",
        orderStatus: "Completed",
        date: formatDate(new Date(today.getTime() - 86400000 * 5)),
        paymentId: "PAY-INV-2026-008",
        orderId: "ORD-2026-1055",
        invoiceNo: "INV-2026-1055",
        totalBill: 14800.00,
        amount: 14800.00,
        balance: 0.00,
        stage: "Complete Payment",
        method: "Card",
        ref: "MC-AUTH-1102",
        note: "Paid in full on Mastercard"
      },
      {
        id: "ORD-2026-1056",
        customerName: "Niluka Gamage",
        customerMobile: "0712233445",
        productName: "Fabric Banner Backlit 10x8ft",
        totalAmount: 29000.00,
        paidAmount: 15000.00,
        balanceAmount: 14000.00,
        paymentStatus: "Partially Paid",
        orderStatus: "In Progress",
        date: formatDate(new Date(today.getTime() - 86400000 * 6)),
        paymentId: "PAY-INV-2026-009",
        orderId: "ORD-2026-1056",
        invoiceNo: "INV-2026-1056",
        totalBill: 29000.00,
        amount: 15000.00,
        balance: 14000.00,
        stage: "Advance Payment",
        method: "Bank Transfer",
        ref: "SAMPATH-TR-339",
        note: "Sampath Bank online transfer"
      },
      {
        id: "ORD-2026-1057",
        customerName: "Ruwan Fonseka",
        customerMobile: "0758877665",
        productName: "Die-cut Vinyl Labels (1000 pcs)",
        totalAmount: 9500.00,
        paidAmount: 9500.00,
        balanceAmount: 0.00,
        paymentStatus: "Paid",
        orderStatus: "Completed",
        date: formatDate(today),
        paymentId: "PAY-INV-2026-010",
        orderId: "ORD-2026-1057",
        invoiceNo: "INV-2026-1057",
        totalBill: 9500.00,
        amount: 9500.00,
        balance: 0.00,
        stage: "Complete Payment",
        method: "Cash",
        ref: "CASH-REC-1057",
        note: "Counter cash payment received"
      },
      {
        id: "ORD-2026-1058",
        customerName: "Priyantha Kumara",
        customerMobile: "0789900112",
        productName: "Shop Front Fascia Board 20x4ft",
        totalAmount: 92000.00,
        paidAmount: 46000.00,
        balanceAmount: 46000.00,
        paymentStatus: "Partially Paid",
        orderStatus: "In Progress",
        date: formatDate(today),
        paymentId: "PAY-INV-2026-011",
        orderId: "ORD-2026-1058",
        invoiceNo: "INV-2026-1058",
        totalBill: 92000.00,
        amount: 46000.00,
        balance: 46000.00,
        stage: "Advance Payment",
        method: "Check",
        ref: "CHQ-77892",
        note: "Commercial Bank cheque for 50% advance"
      }
    ];
  }

  /**
   * Get comprehensive demo dataset for GRN Supplier Stock Payments.
   * Adheres strictly to the user's supplier & GRN data structure.
   * @returns {Array}
   */
  getDemoGrnPayments() {
    const today = new Date();
    const formatDate = (d) => d.toISOString().split("T")[0];

    return [
      {
        grn_id: "GRN-2610-001",
        grn_number: "GRN-2610-001",
        po_number: "PO-2026-088",
        supplier_id: "SUP-001",
        supplier_name: "PaperPro Lanka",
        stock_category: "300gsm Art Board & Cyan Ink",
        net_total: 87500.00,
        date: formatDate(new Date(today.getTime() - 86400000 * 2)),
        paymentId: "PAY-GRN-2026-001",
        grnId: "GRN-2610-001",
        poNumber: "PO-2026-088",
        supplierId: "SUP-001",
        supplierName: "PaperPro Lanka",
        stockCategory: "300gsm Art Board & Cyan Ink",
        totalBill: 87500.00,
        amount: 87500.00,
        balance: 0.00,
        stage: "Complete Payment",
        method: "Check",
        ref: "CHQ-SUP-99210",
        note: "Issued corporate cheque #99210 cleared"
      },
      {
        grn_id: "GRN-2610-002",
        grn_number: "GRN-2610-002",
        po_number: "PO-2026-074",
        supplier_id: "SUP-003",
        supplier_name: "MegaFlex Imports",
        stock_category: "Flex Banner Heavy Star 380gsm",
        net_total: 108000.00,
        date: formatDate(new Date(today.getTime() - 86400000 * 1)),
        paymentId: "PAY-GRN-2026-002",
        grnId: "GRN-2610-002",
        poNumber: "PO-2026-074",
        supplierId: "SUP-003",
        supplierName: "MegaFlex Imports",
        stockCategory: "Flex Banner Heavy Star 380gsm",
        totalBill: 108000.00,
        amount: 50000.00,
        balance: 58000.00,
        stage: "Advance Payment",
        method: "Bank Transfer",
        ref: "BOC-SUP-1182",
        note: "50k advance transferred to MegaFlex"
      },
      {
        grn_id: "GRN-2610-003",
        grn_number: "GRN-2610-003",
        po_number: "PO-2026-092",
        supplier_id: "SUP-002",
        supplier_name: "Flora Tech International",
        stock_category: "Solvent Inks & Cleaning Solvents",
        net_total: 64000.00,
        date: formatDate(today),
        paymentId: "PAY-GRN-2026-003",
        grnId: "GRN-2610-003",
        poNumber: "PO-2026-092",
        supplierId: "SUP-002",
        supplierName: "Flora Tech International",
        stockCategory: "Solvent Inks & Cleaning Solvents",
        totalBill: 64000.00,
        amount: 0.00,
        balance: 64000.00,
        stage: "Pending Payment",
        method: "Check",
        ref: "PO-2026-092",
        note: "Credit terms: 14 days credit invoice"
      },
      {
        grn_id: "GRN-2610-004",
        grn_number: "GRN-2610-004",
        po_number: "PO-2026-068",
        supplier_id: "SUP-005",
        supplier_name: "Star Media Group",
        stock_category: "Foam Boards 5mm & Acrylic Sheets",
        net_total: 42000.00,
        date: formatDate(today),
        paymentId: "PAY-GRN-2026-004",
        grnId: "GRN-2610-004",
        poNumber: "PO-2026-068",
        supplierId: "SUP-005",
        supplierName: "Star Media Group",
        stockCategory: "Foam Boards 5mm & Acrylic Sheets",
        totalBill: 42000.00,
        amount: 42000.00,
        balance: 0.00,
        stage: "Complete Payment",
        method: "Cash",
        ref: "CASH-VOUCH-088",
        note: "COD delivery paid via shop cash"
      },
      {
        grn_id: "GRN-2610-005",
        grn_number: "GRN-2610-005",
        po_number: "PO-2026-095",
        supplier_id: "SUP-004",
        supplier_name: "Avery Dennison Lanka",
        stock_category: "Vinyl Sticker Glossy Rolls",
        net_total: 96000.00,
        date: formatDate(today),
        paymentId: "PAY-GRN-2026-005",
        grnId: "GRN-2610-005",
        poNumber: "PO-2026-095",
        supplierId: "SUP-004",
        supplierName: "Avery Dennison Lanka",
        stockCategory: "Vinyl Sticker Glossy Rolls",
        totalBill: 96000.00,
        amount: 48000.00,
        balance: 48000.00,
        stage: "Advance Payment",
        method: "Check",
        ref: "CHQ-22918",
        note: "Cheque installment 1 cleared"
      },
      {
        grn_id: "GRN-2610-006",
        grn_number: "GRN-2610-006",
        po_number: "PO-2026-101",
        supplier_id: "SUP-006",
        supplier_name: "Alpha Display Systems",
        stock_category: "Aluminum Rollup Stands (50 units)",
        net_total: 75000.00,
        date: formatDate(new Date(today.getTime() - 86400000 * 3)),
        paymentId: "PAY-GRN-2026-006",
        grnId: "GRN-2610-006",
        poNumber: "PO-2026-101",
        supplierId: "SUP-006",
        supplierName: "Alpha Display Systems",
        stockCategory: "Aluminum Rollup Stands (50 units)",
        totalBill: 75000.00,
        amount: 75000.00,
        balance: 0.00,
        stage: "Complete Payment",
        method: "Bank Transfer",
        ref: "HNB-CORP-4401",
        note: "Full settlement transferred via HNB"
      },
      {
        grn_id: "GRN-2610-007",
        grn_number: "GRN-2610-007",
        po_number: "PO-2026-104",
        supplier_id: "SUP-007",
        supplier_name: "Colombo LED World",
        stock_category: "High-lumen LED Module Backlights",
        net_total: 53000.00,
        date: formatDate(new Date(today.getTime() - 86400000 * 4)),
        paymentId: "PAY-GRN-2026-007",
        grnId: "GRN-2610-007",
        poNumber: "PO-2026-104",
        supplierId: "SUP-007",
        supplierName: "Colombo LED World",
        stockCategory: "High-lumen LED Module Backlights",
        totalBill: 53000.00,
        amount: 25000.00,
        balance: 28000.00,
        stage: "Advance Payment",
        method: "Card",
        ref: "CORP-VISA-3310",
        note: "Advance payment on commercial Visa"
      },
      {
        grn_id: "GRN-2610-008",
        grn_number: "GRN-2610-008",
        po_number: "PO-2026-108",
        supplier_id: "SUP-008",
        supplier_name: "Prime Chem Distributors",
        stock_category: "Eco-Solvent Cyan & Magenta Inks",
        net_total: 48500.00,
        date: formatDate(new Date(today.getTime() - 86400000 * 1)),
        paymentId: "PAY-GRN-2026-008",
        grnId: "GRN-2610-008",
        poNumber: "PO-2026-108",
        supplierId: "SUP-008",
        supplierName: "Prime Chem Distributors",
        stockCategory: "Eco-Solvent Cyan & Magenta Inks",
        totalBill: 48500.00,
        amount: 0.00,
        balance: 48500.00,
        stage: "Pending Payment",
        method: "Bank Transfer",
        ref: "INV-SUP-9011",
        note: "Invoice received, due end of month"
      },
      {
        grn_id: "GRN-2610-009",
        grn_number: "GRN-2610-009",
        po_number: "PO-2026-112",
        supplier_id: "SUP-009",
        supplier_name: "Lanka Acrylic Mart",
        stock_category: "3mm Cast Acrylic Clear & Opal Sheets",
        net_total: 82000.00,
        date: formatDate(new Date(today.getTime() - 86400000 * 5)),
        paymentId: "PAY-GRN-2026-009",
        grnId: "GRN-2610-009",
        poNumber: "PO-2026-112",
        supplierId: "SUP-009",
        supplierName: "Lanka Acrylic Mart",
        stockCategory: "3mm Cast Acrylic Clear & Opal Sheets",
        totalBill: 82000.00,
        amount: 82000.00,
        balance: 0.00,
        stage: "Complete Payment",
        method: "Check",
        ref: "CHQ-98114",
        note: "Cheque cleared at Commercial Bank"
      },
      {
        grn_id: "GRN-2610-010",
        grn_number: "GRN-2610-010",
        po_number: "PO-2026-115",
        supplier_id: "SUP-010",
        supplier_name: "PrintCare Pack Lanka",
        stock_category: "Lamination Matte Film Rolls 50 micron",
        net_total: 36000.00,
        date: formatDate(today),
        paymentId: "PAY-GRN-2026-010",
        grnId: "GRN-2610-010",
        poNumber: "PO-2026-115",
        supplierId: "SUP-010",
        supplierName: "PrintCare Pack Lanka",
        stockCategory: "Lamination Matte Film Rolls 50 micron",
        totalBill: 36000.00,
        amount: 18000.00,
        balance: 18000.00,
        stage: "Advance Payment",
        method: "Cash",
        ref: "PETTY-CASH-712",
        note: "Cash voucher part-payment issued"
      }
    ];
  }

  /**
   * Enrich order payments with comprehensive sample data if fewer than 3 exist.
   * @param {Array} existingPayments
   * @returns {Array}
   */
  enrichOrderPayments(existingPayments = []) {
    if (Array.isArray(existingPayments) && existingPayments.length >= 4) {
      return existingPayments;
    }
    return this.getDemoInvoicePayments();
  }

  /**
   * Seed default GRN payments covering multiple methods, stages, and suppliers.
   * @returns {Array}
   */
  seedDefaultGrnPayments() {
    return this.getDemoGrnPayments();
  }

  /* ==========================================================================
     Persistence Methods
     ========================================================================== */

  /**
   * Save order payments to localStorage.
   * @param {Array} orderPayments
   */
  saveOrderPayments(orderPayments) {
    try {
      localStorage.setItem(this.storageKeys.orderPayments, JSON.stringify(orderPayments));
    } catch (e) {
      console.error("[PaymentDataLoad] Failed to save order payments to localStorage", e);
    }
  }

  /**
   * Save GRN payments to localStorage.
   * @param {Array} grnPayments
   */
  saveGrnPayments(grnPayments) {
    try {
      localStorage.setItem(this.storageKeys.grnPayments, JSON.stringify(grnPayments));
    } catch (e) {
      console.error("[PaymentDataLoad] Failed to save GRN payments to localStorage", e);
    }
  }

  /**
   * Save orders to localStorage.
   * @param {Array} orders
   */
  saveOrders(orders) {
    try {
      localStorage.setItem(this.storageKeys.orders, JSON.stringify(orders));
    } catch (e) {
      console.error("[PaymentDataLoad] Failed to save orders to localStorage", e);
    }
  }

  /**
   * Save GRN records to localStorage.
   * @param {Array} grnRecords
   */
  saveGrnRecords(grnRecords) {
    try {
      localStorage.setItem(this.storageKeys.grnRecords, JSON.stringify(grnRecords));
    } catch (e) {
      console.error("[PaymentDataLoad] Failed to save GRN records to localStorage", e);
    }
  }
}

export default PaymentDataLoad;
=======
 * SanjeewaAdvertising - Payment Data Load Alias
 *
 * Provides compatibility aliases for PaymentsDataLoader & PaymentsDataService.
 */

export { PaymentsDataLoader, PaymentsDataService, PaymentsDataLoader as PaymentDataLoad, default } from "./PaymentsDataLoader.js";
>>>>>>> Stashed changes:SanjeewaAdvertising/Modules/UI/resources/assets/js/payments/PaymentDataLoad.js
