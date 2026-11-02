/**
 * SanjeewaAdvertising - Payments Data Service
 *
 * Server-driven data service modeled after DashboardDataService in UI:
 * All records are loaded directly from the backend modules via RequestHandler:
 *   1. loadInvoicePayments(): GET request to Invoice module (/api/v1/invoices or /api/v1/invoices/all)
 *   2. loadGrnPayments(): GET request to Transaction module (/api/v1/grn-payments or /api/v1/grn-payments/all)
 *   3. loadOperatingExpenses(): GET request to Transaction module (/api/v1/payments)
 */

import { RequestHandler } from "../core/RequestHandler.js";

export class PaymentsDataService {
  /**
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    this.http = new RequestHandler();

    this.endpoints = options.endpoints || {
      invoices: "/api/v1/invoices",
      invoicesFallback: "/api/v1/invoices/all",
      grnPayments: "/api/v1/grn-payments",
      grnPaymentsFallback: "/api/v1/grn-payments/all",
      expenses: "/api/v1/payments",
      expensesFallback: "/transactions"
    };

    this.storageKeys = {
      orders: "sa_advertising_orders",
      orderPayments: "sa_advertising_payments",
      grnRecords: "sa_advertising_grn_records",
      grnPayments: "sa_advertising_grn_payments",
      operatingExpenses: "sa_advertising_operating_expenses"
    };

    this.orders = [];
    this.orderPayments = [];
    this.grnRecords = [];
    this.grnPayments = [];
    this.expenses = [];

    this.loading = {
      invoices: false,
      grn: false,
      expenses: false
    };

    this.callbacks = [];

    // Pre-populate with cached data from localStorage if available
    this.loadData();
  }

  /**
   * Subscribe to data updates (matching DashboardDataService pattern).
   * @param {Function} callback
   * @returns {Function} Unsubscribe
   */
  onData(callback) {
    if (typeof callback === "function") {
      this.callbacks.push(callback);
    }
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Broadcast data changes to listeners.
   * @param {string} type
   * @param {*} payload
   */
  emitData(type, payload) {
    this.callbacks.forEach(cb => {
      try {
        cb(type, payload);
      } catch (err) {
        console.error("[PaymentsDataService] Callback error:", err);
      }
    });
  }

  /* ==========================================================================
     REQUEST 1: INVOICE MODULE (Customer Print Job Invoices)
     ========================================================================== */

  /**
   * Load Invoice payments from backend Invoice module API via RequestHandler.
   *
   * @returns {Promise<Array>}
   */
  async loadInvoicePayments() {
    this.loading.invoices = true;
    try {
      let result = null;
      try {
        result = await this.http.get(this.endpoints.invoices);
      } catch (err) {
        if (this.endpoints.invoicesFallback) {
          result = await this.http.get(this.endpoints.invoicesFallback);
        } else {
          throw err;
        }
      }

      const payload = (result && result.data) ? result.data : result;
      const raw = Array.isArray(payload?.invoices)
        ? payload.invoices
        : (Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : null));

      if (raw && raw.length > 0) {
        this.orderPayments = raw.map(item => this.normalizeInvoice(item));
        this.saveOrderPayments();
        this.emitData("invoices", this.orderPayments);
        return this.orderPayments;
      }
    } catch (e) {
      console.warn("[PaymentsDataService] Invoice module API fetch error, checking cached data:", e);
    } finally {
      this.loading.invoices = false;
    }

    // Fallback to localStorage cache if server unavailable
    const stored = localStorage.getItem(this.storageKeys.orderPayments);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.orderPayments = parsed;
          this.emitData("invoices", this.orderPayments);
          return this.orderPayments;
        }
      } catch (err) {}
    }

    this.emitData("invoices", this.orderPayments);
    return this.orderPayments;
  }

  /* ==========================================================================
     REQUEST 2: TRANSACTION MODULE (Supplier GRN Payments)
     ========================================================================== */

  /**
   * Load GRN supplier stock payments from backend Transaction module API via RequestHandler.
   *
   * @returns {Promise<Array>}
   */
  async loadGrnPayments() {
    this.loading.grn = true;
    try {
      let result = null;
      try {
        result = await this.http.get(this.endpoints.grnPayments);
      } catch (err) {
        if (this.endpoints.grnPaymentsFallback) {
          result = await this.http.get(this.endpoints.grnPaymentsFallback);
        } else {
          throw err;
        }
      }

      const payload = (result && result.data) ? result.data : result;
      const raw = Array.isArray(payload?.grnPayments)
        ? payload.grnPayments
        : (Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : null));

      if (raw && raw.length > 0) {
        this.grnPayments = raw.map(item => this.normalizeGrn(item));
        this.saveGrnPayments();
        this.emitData("grn", this.grnPayments);
        return this.grnPayments;
      }
    } catch (e) {
      console.warn("[PaymentsDataService] Transaction module GRN API fetch error, checking cached data:", e);
    } finally {
      this.loading.grn = false;
    }

    // Fallback to localStorage cache if server unavailable
    const stored = localStorage.getItem(this.storageKeys.grnPayments);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.grnPayments = parsed;
          this.emitData("grn", this.grnPayments);
          return this.grnPayments;
        }
      } catch (err) {}
    }

    this.emitData("grn", this.grnPayments);
    return this.grnPayments;
  }

  /* ==========================================================================
     REQUEST 3: TRANSACTION MODULE (Operating Expense Utility Bills)
     ========================================================================== */

  /**
   * Load Operating Expenses from backend Transaction module API via RequestHandler.
   *
   * @returns {Promise<Array>}
   */
  async loadOperatingExpenses() {
    this.loading.expenses = true;
    try {
      let result = null;
      try {
        result = await this.http.get(this.endpoints.expenses);
      } catch (err) {
        if (this.endpoints.expensesFallback) {
          result = await this.http.get(this.endpoints.expensesFallback);
        } else {
          throw err;
        }
      }

      const payload = (result && result.data) ? result.data : result;
      const raw = Array.isArray(payload?.expenses)
        ? payload.expenses
        : (Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : null));

      if (raw && raw.length > 0) {
        this.expenses = raw.map(item => this.normalizeExpense(item));
        this.saveExpenses();
        this.emitData("expenses", this.expenses);
        return this.expenses;
      }
    } catch (e) {
      console.warn("[PaymentsDataService] Transaction module Expenses API fetch error, checking cached data:", e);
    } finally {
      this.loading.expenses = false;
    }

    // Fallback to localStorage cache if server unavailable
    const stored = localStorage.getItem(this.storageKeys.operatingExpenses);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.expenses = parsed;
          this.emitData("expenses", this.expenses);
          return this.expenses;
        }
      } catch (err) {}
    }

    this.emitData("expenses", this.expenses);
    return this.expenses;
  }

  /* ==========================================================================
     NORMALIZERS (Translates Backend Payloads Safely)
     ========================================================================== */

  normalizeInvoice(inv = {}) {
    const total = Number(inv.total_amount ?? inv.totalAmount ?? inv.totalBill ?? inv.total ?? 0);
    const paid = Number(inv.paid_amount ?? inv.paidAmount ?? inv.amount ?? 0);
    const balance = Number(inv.balance_amount ?? inv.balanceAmount ?? inv.balance ?? Math.max(0, total - paid));
    const stage = inv.stage || (inv.payment_status === "Paid" || balance <= 0 ? "Complete Payment" : (paid > 0 ? "Advance Payment" : "Pending Payment"));

    return {
      id: inv.id || inv.order_id || inv.orderId || `ORD-${Date.now()}`,
      orderId: inv.order_id || inv.orderId || inv.id || "",
      paymentId: inv.payment_id || inv.paymentId || `PAY-${inv.id || Date.now()}`,
      invoiceNo: inv.invoice_no || inv.invoiceNo || (inv.id ? `INV-${inv.id}` : "INV-2026-1048"),
      customerName: inv.customer_name || inv.customerName || (inv.customer && inv.customer.name) || "Customer",
      customerMobile: inv.customer_mobile || inv.customerMobile || (inv.customer && inv.customer.mobile) || "",
      productName: inv.product_name || inv.productName || "Printing Job",
      totalBill: total,
      totalAmount: total,
      amount: paid,
      paidAmount: paid,
      balance: balance,
      balanceAmount: balance,
      stage: stage,
      paymentStatus: inv.payment_status || (stage === "Complete Payment" ? "Paid" : (stage === "Advance Payment" ? "Partial" : "Pending")),
      orderStatus: inv.order_status || inv.status || "Completed",
      method: inv.method || inv.payment_method || "Cash",
      ref: inv.ref || inv.reference_no || `REC-${inv.id || "1048"}`,
      note: inv.note || inv.narration || "Settlement transaction",
      date: inv.date || inv.created_at?.split("T")[0] || new Date().toISOString().split("T")[0]
    };
  }

  normalizeGrn(g = {}) {
    const total = Number(g.net_total ?? g.totalBill ?? g.total_amount ?? g.totalAmount ?? 0);
    const paid = Number(g.amount ?? g.paid_amount ?? g.paidAmount ?? (g.net_total ? g.net_total : 0));
    const balance = Number(g.balance ?? g.balance_amount ?? g.balanceAmount ?? Math.max(0, total - paid));
    const stage = g.stage || (balance <= 0 ? "Complete Payment" : (paid > 0 ? "Advance Payment" : "Pending Payment"));

    return {
      grn_id: g.grn_id || g.grnId || g.id || "GRN-2610-001",
      grnId: g.grnId || g.grn_id || g.id || "GRN-2610-001",
      grn_number: g.grn_number || g.grnNumber || "GRN-2610-001",
      grnNumber: g.grnNumber || g.grn_number || "GRN-2610-001",
      po_number: g.po_number || g.poNumber || "-",
      poNumber: g.poNumber || g.po_number || "-",
      supplier_id: g.supplier_id || g.supplierId || "SUP-001",
      supplierId: g.supplierId || g.supplier_id || "SUP-001",
      supplier_name: g.supplier_name || g.supplierName || (g.supplier && g.supplier.name) || "Supplier",
      supplierName: g.supplierName || g.supplier_name || (g.supplier && g.supplier.name) || "Supplier",
      stock_category: g.stock_category || g.stockCategory || "Stock Delivery",
      stockCategory: g.stockCategory || g.stock_category || "Stock Delivery",
      net_total: total,
      totalBill: total,
      amount: paid,
      paidAmount: paid,
      balance: balance,
      balanceAmount: balance,
      stage: stage,
      paymentStatus: g.payment_status || (stage === "Complete Payment" ? "Paid" : (stage === "Advance Payment" ? "Partial" : "Pending")),
      method: g.method || "Check",
      ref: g.ref || `CHQ-${g.grn_number || "2610-001"}`,
      note: g.note || "Supplier consignment invoice",
      date: g.date || g.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
      paymentId: g.payment_id || g.paymentId || `PAY-${g.grn_number || "GRN-2610-001"}`
    };
  }

  normalizeExpense(exp = {}) {
    return {
      id: exp.id || `EXP-${Date.now()}`,
      title: exp.title || exp.description || "Operating Bill",
      category: exp.category || "Other",
      provider: exp.provider || "-",
      accountNo: exp.account_no || exp.accountNo || "-",
      month: exp.month || "2026-10",
      dueDate: exp.due_date || exp.dueDate || "-",
      amount: Number(exp.amount || 0),
      status: exp.status || "Pending",
      paidDate: exp.paid_date || exp.paidDate || "",
      paidAmount: exp.paid_amount ? Number(exp.paid_amount) : (exp.status === "Paid" ? Number(exp.amount || 0) : 0),
      paidMethod: exp.paid_method || exp.paidMethod || "",
      paidRef: exp.paid_ref || exp.paidRef || "",
      paidNote: exp.paid_note || exp.paidNote || "",
      notes: exp.notes || exp.narration || ""
    };
  }

  /* ==========================================================================
     SYNCHRONOUS DATA CACHING & INITIALIZATION
     ========================================================================== */

  loadData() {
    // 1. Orders
    const savedOrders = localStorage.getItem(this.storageKeys.orders);
    if (savedOrders) {
      try { this.orders = JSON.parse(savedOrders); } catch (e) {}
    }

    // 2. Invoice Payments
    const savedInvoices = localStorage.getItem(this.storageKeys.orderPayments);
    if (savedInvoices) {
      try { this.orderPayments = JSON.parse(savedInvoices); } catch (e) {}
    }

    // 3. GRN Payments
    const savedGrns = localStorage.getItem(this.storageKeys.grnPayments);
    if (savedGrns) {
      try { this.grnPayments = JSON.parse(savedGrns); } catch (e) {}
    }

    // 4. Operating Expenses
    const savedExpenses = localStorage.getItem(this.storageKeys.operatingExpenses);
    if (savedExpenses) {
      try { this.expenses = JSON.parse(savedExpenses); } catch (e) {}
    }

    return {
      orders: this.orders,
      orderPayments: this.orderPayments,
      grnRecords: this.grnRecords,
      grnPayments: this.grnPayments,
      expenses: this.expenses
    };
  }

  saveOrderPayments() {
    localStorage.setItem(this.storageKeys.orderPayments, JSON.stringify(this.orderPayments));
  }

  saveGrnPayments() {
    localStorage.setItem(this.storageKeys.grnPayments, JSON.stringify(this.grnPayments));
  }

  saveExpenses() {
    localStorage.setItem(this.storageKeys.operatingExpenses, JSON.stringify(this.expenses));
  }

  saveOrders(orders) {
    this.orders = orders;
    localStorage.setItem(this.storageKeys.orders, JSON.stringify(this.orders));
  }

  formatCurrency(amount) {
    return `Rs. ${(parseFloat(amount) || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
}

export const PaymentDataLoad = PaymentsDataService;
export default PaymentsDataService;
