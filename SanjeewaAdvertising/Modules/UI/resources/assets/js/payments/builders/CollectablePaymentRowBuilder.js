/**
 * SanjeewaAdvertising - Collectable Payment Row Builder
 *
 * Implements Builder Pattern (GoF) extending Core BaseTableRowBuilder:
 * - CollectablePaymentEntity: Encapsulates pending/partial customer job/invoice data and renders <tr>.
 * - CollectablePaymentRowBuilder: Fluent builder class for collectable payment rows.
 */

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";
import { StatusHelper } from "../../core/StatusHelper.js";

/**
 * CollectablePaymentEntity - Entity model for a collectable customer job/invoice payment
 */
export class CollectablePaymentEntity {
  constructor(data = {}) {
    this.rawId = data.rawId ?? data.jobId ?? data.id ?? "";
    this.formattedId = data.formattedId || data.orderId || (this.rawId ? `ORD-2026-${1000 + Number(this.rawId)}` : "JOB-0000");
    this.customerName = data.customerName || data.customer_name || "Customer";
    this.customerMobile = data.customerMobile || data.customer_mobile || "";
    this.productName = data.productName || data.product_name || "Print Job";
    this.productionStatus = data.status || data.production_status || "";
    this.qty = Number(data.qty || 1);
    this.width = data.width ?? "";
    this.height = data.height ?? "";
    this.unit = data.unit || "ft";
    this.addDate = data.addDate || data.add_date || data.orderDate || "-";

    this.totalAmount = Number(data.totalAmount ?? data.total_amount ?? data.totalBill ?? 0);
    this.paidAmount = Number(data.paidAmount ?? data.paid_amount ?? 0);
    this.balanceAmount = Number(
      data.balanceAmount !== undefined
        ? data.balanceAmount
        : (data.balance_amount !== undefined ? data.balance_amount : Math.max(0, this.totalAmount - this.paidAmount))
    );

    const rawStatus = String(this.productionStatus || "").toLowerCase();
    if (this.balanceAmount <= 0 || rawStatus === "paid") {
      this.stage = "Complete Payment";
      this.status = "Paid";
    } else if (this.paidAmount > 0 || rawStatus === "partial") {
      this.stage = "Advance Payment";
      this.status = "Partial";
    } else {
      this.stage = "Pending Payment";
      this.status = "Pending";
    }
  }

  formatCurrency(val) {
    return `Rs. ${(Number(val) || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  renderStageBadge() {
    if (this.stage === "Complete Payment") {
      return `<span class="status-pill complete"><i class="fa-solid fa-circle-check"></i> Complete Payment</span>`;
    }
    if (this.stage === "Advance Payment") {
      return `<span class="status-pill advance"><i class="fa-solid fa-hourglass-half"></i> Partial / Advance</span>`;
    }
    return `<span class="status-pill pending"><i class="fa-solid fa-clock"></i> Pending Collection</span>`;
  }

  getStageRowClass() {
    const fromHelper = StatusHelper.getPaymentStageRowClass(this.stage);
    if (fromHelper) return fromHelper;

    if (this.stage === "Complete Payment") {
      return "row-stage-complete row-status-completed";
    }
    if (this.stage === "Advance Payment") {
      return "row-stage-advance row-status-approved";
    }
    return "row-stage-pending row-status-pending";
  }

  render() {
    const tr = document.createElement("tr");
    tr.id = `payCollectionRow_${this.rawId}`;

    const stageRowClass = this.getStageRowClass();
    if (stageRowClass) {
      tr.className = stageRowClass;
    }

    const sizeStr = (this.width && this.height) ? `${this.width} × ${this.height} ${this.unit}` : "";
    const metaParts = [];
    if (sizeStr) metaParts.push(sizeStr);
    if (this.qty > 0) metaParts.push(`Qty: ${this.qty}`);
    const specLine = metaParts.join(" · ");

    const paidPct = this.totalAmount > 0
      ? Math.min(100, Math.round((this.paidAmount / this.totalAmount) * 100))
      : 0;

    const prodBadge = this.productionStatus && this.productionStatus !== "Pending"
      ? `<span style="display: inline-block; font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 4px; background: rgba(59, 130, 246, 0.1); color: #2563eb; border: 1px solid rgba(59, 130, 246, 0.2); margin-left: 6px;">${this.productionStatus}</span>`
      : "";

    tr.innerHTML = `
      <td>
        <a href="javascript:void(0)" data-view-order="${this.rawId}" style="color: #2563eb; font-size: 13px; font-weight: 700; text-decoration: none;" title="View Order Details for ${this.formattedId}">
          ${this.formattedId}
        </a>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
          <i class="fa-regular fa-calendar" style="margin-right: 4px;"></i>${this.addDate}
        </div>
      </td>
      <td>
        <strong style="color: var(--text); font-size: 13px;">${this.customerName}</strong>
        ${this.customerMobile ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;"><a href="tel:${this.customerMobile}" style="color: inherit; text-decoration: none;"><i class="fa-solid fa-phone" style="margin-right: 4px; color: var(--text-muted);"></i>${this.customerMobile}</a></div>` : ""}
      </td>
      <td>
        <div style="font-weight: 600; color: var(--text); display: flex; align-items: center; flex-wrap: wrap;">
          ${this.productName}
          ${prodBadge}
        </div>
        ${specLine ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;"><span style="display: inline-block; background: var(--surface-2, #f1f5f9); padding: 1px 6px; border-radius: 4px; border: 1px solid var(--border);">${specLine}</span></div>` : ""}
      </td>
      <td>${this.renderStageBadge()}</td>
      <td style="font-weight: 700;">${this.formatCurrency(this.totalAmount)}</td>
      <td style="font-weight: 700; color: #10b981;">
        ${this.formatCurrency(this.paidAmount)}
        <div style="font-size: 10px; color: var(--text-muted); font-weight: 500;">${paidPct}% collected</div>
      </td>
      <td style="font-weight: 800; color: #ef4444; font-size: 13px;">${this.formatCurrency(this.balanceAmount)}</td>
      <td style="text-align: right;">
        <div class="pay-table-actions" style="justify-content: flex-end; gap: 6px;">
          <button type="button" class="pay-btn-sm green-sm" data-open-pay-modal data-pay-type="invoice" data-pay-ref="${this.rawId}" title="Collect Payment for ${this.formattedId}">
            <i class="fa-solid fa-hand-holding-dollar"></i> Collect
          </button>
          <button type="button" class="pay-btn-sm" data-view-order="${this.rawId}" title="View Order Details for ${this.formattedId}">
            <i class="fa-solid fa-eye"></i> View
          </button>
        </div>
      </td>
    `;

    return tr;
  }
}

/**
 * CollectablePaymentRowBuilder - Fluent builder for Collectable Payment rows
 */
export class CollectablePaymentRowBuilder extends BaseTableRowBuilder {
  constructor(data = {}) {
    super();
    this._data = { ...data };
  }

  build() {
    return new CollectablePaymentEntity(this._data);
  }
}

export default CollectablePaymentRowBuilder;
