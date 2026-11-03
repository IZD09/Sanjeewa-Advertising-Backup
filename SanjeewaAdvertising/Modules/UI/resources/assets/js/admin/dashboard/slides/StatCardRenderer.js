/**
 * StatCardRenderer
 * Dedicated component class for rendering and updating dashboard stat cards.
 * Receives configuration data via fluent/chainable setter methods.
 */

export class StatCardRenderer {
  /**
   * @param {HTMLElement|null} [element=null]
   */
  constructor(element = null) {
    this.element = element;
    this.title = "";
    this.icon = "";
    this.color = "blue";
    this.value = "0";
    this.trend = "positive";
    this.trendPercent = "0%";
    this.trendLabel = "vs last month";
    this.barsClass = "";
    this.bars = [];
  }

  // ==========================================
  // GETTER METHODS
  // ==========================================

  getElement() {
    return this.element;
  }

  getTitle() {
    return this.title;
  }

  getIcon() {
    return this.icon;
  }

  getColor() {
    return this.color;
  }

  getValue() {
    return this.value;
  }

  getTrend() {
    return this.trend;
  }

  getTrendPercent() {
    return this.trendPercent;
  }

  getTrendLabel() {
    return this.trendLabel;
  }

  getBars() {
    return this.bars;
  }

  getBarsClass() {
    return this.barsClass;
  }

  // ==========================================
  // SETTER METHODS (Fluent / Chainable)
  // ==========================================

  /**
   * Set target DOM element.
   * @param {HTMLElement|null} element
   * @returns {this}
   */
  setElement(element) {
    this.element = element;
    return this;
  }

  /**
   * Set card title.
   * @param {string} title
   * @returns {this}
   */
  setTitle(title) {
    this.title = title ?? "";
    return this;
  }

  /**
   * Set card icon class.
   * @param {string} icon
   * @returns {this}
   */
  setIcon(icon) {
    this.icon = icon ?? "";
    return this;
  }

  /**
   * Set icon accent color (e.g. blue, red, green, orange).
   * @param {string} color
   * @returns {this}
   */
  setColor(color) {
    this.color = color ?? "blue";
    return this;
  }

  /**
   * Set the displayed metric value.
   * @param {string|number} value
   * @returns {this}
   */
  setValue(value) {
    this.value = value !== undefined && value !== null ? String(value) : "0";
    return this;
  }

  /**
   * Set trend direction, percentage, and comparison label.
   * @param {string} [trend="positive"] - "positive" | "negative"
   * @param {string} [percent="0%"]
   * @param {string} [label="vs last month"]
   * @returns {this}
   */
  setTrend(trend = "positive", percent = "0%", label = "vs last month") {
    this.trend = trend;
    this.trendPercent = percent;
    this.trendLabel = label;
    return this;
  }

  /**
   * Set mini-bar heights and optional bar color class.
   * @param {number[]} bars
   * @param {string} [barsClass=""]
   * @returns {this}
   */
  setBars(bars = [], barsClass = "") {
    this.bars = Array.isArray(bars) ? bars : [];
    if (barsClass) {
      this.barsClass = barsClass;
    }
    return this;
  }

  /**
   * Set additional class for mini-bars (e.g. "red-bars", "green-bars").
   * @param {string} barsClass
   * @returns {this}
   */
  setBarsClass(barsClass) {
    this.barsClass = barsClass ?? "";
    return this;
  }

  /**
   * Batch configure properties from an options object.
   * @param {Object} options
   * @returns {this}
   */
  setOptions(options = {}) {
    if (options.element) this.setElement(options.element);
    if (options.title !== undefined) this.setTitle(options.title);
    if (options.icon !== undefined) this.setIcon(options.icon);
    if (options.color !== undefined) this.setColor(options.color);
    if (options.value !== undefined) this.setValue(options.value);
    if (options.trend !== undefined || options.trendPercent !== undefined) {
      this.setTrend(
        options.trend || "positive",
        options.trendPercent || "0%",
        options.trendLabel || "vs last month"
      );
    }
    if (options.bars !== undefined) this.setBars(options.bars, options.barsClass);
    if (options.barsClass !== undefined) this.setBarsClass(options.barsClass);
    return this;
  }

  // ==========================================
  // RENDER METHOD
  // ==========================================

  /**
   * Render or update the stat card DOM element with the configured data.
   * @param {HTMLElement|null} [element=null] - Optional override element.
   * @param {Object} [options=null] - Optional override options.
   * @returns {HTMLElement|null}
   */
  render(element = null, options = null) {
    if (element) {
      this.setElement(element);
    }
    if (options) {
      this.setOptions(options);
    }

    if (!this.element) return null;

    const topHtml =
      this.element.querySelector(".stat-top")?.outerHTML ||
      `
      <div class="stat-top">
        <span>${this.title}</span>
        <span class="stat-icon ${this.color}">
          <i class="${this.icon}"></i>
        </span>
      </div>`;

    const trendIcon = this.trend === "positive" ? "fa-arrow-up" : "fa-arrow-down";
    const barsHtml = this.bars.map(h => `<i style="height:${h}%"></i>`).join("\n          ");
    const miniBarsClass = this.barsClass ? `mini-bars ${this.barsClass}` : "mini-bars";

    this.element.innerHTML = `
      ${topHtml}
      <h3>${this.value}</h3>
      <p class="${this.trend}">
        <i class="fa-solid ${trendIcon}"></i> ${this.trendPercent} <span>${this.trendLabel}</span>
      </p>
      <div class="${miniBarsClass}">
        ${barsHtml}
      </div>
    `;

    return this.element;
  }

  /**
   * Static helper for one-line rendering.
   * @param {HTMLElement|null} element
   * @param {Object} options
   */
  static render(element, options = {}) {
    return new StatCardRenderer(element).setOptions(options).render();
  }
}
