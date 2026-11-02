/**
 * SanjeewaAdvertising - Record Bill Payment Modal
 *
 * Handles settling Monthly Operating & Overhead Utility Bills (#modalRecordBillPayment).
 * Allows settling existing pending bills or recording direct monthly overhead payments.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class RecordBillPaymentModal extends BaseModalHandler {
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
    // Open triggers
    document.addEventListener("click", (e) => {
      const openBtn = e.target.closest("#btnOpenRecordBillPayment, [data-action='record-bill'], #btnOpenRecordBillPaymentTab");
      if (openBtn) {
        e.preventDefault();
        const prefillId = openBtn.getAttribute("data-bill-id") || null;
        this.openRecordBillPaymentModal(prefillId);
      }
    });

    // Pending Bill Select Change
    const billSelect = document.getElementById("billModalSelectExisting");
    if (billSelect) {
      billSelect.addEventListener("change", () => this.onPendingSelected());
    }

    // Confirm Save
    const confirmBtn = document.getElementById("btnConfirmSaveBillPayment");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => this.save());
    }
  }

  openRecordBillPaymentModal(billId = null) {
    const modal = document.getElementById("modalRecordBillPayment");
    if (!modal) return;

    this.populatePendingDropdown(billId);

    const dateInput = document.getElementById("billModalPaidDate");
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];

    const noteInput = document.getElementById("billModalPaidNotes");
    if (noteInput) noteInput.value = "";

    const refInput = document.getElementById("billModalPaidRef");
    if (refInput) refInput.value = "";

    this.openModal("modalRecordBillPayment");
  }

  populatePendingDropdown(selectedBillId = null) {
    const select = document.getElementById("billModalSelectExisting");
    if (!select) return;

    const expenses = this.ctx.getExpenses ? this.ctx.getExpenses() : [];
    const pendingBills = expenses.filter(b => b.status !== "Paid");

    let options = `<option value="">-- Select Pending Bill to Settle --</option>`;

    pendingBills.forEach(b => {
      const isSelected = selectedBillId === b.id;
      options += `<option value="${b.id}" data-type="existing" data-title="${b.title}" data-category="${b.category}" data-provider="${b.provider || ''}" data-account="${b.accountNo || ''}" data-month="${b.month}" data-amount="${b.amount}" ${isSelected ? 'selected' : ''}>
        ⚡ ${b.title} [${b.month}] - Rs. ${(Number(b.amount) || 0).toLocaleString()} (Due: ${b.dueDate || 'Month-End'})
      </option>`;
    });

    options += `<option value="DIRECT_NEW" ${selectedBillId === 'DIRECT_NEW' ? 'selected' : ''}>➕ Record Direct / Other Operating Bill Settlement...</option>`;

    select.innerHTML = options;
    this.onPendingSelected();
  }

  onPendingSelected() {
    const select = document.getElementById("billModalSelectExisting");
    const val = select ? select.value : "";
    const selectedOpt = select ? select.options[select.selectedIndex] : null;

    const infoBox = document.getElementById("billModalExistingInfoBox");
    const directBox = document.getElementById("billModalDirectFields");
    const amountInput = document.getElementById("billModalPaidAmount");
    const notesInput = document.getElementById("billModalPaidNotes");

    if (val === "DIRECT_NEW") {
      if (infoBox) infoBox.style.display = "none";
      if (directBox) directBox.style.display = "flex";
      if (amountInput) amountInput.value = "";
      if (notesInput) notesInput.value = "Direct operating overhead bill settlement";
    } else if (val && selectedOpt) {
      if (infoBox) infoBox.style.display = "block";
      if (directBox) directBox.style.display = "none";

      const title = selectedOpt.getAttribute("data-title") || "";
      const cat = selectedOpt.getAttribute("data-category") || "";
      const provider = selectedOpt.getAttribute("data-provider") || "";
      const account = selectedOpt.getAttribute("data-account") || "";
      const amount = Number(selectedOpt.getAttribute("data-amount")) || 0;

      const elTitle = document.getElementById("billModalInfoTitle");
      const elMeta = document.getElementById("billModalInfoMeta");
      const elDue = document.getElementById("billModalInfoDueAmount");
      const elBadge = document.getElementById("billModalInfoCatBadge");

      if (elTitle) elTitle.textContent = title;
      if (elMeta) elMeta.textContent = `Provider: ${provider || 'N/A'} • A/C: ${account || 'N/A'}`;
      if (elDue) elDue.textContent = `Rs. ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
      if (elBadge) {
        elBadge.textContent = cat;
        elBadge.className = "exp-badge exp-badge-pending";
      }

      if (amountInput) amountInput.value = amount;
      if (notesInput) notesInput.value = `Month-end bill settlement for ${title}`;
    } else {
      if (infoBox) infoBox.style.display = "none";
      if (directBox) directBox.style.display = "none";
      if (amountInput) amountInput.value = "";
    }
  }

  save() {
    const select = document.getElementById("billModalSelectExisting");
    const val = select ? select.value : "";
    const selectedOpt = select ? select.options[select.selectedIndex] : null;

    if (!val) {
      alert("Please select a pending bill to settle or choose to enter a direct bill settlement.");
      return;
    }

    const amountInput = document.getElementById("billModalPaidAmount");
    const paidAmount = parseFloat(amountInput ? amountInput.value : 0);

    if (isNaN(paidAmount) || paidAmount <= 0) {
      alert("Please enter a valid bill payment amount.");
      return;
    }

    const paidDate = document.getElementById("billModalPaidDate")?.value || new Date().toISOString().split("T")[0];
    const paidMethod = document.getElementById("billModalPaidMethod")?.value || "Bank Transfer";
    const paidRef = document.getElementById("billModalPaidRef")?.value.trim() || "";
    const paidNotes = document.getElementById("billModalPaidNotes")?.value.trim() || "";

    const expenses = this.ctx.getExpenses ? this.ctx.getExpenses() : [];

    if (val === "DIRECT_NEW") {
      const cat = document.getElementById("billModalDirectCategory")?.value || "Electricity";
      const month = document.getElementById("billModalDirectMonth")?.value || "2026-10";
      const title = document.getElementById("billModalDirectTitle")?.value.trim() || "Operating Utility Bill";
      const account = document.getElementById("billModalDirectAccount")?.value.trim() || "";

      const newBill = {
        id: `EXP-${month}-${Date.now().toString().slice(-4)}`,
        title,
        category: cat,
        provider: "Direct Overhead Vendor",
        accountNo: account || "DIRECT-SETTLED",
        month,
        dueDate: paidDate,
        amount: paidAmount,
        status: "Paid",
        paidDate,
        paidAmount,
        paidMethod,
        paidRef: paidRef || "DIRECT-PAY",
        paidNote: paidNotes || "Direct month-end overhead expense"
      };

      expenses.unshift(newBill);
      if (this.ctx.saveExpenses) this.ctx.saveExpenses();

      this.closeModal("modalRecordBillPayment");
      if (this.ctx.render) this.ctx.render();

      this.showToast(`Operating expense "${title}" (Rs. ${paidAmount.toLocaleString()}) recorded as PAID!`);
    } else {
      const bill = expenses.find(b => b.id === val);
      if (!bill) {
        alert("Selected bill could not be found.");
        return;
      }

      bill.status = "Paid";
      bill.paidDate = paidDate;
      bill.paidAmount = paidAmount;
      bill.paidMethod = paidMethod;
      bill.paidRef = paidRef;
      bill.paidNote = paidNotes;

      if (this.ctx.saveExpenses) this.ctx.saveExpenses();

      this.closeModal("modalRecordBillPayment");
      if (this.ctx.render) this.ctx.render();

      this.showToast(`Bill "${bill.title}" (Rs. ${paidAmount.toLocaleString()}) marked as PAID!`);
    }
  }
}
