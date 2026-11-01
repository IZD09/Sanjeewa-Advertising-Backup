/**
 * SanjeewaAdvertising - Printing Order Builder
 *
 * Implements the Builder Pattern (GoF) extending the Core BaseTableRowBuilder:
 * - PrintingOrderBuilder: Fluent builder class with setters, defaults, and .build() finalization.
 * - PrintingOrder: Lightweight Order entity model providing table row HTML rendering.
 */

import { BaseTableRowBuilder } from "../core/BaseTableRowBuilder.js";

/**
 * PrintingOrder - Constructed Order Entity
 */
export class PrintingOrder {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  /**
   * Render table row element (<tr>) with complete styling and action buttons.
   * @returns {HTMLTableRowElement|string}
   */
  render() {
    const paymentBadgeClass = String(this.paymentStatus || "unpaid").toLowerCase().replace(/\s+/g, "-");
    const orderBadgeClass = String(this.orderStatus || "pending").toLowerCase().replace(/\s+/g, "-");
    const dimensions = `${this.width} × ${this.height} ${this.unit}`;
    const totalFormatted = `Rs. ${Number(this.totalAmount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

    const html = `
      <td class="order-id-cell">${this.id}</td>
      <td class="customer-cell">
        <strong>${this.customerName}</strong>
        <span>${this.customerMobile || "—"}</span>
      </td>
      <td class="product-cell">
        <strong>${this.productName}</strong>
        <span>${dimensions}</span>
      </td>
      <td style="font-weight: 700;">${this.quantity}</td>
      <td class="currency-cell">${totalFormatted}</td>
      <td>
        <span class="status-badge ${paymentBadgeClass}">${this.paymentStatus}</span>
      </td>
      <td>${this.requiredDate}</td>
      <td>
        <span class="status-badge ${orderBadgeClass}">${this.orderStatus}</span>
      </td>
      <td>${this.assignedEmployee || "Unassigned"}</td>
      <td>
        <div class="po-action-group">
          <button class="action-btn" title="View Order" onclick="window.placeOrderApp?.openViewModal('${this.id}')">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button class="action-btn" title="Edit Order" onclick="window.placeOrderApp?.openEditModal('${this.id}')">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="action-btn pay-action" title="Add Payment Installment" onclick="window.placeOrderApp?.openAddPaymentModal('${this.id}')">
            <i class="fa-solid fa-credit-card"></i>
          </button>
          <button class="action-btn" title="Payment History" onclick="window.placeOrderApp?.openHistoryModal('${this.id}')">
            <i class="fa-solid fa-clock-rotate-left"></i>
          </button>
          <button class="action-btn print-action" title="Print Receipt" onclick="window.placeOrderApp?.printLatestReceipt('${this.id}')">
            <i class="fa-solid fa-print"></i>
          </button>
        </div>
      </td>
    `;

    if (typeof document !== "undefined" && typeof document.createElement === "function") {
      const tr = document.createElement("tr");
      tr.id = `orderRow_${this.id}`;
      tr.innerHTML = html;
      return tr;
    }

    return `<tr id="orderRow_${this.id}">${html}</tr>`;
  }

  renderTableRow() {
    return this.render();
  }

  static fromArray(list) {
    if (!Array.isArray(list)) return [];
    return list.map(item => new PrintingOrderBuilder(item).build());
  }
}

/**
 * PrintingOrderBuilder - Fluent Builder Class extending Core BaseTableRowBuilder
 */
export class PrintingOrderBuilder extends BaseTableRowBuilder {
  constructor(initialData = null) {
    super(initialData);
  }

  /**
   * Initialize or reset builder attributes to standard defaults.
   * @returns {PrintingOrderBuilder}
   */
  reset() {
    super.reset();
    this.id = "";
    this.orderDate = "";
    this.customerId = "";
    this.customerName = "";
    this.customerMobile = "";
    this.productKey = "flex_normal";
    this.productName = "Flex Banner (Normal 280gsm)";
    this.width = 0;
    this.height = 0;
    this.unit = "feet";
    this.quantity = 1;
    this.areaSqFt = 0;
    this.unitPrice = 0.00;
    this.designStatus = "Customer Provides Design";
    this.deliveryMethod = "Pickup";
    this.requiredDate = "";
    this.totalAmount = 0.00;
    this.paidAmount = 0.00;
    this.balanceAmount = 0.00;
    this.paymentStatus = "Unpaid";
    this.orderStatus = "Pending";
    this.assignedEmployee = "Admin User";
    this.notes = "";
    return this;
  }

  /**
   * Load properties from an existing object or dictionary.
   * @param {Object} data
   * @returns {PrintingOrderBuilder}
   */
  fromData(data = {}) {
    if (!data || typeof data !== "object") return this;
    super.fromData(data);

    if (data.id !== undefined || data.order_id !== undefined) this.setId(data.id ?? data.order_id);
    if (data.orderDate !== undefined || data.order_date !== undefined) this.setOrderDate(data.orderDate ?? data.order_date);
    if (data.customerId !== undefined || data.customer_id !== undefined) this.setCustomerId(data.customerId ?? data.customer_id);
    if (data.customerName !== undefined || data.customer_name !== undefined) this.setCustomerName(data.customerName ?? data.customer_name);
    if (data.customerMobile !== undefined || data.customer_mobile !== undefined) this.setCustomerMobile(data.customerMobile ?? data.customer_mobile);
    if (data.productKey !== undefined || data.product_key !== undefined) this.setProductKey(data.productKey ?? data.product_key);
    if (data.productName !== undefined || data.product_name !== undefined) this.setProductName(data.productName ?? data.product_name);
    if (data.width !== undefined) this.setWidth(data.width);
    if (data.height !== undefined) this.setHeight(data.height);
    if (data.unit !== undefined) this.setUnit(data.unit);
    if (data.quantity !== undefined || data.qty !== undefined) this.setQuantity(data.quantity ?? data.qty);
    if (data.areaSqFt !== undefined || data.area_sq_ft !== undefined) this.setAreaSqFt(data.areaSqFt ?? data.area_sq_ft);
    if (data.unitPrice !== undefined || data.unit_price !== undefined) this.setUnitPrice(data.unitPrice ?? data.unit_price);
    if (data.designStatus !== undefined || data.design_status !== undefined) this.setDesignStatus(data.designStatus ?? data.design_status);
    if (data.deliveryMethod !== undefined || data.delivery_method !== undefined) this.setDeliveryMethod(data.deliveryMethod ?? data.delivery_method);
    if (data.requiredDate !== undefined || data.required_date !== undefined || data.deadline !== undefined) {
      this.setRequiredDate(data.requiredDate ?? data.required_date ?? data.deadline);
    }
    if (data.totalAmount !== undefined || data.total_amount !== undefined) this.setTotalAmount(data.totalAmount ?? data.total_amount);
    if (data.paidAmount !== undefined || data.paid_amount !== undefined) this.setPaidAmount(data.paidAmount ?? data.paid_amount);
    if (data.balanceAmount !== undefined || data.balance_amount !== undefined) this.setBalanceAmount(data.balanceAmount ?? data.balance_amount);
    if (data.paymentStatus !== undefined || data.payment_status !== undefined) this.setPaymentStatus(data.paymentStatus ?? data.payment_status);
    if (data.orderStatus !== undefined || data.order_status !== undefined) this.setOrderStatus(data.orderStatus ?? data.order_status);
    if (data.assignedEmployee !== undefined || data.assigned_employee !== undefined) this.setAssignedEmployee(data.assignedEmployee ?? data.assigned_employee);
    if (data.notes !== undefined || data.note !== undefined) this.setNotes(data.notes ?? data.note);

    return this;
  }

  // ==========================================
  // FLUENT SETTERS
  // ==========================================

  setId(id) {
    this.id = id !== undefined && id !== null ? String(id).trim() : "";
    return this;
  }

  setOrderDate(orderDate) {
    this.orderDate = this.formatDate(orderDate);
    return this;
  }

  setCustomerId(customerId) {
    this.customerId = String(customerId ?? "").trim();
    return this;
  }

  setCustomerName(customerName) {
    this.customerName = String(customerName ?? "").trim();
    return this;
  }

  setCustomerMobile(customerMobile) {
    this.customerMobile = String(customerMobile ?? "").trim();
    return this;
  }

  setProductKey(productKey) {
    this.productKey = String(productKey ?? "flex_normal").trim();
    return this;
  }

  setProductName(productName) {
    this.productName = String(productName ?? "").trim();
    return this;
  }

  setWidth(width) {
    const parsed = parseFloat(width);
    this.width = isNaN(parsed) || parsed < 0 ? 0 : Math.round(parsed * 100) / 100;
    return this;
  }

  setHeight(height) {
    const parsed = parseFloat(height);
    this.height = isNaN(parsed) || parsed < 0 ? 0 : Math.round(parsed * 100) / 100;
    return this;
  }

  setUnit(unit) {
    this.unit = String(unit ?? "feet").trim();
    return this;
  }

  setQuantity(quantity) {
    const parsed = parseInt(quantity, 10);
    this.quantity = isNaN(parsed) || parsed < 1 ? 1 : parsed;
    return this;
  }

  setAreaSqFt(areaSqFt) {
    const parsed = parseFloat(areaSqFt);
    this.areaSqFt = isNaN(parsed) || parsed < 0 ? 0 : Math.round(parsed * 100) / 100;
    return this;
  }

  setUnitPrice(unitPrice) {
    const parsed = parseFloat(unitPrice);
    this.unitPrice = isNaN(parsed) || parsed < 0 ? 0.00 : Math.round(parsed * 100) / 100;
    return this;
  }

  setDesignStatus(designStatus) {
    this.designStatus = String(designStatus ?? "Customer Provides Design").trim();
    return this;
  }

  setDeliveryMethod(deliveryMethod) {
    this.deliveryMethod = String(deliveryMethod ?? "Pickup").trim();
    return this;
  }

  setRequiredDate(requiredDate) {
    this.requiredDate = this.formatDate(requiredDate);
    return this;
  }

  setTotalAmount(totalAmount) {
    const parsed = parseFloat(totalAmount);
    this.totalAmount = isNaN(parsed) || parsed < 0 ? 0.00 : Math.round(parsed * 100) / 100;
    return this;
  }

  setPaidAmount(paidAmount) {
    const parsed = parseFloat(paidAmount);
    this.paidAmount = isNaN(parsed) || parsed < 0 ? 0.00 : Math.round(parsed * 100) / 100;
    return this;
  }

  setBalanceAmount(balanceAmount) {
    const parsed = parseFloat(balanceAmount);
    this.balanceAmount = isNaN(parsed) || parsed < 0 ? 0.00 : Math.round(parsed * 100) / 100;
    return this;
  }

  setPaymentStatus(paymentStatus) {
    this.paymentStatus = String(paymentStatus ?? "Unpaid").trim();
    return this;
  }

  setOrderStatus(orderStatus) {
    this.orderStatus = String(orderStatus ?? "Pending").trim();
    return this;
  }

  setAssignedEmployee(assignedEmployee) {
    this.assignedEmployee = String(assignedEmployee ?? "Admin User").trim();
    return this;
  }

  setNotes(notes) {
    this.notes = String(notes ?? "").trim();
    return this;
  }

  // ==========================================
  // FINALIZATION & BUILD
  // ==========================================

  /**
   * Finalizes the build process and returns a complete PrintingOrder instance.
   * @returns {PrintingOrder}
   */
  build() {
    return new PrintingOrder({
      id: this.id,
      orderDate: this.orderDate,
      customerId: this.customerId,
      customerName: this.customerName,
      customerMobile: this.customerMobile,
      productKey: this.productKey,
      productName: this.productName,
      width: this.width,
      height: this.height,
      unit: this.unit,
      quantity: this.quantity,
      areaSqFt: this.areaSqFt,
      unitPrice: this.unitPrice,
      designStatus: this.designStatus,
      deliveryMethod: this.deliveryMethod,
      requiredDate: this.requiredDate,
      totalAmount: this.totalAmount,
      paidAmount: this.paidAmount,
      balanceAmount: this.balanceAmount,
      paymentStatus: this.paymentStatus,
      orderStatus: this.orderStatus,
      assignedEmployee: this.assignedEmployee,
      notes: this.notes
    });
  }
}

if (typeof window !== "undefined") {
  window.PrintingOrder = PrintingOrder;
  window.PrintingOrderBuilder = PrintingOrderBuilder;
}

export default PrintingOrderBuilder;
