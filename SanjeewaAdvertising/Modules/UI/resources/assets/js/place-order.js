/**
 * Place Order & Multiple Payment Installments Module
 * Sanjeewa Advertising Printing Shop Management System
 */

"use strict";

class PlaceOrderManager {
  constructor() {
    this.storageKeys = {
      orders: "sa_advertising_orders",
      payments: "sa_advertising_payments",
      customers: "sa_advertising_customers",
      audit: "sa_advertising_audit_log"
    };

    // Master Product Catalog with Pricing Rules
    this.products = {
      flex_normal: { name: "Flex Banner (Normal 280gsm)", category: "area", unitPrice: 95.00, defaultUnit: "feet" },
      flex_star: { name: "Flex Banner (Star / Heavy 380gsm)", category: "area", unitPrice: 135.00, defaultUnit: "feet" },
      sticker_glossy: { name: "Vinyl Sticker (Glossy)", category: "area", unitPrice: 140.00, defaultUnit: "feet" },
      sticker_matte: { name: "Vinyl Sticker (Matte)", category: "area", unitPrice: 155.00, defaultUnit: "feet" },
      sticker_clear: { name: "Clear / Transparent Sticker", category: "area", unitPrice: 175.00, defaultUnit: "feet" },
      oneway_vision: { name: "One-Way Vision Film", category: "area", unitPrice: 210.00, defaultUnit: "feet" },
      business_card_std: { name: "Business Cards (Standard 350gsm)", category: "unit", unitPrice: 12.00, defaultUnit: "mm" },
      business_card_lux: { name: "Business Cards (Matte + Spot UV)", category: "unit", unitPrice: 22.00, defaultUnit: "mm" },
      flyer_a5: { name: "Flyers / Leaflets (A5 Full Color)", category: "unit", unitPrice: 15.00, defaultUnit: "mm" },
      flyer_a4: { name: "Flyers / Leaflets (A4 Full Color)", category: "unit", unitPrice: 25.00, defaultUnit: "mm" },
      rollup_banner: { name: "Rollup Banner Display (Complete Set)", category: "unit", unitPrice: 6500.00, defaultUnit: "feet" },
      foam_board: { name: "Foam Board Signage (5mm)", category: "area", unitPrice: 280.00, defaultUnit: "feet" },
      acrylic_sign: { name: "Acrylic Lettering Sign", category: "area", unitPrice: 650.00, defaultUnit: "inches" },
      backlit_film: { name: "Lightbox Backlit Film", category: "area", unitPrice: 240.00, defaultUnit: "feet" }
    };

    // Employees for assignment & cashiering
    this.employees = ["Admin User", "Kasun Perera", "Nuwan Silva", "Dilshan Fernando", "Chamara Bandara"];
    this.currentUser = "Admin User";

    // State
    this.customers = [];
    this.orders = [];
    this.payments = [];
    this.selectedCustomer = null;

    // Table pagination & filtering
    this.currentPage = 1;
    this.pageSize = 8;
    this.searchTerm = "";
    this.statusFilter = "ALL";
    this.paymentFilter = "ALL";

    // Active order/payment contexts
    this.currentContextOrder = null;

    this.init();
  }

  init() {
    this.loadData();
    this.setupDatePickers();
    this.bindEvents();
    this.updateCalculation();
    this.renderOrdersTable();
    this.updateKPIs();
  }

  /* ==========================================================================
     Data Initialization & Storage
     ========================================================================== */
  loadData() {
    const storedCustomers = localStorage.getItem(this.storageKeys.customers);
    const storedOrders = localStorage.getItem(this.storageKeys.orders);
    const storedPayments = localStorage.getItem(this.storageKeys.payments);

    if (storedCustomers) {
      this.customers = JSON.parse(storedCustomers);
    } else {
      this.customers = [
        { id: "CUST-001", name: "Kasun Jayasundara", mobile: "0771234567", address: "Colombo 03", type: "Regular" },
        { id: "CUST-002", name: "Dilhani Senaratne", mobile: "0719876543", address: "Kandy", type: "VIP" },
        { id: "CUST-003", name: "Sajith Warnakula", mobile: "0755554321", address: "Gampaha", type: "Corporate" },
        { id: "CUST-004", name: "Nadeeka Perera", mobile: "0723456789", address: "Negombo", type: "Regular" },
        { id: "CUST-005", name: "Nuwan Weerasinghe", mobile: "0781122334", address: "Kurunegala", type: "Corporate" }
      ];
      this.saveCustomers();
    }

    if (storedOrders && storedPayments) {
      this.orders = JSON.parse(storedOrders);
      this.payments = JSON.parse(storedPayments);
    } else {
      this.seedInitialOrders();
    }
  }

