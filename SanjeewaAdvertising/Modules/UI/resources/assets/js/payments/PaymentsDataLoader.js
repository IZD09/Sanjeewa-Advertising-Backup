/**
 * SanjeewaAdvertising - Payments Data Loader
 *
 * Handles API communication via RequestHandler to:
 * 1. Invoice module (/advertising/invoices/data)
 * 2. Transaction module for GRN payments (/advertising/grn-payments/data)
 * 3. Transaction module for Operating Expenses (/advertising/payments/expenses/data)
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

    this.purgeLegacyCache();

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
   * Purge legacy localStorage entries so stale browser cache never overrides live API data.
   */
  purgeLegacyCache() {
    try {
      if (typeof localStorage !== "undefined") {
        Object.values(this.storageKeys).forEach((key) => localStorage.removeItem(key));
        localStorage.removeItem("sa_payments_cache_version");
      }
    } catch (e) {
      // LocalStorage access might be restricted in some environments
    }
  }

  /**
   * Fetch live collectable print jobs directly from Invoice module / database.
   *
   * @param {boolean} [forceRefresh=false]
   * @returns {Promise<Array>}
   */
  async fetchCollectableOrders(forceRefresh = false) {
    if (this.orders.length > 0 && !forceRefresh) {
      return this.orders;
    }

    try {
      const jobsRes = await this.http.get("/advertising/invoices/available-jobs");
      const jobsData = jobsRes?.data || jobsRes;
      const liveJobs = Array.isArray(jobsData) ? jobsData : (jobsData?.jobs || []);
      if (Array.isArray(liveJobs) && liveJobs.length > 0) {
        this.orders = liveJobs.map(j => ({
          id: j.formattedId || j.orderId || `ORD-2026-${1000 + Number(j.id)}`,
          formattedId: j.formattedId || j.orderId || `ORD-2026-${1000 + Number(j.id)}`,
          jobId: j.job_id || j.id,
          rawId: j.id,
          customerId: j.customerId || "CUST-001",
          customerName: j.customerName || "Customer",
          customerMobile: j.customerMobile || "",
          productName: j.productName || "Print Job",
          qty: Number(j.qty) || 1,
          width: j.width ?? "",
          height: j.height ?? "",
          unit: j.unit || "ft",
          addDate: j.addDate || "-",
          orderDate: j.addDate || "-",
          totalAmount: Number(j.totalAmount) || 0,
          paidAmount: Number(j.paidAmount) || 0,
          balanceAmount: Number(j.balanceAmount) || 0,
          status: j.status || (j.balanceAmount <= 0 ? "Paid" : "Pending"),
          paymentStatus: j.status || (j.balanceAmount <= 0 ? "Paid" : "Pending")
        }));
        this.saveOrders(this.orders);
        return this.orders;
      }
    } catch (err) {
      console.warn("[PaymentsDataLoader] Failed to fetch live print jobs from database:", err);
    }

    return this.orders;
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
      // 1. Fetch live available print jobs directly from Invoice module / database
      await this.fetchCollectableOrders(forceRefresh);

      // 2. Fetch invoice payments and KPIs from Invoice module
      const response = await this.http.get("/advertising/invoices/data", filters);
      const data = response?.data || response;
      const raw = data?.invoices || (Array.isArray(data) ? data : null);

      if (data?.kpis) {
        this.invoiceKpis = data.kpis;
      }

      if (Array.isArray(raw)) {
        this.orderPayments = raw.map(item => this.normalizeInvoice(item));
        if (this.orders.length === 0 && this.orderPayments.length > 0) {
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
          this.saveOrders(this.orders);
        }

        this.saveOrderPayments();
        this.invoiceLoaded = true;
        return this.orderPayments;
      }
    } catch (e) {
      console.warn("[PaymentsDataLoader] Failed to fetch invoices from API:", e);
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
      // 1. Fetch live available purchase orders & GRN consignments from Transaction module / database
      try {
        const poRes = await this.http.get("/advertising/grn-payments/available-pos");
        const poData = poRes?.data || poRes;
        const rawPos = Array.isArray(poData) ? poData : (poData?.pos || []);
        if (Array.isArray(rawPos) && rawPos.length > 0) {
          this.grnRecords = rawPos.map(g => ({
            id: g.id,
            poNumber: g.poNumber || g.id,
            grn_id: g.grn_id || g.id,
            grnNumber: g.grnNumber || `GRN-${g.id}`,
            supplier_id: g.supplier_id || "SUP-001",
            supplier_name: g.supplierName || "Supplier",
            supplierName: g.supplierName || "Supplier",
            stock_category: g.stockCategory || "Stock Consignment",
            stockCategory: g.stockCategory || "Stock Consignment",
            net_total: Number(g.totalAmount || g.totalBill || 0),
            totalAmount: Number(g.totalAmount || g.totalBill || 0),
            totalBill: Number(g.totalAmount || g.totalBill || 0),
            paid_amount: Number(g.paidAmount || 0),
            paidAmount: Number(g.paidAmount || 0),
            balance: Number(g.balanceAmount !== undefined ? g.balanceAmount : g.balance) || 0,
            balanceAmount: Number(g.balanceAmount !== undefined ? g.balanceAmount : g.balance) || 0,
            status: (Number(g.balanceAmount !== undefined ? g.balanceAmount : g.balance) || 0) <= 0 ? "Completed" : "Pending",
            received_date: g.received_date || new Date().toISOString().split("T")[0]
          }));
        }
      } catch (err) {
        console.warn("[PaymentsDataLoader] Failed to fetch live purchase orders from database:", err);
      }

      // 1b. Fallback: Fetch stock consignment GRN records from Supplier module if needed
      if (this.grnRecords.length === 0) {
        try {
          const grnRes = await this.http.get("/advertising/grns/data");
          const grnData = grnRes?.data || grnRes;
          const rawGrns = grnData?.records || grnData?.grns || (Array.isArray(grnData) ? grnData : []);
          if (Array.isArray(rawGrns) && rawGrns.length > 0) {
            this.grnRecords = rawGrns.map(g => ({
              id: g.id,
              grn_id: g.id,
              grn_number: g.grn_number || `GRN-0${g.id}`,
              grnNumber: g.grn_number || `GRN-0${g.id}`,
              purchase_order_no: g.purchase_order_no || "-",
              supplier_name: g.supplier_name || "Direct Consignment",
              supplierName: g.supplier_name || "Direct Consignment",
              supplier_id: g.supplier_id || "SUP-001",
              stock_category: g.items && g.items[0] ? `${g.items[0].item_name} (+${g.items.length - 1} items)` : "Stock Consignment",
              stockCategory: g.items && g.items[0] ? `${g.items[0].item_name} (+${g.items.length - 1} items)` : "Stock Consignment",
              net_total: Number(g.net_total || g.sub_total || 0),
              totalBill: Number(g.net_total || g.sub_total || 0),
              paid_amount: 0,
              balance: Number(g.net_total || g.sub_total || 0),
              status: g.status || "Completed",
              received_date: g.received_date || g.created_at || new Date().toISOString().split("T")[0]
            }));
          }
        } catch (err) {
          console.warn("[PaymentsDataLoader] Failed to fetch GRNs from Supplier API:", err);
        }
      }

      // 2. Fetch recorded GRN disbursements
      const response = await this.http.get("/advertising/grn-payments/data", filters);
      const data = response?.data || response;
      const raw = data?.grn_payments || data?.grnPayments || (Array.isArray(data) ? data : null);

      if (data?.kpis) {
        this.grnKpis = data.kpis;
      }

      if (Array.isArray(raw)) {
        this.grnPayments = raw.map(item => this.normalizeGrn(item));
        this.saveGrnPayments();
        this.grnLoaded = true;
        return this.grnPayments;
      }
    } catch (e) {
      console.warn("[PaymentsDataLoader] Failed to fetch GRN payments from API:", e);
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
      let response = null;
      try {
        response = await this.http.get("/advertising/expenses/data", filters);
      } catch (err) {
        response = await this.http.get("/advertising/payments/expenses/data", filters);
      }
      const data = response?.data || response;
      const raw = data?.expenses || (Array.isArray(data) ? data : null);

      if (data?.kpis) {
        this.expenseKpis = data.kpis;
      }

      if (Array.isArray(raw)) {
        this.expenses = raw.map(item => this.normalizeExpense(item));
        this.saveExpenses();
        this.expensesLoaded = true;
        return this.expenses;
      }
    } catch (e) {
      console.warn("[PaymentsDataLoader] Failed to fetch Operating Expenses from API:", e);
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
      this.fetchCollectableOrders(forceRefresh),
      this.fetchGrnPayments({}, forceRefresh),
      this.fetchOperatingExpenses({}, forceRefresh)
    ]);
  }

  /**
   * Return current in-memory datasets (populated via live API endpoints).
   */
  loadData() {
    return {
      orders: this.orders,
      orderPayments: this.orderPayments,
      grnRecords: this.grnRecords,
      grnPayments: this.grnPayments,
      expenses: this.expenses
    };
  }

  loadInvoicePayments() {
    return this.orderPayments;
  }

  loadGrnPayments() {
    return this.grnPayments;
  }

  loadOperatingExpenses() {
    return this.expenses;
  }

  saveOrderPayments() {
    // In-memory state only; backend database is the source of truth.
  }

  saveGrnPayments() {
    // In-memory state only; backend database is the source of truth.
  }

  saveExpenses() {
    // In-memory state only; backend database is the source of truth.
  }

  saveOrders(orders) {
    this.orders = orders;
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
    const cumulativePaid = Number(inv.cumulative_paid_amount ?? inv.cumulativePaidAmount ?? paid);
    const balance = Number(inv.balance_amount ?? inv.balanceAmount ?? inv.balance ?? Math.max(0, total - cumulativePaid));
    const stage = inv.stage || (inv.payment_status === "Paid" || balance <= 0.01 ? "Complete Payment" : (cumulativePaid > 0 ? "Advance Payment" : "Pending Payment"));

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
      cumulativePaidAmount: cumulativePaid,
      balance: balance,
      balanceAmount: balance,
      installmentNumber: Number(inv.installment_number || inv.installmentNumber || 1),
      totalInstallments: Number(inv.total_installments || inv.totalInstallments || 1),
      isMultiInstallment: Boolean(inv.is_multi_installment || inv.isMultiInstallment || (Number(inv.total_installments || inv.totalInstallments) > 1)),
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
    const poNumbers = g.po_numbers || g.poNumbers || (g.purchase_orders ? g.purchase_orders.map(p => p.po_number || `PO-${p.id}`) : (g.po_number && g.po_number !== "-" ? String(g.po_number).split(", ") : []));
    const poCount = g.po_count || g.poCount || (Array.isArray(poNumbers) && poNumbers.length > 0 ? poNumbers.length : (g.pos ? g.pos.length : 1));
    const supplierInvoice = g.supplier_invoice || g.supplierInvoice || g.supplyer_invoice || g.supplier_invoice_no || "";

    return {
      grn_id: g.grn_id || g.grnId || g.id || "GRN-2610-001",
      grnId: g.grnId || g.grn_id || g.id || "GRN-2610-001",
      grn_number: g.grn_number || g.grnNumber || "GRN-2610-001",
      grnNumber: g.grnNumber || g.grn_number || "GRN-2610-001",
      po_number: g.po_number || g.poNumber || (poNumbers.length > 0 ? poNumbers.join(", ") : "-"),
      poNumber: g.poNumber || g.po_number || (poNumbers.length > 0 ? poNumbers.join(", ") : "-"),
      po_numbers: poNumbers,
      poNumbers: poNumbers,
      po_count: poCount,
      poCount: poCount,
      supplier_invoice: supplierInvoice,
      supplierInvoice: supplierInvoice,
      pos: g.pos || [],
      grn_items: g.grn_items || [],
      supplier_id: g.supplier_id || g.supplierId || "SUP-001",
      supplierId: g.supplierId || g.supplier_id || "SUP-001",
      supplier_name: g.supplier_name || g.supplierName || (g.supplier && g.supplier.name) || "Supplier",
      supplierName: g.supplierName || g.supplier_name || (g.supplier && g.supplier.name) || "Supplier",
      supplierBankAccount: g.supplierBankAccount || g.supplier_bank_account || "",
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
    const rawCategory = exp.type?.expencesess_type || exp.category || "Electricity Utility";
    const statusText = exp.status_details?.expencesess_status || (typeof exp.status === "object" ? exp.status?.expencesess_status : exp.status) || (exp.expencesess_statuses_id === 3 ? "Paid" : "Pending");
    const rawDate = exp.add_date || exp.created_at || exp.dueDate || "2026-10-15";
    const month = exp.month || (typeof rawDate === "string" && rawDate.includes("-") ? rawDate.substring(0, 7) : "2026-10");
    const price = Number(exp.price ?? exp.amount ?? 0);
    const isPaid = String(statusText).toLowerCase() === "paid" || Number(exp.expencesess_statuses_id) === 3;
    const normalizedStatus = isPaid
      ? "Paid"
      : (String(statusText).toLowerCase() === "overdue" ? "Overdue" : (String(statusText).toLowerCase() === "cancelled" ? "Cancelled" : "Pending"));

    return {
      id: exp.id || `EXP-${Date.now()}`,
      raw_id: exp.raw_id || (typeof exp.id === "number" ? exp.id : null),
      title: exp.title || exp.description || rawCategory,
      category: rawCategory,
      typeId: exp.expencesess_types_id || exp.typeId || 1,
      provider: exp.provider || (rawCategory.includes("Electricity") ? "CEB / LECO" : (rawCategory.includes("Water") ? "NWSDB" : (rawCategory.includes("Internet") ? "SLT / Dialog" : "Direct Overhead Vendor"))),
      accountNo: exp.account_no || exp.accountNo || "A/C-042881",
      month: month,
      dueDate: exp.due_date || (typeof rawDate === "string" && rawDate.includes("T") ? rawDate.split("T")[0] : rawDate),
      amount: price,
      status: normalizedStatus,
      paidDate: exp.paid_date || exp.paidDate || (exp.pay_at ? (typeof exp.pay_at === "string" && exp.pay_at.includes("T") ? exp.pay_at.split("T")[0] : exp.pay_at) : ""),
      paidAmount: exp.paid_amount !== undefined ? Number(exp.paid_amount) : (isPaid ? price : 0),
      paidMethod: exp.paid_method || exp.paidMethod || "Bank Transfer",
      paidRef: exp.reference || exp.paid_ref || exp.paidRef || "",
      paidNote: exp.settlement_note || exp.paid_note || exp.paidNote || "",
      notes: exp.settlement_note || exp.notes || exp.narration || ""
    };
  }
}

export const PaymentsDataService = PaymentsDataLoader;
export const PaymentDataLoad = PaymentsDataLoader;
export default PaymentsDataLoader;
