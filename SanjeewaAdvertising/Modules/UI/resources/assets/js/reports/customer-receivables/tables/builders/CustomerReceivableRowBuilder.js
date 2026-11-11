/**
 * SanjeewaAdvertising - Customer Receivable Row Builder
 *
 * Extends Core BaseTableRowBuilder for `#receivablesTable`.
 */

import { BaseTableRowBuilder } from "../../../../core/BaseTableRowBuilder.js";

export class CustomerReceivableReportRow {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  render() {
    const due = Math.max(0, Number(this.invoiced || 0) - Number(this.paid || 0));
    const badgeClass = due === 0 ? "badge-paid" : (this.aging === "1-30 Days" ? "badge-pending" : "badge-overdue");
    const color = due > 0 ? "#dc2626" : "#059669";

    return `
      <tr>
        <td><strong>${this.customerCode}</strong></td>
        <td><strong>${this.customerName}</strong></td>
        <td>${this.mobile}</td>
        <td>${this.registeredDate}</td>
        <td><span class="rep-badge ${badgeClass}">${this.aging}</span></td>
        <td class="num-col">Rs. ${Number(this.invoiced || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
        <td class="num-col">Rs. ${Number(this.paid || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
        <td class="num-col" style="color: ${color}; font-weight: 700;">Rs. ${due.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
      </tr>
    `;
  }
}

export class CustomerReceivableRowBuilder extends BaseTableRowBuilder {
  constructor(initialData = null) {
    super(initialData);
  }

  reset() {
    super.reset();
    this.customerCode = "";
    this.customerName = "";
    this.mobile = "—";
    this.registeredDate = "—";
    this.aging = "Cleared";
    this.invoiced = 0;
    this.paid = 0;
    return this;
  }

  fromData(data = {}) {
    if (!data || typeof data !== "object") return this;
    super.fromData(data);
    this.customerCode = data.customerCode || `#CUST-${String(data.id || 1).padStart(4, "0")}`;
    this.customerName = data.customerName || data.customer_name || data.name || "";
    this.mobile = data.mobile || "—";
    this.registeredDate = this.formatDate(data.registeredDate ?? data.register_at ?? data.last_invoice_date);
    this.invoiced = Number(data.invoiced ?? data.total_invoiced ?? 0);
    this.paid = Number(data.paid ?? data.amount_paid ?? 0);
    const balance = Number(data.outstanding_balance ?? (this.invoiced - this.paid));
    this.aging = data.aging || (balance > 0 ? (data.status || "1-30 Days") : "Cleared");
    return this;
  }

  build() {
    return new CustomerReceivableReportRow({
      customerCode: this.customerCode,
      customerName: this.customerName,
      mobile: this.mobile,
      registeredDate: this.registeredDate,
      aging: this.aging,
      invoiced: this.invoiced,
      paid: this.paid
    });
  }
}

export default CustomerReceivableRowBuilder;
