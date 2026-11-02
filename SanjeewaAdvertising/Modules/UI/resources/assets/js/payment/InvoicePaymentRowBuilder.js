/**
<<<<<<< Updated upstream:SanjeewaAdvertising/Modules/UI/resources/assets/js/payment/InvoicePaymentRowBuilder.js
 * SanjeewaAdvertising - Invoice Payment Row Builder Class
 * Fluent Builder and Entity Model for building and rendering
 * Invoice Payment table rows in the Payments UI hub.
 */

"use strict";

export class InvoicePaymentRowBuilder {
  /**
   * @param {Object} [data=null]
   */
  constructor(data = null) {
    this._id = "";
    this._paymentId = "";
    this._orderId = "";
    this._invoiceNo = "";
    this._customerName = "";
    this._customerMobile = "";
    this._productName = "";
    this._date = "";
    this._totalAmount = 0;
    this._paidAmount = 0;
    this._balanceAmount = 0;
    this._paymentStatus = "Unpaid";
    this._stage = "Pending Payment";
    this._orderStatus = "Pending";
    this._method = "Cash";
    this._ref = "";
    this._note = "";

    if (data && typeof data === "object") {
      this.populate(data);
    }
  }

  /**
   * Populate internal fields from raw data object.
   * Supports both Order shape and OrderPayment shape.
   * @param {Object} data
   * @returns {InvoicePaymentRowBuilder}
   */
  populate(data = {}) {
    const rawId = data.id ?? data.orderId ?? data.order_id ?? "";
    this.setId(rawId);

    const paymentId = data.paymentId ?? data.payment_id ?? (rawId ? `PAY-${rawId.replace("ORD-", "INV-")}` : `PAY-INV-${Date.now().toString().slice(-6)}`);
    this.setPaymentId(paymentId);

    const orderId = data.orderId ?? data.order_id ?? data.id ?? "";
    this.setOrderId(orderId);

    const invoiceNo = data.invoiceNo ?? data.invoice_no ?? (rawId ? (rawId.startsWith("INV-") ? rawId : `INV-${rawId.replace("ORD-", "")}`) : "");
    this.setInvoiceNo(invoiceNo);

    this.setCustomerName(data.customerName ?? data.customer_name ?? "Customer");
    this.setCustomerMobile(data.customerMobile ?? data.customer_mobile ?? "");
    this.setProductName(data.productName ?? data.product_name ?? "Print Job");
    this.setDate(data.date ?? data.orderDate ?? data.order_date ?? new Date().toISOString().split("T")[0]);

    const total = Number(data.totalAmount ?? data.totalBill ?? data.total_amount ?? data.total_bill ?? 0);
    this.setTotalAmount(isNaN(total) ? 0 : total);

    const paid = Number(data.paidAmount ?? data.amount ?? data.paid_amount ?? 0);
    this.setPaidAmount(isNaN(paid) ? 0 : paid);

    let balance = data.balanceAmount ?? data.balance ?? data.balance_amount;
    if (balance === undefined || balance === null) {
      balance = Math.max(0, this._totalAmount - this._paidAmount);
    } else {
      balance = Number(balance);
    }
    this.setBalanceAmount(isNaN(balance) ? 0 : balance);

    const status = data.paymentStatus ?? data.payment_status ?? (this._balanceAmount <= 0 && this._totalAmount > 0 ? "Paid" : this._paidAmount > 0 ? "Partially Paid" : "Unpaid");
    this.setPaymentStatus(status);

    const stage = data.stage ?? this.computeStage(status, this._paidAmount, this._balanceAmount);
    this.setStage(stage);

    this.setOrderStatus(data.orderStatus ?? data.order_status ?? "Completed");
    this.setMethod(data.method ?? data.payment_method ?? "Cash");
    this.setRef(data.ref ?? data.reference ?? (orderId ? `REF-${orderId}` : ""));
    this.setNote(data.note ?? data.notes ?? "-");

    return this;
  }

  /**
   * Derive payment stage string from status and amounts.
   * @param {string} status
   * @param {number} paid
   * @param {number} balance
   * @returns {string}
   */
  computeStage(status = "", paid = 0, balance = 0) {
    if (status === "Paid" || status === "Complete Payment" || (balance <= 0 && paid > 0)) {
      return "Complete Payment";
    }
    if (status === "Partially Paid" || status === "Advance Payment" || (paid > 0 && balance > 0)) {
      return "Advance Payment";
    }
    return "Pending Payment";
  }

  /* ==========================================================================
     Fluent Setters (Chainable)
     ========================================================================== */

