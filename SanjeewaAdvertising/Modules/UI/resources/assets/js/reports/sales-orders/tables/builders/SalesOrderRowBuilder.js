/**
 * SanjeewaAdvertising - Sales Order Report Row Builder
 *
 * Extends Core BaseTableRowBuilder (matching PrintingOrderBuilder in place-order).
 */

import { BaseTableRowBuilder } from "../../../../core/BaseTableRowBuilder.js";

export class SalesOrderReportRow {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  render() {
    const badgeClass = this.status === "Completed"
      ? "badge-paid"
      : (this.status === "Printing" ? "badge-info" : "badge-pending");
    const totalFormatted = `Rs. ${Number(this.totalAmount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

    return `
      <tr>
        <td><strong>${this.orderCode}</strong></td>
        <td>${this.customerName}</td>
        <td>${this.mobile}</td>
        <td><span class="rep-badge badge-info">${this.printCategory}</span></td>
        <td class="num-col">${Number(this.quantity || 1).toLocaleString("en-LK")} pcs</td>
        <td>${this.orderDate}</td>
        <td><span class="rep-badge ${badgeClass}">${this.status}</span></td>
        <td class="num-col">${totalFormatted}</td>
      </tr>
    `;
  }
}

export class SalesOrderRowBuilder extends BaseTableRowBuilder {
  constructor(initialData = null) {
    super(initialData);
  }

  reset() {
    super.reset();
    this.orderCode = "";
    this.customerName = "Walk-in Customer";
    this.mobile = "—";
    this.printCategory = "Custom Print";
    this.quantity = 1;
    this.orderDate = "";
    this.status = "Completed";
    this.totalAmount = 0;
    return this;
  }

  fromData(data = {}) {
    if (!data || typeof data !== "object") return this;
    super.fromData(data);
    this.orderCode = data.orderCode || `#PJ-${String(data.id || 1).padStart(4, "0")}`;
    this.customerName = data.customerName || data.customer_name || "Walk-in Customer";
    this.mobile = data.mobile || "—";
    this.printCategory = data.printCategory || data.print_type || "Custom Print";
    this.quantity = Number(data.quantity ?? data.qty ?? 1);
    this.orderDate = this.formatDate(data.orderDate ?? data.add_date);
    this.status = data.status || "Completed";
    this.totalAmount = Number(data.totalAmount ?? (this.quantity * 650));
    return this;
  }

  build() {
    return new SalesOrderReportRow({
      orderCode: this.orderCode,
      customerName: this.customerName,
      mobile: this.mobile,
      printCategory: this.printCategory,
      quantity: this.quantity,
      orderDate: this.orderDate,
      status: this.status,
      totalAmount: this.totalAmount
    });
  }
}

export default SalesOrderRowBuilder;
