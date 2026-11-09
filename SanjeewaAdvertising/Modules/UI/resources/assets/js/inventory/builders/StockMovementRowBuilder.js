/**
 * SanjeewaAdvertising - Stock Movement Row Builder
 *
 * Implements Builder Pattern (GoF) extending the Core BaseTableRowBuilder:
 * - StockMovementEntity: Encapsulates individual movement records and renders <tr> HTML elements.
 * - StockMovementRowBuilder: Fluent builder class extending BaseTableRowBuilder.
 */

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";

/**
 * StockMovementEntity - Model representing a stock movement entry.
 */
export class StockMovementEntity {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  formatCurrency(amt) {
    const num = parseFloat(amt) || 0;
    return `Rs. ${num.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Render table row element (<tr>) for stock movements.
   * @returns {HTMLTableRowElement}
   */
  render() {
    const tr = document.createElement("tr");
    tr.id = `movRow_${this.id || ""}`;

    // Direction badge style
    let dirBadgeClass = "mov-dir-adjust";
    let dirIcon = "fa-arrows-left-right";
    let dirLabel = "ADJUST";
    let qtyColorClass = "text-adjust";

    if (this.direction === "IN") {
      dirBadgeClass = "mov-dir-in";
      dirIcon = "fa-arrow-down-long";
      dirLabel = "IN";
      qtyColorClass = "text-in";
    } else if (this.direction === "OUT") {
      dirBadgeClass = "mov-dir-out";
      dirIcon = "fa-arrow-up-long";
      dirLabel = "OUT";
      qtyColorClass = "text-out";
    }

    // Type badge style
    let typeBadgeClass = "ant-tag-default";
    if (this.type_id === 1) typeBadgeClass = "ant-tag-green";
    else if (this.type_id === 2) typeBadgeClass = "ant-tag-blue";
    else if (this.type_id === 3) typeBadgeClass = "ant-tag-cyan";
    else if (this.type_id === 4) typeBadgeClass = "ant-tag-purple";
    else if (this.type_id === 5) typeBadgeClass = "ant-tag-orange";
    else if (this.type_id === 6) typeBadgeClass = "ant-tag-red";
    else if (this.type_id === 7) typeBadgeClass = "ant-tag-magenta";

    tr.innerHTML = `
      <td>
        <span class="inv-item-code mov-ref-pill">${this.movement_code || ("MOV-" + this.id)}</span>
      </td>
      <td>
        <div class="mov-date-wrap">
          <i class="fa-regular fa-clock" style="color: var(--text-muted); font-size: 11px;"></i>
          <span>${this.date_formatted || this.date || "-"}</span>
        </div>
      </td>
      <td>
        <div class="mov-item-code-cell">
          <strong>${this.item_code || "-"}</strong>
          <span class="mov-brand-sub">${this.brand || "Generic"}</span>
        </div>
      </td>
      <td>
        <div class="inv-item-title">${this.item_name || "-"}</div>
        <div class="mov-category-sub"><i class="fa-solid fa-tag"></i> ${this.category || "General"}</div>
      </td>
      <td>
        <span class="ant-tag ${typeBadgeClass}">
          ${this.type_name || "Movement"}
        </span>
      </td>
      <td>
        <span class="mov-dir-badge ${dirBadgeClass}">
          <i class="fa-solid ${dirIcon}"></i> ${dirLabel}
        </span>
      </td>
      <td>
        <span class="mov-source-pill">
          <i class="fa-solid fa-receipt"></i> ${this.source_label || ("Ref #" + this.source_id)}
        </span>
      </td>
      <td class="text-right">
        <span class="mov-qty-badge ${qtyColorClass}">
          ${this.qty_display || this.qty || 0}
        </span>
      </td>
      <td class="text-right" style="font-weight: 500; font-size: 12.5px;">
        ${this.formatCurrency(this.unit_price)}
      </td>
      <td class="text-right" style="font-weight: 700; color: var(--text); font-size: 13px;">
        ${this.formatCurrency(this.total_value)}
      </td>
    `;

    return tr;
  }
}

/**
 * StockMovementRowBuilder - Fluent builder class.
 */
export class StockMovementRowBuilder extends BaseTableRowBuilder {
  buildEntity() {
    return new StockMovementEntity(this._data);
  }

  build() {
    return this.buildEntity().render();
  }

  static renderRow(data) {
    return new StockMovementRowBuilder(data).build();
  }
}
