/**
 * SanjeewaAdvertising - Payments Data Loader
 *
 * Handles API communication via RequestHandler to:
 * 1. Invoice module (/api/v1/invoices/data)
 * 2. Transaction module for GRN payments (/api/v1/grn-payments/data)
 * 3. Transaction module for Operating Expenses (/api/v1/payments/expenses/data)
 *
 * Provides client-side caching (localStorage) and field normalizations.
 * All demo and production records originate from backend service classes.
 */

import { RequestHandler } from "../core/RequestHandler.js";

export class PaymentsDataLoader {
  constructor() {
    this.http = new RequestHandler();
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

    this.invoiceKpis = null;
    this.grnKpis = null;
    this.expenseKpis = null;

    this.invoiceLoaded = false;
    this.grnLoaded = false;
    this.expensesLoaded = false;
  }

  /**
   * Fetch customer invoice payments from Invoice module via RequestHandler.
   *
   * @param {Object} [filters={}]
   * @param {boolean} [forceRefresh=false]
   * @returns {Promise<Array>}
   */
  async fetchInvoicePayments(filters = {}, forceRefresh = false) {
    if (this.invoiceLoaded && !forceRefresh && Object.keys(filters).length === 0) {
      return this.orderPayments;
    }

    try {
      const response = await this.http.get("/api/v1/invoices/data", filters);
      const data = response?.data || response;
      const raw = data?.invoices || (Array.isArray(data) ? data : null);

      if (data?.kpis) {
        this.invoiceKpis = data.kpis;
      }

      if (Array.isArray(raw) && raw.length > 0) {
        this.orderPayments = raw.map(item => this.normalizeInvoice(item));
        this.orders = this.orderPayments.map(p => ({
          id: p.orderId || p.id,
          orderDate: p.date,
          customerId: p.customerId || "CUST-001",
          customerName: p.customerName,
          customerMobile: p.customerMobile,
          productName: p.productName,
          totalAmount: p.totalBill,
          paidAmount: p.amount,
          balanceAmount: p.balance,
          paymentStatus: p.paymentStatus
        }));

        this.saveOrderPayments();
        this.saveOrders(this.orders);
        this.invoiceLoaded = true;
        return this.orderPayments;
      }
    } catch (e) {
      console.warn("[PaymentsDataLoader] Failed to fetch invoices from API, checking local storage:", e);
    }

    const savedPayments = localStorage.getItem(this.storageKeys.orderPayments);
    if (savedPayments) {
      try {
        this.orderPayments = JSON.parse(savedPayments);
      } catch (err) {
        this.orderPayments = [];
      }
    }

    const savedOrders = localStorage.getItem(this.storageKeys.orders);
    if (savedOrders) {
      try {
        this.orders = JSON.parse(savedOrders);
      } catch (err) {
        this.orders = [];
      }
    }

    this.invoiceLoaded = true;
    return this.orderPayments;
  }

  /**
   * Fetch GRN supplier payments from Transaction module via RequestHandler.
   *
   * @param {Object} [filters={}]
   * @param {boolean} [forceRefresh=false]
   * @returns {Promise<Array>}
   */
  async fetchGrnPayments(filters = {}, forceRefresh = false) {
    if (this.grnLoaded && !forceRefresh && Object.keys(filters).length === 0) {
      return this.grnPayments;
    }

    try {
      const response = await this.http.get("/api/v1/grn-payments/data", filters);
      const data = response?.data || response;
      const raw = data?.grn_payments || data?.grnPayments || (Array.isArray(data) ? data : null);

      if (data?.kpis) {
        this.grnKpis = data.kpis;
      }

      if (Array.isArray(raw) && raw.length > 0) {
        this.grnPayments = raw.map(item => this.normalizeGrn(item));
        this.grnRecords = this.grnPayments.map(g => ({
          grn_number: g.grnNumber,
          purchase_order_no: g.poNumber,
          supplier_name: g.supplierName,
          supplier_id: g.supplierId,
          stock_category: g.stockCategory,
          net_total: g.totalBill,
          paid_amount: g.amount,
          balance: g.balance,
          status: g.paymentStatus === "Paid" ? "Completed" : "Draft",
          received_date: g.date
        }));

        this.saveGrnPayments();
        localStorage.setItem(this.storageKeys.grnRecords, JSON.stringify(this.grnRecords));
        this.grnLoaded = true;
        return this.grnPayments;
      }
    } catch (e) {
      console.warn("[PaymentsDataLoader] Failed to fetch GRN payments from API, checking local storage:", e);
    }

    const savedGrnPayments = localStorage.getItem(this.storageKeys.grnPayments);
    if (savedGrnPayments) {
      try {
        this.grnPayments = JSON.parse(savedGrnPayments);
      } catch (err) {
        this.grnPayments = [];
      }
    }

    const savedGrns = localStorage.getItem(this.storageKeys.grnRecords);
    if (savedGrns) {
      try {
        this.grnRecords = JSON.parse(savedGrns);
      } catch (err) {
        this.grnRecords = [];
      }
    }

    this.grnLoaded = true;
    return this.grnPayments;
  }

