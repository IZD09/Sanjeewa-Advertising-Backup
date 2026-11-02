/**
 * SanjeewaAdvertising - Add Expense Bill Modal
 *
 * Handles creating a new operating expense bill (#modalAddExpenseBill).
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class AddExpenseBillModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getExpenses
   * @param {Function} context.saveExpenses
   * @param {Function} context.render
   * @param {Function} [context.getCurrentMonth]
   * @param {Function} [context.setCurrentMonth]
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
    // Open trigger
    document.addEventListener("click", (e) => {
      const openBtn = e.target.closest("#btnOpenAddExpenseModal");
      if (openBtn) {
        e.preventDefault();
        this.openAddExpenseBillModal();
      }
    });

    // Save Button
    const saveBtn = document.getElementById("btnSaveExpenseBill");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.save());
    }
  }

  openAddExpenseBillModal() {
    const modal = document.getElementById("modalAddExpenseBill");
    if (!modal) return;

    const currentMonth = this.ctx.getCurrentMonth ? this.ctx.getCurrentMonth() : "2026-10";
    const monthInput = document.getElementById("modalExpMonth");
    if (monthInput) {
      monthInput.value = (currentMonth && currentMonth !== "ALL") ? currentMonth : "2026-10";
    }

    const dueDateInput = document.getElementById("modalExpDueDate");
    if (dueDateInput) {
      const ym = monthInput ? monthInput.value : "2026-10";
      const [year, month] = ym.split("-");
      const lastDay = new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate();
      dueDateInput.value = `${ym}-${String(lastDay).padStart(2, "0")}`;
    }

    const titleInput = document.getElementById("modalExpTitle");
    const providerInput = document.getElementById("modalExpProvider");
    const accountInput = document.getElementById("modalExpAccountNo");
    const amountInput = document.getElementById("modalExpAmount");
    const notesInput = document.getElementById("modalExpNotes");

    if (titleInput) titleInput.value = "";
    if (providerInput) providerInput.value = "";
    if (accountInput) accountInput.value = "";
    if (amountInput) amountInput.value = "";
    if (notesInput) notesInput.value = "";

    this.openModal("modalAddExpenseBill");
  }

  save() {
    const category = document.getElementById("modalExpCategory")?.value;
    const month = document.getElementById("modalExpMonth")?.value;
    const title = document.getElementById("modalExpTitle")?.value.trim();
    const provider = document.getElementById("modalExpProvider")?.value.trim();
    const accountNo = document.getElementById("modalExpAccountNo")?.value.trim();
    const dueDate = document.getElementById("modalExpDueDate")?.value;
    const amountStr = document.getElementById("modalExpAmount")?.value;
    const initialStatus = document.getElementById("modalExpInitialStatus")?.value || "Pending";
    const notes = document.getElementById("modalExpNotes")?.value.trim();

    if (!title) {
      alert("Please enter a Bill / Service Title (බිල්පතේ නම ඇතුලත් කරන්න).");
      return;
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid bill amount greater than 0 (වලංගු මුදලක් ඇතුලත් කරන්න).");
      return;
    }

    const newBill = {
      id: `EXP-${month || "2026-10"}-${Date.now().toString().slice(-4)}`,
      title,
      category: category || "Electricity",
      provider: provider || "",
      accountNo: accountNo || "",
      month: month || "2026-10",
      dueDate: dueDate || "",
      amount,
      status: initialStatus,
      notes: notes || ""
    };

    if (initialStatus === "Paid") {
      newBill.paidDate = new Date().toISOString().split("T")[0];
      newBill.paidAmount = amount;
      newBill.paidMethod = "Bank Transfer";
      newBill.paidRef = "DIRECT-ENTRY";
    }

    const expenses = this.ctx.getExpenses ? this.ctx.getExpenses() : [];
    expenses.unshift(newBill);
    if (this.ctx.saveExpenses) this.ctx.saveExpenses();

    if (month && this.ctx.setCurrentMonth) {
      this.ctx.setCurrentMonth(month);
    }

    this.closeModal("modalAddExpenseBill");
    if (this.ctx.render) this.ctx.render();

    this.showToast(`Operating expense "${title}" (Rs. ${amount.toLocaleString()}) saved successfully!`);
  }
}
