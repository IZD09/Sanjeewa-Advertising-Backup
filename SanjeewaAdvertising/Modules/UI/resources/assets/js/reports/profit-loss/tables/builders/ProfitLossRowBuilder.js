/**
 * SanjeewaAdvertising - Profit & Loss Statement Row Builder
 *
 * Extends Core BaseTableRowBuilder for the Audited P&L Statement table.
 */

import { BaseTableRowBuilder } from "../../../../core/BaseTableRowBuilder.js";

export class ProfitLossStatementRow {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  render() {
    const rowClass = this.rowType === "section"
      ? "pl-section-head"
      : (this.rowType === "total" ? "pl-total-row" : (this.rowType === "net" ? "pl-net-row" : "pl-sub-row"));

    return `
      <tr class="${rowClass}">
        <td>${this.label}</td>
        <td class="num-col">${this.formattedAmount}</td>
      </tr>
    `;
  }
}

export class ProfitLossRowBuilder extends BaseTableRowBuilder {
  constructor(initialData = null) {
    super(initialData);
  }

  reset() {
    super.reset();
    this.label = "";
    this.amount = 0;
    this.rowType = "sub";
    this.formattedAmount = "";
    return this;
  }

  fromData(data = {}) {
    if (!data || typeof data !== "object") return this;
    super.fromData(data);
    this.label = data.label || "";
    this.amount = Number(data.amount ?? 0);
    this.rowType = data.rowType || "sub";
    this.formattedAmount = data.formattedAmount ?? this.formatCurrency(this.amount);
    return this;
  }

  build() {
    return new ProfitLossStatementRow({
      label: this.label,
      amount: this.amount,
      rowType: this.rowType,
      formattedAmount: this.formattedAmount
    });
  }
}

export default ProfitLossRowBuilder;
