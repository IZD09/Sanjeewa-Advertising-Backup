/**
 * SanjeewaAdvertising - Order Placement Process
 * Encapsulates the entire order placement lifecycle & workflow:
 * - Date pickers & form input initialization
 * - Product selection, default unit & unit price synchronization
 * - Real-time dimensions, square footage, & pricing calculation
 * - Multi-attribute form validation (customer, dimensions, quantity, deadline)
 * - Order confirmation modal population & review
 * - Order entity construction via PrintingOrder fluent builder
 * - Automatic initial payment installment creation on advance deposits
 * - Storage persistence & audit logging via PlaceOrderDataLoad
 * - Form reset & post-placement notification/callbacks
 */

import { PrintingOrderBuilder } from "./PrintingOrderBuilder.js";

export class OrderPlacementProcess {
  /**
   * @param {Object} options
   * @param {Object} [options.products]
   * @param {Array} [options.employees]
   * @param {string} [options.currentUser]
   * @param {Object} [options.dataLoader]
   * @param {Object} [options.pricingCalculator]
   * @param {Function} [options.getOrders]
   * @param {Function} [options.getPayments]
   * @param {Function} [options.getSelectedCustomer]
   * @param {Function} [options.clearSelectedCustomer]
   * @param {Function} [options.openModal]
   * @param {Function} [options.closeModal]
   * @param {Function} [options.showToast]
   * @param {Function} [options.onOrderPlaced]
   * @param {Function} [options.onFormReset]
   */
  constructor(options = {}) {
    this.products = options.products || {};
    this.employees = options.employees || [
      "Admin User",
      "Kasun Perera",
      "Nuwan Silva",
      "Dilshan Fernando",
      "Chamara Bandara"
    ];
    this.currentUser = options.currentUser || "Admin User";
    this.dataLoader = options.dataLoader || null;
    this.pricingCalculator = options.pricingCalculator || null;
    this.getOrders = options.getOrders || (() => []);
    this.getPayments = options.getPayments || (() => []);
    this.getSelectedCustomer = options.getSelectedCustomer || (() => null);
    this.clearSelectedCustomer = options.clearSelectedCustomer || (() => {});
    this.openModal = options.openModal || (() => {});
    this.closeModal = options.closeModal || (() => {});
    this.showToast = options.showToast || (() => {});
    this.onOrderPlaced = options.onOrderPlaced || (() => {});
    this.onFormReset = options.onFormReset || (() => {});

    this.setupDatePickers();
    this.bindEvents();
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

  /* ==========================================================================
     Date Pickers & Time Helpers
     ========================================================================== */
  setupDatePickers() {
    const todayStr = new Date().toISOString().split("T")[0];
    const orderDateInput = document.getElementById("poOrderDate");
    const requiredDateInput = document.getElementById("poRequiredDate");

    if (orderDateInput) {
      orderDateInput.value = todayStr;
    }

    if (requiredDateInput) {
      const deadline = new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0];
      requiredDateInput.value = deadline;
      requiredDateInput.min = todayStr;
    }

    const todayDateElem = document.getElementById("todayDate");
    if (todayDateElem) {
      todayDateElem.textContent = new Intl.DateTimeFormat("en-LK", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(new Date());
    }
  }

  /* ==========================================================================
     Event Binding
     ========================================================================== */
  bindEvents() {
    // 1. Real-time form recalculation on inputs
    const calcFields = [
      "poProductType",
      "poWidth",
      "poHeight",
      "poUnit",
      "poQty",
      "poUnitPrice",
      "poDesignStatus",
      "poPaidAmount"
    ];

    calcFields.forEach(id => {
      const elem = document.getElementById(id);
      if (elem) {
        elem.addEventListener("input", () => this.updateCalculation());
        elem.addEventListener("change", () => this.updateCalculation());
      }
    });

    // 2. Product select change -> synchronizes default unit & unit price
    const prodSelect = document.getElementById("poProductType");
    if (prodSelect) {
      prodSelect.addEventListener("change", () => {
        const prod = this.products[prodSelect.value];
        if (prod) {
          const unitElem = document.getElementById("poUnit");
          const priceElem = document.getElementById("poUnitPrice");
          if (unitElem) unitElem.value = prod.defaultUnit;
          if (priceElem) priceElem.value = prod.unitPrice.toFixed(2);
          this.updateCalculation();
        }
      });
    }

    // 3. Reset Form button
    const resetBtn = document.getElementById("resetOrderFormBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetForm());
    }

    // 4. Place order form submit -> triggers confirmation modal
    const form = document.getElementById("placeOrderForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.openConfirmation();
      });
    }

