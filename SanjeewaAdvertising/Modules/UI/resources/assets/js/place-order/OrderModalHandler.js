/**
 * SanjeewaAdvertising - Order Modal Handler
 * Manages Order Confirmation Modal, Order View Modal, and Order Edit Modal
 * with live recalculation and audit tracking.
 */

import { PrintingOrder } from "./PrintingOrder.js";

export class OrderModalHandler {
  /**
   * @param {Object} options
   * @param {Object} options.products
   * @param {Array} options.employees
   * @param {string} options.currentUser
   * @param {Object} options.dataLoader
   * @param {Object} options.pricingCalculator
   * @param {Function} options.getOrders
   * @param {Function} options.getPayments
   * @param {Function} options.getSelectedCustomer
   * @param {Function} options.clearSelectedCustomer
   * @param {Function} options.openModal
   * @param {Function} options.closeModal
   * @param {Function} options.showToast
   * @param {Function} options.onOrderCreated
   * @param {Function} options.onOrderUpdated
   * @param {Function} options.resetOrderForm
   */
  constructor(options = {}) {
    this.products = options.products || {};
    this.employees = options.employees || ["Admin User", "Kasun Perera", "Nuwan Silva", "Dilshan Fernando", "Chamara Bandara"];
    this.currentUser = options.currentUser || "Admin User";
    this.dataLoader = options.dataLoader;
    this.pricingCalculator = options.pricingCalculator;
    this.getOrders = options.getOrders || (() => []);
    this.getPayments = options.getPayments || (() => []);
    this.getSelectedCustomer = options.getSelectedCustomer || (() => null);
    this.clearSelectedCustomer = options.clearSelectedCustomer || (() => {});
    this.openModal = options.openModal || (() => {});
    this.closeModal = options.closeModal || (() => {});
    this.showToast = options.showToast || (() => {});
    this.onOrderCreated = options.onOrderCreated || (() => {});
    this.onOrderUpdated = options.onOrderUpdated || (() => {});
    this.resetOrderForm = options.resetOrderForm || (() => {});

    this.currentContextOrder = null;
    this._editModalLiveCalcBound = false;

    this.bindGlobalEvents();
  }

  setProducts(products) {
    this.products = products || {};
  }

  setEmployees(employees) {
    this.employees = employees || [];
  }

  setCurrentUser(user) {
    this.currentUser = user || "Admin User";
  }

