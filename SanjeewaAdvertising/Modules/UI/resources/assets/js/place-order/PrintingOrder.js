/**
 * SanjeewaAdvertising - Printing Order Model
 * Concise OOP model with getters, setters, and table row rendering.
 */

export class PrintingOrder {
  constructor(data = null) {
    this._id = "";
    this._orderDate = "";
    this._customerId = "";
    this._customerName = "";
    this._customerMobile = "";
    this._productKey = "flex_normal";
    this._productName = "Flex Banner (Normal 280gsm)";
    this._width = 0;
    this._height = 0;
    this._unit = "feet";
    this._quantity = 1;
    this._areaSqFt = 0;
    this._unitPrice = 0.00;
    this._designStatus = "Customer Provides Design";
    this._deliveryMethod = "Pickup";
    this._requiredDate = "";
    this._totalAmount = 0.00;
    this._paidAmount = 0.00;
    this._balanceAmount = 0.00;
    this._paymentStatus = "Unpaid";
    this._orderStatus = "Pending";
    this._assignedEmployee = "Admin User";
    this._notes = "";

    if (data && typeof data === "object") {
      this.setId(data.id ?? data.order_id ?? "")
        .setOrderDate(data.orderDate ?? data.order_date ?? "")
        .setCustomerId(data.customerId ?? data.customer_id ?? "")
        .setCustomerName(data.customerName ?? data.customer_name ?? "")
        .setCustomerMobile(data.customerMobile ?? data.customer_mobile ?? "")
        .setProductKey(data.productKey ?? data.product_key ?? "flex_normal")
        .setProductName(data.productName ?? data.product_name ?? "")
        .setWidth(data.width ?? 0)
        .setHeight(data.height ?? 0)
        .setUnit(data.unit ?? "feet")
        .setQuantity(data.quantity ?? data.qty ?? 1)
        .setAreaSqFt(data.areaSqFt ?? data.area_sq_ft ?? 0)
        .setUnitPrice(data.unitPrice ?? data.unit_price ?? 0.00)
        .setDesignStatus(data.designStatus ?? data.design_status ?? "Customer Provides Design")
        .setDeliveryMethod(data.deliveryMethod ?? data.delivery_method ?? "Pickup")
        .setRequiredDate(data.requiredDate ?? data.required_date ?? data.deadline ?? "")
        .setTotalAmount(data.totalAmount ?? data.total_amount ?? 0.00)
        .setPaidAmount(data.paidAmount ?? data.paid_amount ?? 0.00)
        .setBalanceAmount(data.balanceAmount ?? data.balance_amount ?? 0.00)
        .setPaymentStatus(data.paymentStatus ?? data.payment_status ?? "Unpaid")
        .setOrderStatus(data.orderStatus ?? data.order_status ?? "Pending")
        .setAssignedEmployee(data.assignedEmployee ?? data.assigned_employee ?? "Admin User")
        .setNotes(data.notes ?? data.note ?? "");
    }
  }

  // ==========================================
  // GETTERS (Property & Method styles)
  // ==========================================

  getId() { return this._id; }
  getOrderDate() { return this._orderDate; }
  getCustomerId() { return this._customerId; }
  getCustomerName() { return this._customerName; }
  getCustomerMobile() { return this._customerMobile; }
  getProductKey() { return this._productKey; }
  getProductName() { return this._productName; }
  getWidth() { return this._width; }
  getHeight() { return this._height; }
  getUnit() { return this._unit; }
  getQuantity() { return this._quantity; }
  getAreaSqFt() { return this._areaSqFt; }
  getUnitPrice() { return this._unitPrice; }
  getDesignStatus() { return this._designStatus; }
  getDeliveryMethod() { return this._deliveryMethod; }
  getRequiredDate() { return this._requiredDate; }
  getTotalAmount() { return this._totalAmount; }
  getPaidAmount() { return this._paidAmount; }
  getBalanceAmount() { return this._balanceAmount; }
  getPaymentStatus() { return this._paymentStatus; }
  getOrderStatus() { return this._orderStatus; }
  getAssignedEmployee() { return this._assignedEmployee; }
  getNotes() { return this._notes; }

