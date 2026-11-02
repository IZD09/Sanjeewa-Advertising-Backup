/**
 * SanjeewaAdvertising - Operating Expense Row Builder
 *
 * Implements Builder Pattern (GoF) extending Core BaseTableRowBuilder:
 * - OperatingExpenseRowBuilder: Fluent builder class for operating expense table rows.
 * - OperatingExpenseEntity: Entity model providing table row HTML rendering.
 */

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";

/**
 * OperatingExpenseEntity - Constructed Operating Expense Entity Model
 */
export class OperatingExpenseEntity {
  constructor(data = {}) {
    this.id = data.id || `EXP-${Date.now()}`;
    this.title = data.title || "Operating Bill";
    this.category = data.category || "Other";
    this.provider = data.provider || "-";
    this.accountNo = data.accountNo || data.account_no || "-";
    this.month = data.month || "2026-10";
    this.dueDate = data.dueDate || data.due_date || "-";
    this.amount = Number(data.amount !== undefined ? data.amount : 0);
    this.status = data.status || "Pending";
    this.paidDate = data.paidDate || data.paid_date || "";
    this.paidAmount = data.paidAmount !== undefined ? Number(data.paidAmount) : (data.paid_amount !== undefined ? Number(data.paid_amount) : (this.status === "Paid" ? this.amount : 0));
    this.paidMethod = data.paidMethod || data.paid_method || "";
    this.paidRef = data.paidRef || data.paid_ref || "";
    this.paidNote = data.paidNote || data.paid_note || "";
    this.notes = data.notes || "";
  }

  getCategoryIconAndClass() {
    let icon = "fa-receipt";
    let catClass = "other";
    if (this.category === "Electricity") {
      icon = "fa-bolt-lightning";
      catClass = "elec";
    } else if (this.category === "Water Board") {
      icon = "fa-droplet";
      catClass = "water";
    } else if (this.category === "Internet & Fiber") {
      icon = "fa-wifi";
      catClass = "internet";
    } else if (this.category === "Shop Rent") {
      icon = "fa-building";
      catClass = "rent";
    } else if (this.category === "Mobile & Telephone") {
      icon = "fa-phone";
      catClass = "internet";
    } else if (this.category === "Maintenance & Other") {
      icon = "fa-wrench";
      catClass = "other";
    }
    return { icon, catClass };
  }

  getStatusBadge() {
    const isPaid = this.status === "Paid";
    const isOverdue = !isPaid && this.dueDate && (new Date(this.dueDate) < new Date());

    if (isPaid) {
      return `<span class="exp-badge exp-badge-paid"><i class="fa-solid fa-circle-check"></i> Paid (ගෙවා අවසන්)</span>`;
    } else if (isOverdue) {
      return `<span class="exp-badge exp-badge-overdue"><i class="fa-solid fa-triangle-exclamation"></i> Overdue (කල් ඉකුත් වූ)</span>`;
    } else {
      return `<span class="exp-badge exp-badge-pending"><i class="fa-solid fa-clock"></i> Pending (ගෙවීමට ඇති)</span>`;
    }
  }

