/**
 * SanjeewaAdvertising - Mark Expense Paid Modal
 *
 * Handles quick settlement dialog for operating expense bills (#modalMarkExpensePaid).
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";
import { RequestHandler } from "../../core/RequestHandler.js";

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
    this.http = new RequestHandler();
    this._isSubmitting = false;

    this.bindEvents();
  }

  bindEvents() {
    if (!document._boundMarkExpensePaidEvents) {
      document._boundMarkExpensePaidEvents = true;
      document.addEventListener("click", (e) => {
        if (e.target.closest("#btnConfirmMarkExpensePaid")) {
          e.preventDefault();
          const inst = window.paymentsManager?.modalHandler?.markExpensePaidModal || this;
          inst.confirm();
        } else if (e.target.closest("#btnConfirmExpenseRevert")) {
          e.preventDefault();
          const inst = window.paymentsManager?.modalHandler?.markExpensePaidModal || this;
          inst.confirmRevert();
        }
      });
    }
  }

  findBillById(billId) {
    const expenses = this.ctx.getExpenses ? this.ctx.getExpenses() : [];
    return expenses.find(b => String(b.id) === String(billId)) || null;
  }

  getNumericExpenseId(bill) {
    const raw = bill?.raw_id ?? bill?.id;
    const numericId = parseInt(String(raw ?? "").replace(/[^0-9]/g, ""), 10);
    return numericId && !isNaN(numericId) ? numericId : null;
  }

  openMarkExpensePaidModal(billId) {
    const bill = this.findBillById(billId);
    if (!bill) return;

    const elId = document.getElementById("markExpBillId");
    const elTitle = document.getElementById("markExpTitleDisplay");
    const elAccount = document.getElementById("markExpAccountDisplay");
    const elAmount = document.getElementById("markExpAmountDisplay");
    const elPaidDate = document.getElementById("markExpPaidDate");
    const elPaidAmount = document.getElementById("markExpPaidAmount");
    const elPaidRef = document.getElementById("markExpPaidRef");
    const elPaidNote = document.getElementById("markExpPaidNote");

    if (elId) elId.value = bill.id;
    if (elTitle) elTitle.textContent = `${bill.title} (${bill.category})`;
    if (elAccount) elAccount.textContent = `A/C: ${bill.accountNo || "N/A"} • Provider: ${bill.provider || "N/A"}`;
    if (elAmount) elAmount.textContent = `Rs. ${(Number(bill.amount) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

    const todayStr = new Date().toISOString().split("T")[0];
    if (elPaidDate) elPaidDate.value = todayStr;
    if (elPaidAmount) elPaidAmount.value = bill.amount;
    if (elPaidRef) elPaidRef.value = bill.paidRef && bill.paidRef !== "TXN-AUTO" ? bill.paidRef : "";
    if (elPaidNote) elPaidNote.value = bill.paidNote || `Month-end bill settlement (${bill.month})`;

    const errBanner = document.getElementById("markExpErrorBanner");
    if (errBanner) {
      errBanner.style.display = "none";
      errBanner.textContent = "";
    }

    this.openModal("modalMarkExpensePaid");
  }

  async confirm() {
    if (this._isSubmitting) return;

    const billId = document.getElementById("markExpBillId")?.value;
    const bill = this.findBillById(billId);
    if (!bill) return;

    const paidDate = document.getElementById("markExpPaidDate")?.value || new Date().toISOString().split("T")[0];
    const paidAmount = parseFloat(document.getElementById("markExpPaidAmount")?.value);
    const paidRef = document.getElementById("markExpPaidRef")?.value.trim() || "";
    const paidNote = document.getElementById("markExpPaidNote")?.value.trim() || "";

    if (isNaN(paidAmount) || paidAmount <= 0) {
      this.showToast("Please enter a valid Paid Amount greater than 0.", "error");
      return;
    }

    if (paidRef.length > 50) {
      this.showToast("Transaction Reference # cannot exceed 50 characters.", "error");
      return;
    }

    if (paidNote.length > 255) {
      this.showToast("Settlement Note cannot exceed 255 characters.", "error");
      return;
    }

    const errBanner = document.getElementById("markExpErrorBanner");
    if (errBanner) {
      errBanner.style.display = "none";
      errBanner.textContent = "";
    }

    const confirmBtn = document.getElementById("btnConfirmMarkExpensePaid");
    const originalHtml = confirmBtn ? confirmBtn.innerHTML : "";
    this._isSubmitting = true;
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing...`;
    }

    try {
      const numericId = this.getNumericExpenseId(bill);
      if (numericId) {
        const response = await this.http.put(`/api/v1/expenses/${numericId}`, {
          expencesess_statuses_id: 3, // Paid
          price: paidAmount,
          pay_at: `${paidDate} 12:00:00`,
          reference: paidRef || null,
          settlement_note: paidNote || null
        });
        const updated = response?.data || response;
        if (updated && updated.reference !== undefined) {
          bill.paidRef = updated.reference || paidRef;
        } else {
          bill.paidRef = paidRef;
        }
        if (updated && updated.settlement_note !== undefined) {
          bill.paidNote = updated.settlement_note || paidNote;
          bill.notes = updated.settlement_note || paidNote;
        } else {
          bill.paidNote = paidNote;
          bill.notes = paidNote;
        }
      } else {
        bill.paidRef = paidRef;
        bill.paidNote = paidNote;
        bill.notes = paidNote;
      }

      bill.status = "Paid";
      bill.amount = paidAmount;
      bill.paidDate = paidDate;
      bill.paidAmount = paidAmount;

      if (this.ctx.saveExpenses) this.ctx.saveExpenses();

      this.closeModal("modalMarkExpensePaid");
      if (this.ctx.render) this.ctx.render();

      this.showToast(`Bill "${bill.title}" marked as PAID (Rs. ${paidAmount.toLocaleString()})!`, "success");
    } catch (err) {
      console.error("[MarkExpensePaidModal] Mark Paid error:", err);
      const errMsg = err?.data?.message || err?.message || "Failed to mark bill as Paid.";
      if (errBanner) {
        errBanner.textContent = errMsg;
        errBanner.style.display = "block";
      }
      this.showToast(errMsg, "error");
    } finally {
      this._isSubmitting = false;
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = originalHtml;
      }
    }
  }

  undo(billId) {
    const bill = this.findBillById(billId);
    if (!bill) return;

    const idInput = document.getElementById("expConfirmBillId");
    const titleEl = document.getElementById("expConfirmBillTitle");
    if (idInput) idInput.value = String(bill.id);
    if (titleEl) titleEl.textContent = `"${bill.title || "this bill"}"`;

    this.openModal("expenseActionConfirmModal");
  }

  async confirmRevert() {
    if (this._isSubmitting) return;

    const billId = document.getElementById("expConfirmBillId")?.value;
    const bill = this.findBillById(billId);
    if (!bill) return;

    const revertBtn = document.getElementById("btnConfirmExpenseRevert");
    const originalHtml = revertBtn ? revertBtn.innerHTML : "";
    this._isSubmitting = true;
    if (revertBtn) {
      revertBtn.disabled = true;
      revertBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Reverting...`;
    }

    try {
      const numericId = this.getNumericExpenseId(bill);
      if (numericId) {
        await this.http.put(`/api/v1/expenses/${numericId}`, {
          expencesess_statuses_id: 1, // Pending
          pay_at: null,
          pay_by: null,
          reference: null,
          settlement_note: null
        });
      }

      bill.status = "Pending";
      bill.paidAmount = 0;
      delete bill.paidDate;
      delete bill.paidMethod;
      delete bill.paidRef;
      delete bill.paidNote;

      if (this.ctx.saveExpenses) this.ctx.saveExpenses();

      this.closeModal("expenseActionConfirmModal");
      if (this.ctx.render) this.ctx.render();

      this.showToast(`Bill "${bill.title}" status reverted to PENDING.`, "info");
    } catch (err) {
      console.error("[MarkExpensePaidModal] Revert error:", err);
      this.showToast(err?.message || "Failed to revert bill status.", "error");
    } finally {
      this._isSubmitting = false;
      if (revertBtn) {
        revertBtn.disabled = false;
        revertBtn.innerHTML = originalHtml;
      }
    }
  }
}
