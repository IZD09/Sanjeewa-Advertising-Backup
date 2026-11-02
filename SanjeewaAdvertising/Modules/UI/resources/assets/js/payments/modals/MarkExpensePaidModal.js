/**
 * SanjeewaAdvertising - Mark Expense Paid Modal
 *
 * Handles quick settlement dialog for operating expense bills (#modalMarkExpensePaid).
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class MarkExpensePaidModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getExpenses
   * @param {Function} context.saveExpenses
   * @param {Function} context.render
   */
  constructor(context) {
    super({
      activeModalClass: "open",
      overlaySelector: ".pay-modal-backdrop",
      toastContainerId: "poToastContainer",
      closeSelectors: [".pay-modal-close", "[data-close-pay-modal]"],
      autoBind: true
    });

    this.ctx = context;

    this.bindEvents();
  }

  bindEvents() {
    const confirmBtn = document.getElementById("btnConfirmMarkExpensePaid");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => this.confirm());
    }
  }

  openMarkExpensePaidModal(billId) {
    const expenses = this.ctx.getExpenses ? this.ctx.getExpenses() : [];
    const bill = expenses.find(b => b.id === billId);
    if (!bill) return;

    const elId = document.getElementById("markExpBillId");
    const elTitle = document.getElementById("markExpTitleDisplay");
    const elAccount = document.getElementById("markExpAccountDisplay");
    const elAmount = document.getElementById("markExpAmountDisplay");
    const elPaidDate = document.getElementById("markExpPaidDate");
    const elPaidAmount = document.getElementById("markExpPaidAmount");
    const elPaidMethod = document.getElementById("markExpPaidMethod");
    const elPaidRef = document.getElementById("markExpPaidRef");
    const elPaidNote = document.getElementById("markExpPaidNote");

    if (elId) elId.value = bill.id;
    if (elTitle) elTitle.textContent = `${bill.title} (${bill.category})`;
    if (elAccount) elAccount.textContent = `A/C: ${bill.accountNo || "N/A"} • Provider: ${bill.provider || "N/A"}`;
    if (elAmount) elAmount.textContent = `Rs. ${(Number(bill.amount) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

    const todayStr = new Date().toISOString().split("T")[0];
    if (elPaidDate) elPaidDate.value = todayStr;
    if (elPaidAmount) elPaidAmount.value = bill.amount;
    if (elPaidMethod) elPaidMethod.value = "Bank Transfer";
    if (elPaidRef) elPaidRef.value = "";
    if (elPaidNote) elPaidNote.value = `Month-end bill settlement (${bill.month})`;

    this.openModal("modalMarkExpensePaid");
  }

  confirm() {
    const billId = document.getElementById("markExpBillId")?.value;
    const expenses = this.ctx.getExpenses ? this.ctx.getExpenses() : [];
    const bill = expenses.find(b => b.id === billId);
    if (!bill) return;

    const paidDate = document.getElementById("markExpPaidDate")?.value || new Date().toISOString().split("T")[0];
    const paidAmount = parseFloat(document.getElementById("markExpPaidAmount")?.value) || bill.amount;
    const paidMethod = document.getElementById("markExpPaidMethod")?.value || "Bank Transfer";
    const paidRef = document.getElementById("markExpPaidRef")?.value.trim() || "";
    const paidNote = document.getElementById("markExpPaidNote")?.value.trim() || "";

    bill.status = "Paid";
    bill.paidDate = paidDate;
    bill.paidAmount = paidAmount;
    bill.paidMethod = paidMethod;
    bill.paidRef = paidRef;
    bill.paidNote = paidNote;

    if (this.ctx.saveExpenses) this.ctx.saveExpenses();

    this.closeModal("modalMarkExpensePaid");
    if (this.ctx.render) this.ctx.render();

    this.showToast(`Bill "${bill.title}" marked as PAID (Rs. ${paidAmount.toLocaleString()})! Status updated.`);
  }

  undo(billId) {
    const expenses = this.ctx.getExpenses ? this.ctx.getExpenses() : [];
    const bill = expenses.find(b => b.id === billId);
    if (!bill) return;

    if (confirm(`Do you want to revert "${bill.title}" status back to Pending (මාසෙ අන්තිමට ගෙවීමට ඇති)?`)) {
      bill.status = "Pending";
      delete bill.paidDate;
      delete bill.paidAmount;
      delete bill.paidMethod;
      delete bill.paidRef;
      delete bill.paidNote;

      if (this.ctx.saveExpenses) this.ctx.saveExpenses();
      if (this.ctx.render) this.ctx.render();

      this.showToast(`Bill "${bill.title}" status reverted to PENDING.`);
    }
  }
}