  bindGlobalEvents() {
    // Place order form submit -> open confirmation modal
    const form = document.getElementById("placeOrderForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.openOrderConfirmation();
      });
    }

    // Confirm button inside confirmation modal
    const confirmBtn = document.getElementById("confirmPlaceOrderBtn");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => this.saveNewOrder());
    }

    // Save button inside edit modal
    const saveEditBtn = document.getElementById("saveEditOrderBtn");
    if (saveEditBtn) {
      saveEditBtn.addEventListener("click", () => this.saveOrderEdit());
    }
  }

  /* ==========================================================================
     Order Confirmation Modal
     ========================================================================== */
  openOrderConfirmation() {
    const selectedCustomer = this.getSelectedCustomer();
    if (!selectedCustomer) {
      this.showToast("Please search and select a customer first", "error");
      const searchInput = document.getElementById("customerSearchInput");
      if (searchInput) searchInput.focus();
      return;
    }

    const width = parseFloat(document.getElementById("poWidth")?.value);
    const height = parseFloat(document.getElementById("poHeight")?.value);
    const qty = parseInt(document.getElementById("poQty")?.value, 10);
    const unitPrice = parseFloat(document.getElementById("poUnitPrice")?.value);
    const requiredDate = document.getElementById("poRequiredDate")?.value;

    if (width <= 0 || height <= 0 || isNaN(width) || isNaN(height)) {
      this.showToast("Width and Height must be greater than zero", "error");
      return;
    }
    if (qty <= 0 || isNaN(qty)) {
      this.showToast("Quantity must be at least 1", "error");
      return;
    }
    if (unitPrice < 0 || isNaN(unitPrice)) {
      this.showToast("Unit price cannot be negative", "error");
      return;
    }
    if (!requiredDate) {
      this.showToast("Please select a required deadline date", "error");
      return;
    }

    const calc = this.pricingCalculator.calculateMainForm();
    const prodKey = document.getElementById("poProductType")?.value || "flex_normal";
    const prod = this.products[prodKey] || { name: "Flex Banner" };

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setTxt("confCustName", selectedCustomer.name);
    setTxt("confCustMobile", selectedCustomer.mobile);
    setTxt("confProduct", prod.name);
    setTxt("confSpecs", `${width} × ${height} ${document.getElementById("poUnit")?.value || "feet"} (Qty: ${qty})`);
    setTxt("confTotal", `Rs. ${calc.totalAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("confPaid", `Rs. ${calc.paidAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("confBalance", `Rs. ${calc.balanceAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("confStatus", calc.paymentStatus);
    setTxt("confDeadline", requiredDate);

    this.openModal("orderConfirmationModal");
  }

  saveNewOrder(ordersList, paymentsList) {
    const orders = ordersList || this.getOrders();
    const payments = paymentsList || this.getPayments();
    const selectedCustomer = this.getSelectedCustomer();

    if (!selectedCustomer) {
      this.showToast("No customer selected", "error");
      return;
    }

    const calc = this.pricingCalculator.calculateMainForm();
    const prodKey = document.getElementById("poProductType")?.value || "flex_normal";
    const prod = this.products[prodKey] || { name: "Flex Banner" };
    const width = parseFloat(document.getElementById("poWidth")?.value) || 0;
    const height = parseFloat(document.getElementById("poHeight")?.value) || 0;
    const unit = document.getElementById("poUnit")?.value || "feet";
    const qty = parseInt(document.getElementById("poQty")?.value, 10) || 1;
    const unitPrice = parseFloat(document.getElementById("poUnitPrice")?.value) || 0;
    const designStatus = document.getElementById("poDesignStatus")?.value || "Customer Provides Design";
    const deliveryMethod = document.getElementById("poDeliveryMethod")?.value || "Pickup";
    const requiredDate = document.getElementById("poRequiredDate")?.value;
    const notes = document.getElementById("poNotes")?.value?.trim() || "";

    const nextOrderNum = 1000 + orders.length + 1;
    const orderId = `ORD-2026-${nextOrderNum}`;
    const todayStr = new Date().toISOString().split("T")[0];

    const newOrder = new PrintingOrder()
      .setId(orderId)
      .setOrderDate(todayStr)
      .setCustomerId(selectedCustomer.id)
      .setCustomerName(selectedCustomer.name)
      .setCustomerMobile(selectedCustomer.mobile)
      .setProductKey(prodKey)
      .setProductName(prod.name)
      .setWidth(width)
      .setHeight(height)
      .setUnit(unit)
      .setQuantity(qty)
      .setAreaSqFt(calc.areaSqFt)
      .setUnitPrice(unitPrice)
      .setDesignStatus(designStatus)
      .setDeliveryMethod(deliveryMethod)
      .setRequiredDate(requiredDate)
      .setTotalAmount(calc.totalAmount)
      .setPaidAmount(calc.paidAmount)
      .setBalanceAmount(calc.balanceAmount)
      .setPaymentStatus(calc.paymentStatus)
      .setOrderStatus("Pending")
      .setAssignedEmployee(this.employees[1] || "Admin User")
      .setNotes(notes);

    orders.unshift(newOrder);
    if (this.dataLoader) {
      this.dataLoader.saveOrders(orders);
    }

    // Initial installment if advance paid
    if (calc.paidAmount > 0) {
      const paymentId = `PAY-2026-${String(payments.length + 1).padStart(4, "0")}`;
      const initPayment = {
        paymentId,
        orderId,
        installmentNo: 1,
        date: todayStr,
        amount: calc.paidAmount,
        method: "Cash",
        ref: "ADVANCE-INIT",
        receivedBy: this.currentUser,
        status: "Successful",
        note: "Initial advance on order creation"
      };
      payments.unshift(initPayment);
      if (this.dataLoader) {
        this.dataLoader.savePayments(payments);
      }
    }

    if (this.dataLoader) {
      this.dataLoader.logAudit("CREATE_ORDER", orderId, `Created order with Total: Rs. ${calc.totalAmount}, Paid: Rs. ${calc.paidAmount}`);
    }

    this.closeModal("orderConfirmationModal");
    this.showToast(`Order ${orderId} created successfully!`, "success");

    this.resetOrderForm();
    this.onOrderCreated(newOrder, orders, payments);
  }

  /* ==========================================================================
     Order View Modal
     ========================================================================== */
  openViewModal(orderOrId) {
    let order = orderOrId;
    if (typeof orderOrId === "string") {
      order = this.getOrders().find(o => o.id === orderOrId);
    }
    if (!order) return;
    this.currentContextOrder = order;

    const titleElem = document.getElementById("viewModalTitle");
    if (titleElem) {
      titleElem.innerHTML = `<i class="fa-solid fa-file-invoice"></i> Order Details — ${order.id}`;
    }

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setTxt("voId", order.id);
    setTxt("voDate", order.orderDate);
    setTxt("voCustName", order.customerName);
    setTxt("voCustMobile", order.customerMobile);
    setTxt("voProduct", order.productName);
    setTxt("voDimensions", `${order.width} × ${order.height} ${order.unit}`);
    setTxt("voQuantity", String(order.quantity));
    setTxt("voUnitPrice", `Rs. ${Number(order.unitPrice || 0).toFixed(2)}`);
    setTxt("voTotal", `Rs. ${Number(order.totalAmount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("voPaid", `Rs. ${Number(order.paidAmount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("voBalance", `Rs. ${Number(order.balanceAmount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("voPaymentStatus", order.paymentStatus);
    setTxt("voDeadline", order.requiredDate);
    setTxt("voOrderStatus", order.orderStatus);
    setTxt("voAssigned", order.assignedEmployee || "Unassigned");

    this.openModal("viewOrderModal");
  }

  /* ==========================================================================
     Order Edit Modal
     ========================================================================== */
  openEditModal(orderOrId) {
    let order = orderOrId;
    if (typeof orderOrId === "string") {
      order = this.getOrders().find(o => o.id === orderOrId);
    }
    if (!order) return;
    this.currentContextOrder = order;

    const setTxt = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val !== undefined && val !== null ? val : "";
    };

    const modalTitle = document.getElementById("editModalTitle");
    if (modalTitle) {
      modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Order — ${order.id}`;
    }

    setTxt("eoId", order.id);
    setTxt("eoDate", order.orderDate);

    setVal("eoCustNameInput", order.customerName || "");
    setVal("eoCustMobileInput", order.customerMobile || "");
    setVal("eoProductSelect", order.productKey || "flex_normal");
    setVal("eoWidthInput", order.width !== undefined ? order.width : 10);
    setVal("eoHeightInput", order.height !== undefined ? order.height : 4);
    setVal("eoUnitSelect", order.unit || "feet");
    setVal("eoQuantityInput", order.quantity || 1);
    setVal("eoUnitPriceInput", order.unitPrice !== undefined ? order.unitPrice : 95);
    setVal("eoDesignStatusSelect", order.designStatus || "Customer Provides Design");
    setVal("eoDeliverySelect", order.deliveryMethod || "Pickup");
    setVal("eoDeadlineInput", order.requiredDate || "");
    setVal("eoStatusSelect", order.orderStatus || "Pending");
    setVal("eoEmployeeSelect", order.assignedEmployee || (this.employees[0] || "Admin User"));
    setVal("eoNotesInput", order.notes || "");

    this.bindEditModalLiveCalc();
    this.pricingCalculator.calculateEditModal(this.currentContextOrder);

    this.openModal("editOrderModal");
  }

  bindEditModalLiveCalc() {
    if (this._editModalLiveCalcBound) return;
    this._editModalLiveCalcBound = true;

    const calcFieldIds = [
      "eoProductSelect", "eoWidthInput", "eoHeightInput", "eoUnitSelect",
      "eoQuantityInput", "eoUnitPriceInput", "eoDesignStatusSelect", "eoDeliverySelect"
    ];

    calcFieldIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => this.pricingCalculator.calculateEditModal(this.currentContextOrder));
        el.addEventListener("change", () => {
          if (id === "eoProductSelect") {
            const prod = this.products[el.value];
            if (prod) {
              const priceInput = document.getElementById("eoUnitPriceInput");
              if (priceInput) priceInput.value = prod.unitPrice;
              const unitSelect = document.getElementById("eoUnitSelect");
              if (unitSelect && prod.defaultUnit) unitSelect.value = prod.defaultUnit;
            }
          }
          this.pricingCalculator.calculateEditModal(this.currentContextOrder);
        });
      }
    });
  }

  saveOrderEdit(ordersList) {
    if (!this.currentContextOrder) return;
    const orders = ordersList || this.getOrders();

    const custName = document.getElementById("eoCustNameInput")?.value?.trim();
    const custMobile = document.getElementById("eoCustMobileInput")?.value?.trim();
    const productKey = document.getElementById("eoProductSelect")?.value;
    const width = parseFloat(document.getElementById("eoWidthInput")?.value) || 0;
    const height = parseFloat(document.getElementById("eoHeightInput")?.value) || 0;
    const unit = document.getElementById("eoUnitSelect")?.value || "feet";
    const quantity = parseInt(document.getElementById("eoQuantityInput")?.value, 10) || 1;
    const unitPrice = parseFloat(document.getElementById("eoUnitPriceInput")?.value) || 0;
    const designStatus = document.getElementById("eoDesignStatusSelect")?.value;
    const deliveryMethod = document.getElementById("eoDeliverySelect")?.value;
    const requiredDate = document.getElementById("eoDeadlineInput")?.value;
    const orderStatus = document.getElementById("eoStatusSelect")?.value;
    const assignedEmployee = document.getElementById("eoEmployeeSelect")?.value;
    const notes = document.getElementById("eoNotesInput")?.value?.trim() || "";

    if (!custName) {
      this.showToast("Please enter customer name", "error");
      return;
    }
    if (!custMobile) {
      this.showToast("Please enter customer mobile number", "error");
      return;
    }
    if (!requiredDate) {
      this.showToast("Please provide a valid deadline date", "error");
      return;
    }

    const calc = this.pricingCalculator.calculateEditModal(this.currentContextOrder);
    const prodInfo = this.products[productKey] || { name: "Custom Print" };

    this.currentContextOrder.customerName = custName;
    this.currentContextOrder.customerMobile = custMobile;
    this.currentContextOrder.productKey = productKey;
    this.currentContextOrder.productName = prodInfo.name;
    this.currentContextOrder.width = width;
    this.currentContextOrder.height = height;
    this.currentContextOrder.unit = unit;
    this.currentContextOrder.quantity = quantity;
    this.currentContextOrder.unitPrice = unitPrice;
    this.currentContextOrder.areaSqFt = calc ? calc.areaSqFt : this.currentContextOrder.areaSqFt;
    this.currentContextOrder.designStatus = designStatus;
    this.currentContextOrder.deliveryMethod = deliveryMethod;
    this.currentContextOrder.requiredDate = requiredDate;
    this.currentContextOrder.orderStatus = orderStatus;
    this.currentContextOrder.assignedEmployee = assignedEmployee;
    this.currentContextOrder.notes = notes;
    this.currentContextOrder.totalAmount = calc ? calc.totalAmount : this.currentContextOrder.totalAmount;
    this.currentContextOrder.balanceAmount = calc ? calc.balanceAmount : this.currentContextOrder.balanceAmount;
    this.currentContextOrder.paymentStatus = calc ? calc.paymentStatus : this.currentContextOrder.paymentStatus;

    if (this.dataLoader) {
      this.dataLoader.saveOrders(orders);
      this.dataLoader.logAudit("EDIT_ORDER", this.currentContextOrder.id, `Updated details, Total: Rs. ${this.currentContextOrder.totalAmount}, Status: ${orderStatus}`);
    }

    this.closeModal("editOrderModal");
    this.showToast(`Order ${this.currentContextOrder.id} updated successfully!`, "success");

    this.onOrderUpdated(this.currentContextOrder, orders);
  }
}

export default OrderModalHandler;
