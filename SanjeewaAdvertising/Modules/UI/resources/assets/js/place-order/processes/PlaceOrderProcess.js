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
import { OrderCreationProcess } from "../order-creation/OrderCreationProcess.js";

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

    this.isSubmitting = false;

    this.http = new RequestHandler();

    this.setupDatePickers();
    this.hydrateDropdownsFromServerScript();

    this.orderCreationProcess = new OrderCreationProcess({
      pricingCalculator: this.pricingCalculator,
      getSelectedCustomer: () => this.resolveSelectedCustomer(),
      showToast: this.showToast,
    });

    this.bindEvents();

    const typeSelect = document.getElementById("poPrintingType");
    if (typeSelect) {
      this.populateProductsForType(typeSelect.value, "flex_normal");
    }

    this.updateCalculation();
  }

  /**
   * Resolve currently selected customer from handler or hidden DOM fallback.
   *
   * @returns {Object|null}
   */
  resolveSelectedCustomer() {
    let customer = this.getSelectedCustomer();
    if (!customer || !customer.id) {
      const hiddenId = document.getElementById("selectedCustomerId")?.value;
      const custName = document.getElementById("selectedCustName")?.textContent;
      const custMobile = document.getElementById("selectedCustMobile")?.textContent;
      if (hiddenId && custName && custName !== "Customer Name") {
        customer = {
          id: parseInt(hiddenId, 10),
          name: custName,
          mobile: custMobile || "",
        };
      }
    }
    return customer && customer.id ? customer : null;
  }

  /**
   * Hydrate dropdown options from pre-rendered server script tag if available.
   */
  hydrateDropdownsFromServerScript() {
    try {
      const script = document.getElementById("serverOrderFormData");
      if (script && script.textContent.trim()) {
        const data = JSON.parse(script.textContent);
        this.populateDropdownsFromDatabase(data);
      }
    } catch (err) {
      console.warn("[PlaceOrderProcess] Failed to parse serverOrderFormData:", err);
    }
  }

  /**
   * Populate all modal dropdown select elements dynamically from database data.
   *
   * @param {Object} dbData
   */
  populateDropdownsFromDatabase(dbData = {}) {
    if (Array.isArray(dbData.printTypes) && dbData.printTypes.length > 0) {
      const typeSelect = document.getElementById("poPrintingType");
      if (typeSelect) {
        const currentVal = typeSelect.value;
        typeSelect.innerHTML = "";
        dbData.printTypes.forEach((pt, idx) => {
          const opt = document.createElement("option");
          opt.value = pt.id;
          opt.textContent = pt.name || pt.print_type;
          if (currentVal ? String(pt.id) === String(currentVal) : idx === 0) {
            opt.selected = true;
          }
          typeSelect.appendChild(opt);
        });
      }
    }

    if (Array.isArray(dbData.users) && dbData.users.length > 0) {
      const userSelect = document.getElementById("poUser");
      if (userSelect) {
        const currentVal = userSelect.value;
        userSelect.innerHTML = "";
        dbData.users.forEach((u, idx) => {
          const opt = document.createElement("option");
          opt.value = u.id;
          opt.textContent = u.name || `User #${u.id}`;
          if (currentVal ? String(u.id) === String(currentVal) : idx === 0) {
            opt.selected = true;
          }
          userSelect.appendChild(opt);
        });
      }
    }

    if (Array.isArray(dbData.units) && dbData.units.length > 0) {
      const unitSelect = document.getElementById("poUnit");
      if (unitSelect) {
        const currentVal = unitSelect.value;
        unitSelect.innerHTML = "";
        dbData.units.forEach((u, idx) => {
          const opt = document.createElement("option");
          opt.value = u.id;
          opt.setAttribute("data-symbol", u.simble || "ft");
          opt.textContent = `${u.name} (${u.simble})`;
          if (currentVal ? String(u.id) === String(currentVal) : (u.simble === "ft" || idx === 0)) {
            opt.selected = true;
          }
          unitSelect.appendChild(opt);
        });
      }
    }

    if (Array.isArray(dbData.deliveryMethods) && dbData.deliveryMethods.length > 0) {
      const deliverySelect = document.getElementById("poDeliveryMethod");
      if (deliverySelect) {
        const currentVal = deliverySelect.value;
        deliverySelect.innerHTML = "";
        dbData.deliveryMethods.forEach((dm, idx) => {
          const opt = document.createElement("option");
          opt.value = dm.id;
          opt.textContent = dm.name || dm.methord;
          if (currentVal ? String(dm.id) === String(currentVal) : idx === 0) {
            opt.selected = true;
          }
          deliverySelect.appendChild(opt);
        });
      }
    }

    if (Array.isArray(dbData.paymentTypes) && dbData.paymentTypes.length > 0) {
      const paySelect = document.getElementById("poPaymentMethod");
      if (paySelect) {
        const currentVal = paySelect.value;
        paySelect.innerHTML = "";
        dbData.paymentTypes.forEach((pm, idx) => {
          const opt = document.createElement("option");
          opt.value = pm.id;
          opt.textContent = pm.name || pm.payment_type;
          if (currentVal ? String(pm.id) === String(currentVal) : (pm.name === "Cash" || idx === 0)) {
            opt.selected = true;
          }
          paySelect.appendChild(opt);
        });
      }
    }

    if (Array.isArray(dbData.paymentStatuses) && dbData.paymentStatuses.length > 0) {
      const payStatusSelect = document.getElementById("poPaymentStatus");
      if (payStatusSelect) {
        const currentVal = payStatusSelect.value;
        payStatusSelect.innerHTML = "";
        dbData.paymentStatuses.forEach((ps, idx) => {
          const opt = document.createElement("option");
          opt.value = ps.id;
          opt.textContent = ps.name || ps.payment_status;
          if (currentVal ? String(ps.id) === String(currentVal) : (Number(ps.id) === 1 || idx === 0)) {
            opt.selected = true;
          }
          payStatusSelect.appendChild(opt);
        });
      }
    }

    this.updateCalculation();
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
    const requiredDateInput = document.getElementById("poRequiredDate");

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
    if (form && !form.dataset.boundPlaceOrderSubmit) {
      form.dataset.boundPlaceOrderSubmit = "true";
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.openConfirmation();
      });
    }

    const confirmBtn = document.getElementById("confirmPlaceOrderBtn");
    if (confirmBtn && !confirmBtn.dataset.boundConfirmClick) {
      confirmBtn.dataset.boundConfirmClick = "true";
      confirmBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await this.confirmAndPlaceOrder();
      });
    }

    const resetBtn = document.getElementById("resetOrderFormBtn");
    if (resetBtn && !resetBtn.dataset.boundResetClick) {
      resetBtn.dataset.boundResetClick = "true";
      resetBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.resetForm();
      });
    }
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

  /**
   * Recalculate area and pricing for the order form.
   *
   * @returns {Object|null}
   */
  updateCalculation() {
    if (this.orderCreationProcess) {
      return this.orderCreationProcess.recalculateAll();
    }
    if (this.pricingCalculator) {
      return this.pricingCalculator.calculateMainForm();
    }
    return null;
  }

  validate() {
    let customer = this.getSelectedCustomer();
    if (!customer || !customer.id) {
      const hiddenId = document.getElementById("selectedCustomerId")?.value;
      const custName = document.getElementById("selectedCustName")?.textContent;
      const custMobile = document.getElementById("selectedCustMobile")?.textContent;
      if (hiddenId && custName && custName !== "Customer Name") {
        customer = {
          id: parseInt(hiddenId, 10),
          name: custName,
          mobile: custMobile || "",
        };
      }
    }

    if (!customer || !customer.id) {
      return {
        isValid: false,
        error: "Please search and select a customer from the dropdown list before placing the order.",
        targetId: "customerSearchInput",
      };
    }

    const printType = document.getElementById("poPrintingType")?.value;
    if (!printType) {
      return {
        isValid: false,
        error: "Please select a valid printing type from the list.",
        targetId: "poPrintingType",
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

    const unitPriceRaw = document.getElementById("poUnitPrice")?.value;
    const unitPrice = parseFloat(unitPriceRaw);
    if (unitPriceRaw === "" || isNaN(unitPrice) || unitPrice < 0) {
      return {
        isValid: false,
        error: "Unit Price must be 0 or a valid positive amount.",
        targetId: "poUnitPrice",
      };
    }

    const paidAmount = parseFloat(document.getElementById("poPaidAmount")?.value) || 0;
    if (paidAmount < 0) {
      return {
        isValid: false,
        error: "Initial Advance Paid cannot be negative.",
        targetId: "poPaidAmount",
      };
    }
    if (paidAmount > 0) {
      const pm = document.getElementById("poPaymentMethod")?.value;
      if (!pm) {
        return {
          isValid: false,
          error: "Please select a Payment Method for the advance deposit.",
          targetId: "poPaymentMethod",
        };
      }
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
    const printingTypeEl = document.getElementById("poPrintingType");
    const printingTypeId = printingTypeEl?.value || "1";
    const printingTypeName = printingTypeEl?.selectedOptions?.[0]?.textContent || "Print Job";

    const unitEl = document.getElementById("poUnit");
    const unitId = unitEl?.value || "1";
    const unitSymbol = unitEl?.selectedOptions?.[0]?.getAttribute("data-symbol") || "ft";
    const unitName = unitEl?.selectedOptions?.[0]?.textContent || "Feet";

    const width = parseFloat(document.getElementById("poWidth")?.value) || 0;
    const height = parseFloat(document.getElementById("poHeight")?.value) || 0;
    const qty = parseInt(document.getElementById("poQty")?.value, 10) || 1;
    const unitPrice = parseFloat(document.getElementById("poUnitPrice")?.value) || 0;
    const discount = parseFloat(document.getElementById("poDiscount")?.value) || 0;
    const designStatus = document.getElementById("poDesignStatus")?.value || "Customer Provides Design";
    const deliveryMethodEl = document.getElementById("poDeliveryMethod");
    const deliveryMethodId = parseInt(deliveryMethodEl?.value, 10) || 1;
    const deliveryMethodName = deliveryMethodEl?.selectedOptions?.[0]?.textContent?.trim() || "Customer Pickup";
    const requiredDate = document.getElementById("poRequiredDate")?.value || "";
    const notes = document.getElementById("poNotes")?.value || "";

    const statusId = "1"; // Backend defaults to Pending (1)

    const paymentMethodEl = document.getElementById("poPaymentMethod");
    const paymentMethodId = paymentMethodEl?.value || "1";
    const paymentMethodName = paymentMethodEl?.selectedOptions?.[0]?.textContent || "Cash";

    const paymentStatusEl = document.getElementById("poPaymentStatus");
    const paymentStatusId = parseInt(paymentStatusEl?.value, 10) || 1;
    const paymentStatusName = paymentStatusEl?.selectedOptions?.[0]?.textContent?.trim() || "Pending";

    const userEl = document.getElementById("poUser");
    const userId = parseInt(userEl?.value, 10) || 1;
    const userName = userEl?.selectedOptions?.[0]?.textContent || "Staff";

    const calc = this.pricingCalculator
      ? this.pricingCalculator.calculateMainForm()
      : {
          areaSqFt: 0,
          totalAmount: 0,
          paidAmount: 0,
          balanceAmount: 0,
          paymentStatus: "Unpaid",
          paymentStatusId: 1,
        };

    return {
      selectedCustomer,
      printingTypeId,
      printingTypeName,
      unitId,
      unitSymbol,
      unitName,
      width,
      height,
      qty,
      unitPrice,
      discount,
      designStatus,
      deliveryMethod: deliveryMethodName,
      deliveryMethodId,
      deliveryMethodName,
      requiredDate,
      notes,
      statusId,
      paymentMethodId,
      paymentMethodName,
      paymentStatusId: calc.paymentStatusId || paymentStatusId,
      paymentStatusName: calc.paymentStatus || paymentStatusName,
      userId,
      userName,
      calc,
    };
  }

  openConfirmation() {
    const customer = this.resolveSelectedCustomer();
    const validation = this.orderCreationProcess
      ? this.orderCreationProcess.validateForReview(customer)
      : this.validate();

    if (!validation.isValid) {
      this.showToast(validation.error, "error");
      if (validation.targetId) {
        const el = document.getElementById(validation.targetId);
        if (el) el.focus();
      }
      return;
    }

    const queuedItems = this.orderCreationProcess ? this.orderCreationProcess.getQueuedItems() : [];
    const billing = this.orderCreationProcess
      ? this.orderCreationProcess.recalculateBillingSummary()
      : this.getFormData().calc;

    const paymentMethodEl = document.getElementById("poPaymentMethod");
    const paymentMethodName = paymentMethodEl?.selectedOptions?.[0]?.textContent?.trim() || "Cash";

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    const fmtOpts = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    setTxt("confCustName", customer?.name || "-");
    setTxt("confCustMobile", customer?.mobile || "-");

    if (queuedItems.length === 1) {
      const first = queuedItems[0];
      setTxt("confProduct", first.printingTypeName || "Printing Job");
      setTxt("confSpecs", `${first.getDimensionsLabel()} (Qty: ${first.qty})`);
      setTxt("confDeadline", first.requiredDate || "-");
      setTxt("confDeliveryMethod", first.deliveryMethodName || "-");
    } else {
      const typeNames = queuedItems.map((item) => item.printingTypeName).filter(Boolean);
      const totalQty = queuedItems.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
      const deadlines = [...new Set(queuedItems.map((item) => item.requiredDate).filter(Boolean))];
      const deliveries = [...new Set(queuedItems.map((item) => item.deliveryMethodName).filter(Boolean))];

      setTxt("confProduct", `${queuedItems.length} Orders (${typeNames.slice(0, 2).join(", ")}${typeNames.length > 2 ? "..." : ""})`);
      setTxt("confSpecs", `${queuedItems.length} Items • Total Qty: ${totalQty}`);
      setTxt("confDeadline", deadlines.join(", ") || "-");
      setTxt("confDeliveryMethod", deliveries.join(", ") || "-");
    }

    setTxt("confTotal", `Rs. ${billing.totalAmount.toLocaleString("en-LK", fmtOpts)}`);
    setTxt("confPaid", `Rs. ${billing.paidAmount.toLocaleString("en-LK", fmtOpts)}`);
    setTxt("confBalance", `Rs. ${billing.balanceAmount.toLocaleString("en-LK", fmtOpts)}`);
    setTxt("confStatus", billing.paymentStatus || "Unpaid");

    const pmRow = document.getElementById("confPaymentMethodRow");
    const pmVal = document.getElementById("confPaymentMethod");
    if (billing.paidAmount > 0) {
      if (pmRow) pmRow.style.display = "flex";
      if (pmVal) pmVal.textContent = paymentMethodName;
    } else {
      if (pmRow) pmRow.style.display = "none";
    }

    this.openModal("orderConfirmationModal");
  }

  /**
   * Submit queued orders to backend API database via PrintJob module.
   */
  async confirmAndPlaceOrder() {
    const confirmBtn = document.getElementById("confirmPlaceOrderBtn");
    if (this.isSubmitting || confirmBtn?.dataset.submitting === "true" || confirmBtn?.disabled) {
      return;
    }

    const customer = this.resolveSelectedCustomer();
    const validation = this.orderCreationProcess
      ? this.orderCreationProcess.validateForReview(customer)
      : this.validate();

    if (!validation.isValid) {
      this.showToast(validation.error, "error");
      this.closeModal("orderConfirmationModal");
      if (validation.targetId) {
        const el = document.getElementById(validation.targetId);
        if (el) el.focus();
      }
      return;
    }

    const queuedItems = this.orderCreationProcess
      ? this.orderCreationProcess.getQueuedItems()
      : [];

    if (queuedItems.length === 0) {
      this.showToast("Please add at least one order to the table before placing the order.", "error");
      this.closeModal("orderConfirmationModal");
      return;
    }

    this.isSubmitting = true;
    const origText = confirmBtn ? confirmBtn.innerHTML : "";

    if (confirmBtn) {
      confirmBtn.dataset.submitting = "true";
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = queuedItems.length > 1
        ? `<i class="fa-solid fa-spinner fa-spin"></i> Saving ${queuedItems.length} Orders...`
        : '<i class="fa-solid fa-spinner fa-spin"></i> Saving Order...';
    }

    try {
      const billing = this.orderCreationProcess.recalculateBillingSummary();
      const paymentMethodId = parseInt(document.getElementById("poPaymentMethod")?.value, 10) || 1;

      const payload = {
        customer_id: parseInt(customer.id, 10),
        payment_amount: billing.paidAmount,
        paid_amount: billing.paidAmount,
        payment_types_id: billing.paidAmount > 0 ? paymentMethodId : null,
        payment_statuses_id: billing.paymentStatusId || 1,
        orders: queuedItems.map((item) => ({
          users_id: parseInt(item.userId, 10) || 1,
          print_types_id: parseInt(item.printingTypeId, 10),
          wtdth: Math.round(Number(item.width) || 0),
          hight: Math.round(Number(item.height) || 0),
          unit_id: parseInt(item.unitId, 10) || 1,
          delivery_method_id: parseInt(item.deliveryMethodId, 10) || 1,
          qty: parseInt(item.qty, 10) || 1,
          unit_price: Number(item.unitPrice) || 0,
          discount: Number(item.discount) || 0,
          design_status: item.designStatus || "Customer Provides Design",
          total_amount: Number(item.totalAmount) || 0,
          delivery_date: item.requiredDate,
          deadline: item.requiredDate,
          discription: item.notes || null,
          notes: item.notes || null,
        })),
      };

      // Send multi-order batch request to PrintJob module
      const result = await this.http.post("/api/v1/print-jobs", payload);

      if (result && result.success === false) {
        throw new Error(result.message || "Failed to store print jobs in database.");
      }

      const responseData = result?.data || result;
      const createdOrders = Array.isArray(responseData?.orders)
        ? responseData.orders
        : [responseData];
      const createdCount = Number(responseData?.count) || createdOrders.length || queuedItems.length;

      // Reload data from database without full page reload
      let updatedOrders = [];
      let updatedPayments = [];

      if (this.dataLoader) {
        const fresh = await this.dataLoader.fetchPrintJobOrders();
        updatedOrders = fresh.orders;
        updatedPayments = fresh.payments;
      }

      // Close modals & notify user
      this.closeModal("orderConfirmationModal");
      this.closeModal("createOrderModal");

      if (createdCount === 1) {
        const firstId = createdOrders[0]?.id || Date.now();
        this.showToast(`Order ORD-2026-${1000 + Number(firstId)} placed successfully!`, "success");
      } else {
        this.showToast(`${createdCount} orders placed successfully for ${customer.name}!`, "success");
      }

      // Reset form and refresh UI tables & KPIs
      this.resetForm();
      this.onOrderPlaced(createdOrders[0] || responseData, updatedOrders, updatedPayments);
    } catch (err) {
      console.error("[PlaceOrderProcess] Order placement error:", err);
      const validationErrors = err?.data?.errors
        ? Object.values(err.data.errors).flat().join(" ")
        : null;
      const errMsg = validationErrors || err?.data?.message || err?.message || "Error saving orders to database. Please try again.";
      this.showToast(errMsg, "error");
    } finally {
      this.isSubmitting = false;
      if (confirmBtn) {
        delete confirmBtn.dataset.submitting;
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = origText;
      }
    }
  }

  resetForm() {
    this.clearSelectedCustomer({ focusInput: false, openDropdown: false });
    const widthEl = document.getElementById("poWidth");
    const heightEl = document.getElementById("poHeight");
    const qtyEl = document.getElementById("poQty");
    const priceEl = document.getElementById("poUnitPrice");
    const paidEl = document.getElementById("poPaidAmount");
    const discEl = document.getElementById("poDiscount");
    const notesEl = document.getElementById("poNotes");
    const custSelect = document.getElementById("poCustomerSelect");
    const typeSelect = document.getElementById("poPrintingType");
    const designSelect = document.getElementById("poDesignStatus");
    const unitSelect = document.getElementById("poUnit");
    const payMethodSelect = document.getElementById("poPaymentMethod");
    const payStatusSelect = document.getElementById("poPaymentStatus");
    const userSelect = document.getElementById("poUser");
    const deliverySelect = document.getElementById("poDeliveryMethod");

    if (widthEl) widthEl.value = "1";
    if (heightEl) heightEl.value = "1";
    if (qtyEl) qtyEl.value = "1";
    if (priceEl) priceEl.value = "0";
    if (paidEl) paidEl.value = "0.00";
    if (discEl) discEl.value = "0.00";
    if (notesEl) notesEl.value = "";
    if (custSelect) custSelect.value = "";
    if (typeSelect && typeSelect.options.length > 0) typeSelect.selectedIndex = 0;
    if (designSelect && designSelect.options.length > 0) designSelect.selectedIndex = 0;
    if (unitSelect && unitSelect.options.length > 0) unitSelect.selectedIndex = 0;
    if (payMethodSelect && payMethodSelect.options.length > 0) payMethodSelect.selectedIndex = 0;
    if (payStatusSelect && payStatusSelect.options.length > 0) payStatusSelect.selectedIndex = 0;
    if (userSelect && userSelect.options.length > 0) userSelect.selectedIndex = 0;
    if (deliverySelect && deliverySelect.options.length > 0) deliverySelect.selectedIndex = 0;

    const payMethodGroup = document.getElementById("poPaymentMethodGroup");
    const payMethodReq = document.getElementById("poPaymentMethodReq");
    const payNotice = document.getElementById("poPaymentNotice");
    if (payMethodGroup) payMethodGroup.classList.remove("highlight-payment-active");
    if (payMethodReq) payMethodReq.style.display = "none";
    if (payNotice) payNotice.style.display = "none";

    this.setupDatePickers();

    if (this.orderCreationProcess) {
      this.orderCreationProcess.resetAll();
    } else if (this.pricingCalculator) {
      this.pricingCalculator.calculateMainForm();
    }

    this.onFormReset();
  }
}

export default PlaceOrderProcess;