  /**
   * Fetch operating expenses from Transaction module via RequestHandler.
   *
   * @param {Object} [filters={}]
   * @param {boolean} [forceRefresh=false]
   * @returns {Promise<Array>}
   */
  async fetchOperatingExpenses(filters = {}, forceRefresh = false) {
    if (this.expensesLoaded && !forceRefresh && Object.keys(filters).length === 0) {
      return this.expenses;
    }

    try {
      const response = await this.http.get("/api/v1/payments/expenses/data", filters);
      const data = response?.data || response;
      const raw = data?.expenses || (Array.isArray(data) ? data : null);

      if (data?.kpis) {
        this.expenseKpis = data.kpis;
      }

      if (Array.isArray(raw) && raw.length > 0) {
        this.expenses = raw.map(item => this.normalizeExpense(item));
        this.saveExpenses();
        this.expensesLoaded = true;
        return this.expenses;
      }
    } catch (e) {
      console.warn("[PaymentsDataLoader] Failed to fetch Operating Expenses from API, checking local storage:", e);
    }

    const savedExpenses = localStorage.getItem(this.storageKeys.operatingExpenses);
    if (savedExpenses) {
      try {
        this.expenses = JSON.parse(savedExpenses);
      } catch (err) {
        this.expenses = [];
      }
    }

    this.expensesLoaded = true;
    return this.expenses;
  }

  /**
   * Fetch all datasets in parallel from server.
   * @returns {Promise<Array>}
   */
  async fetchAll(forceRefresh = false) {
    return Promise.allSettled([
      this.fetchInvoicePayments({}, forceRefresh),
      this.fetchGrnPayments({}, forceRefresh),
      this.fetchOperatingExpenses({}, forceRefresh)
    ]);
  }

  /**
   * Synchronously load data from localStorage cache or trigger background sync.
   */
  loadData() {
    this.loadInvoicePayments();
    this.loadGrnPayments();
    this.loadOperatingExpenses();

    return {
      orders: this.orders,
      orderPayments: this.orderPayments,
      grnRecords: this.grnRecords,
      grnPayments: this.grnPayments,
      expenses: this.expenses
    };
  }

  loadInvoicePayments() {
    const saved = localStorage.getItem(this.storageKeys.orderPayments);
    if (saved) {
      try {
        this.orderPayments = JSON.parse(saved);
      } catch (e) {
        this.orderPayments = [];
      }
    }
    const savedOrders = localStorage.getItem(this.storageKeys.orders);
    if (savedOrders) {
      try {
        this.orders = JSON.parse(savedOrders);
      } catch (e) {
        this.orders = [];
      }
    }
    return this.orderPayments;
  }

  loadGrnPayments() {
    const saved = localStorage.getItem(this.storageKeys.grnPayments);
    if (saved) {
      try {
        this.grnPayments = JSON.parse(saved);
      } catch (e) {
        this.grnPayments = [];
      }
    }
    const savedGrns = localStorage.getItem(this.storageKeys.grnRecords);
    if (savedGrns) {
      try {
        this.grnRecords = JSON.parse(savedGrns);
      } catch (e) {
        this.grnRecords = [];
      }
    }
    return this.grnPayments;
  }

  loadOperatingExpenses() {
    const saved = localStorage.getItem(this.storageKeys.operatingExpenses);
    if (saved) {
      try {
        this.expenses = JSON.parse(saved);
      } catch (e) {
        this.expenses = [];
      }
    }
    return this.expenses;
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
      date: inv.date || (inv.invoice_at ? inv.invoice_at.split("T")[0] : null) || (inv.created_at ? inv.created_at.split("T")[0] : new Date().toISOString().split("T")[0]),
      jobsCount: inv.jobs_count || inv.jobsCount || (inv.jobs && inv.jobs.length) || 1,
      jobIds: inv.job_ids || inv.jobIds || [inv.order_id || inv.id]
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
      po_number: g.po_number || g.poNumber || g.purchase_order_no || "-",
      poNumber: g.poNumber || g.po_number || g.purchase_order_no || "-",
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
      method: g.method || g.payment_method || "Check",
      ref: g.ref || g.reference_no || `CHQ-${g.grn_number || "2610-001"}`,
      note: g.note || g.narration || "Supplier consignment invoice",
      date: g.date || (g.received_date ? g.received_date : null) || (g.created_at ? g.created_at.split("T")[0] : new Date().toISOString().split("T")[0]),
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
      paidAmount: exp.paid_amount !== undefined ? Number(exp.paid_amount) : (exp.status === "Paid" ? Number(exp.amount || 0) : 0),
      paidMethod: exp.paid_method || exp.paidMethod || "",
      paidRef: exp.paid_ref || exp.paidRef || "",
      paidNote: exp.paid_note || exp.paidNote || "",
      notes: exp.notes || exp.narration || ""
    };
  }
}

export const PaymentsDataService = PaymentsDataLoader;
export const PaymentDataLoad = PaymentsDataLoader;
export default PaymentsDataLoader;
