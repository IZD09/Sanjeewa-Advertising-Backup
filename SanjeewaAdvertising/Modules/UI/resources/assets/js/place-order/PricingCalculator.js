/**
 * SanjeewaAdvertising - Place Order Pricing Calculator
 * Handles real-time area computations, pricing tiers, design/delivery fee adjustments,
 * and live calculation badge updates for main order form and edit modal.
 */

export class PricingCalculator {
  /**
   * @param {Object} productsCatalog
   */
  constructor(productsCatalog = {}) {
    this.products = productsCatalog;
  }

  setProducts(products) {
    this.products = products || {};
  }

  /**
   * Calculate area in Square Feet based on measurement unit.
   *
   * @param {number} width
   * @param {number} height
   * @param {string} unit ("feet" | "inches" | "cm" | "mm")
   * @returns {number}
   */
  calculateAreaInSqFt(width, height, unit) {
    if (width <= 0 || height <= 0 || isNaN(width) || isNaN(height)) {
      return 0;
    }

    const u = String(unit || "").toLowerCase().trim();

    switch (u) {
      case "feet":
      case "ft":
      case "1":
        return width * height;
      case "inches":
      case "in":
      case "2":
        return (width * height) / 144;
      case "cm":
      case "3":
        return (width * height) / 929.0304;
      case "mm":
      case "4":
        return (width * height) / 92903.04;
      case "m":
      case "meters":
      case "5":
        return (width * height) * 10.7639;
      case "pcs":
      case "pieces":
      case "6":
        return 1;
      default:
        return width * height;
    }
  }

