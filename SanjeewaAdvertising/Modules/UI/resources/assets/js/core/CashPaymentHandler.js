/**
 * SanjeewaAdvertising - Reusable Cash Payment Handler
 *
 * Manages cash tendered (customer cash given) input visibility and real-time
 * change / shortfall calculations when a payment is made in Cash.
 *
 * Designed for reuse across Order Creation, Add Payment modals, and Payments module.
 */

export class CashPaymentHandler {
  /**
   * @param {Object} config
   * @param {string} config.payableInputId
   * @param {string} config.paymentMethodSelectId
   * @param {string} config.cashSectionId
   * @param {string} config.cashReceivedInputId
   * @param {string} [config.statusBoxId]
   * @param {string} [config.statusIconId]
   * @param {string} [config.statusLabelId]
   * @param {string} [config.statusAmountId]
   * @param {string} [config.payableDisplayId]
   * @param {string} [config.cashGivenDisplayId]
   * @param {string} [config.currencyPrefix="Rs. "]
   * @param {Function} [config.isCashMethod]
   * @param {Function} [config.onChange]
   */
  constructor(config = {}) {
    this.payableInputId = config.payableInputId || "";
    this.paymentMethodSelectId = config.paymentMethodSelectId || "";
    this.cashSectionId = config.cashSectionId || "";
    this.cashReceivedInputId = config.cashReceivedInputId || "";
    this.statusBoxId = config.statusBoxId || "";
    this.statusIconId = config.statusIconId || "";
    this.statusLabelId = config.statusLabelId || "";
    this.statusAmountId = config.statusAmountId || "";
    this.payableDisplayId = config.payableDisplayId || "";
    this.cashGivenDisplayId = config.cashGivenDisplayId || "";
    this.currencyPrefix = config.currencyPrefix ?? "Rs. ";
    this.isCashMethod = config.isCashMethod || null;
    this.onChange = config.onChange || (() => {});

    this.bindEvents();
    this.update();
  }

  /**
   * Bind DOM listeners for payable amount, payment method, and cash tendered inputs.
   */
  bindEvents() {
    const payableEl = document.getElementById(this.payableInputId);
    const methodEl = document.getElementById(this.paymentMethodSelectId);
    const cashInputEl = document.getElementById(this.cashReceivedInputId);

    const bind = (el, key, handler) => {
      if (el && !el.dataset[key]) {
        el.dataset[key] = "true";
        el.addEventListener("input", handler);
        el.addEventListener("change", handler);
      }
    };

    bind(payableEl, "boundCashPayable", () => this.update());
    bind(methodEl, "boundCashMethod", () => this.update());
    bind(cashInputEl, "boundCashReceived", () => this.update());
  }

  /**
   * Determine whether the currently selected payment method is Cash.
   *
   * @returns {boolean}
   */
  isCashSelected() {
    const methodEl = document.getElementById(this.paymentMethodSelectId);
    if (!methodEl) return false;

    if (typeof this.isCashMethod === "function") {
      return Boolean(this.isCashMethod(methodEl));
    }

    const selectedText = methodEl.selectedOptions?.[0]?.textContent?.trim() || "";
    const selectedVal = String(methodEl.value || "").trim();

    return /\bcash\b/i.test(selectedText) || /^cash$/i.test(selectedVal);
  }

  /**
   * Read the current payable / advance amount.
   *
   * @returns {number}
   */
  getPayableAmount() {
    const payableEl = document.getElementById(this.payableInputId);
    const parsed = parseFloat(payableEl?.value);
    if (isNaN(parsed) || parsed < 0) return 0;
    return Math.round(parsed * 100) / 100;
  }

  /**
   * Read the raw and parsed customer cash received values.
   *
   * @returns {{ raw: string, amount: number, hasEntered: boolean }}
   */
  readCashReceived() {
    const cashInputEl = document.getElementById(this.cashReceivedInputId);
    const raw = (cashInputEl?.value ?? "").trim();
    if (raw === "") {
      return { raw: "", amount: 0, hasEntered: false };
    }

    let parsed = parseFloat(raw);
    if (isNaN(parsed) || parsed < 0) {
      parsed = 0;
      if (cashInputEl) cashInputEl.value = "0";
    }

    return {
      raw,
      amount: Math.round(parsed * 100) / 100,
      hasEntered: true,
    };
  }

  /**
   * Compute visibility, change to return, and shortfall state.
   *
   * @returns {{
   *   isVisible: boolean,
   *   isCash: boolean,
   *   payableAmount: number,
   *   cashReceived: number,
   *   hasEnteredCash: boolean,
   *   difference: number,
   *   changeAmount: number,
   *   shortfallAmount: number,
   *   status: "idle"|"exact"|"change"|"shortfall"
   * }}
   */
  calculate() {
    const payableAmount = this.getPayableAmount();
    const isCash = this.isCashSelected();
    const isVisible = payableAmount > 0 && isCash;
    const { amount: cashReceived, hasEntered: hasEnteredCash } = this.readCashReceived();

    if (!isVisible || !hasEnteredCash) {
      return {
        isVisible,
        isCash,
        payableAmount,
        cashReceived: 0,
        hasEnteredCash: false,
        difference: 0,
        changeAmount: 0,
        shortfallAmount: 0,
        status: "idle",
      };
    }

    const difference = Math.round((cashReceived - payableAmount) * 100) / 100;
    const changeAmount = difference > 0 ? difference : 0;
    const shortfallAmount = difference < 0 ? Math.abs(difference) : 0;

    let status = "exact";
    if (changeAmount > 0) {
      status = "change";
    } else if (shortfallAmount > 0) {
      status = "shortfall";
    }

    return {
      isVisible,
      isCash,
      payableAmount,
      cashReceived,
      hasEnteredCash,
      difference,
      changeAmount,
      shortfallAmount,
      status,
    };
  }