    // 5. Confirm button inside confirmation modal
    const confirmBtn = document.getElementById("confirmPlaceOrderBtn");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => this.confirmAndPlaceOrder());
    }
  }

  /* ==========================================================================
     Pricing Calculation
     ========================================================================== */
  updateCalculation() {
    if (this.pricingCalculator) {
      return this.pricingCalculator.calculateMainForm();
    }
    return null;
  }

  /* ==========================================================================
     Form Reset
     ========================================================================== */
  resetForm() {
    this.clearSelectedCustomer();

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setVal("poWidth", "10");
    setVal("poHeight", "4");
    setVal("poQty", "1");
    setVal("poProductType", "flex_normal");
    setVal("poUnit", "feet");
    setVal("poUnitPrice", "95.00");
    setVal("poDesignStatus", "Customer Provides Design");
    setVal("poDeliveryMethod", "Pickup");
    setVal("poPaidAmount", "0.00");
    setVal("poNotes", "");

    this.setupDatePickers();
    this.updateCalculation();
    this.onFormReset();
  }

  /* ==========================================================================
     Validation
     ========================================================================== */
  validate() {
    const selectedCustomer = this.getSelectedCustomer();
    if (!selectedCustomer) {
      return {
        isValid: false,
        error: "Please search and select a customer first",
        targetId: "customerSearchInput"
      };
    }

    const width = parseFloat(document.getElementById("poWidth")?.value);
    const height = parseFloat(document.getElementById("poHeight")?.value);
    const qty = parseInt(document.getElementById("poQty")?.value, 10);
    const unitPrice = parseFloat(document.getElementById("poUnitPrice")?.value);
    const requiredDate = document.getElementById("poRequiredDate")?.value;

    if (isNaN(width) || width <= 0 || isNaN(height) || height <= 0) {
      return {
        isValid: false,
        error: "Width and Height must be greater than zero",
        targetId: "poWidth"
      };
    }

    if (isNaN(qty) || qty <= 0) {
      return {
        isValid: false,
        error: "Quantity must be at least 1",
        targetId: "poQty"
      };
    }

    if (isNaN(unitPrice) || unitPrice < 0) {
      return {
        isValid: false,
        error: "Unit price cannot be negative",
        targetId: "poUnitPrice"
      };
    }

    if (!requiredDate) {
      return {
        isValid: false,
        error: "Please select a required deadline date",
        targetId: "poRequiredDate"
      };
    }

    return {
      isValid: true,
      selectedCustomer,
      width,
      height,
      qty,
      unitPrice,
      requiredDate
    };
  }

  /* ==========================================================================
     Extract Clean Form Data
     ========================================================================== */
  getFormData() {
    const selectedCustomer = this.getSelectedCustomer();
    const width = parseFloat(document.getElementById("poWidth")?.value) || 0;
    const height = parseFloat(document.getElementById("poHeight")?.value) || 0;
    const unit = document.getElementById("poUnit")?.value || "feet";
    const qty = parseInt(document.getElementById("poQty")?.value, 10) || 1;
    const unitPrice = parseFloat(document.getElementById("poUnitPrice")?.value) || 0;
    const prodKey = document.getElementById("poProductType")?.value || "flex_normal";
    const prod = this.products[prodKey] || { name: "Flex Banner" };
    const designStatus = document.getElementById("poDesignStatus")?.value || "Customer Provides Design";
    const deliveryMethod = document.getElementById("poDeliveryMethod")?.value || "Pickup";
    const requiredDate = document.getElementById("poRequiredDate")?.value || "";
    const notes = document.getElementById("poNotes")?.value?.trim() || "";

    const calc = this.updateCalculation() || {
      areaSqFt: 0,
      totalAmount: 0,
      paidAmount: 0,
      balanceAmount: 0,
      paymentStatus: "Unpaid"
    };

    return {
      selectedCustomer,
      prodKey,
      prod,
      width,
      height,
      unit,
      qty,
      unitPrice,
      designStatus,
      deliveryMethod,
      requiredDate,
      notes,
      calc
    };
  }

  /* ==========================================================================
     Step 1: Open Order Confirmation Modal
     ========================================================================== */
  openConfirmation() {
    const validation = this.validate();
    if (!validation.isValid) {
      this.showToast(validation.error, "error");
      if (validation.targetId) {
        const el = document.getElementById(validation.targetId);
        if (el) el.focus();
      }
      return;
    }

    const data = this.getFormData();
    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setTxt("confCustName", data.selectedCustomer?.name || "-");
    setTxt("confCustMobile", data.selectedCustomer?.mobile || "-");
    setTxt("confProduct", data.prod.name || "Printing Job");
    setTxt("confSpecs", `${data.width} × ${data.height} ${data.unit} (Qty: ${data.qty})`);
    setTxt("confTotal", `Rs. ${data.calc.totalAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("confPaid", `Rs. ${data.calc.paidAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("confBalance", `Rs. ${data.calc.balanceAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("confStatus", data.calc.paymentStatus);
    setTxt("confDeadline", data.requiredDate);

    this.openModal("orderConfirmationModal");
  }

  /* ==========================================================================
     Step 2: Confirm and Place Order Execution
     ========================================================================== */
  confirmAndPlaceOrder() {
    const validation = this.validate();
    if (!validation.isValid) {
      this.showToast(validation.error, "error");
      this.closeModal("orderConfirmationModal");
      return;
    }

    const orders = this.getOrders();
    const payments = this.getPayments();
    const data = this.getFormData();
    const todayStr = new Date().toISOString().split("T")[0];

    const nextOrderNum = 1000 + orders.length + 1;
    const orderId = `ORD-2026-${nextOrderNum}`;

    // Build new PrintingOrder instance using PrintingOrderBuilder
    const newOrder = new PrintingOrderBuilder()
      .setId(orderId)
      .setOrderDate(todayStr)
      .setCustomerId(data.selectedCustomer.id)
      .setCustomerName(data.selectedCustomer.name)
      .setCustomerMobile(data.selectedCustomer.mobile)
      .setProductKey(data.prodKey)
      .setProductName(data.prod.name)
      .setWidth(data.width)
      .setHeight(data.height)
      .setUnit(data.unit)
      .setQuantity(data.qty)
      .setAreaSqFt(data.calc.areaSqFt)
      .setUnitPrice(data.unitPrice)
      .setDesignStatus(data.designStatus)
      .setDeliveryMethod(data.deliveryMethod)
      .setRequiredDate(data.requiredDate)
      .setTotalAmount(data.calc.totalAmount)
      .setPaidAmount(data.calc.paidAmount)
      .setBalanceAmount(data.calc.balanceAmount)
      .setPaymentStatus(data.calc.paymentStatus)
      .setOrderStatus("Pending")
      .setAssignedEmployee(this.employees[1] || "Kasun Perera")
      .setNotes(data.notes)
      .build();

    // 1. Add to orders array and persist
    orders.unshift(newOrder);
    if (this.dataLoader) {
      this.dataLoader.saveOrders(orders);
    }

    // 2. Initial installment creation if advance paid
    if (data.calc.paidAmount > 0) {
      const paymentId = `PAY-2026-${String(payments.length + 1).padStart(4, "0")}`;
      const initPayment = {
        paymentId,
        orderId,
        installmentNo: 1,
        date: todayStr,
        amount: data.calc.paidAmount,
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

    // 3. Log audit trail
    if (this.dataLoader) {
      this.dataLoader.logAudit(
        "CREATE_ORDER",
        orderId,
        `Created order with Total: Rs. ${data.calc.totalAmount}, Paid: Rs. ${data.calc.paidAmount}`
      );
    }

    // 4. Close confirmation modal & notify user
    this.closeModal("orderConfirmationModal");
    this.showToast(`Order ${orderId} created successfully!`, "success");

    // 5. Reset form and fire callback to refresh UI tables & KPIs
    this.resetForm();
    this.onOrderPlaced(newOrder, orders, payments);
  }
}

if (typeof window !== "undefined") {
  window.OrderPlacementProcess = OrderPlacementProcess;
}

export default OrderPlacementProcess;