  /**
   * Real-time calculation for main order creation form.
   *
   * @returns {{
   *   totalAmount: number,
   *   paidAmount: number,
   *   balanceAmount: number,
   *   paymentStatus: string,
   *   areaSqFt: number,
   *   qty: number,
   *   discount: number,
   *   subtotal: number
   * }}
   */
  calculateMainForm() {
    const width = parseFloat(document.getElementById("poWidth")?.value) || 0;
    const height = parseFloat(document.getElementById("poHeight")?.value) || 0;
    const unitEl = document.getElementById("poUnit");
    const unitVal = unitEl?.value || "1";
    const unitSymbol = unitEl?.selectedOptions?.[0]?.getAttribute("data-symbol") || "ft";
    const qty = parseInt(document.getElementById("poQty")?.value, 10) || 1;
    const unitPrice = parseFloat(document.getElementById("poUnitPrice")?.value) || 0;
    const discount = parseFloat(document.getElementById("poDiscount")?.value) || 0;
    const designStatus = document.getElementById("poDesignStatus")?.value || "Customer Provides Design";
    let paidAmount = parseFloat(document.getElementById("poPaidAmount")?.value) || 0;

    let areaSqFt = 0;
    let subtotal = 0;

    if (unitSymbol === "pcs" || unitVal === "6") {
      subtotal = qty * unitPrice;
    } else {
      areaSqFt = this.calculateAreaInSqFt(width, height, unitSymbol || unitVal);
      subtotal = areaSqFt * unitPrice * qty;
    }

    // Optional design fee
    let designFee = 0;
    if (designStatus === "Shop Creates Design") {
      designFee = 500.00;
    }

    // Round subtotal
    subtotal = Math.round(subtotal * 100) / 100;

    // Total Amount = max(0, subtotal + designFee - discount)
    let totalAmount = Math.max(0, Math.round((subtotal + designFee - discount) * 100) / 100);

    // Validate paid amount
    if (paidAmount < 0) {
      paidAmount = 0;
      const paidInput = document.getElementById("poPaidAmount");
      if (paidInput) paidInput.value = "0.00";
    }

    const balanceAmount = Math.max(0, Math.round((totalAmount - paidAmount) * 100) / 100);

    let paymentStatus = "Unpaid";
    let statusClass = "unpaid";
    let paymentStatusId = 1; // Pending
    if (paidAmount >= totalAmount && totalAmount > 0) {
      paymentStatus = "Paid";
      statusClass = "paid";
      paymentStatusId = 2; // Completed
    } else if (paidAmount > 0 && balanceAmount > 0) {
      paymentStatus = "Partially Paid";
      statusClass = "partially-paid";
      paymentStatusId = 3; // Partial
    }

    // Sync poPaymentStatus dropdown if present
    const payStatusSelect = document.getElementById("poPaymentStatus");
    if (payStatusSelect && !payStatusSelect.dataset.manualOverride) {
      payStatusSelect.value = String(paymentStatusId);
    }

    // Update UI elements
    const areaValElem = document.getElementById("liveAreaVal");
    const totalElem = document.getElementById("liveTotalAmount");
    const paidElem = document.getElementById("livePaidAmount");
    const balanceElem = document.getElementById("liveBalanceAmount");
    const statusElem = document.getElementById("livePaymentStatus");
    const designFeeElem = document.getElementById("liveDesignFeeNotice");

    if (areaValElem) {
      if (unitSymbol === "pcs" || unitVal === "6") {
        areaValElem.textContent = `${qty} pcs`;
      } else {
        areaValElem.textContent = `${areaSqFt.toFixed(2)} sq.ft (${(areaSqFt * qty).toFixed(2)} total)`;
      }
    }

    if (totalElem) {
      totalElem.textContent = `Rs. ${totalAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    }
    if (paidElem) {
      paidElem.textContent = `Rs. ${paidAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    }
    if (balanceElem) {
      balanceElem.textContent = `Rs. ${balanceAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    }
    if (statusElem) {
      statusElem.textContent = paymentStatus;
      statusElem.className = `status-badge ${statusClass}`;
    }

    if (designFeeElem) {
      designFeeElem.style.display = (designStatus === "Shop Creates Design") ? "block" : "none";
    }

    // Toggle payment method requirement
    const payMethodGroup = document.getElementById("poPaymentMethodGroup");
    const payMethodReq = document.getElementById("poPaymentMethodReq");
    const payMethodSelect = document.getElementById("poPaymentMethod");
    const payNotice = document.getElementById("poPaymentNotice");

    if (paidAmount > 0) {
      if (payMethodGroup) payMethodGroup.classList.add("highlight-payment-active");
      if (payMethodReq) payMethodReq.style.display = "inline";
      if (payNotice) payNotice.style.display = "flex";
      if (payMethodSelect) payMethodSelect.required = true;
    } else {
      if (payMethodGroup) payMethodGroup.classList.remove("highlight-payment-active");
      if (payMethodReq) payMethodReq.style.display = "none";
      if (payNotice) payNotice.style.display = "none";
      if (payMethodSelect) payMethodSelect.required = false;
    }

    return { totalAmount, paidAmount, balanceAmount, paymentStatus, paymentStatusId, areaSqFt, qty, discount, subtotal };
  }

  /**
   * Real-time calculation for Edit Order Modal.
   *
   * @param {Object} currentOrder
   * @returns {Object|null}
   */
  calculateEditModal(currentOrder) {
    if (!currentOrder) return null;

    const productKey = document.getElementById("eoProductSelect")?.value || currentOrder.productKey || "flex_normal";
    const width = parseFloat(document.getElementById("eoWidthInput")?.value) || 0;
    const height = parseFloat(document.getElementById("eoHeightInput")?.value) || 0;
    const unit = document.getElementById("eoUnitSelect")?.value || "feet";
    const qty = parseInt(document.getElementById("eoQuantityInput")?.value, 10) || 1;
    const unitPrice = parseFloat(document.getElementById("eoUnitPriceInput")?.value) || 0;
    const designStatus = document.getElementById("eoDesignStatusSelect")?.value || "";
    const deliveryMethod = document.getElementById("eoDeliverySelect")?.value || "";

    const prodInfo = this.products[productKey] || { category: "area", unitPrice: 0, name: "Custom Print" };

    let areaSqFt = 0;
    if (unit === "feet") {
      areaSqFt = width * height;
    } else if (unit === "inches") {
      areaSqFt = (width * height) / 144;
    } else if (unit === "cm") {
      areaSqFt = (width * height) / 929.0304;
    } else if (unit === "mm") {
      areaSqFt = (width * height) / 92903.04;
    }

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
    const paidAmount = currentOrder.paidAmount || 0;
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
}

export default PricingCalculator;
