/**
 * SanjeewaAdvertising - GRN Payment Row Builder Class
 * Fluent Builder and Entity Model for building and rendering
 * Supplier Stock / GRN Payment table rows in the Payments UI hub.
 */

"use strict";

export class GrnPaymentRowBuilder {
  /**
   * @param {Object} [data=null]
   */
  constructor(data = null) {
    this._grnId = "";
    this._grnNumber = "";
    this._poNumber = "";
    this._supplierId = "";
    this._supplierName = "";
    this._stockCategory = "";
    this._date = "";
    this._paymentId = "";
    this._totalBill = 0;
    this._amount = 0;
    this._balance = 0;
    this._stage = "Pending Payment";
    this._method = "Check";
    this._ref = "";
    this._note = "";

    if (data && typeof data === "object") {
      this.populate(data);
    }
  }

  /**
   * Populate internal fields from raw data object.
   * Supports both GRN record shape and GRN Payment shape.
   * @param {Object} data
   * @returns {GrnPaymentRowBuilder}
   */
  populate(data = {}) {
    const rawGrnId = data.grn_id ?? data.grnId ?? data.id ?? "";
    this.setGrnId(rawGrnId);

    const grnNum = data.grn_number ?? data.grnNumber ?? rawGrnId ?? "";
    this.setGrnNumber(grnNum);

    const poNum = data.po_number ?? data.poNumber ?? data.purchase_order_no ?? (rawGrnId ? `PO-${rawGrnId.replace("GRN-", "")}` : "-");
    this.setPoNumber(poNum);

    this.setSupplierId(data.supplier_id ?? data.supplierId ?? "SUP-001");
    this.setSupplierName(data.supplier_name ?? data.supplierName ?? "Supplier");
    this.setStockCategory(data.stock_category ?? data.stockCategory ?? "Stock Acquisition");
    this.setDate(data.date ?? data.received_date ?? data.created_at ?? new Date().toISOString().split("T")[0]);

    const paymentId = data.paymentId ?? data.payment_id ?? (rawGrnId ? `PAY-${rawGrnId}` : `PAY-GRN-${Date.now().toString().slice(-6)}`);
    this.setPaymentId(paymentId);

    const total = Number(data.net_total ?? data.totalBill ?? data.total_bill ?? data.sub_total ?? 0);
    this.setTotalBill(isNaN(total) ? 0 : total);

    const amount = Number(data.amount ?? data.paidAmount ?? data.paid_amount ?? 0);
    this.setAmount(isNaN(amount) ? 0 : amount);

    let bal = data.balance ?? data.balance_amount ?? data.balanceAmount;
    if (bal === undefined || bal === null) {
      bal = Math.max(0, this._totalBill - this._amount);
    } else {
      bal = Number(bal);
    }
    this.setBalance(isNaN(bal) ? 0 : bal);

    const stage = data.stage ?? this.computeStage(this._amount, this._balance);
    this.setStage(stage);

    this.setMethod(data.method ?? data.payment_method ?? "Check");
    this.setRef(data.ref ?? data.reference ?? (poNum !== "-" ? poNum : rawGrnId));
    this.setNote(data.note ?? data.remarks ?? data.notes ?? "-");

    return this;
  }

  /**
   * Derive payment stage string from amounts.
   * @param {number} paid
   * @param {number} balance
   * @returns {string}
   */
  computeStage(paid = 0, balance = 0) {
    if (balance <= 0 && paid > 0) {
      return "Complete Payment";
    }
    if (paid > 0 && balance > 0) {
      return "Advance Payment";
    }
    return "Pending Payment";
  }

  /* ==========================================================================
     Fluent Setters (Chainable)
     ========================================================================== */

  setGrnId(id) {
    this._grnId = id == null ? "" : String(id).trim();
    return this;
  }

  setGrnNumber(num) {
    this._grnNumber = num == null ? "" : String(num).trim();
    return this;
  }

  setPoNumber(po) {
    this._poNumber = po == null ? "-" : String(po).trim();
    return this;
  }

  setSupplierId(id) {
    this._supplierId = id == null ? "" : String(id).trim();
    return this;
  }

