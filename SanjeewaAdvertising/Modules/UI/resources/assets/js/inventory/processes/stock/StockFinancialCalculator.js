/**
 * SanjeewaAdvertising - Stock Financial Calculator
 *
 * Handles live calculation of purchase expenditure, warehouse valuation,
 * and stock quantity increment formulas for the Add Stock Modal.
 */

export class StockFinancialCalculator {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.getCurrentStockQty] - Returns current quantity of selected existing stock
   */
  constructor(options = {}) {
    this.getCurrentStockQty = options.getCurrentStockQty || (() => 0);
  }

  /**
   * Bind input event listeners on quantity and price fields.
   */
  bindEvents() {
    ["addStockQty", "addStockUnitCost", "addStockSellingPrice"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => this.calculate());
      }
    });
  }

  /**
   * Format currency helper.
   * @param {number} amt
   * @returns {string}
   */
  formatCurrency(amt) {
    const num = parseFloat(amt) || 0;
    return `Rs. ${num.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Perform live calculations and update DOM display elements.
   */
  calculate() {
    const qty = parseFloat(document.getElementById("addStockQty")?.value) || 0;
    const buy = parseFloat(document.getElementById("addStockUnitCost")?.value) || 0;
    const sell = parseFloat(document.getElementById("addStockSellingPrice")?.value) || 0;

    const totalCost = qty * buy;
    const totalValuation = qty * sell;

    const costEl = document.getElementById("addStockTotalCost");
    const valEl = document.getElementById("addStockTotalValue");
    const indicator = document.getElementById("addStockUpdateQtyIndicator");
    const calcEl = document.getElementById("addStockUpdateQtyCalc");

    if (costEl) costEl.textContent = this.formatCurrency(totalCost);
    if (valEl) valEl.textContent = this.formatCurrency(totalValuation);

    const currentQty = this.getCurrentStockQty();
    if (currentQty > 0 || (indicator && indicator.dataset.active === "true")) {
      if (indicator && calcEl) {
        const newTotal = currentQty + qty;
        calcEl.textContent = `${currentQty.toLocaleString()} + ${qty.toLocaleString()} = ${newTotal.toLocaleString()} Units`;
        indicator.style.display = "block";
      }
    } else if (indicator) {
      indicator.style.display = "none";
    }
  }

  /**
   * Reset calculated displays to initial values.
   */
  reset() {
    const costEl = document.getElementById("addStockTotalCost");
    const valEl = document.getElementById("addStockTotalValue");
    const indicator = document.getElementById("addStockUpdateQtyIndicator");

    if (costEl) costEl.textContent = "Rs. 0.00";
    if (valEl) valEl.textContent = "Rs. 0.00";
    if (indicator) {
      indicator.style.display = "none";
      delete indicator.dataset.active;
    }
  }
}

export default StockFinancialCalculator;