  get id() { return this._id; }
  set id(v) { this.setId(v); }
  get orderDate() { return this._orderDate; }
  set orderDate(v) { this.setOrderDate(v); }
  get customerId() { return this._customerId; }
  set customerId(v) { this.setCustomerId(v); }
  get customerName() { return this._customerName; }
  set customerName(v) { this.setCustomerName(v); }
  get customerMobile() { return this._customerMobile; }
  set customerMobile(v) { this.setCustomerMobile(v); }
  get productKey() { return this._productKey; }
  set productKey(v) { this.setProductKey(v); }
  get productName() { return this._productName; }
  set productName(v) { this.setProductName(v); }
  get width() { return this._width; }
  set width(v) { this.setWidth(v); }
  get height() { return this._height; }
  set height(v) { this.setHeight(v); }
  get unit() { return this._unit; }
  set unit(v) { this.setUnit(v); }
  get quantity() { return this._quantity; }
  set quantity(v) { this.setQuantity(v); }
  get areaSqFt() { return this._areaSqFt; }
  set areaSqFt(v) { this.setAreaSqFt(v); }
  get unitPrice() { return this._unitPrice; }
  set unitPrice(v) { this.setUnitPrice(v); }
  get designStatus() { return this._designStatus; }
  set designStatus(v) { this.setDesignStatus(v); }
  get deliveryMethod() { return this._deliveryMethod; }
  set deliveryMethod(v) { this.setDeliveryMethod(v); }
  get requiredDate() { return this._requiredDate; }
  set requiredDate(v) { this.setRequiredDate(v); }
  get totalAmount() { return this._totalAmount; }
  set totalAmount(v) { this.setTotalAmount(v); }
  get paidAmount() { return this._paidAmount; }
  set paidAmount(v) { this.setPaidAmount(v); }
  get balanceAmount() { return this._balanceAmount; }
  set balanceAmount(v) { this.setBalanceAmount(v); }
  get paymentStatus() { return this._paymentStatus; }
  set paymentStatus(v) { this.setPaymentStatus(v); }
  get orderStatus() { return this._orderStatus; }
  set orderStatus(v) { this.setOrderStatus(v); }
  get assignedEmployee() { return this._assignedEmployee; }
  set assignedEmployee(v) { this.setAssignedEmployee(v); }
  get notes() { return this._notes; }
  set notes(v) { this.setNotes(v); }

  // ==========================================
  // FLUENT SETTERS (Builder Pattern)
  // ==========================================

  setId(id) {
    this._id = id !== undefined && id !== null ? String(id).trim() : "";
    return this;
  }

  setOrderDate(orderDate) {
    if (orderDate instanceof Date) {
      this._orderDate = orderDate.toISOString().split("T")[0];
    } else {
      this._orderDate = orderDate !== undefined && orderDate !== null ? String(orderDate).trim() : "";
    }
    return this;
  }

  setCustomerId(customerId) {
    this._customerId = customerId !== undefined && customerId !== null ? String(customerId).trim() : "";
    return this;
  }

  setCustomerName(customerName) {
    this._customerName = customerName !== undefined && customerName !== null ? String(customerName).trim() : "";
    return this;
  }

  setCustomerMobile(customerMobile) {
    this._customerMobile = customerMobile !== undefined && customerMobile !== null ? String(customerMobile).trim() : "";
    return this;
  }

  setProductKey(productKey) {
    this._productKey = productKey !== undefined && productKey !== null ? String(productKey).trim() : "flex_normal";
    return this;
  }

  setProductName(productName) {
    this._productName = productName !== undefined && productName !== null ? String(productName).trim() : "";
    return this;
  }

  setWidth(width) {
    const parsed = parseFloat(width);
    this._width = isNaN(parsed) || parsed < 0 ? 0 : Math.round(parsed * 100) / 100;
    return this;
  }

  setHeight(height) {
    const parsed = parseFloat(height);
    this._height = isNaN(parsed) || parsed < 0 ? 0 : Math.round(parsed * 100) / 100;
    return this;
  }

  setUnit(unit) {
    this._unit = unit !== undefined && unit !== null ? String(unit).trim() : "feet";
    return this;
  }

  setQuantity(quantity) {
    const parsed = parseInt(quantity, 10);
    this._quantity = isNaN(parsed) || parsed < 1 ? 1 : parsed;
    return this;
  }

  setAreaSqFt(areaSqFt) {
    const parsed = parseFloat(areaSqFt);
    this._areaSqFt = isNaN(parsed) || parsed < 0 ? 0 : Math.round(parsed * 100) / 100;
    return this;
  }

  setUnitPrice(unitPrice) {
    const parsed = parseFloat(unitPrice);
    this._unitPrice = isNaN(parsed) || parsed < 0 ? 0.00 : Math.round(parsed * 100) / 100;
    return this;
  }

  setDesignStatus(designStatus) {
    this._designStatus = designStatus !== undefined && designStatus !== null ? String(designStatus).trim() : "Customer Provides Design";
    return this;
  }

  setDeliveryMethod(deliveryMethod) {
    this._deliveryMethod = deliveryMethod !== undefined && deliveryMethod !== null ? String(deliveryMethod).trim() : "Pickup";
    return this;
  }

  setRequiredDate(requiredDate) {
    if (requiredDate instanceof Date) {
      this._requiredDate = requiredDate.toISOString().split("T")[0];
    } else {
      this._requiredDate = requiredDate !== undefined && requiredDate !== null ? String(requiredDate).trim() : "";
    }
    return this;
  }

  setTotalAmount(totalAmount) {
    const parsed = parseFloat(totalAmount);
    this._totalAmount = isNaN(parsed) || parsed < 0 ? 0.00 : Math.round(parsed * 100) / 100;
    return this;
  }

  setPaidAmount(paidAmount) {
    const parsed = parseFloat(paidAmount);
    this._paidAmount = isNaN(parsed) || parsed < 0 ? 0.00 : Math.round(parsed * 100) / 100;
    return this;
  }

  setBalanceAmount(balanceAmount) {
    const parsed = parseFloat(balanceAmount);
    this._balanceAmount = isNaN(parsed) || parsed < 0 ? 0.00 : Math.round(parsed * 100) / 100;
    return this;
  }

