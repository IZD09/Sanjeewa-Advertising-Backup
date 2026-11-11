/**
 * SanjeewaAdvertising - Executive KPI Card Builder
 *
 * Dedicated builder class for loading and rendering data into the 5 executive summary
 * KPI cards on the Reports Hub page.
 */

export class ExecutiveKpiCardBuilder {
  /**
   * @param {HTMLElement|string|null} [cardElement=null]
   */
  constructor(cardElement = null) {
    this.element = null;
    this.title = "";
    this.value = "Rs. 0.00";
    this.icon = "";
    this.color = "blue";
    this.trendHtml = "";
    this.metaText = "";

    if (cardElement) {
      this.setElement(cardElement);
    }
  }

  setElement(cardElement) {
    this.element = typeof cardElement === "string"
      ? document.querySelector(cardElement)
      : cardElement;
    return this;
  }

  setTitle(title) {
    this.title = title || "";
    return this;
  }

  setValue(value, isCurrency = true) {
    if (typeof value === "number") {
      const formatted = Number(value).toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      this.value = isCurrency ? `Rs. ${formatted}` : formatted;
    } else {
      this.value = String(value ?? "—");
    }
    return this;
  }

  setIcon(iconClass) {
    this.icon = iconClass || "";
    return this;
  }

  setColor(color) {
    this.color = color || "blue";
    return this;
  }

  setMeta(trendHtml = "", metaText = "") {
    this.trendHtml = trendHtml || "";
    this.metaText = metaText || "";
    return this;
  }

  fromData(kpiData = {}) {
    if (!kpiData || typeof kpiData !== "object") return this;

    if (kpiData.title) this.setTitle(kpiData.title);
    if (kpiData.raw_value !== undefined) {
      this.setValue(kpiData.raw_value);
    } else if (kpiData.value !== undefined) {
      this.value = String(kpiData.value);
    }
    if (kpiData.icon) this.setIcon(kpiData.icon);
    if (kpiData.color) this.setColor(kpiData.color);
    this.setMeta(kpiData.trend || "", kpiData.meta || "");

    return this;
  }

  render() {
    if (!this.element) return this;

    // 1. Color Theme Class
    ["kpi-blue", "kpi-orange", "kpi-red", "kpi-green", "kpi-purple"].forEach(cls => {
      this.element.classList.remove(cls);
    });
    this.element.classList.add(`kpi-${this.color}`);

    // 2. Title
    const titleEl = this.element.querySelector(".rep-kpi-title");
    if (titleEl && this.title) {
      titleEl.textContent = this.title;
    }

    // 3. Icon
    const iconEl = this.element.querySelector(".rep-kpi-icon i");
    if (iconEl && this.icon) {
      iconEl.className = this.icon;
    }

    // 4. Value
    const valueEl = this.element.querySelector(".rep-kpi-value");
    if (valueEl) {
      valueEl.textContent = this.value;
    }

    // 5. Meta & Trend Info
    const metaEl = this.element.querySelector(".rep-kpi-meta");
    if (metaEl) {
      if (this.trendHtml && this.metaText) {
        metaEl.innerHTML = `${this.trendHtml} ${this.metaText}`;
      } else if (this.metaText) {
        metaEl.innerHTML = `<span>${this.metaText}</span>`;
      } else if (this.trendHtml) {
        metaEl.innerHTML = this.trendHtml;
      }
    }

    return this;
  }
}

export default ExecutiveKpiCardBuilder;