  setId(id) {
    this._id = id == null ? "" : String(id).trim();
    return this;
  }

  setPaymentId(paymentId) {
    this._paymentId = paymentId == null ? "" : String(paymentId).trim();
    return this;
  }

  setOrderId(orderId) {
    this._orderId = orderId == null ? "" : String(orderId).trim();
    return this;
  }

  setInvoiceNo(invoiceNo) {
    this._invoiceNo = invoiceNo == null ? "" : String(invoiceNo).trim();
    return this;
  }

  setCustomerName(name) {
    this._customerName = name == null ? "Customer" : String(name).trim();
    return this;
  }

  setCustomerMobile(mobile) {
    this._customerMobile = mobile == null ? "" : String(mobile).trim();
    return this;
  }

  setProductName(name) {
    this._productName = name == null ? "" : String(name).trim();
    return this;
  }

  setDate(date) {
    if (date instanceof Date) {
      this._date = date.toISOString().split("T")[0];
    } else {
      this._date = date == null ? "" : String(date).trim();
    }
    return this;
  }

  setTotalAmount(amount) {
    const num = parseFloat(amount);
    this._totalAmount = isNaN(num) || num < 0 ? 0 : Math.round(num * 100) / 100;
    return this;
  }

  setPaidAmount(amount) {
    const num = parseFloat(amount);
    this._paidAmount = isNaN(num) || num < 0 ? 0 : Math.round(num * 100) / 100;
    return this;
  }

  setBalanceAmount(amount) {
    const num = parseFloat(amount);
    this._balanceAmount = isNaN(num) || num < 0 ? 0 : Math.round(num * 100) / 100;
    return this;
  }

  setPaymentStatus(status) {
    this._paymentStatus = status == null ? "Unpaid" : String(status).trim();
    return this;
  }

  setStage(stage) {
    this._stage = stage == null ? "Pending Payment" : String(stage).trim();
    return this;
  }

  setOrderStatus(status) {
    this._orderStatus = status == null ? "Pending" : String(status).trim();
    return this;
  }

  setMethod(method) {
    this._method = method == null ? "Cash" : String(method).trim();
    return this;
  }

  setRef(ref) {
    this._ref = ref == null ? "" : String(ref).trim();
    return this;
  }

  setNote(note) {
    this._note = note == null ? "-" : String(note).trim();
    return this;
  }

  /* ==========================================================================
     Getters
     ========================================================================== */

  getId() { return this._id; }
  getPaymentId() { return this._paymentId; }
  getOrderId() { return this._orderId; }
  getInvoiceNo() { return this._invoiceNo; }
  getCustomerName() { return this._customerName; }
  getCustomerMobile() { return this._customerMobile; }
  getProductName() { return this._productName; }
  getDate() { return this._date; }
  getTotalAmount() { return this._totalAmount; }
  getPaidAmount() { return this._paidAmount; }
  getBalanceAmount() { return this._balanceAmount; }
  getPaymentStatus() { return this._paymentStatus; }
  getStage() { return this._stage; }
  getOrderStatus() { return this._orderStatus; }
  getMethod() { return this._method; }
  getRef() { return this._ref; }
  getNote() { return this._note; }

  // ES6 Property Getters
  get id() { return this._id; }
  get paymentId() { return this._paymentId; }
  get orderId() { return this._orderId; }
  get invoiceNo() { return this._invoiceNo; }
  get customerName() { return this._customerName; }
  get customerMobile() { return this._customerMobile; }
  get productName() { return this._productName; }
  get date() { return this._date; }
  get totalAmount() { return this._totalAmount; }
  get paidAmount() { return this._paidAmount; }
  get balanceAmount() { return this._balanceAmount; }
  get paymentStatus() { return this._paymentStatus; }
  get stage() { return this._stage; }
  get orderStatus() { return this._orderStatus; }
  get method() { return this._method; }
  get ref() { return this._ref; }
  get note() { return this._note; }

  // Compatibility getters for payment objects
  get totalBill() { return this._totalAmount; }
  get amount() { return this._paidAmount; }
  get balance() { return this._balanceAmount; }

  /* ==========================================================================
     Badge Rendering Helpers
     ========================================================================== */

