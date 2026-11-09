/**
 * SanjeewaAdvertising - Inventory KPI Card Builder
 *
 * Implements Builder Pattern (GoF) extending Core BaseTableRowBuilder:
 * - InventoryKpiCardEntity: Encapsulates KPI summary card data and renders a .inv-kpi-card DOM element.
 * - InventoryKpiCardBuilder: Fluent builder class for constructing and rendering KPI summary cards
 *   across all Inventory tabs (Tab 1: Material Stock, Tab 2: Stock Movements, Tab 3: Categories & Subcategories).
 */

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";

/**
 * InventoryKpiCardEntity - Entity model representing a single Inventory KPI Summary Card.
 */
export class InventoryKpiCardEntity {
  constructor(data = {}) {
    this.valueId = data.valueId || data.id || "";
    this.label = data.label || "Metric";
    this.value = data.value ?? 0;
    this.valueColor = data.valueColor || "";
    this.description = data.description || "";
    this.descIcon = data.descIcon || "fa-layer-group";
    this.descIconColor = data.descIconColor || "#1677ff";
    this.icon = data.icon || "fa-boxes-stacked";
    this.iconTheme = data.iconTheme || "blue";
  }

  /**
   * Render KPI card DOM element (<div class="inv-kpi-card">).
   * @returns {HTMLDivElement}
   */
  render() {
    const card = document.createElement("div");
    card.className = "inv-kpi-card";

    const valIdAttr = this.valueId ? ` id="${this.valueId}"` : "";
    const valStyleAttr = this.valueColor ? ` style="color: ${this.valueColor};"` : "";

    card.innerHTML = `
      <div class="inv-kpi-meta">
        <span class="inv-kpi-label">${this.label}</span>
        <div class="inv-kpi-val"${valIdAttr}${valStyleAttr}>${this.value}</div>
        <span class="inv-kpi-desc">
          <i class="fa-solid ${this.descIcon}" style="color: ${this.descIconColor};"></i> ${this.description}
        </span>
      </div>
      <div class="inv-kpi-icon ${this.iconTheme}">
        <i class="fa-solid ${this.icon}"></i>
      </div>
    `;

    return card;
  }
}

/**
 * InventoryKpiCardBuilder - Fluent builder class for Inventory KPI Summary Cards.
 */
export class InventoryKpiCardBuilder extends BaseTableRowBuilder {
  setValueId(valueId) {
    return this.set("valueId", valueId);
  }

  setLabel(label) {
    return this.set("label", label);
  }

  setValue(value) {
    return this.set("value", value);
  }

  setValueColor(color) {
    return this.set("valueColor", color);
  }

  setDescription(description) {
    return this.set("description", description);
  }

  setDescIcon(icon, color = "#1677ff") {
    this.set("descIcon", icon);
    return this.set("descIconColor", color);
  }

  setIcon(icon, theme = "blue") {
    this.set("icon", icon);
    return this.set("iconTheme", theme);
  }

  buildEntity() {
    return new InventoryKpiCardEntity(this._data);
  }

  build() {
    return this.buildEntity().render();
  }

  toJSON() {
    return { ...this._data };
  }

  /**
   * Static helper to construct and render a single KPI card element.
   * Accepts a plain object, an InventoryKpiCardBuilder instance, or an HTMLElement.
   * @param {Object|InventoryKpiCardBuilder|HTMLElement} data
   * @returns {HTMLDivElement}
   */
  static renderCard(data = {}) {
    if (typeof HTMLElement !== "undefined" && data instanceof HTMLElement) {
      return data;
    }
    if (data instanceof InventoryKpiCardBuilder) {
      return data.build();
    }
    if (data instanceof InventoryKpiCardEntity) {
      return data.render();
    }
    return new InventoryKpiCardBuilder(data).build();
  }

  /**
   * Static helper to render a full grid of KPI cards into a container element
   * (or fallback to updating individual value elements by valueId).
   * @param {string} containerId
   * @param {Array<Object|InventoryKpiCardBuilder|HTMLElement>} cardsData
   */
  static renderGrid(containerId, cardsData = []) {
    if (typeof document === "undefined") {
      return;
    }

    const container = containerId ? document.getElementById(containerId) : null;
    if (container) {
      container.innerHTML = "";
      cardsData.forEach((cardItem) => {
        const cardEl = InventoryKpiCardBuilder.renderCard(cardItem);
        container.appendChild(cardEl);
      });
      return;
    }

    // Fallback: update existing value elements in place if container is not found
    cardsData.forEach((cardItem) => {
      const cardData = cardItem instanceof InventoryKpiCardBuilder ? cardItem.toJSON() : cardItem;
      const id = cardData && (cardData.valueId || cardData.id);
      if (id) {
        const valEl = document.getElementById(id);
        if (valEl) {
          valEl.textContent = String(cardData.value ?? 0);
        }
      }
    });
  }
}

export default InventoryKpiCardBuilder;