  setSupplierName(name) {
    this._supplierName = name == null ? "Supplier" : String(name).trim();
    return this;
  }

  setStockCategory(cat) {
    this._stockCategory = cat == null ? "Stock Items Received" : String(cat).trim();
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

  setPaymentId(id) {
    this._paymentId = id == null ? "" : String(id).trim();
    return this;
  }

  setTotalBill(total) {
    const num = parseFloat(total);
    this._totalBill = isNaN(num) || num < 0 ? 0 : Math.round(num * 100) / 100;
    return this;
  }

  setNetTotal(total) {
    return this.setTotalBill(total);
  }

  setAmount(amount) {
    const num = parseFloat(amount);
    this._amount = isNaN(num) || num < 0 ? 0 : Math.round(num * 100) / 100;
    return this;
  }

  setPaidAmount(amount) {
    return this.setAmount(amount);
  }

  setBalance(balance) {
    const num = parseFloat(balance);
    this._balance = isNaN(num) || num < 0 ? 0 : Math.round(num * 100) / 100;
    return this;
  }

  setStage(stage) {
    this._stage = stage == null ? "Pending Payment" : String(stage).trim();
    return this;
  }

  setMethod(method) {
    this._method = method == null ? "Check" : String(method).trim();
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

  getGrnId() { return this._grnId; }
  getGrnNumber() { return this._grnNumber; }
  getPoNumber() { return this._poNumber; }
  getSupplierId() { return this._supplierId; }
  getSupplierName() { return this._supplierName; }
  getStockCategory() { return this._stockCategory; }
  getDate() { return this._date; }
  getPaymentId() { return this._paymentId; }
  getTotalBill() { return this._totalBill; }
  getAmount() { return this._amount; }
  getBalance() { return this._balance; }
  getStage() { return this._stage; }
  getMethod() { return this._method; }
  getRef() { return this._ref; }
  getNote() { return this._note; }

  // ES6 Property Getters (both camelCase and snake_case)
  get grnId() { return this._grnId; }
  get grn_id() { return this._grnId; }
  get grnNumber() { return this._grnNumber; }
  get grn_number() { return this._grnNumber; }
  get poNumber() { return this._poNumber; }
  get po_number() { return this._poNumber; }
  get supplierId() { return this._supplierId; }
  get supplier_id() { return this._supplierId; }
  get supplierName() { return this._supplierName; }
  get supplier_name() { return this._supplierName; }
  get stockCategory() { return this._stockCategory; }
  get stock_category() { return this._stockCategory; }
  get date() { return this._date; }
  get paymentId() { return this._paymentId; }
  get totalBill() { return this._totalBill; }
  get net_total() { return this._totalBill; }
  get amount() { return this._amount; }
  get balance() { return this._balance; }
  get stage() { return this._stage; }
  get method() { return this._method; }
  get ref() { return this._ref; }
  get note() { return this._note; }

  /* ==========================================================================
     Badge Rendering Helpers
     ========================================================================== */

  /**
   * Render HTML pill badge for payment stages.
   * @returns {string}
   */
  renderStageBadge() {
    const stage = this._stage;
    if (stage === "Complete Payment") {
      return `<span class="status-pill complete"><i class="fa-solid fa-circle-check"></i> Complete Payment</span>`;
    } else if (stage === "Advance Payment") {
      return `<span class="status-pill advance"><i class="fa-solid fa-hourglass-half"></i> Advance Payment</span>`;
    } else {
      return `<span class="status-pill pending"><i class="fa-solid fa-clock"></i> Pending Payment</span>`;
    }
  }

  /**
   * Render HTML pill badge for payment methods.
   * @returns {string}
   */
  renderMethodBadge() {
    const method = this._method;
    if (method === "Card") {
      return `<span class="method-pill card"><i class="fa-solid fa-credit-card"></i> Card</span>`;
    } else if (method === "Cash") {
      return `<span class="method-pill cash"><i class="fa-solid fa-money-bill-wave"></i> Cash</span>`;
    } else if (method === "Check") {
      return `<span class="method-pill check"><i class="fa-solid fa-money-check"></i> Check</span>`;
    } else {
      return `<span class="method-pill transfer"><i class="fa-solid fa-building-columns"></i> Bank Transfer</span>`;
    }
  }

  /* ==========================================================================
     Table Row HTML Rendering (Build Output)
     ========================================================================== */

  /**
   * Build and render the <tr> table row for the GRN Payments table.
   * @returns {string}
   */
  render() {
    const stagePill = this.renderStageBadge();
    const methodPill = this.renderMethodBadge();
    const isOverdue = this._balance > 0;
    const balanceColor = isOverdue ? "#ef4444" : "var(--text-muted)";
    const rowId = `grnPayRow_${this._paymentId || this._grnId}`;

    return `
        <tr id="${rowId}" data-grn-id="${this._grnId}" data-payment-id="${this._paymentId}">
          <td>
            <strong style="color: #10b981;">${this._grnNumber}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">PO: ${this._poNumber || "-"}</div>
            <div style="font-size: 10.5px; color: var(--text-muted);">${this._date}</div>
          </td>
          <td>
            <strong>${this._supplierName}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">${this._stockCategory}</div>
          </td>
          <td>${stagePill}</td>
          <td>${methodPill}</td>
          <td style="font-weight: 700;">Rs. ${this._totalBill.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
          <td style="font-weight: 800; color: #10b981;">Rs. ${this._amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
          <td style="font-weight: 700; color: ${balanceColor};">
            Rs. ${this._balance.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
          </td>
          <td>
            <span style="font-size: 11.5px; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;" title="${this._note}">
              ${this._note || "-"}
            </span>
          </td>
          <td>
            <div class="pay-table-actions">
              <button type="button" class="pay-btn-sm" data-view-receipt="${this._paymentId || this._grnId}" data-type="grn" title="View & Print Payment Voucher">
                <i class="fa-solid fa-receipt"></i> Voucher
              </button>
              ${
                this._balance > 0
                  ? `
              <button type="button" class="pay-btn-sm green-sm" data-open-pay-modal data-pay-type="grn" data-pay-ref="${this._grnId}" title="Pay supplier installment">
                <i class="fa-solid fa-money-bill-wave"></i> Pay
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
      grn_id: this._grnId,
      grn_number: this._grnNumber,
      po_number: this._poNumber,
      supplier_id: this._supplierId,
      supplier_name: this._supplierName,
      stock_category: this._stockCategory,
      date: this._date,
      paymentId: this._paymentId,
      totalBill: this._totalBill,
      net_total: this._totalBill,
      amount: this._amount,
      balance: this._balance,
      stage: this._stage,
      method: this._method,
      ref: this._ref,
      note: this._note
    };
  }

  /**
   * Factory method to create an instance from raw data.
   * @param {Object} data
   * @returns {GrnPaymentRowBuilder}
   */
  static from(data) {
    if (data instanceof GrnPaymentRowBuilder) {
      return data;
    }
    return new GrnPaymentRowBuilder(data);
  }

  /**
   * Batch instantiate builders from an array of objects.
   * @param {Array} list
   * @returns {GrnPaymentRowBuilder[]}
   */
  static fromArray(list = []) {
    if (!Array.isArray(list)) return [];
    return list.map((item) => GrnPaymentRowBuilder.from(item));
  }

  /**
   * Render an array of GRN records/payments into a table body element.
   * @param {Array} list
   * @param {string|HTMLElement} [tbodyId="payGrnTableBody"]
   * @returns {GrnPaymentRowBuilder[]}
   */
  static renderTable(list = [], tbodyId = "payGrnTableBody") {
    const tbody = typeof tbodyId === "string" ? document.getElementById(tbodyId) : tbodyId;
    if (!tbody) return [];

    const builders = GrnPaymentRowBuilder.fromArray(list);
    if (builders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9">
            <div class="po-empty-state">
              <i class="fa-solid fa-truck-ramp-box"></i>
              <p>No GRN Stock Payments match your filter criteria.</p>
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
  window.GrnPaymentRowBuilder = GrnPaymentRowBuilder;
}

export default GrnPaymentRowBuilder;