  seedInitialOrders() {
    const today = new Date();
    const formatDate = (d) => d.toISOString().split("T")[0];

    this.orders = [
      {
        id: "ORD-2026-1048",
        orderDate: formatDate(new Date(today.getTime() - 86400000 * 3)),
        customerId: "CUST-001",
        customerName: "Kasun Jayasundara",
        customerMobile: "0771234567",
        productKey: "flex_normal",
        productName: "Flex Banner (Normal 280gsm)",
        width: 10,
        height: 4,
        unit: "feet",
        quantity: 2,
        areaSqFt: 80,
        unitPrice: 95.00,
        designStatus: "Customer Provides Design",
        deliveryMethod: "Pickup",
        requiredDate: formatDate(new Date(today.getTime() + 86400000 * 2)),
        totalAmount: 7600.00,
        paidAmount: 7600.00,
        balanceAmount: 0.00,
        paymentStatus: "Paid",
        orderStatus: "Completed",
        assignedEmployee: "Kasun Perera",
        notes: "Grommets on all 4 corners and reinforcement borders."
      },
      {
        id: "ORD-2026-1049",
        orderDate: formatDate(new Date(today.getTime() - 86400000 * 2)),
        customerId: "CUST-002",
        customerName: "Dilhani Senaratne",
        customerMobile: "0719876543",
        productKey: "sticker_glossy",
        productName: "Vinyl Sticker (Glossy)",
        width: 6,
        height: 3,
        unit: "feet",
        quantity: 3,
        areaSqFt: 54,
        unitPrice: 140.00,
        designStatus: "Shop Creates Design",
        deliveryMethod: "Delivery",
        requiredDate: formatDate(new Date(today.getTime() + 86400000 * 1)),
        totalAmount: 8060.00, // includes 500 design fee
        paidAmount: 5000.00,
        balanceAmount: 3060.00,
        paymentStatus: "Partially Paid",
        orderStatus: "In Progress",
        assignedEmployee: "Nuwan Silva",
        notes: "Die-cut individual stickers for retail packaging."
      },
      {
        id: "ORD-2026-1050",
        orderDate: formatDate(today),
        customerId: "CUST-003",
        customerName: "Sajith Warnakula",
        customerMobile: "0755554321",
        productKey: "business_card_lux",
        productName: "Business Cards (Matte + Spot UV)",
        width: 90,
        height: 54,
        unit: "mm",
        quantity: 500,
        areaSqFt: 0,
        unitPrice: 22.00,
        designStatus: "Customer Provides Design",
        deliveryMethod: "Pickup",
        requiredDate: formatDate(new Date(today.getTime() + 86400000 * 4)),
        totalAmount: 11000.00,
        paidAmount: 0.00,
        balanceAmount: 11000.00,
        paymentStatus: "Unpaid",
        orderStatus: "Pending",
        assignedEmployee: "Dilshan Fernando",
        notes: "Double sided luxury print with spot UV logo."
      },
      {
        id: "ORD-2026-1051",
        orderDate: formatDate(today),
        customerId: "CUST-005",
        customerName: "Nuwan Weerasinghe",
        customerMobile: "0781122334",
        productKey: "rollup_banner",
        productName: "Rollup Banner Display (Complete Set)",
        width: 2.5,
        height: 6,
        unit: "feet",
        quantity: 2,
        areaSqFt: 30,
        unitPrice: 6500.00,
        designStatus: "Customer Provides Design",
        deliveryMethod: "Delivery",
        requiredDate: formatDate(new Date(today.getTime() + 86400000 * 3)),
        totalAmount: 13000.00,
        paidAmount: 6500.00,
        balanceAmount: 6500.00,
        paymentStatus: "Partially Paid",
        orderStatus: "In Progress",
        assignedEmployee: "Kasun Perera",
        notes: "Aluminium heavy-duty pull up base."
      }
    ];

    this.payments = [
      {
        paymentId: "PAY-2026-0001",
        orderId: "ORD-2026-1048",
        installmentNo: 1,
        date: formatDate(new Date(today.getTime() - 86400000 * 3)),
        amount: 4000.00,
        method: "Cash",
        ref: "RCPT-4091",
        receivedBy: "Admin User",
        status: "Successful",
        note: "Initial advance on order booking"
      },
      {
        paymentId: "PAY-2026-0002",
        orderId: "ORD-2026-1048",
        installmentNo: 2,
        date: formatDate(new Date(today.getTime() - 86400000 * 1)),
        amount: 3600.00,
        method: "Card",
        ref: "TXN-88402",
        receivedBy: "Admin User",
        status: "Successful",
        note: "Final payment settlement on collection"
      },
      {
        paymentId: "PAY-2026-0003",
        orderId: "ORD-2026-1049",
        installmentNo: 1,
        date: formatDate(new Date(today.getTime() - 86400000 * 2)),
        amount: 5000.00,
        method: "Bank Transfer",
        ref: "COM-SLIP-771",
        receivedBy: "Admin User",
        status: "Successful",
        note: "Commercial Bank deposit"
      },
      {
        paymentId: "PAY-2026-0004",
        orderId: "ORD-2026-1051",
        installmentNo: 1,
        date: formatDate(today),
        amount: 6500.00,
        method: "Cash",
        ref: "CSH-104",
        receivedBy: "Admin User",
        status: "Successful",
        note: "50% advance deposit"
      }
    ];

    this.saveOrders();
    this.savePayments();
  }

  saveOrders() {
    localStorage.setItem(this.storageKeys.orders, JSON.stringify(this.orders));
  }

  savePayments() {
    localStorage.setItem(this.storageKeys.payments, JSON.stringify(this.payments));
  }

  saveCustomers() {
    localStorage.setItem(this.storageKeys.customers, JSON.stringify(this.customers));
  }

  logAudit(action, orderId, details) {
    const audit = JSON.parse(localStorage.getItem(this.storageKeys.audit) || "[]");
    audit.unshift({
      timestamp: new Date().toISOString(),
      user: this.currentUser,
      action,
      orderId,
      details
    });
    localStorage.setItem(this.storageKeys.audit, JSON.stringify(audit.slice(0, 500)));
  }



  setupDatePickers() {
    const todayStr = new Date().toISOString().split("T")[0];
    const orderDateInput = document.getElementById("poOrderDate");
    const requiredDateInput = document.getElementById("poRequiredDate");

    if (orderDateInput) {
      orderDateInput.value = todayStr;
    }
    if (requiredDateInput) {
      // Default to 2 days from now
      const deadline = new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0];
      requiredDateInput.value = deadline;
      requiredDateInput.min = todayStr;
    }

    // Set today date label in topbar
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
    // Form input changes -> auto-recalculate
    const calcFields = ["poProductType", "poWidth", "poHeight", "poUnit", "poQty", "poUnitPrice", "poDesignStatus", "poPaidAmount"];
    calcFields.forEach(id => {
      const elem = document.getElementById(id);
      if (elem) {
        elem.addEventListener("input", () => this.updateCalculation());
        elem.addEventListener("change", () => this.updateCalculation());
      }
    });

    // Product select change -> set default unit & unit price
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