  /**
   * Render HTML pill badge for payment stage.
   * @returns {string}
   */
  renderStageBadge() {
    if (this._stage === "Complete Payment" || this._paymentStatus === "Paid") {
      return `<span class="status-pill complete"><i class="fa-solid fa-circle-check"></i> Complete Payment</span>`;
    } else if (this._stage === "Advance Payment" || this._paymentStatus === "Partially Paid") {
=======
 * SanjeewaAdvertising - Invoice Payment Row Builder
 *
 * Implements Builder Pattern (GoF) extending Core BaseTableRowBuilder:
 * - InvoicePaymentRowBuilder: Fluent builder class for invoice payment table rows.
 * - InvoicePayment: Entity model providing table row HTML rendering.
 */

import { BaseTableRowBuilder } from "../core/BaseTableRowBuilder.js";

/**
 * InvoicePayment - Constructed Invoice Payment Entity Model
 */
export class InvoicePayment {
  constructor(data = {}) {
    // Normalization to support multiple shapes (user demo data vs payments data)
    this.id = data.id || data.paymentId || data.orderId || "";
    this.paymentId = data.paymentId || data.id || "";
    this.orderId = data.orderId || data.id || "";
    this.invoiceNo = data.invoiceNo || (this.id ? (String(this.id).startsWith("INV-") ? this.id : `INV-${String(this.id).replace("ORD-", "")}`) : "") || this.orderId;
    this.customerName = data.customerName || "Customer";
    this.customerMobile = data.customerMobile || "";
    this.productName = data.productName || "";
    this.date = data.date || data.orderDate || new Date().toISOString().split("T")[0];

    this.totalBill = Number(data.totalBill !== undefined ? data.totalBill : (data.totalAmount !== undefined ? data.totalAmount : 0));
    this.amount = Number(data.amount !== undefined ? data.amount : (data.paidAmount !== undefined ? data.paidAmount : 0));
    this.balance = Number(data.balance !== undefined ? data.balance : (data.balanceAmount !== undefined ? data.balanceAmount : Math.max(0, this.totalBill - this.amount)));

    // Normalize stage / paymentStatus
    if (data.stage) {
      this.stage = data.stage;
    } else if (data.paymentStatus === "Paid" || this.balance <= 0) {
      this.stage = "Complete Payment";
    } else if (data.paymentStatus === "Partial" || (this.amount > 0 && this.balance > 0)) {
      this.stage = "Advance Payment";
    } else {
      this.stage = "Pending Payment";
    }

    this.paymentStatus = data.paymentStatus || (this.stage === "Complete Payment" ? "Paid" : (this.stage === "Advance Payment" ? "Partial" : "Pending"));
    this.orderStatus = data.orderStatus || "Pending";
    this.method = data.method || "Cash";
    this.ref = data.ref || (this.method === "Cash" ? `CASH-REC-${String(this.orderId).replace("ORD-", "")}` : `TXN-${String(this.orderId).replace("ORD-", "")}`);
    this.note = data.note || (this.stage === "Complete Payment" ? "Full settlement paid upon delivery" : (this.stage === "Advance Payment" ? "Upfront advance payment" : "Pending settlement"));
    this.jobsCount = data.jobsCount || (data.jobs && data.jobs.length) || 1;
    this.jobIds = data.jobIds || [this.orderId];
  }

  renderStageBadge() {
    if (this.stage === "Complete Payment" || this.stage === "Paid") {
      return `<span class="status-pill complete"><i class="fa-solid fa-circle-check"></i> Complete Payment</span>`;
    } else if (this.stage === "Advance Payment" || this.stage === "Partial") {
>>>>>>> Stashed changes:SanjeewaAdvertising/Modules/UI/resources/assets/js/payments/InvoicePaymentRowBuilder.js
      return `<span class="status-pill advance"><i class="fa-solid fa-hourglass-half"></i> Advance Payment</span>`;
    } else {
      return `<span class="status-pill pending"><i class="fa-solid fa-clock"></i> Pending Payment</span>`;
    }
  }

<<<<<<< Updated upstream:SanjeewaAdvertising/Modules/UI/resources/assets/js/payment/InvoicePaymentRowBuilder.js
  /**
   * Render HTML pill badge for payment method.
   * @returns {string}
   */
  renderMethodBadge() {
    const method = this._method;
    if (method === "Card") {
      return `<span class="method-pill card"><i class="fa-solid fa-credit-card"></i> Card</span>`;
    } else if (method === "Cash") {
      return `<span class="method-pill cash"><i class="fa-solid fa-money-bill-wave"></i> Cash</span>`;
    } else if (method === "Check") {
=======
  renderMethodBadge() {
    if (this.method === "Card") {
      return `<span class="method-pill card"><i class="fa-solid fa-credit-card"></i> Card</span>`;
    } else if (this.method === "Cash") {
      return `<span class="method-pill cash"><i class="fa-solid fa-money-bill-wave"></i> Cash</span>`;
    } else if (this.method === "Check") {
>>>>>>> Stashed changes:SanjeewaAdvertising/Modules/UI/resources/assets/js/payments/InvoicePaymentRowBuilder.js
      return `<span class="method-pill check"><i class="fa-solid fa-money-check"></i> Check</span>`;
    } else {
      return `<span class="method-pill transfer"><i class="fa-solid fa-building-columns"></i> Bank Transfer</span>`;
    }
  }

<<<<<<< Updated upstream:SanjeewaAdvertising/Modules/UI/resources/assets/js/payment/InvoicePaymentRowBuilder.js
  /* ==========================================================================
     Table Row HTML Rendering (Build Output)
     ========================================================================== */

  /**
   * Build and render the <tr> table row for the Invoice Payments table.
   * @returns {string}
=======
  formatCurrency(val) {
    return `Rs. ${(Number(val) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
  }

  /**
   * Render table row element (<tr>) for Invoice Payments Table
   * @returns {HTMLTableRowElement|string}
>>>>>>> Stashed changes:SanjeewaAdvertising/Modules/UI/resources/assets/js/payments/InvoicePaymentRowBuilder.js
   */
  render() {
    const stagePill = this.renderStageBadge();
    const methodPill = this.renderMethodBadge();
<<<<<<< Updated upstream:SanjeewaAdvertising/Modules/UI/resources/assets/js/payment/InvoicePaymentRowBuilder.js
    const isOverdue = this._balanceAmount > 0;
    const balanceColor = isOverdue ? "#ef4444" : "var(--text-muted)";
    const refDisplay = this._orderId || this._id;
    const invoiceDisplay = this._invoiceNo || this._orderId || this._id;
    const rowId = `invPayRow_${this._paymentId || this._id}`;

    return `
        <tr id="${rowId}" data-order-id="${this._orderId || this._id}" data-payment-id="${this._paymentId}">
          <td>
            <strong style="color: var(--blue);">${invoiceDisplay}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">${this._date}</div>
          </td>
          <td>
            <strong>${this._customerName}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">
              Ref: ${refDisplay} ${this._productName ? `&bull; ${this._productName}` : ""}
            </div>
          </td>
          <td>${stagePill}</td>
          <td>${methodPill}</td>
          <td style="font-weight: 700;">Rs. ${this._totalAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
          <td style="font-weight: 800; color: #10b981;">Rs. ${this._paidAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
          <td style="font-weight: 700; color: ${balanceColor};">
            Rs. ${this._balanceAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
          </td>
          <td>
            <span style="font-size: 11.5px; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;" title="${this._note}">
              ${this._note || "-"}
            </span>
          </td>
          <td>
            <div class="pay-table-actions">
              <button type="button" class="pay-btn-sm" data-view-receipt="${this._paymentId}" data-type="invoice" title="View & Print Payment Voucher">
                <i class="fa-solid fa-receipt"></i> Voucher
              </button>
              ${
                this._balanceAmount > 0
                  ? `
              <button type="button" class="pay-btn-sm primary-sm" data-open-pay-modal data-pay-type="invoice" data-pay-ref="${this._orderId || this._id}" title="Record settlement installment">
                <i class="fa-solid fa-plus"></i> Pay
              </button>`
                  : ""
              }
            </div>
          </td>
        </tr>`;
  }

  /**
   * Alias for render().
   * @returns {string}
   */
  build() {
    return this.render();
  }

  /**
   * Alias for render().
   * @returns {string}
   */
  renderTableRow() {
    return this.render();
  }

  /**
   * Convert to DOM element.
   * @returns {HTMLTableRowElement}
   */
  toDOMNode() {
    const temp = document.createElement("tbody");
    temp.innerHTML = this.render().trim();
    return temp.firstElementChild;
  }

  /**
   * Export plain object.
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this._id,
      paymentId: this._paymentId,
      orderId: this._orderId,
      invoiceNo: this._invoiceNo,
      customerName: this._customerName,
      customerMobile: this._customerMobile,
      productName: this._productName,
      date: this._date,
      totalAmount: this._totalAmount,
      paidAmount: this._paidAmount,
      balanceAmount: this._balanceAmount,
      paymentStatus: this._paymentStatus,
      stage: this._stage,
      orderStatus: this._orderStatus,
      method: this._method,
      ref: this._ref,
      note: this._note
    };
  }

  /**
   * Factory method to create an instance from raw data.
   * @param {Object} data
   * @returns {InvoicePaymentRowBuilder}
   */
  static from(data) {
    if (data instanceof InvoicePaymentRowBuilder) {
      return data;
    }
    return new InvoicePaymentRowBuilder(data);
  }

  /**
   * Batch instantiate builders from an array of objects.
   * @param {Array} list
   * @returns {InvoicePaymentRowBuilder[]}
   */
  static fromArray(list = []) {
    if (!Array.isArray(list)) return [];
    return list.map((item) => InvoicePaymentRowBuilder.from(item));
  }

  /**
   * Render an array of payment/order records into a table body element.
   * @param {Array} list
   * @param {string|HTMLElement} [tbodyId="payInvoiceTableBody"]
   * @returns {InvoicePaymentRowBuilder[]}
   */
  static renderTable(list = [], tbodyId = "payInvoiceTableBody") {
    const tbody = typeof tbodyId === "string" ? document.getElementById(tbodyId) : tbodyId;
    if (!tbody) return [];

    const builders = InvoicePaymentRowBuilder.fromArray(list);
    if (builders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9">
            <div class="po-empty-state">
              <i class="fa-solid fa-receipt"></i>
              <p>No Invoice Payments match your filter criteria.</p>
            </div>
          </td>
        </tr>`;
    } else {
      tbody.innerHTML = builders.map((b) => b.build()).join("");
    }
    return builders;
  }
}

// Global browser attachment
if (typeof window !== "undefined") {
  window.InvoicePaymentRowBuilder = InvoicePaymentRowBuilder;
=======
    const jobsBadge = this.jobsCount > 1
      ? `<span class="inv-job-badge" style="font-size: 10px; padding: 1px 6px; margin-left: 5px;">${this.jobsCount} Jobs</span>`
      : "";
    const primaryJobId = (this.jobIds && this.jobIds.length > 0) ? this.jobIds[0] : (this.orderId || this.id);
    const totalFormatted = this.formatCurrency(this.totalBill);
    const paidFormatted = this.formatCurrency(this.amount);
    const balanceFormatted = this.formatCurrency(this.balance);
    const balanceColor = this.balance > 0 ? "#ef4444" : "var(--text-muted)";

    const html = `
      <td>
        <strong style="color: var(--blue);">${this.invoiceNo || this.orderId}</strong>
        ${jobsBadge}
        <div style="font-size: 11px; color: var(--text-muted);">${this.date}</div>
      </td>
      <td>
        <strong>${this.customerName}</strong>
        <div style="font-size: 11px; color: var(--text-muted); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${this.orderId}">
          Ref: ${this.orderId}${this.customerMobile ? ` | ${this.customerMobile}` : ''}
        </div>
      </td>
      <td>${stagePill}</td>
      <td>${methodPill}</td>
      <td style="font-weight: 700;">${totalFormatted}</td>
      <td style="font-weight: 800; color: #10b981;">${paidFormatted}</td>
      <td style="font-weight: 700; color: ${balanceColor};">${balanceFormatted}</td>
      <td>
        <span style="font-size: 11.5px; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;" title="${this.note || ''}">
          ${this.note || '-'}
        </span>
      </td>
      <td>
        <div class="pay-table-actions">
          <button type="button" class="pay-btn-sm" data-view-receipt="${this.paymentId || this.orderId}" data-type="invoice" title="View & Print Payment Voucher">
            <i class="fa-solid fa-receipt"></i> Voucher
          </button>
          ${this.balance > 0 ? `
          <button type="button" class="pay-btn-sm primary-sm" data-open-pay-modal data-pay-type="invoice" data-pay-ref="${primaryJobId}" title="Record settlement installment">
            <i class="fa-solid fa-plus"></i> Pay
          </button>` : ''}
        </div>
      </td>
    `;

    if (typeof document !== "undefined" && typeof document.createElement === "function") {
      const tr = document.createElement("tr");
      tr.id = `payInvoiceRow_${this.paymentId || this.orderId}`;
      tr.innerHTML = html;
      return tr;
    }

    return `<tr id="payInvoiceRow_${this.paymentId || this.orderId}">${html}</tr>`;
  }

  renderTableRow() {
    return this.render();
  }
}

/**
 * InvoicePaymentRowBuilder - Fluent Builder Class extending Core BaseTableRowBuilder
 */
export class InvoicePaymentRowBuilder extends BaseTableRowBuilder {
  constructor(initialData = null) {
    super(initialData);
  }

  build() {
    return new InvoicePayment(this._data);
  }

  static fromArray(list) {
    if (!Array.isArray(list)) return [];
    return list.map(item => new InvoicePaymentRowBuilder(item).build());
  }
>>>>>>> Stashed changes:SanjeewaAdvertising/Modules/UI/resources/assets/js/payments/InvoicePaymentRowBuilder.js
}

export default InvoicePaymentRowBuilder;