  setPaymentStatus(paymentStatus) {
    this._paymentStatus = paymentStatus !== undefined && paymentStatus !== null ? String(paymentStatus).trim() : "Unpaid";
    return this;
  }

  setOrderStatus(orderStatus) {
    this._orderStatus = orderStatus !== undefined && orderStatus !== null ? String(orderStatus).trim() : "Pending";
    return this;
  }

  setAssignedEmployee(assignedEmployee) {
    this._assignedEmployee = assignedEmployee !== undefined && assignedEmployee !== null ? String(assignedEmployee).trim() : "Admin User";
    return this;
  }

  setNotes(notes) {
    this._notes = notes !== undefined && notes !== null ? String(notes).trim() : "";
    return this;
  }

  // ==========================================
  // TABLE ROW RENDERING
  // ==========================================

  /**
   * Render table row element (<tr>) with complete styling and action buttons.
   * @returns {HTMLTableRowElement|string}
   */
  render() {
    const paymentBadgeClass = String(this._paymentStatus).toLowerCase().replace(/\s+/g, "-");
    const orderBadgeClass = String(this._orderStatus).toLowerCase().replace(/\s+/g, "-");
    const balanceClass = this._balanceAmount > 0 ? "balance-outstanding" : "balance-settled";
    const dimensions = `${this._width} × ${this._height} ${this._unit}`;
    const totalFormatted = `Rs. ${this._totalAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    const paidFormatted = `Rs. ${this._paidAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    const balanceFormatted = `Rs. ${this._balanceAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

    const html = `
      <td class="order-id-cell">${this._id}</td>
      <td class="customer-cell">
        <strong>${this._customerName}</strong>
        <span>${this._customerMobile}</span>
      </td>
      <td>${this._customerMobile}</td>
      <td class="product-cell">
        <strong>${this._productName}</strong>
        <span>${dimensions}</span>
      </td>
      <td style="font-weight: 700;">${this._quantity}</td>
      <td class="currency-cell">${totalFormatted}</td>
      <td class="currency-cell" style="color: var(--green);">${paidFormatted}</td>
      <td class="currency-cell ${balanceClass}">${balanceFormatted}</td>
      <td>
        <span class="status-badge ${paymentBadgeClass}">${this._paymentStatus}</span>
      </td>
      <td>${this._requiredDate}</td>
      <td>
        <span class="status-badge ${orderBadgeClass}">${this._orderStatus}</span>
      </td>
      <td>${this._assignedEmployee || "Unassigned"}</td>
      <td>
        <div class="po-action-group">
          <button class="action-btn" title="View Order" onclick="window.placeOrderApp?.openViewModal('${this._id}')">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button class="action-btn" title="Edit Order" onclick="window.placeOrderApp?.openEditModal('${this._id}')">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="action-btn pay-action" title="Add Payment Installment" onclick="window.placeOrderApp?.openAddPaymentModal('${this._id}')">
            <i class="fa-solid fa-credit-card"></i>
          </button>
          <button class="action-btn" title="Payment History" onclick="window.placeOrderApp?.openHistoryModal('${this._id}')">
            <i class="fa-solid fa-clock-rotate-left"></i>
          </button>
          <button class="action-btn print-action" title="Print Receipt" onclick="window.placeOrderApp?.printLatestReceipt('${this._id}')">
            <i class="fa-solid fa-print"></i>
          </button>
        </div>
      </td>
    `;

    if (typeof document !== "undefined" && typeof document.createElement === "function") {
      const tr = document.createElement("tr");
      tr.id = `orderRow_${this._id}`;
      tr.innerHTML = html;
      return tr;
    }

    return `<tr id="orderRow_${this._id}">${html}</tr>`;
  }

  /**
   * Alias for render().
   * @returns {HTMLTableRowElement|string}
   */
  renderTableRow() {
    return this.render();
  }

  // ==========================================
  // SERIALIZATION & FACTORY
  // ==========================================

  toJSON() {
    return {
      id: this._id,
      orderDate: this._orderDate,
      customerId: this._customerId,
      customerName: this._customerName,
      customerMobile: this._customerMobile,
      productKey: this._productKey,
      productName: this._productName,
      width: this._width,
      height: this._height,
      unit: this._unit,
      quantity: this._quantity,
      areaSqFt: this._areaSqFt,
      unitPrice: this._unitPrice,
      designStatus: this._designStatus,
      deliveryMethod: this._deliveryMethod,
      requiredDate: this._requiredDate,
      totalAmount: this._totalAmount,
      paidAmount: this._paidAmount,
      balanceAmount: this._balanceAmount,
      paymentStatus: this._paymentStatus,
      orderStatus: this._orderStatus,
      assignedEmployee: this._assignedEmployee,
      notes: this._notes
    };
  }

  static fromArray(list) {
    if (!Array.isArray(list)) return [];
    return list.map(item => new PrintingOrder(item));
  }
}

if (typeof window !== "undefined") {
  window.PrintingOrder = PrintingOrder;
}

export default PrintingOrder;
