/**
 * SanjeewaAdvertising - Expense Category Card Builder
 *
 * Implements Builder Pattern (GoF) extending Core BaseTableRowBuilder:
 * - ExpenseCategoryCardEntity: Encapsulates individual category overhead bill cards
 *   (Electricity, Water Board, Internet & Fiber, Shop Rent, Maintenance & Other)
 *   and updates DOM elements or renders category badge cards.
 * - ExpenseCategoryCardBuilder: Fluent builder class with setters and batch builder
 *   for loading and updating category totals in Operating Expenses tab.
 */

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";

/**
 * ExpenseCategoryCardEntity - Entity model for an Expense Category Card
 */
export class ExpenseCategoryCardEntity {
  /**
   * @param {Object} [data={}]
   */
  constructor(data = {}) {
    this.categoryKey = data.categoryKey || "Other";
    this.categoryName = data.categoryName || "Maintenance / Other";
    this.targetElementId = data.targetElementId || "";
    this.amount = Number(data.amount) || 0;
    this.paidAmount = Number(data.paidAmount) || 0;
    this.billCount = Number(data.billCount) || 0;
    this.icon = data.icon || "fa-wrench";
    this.color = data.color || "#64748b";
    this.onClick = typeof data.onClick === "function" ? data.onClick : null;
  }

  formatAmount(val) {
    const num = parseFloat(val);
    if (isNaN(num)) return "Rs. 0.00";
    return `Rs. ${num.toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  /**
   * Update existing DOM element (e.g. #catTotalElectricity).
   */
  updateDom() {
    if (typeof document === "undefined" || !this.targetElementId) return;

    const el = document.getElementById(this.targetElementId);
    if (el) {
      el.textContent = this.formatAmount(this.amount);
    }
  }

  /**
   * Render category stat box element.
   * @returns {HTMLDivElement}
   */
  render() {
    const box = document.createElement("div");
    box.className = "method-stat-box";
    box.style.borderLeft = `3px solid ${this.color}`;
    box.style.cursor = "pointer";
    box.title = `Click to filter by ${this.categoryName}`;
    box.dataset.category = this.categoryKey;

    box.innerHTML = `
      <i class="fa-solid ${this.icon}" style="color: ${this.color};"></i>
      <div class="method-stat-meta">
        <span>${this.categoryName}</span>
        <strong id="${this.targetElementId}">${this.formatAmount(this.amount)}</strong>
      </div>
    `;

    if (this.onClick) {
      box.addEventListener("click", () => this.onClick(this.categoryKey));
    }

    return box;
  }
}

/**
 * ExpenseCategoryCardBuilder - Fluent builder class for Operating Expense Category Cards
 */
export class ExpenseCategoryCardBuilder extends BaseTableRowBuilder {
  setCategoryKey(key) {
    return this.set("categoryKey", key);
  }

  setCategoryName(name) {
    return this.set("categoryName", name);
  }

  setTargetElementId(id) {
    return this.set("targetElementId", id);
  }

  setAmount(amt) {
    return this.set("amount", Number(amt) || 0);
  }

  setPaidAmount(amt) {
    return this.set("paidAmount", Number(amt) || 0);
  }

  setBillCount(count) {
    return this.set("billCount", Number(count) || 0);
  }

  setIcon(icon) {
    return this.set("icon", icon);
  }

  setColor(color) {
    return this.set("color", color);
  }

  setOnClick(callback) {
    return this.set("onClick", callback);
  }

  buildEntity() {
    return new ExpenseCategoryCardEntity(this._data);
  }

  build() {
    return this.buildEntity().render();
  }

  update() {
    this.buildEntity().updateDom();
    return this;
  }

  // =========================================================================
  // BATCH COMPUTATION & CATEGORY CARD LOADING HELPERS
  // =========================================================================

  /**
   * Standard category metadata definitions.
   */
  static get CategoryDefs() {
    return {
      Electricity: {
        key: "Electricity",
        name: "Electricity (CEB/LECO)",
        elementId: "catTotalElectricity",
        icon: "fa-bolt-lightning",
        color: "#f59e0b"
      },
      "Water Board": {
        key: "Water Board",
        name: "Water Board (NWSDB)",
        elementId: "catTotalWater",
        icon: "fa-droplet",
        color: "#0284c7"
      },
      "Internet & Fiber": {
        key: "Internet & Fiber",
        name: "Internet / Fiber",
        elementId: "catTotalInternet",
        icon: "fa-wifi",
        color: "#8b5cf6"
      },
      "Shop Rent": {
        key: "Shop Rent",
        name: "Shop / Office Rent",
        elementId: "catTotalRent",
        icon: "fa-building",
        color: "#ec4899"
      },
      "Maintenance & Other": {
        key: "Maintenance & Other",
        name: "Maintenance / Other",
        elementId: "catTotalOther",
        icon: "fa-wrench",
        color: "#64748b"
      }
    };
  }

  /**
   * Calculate category totals and update all small category cards in Operating Expenses tab.
   *
   * @param {Array} expenses - Filtered or month-filtered expense bills
   * @param {Function} [onCategoryFilter=null] - Optional click-to-filter callback
   * @returns {Object} Map of category keys to totals
   */
  static buildAll(expenses = [], onCategoryFilter = null) {
    const list = Array.isArray(expenses) ? expenses : [];
    const defs = this.CategoryDefs;

    // Initialize accumulation map
    const catTotals = {
      Electricity: { total: 0, paid: 0, count: 0 },
      "Water Board": { total: 0, paid: 0, count: 0 },
      "Internet & Fiber": { total: 0, paid: 0, count: 0 },
      "Shop Rent": { total: 0, paid: 0, count: 0 },
      "Maintenance & Other": { total: 0, paid: 0, count: 0 }
    };

    // Tally expenses by category
    list.forEach(b => {
      const cat = b.category || "";
      let matchedKey = "Maintenance & Other";

      if (cat.includes("Electric") || cat === "Electricity") {
        matchedKey = "Electricity";
      } else if (cat.includes("Water") || cat === "Water Board") {
        matchedKey = "Water Board";
      } else if (cat.includes("Internet") || cat.includes("Fiber") || cat.includes("Telecom")) {
        matchedKey = "Internet & Fiber";
      } else if (cat.includes("Rent") || cat === "Shop Rent") {
        matchedKey = "Shop Rent";
      }

      const amt = Number(b.amount) || 0;
      catTotals[matchedKey].total += amt;
      catTotals[matchedKey].count += 1;
      if (b.status === "Paid") {
        catTotals[matchedKey].paid += Number(b.paidAmount || amt) || 0;
      }
    });

    // Update each category card via builder
    Object.keys(defs).forEach(catKey => {
      const def = defs[catKey];
      const data = catTotals[catKey] || { total: 0, paid: 0, count: 0 };

      new ExpenseCategoryCardBuilder()
        .setCategoryKey(catKey)
        .setCategoryName(def.name)
        .setTargetElementId(def.elementId)
        .setAmount(data.total)
        .setPaidAmount(data.paid)
        .setBillCount(data.count)
        .setIcon(def.icon)
        .setColor(def.color)
        .setOnClick(onCategoryFilter)
        .update();
    });

    return catTotals;
  }
}

export default ExpenseCategoryCardBuilder;
