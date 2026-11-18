/**
 * SanjeewaAdvertising - Customer Receivable Row Builder
 *
 * Extends Core BaseTableRowBuilder for `#receivablesTable`.
 */

import { BaseTableRowBuilder } from "../../../../core/BaseTableRowBuilder.js";
import { StatusHelper } from "../../../../core/StatusHelper.js";

export class CustomerReceivableReportRow {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  render() {
    const invoiced = Number(this.invoiced || 0);
    const paid = Number(this.paid || 0);
    const due = Math.max(0, invoiced - paid);

    let paymentStatus = this.status || "";
    if (!paymentStatus) {
      if (invoiced <= 0 && paid <= 0) {
        paymentStatus = "No Orders";
      } else if (due <= 0) {
        paymentStatus = "Paid";
      } else if (paid > 0) {
        paymentStatus = "Partial";
      } else {
        paymentStatus = "Pending";
      }
    }

    const rowClass = StatusHelper.getPaymentStageRowClass(paymentStatus);

    let badgeClass = "badge-neutral";
    if (paymentStatus === "Paid" || paymentStatus === "Settled" || paymentStatus === "Cleared") {
      badgeClass = "badge-paid";
    } else if (paymentStatus === "Partial") {
      badgeClass = "badge-info";
    } else if (paymentStatus === "Overdue") {
      badgeClass = "badge-overdue";
    } else if (paymentStatus === "Pending") {
      badgeClass = "badge-pending";
    }

    const dueColor = due > 0 ? "#dc2626" : (invoiced > 0 || paid > 0 ? "#059669" : "var(--text-muted, #64748b)");
    const displayStatus = this.aging && this.aging !== paymentStatus && paymentStatus !== "Paid"
      ? `${paymentStatus} • ${this.aging}`
      : (paymentStatus === "Paid" ? "Paid (Cleared)" : paymentStatus);

    return `
      <tr class="${rowClass}">
        <td><strong>${this.customerCode}</strong></td>
        <td><strong>${this.customerName}</strong></td>
        <td>${this.mobile}</td>
        <td>${this.registeredDate}</td>
        <td><span class="rep-badge ${badgeClass}">${displayStatus}</span></td>
        <td class="num-col">Rs. ${invoiced.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td class="num-col">Rs. ${paid.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td class="num-col" style="color: ${dueColor}; font-weight: 700;">Rs. ${due.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
    this.status = "No Orders";
    this.aging = "No Orders";
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
    const balance = Number(data.outstanding_balance ?? Math.max(0, this.invoiced - this.paid));

    if (data.status) {
      this.status = data.status;
    } else if (this.invoiced <= 0 && this.paid <= 0) {
      this.status = "No Orders";
    } else if (balance <= 0) {
      this.status = "Paid";
    } else if (this.paid > 0) {
      this.status = "Partial";
    } else {
      this.status = "Pending";
    }

    this.aging = data.aging || (balance > 0 ? this.status : (this.invoiced > 0 ? "Cleared" : "No Orders"));
    return this;
  }

  build() {
    return new CustomerReceivableReportRow({
      customerCode: this.customerCode,
      customerName: this.customerName,
      mobile: this.mobile,
      registeredDate: this.registeredDate,
      status: this.status,
      aging: this.aging,
      invoiced: this.invoiced,
      paid: this.paid
    });
  }
}

export default CustomerReceivableRowBuilder;
