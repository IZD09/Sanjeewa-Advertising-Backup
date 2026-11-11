/**
 * SanjeewaAdvertising - Supplier & GRN Row Builder
 *
 * Extends Core BaseTableRowBuilder for `#suppliersTable`.
 */

import { BaseTableRowBuilder } from "../../../../core/BaseTableRowBuilder.js";

export class SupplierGrnReportRow {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  render() {
    const payable = Math.max(0, Number(this.purchases || 0) - Number(this.paid || 0));
    const color = payable > 0 ? "#dc2626" : "#059669";

    return `
      <tr>
        <td><strong>${this.supplierCode}</strong></td>
        <td><strong>${this.supplierName}</strong></td>
        <td>${this.mobile}</td>
        <td>${this.email}</td>
        <td class="num-col">Rs. ${Number(this.purchases || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
        <td class="num-col">Rs. ${Number(this.paid || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
        <td class="num-col" style="color: ${color}; font-weight: 700;">Rs. ${payable.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
      </tr>
    `;
  }
}

export class SupplierGrnRowBuilder extends BaseTableRowBuilder {
  constructor(initialData = null) {
    super(initialData);
  }

  reset() {
    super.reset();
    this.supplierCode = "";
    this.supplierName = "";
    this.mobile = "—";
    this.email = "—";
    this.purchases = 0;
    this.paid = 0;
    return this;
  }

  fromData(data = {}) {
    if (!data || typeof data !== "object") return this;
    super.fromData(data);
    this.supplierCode = data.supplierCode || `#SUP-${String(data.id || 1).padStart(3, "0")}`;
    this.supplierName = data.supplierName || data.supplier_name || data.name || "";
    this.mobile = data.mobile || "—";
    this.email = data.email || "—";
    this.purchases = Number(data.purchases ?? data.total_purchases ?? 0);
    this.paid = Number(data.paid ?? data.amount_paid ?? 0);
    return this;
  }

  build() {
    return new SupplierGrnReportRow({
      supplierCode: this.supplierCode,
      supplierName: this.supplierName,
      mobile: this.mobile,
      email: this.email,
      purchases: this.purchases,
      paid: this.paid
    });
  }
}

export default SupplierGrnRowBuilder;
