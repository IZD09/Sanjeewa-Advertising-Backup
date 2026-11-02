/**
 * SanjeewaAdvertising - Base Table Row Builder
 *
 * Abstract/Base Builder class for constructing and rendering table rows across modules.
 * Extended by domain-specific builders (e.g. PrintingOrderBuilder, PaymentRowBuilder, InventoryRowBuilder).
 */

export class BaseTableRowBuilder {
  /**
   * @param {Object} [initialData=null]
   */
  constructor(initialData = null) {
    this._data = {};
    this.reset();
    if (initialData && typeof initialData === "object") {
      this.fromData(initialData);
    }
  }

  /**
   * Reset builder attributes. Subclasses should override and call super.reset().
   * @returns {this}
   */
  reset() {
    this._data = {};
    return this;
  }

  /**
   * Populate builder from raw data object.
   * @param {Object} data
   * @returns {this}
   */
  fromData(data = {}) {
    if (!data || typeof data !== "object") return this;
    Object.assign(this._data, data);
    return this;
  }

  /**
   * Generic fluent attribute setter.
   * @param {string} key
   * @param {*} value
   * @returns {this}
   */
  set(key, value) {
    this[key] = value;
    this._data[key] = value;
    return this;
  }

  /**
   * Generic attribute getter.
   * @param {string} key
   * @param {*} [defaultValue=null]
   * @returns {*}
   */
  get(key, defaultValue = null) {
    return this[key] !== undefined ? this[key] : (this._data[key] ?? defaultValue);
  }

  // ==========================================
  // FORMATTING & HTML HELPERS
  // ==========================================

  /**
   * Format a numeric amount to localized Sri Lankan Rupees string (e.g. Rs. 3,800.00).
   * @param {number|string} amount
   * @param {string} [prefix="Rs. "]
   * @param {number} [decimals=2]
   * @returns {string}
   */
  formatCurrency(amount, prefix = "Rs. ", decimals = 2) {
    const num = parseFloat(amount);
    if (isNaN(num)) return `${prefix}0.00`;
    return `${prefix}${num.toLocaleString("en-LK", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`;
  }

  /**
   * Format ISO date string or Date object to YYYY-MM-DD.
   * @param {Date|string} date
   * @returns {string}
   */
  formatDate(date) {
    if (!date) return "—";
    if (date instanceof Date) return date.toISOString().split("T")[0];
    return String(date).trim();
  }

  /**
   * Format dimensions (e.g. 10 × 4 feet).
   * @param {number|string} width
   * @param {number|string} height
   * @param {string} [unit="feet"]
   * @returns {string}
   */
  formatDimensions(width, height, unit = "feet") {
    return `${width} × ${height} ${unit}`;
  }

  /**
   * Safe HTML string escaping.
   * @param {*} str
   * @returns {string}
   */
  escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Helper to create a table data cell (<td>).
   * @param {string} content
   * @param {string} [className=""]
   * @param {string} [style=""]
   * @returns {string}
   */
  createCell(content, className = "", style = "") {
    const classAttr = className ? ` class="${this.escapeHtml(className)}"` : "";
    const styleAttr = style ? ` style="${this.escapeHtml(style)}"` : "";
    return `<td${classAttr}${styleAttr}>${content}</td>`;
  }

  /**
   * Helper to create a status badge.
   * @param {string} text
   * @param {string} [variant=""]
   * @returns {string}
   */
  createBadge(text, variant = "") {
    const badgeClass = (variant || String(text || "")).toLowerCase().replace(/\s+/g, "-");
    return `<span class="status-badge ${badgeClass}">${this.escapeHtml(text || "—")}</span>`;
  }

  // ==========================================
  // ABSTRACT / TERMINAL METHODS
  // ==========================================

  /**
   * Terminal step: build the finalized entity.
   * Subclasses must implement this method.
   * @abstract
   * @returns {Object}
   */
  build() {
    throw new Error("Method 'build()' must be implemented by subclass.");
  }

  /**
   * Directly build and render the row element or HTML string.
   * @returns {HTMLTableRowElement|string}
   */
  render() {
    const entity = this.build();
    if (typeof entity?.render === "function") {
      return entity.render();
    }
    throw new Error("Constructed entity must implement 'render()' method.");
  }

  /**
   * Alias for render().
   * @returns {HTMLTableRowElement|string}
   */
  renderTableRow() {
    return this.render();
  }

  /**
   * Factory helper to build an array of items.
   * @param {Array} list
   * @returns {Array}
   */
  static fromArray(list) {
    if (!Array.isArray(list)) return [];
    return list.map(item => new this(item).build());
  }
}

export const TableRowBuilder = BaseTableRowBuilder;
export default BaseTableRowBuilder;