  /**
   * Synchronize the DOM visibility and change/shortfall status UI.
   *
   * @returns {Object}
   */
  update() {
    const cashSectionEl = document.getElementById(this.cashSectionId);
    const cashInputEl = document.getElementById(this.cashReceivedInputId);
    const state = this.calculate();

    if (cashSectionEl) {
      cashSectionEl.style.display = state.isVisible ? "flex" : "none";
    }

    // Clear stale cash received value when hidden (e.g. switched away from Cash or advance reset to 0)
    if (!state.isVisible && cashInputEl && cashInputEl.value !== "") {
      cashInputEl.value = "";
    }

    this.renderStatusBox(state);
    this.onChange(state);

    return state;
  }

  /**
   * Validate cash tendered when the cashier has entered an amount.
   *
   * @returns {{ isValid: boolean, error?: string, targetId?: string }}
   */
  validate() {
    const state = this.calculate();

    if (state.isVisible && state.hasEnteredCash && state.shortfallAmount > 0) {
      return {
        isValid: false,
        error: `Cash received (${this.formatCurrency(state.cashReceived)}) is less than the payment amount (${this.formatCurrency(state.payableAmount)}). Shortfall: ${this.formatCurrency(state.shortfallAmount)}.`,
        targetId: this.cashReceivedInputId,
      };
    }

    return { isValid: true };
  }

  /**
   * Clear the customer cash received input and refresh UI.
   */
  reset() {
    const cashInputEl = document.getElementById(this.cashReceivedInputId);
    if (cashInputEl) {
      cashInputEl.value = "";
    }
    this.update();
  }

  /**
   * Format a numeric value with currency prefix.
   *
   * @param {number} amount
   * @returns {string}
   */
  formatCurrency(amount) {
    const fmtOpts = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    return `${this.currencyPrefix}${Number(amount || 0).toLocaleString("en-LK", fmtOpts)}`;
  }

  /**
   * Render the live Change / Shortfall / Exact status indicator.
   *
   * @private
   * @param {Object} state
   */
  renderStatusBox(state) {
    const payableDisplayEl = this.payableDisplayId ? document.getElementById(this.payableDisplayId) : null;
    const cashGivenDisplayEl = this.cashGivenDisplayId ? document.getElementById(this.cashGivenDisplayId) : null;

    if (payableDisplayEl) {
      payableDisplayEl.textContent = this.formatCurrency(state.payableAmount);
    }

    if (cashGivenDisplayEl) {
      cashGivenDisplayEl.textContent = state.hasEnteredCash
        ? this.formatCurrency(state.cashReceived)
        : this.formatCurrency(0);
    }

    const boxEl = document.getElementById(this.statusBoxId);
    const iconEl = document.getElementById(this.statusIconId);
    const labelEl = document.getElementById(this.statusLabelId);
    const amountEl = document.getElementById(this.statusAmountId);

    if (!boxEl) return;

    boxEl.classList.remove("is-idle", "is-exact", "is-change", "is-shortfall");

    if (state.status === "change") {
      boxEl.classList.add("is-change");
      if (iconEl) iconEl.className = "fa-solid fa-hand-holding-dollar";
      if (labelEl) {
        labelEl.textContent = "Change Return";
        labelEl.title = "Change to Return";
      }
      if (amountEl) {
        amountEl.textContent = this.formatCurrency(state.changeAmount);
        amountEl.title = this.formatCurrency(state.changeAmount);
      }
    } else if (state.status === "shortfall") {
      boxEl.classList.add("is-shortfall");
      if (iconEl) iconEl.className = "fa-solid fa-triangle-exclamation";
      if (labelEl) {
        labelEl.textContent = "Shortfall / Due";
        labelEl.title = "Shortfall (Still Needed)";
      }
      if (amountEl) {
        amountEl.textContent = this.formatCurrency(state.shortfallAmount);
        amountEl.title = this.formatCurrency(state.shortfallAmount);
      }
    } else if (state.status === "exact") {
      boxEl.classList.add("is-exact");
      if (iconEl) iconEl.className = "fa-solid fa-circle-check";
      if (labelEl) {
        labelEl.textContent = "Exact Cash";
        labelEl.title = "Exact Cash Given";
      }
      if (amountEl) {
        amountEl.textContent = this.formatCurrency(0);
        amountEl.title = this.formatCurrency(0);
      }
    } else {
      boxEl.classList.add("is-idle");
      if (iconEl) iconEl.className = "fa-solid fa-coins";
      if (labelEl) {
        labelEl.textContent = "Change / Due";
        labelEl.title = "Change / Shortfall";
      }
      if (amountEl) {
        amountEl.textContent = "—";
        amountEl.title = "";
      }
    }
  }
}

export default CashPaymentHandler;
