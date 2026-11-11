/**
 * SanjeewaAdvertising - Cash Flow & Operating Expense Row Builders
 *
 * Extends Core BaseTableRowBuilder for both `#cashFlowTable` and `#operatingExpensesTable`.
 */

import { BaseTableRowBuilder } from "../../../../core/BaseTableRowBuilder.js";

export class CashFlowReportRow {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  render() {
    const isOutflow = this.direction === "outflow";
    const sign = isOutflow ? "-" : "+";
    const color = isOutflow ? "#dc2626" : "#059669";
    const badgeClass = isOutflow ? "badge-overdue" : "badge-paid";
    const formattedAmount = `${sign} Rs. ${Number(this.amount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

    return `
      <tr>
        <td><strong>${this.transactionId}</strong></td>
        <td><span class="rep-badge ${badgeClass}">${this.channel}</span></td>
        <td>${this.reference}</td>
        <td>${this.method}</td>
        <td>${this.date}</td>
        <td><span class="rep-badge badge-paid">${this.status}</span></td>
        <td class="num-col" style="color: ${color}; font-weight: 700;">${formattedAmount}</td>
      </tr>
    `;
  }
}

export class CashFlowRowBuilder extends BaseTableRowBuilder {
  constructor(initialData = null) {
    super(initialData);
  }

  reset() {
    super.reset();
    this.transactionId = "";
    this.channel = "Customer Inflow";
    this.reference = "";
    this.method = "Cash";
    this.date = "";
    this.status = "Completed";
    this.amount = 0;
    this.direction = "inflow";
    return this;
  }

  fromData(data = {}) {
    if (!data || typeof data !== "object") return this;
    super.fromData(data);
    this.transactionId = data.transactionId || `#TX-${data.id || 1}`;
    this.channel = data.channel || "Customer Inflow";
    this.reference = data.reference || "—";
    this.method = data.method || data.payment_type || "Cash";
    this.date = this.formatDate(data.date ?? data.pay_date);
    this.status = data.status || data.payment_status || "Completed";
    this.amount = Number(data.amount ?? data.payment ?? 0);
    this.direction = data.direction || "inflow";
    return this;
  }

  build() {
    return new CashFlowReportRow({
      transactionId: this.transactionId,
      channel: this.channel,
      reference: this.reference,
      method: this.method,
      date: this.date,
      status: this.status,
      amount: this.amount,
      direction: this.direction
    });
  }
}

export class OperatingExpenseReportRow {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  render() {
    const isPaid = this.status === "Paid";
    const badgeClass = isPaid ? "badge-paid" : "badge-pending";
    const iconClass = isPaid ? "fa-check" : "fa-clock";
    const formattedAmount = `Rs. ${Number(this.price || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

    return `
      <tr>
        <td><strong>${this.expenseCode}</strong></td>
        <td><strong>${this.expenseType}</strong></td>
        <td>${this.addedByName}</td>
        <td>${this.paidByName}</td>
        <td>${this.addDate}</td>
        <td>${this.payAt}</td>
        <td>
          <span class="rep-badge ${badgeClass}">
            <i class="fa-solid ${iconClass}"></i> ${this.status}
          </span>
        </td>
        <td class="num-col" style="color: #dc2626; font-weight: 700;">${formattedAmount}</td>
      </tr>
    `;
  }
}

export class OperatingExpenseRowBuilder extends BaseTableRowBuilder {
  constructor(initialData = null) {
    super(initialData);
  }

  reset() {
    super.reset();
    this.expenseCode = "";
    this.expenseType = "Operating Overhead";
    this.addedByName = "System Admin";
    this.paidByName = "—";
    this.addDate = "—";
    this.payAt = "Not Paid Yet";
    this.status = "Pending";
    this.price = 0;
    return this;
  }

  fromData(data = {}) {
    if (!data || typeof data !== "object") return this;
    super.fromData(data);
    this.expenseCode = data.expense_code || data.expenseCode || `#EXP-${String(data.id || 1).padStart(4, "0")}`;
    this.expenseType = data.expense_type || data.expencesess_type || data.expenseType || "Operating Overhead";
    this.addedByName = data.added_by_name || data.addedByName || "System Admin";
    this.paidByName = data.paid_by_name || data.paidByName || "—";
    this.addDate = this.formatDate(data.add_date ?? data.addDate);
    this.payAt = data.pay_at ? this.formatDate(data.pay_at) : (data.payAt || "Not Paid Yet");
    this.status = data.status || data.expencesess_status || "Pending";
    this.price = Number(data.price ?? 0);
    return this;
  }

  build() {
    return new OperatingExpenseReportRow({
      expenseCode: this.expenseCode,
      expenseType: this.expenseType,
      addedByName: this.addedByName,
      paidByName: this.paidByName,
      addDate: this.addDate,
      payAt: this.payAt,
      status: this.status,
      price: this.price,
    });
  }
}

export default CashFlowRowBuilder;
