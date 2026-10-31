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

  /**
   * Real-time calculation for main order creation form.
   *
   * @returns {{
   *   totalAmount: number,
   *   paidAmount: number,
   *   balanceAmount: number,
   *   paymentStatus: string,
   *   areaSqFt: number,
   *   qty: number
   * }}
   */
  calculateMainForm() {
    const prodKey = document.getElementById("poProductType")?.value || "flex_normal";
    const width = parseFloat(document.getElementById("poWidth")?.value) || 0;
    const height = parseFloat(document.getElementById("poHeight")?.value) || 0;
    const unit = document.getElementById("poUnit")?.value || "feet";
    const qty = parseInt(document.getElementById("poQty")?.value, 10) || 1;
    const unitPrice = parseFloat(document.getElementById("poUnitPrice")?.value) || 0;
    const designStatus = document.getElementById("poDesignStatus")?.value || "Customer Provides Design";
    let paidAmount = parseFloat(document.getElementById("poPaidAmount")?.value) || 0;

    const prod = this.products[prodKey] || this.products.flex_normal || { category: "area", unitPrice: 95.00 };
    let totalAmount = 0;
    let areaSqFt = 0;

    if (prod.category === "area") {
      areaSqFt = this.calculateAreaInSqFt(width, height, unit);
      totalAmount = areaSqFt * unitPrice * qty;
    } else {
      totalAmount = qty * unitPrice;
    }

    // Add optional shop design fee if requested
    if (designStatus === "Shop Creates Design") {
      totalAmount += 500.00;
    }

    // Rounding
    totalAmount = Math.max(0, Math.round(totalAmount * 100) / 100);

    // Prevent paidAmount exceeding totalAmount or falling below 0
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

    const balanceAmount = Math.max(0, Math.round((totalAmount - paidAmount) * 100) / 100);

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
