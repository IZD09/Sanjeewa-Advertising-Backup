/**
 * SanjeewaAdvertising - Place Order Process
 *
 * Encapsulates the entire Place New Order workflow:
 * - Form data collection & validation
 * - Review & order confirmation modal management
 * - Sending order creation requests to the backend database via RequestHandler
 * - Recording initial advance payment in the database
 * - Seamlessly refreshing table view & KPIs via AJAX without full-page reloads
 * - Form reset & user feedback notifications
 */

import { RequestHandler } from "../../core/RequestHandler.js";
import { PrintingOrderBuilder, PrintingOrder } from "../builders/PrintingOrderBuilder.js";
import { PRINTING_TYPES, PRINTING_TYPE_PRODUCTS } from "../PlaceOrderDataLoad.js";

export class PlaceOrderProcess {
  /**
   * @param {Object} [options={}]
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
      "Chamara Bandara",
    ];
    this.currentUser = options.currentUser || "Admin User";
    this.printingTypes = options.printingTypes || PRINTING_TYPES;
    this.printingTypeProducts = options.printingTypeProducts || PRINTING_TYPE_PRODUCTS;
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

    this.http = new RequestHandler();

    this.setupDatePickers();
    this.bindEvents();

    const typeSelect = document.getElementById("poPrintingType");
    if (typeSelect) {
      this.populateProductsForType(typeSelect.value, "flex_normal");
    }
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
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date());
    }
  }

  /* ==========================================================================
     Event Listeners
     ========================================================================== */
  bindEvents() {
    const form = document.getElementById("placeOrderForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.openConfirmation();
      });
    }

    const confirmBtn = document.getElementById("confirmPlaceOrderBtn");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await this.confirmAndPlaceOrder();
      });
    }

    const resetBtn = document.getElementById("resetOrderFormBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.resetForm();
      });
    }

    const typeSelect = document.getElementById("poPrintingType");
    if (typeSelect) {
      typeSelect.addEventListener("change", () => {
        this.populateProductsForType(typeSelect.value);
        if (this.pricingCalculator) {
          this.pricingCalculator.calculateMainForm();
        }
      });
    }

    const prodSelect = document.getElementById("poProductSelect");
    if (prodSelect) {
      prodSelect.addEventListener("change", () => {
        this.syncProductDefaults(prodSelect.value);
        if (this.pricingCalculator) {
          this.pricingCalculator.calculateMainForm();
        }
      });
    }

    [
      "poWidth",
      "poHeight",
      "poUnit",
      "poQty",
      "poUnitPrice",
      "poAdvancePaid",
      "poDiscount",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => {
          if (this.pricingCalculator) {
            this.pricingCalculator.calculateMainForm();
          }
        });
      }
    });
  }

  populateProductsForType(typeKey, selectKey = null) {
    const prodSelect = document.getElementById("poProductSelect");
    if (!prodSelect) return;

    prodSelect.innerHTML = "";
    const items = this.printingTypeProducts[typeKey] || [];

    items.forEach((p, idx) => {
      const opt = document.createElement("option");
      opt.value = p.key;
      opt.textContent = p.name;
      if (selectKey ? p.key === selectKey : idx === 0) {
        opt.selected = true;
      }
      prodSelect.appendChild(opt);
    });

    const activeKey = prodSelect.value;
    if (activeKey) {
      this.syncProductDefaults(activeKey);
    }
  }

  syncProductDefaults(productKey) {
    const prod = this.products[productKey];
    if (!prod) return;

    const unitEl = document.getElementById("poUnit");
    if (unitEl && prod.defaultUnit) {
      unitEl.value = prod.defaultUnit;
    }

    const priceEl = document.getElementById("poUnitPrice");
    if (priceEl && prod.unitPrice) {
      priceEl.value = prod.unitPrice.toFixed(2);
    }
  }

  validate() {
    const customer = this.getSelectedCustomer();
    if (!customer) {
      return {
        isValid: false,
        error: "Please select or register a customer before placing the order.",
        targetId: "customerSearchInput",
      };
    }

    const prodKey = document.getElementById("poProductSelect")?.value;
    if (!prodKey) {
      return {
        isValid: false,
        error: "Please select a valid printing material or product.",
        targetId: "poProductSelect",
      };
    }

    const width = parseFloat(document.getElementById("poWidth")?.value) || 0;
    const height = parseFloat(document.getElementById("poHeight")?.value) || 0;
    if (width <= 0 || height <= 0) {
      return {
        isValid: false,
        error: "Width and Height dimensions must both be greater than zero.",
        targetId: "poWidth",
      };
    }

    const qty = parseInt(document.getElementById("poQty")?.value, 10) || 0;
    if (qty <= 0) {
      return {
        isValid: false,
        error: "Job Quantity must be at least 1 unit.",
        targetId: "poQty",
      };
    }

    const reqDate = document.getElementById("poRequiredDate")?.value;
    if (!reqDate) {
      return {
        isValid: false,
        error: "Please select a required completion deadline date.",
        targetId: "poRequiredDate",
      };
    }

    return { isValid: true };
  }

  getFormData() {
    const selectedCustomer = this.getSelectedCustomer();
    const printingType = document.getElementById("poPrintingType")?.value || "flex";
    const prodKey = document.getElementById("poProductSelect")?.value || "flex_normal";
    const prod = this.products[prodKey] || { name: "Printing Job", category: "area" };
    const width = parseFloat(document.getElementById("poWidth")?.value) || 0;
    const height = parseFloat(document.getElementById("poHeight")?.value) || 0;
    const unit = document.getElementById("poUnit")?.value || "feet";
    const qty = parseInt(document.getElementById("poQty")?.value, 10) || 1;
    const unitPrice = parseFloat(document.getElementById("poUnitPrice")?.value) || 0;
    const designStatus = document.getElementById("poDesignStatus")?.value || "Customer Provides Design";
    const deliveryMethod = document.getElementById("poDeliveryMethod")?.value || "Pickup";
    const requiredDate = document.getElementById("poRequiredDate")?.value || "";
    const notes = document.getElementById("poNotes")?.value || "";

    const calc = this.pricingCalculator
      ? this.pricingCalculator.calculateMainForm()
      : {
          areaSqFt: 0,
          totalAmount: 0,
          paidAmount: 0,
          balanceAmount: 0,
          paymentStatus: "Unpaid",
        };

    return {
      selectedCustomer,
      printingType,
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
      calc,
    };
  }

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

  /**
   * Map printing type key to database print_types_id.
   */
  getPrintTypeId(typeKey) {
    const map = {
      flex: 1,
      sticker: 2,
      commercial: 4,
      signage: 5,
    };
    return map[typeKey] || 1;
  }

  /**
   * Submit new order to backend API database.
   */
  async confirmAndPlaceOrder() {
    const validation = this.validate();
    if (!validation.isValid) {
      this.showToast(validation.error, "error");
      this.closeModal("orderConfirmationModal");
      return;
    }

    const data = this.getFormData();
    const confirmBtn = document.getElementById("confirmPlaceOrderBtn");
    const origText = confirmBtn ? confirmBtn.innerHTML : "";

    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving Order...';
    }

    try {
      // 1. Prepare backend payload for /api/v1/print-jobs
      const customerId = parseInt(data.selectedCustomer?.id, 10) || 1;
      const printTypeId = this.getPrintTypeId(data.printingType);

      const payload = {
        customer_id: customerId,
        print_types_id: printTypeId,
        qty: data.qty,
        add_date: new Date().toISOString().slice(0, 19).replace("T", " "),
        discount: parseFloat(document.getElementById("poDiscount")?.value) || 0,
        print_job_statuses_id: 1, // Pending
      };

      // 2. Send API request to create order in database
      const result = await this.http.post("/api/v1/print-jobs", payload);

      if (result && result.success === false) {
        throw new Error(result.message || "Failed to store print job in database.");
      }

      const createdJob = result?.data || result;
      const newJobId = createdJob?.id || Date.now();

      // 3. If advance payment provided, store payment installment in database
      if (data.calc.paidAmount > 0) {
        try {
          await this.http.post("/api/v1/payments", {
            print_jobs_id: newJobId,
            payment: data.calc.paidAmount,
            payment_types_id: 1, // Cash default
            pay_date: new Date().toISOString().slice(0, 19).replace("T", " "),
            payment_statuses_id: 2, // Completed
          });
        } catch (payErr) {
          console.warn("[PlaceOrderProcess] Initial payment record warning:", payErr);
        }
      }

      // 4. Reload data from database without full page reload
      let updatedOrders = [];
      let updatedPayments = [];

      if (this.dataLoader) {
        const fresh = await this.dataLoader.fetchPrintJobOrders();
        updatedOrders = fresh.orders;
        updatedPayments = fresh.payments;
      }

      // 5. Close confirmation modal & notify user
      this.closeModal("orderConfirmationModal");
      this.closeModal("createOrderModal");
      this.showToast(`Order ORD-2026-${1000 + Number(newJobId)} placed successfully!`, "success");

      // 6. Reset form and fire callback to refresh UI tables & KPIs
      this.resetForm();
      this.onOrderPlaced(createdJob, updatedOrders, updatedPayments);
    } catch (err) {
      console.error("[PlaceOrderProcess] Order placement error:", err);
      const errMsg = err?.data?.message || err?.message || "Error saving order to database. Please try again.";
      this.showToast(errMsg, "error");
    } finally {
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = origText;
      }
    }
  }

  resetForm() {
    this.clearSelectedCustomer();
    const widthEl = document.getElementById("poWidth");
    const heightEl = document.getElementById("poHeight");
    const qtyEl = document.getElementById("poQty");
    const paidEl = document.getElementById("poAdvancePaid");
    const discEl = document.getElementById("poDiscount");
    const notesEl = document.getElementById("poNotes");

    if (widthEl) widthEl.value = "10";
    if (heightEl) heightEl.value = "4";
    if (qtyEl) qtyEl.value = "1";
    if (paidEl) paidEl.value = "0";
    if (discEl) discEl.value = "0";
    if (notesEl) notesEl.value = "";

    const typeSelect = document.getElementById("poPrintingType");
    if (typeSelect) {
      typeSelect.value = "flex";
      this.populateProductsForType("flex", "flex_normal");
    }

    this.setupDatePickers();

    if (this.pricingCalculator) {
      this.pricingCalculator.calculateMainForm();
    }

    this.onFormReset();
  }
}

export default PlaceOrderProcess;