  formatCurrency(val) {
    return `Rs. ${(Number(val) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
  }

  /**
   * Render table row element (<tr>) for Operating Expenses Table
   * @returns {HTMLTableRowElement|string}
   */
  render() {
    const { icon: catIcon, catClass } = this.getCategoryIconAndClass();
    const isPaid = this.status === "Paid";
    const isOverdue = !isPaid && this.dueDate && (new Date(this.dueDate) < new Date());
    const statusBadge = this.getStatusBadge();

    let settlementInfo = "";
    if (isPaid) {
      settlementInfo = `
        <div style="font-size: 11.5px; font-weight: 700; color: #10b981;">
          <i class="fa-solid fa-circle-check"></i> Settled (${this.formatCurrency(this.paidAmount || this.amount)})
        </div>
        <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 2px;">
          ${this.paidDate || 'Paid'} ${this.paidMethod ? `via ${this.paidMethod}` : ''}
        </div>
        ${this.paidRef ? `<div style="font-size: 10.5px; color: var(--text-muted); font-family: ui-monospace, SFMono-Regular, Menlo, monospace;">Ref: ${this.paidRef}</div>` : ''}
      `;
    } else if (isOverdue) {
      settlementInfo = `
        <div style="font-size: 11.5px; font-weight: 700; color: #ef4444;">
          <i class="fa-solid fa-triangle-exclamation"></i> Overdue Settlement
        </div>
        <div style="font-size: 10.5px; color: var(--text-muted);">
          Due date elapsed on ${this.dueDate || 'month-end'}
        </div>
      `;
    } else {
      settlementInfo = `
        <div style="font-size: 12px; font-weight: 700; color: #ef4444;">
          <i class="fa-solid fa-hourglass-start"></i> Month-End Payable
        </div>
        <div style="font-size: 11px; color: var(--text-muted);">
          Settlement pending by ${this.dueDate || 'month-end'}
        </div>
      `;
    }

    const html = `
      <td>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="exp-cat-icon ${catClass}">
            <i class="fa-solid ${catIcon}"></i>
          </div>
          <div>
            <div style="font-weight: 800; color: var(--text); font-size: 13.5px;">${this.title}</div>
            <div style="font-size: 11px; color: var(--text-muted);">
              <span style="font-weight: 600; color: #f59e0b;">${this.category}</span>
              ${this.provider ? ` • ${this.provider}` : ''}
            </div>
            ${this.notes ? `<div style="font-size: 10.5px; color: var(--text-muted); margin-top: 2px;">${this.notes}</div>` : ''}
          </div>
        </div>
      </td>
      <td>
        <div style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; font-weight: 700; color: var(--text);">
          ${this.accountNo || '-'}
        </div>
        <div style="font-size: 10.5px; color: var(--text-muted);">${this.id}</div>
      </td>
      <td>
        <span style="font-weight: 700; font-size: 12.5px; color: var(--text);">${this.month || '-'}</span>
      </td>
      <td>
        <span style="font-size: 12px; font-weight: ${isOverdue ? '800' : '600'}; color: ${isOverdue ? '#ef4444' : 'var(--text)'};">
          ${this.dueDate || '-'}
        </span>
      </td>
      <td style="font-weight: 800; font-size: 14px; color: ${isPaid ? '#10b981' : '#ef4444'};">
        ${this.formatCurrency(this.amount)}
      </td>
      <td>
        ${statusBadge}
      </td>
      <td>
        ${settlementInfo}
      </td>
      <td style="text-align: right;">
        <div style="display: inline-flex; align-items: center; justify-content: flex-end; gap: 6px;">
          ${!isPaid ? `
            <button type="button" class="btn-mark-paid" data-mark-paid-id="${this.id}" title="Mark this bill as Paid (බිල්පත ගෙවූ බව සටහන් කරන්න)">
              <i class="fa-solid fa-circle-check"></i> Mark as Paid
            </button>
          ` : `
            <button type="button" class="btn-undo-paid" data-undo-paid-id="${this.id}" title="Revert status back to Pending (නැවත Pending තත්ත්වයට)">
              <i class="fa-solid fa-rotate-left"></i> Revert
            </button>
          `}
        </div>
      </td>
    `;

    if (typeof document !== "undefined" && typeof document.createElement === "function") {
      const tr = document.createElement("tr");
      tr.id = `expenseRow_${this.id}`;
      tr.setAttribute("data-expense-id", this.id);
      tr.innerHTML = html;
      return tr;
    }

    return `<tr id="expenseRow_${this.id}" data-expense-id="${this.id}">${html}</tr>`;
  }

  renderTableRow() {
    return this.render();
  }
}

export const OperatingExpense = OperatingExpenseEntity;

/**
 * OperatingExpenseRowBuilder - Fluent Builder Class extending Core BaseTableRowBuilder
 */
export class OperatingExpenseRowBuilder extends BaseTableRowBuilder {
  constructor(initialData = null) {
    super(initialData);
  }

  build() {
    return new OperatingExpenseEntity(this._data);
  }

  static fromArray(list) {
    if (!Array.isArray(list)) return [];
    return list.map(item => new OperatingExpenseRowBuilder(item).build());
  }
}

export default OperatingExpenseRowBuilder;

