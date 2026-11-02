/**
 * SanjeewaAdvertising - Record GRN Payment Modal
 *
 * Handles recording Stock Material & Supplier Disbursements (#modalRecordGrnPayment).
 * Supports Cash / Petty Cash, Corporate Card, Company Cheque, and Bank Transfer.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class RecordGrnPaymentModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getGrnRecords
   * @param {Function} context.getGrnPayments
   * @param {Function} context.saveGrnPayments
   * @param {Function} context.render
   * @param {Function} [context.openReceiptModal]
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
    this.selectedMethod = "Cash";

    this.bindEvents();
  }

  bindEvents() {
    // Open triggers
    document.addEventListener("click", (e) => {
      const openBtn = e.target.closest("#btnOpenRecordGrnPayment, [data-action='record-grn']");
      if (openBtn) {
        e.preventDefault();
        const prefillId = openBtn.getAttribute("data-grn-id") || null;
        this.openRecordGrnPaymentModal(prefillId);
        return;
      }

      // Method selector inside modal
      const methodChoice = e.target.closest("#grnModalMethodSelector .method-choice");
      if (methodChoice) {
        e.preventDefault();
        document.querySelectorAll("#grnModalMethodSelector .method-choice").forEach(c => c.classList.remove("selected"));
        methodChoice.classList.add("selected");
        this.selectedMethod = methodChoice.getAttribute("data-method") || "Cash";
        this.updateMethodFields();
      }
    });

    // Reference Select Change
    const grnSelect = document.getElementById("grnModalRefSelect");
    if (grnSelect) {
      grnSelect.addEventListener("change", () => this.onGrnSelected());
    }

    // Amount Input
    const amountInput = document.getElementById("grnModalAmount");
    if (amountInput) {
      amountInput.addEventListener("input", () => this.onAmountChanged());
    }

    // Confirm Save
    const confirmBtn = document.getElementById("btnConfirmSaveGrnPayment");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => this.save());
    }
  }

  openRecordGrnPaymentModal(prefillGrnId = null) {
    const modal = document.getElementById("modalRecordGrnPayment");
    if (!modal) return;

    this.selectedMethod = "Cash";
    document.querySelectorAll("#grnModalMethodSelector .method-choice").forEach(c => {
      c.classList.toggle("selected", c.getAttribute("data-method") === "Cash");
    });
    this.updateMethodFields();

    this.updateReferenceDropdown(prefillGrnId);

    const dateInput = document.getElementById("grnModalDate");
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];

    const noteInput = document.getElementById("grnModalNotes");
    if (noteInput) noteInput.value = "";

    this.openModal("modalRecordGrnPayment");
  }

  updateReferenceDropdown(prefillId = null) {
    const select = document.getElementById("grnModalRefSelect");
    if (!select) return;

    const grnRecords = this.ctx.getGrnRecords ? this.ctx.getGrnRecords() : [];
    const grnPayments = this.ctx.getGrnPayments ? this.ctx.getGrnPayments() : [];

    let options = `<option value="">-- Choose Supplier GRN / Consignment --</option>`;

    grnRecords.forEach(g => {
      const bal = Number(g.balance) || 0;
      const total = Number(g.total) || 0;
      const paid = Number(g.paid) || 0;
      options += `<option value="${g.grnNumber}" data-total="${total}" data-paid="${paid}" data-balance="${bal}" data-party="${g.supplierName}" data-category="${g.category || ''}" ${prefillId === g.grnNumber ? "selected" : ""}>
        ${g.grnNumber} - ${g.supplierName} (${g.category || 'Stock'}) [Bal: Rs. ${bal.toLocaleString()}]
      </option>`;
    });

    grnPayments.forEach(p => {
      if (!grnRecords.some(g => g.grnNumber === p.grnNumber)) {
        options += `<option value="${p.grnNumber}" data-total="${p.totalBill}" data-paid="${p.amount}" data-balance="${p.balance}" data-party="${p.supplierName}" data-category="${p.stockCategory || ''}" ${prefillId === p.grnNumber ? "selected" : ""}>
          ${p.grnNumber} - ${p.supplierName} (${p.stockCategory || 'Supplies'}) [Bal: Rs. ${(Number(p.balance) || 0).toLocaleString()}]
        </option>`;
      }
    });

    select.innerHTML = options;
    this.onGrnSelected();
  }

  onGrnSelected() {
    const select = document.getElementById("grnModalRefSelect");
    const selectedOpt = select ? select.options[select.selectedIndex] : null;

    const elTotal = document.getElementById("grnModalBalTotal");
    const elPaid = document.getElementById("grnModalBalPaid");
    const elBal = document.getElementById("grnModalBalRemaining");
    const amountInput = document.getElementById("grnModalAmount");

    if (selectedOpt && selectedOpt.value) {
      const total = Number(selectedOpt.getAttribute("data-total")) || 0;
      const paid = Number(selectedOpt.getAttribute("data-paid")) || 0;
      const balance = Number(selectedOpt.getAttribute("data-balance")) || 0;

      if (elTotal) elTotal.textContent = `Rs. ${total.toLocaleString()}`;
      if (elPaid) elPaid.textContent = `Rs. ${paid.toLocaleString()}`;
      if (elBal) elBal.textContent = `Rs. ${balance.toLocaleString()}`;

      if (amountInput) {
        amountInput.value = balance > 0 ? balance : total;
      }
    } else {
      if (elTotal) elTotal.textContent = "Rs. 0";
      if (elPaid) elPaid.textContent = "Rs. 0";
      if (elBal) elBal.textContent = "Rs. 0";
      if (amountInput) amountInput.value = "";
    }

    this.onAmountChanged();
  }

  onAmountChanged() {
    const select = document.getElementById("grnModalRefSelect");
    const selectedOpt = select ? select.options[select.selectedIndex] : null;
    const amountInput = document.getElementById("grnModalAmount");
    const stageSelect = document.getElementById("grnModalStageSelect");

    const amount = Number(amountInput ? amountInput.value : 0) || 0;
    const balance = selectedOpt ? (Number(selectedOpt.getAttribute("data-balance")) || 0) : 0;

    if (stageSelect) {
      if (amount <= 0) {
        stageSelect.value = "Pending Payment";
      } else if (amount >= balance && balance > 0) {
        stageSelect.value = "Complete Payment";
      } else {
        stageSelect.value = "Advance Payment";
      }
    }
  }

  updateMethodFields() {
    const container = document.getElementById("grnModalMethodFields");
    if (!container) return;

    if (this.selectedMethod === "Card") {
      container.innerHTML = `
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Company Credit/Debit Card</label>
            <input type="text" id="grnCardType" class="pay-input" placeholder="Commercial Bank VISA Corporate">
          </div>
          <div class="pay-field">
            <label class="pay-label">Card Last 4 Digits</label>
            <input type="text" id="grnCardLast4" class="pay-input" placeholder="E.g. 8832" maxlength="4">
          </div>
        </div>
        <div class="pay-field" style="margin-top: 10px;">
          <label class="pay-label">Approval Code / Terminal Ref</label>
          <input type="text" id="grnCardAuth" class="pay-input" placeholder="Authorization code">
        </div>`;
    } else if (this.selectedMethod === "Check") {
      container.innerHTML = `
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Cheque Number *</label>
            <input type="text" id="grnCheckNo" class="pay-input" placeholder="E.g. 992011" required>
          </div>
          <div class="pay-field">
            <label class="pay-label">Issuing Bank & Account</label>
            <input type="text" id="grnCheckBank" class="pay-input" placeholder="BOC A/C 772189 / Commercial">
          </div>
        </div>
        <div class="pay-form-grid" style="margin-top: 10px;">
          <div class="pay-field">
            <label class="pay-label">Cheque Date</label>
            <input type="date" id="grnCheckDate" class="pay-input" value="${new Date().toISOString().split("T")[0]}">
          </div>
          <div class="pay-field">
            <label class="pay-label">Cheque Type</label>
            <select id="grnCheckType" class="pay-select-field">
              <option value="Account Payee Crossed">Account Payee Crossed</option>
              <option value="Cash Cheque">Cash Cheque</option>
            </select>
          </div>
        </div>`;
    } else if (this.selectedMethod === "Bank Transfer") {
      container.innerHTML = `
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Supplier Bank Name</label>
            <input type="text" id="grnTransferBank" class="pay-input" placeholder="Sampath / HNB / Commercial">
          </div>
          <div class="pay-field">
            <label class="pay-label">Corporate Online Ref *</label>
            <input type="text" id="grnTransferRef" class="pay-input" placeholder="FT Reference #">
          </div>
        </div>`;
    } else {
      container.innerHTML = `
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Petty Cash Voucher #</label>
            <input type="text" id="grnCashReceipt" class="pay-input" value="PETTY-${Math.floor(100 + Math.random() * 900)}">
          </div>
          <div class="pay-field">
            <label class="pay-label">Disbursed From</label>
            <input type="text" class="pay-input" value="Main Shop Petty Cash" readonly style="opacity: 0.85;">
          </div>
        </div>`;
    }
  }

  save() {
    const select = document.getElementById("grnModalRefSelect");
    const selectedOpt = select ? select.options[select.selectedIndex] : null;
    if (!selectedOpt || !selectedOpt.value) {
      alert("Please select a Supplier GRN / Consignment to disburse payment.");
      return;
    }

    const refId = selectedOpt.value;
    const partyName = selectedOpt.getAttribute("data-party") || "Supplier";
    const category = selectedOpt.getAttribute("data-category") || "Raw Materials";
    const totalBill = Number(selectedOpt.getAttribute("data-total")) || 0;
    const oldBalance = Number(selectedOpt.getAttribute("data-balance")) || 0;

    const amountInput = document.getElementById("grnModalAmount");
    const amount = parseFloat(amountInput ? amountInput.value : 0);

    if (isNaN(amount) || amount < 0) {
      alert("Please enter a valid disbursement amount.");
      return;
    }

    const stage = document.getElementById("grnModalStageSelect")?.value || "Advance Payment";
    const payDate = document.getElementById("grnModalDate")?.value || new Date().toISOString().split("T")[0];
    const notes = document.getElementById("grnModalNotes")?.value.trim() || "";

    let methodRef = "";
    if (this.selectedMethod === "Card") {
      const last4 = document.getElementById("grnCardLast4")?.value || "";
      const auth = document.getElementById("grnCardAuth")?.value || "";
      methodRef = `Corp Card ****${last4} (${auth})`;
    } else if (this.selectedMethod === "Check") {
      const chq = document.getElementById("grnCheckNo")?.value || "";
      const bnk = document.getElementById("grnCheckBank")?.value || "";
      methodRef = `Cheque #${chq} - ${bnk}`;
    } else if (this.selectedMethod === "Bank Transfer") {
      const ref = document.getElementById("grnTransferRef")?.value || "";
      const bnk = document.getElementById("grnTransferBank")?.value || "";
      methodRef = `FT: ${bnk} ${ref}`;
    } else {
      const rec = document.getElementById("grnCashReceipt")?.value || "";
      methodRef = `Petty Cash Voucher #${rec}`;
    }

    const newBalance = Math.max(0, oldBalance - amount);
    const paymentId = `PAY-GRN-${Date.now().toString().slice(-6)}`;

    const newPayment = {
      paymentId,
      grnId: refId,
      grnNumber: refId,
      poNumber: `PO-${refId}`,
      supplierName: partyName,
      stockCategory: category,
      date: payDate,
      totalBill,
      amount,
      balance: newBalance,
      stage,
      method: this.selectedMethod,
      ref: methodRef,
      note: notes || "Procurement disbursement"
    };

    const grnPayments = this.ctx.getGrnPayments ? this.ctx.getGrnPayments() : [];
    grnPayments.unshift(newPayment);
    if (this.ctx.saveGrnPayments) this.ctx.saveGrnPayments();

    this.closeModal("modalRecordGrnPayment");
    if (this.ctx.render) this.ctx.render();

    this.showToast(`GRN payment of Rs. ${amount.toLocaleString()} disbursed to ${partyName}!`);

    if (this.ctx.openReceiptModal) {
      this.ctx.openReceiptModal(paymentId, "grn");
    }
  }
}