    // Customer Search Autocomplete
    const custSearchInput = document.getElementById("customerSearchInput");
    const custDropdown = document.getElementById("customerDropdown");
    if (custSearchInput && custDropdown) {
      custSearchInput.addEventListener("input", (e) => this.handleCustomerSearch(e.target.value));
      custSearchInput.addEventListener("focus", () => this.handleCustomerSearch(custSearchInput.value));
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".customer-search-wrap")) {
          custDropdown.classList.remove("open");
        }
      });
    }

    // Clear selected customer button
    const clearCustBtn = document.getElementById("clearCustomerBtn");
    if (clearCustBtn) {
      clearCustBtn.addEventListener("click", () => this.clearSelectedCustomer());
    }

    // New Customer Quick Modal triggers
    const openAddCustBtn = document.getElementById("openAddCustBtn");
    if (openAddCustBtn) {
      openAddCustBtn.addEventListener("click", () => this.openModal("addCustomerModal"));
    }
    const saveNewCustBtn = document.getElementById("saveNewCustomerBtn");
    if (saveNewCustBtn) {
      saveNewCustBtn.addEventListener("click", () => this.handleSaveNewCustomer());
    }

    // Place Order Form Submit
    const placeOrderForm = document.getElementById("placeOrderForm");
    if (placeOrderForm) {
      placeOrderForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.openOrderConfirmation();
      });
    }

    // Reset Form button
    const resetBtn = document.getElementById("resetOrderFormBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetForm());
    }

    // Confirm Order button in modal
    const confirmOrderBtn = document.getElementById("confirmPlaceOrderBtn");
    if (confirmOrderBtn) {
      confirmOrderBtn.addEventListener("click", () => this.saveNewOrder());
    }

    // Table Search & Filters
    const orderSearch = document.getElementById("orderSearchInput");
    if (orderSearch) {
      orderSearch.addEventListener("input", (e) => {
        this.searchTerm = e.target.value.toLowerCase().trim();
        this.currentPage = 1;
        this.renderOrdersTable();
      });
    }

    const statusFilter = document.getElementById("orderStatusFilter");
    if (statusFilter) {
      statusFilter.addEventListener("change", (e) => {
        this.statusFilter = e.target.value;
        this.currentPage = 1;
        this.renderOrdersTable();
      });
    }

    const paymentFilter = document.getElementById("orderPaymentFilter");
    if (paymentFilter) {
      paymentFilter.addEventListener("change", (e) => {
        this.paymentFilter = e.target.value;
        this.currentPage = 1;
        this.renderOrdersTable();
      });
    }

    // Modal Close buttons
    document.querySelectorAll("[data-close-modal]").forEach(btn => {
      btn.addEventListener("click", () => {
        const modalId = btn.getAttribute("data-close-modal");
        this.closeModal(modalId);
      });
    });

    // Close modal on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".po-modal-overlay.open").forEach(modal => {
          modal.classList.remove("open");
        });
      }
    });

    // Save Edit Order Modal
    const saveEditOrderBtn = document.getElementById("saveEditOrderBtn");
    if (saveEditOrderBtn) {
      saveEditOrderBtn.addEventListener("click", () => this.saveOrderEdit());
    }

    // Submit Add Payment Modal
    const submitPaymentBtn = document.getElementById("submitAddPaymentBtn");
    if (submitPaymentBtn) {
      submitPaymentBtn.addEventListener("click", () => this.saveNewPayment());
    }
  }

  /* ==========================================================================
     Customer Autocomplete & Quick Registration
     ========================================================================== */
  handleCustomerSearch(query) {
    const q = (query || "").trim().toLowerCase();
    const dropdown = document.getElementById("customerDropdown");
    if (!dropdown) return;

    dropdown.innerHTML = "";
    const filtered = this.customers.filter(c =>
      c.mobile.includes(q) || c.name.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      dropdown.innerHTML = `
        <div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 11.5px;">
          No customer found for "${query}".<br>
          <button type="button" class="po-btn po-btn-secondary" style="height: 30px; font-size: 11px; margin-top: 8px;" onclick="window.placeOrderApp.openModal('addCustomerModal')">
            <i class="fa-solid fa-user-plus"></i> Add New Customer
          </button>
        </div>
      `;
    } else {
      filtered.forEach(cust => {
        const item = document.createElement("div");
        item.className = "customer-dropdown-item";
        item.innerHTML = `
          <div class="cust-item-info">
            <strong>${cust.name}</strong>
            <span><i class="fa-solid fa-phone"></i> ${cust.mobile} &bull; ${cust.address || "Sri Lanka"}</span>
          </div>
          <span class="cust-item-badge">${cust.type || "Regular"}</span>
        `;
        item.addEventListener("click", () => this.selectCustomer(cust));
        dropdown.appendChild(item);
      });
    }

    dropdown.classList.add("open");
  }

  selectCustomer(cust) {
    this.selectedCustomer = cust;
    const searchWrap = document.getElementById("customerSearchGroup");
    const selectedCard = document.getElementById("selectedCustomerCard");
    const nameElem = document.getElementById("selectedCustName");
    const mobileElem = document.getElementById("selectedCustMobile");
    const dropdown = document.getElementById("customerDropdown");

    if (nameElem) nameElem.textContent = cust.name;
    if (mobileElem) mobileElem.textContent = `${cust.mobile} (${cust.address || "Sri Lanka"})`;

    if (searchWrap) searchWrap.style.display = "none";
    if (selectedCard) selectedCard.style.display = "flex";
    if (dropdown) dropdown.classList.remove("open");
  }

  clearSelectedCustomer() {
    this.selectedCustomer = null;
    const searchWrap = document.getElementById("customerSearchGroup");
    const selectedCard = document.getElementById("selectedCustomerCard");
    const searchInput = document.getElementById("customerSearchInput");

    if (searchWrap) searchWrap.style.display = "flex";
    if (selectedCard) selectedCard.style.display = "none";
    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }
  }

  handleSaveNewCustomer() {
    const nameInput = document.getElementById("newCustName");
    const mobileInput = document.getElementById("newCustMobile");
    const addressInput = document.getElementById("newCustAddress");
    const typeSelect = document.getElementById("newCustType");

    const name = nameInput.value.trim();
    const mobile = mobileInput.value.trim();
    const address = addressInput.value.trim() || "Sri Lanka";
    const type = typeSelect.value;

    if (!name || !mobile) {
      this.showToast("Please enter customer name and mobile number", "error");
      return;
    }

    // Check duplicate mobile
    const existing = this.customers.find(c => c.mobile === mobile);
    if (existing) {
      this.showToast(`Customer with mobile ${mobile} already exists (${existing.name})`, "warning");
      this.selectCustomer(existing);
      this.closeModal("addCustomerModal");
      return;
    }

    const newCust = {
      id: `CUST-${String(this.customers.length + 1).padStart(3, "0")}`,
      name,
      mobile,
      address,
      type
    };

    this.customers.unshift(newCust);
    this.saveCustomers();
    this.selectCustomer(newCust);
    this.closeModal("addCustomerModal");
    this.showToast(`Customer "${name}" added successfully!`, "success");

    // Clear form
    nameInput.value = "";
    mobileInput.value = "";
    addressInput.value = "";
  }

  /* ==========================================================================
     Real-Time Pricing & Area Calculations
     ========================================================================== */
  calculateAreaInSqFt(width, height, unit) {
    if (width <= 0 || height <= 0) return 0;

    switch (unit) {
      case "feet":
        return width * height;
      case "inches":
        return (width * height) / 144;
      case "cm":
        return (width * height) / 929.0304;
      case "mm":
        return (width * height) / 92903.04;
      default:
        return width * height;
    }
  }

  updateCalculation() {
    const prodKey = document.getElementById("poProductType")?.value || "flex_normal";
    const width = parseFloat(document.getElementById("poWidth")?.value) || 0;
    const height = parseFloat(document.getElementById("poHeight")?.value) || 0;
    const unit = document.getElementById("poUnit")?.value || "feet";
    const qty = parseInt(document.getElementById("poQty")?.value, 10) || 1;
    const unitPrice = parseFloat(document.getElementById("poUnitPrice")?.value) || 0;
    const designStatus = document.getElementById("poDesignStatus")?.value || "Customer Provides Design";
    let paidAmount = parseFloat(document.getElementById("poPaidAmount")?.value) || 0;

    const prod = this.products[prodKey] || this.products.flex_normal;
    let totalAmount = 0;
    let areaSqFt = 0;

    if (prod.category === "area") {
      areaSqFt = this.calculateAreaInSqFt(width, height, unit);
      totalAmount = areaSqFt * unitPrice * qty;
    } else {
      // Unit-based (e.g. Business cards, leaflets, sets)
      totalAmount = qty * unitPrice;
    }

    // Add optional shop design fee if requested
    if (designStatus === "Shop Creates Design") {
      totalAmount += 500.00; // standard design charge
    }

    // Rounding
    totalAmount = Math.max(0, Math.round(totalAmount * 100) / 100);

    // Prevent paidAmount exceeding totalAmount
    if (paidAmount > totalAmount) {
      paidAmount = totalAmount;
      const paidInput = document.getElementById("poPaidAmount");
      if (paidInput) paidInput.value = totalAmount.toFixed(2);
    }
    if (paidAmount < 0) {
      paidAmount = 0;
      const paidInput = document.getElementById("poPaidAmount");
      if (paidInput) paidInput.value = "0.00";
    }

    const balanceAmount = Math.max(0, totalAmount - paidAmount);

    // Determine status
    let paymentStatus = "Unpaid";
    let statusClass = "unpaid";
    if (paidAmount >= totalAmount && totalAmount > 0) {
      paymentStatus = "Paid";
      statusClass = "paid";
    } else if (paidAmount > 0 && balanceAmount > 0) {
      paymentStatus = "Partially Paid";
      statusClass = "partially-paid";
    }

    // Update UI elements
    const areaValElem = document.getElementById("liveAreaVal");
    const totalElem = document.getElementById("liveTotalAmount");
    const balanceElem = document.getElementById("liveBalanceAmount");
    const statusElem = document.getElementById("livePaymentStatus");
    const designFeeElem = document.getElementById("liveDesignFeeNotice");

    if (areaValElem) {
      if (prod.category === "area") {
        areaValElem.textContent = `${areaSqFt.toFixed(2)} sq.ft (${(areaSqFt * qty).toFixed(2)} total)`;
      } else {
        areaValElem.textContent = `Unit Item (${qty} pcs)`;
      }
    }

    if (totalElem) totalElem.textContent = `Rs. ${totalAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    if (balanceElem) balanceElem.textContent = `Rs. ${balanceAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    if (statusElem) {
      statusElem.textContent = paymentStatus;
      statusElem.className = `status-badge ${statusClass}`;
    }

    if (designFeeElem) {
      designFeeElem.style.display = (designStatus === "Shop Creates Design") ? "block" : "none";
    }

    return { totalAmount, paidAmount, balanceAmount, paymentStatus, areaSqFt, qty };
  }

  /* ==========================================================================
     Place Order Workflow & Validation
     ========================================================================== */
  openOrderConfirmation() {
    if (!this.selectedCustomer) {
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

    if (width <= 0 || height <= 0) {
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

    const calc = this.updateCalculation();
    const prodKey = document.getElementById("poProductType").value;
    const prod = this.products[prodKey] || this.products.flex_normal;

    // Populate confirmation modal fields
    document.getElementById("confCustName").textContent = this.selectedCustomer.name;
    document.getElementById("confCustMobile").textContent = this.selectedCustomer.mobile;
    document.getElementById("confProduct").textContent = prod.name;
    document.getElementById("confSpecs").textContent = `${width} × ${height} ${document.getElementById("poUnit").value} (Qty: ${qty})`;
    document.getElementById("confTotal").textContent = `Rs. ${calc.totalAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    document.getElementById("confPaid").textContent = `Rs. ${calc.paidAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    document.getElementById("confBalance").textContent = `Rs. ${calc.balanceAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    document.getElementById("confStatus").textContent = calc.paymentStatus;
    document.getElementById("confDeadline").textContent = requiredDate;

    this.openModal("orderConfirmationModal");
  }

  saveNewOrder() {
    const calc = this.updateCalculation();
    const prodKey = document.getElementById("poProductType").value;
    const prod = this.products[prodKey] || this.products.flex_normal;
    const width = parseFloat(document.getElementById("poWidth").value);
    const height = parseFloat(document.getElementById("poHeight").value);
    const unit = document.getElementById("poUnit").value;
    const qty = parseInt(document.getElementById("poQty").value, 10);
    const unitPrice = parseFloat(document.getElementById("poUnitPrice").value);
    const designStatus = document.getElementById("poDesignStatus").value;
    const deliveryMethod = document.getElementById("poDeliveryMethod").value;
    const requiredDate = document.getElementById("poRequiredDate").value;
    const notes = document.getElementById("poNotes").value.trim();

    // Auto-generate unique sequential Order ID
    const nextOrderNum = 1000 + this.orders.length + 1;
    const orderId = `ORD-2026-${nextOrderNum}`;
    const todayStr = new Date().toISOString().split("T")[0];

    const newOrder = {
      id: orderId,
      orderDate: todayStr,
      customerId: this.selectedCustomer.id,
      customerName: this.selectedCustomer.name,
      customerMobile: this.selectedCustomer.mobile,
      productKey: prodKey,
      productName: prod.name,
      width,
      height,
      unit,
      quantity: qty,
      areaSqFt: calc.areaSqFt,
      unitPrice,
      designStatus,
      deliveryMethod,
      requiredDate,
      totalAmount: calc.totalAmount,
      paidAmount: calc.paidAmount,
      balanceAmount: calc.balanceAmount,
      paymentStatus: calc.paymentStatus,
      orderStatus: "Pending",
      assignedEmployee: this.employees[1], // default assign
      notes
    };

    this.orders.unshift(newOrder);
    this.saveOrders();

    // If an advance payment was paid upfront, record Installment #1
    if (calc.paidAmount > 0) {
      const paymentId = `PAY-2026-${String(this.payments.length + 1).padStart(4, "0")}`;
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
      this.payments.unshift(initPayment);
      this.savePayments();
    }

    this.logAudit("CREATE_ORDER", orderId, `Created order with Total: Rs. ${calc.totalAmount}, Paid: Rs. ${calc.paidAmount}`);

    this.closeModal("orderConfirmationModal");
    this.showToast(`Order ${orderId} created successfully!`, "success");

    this.resetForm();
    this.renderOrdersTable();
    this.updateKPIs();
  }

  resetForm() {
    this.clearSelectedCustomer();
    document.getElementById("poWidth").value = "10";
    document.getElementById("poHeight").value = "4";
    document.getElementById("poQty").value = "1";
    document.getElementById("poProductType").value = "flex_normal";
    document.getElementById("poUnit").value = "feet";
    document.getElementById("poUnitPrice").value = "95.00";
    document.getElementById("poDesignStatus").value = "Customer Provides Design";
    document.getElementById("poDeliveryMethod").value = "Pickup";
    document.getElementById("poPaidAmount").value = "0.00";
    document.getElementById("poNotes").value = "";
    this.setupDatePickers();
    this.updateCalculation();
  }

  /* ==========================================================================
     Order Management Panel & Listing
     ========================================================================== */
  recalculateOrderTotals(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    const orderPayments = this.payments.filter(p => p.orderId === orderId && p.status === "Successful");
    const totalPaid = orderPayments.reduce((acc, p) => acc + p.amount, 0);
    order.paidAmount = Math.round(totalPaid * 100) / 100;
    order.balanceAmount = Math.max(0, Math.round((order.totalAmount - order.paidAmount) * 100) / 100);

    if (order.paidAmount >= order.totalAmount && order.totalAmount > 0) {
      order.paymentStatus = "Paid";
    } else if (order.paidAmount > 0 && order.balanceAmount > 0) {
      order.paymentStatus = "Partially Paid";
    } else {
      order.paymentStatus = "Unpaid";
    }

    this.saveOrders();
  }

  getFilteredOrders() {
    return this.orders.filter(order => {
      // Search term
      const matchSearch = !this.searchTerm ||
        order.id.toLowerCase().includes(this.searchTerm) ||
        order.customerName.toLowerCase().includes(this.searchTerm) ||
        order.customerMobile.includes(this.searchTerm) ||
        order.productName.toLowerCase().includes(this.searchTerm) ||
        order.assignedEmployee.toLowerCase().includes(this.searchTerm);

      // Status filter
      const matchStatus = this.statusFilter === "ALL" || order.orderStatus === this.statusFilter;

      // Payment filter
      const matchPayment = this.paymentFilter === "ALL" || order.paymentStatus === this.paymentFilter;

      return matchSearch && matchStatus && matchPayment;
    });
  }

  renderOrdersTable() {
    const tbody = document.getElementById("ordersTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    const filtered = this.getFilteredOrders();
    const total = filtered.length;
    const totalPages = Math.ceil(total / this.pageSize) || 1;
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const start = (this.currentPage - 1) * this.pageSize;
    const pageItems = filtered.slice(start, start + this.pageSize);

    if (pageItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="13">
            <div class="po-empty-state">
              <i class="fa-solid fa-folder-open"></i>
              <p>No orders matching your criteria</p>
            </div>
          </td>
        </tr>
      `;
      this.renderPagination(0, 1);
      return;
    }

    pageItems.forEach(order => {
      // Recalculate order payment totals to guarantee accurate balance
      this.recalculateOrderTotals(order.id);

      const tr = document.createElement("tr");

      const paymentBadgeClass = order.paymentStatus.toLowerCase().replace(" ", "-");
      const orderBadgeClass = order.orderStatus.toLowerCase().replace(" ", "-");
      const balanceClass = order.balanceAmount > 0 ? "balance-outstanding" : "balance-settled";

      tr.innerHTML = `
        <td class="order-id-cell">${order.id}</td>
        <td class="customer-cell">
          <strong>${order.customerName}</strong>
          <span>${order.customerMobile}</span>
        </td>
        <td>${order.customerMobile}</td>
        <td class="product-cell">
          <strong>${order.productName}</strong>
          <span>${order.width} × ${order.height} ${order.unit}</span>
        </td>
        <td style="font-weight: 700;">${order.quantity}</td>
        <td class="currency-cell">Rs. ${order.totalAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
        <td class="currency-cell" style="color: var(--green);">Rs. ${order.paidAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
        <td class="currency-cell ${balanceClass}">Rs. ${order.balanceAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
        <td>
          <span class="status-badge ${paymentBadgeClass}">${order.paymentStatus}</span>
        </td>
        <td>${order.requiredDate}</td>
        <td>
          <span class="status-badge ${orderBadgeClass}">${order.orderStatus}</span>
        </td>
        <td>${order.assignedEmployee || "Unassigned"}</td>
        <td>
          <div class="po-action-group">
            <button class="action-btn" title="View Order" onclick="window.placeOrderApp.openViewModal('${order.id}')">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="action-btn" title="Edit Order" onclick="window.placeOrderApp.openEditModal('${order.id}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="action-btn pay-action" title="Add Payment Installment" onclick="window.placeOrderApp.openAddPaymentModal('${order.id}')">
              <i class="fa-solid fa-credit-card"></i>
            </button>
            <button class="action-btn" title="Payment History" onclick="window.placeOrderApp.openHistoryModal('${order.id}')">
              <i class="fa-solid fa-clock-rotate-left"></i>
            </button>
            <button class="action-btn print-action" title="Print Receipt" onclick="window.placeOrderApp.printLatestReceipt('${order.id}')">
              <i class="fa-solid fa-print"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    this.renderPagination(total, totalPages);
  }

  renderPagination(totalCount, totalPages) {
    const infoElem = document.getElementById("paginationInfo");
    const controlsElem = document.getElementById("paginationControls");
    if (!infoElem || !controlsElem) return;

    if (totalCount === 0) {
      infoElem.textContent = "Showing 0 orders";
      controlsElem.innerHTML = "";
      return;
    }

    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, totalCount);
    infoElem.textContent = `Showing ${start}-${end} of ${totalCount} orders`;

    controlsElem.innerHTML = "";

    // Prev Button
    const prevBtn = document.createElement("button");
    prevBtn.className = "page-btn";
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prevBtn.disabled = this.currentPage === 1;
    prevBtn.addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderOrdersTable();
      }
    });
    controlsElem.appendChild(prevBtn);

    // Page number buttons
    for (let p = 1; p <= totalPages; p++) {
      const pBtn = document.createElement("button");
      pBtn.className = `page-btn ${p === this.currentPage ? "active" : ""}`;
      pBtn.textContent = p;
      pBtn.addEventListener("click", () => {
        this.currentPage = p;
        this.renderOrdersTable();
      });
      controlsElem.appendChild(pBtn);
    }

    // Next Button
    const nextBtn = document.createElement("button");
    nextBtn.className = "page-btn";
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    nextBtn.disabled = this.currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.renderOrdersTable();
      }
    });
    controlsElem.appendChild(nextBtn);
  }

  updateKPIs() {
    const totalOrders = this.orders.length;
    const pendingOrders = this.orders.filter(o => o.orderStatus === "Pending" || o.orderStatus === "In Progress").length;
    const totalRevenue = this.orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOutstanding = this.orders.reduce((sum, o) => sum + o.balanceAmount, 0);

    const kpiTotal = document.getElementById("kpiTotalOrders");
    const kpiPending = document.getElementById("kpiPendingOrders");
    const kpiRevenue = document.getElementById("kpiTotalRevenue");
    const kpiOutstanding = document.getElementById("kpiOutstandingBalance");

    if (kpiTotal) kpiTotal.textContent = totalOrders;
    if (kpiPending) kpiPending.textContent = pendingOrders;
    if (kpiRevenue) kpiRevenue.textContent = `Rs. ${totalRevenue.toLocaleString("en-LK", { minimumFractionDigits: 0 })}`;
    if (kpiOutstanding) kpiOutstanding.textContent = `Rs. ${totalOutstanding.toLocaleString("en-LK", { minimumFractionDigits: 0 })}`;
  }

  /* ==========================================================================
     Order View / Edit Popup
     ========================================================================== */
  openViewModal(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;
    this.currentContextOrder = order;

    document.getElementById("viewModalTitle").innerHTML = `<i class="fa-solid fa-file-invoice"></i> Order Details — ${order.id}`;

    // Read-only populated fields
    document.getElementById("voId").textContent = order.id;
    document.getElementById("voDate").textContent = order.orderDate;
    document.getElementById("voCustName").textContent = order.customerName;
    document.getElementById("voCustMobile").textContent = order.customerMobile;
    document.getElementById("voProduct").textContent = order.productName;
    document.getElementById("voDimensions").textContent = `${order.width} × ${order.height} ${order.unit}`;
    document.getElementById("voQuantity").textContent = order.quantity;
    document.getElementById("voUnitPrice").textContent = `Rs. ${order.unitPrice.toFixed(2)}`;
    document.getElementById("voTotal").textContent = `Rs. ${order.totalAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    document.getElementById("voPaid").textContent = `Rs. ${order.paidAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    document.getElementById("voBalance").textContent = `Rs. ${order.balanceAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    document.getElementById("voPaymentStatus").textContent = order.paymentStatus;
    document.getElementById("voDeadline").textContent = order.requiredDate;
    document.getElementById("voOrderStatus").textContent = order.orderStatus;
    document.getElementById("voAssigned").textContent = order.assignedEmployee || "Unassigned";

    this.openModal("viewOrderModal");
  }

  openEditModal(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;
    this.currentContextOrder = order;

    // Helper functions for safe element assignment
    const setElemText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    const setElemVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val !== undefined && val !== null ? val : "";
    };

    const modalTitle = document.getElementById("editModalTitle");
    if (modalTitle) {
      modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Order — ${order.id}`;
    }

    // Summary Meta Info
    setElemText("eoId", order.id);
    setElemText("eoDate", order.orderDate);

    // Section 1: Customer Details
    setElemVal("eoCustNameInput", order.customerName || "");
    setElemVal("eoCustMobileInput", order.customerMobile || "");

    // Section 2: Product Specifications
    setElemVal("eoProductSelect", order.productKey || "flex_normal");
    setElemVal("eoWidthInput", order.width !== undefined ? order.width : 10);
    setElemVal("eoHeightInput", order.height !== undefined ? order.height : 4);
    setElemVal("eoUnitSelect", order.unit || "feet");
    setElemVal("eoQuantityInput", order.quantity || 1);
    setElemVal("eoUnitPriceInput", order.unitPrice !== undefined ? order.unitPrice : 95);

    // Section 3: Workflow, Deadline & Delivery
    setElemVal("eoDesignStatusSelect", order.designStatus || "Customer Provides Design");
    setElemVal("eoDeliverySelect", order.deliveryMethod || "Pickup");
    setElemVal("eoDeadlineInput", order.requiredDate || "");
    setElemVal("eoStatusSelect", order.orderStatus || "Pending");
    setElemVal("eoEmployeeSelect", order.assignedEmployee || (this.employees ? this.employees[0] : "Admin User"));

    // Section 5: Notes
    setElemVal("eoNotesInput", order.notes || "");

    // Bind real-time input recalculation listeners
    this.bindEditModalLiveCalc();

    // Calculate and populate real-time financial totals
    this.updateEditModalCalculation();

    this.openModal("editOrderModal");
  }

  updateEditModalCalculation() {
    if (!this.currentContextOrder) return null;

    const productKey = document.getElementById("eoProductSelect")?.value || this.currentContextOrder.productKey || "flex_normal";
    const width = parseFloat(document.getElementById("eoWidthInput")?.value) || 0;
    const height = parseFloat(document.getElementById("eoHeightInput")?.value) || 0;
    const unit = document.getElementById("eoUnitSelect")?.value || "feet";
    const qty = parseInt(document.getElementById("eoQuantityInput")?.value) || 1;
    const unitPrice = parseFloat(document.getElementById("eoUnitPriceInput")?.value) || 0;
    const designStatus = document.getElementById("eoDesignStatusSelect")?.value || "";
    const deliveryMethod = document.getElementById("eoDeliverySelect")?.value || "";

    const prodInfo = this.products[productKey] || { category: "area", unitPrice: 0, name: "Custom Print" };

    // Calculate Area in Square Feet
    let areaSqFt = 0;
    if (unit === "feet") {
      areaSqFt = width * height;
    } else if (unit === "inches") {
      areaSqFt = (width * height) / 144;
    } else if (unit === "mm") {
      areaSqFt = (width * height) / 92903.04;
    }

    // Calculate Total Order Amount
    let baseAmount = 0;
    if (prodInfo.category === "area") {
      baseAmount = areaSqFt * unitPrice * qty;
    } else {
      baseAmount = unitPrice * qty;
    }

    let extraFees = 0;
    if (designStatus === "Shop Creates Design") extraFees += 500;
    if (deliveryMethod === "Delivery") extraFees += 350;

    const totalAmount = Math.max(0, Math.round((baseAmount + extraFees) * 100) / 100);
    const paidAmount = this.currentContextOrder.paidAmount || 0;
    const balanceAmount = Math.max(0, Math.round((totalAmount - paidAmount) * 100) / 100);

    let paymentStatus = "Unpaid";
    if (balanceAmount <= 0 && totalAmount > 0) {
      paymentStatus = "Paid";
    } else if (paidAmount > 0 && balanceAmount > 0) {
      paymentStatus = "Partially Paid";
    }

    // Update real-time modal display elements
    const areaCalc = document.getElementById("eoAreaCalc");
    if (areaCalc) {
      areaCalc.textContent = prodInfo.category === "area"
        ? `Area: ${areaSqFt.toFixed(2)} sq.ft`
        : `Unit Count: ${qty} units`;
    }

    const eoTotal = document.getElementById("eoTotal");
    if (eoTotal) {
      eoTotal.textContent = `Rs. ${totalAmount.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    const eoPaid = document.getElementById("eoPaid");
    if (eoPaid) {
      eoPaid.textContent = `Rs. ${paidAmount.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    const eoBalance = document.getElementById("eoBalance");
    if (eoBalance) {
      eoBalance.textContent = `Rs. ${balanceAmount.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    const eoPaymentStatus = document.getElementById("eoPaymentStatus");
    if (eoPaymentStatus) {
      eoPaymentStatus.textContent = paymentStatus;
      eoPaymentStatus.className = `status-badge ${
        paymentStatus === "Paid" ? "status-paid" : paymentStatus === "Partially Paid" ? "status-partial" : "status-unpaid"
      }`;
    }

    return { areaSqFt, totalAmount, paidAmount, balanceAmount, paymentStatus, prodInfo };
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
        el.addEventListener("input", () => this.updateEditModalCalculation());
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
          this.updateEditModalCalculation();
        });
      }
    });
  }

  saveOrderEdit() {
    if (!this.currentContextOrder) return;

    const custName = document.getElementById("eoCustNameInput")?.value?.trim();
    const custMobile = document.getElementById("eoCustMobileInput")?.value?.trim();
    const productKey = document.getElementById("eoProductSelect")?.value;
    const width = parseFloat(document.getElementById("eoWidthInput")?.value) || 0;
    const height = parseFloat(document.getElementById("eoHeightInput")?.value) || 0;
    const unit = document.getElementById("eoUnitSelect")?.value || "feet";
    const quantity = parseInt(document.getElementById("eoQuantityInput")?.value) || 1;
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

    const calc = this.updateEditModalCalculation();
    const prodInfo = this.products[productKey] || { name: "Custom Print" };

    // Update current order with edited details
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

    this.saveOrders();
    this.logAudit("EDIT_ORDER", this.currentContextOrder.id, `Updated details, Total: Rs. ${this.currentContextOrder.totalAmount}, Status: ${orderStatus}`);

    this.closeModal("editOrderModal");
    this.showToast(`Order ${this.currentContextOrder.id} updated successfully!`, "success");
    this.renderOrdersTable();
    this.updateKPIs();
  }

  /* ==========================================================================
     Multiple Payment Installments Workflow
     ========================================================================== */
  openAddPaymentModal(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;
    this.currentContextOrder = order;

    this.recalculateOrderTotals(orderId);

    if (order.balanceAmount <= 0) {
      this.showToast(`Order ${orderId} is already fully paid!`, "warning");
      return;
    }

    // Existing installment count
    const existingPayments = this.payments.filter(p => p.orderId === orderId);
    const nextInstallmentNo = existingPayments.length + 1;
    const paymentId = `PAY-${Date.now().toString().slice(-6)}`;

    // Populate Add Payment Modal
    document.getElementById("pmPaymentId").value = paymentId;
    document.getElementById("pmOrderId").value = order.id;
    document.getElementById("pmInstallmentNo").value = `Installment #${nextInstallmentNo}`;
    document.getElementById("pmInstallmentNo").dataset.rawNo = nextInstallmentNo;
    document.getElementById("pmDate").value = new Date().toISOString().split("T")[0];
    document.getElementById("pmReceivedBy").value = this.currentUser;

    // Remaining balance
    document.getElementById("pmRemainingBalance").textContent = `Rs. ${order.balanceAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    const amtInput = document.getElementById("pmAmount");
    amtInput.value = order.balanceAmount.toFixed(2);
    amtInput.max = order.balanceAmount;

    document.getElementById("pmMethod").value = "Cash";
    document.getElementById("pmRef").value = "";
    document.getElementById("pmNote").value = "";

    this.openModal("addPaymentModal");
  }

  saveNewPayment() {
    if (!this.currentContextOrder) return;
    const order = this.currentContextOrder;

    const paymentId = document.getElementById("pmPaymentId").value;
    const installmentNo = parseInt(document.getElementById("pmInstallmentNo").dataset.rawNo, 10);
    const date = document.getElementById("pmDate").value;
    const amount = parseFloat(document.getElementById("pmAmount").value);
    const method = document.getElementById("pmMethod").value;
    const ref = document.getElementById("pmRef").value.trim() || "-";
    const note = document.getElementById("pmNote").value.trim();
    const receivedBy = document.getElementById("pmReceivedBy").value || this.currentUser;

    if (isNaN(amount) || amount <= 0) {
      this.showToast("Payment amount must be greater than zero", "error");
      return;
    }

    if (amount > order.balanceAmount + 0.01) {
      this.showToast(`Payment amount exceeds outstanding balance of Rs. ${order.balanceAmount.toFixed(2)}`, "error");
      return;
    }

    const newPayment = {
      paymentId,
      orderId: order.id,
      installmentNo,
      date,
      amount: Math.round(amount * 100) / 100,
      method,
      ref,
      receivedBy,
      status: "Successful",
      note
    };

    this.payments.unshift(newPayment);
    this.savePayments();

    this.recalculateOrderTotals(order.id);
    this.logAudit("ADD_PAYMENT", order.id, `Recorded Installment #${installmentNo}: Rs. ${amount} (${method})`);

    this.closeModal("addPaymentModal");
    this.showToast(`Installment #${installmentNo} of Rs. ${amount.toFixed(2)} recorded successfully!`, "success");

    this.renderOrdersTable();
    this.updateKPIs();

    // Auto-open Receipt modal for quick printing
    this.openReceiptModal(newPayment, order);
  }

  /* ==========================================================================
     Payment History & Reversal Workflow
     ========================================================================== */
  openHistoryModal(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;
    this.currentContextOrder = order;

    this.recalculateOrderTotals(orderId);

    document.getElementById("histModalTitle").innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i> Payment History — ${order.id}`;
    document.getElementById("histOrderInfo").textContent = `${order.customerName} (${order.customerMobile}) &bull; Total: Rs. ${order.totalAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })} &bull; Paid: Rs. ${order.paidAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })} &bull; Balance: Rs. ${order.balanceAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

    const tbody = document.getElementById("historyTableBody");
    tbody.innerHTML = "";

    const orderPayments = this.payments
      .filter(p => p.orderId === orderId)
      .sort((a, b) => a.installmentNo - b.installmentNo);

    if (orderPayments.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 18px;">No payments recorded for this order yet.</td></tr>`;
    } else {
      orderPayments.forEach(p => {
        const tr = document.createElement("tr");
        if (p.status === "Reversed") tr.className = "reversed-row";

        tr.innerHTML = `
          <td><strong>${p.paymentId}</strong></td>
          <td>#${p.installmentNo}</td>
          <td>${p.date}</td>
          <td style="font-weight: 700; color: ${p.status === 'Successful' ? 'var(--green)' : 'var(--red)'};">
            Rs. ${p.amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
          </td>
          <td>${p.method}</td>
          <td>${p.receivedBy}</td>
          <td><span class="status-badge ${p.status === 'Successful' ? 'paid' : 'unpaid'}">${p.status}</span></td>
          <td>${p.ref || "-"}</td>
          <td>
            <div class="po-action-group">
              ${p.status === 'Successful' ? `
                <button class="action-btn print-action" title="Print Receipt" onclick="window.placeOrderApp.printSpecificReceipt('${p.paymentId}')">
                  <i class="fa-solid fa-print"></i>
                </button>
                <button class="action-btn" title="Reverse Payment" style="color: var(--red);" onclick="window.placeOrderApp.reversePayment('${p.paymentId}')">
                  <i class="fa-solid fa-rotate-left"></i>
                </button>
              ` : `
                <span style="font-size: 10px; color: var(--red); font-weight: 700;">Reversed</span>
              `}
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    this.openModal("paymentHistoryModal");
  }

  reversePayment(paymentId) {
    const payment = this.payments.find(p => p.paymentId === paymentId);
    if (!payment) return;

    if (!confirm(`Are you sure you want to REVERSE payment ${paymentId} (Rs. ${payment.amount.toFixed(2)})? This will restore the outstanding balance.`)) {
      return;
    }

    payment.status = "Reversed";
    payment.reversedDate = new Date().toISOString();
    this.savePayments();

    this.recalculateOrderTotals(payment.orderId);
    this.logAudit("REVERSE_PAYMENT", payment.orderId, `Reversed payment ${paymentId} of Rs. ${payment.amount}`);

    this.showToast(`Payment ${paymentId} reversed successfully. Balance recalculated.`, "warning");

    this.renderOrdersTable();
    this.updateKPIs();
    this.openHistoryModal(payment.orderId);
  }

  /* ==========================================================================
     Printable Payment Receipts
     ========================================================================== */
  printLatestReceipt(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    const successfulPayments = this.payments.filter(p => p.orderId === orderId && p.status === "Successful");
    if (successfulPayments.length === 0) {
      this.showToast("No successful payments found to generate receipt", "warning");
      return;
    }

    const latest = successfulPayments[0]; // first because unshifted
    this.openReceiptModal(latest, order);
  }

  printSpecificReceipt(paymentId) {
    const payment = this.payments.find(p => p.paymentId === paymentId);
    if (!payment) return;
    const order = this.orders.find(o => o.id === payment.orderId);
    if (!order) return;

    this.openReceiptModal(payment, order);
  }

  openReceiptModal(payment, order) {
    // Fill receipt template
    document.getElementById("rcptPaymentId").textContent = payment.paymentId;
    document.getElementById("rcptOrderId").textContent = order.id;
    document.getElementById("rcptDate").textContent = payment.date;
    document.getElementById("rcptCustName").textContent = order.customerName;
    document.getElementById("rcptCustMobile").textContent = order.customerMobile;
    document.getElementById("rcptProduct").textContent = `${order.productName} (${order.width} × ${order.height} ${order.unit}, Qty: ${order.quantity})`;
    document.getElementById("rcptInstallment").textContent = `Installment #${payment.installmentNo}`;
    document.getElementById("rcptMethod").textContent = `${payment.method} ${payment.ref !== '-' ? '(' + payment.ref + ')' : ''}`;
    document.getElementById("rcptReceivedBy").textContent = payment.receivedBy;

    document.getElementById("rcptTotalAmount").textContent = `Rs. ${order.totalAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    document.getElementById("rcptPaidThis").textContent = `Rs. ${payment.amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    document.getElementById("rcptRemainingBalance").textContent = `Rs. ${order.balanceAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

    this.openModal("receiptModal");
  }

  triggerPrintReceipt() {
    window.print();
  }

  /* ==========================================================================
     Modal & Toast Helpers
     ========================================================================== */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("open");
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("open");
  }

  showToast(message, type = "success") {
    const container = document.getElementById("poToastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `po-toast ${type}`;

    let icon = "fa-check-circle";
    if (type === "error") icon = "fa-triangle-exclamation";
    if (type === "warning") icon = "fa-circle-exclamation";

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = "opacity 0.25s ease, transform 0.25s ease";
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => toast.remove(), 260);
    }, 3500);
  }
}

// Global initialization
document.addEventListener("DOMContentLoaded", () => {
  window.placeOrderApp = new PlaceOrderManager();
});
